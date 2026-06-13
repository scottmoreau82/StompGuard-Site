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

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SG-${ts}-${rand}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
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
        // Cache key
        const cacheKey = 'sg_reviews_v1';
        const cached = await env.SG_CACHE.get(cacheKey);
        if (cached) {
          return new Response(cached, {
            headers: { 'Content-Type': 'application/json', ...CORS }
          });
        }

        const reviews = [];

        // ── Reverb shop feedback (no key required) ──
        try {
          const reverbRes = await fetch(
            'https://api.reverb.com/api/shop/stompguard/feedback?per_page=20',
            { headers: { 'Accept': 'application/hal+json', 'Accept-Version': '3.0' } }
          );
          if (reverbRes.ok) {
            const reverbData = await reverbRes.json();
            const entries = reverbData.feedback || reverbData._embedded?.feedback || [];
            for (const f of entries) {
              if (!f.review || f.review.trim().length < 10) continue;
              reviews.push({
                source: 'reverb',
                rating: 5, // Reverb only shows positive feedback
                text: f.review,
                author: f.buyer_name ? f.buyer_name.split(' ')[0] + ' ' + (f.buyer_name.split(' ')[1]?.[0] || '') + '.' : 'Verified Buyer',
                product: f.listing_title || 'StompGuard',
                date: f.created_at ? f.created_at.split('T')[0] : '',
                photos: [],
                url: 'https://reverb.com/shop/stompguard'
              });
            }
          }
        } catch(e) { /* Reverb unavailable */ }

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
        const result = JSON.stringify({ reviews: reviews.slice(0, 30), count: reviews.length });

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
