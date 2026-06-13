import crypto from 'crypto';

// Minimal hashlib wrapper
const hashlib = {{
  sha256: (s) => crypto.createHash('sha256').update(s).digest('hex')
}};

// StompGuard Cloudflare Worker
// Bindings required in wrangler.toml:
//   STRIPE_SECRET_KEY      (secret)
//   STRIPE_WEBHOOK_SECRET  (secret)
//   DB                     (D1 database binding -> stompguard-orders)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function fixMojibake(s) {
  if (!s) return s;
  // Common UTF-8-misread-as-Latin1 sequences
  const map = {
    'â€™': '\u2019', 'â€˜': '\u2018', 'â€œ': '\u201C', 'â€\u009d': '\u201D',
    'â€"': '\u2014', 'â€"': '\u2013', 'â€¦': '\u2026',
    'Ã©': '\u00e9', 'Ã¨': '\u00e8', 'Ã ': '\u00e0', 'Ã¼': '\u00fc', 'Ã±': '\u00f1'
  };
  let out = s;
  for (const [bad, good] of Object.entries(map)) {
    out = out.split(bad).join(good);
  }
  // Strip leftover emoji-mojibake (ðŸ... sequences) and other stray control bytes
  out = out.replace(/ð[\u0080-\u00ff]{2,3}/g, '').replace(/[\u0080-\u009f]/g, '');
  return out.trim();
}

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SG-${ts}-${rand}`;
}


// ═════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD ROUTES
// ═════════════════════════════════════════════════════════════════

// Initialize admin users table on first deploy
async function initAdminUsersTable(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Seed with initial user if it doesn't exist
    const existing = await db.prepare('SELECT COUNT(*) as count FROM admin_users').first();
    if (existing.count === 0) {
      await db.prepare(`
        INSERT INTO admin_users (username, password_hash) 
        VALUES (?, ?)
      `).bind('smoreau', 'd874a8f5f102248e321210704619fd4b388fc6da833b7df00e42fd050b15f9d6').run();
    }
  } catch(e) {
    // Table might already exist, that's fine
  }
}

// Auth helpers
async function verifyToken(token, env) {
  if (!token) return null;
  const data = await env.SG_SESSIONS.get(token);
  if (!data) return null;
  const session = JSON.parse(data);
  if (Date.now() > session.expires) {
    await env.SG_SESSIONS.delete(token);
    return null;
  }
  return session;
}

async function createToken(username, env) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 1 day
  await env.SG_SESSIONS.put(token, JSON.stringify({ username, expires }) , { expirationTtl: 86400 });
  return token;
}

// POST /admin/login
async function handleAdminLogin(request, env) {
  const { username, password } = await request.json();
  
  try {
    await initAdminUsersTable(env.DB);
    const user = await env.DB.prepare(
      'SELECT password_hash FROM admin_users WHERE username = ? LIMIT 1'
    ).bind(username).first();
    
    if (!user) return jsonResponse({ error: 'Invalid credentials' }, 401);
    
    const passwordHash = hashlib.sha256(password).hexdigest();
    if (user.password_hash !== passwordHash) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }
    
    const token = await createToken(username, env);
    return jsonResponse({ token, username });
  } catch(err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// GET /admin/orders
async function handleAdminOrders(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const filterDate = url.searchParams.get('date');
  const filterEmail = url.searchParams.get('email');
  const filterStatus = url.searchParams.get('status');
  
  const session = await verifyToken(token, env);
  if (!session) return jsonResponse({ error: 'Unauthorized' }, 401);
  
  try {
    let query = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];
    
    if (filterDate) {
      conditions.push('DATE(created_at) = ?');
      params.push(filterDate);
    }
    if (filterEmail) {
      conditions.push('customer_email LIKE ?');
      params.push('%' + filterEmail + '%');
    }
    if (filterStatus) {
      conditions.push('status = ?');
      params.push(filterStatus);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC LIMIT 500';
    
    let stmt = env.DB.prepare(query);
    for (const p of params) stmt = stmt.bind(p);
    const orders = await stmt.all();
    
    return jsonResponse({ orders: orders.results || [] });
  } catch(err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// GET /admin/products
async function handleAdminProducts(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  const session = await verifyToken(token, env);
  if (!session) return jsonResponse({ error: 'Unauthorized' }, 401);
  
  try {
    // Read products from index.html
    const indexRes = await fetch('https://stompguard-site.pages.dev/');
    const html = await indexRes.text();
    
    // Parse PRODUCTS array from script (naive but works for structured data)
    const match = html.match(/const PRODUCTS = (\[.*?\]);/s);
    if (!match) return jsonResponse({ products: [] });
    
    const productsJson = match[1];
    const products = eval(productsJson); // Safe here since it's from our own file
    
    return jsonResponse({ products });
  } catch(err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// GET /admin/export/orders
async function handleAdminExport(request, env) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'csv';
  const token = url.searchParams.get('token');
  const filterDate = url.searchParams.get('date');
  const filterEmail = url.searchParams.get('email');
  const filterStatus = url.searchParams.get('status');
  
  const session = await verifyToken(token, env);
  if (!session) return jsonResponse({ error: 'Unauthorized' }, 401);
  
  try {
    let query = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];
    
    if (filterDate) {
      conditions.push('DATE(created_at) = ?');
      params.push(filterDate);
    }
    if (filterEmail) {
      conditions.push('customer_email LIKE ?');
      params.push('%' + filterEmail + '%');
    }
    if (filterStatus) {
      conditions.push('status = ?');
      params.push(filterStatus);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';
    
    let stmt = env.DB.prepare(query);
    for (const p of params) stmt = stmt.bind(p);
    const result = await stmt.all();
    const orders = result.results || [];
    
    if (format === 'csv') {
      const headers = ['Order #', 'Date', 'Customer', 'Email', 'Amount', 'Status', 'Stripe ID'];
      const rows = orders.map(o => [
        o.order_number,
        new Date(o.created_at).toISOString().split('T')[0],
        o.customer_name,
        o.customer_email,
        '$' + (o.amount / 100).toFixed(2),
        o.status,
        o.stripe_session_id
      ]);
      
      const csv = [headers, ...rows]
        .map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
        .join('\n');
      
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="orders.csv"'
        }
      });
    }
    
    return jsonResponse({ error: 'Unsupported format' }, 400);
  } catch(err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// Route dispatcher
function isAdminRoute(pathname) {
  return pathname.startsWith('/admin/');
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // ── ADMIN ROUTES ──
    if (url.pathname === '/admin/login' && request.method === 'POST') {
      return handleAdminLogin(request, env);
    }
    if (url.pathname === '/admin/orders' && request.method === 'GET') {
      return handleAdminOrders(request, env);
    }
    if (url.pathname === '/admin/products' && request.method === 'GET') {
      return handleAdminProducts(request, env);
    }
    if (url.pathname.startsWith('/admin/export/') && request.method === 'GET') {
      return handleAdminExport(request, env);
    }
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return new Response(null, { status: 301, headers: { 'Location': '/admin.html' } });
    }

    // ── POST /checkout ──
    if (url.pathname === '/checkout' && request.method === 'POST') {
      try {
        const { items, customer_email } = await request.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
          return new Response(JSON.stringify({ error: 'No items provided' }), {
            status: 400, headers: { 'Content-Type': 'application/json', ...CORS }
          });
        }

        const stripeBody = new URLSearchParams();
        stripeBody.append('mode', 'payment');
        stripeBody.append('success_url', 'https://stompguard.com/success?session_id={CHECKOUT_SESSION_ID}');
        stripeBody.append('cancel_url', 'https://stompguard.com');
        stripeBody.append('payment_intent_data[metadata][source]', 'stompguard_website');
        if (customer_email) stripeBody.append('customer_email', customer_email);
        stripeBody.append('shipping_address_collection[allowed_countries][]', 'US');
        stripeBody.append('phone_number_collection[enabled]', 'true');
        stripeBody.append('billing_address_collection', 'auto');

        items.forEach((item, i) => {
          stripeBody.append(`line_items[${i}][price]`, item.price);
          stripeBody.append(`line_items[${i}][quantity]`, String(item.quantity));
        });

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: stripeBody.toString(),
        });

        const session = await stripeRes.json();

        if (!session.url) {
          console.error('Stripe error:', JSON.stringify(session));
          return new Response(JSON.stringify({ error: 'Stripe session creation failed' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
          });
        }

        // Write pending order to D1
        const orderNumber = generateOrderNumber();
        const totalAmount = items.reduce((sum, item) => sum + (item.unit_amount || 0) * item.quantity, 0);

        await env.DB.prepare(`
          INSERT INTO orders (order_number, stripe_session_id, customer_email, status, total_amount, items, created_at, updated_at)
          VALUES (?, ?, ?, 'pending', ?, ?, datetime('now'), datetime('now'))
        `).bind(
          orderNumber,
          session.id,
          customer_email || '',
          totalAmount,
          JSON.stringify(items)
        ).run();

        return new Response(JSON.stringify({ url: session.url, order_number: orderNumber }), {
          headers: { 'Content-Type': 'application/json', ...CORS }
        });

      } catch (err) {
        console.error('Checkout error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
    }

    // ── POST /webhook ──
    if (url.pathname === '/webhook' && request.method === 'POST') {
      try {
        const body = await request.text();
        const sig = request.headers.get('stripe-signature');

        const verified = await verifyStripeWebhook(body, sig, env.STRIPE_WEBHOOK_SECRET);
        if (!verified) {
          return new Response('Invalid signature', { status: 400 });
        }

        const event = JSON.parse(body);

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const email = session.customer_details?.email || '';
          const name = session.customer_details?.name || '';
          const shipping = session.shipping_details ? JSON.stringify(session.shipping_details) : null;
          const paymentIntent = session.payment_intent || '';

          await env.DB.prepare(`
            UPDATE orders
            SET status = 'paid',
                customer_email = CASE WHEN customer_email = '' THEN ? ELSE customer_email END,
                customer_name = ?,
                stripe_payment_intent = ?,
                shipping_address = ?,
                updated_at = datetime('now')
            WHERE stripe_session_id = ?
          `).bind(email, name, paymentIntent, shipping, session.id).run();
        }

        if (event.type === 'payment_intent.payment_failed') {
          const pi = event.data.object;
          await env.DB.prepare(`
            UPDATE orders SET status = 'failed', updated_at = datetime('now')
            WHERE stripe_payment_intent = ?
          `).bind(pi.id).run();
        }

        return new Response('OK', { status: 200 });

      } catch (err) {
        console.error('Webhook error:', err);
        return new Response('Webhook error', { status: 500 });
      }
    }

    // ── GET /orders ──
    if (url.pathname === '/orders' && request.method === 'GET') {
      try {
        const email = url.searchParams.get('email')?.toLowerCase().trim();

        if (!email || !email.includes('@')) {
          return new Response(JSON.stringify({ error: 'Valid email required' }), {
            status: 400, headers: { 'Content-Type': 'application/json', ...CORS }
          });
        }

        const { results } = await env.DB.prepare(`
          SELECT order_number, status, total_amount, currency, items, created_at, shipping_address, customer_name
          FROM orders
          WHERE LOWER(customer_email) = ?
          ORDER BY created_at DESC
          LIMIT 20
        `).bind(email).all();

        const orders = results.map(row => ({
          ...row,
          items: JSON.parse(row.items || '[]'),
          shipping_address: row.shipping_address ? JSON.parse(row.shipping_address) : null,
        }));

        return new Response(JSON.stringify({ orders }), {
          headers: { 'Content-Type': 'application/json', ...CORS }
        });

      } catch (err) {
        console.error('Orders lookup error:', err);
        return new Response(JSON.stringify({ error: 'Lookup failed' }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
    }

    // ── GET /reviews ──
    if (url.pathname === '/reviews' && request.method === 'GET') {
      try {
        // Cache key — bumped to v2 after adding REVERB_TOKEN
        const cacheKey = 'sg_reviews_v2';
        const noCache = url.searchParams.get('nocache') === '1';
        if (!noCache) {
          const cached = await env.SG_CACHE.get(cacheKey);
          if (cached) {
            return new Response(cached, {
              headers: { 'Content-Type': 'application/json', ...CORS }
            });
          }
        }

        const reviews = [];

        // ── Reverb received feedback (requires personal token, read_feedback scope) ──
        const REVERB_TOKEN = env.REVERB_TOKEN || '';
        const debug = url.searchParams.get('debug') === '1';
        let debugInfo = {};
        if (REVERB_TOKEN) {
          try {
            const reverbRes = await fetch(
              'https://api.reverb.com/api/my/feedback/received?per_page=30',
              { headers: {
                  'Accept': 'application/hal+json',
                  'Content-Type': 'application/hal+json',
                  'Accept-Version': '3.0',
                  'Authorization': `Bearer ${REVERB_TOKEN}`
              } }
            );
            if (debug) {
              const txt = await reverbRes.clone().text();
              debugInfo.reverb_status = reverbRes.status;
              debugInfo.reverb_body = txt.slice(0, 1500);
              debugInfo.token_present = true;
              debugInfo.token_len = REVERB_TOKEN.length;
            }
            if (reverbRes.ok) {
              const reverbData = await reverbRes.json();
              const entries = reverbData.feedbacks || reverbData.feedback || [];
              for (const f of entries) {
                // Only seller feedback (reviews about this shop), with actual text
                if (f.type && f.type !== 'seller') continue;
                const msg = fixMojibake((f.message || '').trim());
                if (msg.length < 5) continue;
                const rawName = f.author_name || '';
                // author_name already comes as "Greg K." format from Reverb
                const author = rawName || 'Verified Buyer';
                const rawDate = f.created_at || '';
                const listingUrl = (f._links && f._links.listing && f._links.listing.href) || 'https://reverb.com/shop/stompguard';
                reviews.push({
                  source: 'reverb',
                  rating: f.rating || 5,
                  text: msg,
                  author: author,
                  product: f.order_title || 'StompGuard',
                  date: rawDate ? String(rawDate).split('T')[0] : '',
                  photos: [],
                  url: listingUrl
                });
              }
            }
          } catch(e) { if(debug) debugInfo.reverb_error = String(e); }
        } else { if(debug) debugInfo.token_present = false; }

        // ── Etsy listing reviews ──
        const ETSY_KEY = env.ETSY_API_KEY || '';
        if (ETSY_KEY && ETSY_KEY !== 'PENDING') {
          const listingIds = [4445139310, 4436903537, 4308214657, 4308255862, 4308221211];
          for (const lid of listingIds) {
            try {
              const etsyRes = await fetch(
                `https://openapi.etsy.com/v3/application/listings/\${lid}/reviews?limit=10`,
                { headers: { 'x-api-key': ETSY_KEY } }
              );
              if (!etsyRes.ok) continue;
              const etsyData = await etsyRes.json();
              for (const r of (etsyData.results || [])) {
                if (!r.review || r.review.trim().length < 10) continue;
                // Fetch listing title
                let product = 'StompGuard';
                try {
                  const lRes = await fetch(
                    `https://openapi.etsy.com/v3/application/listings/\${lid}`,
                    { headers: { 'x-api-key': ETSY_KEY } }
                  );
                  if (lRes.ok) { const l = await lRes.json(); product = l.title || product; }
                } catch(e) {}
                // Fetch review images if any
                const photos = [];
                try {
                  const imgRes = await fetch(
                    `https://openapi.etsy.com/v3/application/transactions/\${r.transaction_id}/images`,
                    { headers: { 'x-api-key': ETSY_KEY } }
                  );
                  if (imgRes.ok) {
                    const imgData = await imgRes.json();
                    for (const img of (imgData.results || []).slice(0,3)) {
                      if (img.url_170x135) photos.push(img.url_170x135);
                    }
                  }
                } catch(e) {}
                reviews.push({
                  source: 'etsy',
                  rating: r.rating || 5,
                  text: r.review,
                  author: r.reviewer_name ? r.reviewer_name.split(' ')[0] + ' ' + (r.reviewer_name.split(' ')[1]?.[0] || '') + '.' : 'Verified Buyer',
                  product: product,
                  date: r.created_timestamp ? new Date(r.created_timestamp*1000).toISOString().split('T')[0] : '',
                  photos,
                  url: `https://www.etsy.com/listing/\${lid}`
                });
              }
            } catch(e) { /* listing unavailable */ }
          }
        }

        // Shuffle and limit to 30
        reviews.sort(() => Math.random() - 0.5);
        const result = JSON.stringify({ reviews: reviews.slice(0, 30), count: reviews.length, ...(debug ? { debug: debugInfo } : {}) });

        // Cache for 1 hour
        await env.SG_CACHE.put(cacheKey, result, { expirationTtl: 3600 });

        return new Response(result, {
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      } catch(err) {
        return new Response(JSON.stringify({ reviews: [], error: err.message }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};

async function verifyStripeWebhook(payload, sigHeader, secret) {
  try {
    if (!sigHeader || !secret) return false;
    const parts = sigHeader.split(',');
    const tPart = parts.find(p => p.startsWith('t='));
    const v1Part = parts.find(p => p.startsWith('v1='));
    if (!tPart || !v1Part) return false;
    const timestamp = tPart.split('=')[1];
    const signature = v1Part.split('=')[1];
    const signed = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
    const computed = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computed === signature;
  } catch { return false; }
}
