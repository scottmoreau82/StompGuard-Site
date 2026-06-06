import { ThemeSettings } from "./types";

export function getLiquidCode(sectionKey: keyof ThemeSettings | "all", settings: ThemeSettings): string {
  switch (sectionKey) {
    case "header":
      return `{% comment %}
  StompGuard - Reusable Theme Header Section (header.liquid)
  Shopify Online Store 2.0 Specification
{% endcomment %}

<nav class="nav-header" id="header-{{ section.id }}">
  <a href="{{ routes.root_url }}" class="nav-logo">
    <div class="nav-badge">{{ section.settings.badge_initials }}</div>
    <div class="nav-wordmark">
      {{ section.settings.logo_text }}
      <span>{{ section.settings.sub_text }}</span>
    </div>
  </a>
  <ul class="nav-links">
    {% for link in linklists[section.settings.menu].links %}
      <li>
        <a href="{{ link.url }}">{{ link.title }}</a>
      </li>
    {% endfor %}
  </ul>
  <a href="{{ routes.cart_url }}" class="nav-cta">
    {{ section.settings.cta_text }} ({{ cart.item_count }})
  </a>
</nav>

<style>
  #header-{{ section.id }} {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 200;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    background: rgba(8,8,8,0.95);
    border-bottom: 1px solid rgba(200,200,200,0.08);
    backdrop-filter: blur(8px);
  }
  #header-{{ section.id }}::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--chrome), var(--red), var(--chrome), transparent);
  }
</style>

{% schema %}
{
  "name": "Tactical Header",
  "settings": [
    {
      "type": "text",
      "id": "logo_text",
      "label": "Logo Text",
      "default": "${settings.header.logoText}"
    },
    {
      "type": "text",
      "id": "sub_text",
      "label": "Sub-Logo Label",
      "default": "${settings.header.subText}"
    },
    {
      "type": "text",
      "id": "badge_initials",
      "label": "Hex Badge Initials",
      "default": "${settings.header.badgeInitials}"
    },
    {
      "type": "link_list",
      "id": "menu",
      "label": "Navigation Menu",
      "default": "main-menu"
    },
    {
      "type": "text",
      "id": "cta_text",
      "label": "Cart/CTA label",
      "default": "${settings.header.ctaText}"
    }
  ]
}
{% endschema %}`;

    case "hero":
      return `{% comment %}
  StompGuard - Reusable Hero Banner Section (hero.liquid)
  Shopify Online Store 2.0 Specification
{% endcomment %}

<section class="hero-section" id="hero-{{ section.id }}">
  <div class="hero-left">
    {% if section.settings.bg_image != blank %}
      <img src="{{ section.settings.bg_image | image_url: width: 1200 }}" alt="{{ section.settings.bg_image.alt }}" class="hero-left-img"/>
    {% else %}
      <img src="${settings.hero.bgImage}" alt="Fallback stage" class="hero-left-img"/>
    {% endif %}
    <div class="hero-left-overlay"></div>
    <div class="hero-left-content">
      <div class="hero-eyebrow">{{ section.settings.eyebrow }}</div>
      <h1 class="hero-title">
        <span class="line-chrome">{{ section.settings.line_chrome }}</span>
        <span class="line-solid">{{ section.settings.line_solid }}</span>
        <span class="line-red">{{ section.settings.line_red }}</span>
      </h1>
      <div class="hero-spec">
        <strong>{{ section.settings.spec_title }}</strong>
        {{ section.settings.spec_text }}
      </div>
      <div class="hero-ctas">
        <a href="{{ section.settings.deploy_url }}" class="btn-deploy">{{ section.settings.deploy_btn_text }}</a>
        <a href="{{ section.settings.catalog_url }}" class="btn-ghost">{{ section.settings.catalog_btn_text }}</a>
      </div>
    </div>
  </div>

  <div class="hero-right">
    {% assign featured_product = all_products[section.settings.featured_product] %}
    {% if featured_product != blank %}
      <div class="hero-product">
        <div class="hero-product-badge">Field Tested</div>
        <div class="hero-product-img">
          <img src="{{ featured_product.featured_image | image_url: width: 600 }}" alt="{{ featured_product.title }}"/>
        </div>
        <div class="hero-product-info">
          <div class="hero-product-label">Unit Designation</div>
          <div class="hero-product-name">{{ featured_product.title }}</div>
          <div class="hero-product-price"><span>MSRP</span>{{ featured_product.price | money }}</div>
        </div>
      </div>
    {% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Split Hero Banner",
  "settings": [
    {
      "type": "image_picker",
      "id": "bg_image",
      "label": "Background Image"
    },
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow Text",
      "default": "${settings.hero.eyebrow}"
    },
    {
      "type": "text",
      "id": "line_chrome",
      "label": "Title Line 1 (Chrome Outline)",
      "default": "${settings.hero.lineChrome}"
    },
    {
      "type": "text",
      "id": "line_solid",
      "label": "Title Line 2 (Solid White)",
      "default": "${settings.hero.lineSolid}"
    },
    {
      "type": "text",
      "id": "line_red",
      "label": "Title Line 3 (Solid Crimson Red)",
      "default": "${settings.hero.lineRed}"
    },
    {
      "type": "text",
      "id": "spec_title",
      "label": "Brief Title",
      "default": "${settings.hero.specTitle}"
    },
    {
      "type": "textarea",
      "id": "spec_text",
      "label": "Brief Description",
      "default": "${settings.hero.specText}"
    },
    {
      "type": "text",
      "id": "deploy_btn_text",
      "label": "Deploy Button Text",
      "default": "${settings.hero.deployButtonText}"
    },
    {
      "type": "url",
      "id": "deploy_url",
      "label": "Deploy Link"
    },
    {
      "type": "text",
      "id": "catalog_btn_text",
      "label": "Catalog Button Text",
      "default": "${settings.hero.catalogButtonText}"
    },
    {
      "type": "url",
      "id": "catalog_url",
      "label": "Catalog Link"
    },
    {
      "type": "product",
      "id": "featured_product",
      "label": "Right Side Featured Product"
    }
  ],
  "presets": [
    {
      "name": "Default Split Hero"
    }
  ]
}
{% endschema %}`;

    case "ticker":
      return `{% comment %}
  StompGuard - Status Marquee Ticker Section (ticker.liquid)
  Shopify Online Store 2.0 Specification
{% endcomment %}

<div class="status-bar" id="ticker-{{ section.id }}">
  <div class="status-ticker" style="animation-duration: {{ section.settings.speed }}s">
    {% for i in (1..2) %}
      {% for block in section.blocks %}
        <div class="status-item" {{ block.shopify_attributes }}>
          {{ block.settings.text }}
          <span class="status-sep">◆</span>
        </div>
      {% endfor %}
    {% endfor %}
  </div>
</div>

{% schema %}
{
  "name": "Status Ticker",
  "settings": [
    {
      "type": "range",
      "id": "speed",
      "min": 10,
      "max": 60,
      "step": 5,
      "unit": "s",
      "label": "Animation Speed",
      "default": ${settings.ticker.speedSeconds}
    }
  ],
  "blocks": [
    {
      "type": "ticker_item",
      "name": "Ticker Item",
      "settings": [
        {
          "type": "text",
          "id": "text",
          "label": "Announcement Text",
          "default": "Premium Construction"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Active Status Ticker",
      "blocks": [
        { "type": "ticker_item", "settings": { "text": "US Based Operations" } },
        { "type": "ticker_item", "settings": { "text": "Premium Custom Acrylic" } },
        { "type": "ticker_item", "settings": { "text": "Precision CNC Cut" } }
      ]
    }
  ]
}
{% endschema %}`;

    case "productGrid":
      return `{% comment %}
  StompGuard - Custom Product Grid Section (main-collection-grid.liquid)
  Shopify Online Store 2.0 Specification
{% endcomment %}

<section class="section products-section" id="grid-{{ section.id }}">
  <div class="products-header">
    <div>
      <div class="section-eyebrow">{{ section.settings.eyebrow }}</div>
      <h2 class="section-title">{{ section.settings.title | newline_to_br }}</h2>
    </div>
    {% if section.settings.view_all_link != blank %}
      <a href="{{ section.settings.view_all_link }}" class="view-all">{{ section.settings.view_all_text }}</a>
    {% endif %}
  </div>

  <div class="products-grid">
    {% assign collection = collections[section.settings.collection] %}
    {% for product in collection.products limit: section.settings.limit %}
      <div class="product-card" onclick="window.location.href='{{ product.url }}'">
        <div class="product-card-img">
          <img src="{{ product.featured_image | image_url: width: 500 }}" alt="{{ product.title }}"/>
          {% if product.tags contains 'new' %}
            <div class="product-card-badge">New Unit</div>
          {% elsif product.tags contains 'tested' %}
            <div class="product-card-badge">Field Tested</div>
          {% endif %}
        </div>
        <div class="product-card-body">
          <div class="product-card-unit">{{ product.variants.first.sku }}</div>
          <div class="product-card-name">{{ product.title }}</div>
          <div class="product-card-footer">
            <span class="product-card-price">{{ product.price | money }}</span>
            <form method="post" action="/cart/add">
              <input type="hidden" name="id" value="{{ product.variants.first.id }}" />
              <button type="submit" class="add-btn">Deploy</button>
            </form>
          </div>
        </div>
      </div>
    {% else %}
      {% comment %} Empty state placeholders {% endcomment %}
      <div class="text-center py-12 text-muted">Assign a collection with active products in section settings.</div>
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Tactical Product Grid",
  "settings": [
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow Label",
      "default": "${settings.productGrid.eyebrow}"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Heading Text",
      "default": "${settings.productGrid.title}"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Shopify Product Collection"
    },
    {
      "type": "range",
      "id": "limit",
      "min": 2,
      "max": 12,
      "step": 1,
      "label": "Max Products to Display",
      "default": 4
    },
    {
      "type": "text",
      "id": "view_all_text",
      "label": "View All Link Label",
      "default": "${settings.productGrid.viewAllText}"
    },
    {
      "type": "url",
      "id": "view_all_link",
      "label": "View All URL Link"
    }
  ],
  "presets": [
    {
      "name": "Standard Protective Gear Grid"
    }
  ]
}
{% endschema %}`;

    case "fieldReport":
      return `{% comment %}
  StompGuard - Field Report Features & Benefits Section (field-report.liquid)
  Shopify Online Store 2.0 Specification
{% endcomment %}

<section class="section field-report" id="report-{{ section.id }}">
  <div class="field-layout">
    <div>
      <div class="section-eyebrow">{{ section.settings.eyebrow }}</div>
      <h2 class="section-title">{{ section.settings.title | newline_to_br }}</h2>
      <p class="field-desc">{{ section.settings.description }}</p>
      
      <div class="field-specs">
        {% for block in section.blocks %}
          <div class="spec-card" {{ block.shopify_attributes }}>
            <span class="spec-icon">{{ block.settings.icon }}</span>
            <div class="spec-name">{{ block.settings.name }}</div>
            <div class="spec-desc">{{ block.settings.text }}</div>
          </div>
        {% endfor %}
      </div>
    </div>

    <div class="field-visual">
      <div class="field-img">
        {% if section.settings.visual_image != blank %}
          <img src="{{ section.settings.visual_image | image_url: width: 800 }}" alt="Field Spec Visual" />
        {% else %}
          <img src="${settings.fieldReport.imgUrl}" alt="Field Spec Visual placeholder" />
        {% endif %}
      </div>
      <div class="field-stamp">
        <div class="field-stamp-num">{{ section.settings.stamp_num }}</div>
        <div class="field-stamp-label">{{ section.settings.stamp_label }}</div>
      </div>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Field Report Features",
  "settings": [
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow Text",
      "default": "${settings.fieldReport.eyebrow}"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Heading Title",
      "default": "${settings.fieldReport.title}"
    },
    {
      "type": "textarea",
      "id": "description",
      "label": "Left description",
      "default": "${settings.fieldReport.description}"
    },
    {
      "type": "image_picker",
      "id": "visual_image",
      "label": "Visual Asset Block"
    },
    {
      "type": "text",
      "id": "stamp_num",
      "label": "Badge Counter",
      "default": "${settings.fieldReport.stampNum}"
    },
    {
      "type": "text",
      "id": "stamp_label",
      "label": "Badge Descriptor",
      "default": "${settings.fieldReport.stampLabel}"
    }
  ],
  "blocks": [
    {
      "type": "spec_block",
      "name": "Feature Bullet",
      "settings": [
        {
          "type": "text",
          "id": "icon",
          "label": "Feature Icon (emoji/unicode)",
          "default": "🔒"
        },
        {
          "type": "text",
          "id": "name",
          "label": "Feature Label Title",
          "default": "Precision Fit"
        },
        {
          "type": "textarea",
          "id": "text",
          "label": "Explanation Text",
          "default": "Custom styled to fit your exact audio gear limits."
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Standard Field Report Specs",
      "blocks": [
        { "type": "spec_block", "settings": { "icon": "🔒", "name": "Precision Fit", "text": "Cut to exact specs." } },
        { "type": "spec_block", "settings": { "icon": "⚡", "name": "Magnetic Force", "text": "Snap on action." } }
      ]
    }
  ]
}
{% endschema %}`;

    case "testimonials":
      return `{% comment %}
  StompGuard - Operator Intel Reports (testimonials.liquid)
  Shopify Online Store 2.0 Specification
{% endcomment %}

<section class="intel-section" id="testimonials-{{ section.id }}">
  <div class="intel-header">
    <div class="section-eyebrow">{{ section.settings.eyebrow }}</div>
    <h2 class="section-title">{{ section.settings.title }}</h2>
  </div>
  <div class="intel-grid">
    {%- for block in section.blocks -%}
      <div class="intel-card" {{ block.shopify_attributes }}>
        <div class="intel-stars">{{ block.settings.rating }}</div>
        <p class="intel-quote">{{ block.settings.quote }}</p>
        <div class="intel-source">
          <div class="intel-avatar">{{ block.settings.initials }}</div>
          <div>
            <div class="intel-name">{{ block.settings.author }}</div>
            <div class="intel-unit">{{ block.settings.unit }}</div>
          </div>
        </div>
      </div>
    {%- endfor -%}
  </div>
</section>

{% schema %}
{
  "name": "Operator Testimonials",
  "settings": [
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow Text",
      "default": "${settings.testimonials.eyebrow}"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Heading Title",
      "default": "${settings.testimonials.title}"
    }
  ],
  "blocks": [
    {
      "type": "testimonial",
      "name": "Operator Report Card",
      "settings": [
        {
          "type": "text",
          "id": "rating",
          "label": "Star Rating Symbols",
          "default": "★★★★★"
        },
        {
          "type": "text",
          "id": "quote",
          "label": "Quote Text",
          "default": "Unbelievable strength under heavy stage stomps."
        },
        {
          "type": "text",
          "id": "initials",
          "label": "Initials/Avatar Text",
          "default": "TX"
        },
        {
          "type": "text",
          "id": "author",
          "label": "Author Name",
          "default": "Thomas X."
        },
        {
          "type": "text",
          "id": "unit",
          "label": "Associated Unit/Gear Label",
          "default": "Neural DSP Nano Cover"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Default Testimonials Block"
    }
  ]
}
{% endschema %}`;

    case "ctaBanner":
      return `{% comment %}
  StompGuard - CTA Mission Banner Section (cta-banner.liquid)
  Shopify Online Store 2.0 Specification
{% endcomment %}

<section class="mission-banner" id="cta-{{ section.id }}">
  <div class="mission-text">
    <h2 class="mission-title">{{ section.settings.title | newline_to_br }}</h2>
    <p class="mission-sub">{{ section.settings.subtitle }}</p>
  </div>
  {% if section.settings.button_link != blank %}
    <a href="{{ section.settings.button_link }}" class="btn-mission">{{ section.settings.button_text }}</a>
  {% else %}
    <a href="#" class="btn-mission">{{ section.settings.button_text }}</a>
  {% endif %}
</section>

{% schema %}
{
  "name": "Mission Tactical CTA Banner",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "CTA Main Headline",
      "default": "${settings.ctaBanner.title}"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Sub-Headline Explainer",
      "default": "${settings.ctaBanner.subtitle}"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Action Button Label",
      "default": "${settings.ctaBanner.buttonText}"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Target Action URL Link"
    }
  ],
  "presets": [
    {
      "name": "Standard Tactical Banner"
    }
  ]
}
{% endschema %}`;

    case "footer":
      return `{% comment %}
  StompGuard - Footer Branding and Navigation Structure (footer.liquid)
  Shopify Online Store 2.0 Specification
{% endcomment %}

<footer>
  <div class="footer-top">
    <div class="footer-brand">
      <div class="nav-logo">
        <div class="nav-badge">SG</div>
        <div class="nav-wordmark">StompGuard<span>Pedal Protection Systems</span></div>
      </div>
      <p>{{ section.settings.brand_text }}</p>
    </div>
    
    <div>
      <div class="footer-col-title">{{ section.settings.col1_heading }}</div>
      <ul class="footer-links">
        {% for link in linklists[section.settings.col1_menu].links %}
          <li><a href="{{ link.url }}">{{ link.title }}</a></li>
        {% endfor %}
      </ul>
    </div>
    
    <div>
      <div class="footer-col-title">{{ section.settings.col2_heading }}</div>
      <ul class="footer-links">
        {% for link in linklists[section.settings.col2_menu].links %}
          <li><a href="{{ link.url }}">{{ link.title }}</a></li>
        {% endfor %}
      </ul>
    </div>

    <div>
      <div class="footer-col-title">{{ section.settings.col3_heading }}</div>
      <ul class="footer-links">
        {% for link in linklists[section.settings.col3_menu].links %}
          <li><a href="{{ link.url }}">{{ link.title }}</a></li>
        {% endfor %}
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>{{ section.settings.copyright_notice }}</span>
    <span class="footer-version">{{ section.settings.version_tag }}</span>
  </div>
</footer>

{% schema %}
{
  "name": "Tactical Footer",
  "settings": [
    {
      "type": "textarea",
      "id": "brand_text",
      "label": "Brand Explainer Label",
      "default": "${settings.footer.brandDescription}"
    },
    {
      "type": "text",
      "id": "col1_heading",
      "label": "Column 1 Header",
      "default": "${settings.footer.col1Title}"
    },
    {
      "type": "link_list",
      "id": "col1_menu",
      "label": "Column 1 Navigation List"
    },
    {
      "type": "text",
      "id": "col2_heading",
      "label": "Column 2 Header",
      "default": "${settings.footer.col2Title}"
    },
    {
      "type": "link_list",
      "id": "col2_menu",
      "label": "Column 2 Navigation List"
    },
    {
      "type": "text",
      "id": "col3_heading",
      "label": "Column 3 Header",
      "default": "${settings.footer.col3Title}"
    },
    {
      "type": "link_list",
      "id": "col3_menu",
      "label": "Column 3 Navigation List"
    },
    {
      "type": "text",
      "id": "copyright_notice",
      "label": "Copyright Legal Line",
      "default": "${settings.footer.copyrightText}"
    },
    {
      "type": "text",
      "id": "version_tag",
      "label": "Version Code Tag",
      "default": "${settings.footer.versionCode}"
    }
  ]
}
{% endschema %}`;

    default:
      return `Choose a section in the Theme Editor tabs on the left to inspect its modular Shopify Online Store 2.0 .liquid code!`;
  }
}
