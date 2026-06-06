import { useState } from "react";
import { ThemeSettings, ShopifyProduct, CartItem } from "../types";
import { 
  ShieldCheck, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ChevronRight, 
  AlertTriangle,
  Flame,
  Wrench,
  Check,
  X
} from "lucide-react";

interface StorefrontPreviewProps {
  settings: ThemeSettings;
  products: ShopifyProduct[];
  cart: CartItem[];
  onAddToCart: (product: ShopifyProduct) => void;
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  viewportMode: "desktop" | "tablet" | "mobile";
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export default function StorefrontPreview({
  settings,
  products,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  viewportMode,
  isCartOpen,
  setIsCartOpen
}: StorefrontPreviewProps) {
  // Parse Navigation Links
  let navLinks = [];
  try {
    navLinks = JSON.parse(settings.header.menuJson);
  } catch (e) {
    navLinks = [
      { title: "Home", url: "#" },
      { title: "Catalog", url: "#" }
    ];
  }

  // Find Featured Product
  const featuredProduct = products.find(p => p.id === settings.hero.featuredProductId) || products[0];

  // Get active product list based on settings collectionId
  const getCollectionProducts = () => {
    if (settings.productGrid.collectionId === "neural-dsp") {
      return products.filter(p => ["prod-1", "prod-2", "prod-3", "prod-4"].includes(p.id));
    } else if (settings.productGrid.collectionId === "others") {
      return products.filter(p => p.id === "prod-5");
    }
    // all or fallback
    return products;
  };

  const gridProducts = getCollectionProducts();

  // Parse Footer Links
  let col1Links = [];
  let col2Links = [];
  let col3Links = [];
  try { col1Links = JSON.parse(settings.footer.col1LinksJson); } catch (e) { col1Links = []; }
  try { col2Links = JSON.parse(settings.footer.col2LinksJson); } catch (e) { col2Links = []; }
  try { col3Links = JSON.parse(settings.footer.col3LinksJson); } catch (e) { col3Links = []; }

  // Cart helper Calculations
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Frame resizing simulation wrapper styles
  const getFrameWidthClass = () => {
    switch (viewportMode) {
      case "mobile":
        return "max-w-[420px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full";
    }
  };

  const [checkoutSimulated, setCheckoutSimulated] = useState(false);

  return (
    <div className="w-full flex justify-center bg-[#050505] p-2 sm:p-4 selection:bg-red-800 selection:text-white">
      <div className={`theme-preview-container scanline hex-grid ${getFrameWidthClass()} transition-all duration-300 shadow-2xl relative w-full border border-zinc-800`}>
        
        {/* ── TOP DECORATION HEADLINE / THEME STATUS ticker ── */}
        <div className="bg-[#0b0b0b] px-4 py-2 flex items-center justify-between border-b border-zinc-950 font-mono text-[9px] text-[#888888] tracking-widest uppercase z-10 relative">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-800 animate-ping rounded-full inline-block"></span>
            <span>SYSTEM ACTIVE // SECURE ACCESS PORT</span>
          </div>
          <div>{new Date().toISOString().split('T')[0]} // SG-ONLINE-STAGE</div>
        </div>

        {/* ── HEADER NAVIGATION ── */}
        <nav className="sticky top-0 z-40 h-[60px] flex items-center justify-between px-4 sm:px-10 bg-black/95 border-b border-zinc-800/60 backdrop-blur-md">
          {/* Top subtle visual horizontal line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C8C8C8] to-transparent"></div>

          <a href="#" className="flex items-center gap-3 decoration-transparent group">
            <div className="w-9 h-9 bg-zinc-900 border border-zinc-700 clip-hexagon flex items-center justify-center font-bebas text-md text-[#C8C8C8] tracking-widest group-hover:border-red-700 transition-colors">
              {settings.header.badgeInitials}
            </div>
            <div className="flex flex-col">
              <span className="font-bebas text-md sm:text-lg tracking-[0.15em] text-[#E8E8E8] uppercase group-hover:text-white transition-colors">
                {settings.header.logoText}
              </span>
              <span className="text-[7px] sm:text-[9px] font-mono tracking-[0.25em] text-[#888888] -mt-1 uppercase">
                {settings.header.subText}
              </span>
            </div>
          </a>

          {/* Nav links (hidden in mobile mode of previewer) */}
          <ul className={`hidden ${viewportMode === "mobile" ? "" : "md:flex"} items-center gap-6 lg:gap-8 list-none m-0`}>
            {navLinks.map((link: any, idx: number) => (
              <li key={idx}>
                <a 
                  href={link.url}
                  className="font-mono text-[10px] tracking-widest uppercase text-[#888888] hover:text-[#E8E8E8] transition-colors decoration-transparent flex items-center gap-1"
                >
                  <span className="text-[#8B0000] opacity-70">//</span>{link.title}
                </a>
              </li>
            ))}
          </ul>

          <button 
            id="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
            className="bg-[#8B0000] hover:bg-[#B00000] text-[#E8E8E8] hover:text-white font-mono text-[10px] tracking-wider uppercase px-4 py-2 border border-red-700 hover:border-red-600 clip-corner-sm transition-all focus:outline-none flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-3 h-3 text-[#C8C8C8]" />
            <span>{settings.header.ctaText} ({cartItemCount})</span>
          </button>
        </nav>

        {/* ── HERO BANNER ── */}
        <section className={`hero relative ${viewportMode === "mobile" ? "grid-cols-1" : "lg:grid-cols-2"} grid border-b border-zinc-900 overflow-hidden`}>
          {/* Skew divider */}
          {viewportMode !== "mobile" && (
            <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#888888] hover:via-red-700 to-transparent transform -skew-x-[4deg] z-10 pointer-events-none"></div>
          )}

          {/* Hero Left Content Column */}
          <div className="relative overflow-hidden bg-black p-6 sm:p-14 lg:p-16 flex flex-col justify-center min-h-[500px]">
            {/* Background Image with Luminosity blend */}
            <div className="absolute inset-0 z-0">
              <img 
                src={settings.hero.bgImage} 
                alt="Stage backdrop" 
                className="w-full h-full object-cover opacity-35 filter grayscale contrast-125 mix-blend-luminosity transform scale-105 hover:scale-100 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-red-950/15 via-transparent to-black" />
            </div>

            <div className="relative z-10 flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.35em] text-[#8B0000] uppercase mb-4 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-[#8B0000]"></span>
                <span>{settings.hero.eyebrow}</span>
                <span className="text-[6px] text-red-700">■</span>
              </div>

              <h1 className="font-bebas text-6xl sm:text-7xl lg:text-8xl leading-[0.9] text-white tracking-normal uppercase mb-6 drop-shadow-xl select-none">
                <span className="line-chrome block font-normal">{settings.hero.lineChrome}</span>
                <span className="block text-white tracking-[0.02em]">{settings.hero.lineSolid}</span>
                <span className="block text-[#8B0000] tracking-[0.03em]">{settings.hero.lineRed}</span>
              </h1>

              <div className="font-mono text-[11px] text-[#777777] leading-relaxed max-w-[360px] mb-8 border-l-2 border-zinc-800 pl-4">
                <strong className="text-[#888888] font-bold text-[12px] tracking-wider block mb-1">
                  {settings.hero.specTitle}
                </strong>
                {settings.hero.specText}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={() => onAddToCart(featuredProduct)}
                  className="bg-[#8B0000] hover:bg-[#B00000] text-[#E8E8E8] hover:text-white font-mono font-semibold text-[11px] tracking-widest uppercase px-6 py-3.5 border border-red-700 hover:border-red-500 clip-corner-md transition-all cursor-pointer focus:outline-none flex items-center gap-2"
                >
                  <span>{settings.hero.deployButtonText}</span>
                </button>
                <a 
                  href="#catalog" 
                  className="text-[#888888] hover:text-[#E8E8E8] font-mono text-[10px] tracking-widest uppercase py-3.5 border-b border-zinc-800 hover:border-[#888888] duration-200 transition-all flex items-center gap-2 decoration-transparent"
                >
                  <span>{settings.hero.catalogButtonText}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Hero Right Column — Dynamic Featured Product Box */}
          <div className="bg-[#111111] min-h-[350px] p-6 sm:p-14 lg:p-16 flex items-center justify-center relative">
            
            {/* Retro drafting guidelines reticle elements */}
            <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-zinc-700/30"></div>
            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-zinc-700/30"></div>

            <div className="w-full max-w-[340px] bg-[#1a1a1a] border border-zinc-800/80 hover:border-zinc-700 rounded-sm overflow-hidden clip-corner-md relative shadow-2xl group transition-all">
              
              <div className="absolute top-3 left-4 font-mono text-[8px] text-[#888888] tracking-widest opacity-60">
                {featuredProduct?.unitCode || "UNIT-001"}
              </div>

              {featuredProduct?.badge && (
                <div className="absolute top-0 right-5 bg-[#8B0000] text-white font-mono text-[8px] tracking-widest uppercase py-1 px-3 z-10 clip-corner-sm">
                  {featuredProduct.badge}
                </div>
              )}

              <div className="w-full aspect-square bg-black overflow-hidden relative">
                <img 
                  src={featuredProduct?.image} 
                  alt={featuredProduct?.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 filter brightness-95 contrast-110 saturate-90 transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-4 sm:p-5 border-t border-zinc-900/60 bg-[#161616]">
                <div className="font-mono text-[9px] tracking-[0.25em] text-[#888888] uppercase mb-1">
                  UNIT DESIGNATION
                </div>
                <h3 className="font-bebas text-lg tracking-wider text-[#E8E8E8] group-hover:text-white transition-colors uppercase leading-snug mb-3">
                  {featuredProduct?.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xl text-[#C8C8C8] tracking-tighter">
                    <span className="text-[10px] text-[#777777] tracking-widest uppercase mr-1.5">MSRP</span>
                    ${featuredProduct?.price?.toFixed(2)}
                  </div>
                  <button 
                    onClick={() => onAddToCart(featuredProduct)}
                    className="bg-[#222] hover:bg-[#8B0000] text-zinc-400 hover:text-white hover:border-red-700 text-[9px] font-mono tracking-wider px-3 py-1.5 border border-zinc-800 transition-all clip-corner-sm cursor-pointer"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── STATUS MARQUEE BAR ── */}
        <div className="bg-[#1a1a1a] border-t border-b border-zinc-900 py-2 sm:py-3 select-none overflow-hidden relative flex">
          <div 
            className="status-ticker-animate"
            style={{ 
              animationDuration: `${settings.ticker.speedSeconds}s`,
            }}
          >
            {/* Duplicated rendering content for endless loop simulation */}
            {Array.from({ length: 3 }).map((_, loopIdx) => (
              <div key={loopIdx} className="flex shrink-0 items-center">
                {settings.ticker.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-6 text-zinc-500 font-mono text-[10px] tracking-[0.2em] uppercase shrink-0">
                    <span>{item.text}</span>
                    <span className="text-[#8B0000] text-[7px]">◆</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── PRODUCT GRID SECTION ── */}
        <section id="catalog" className="section bg-black py-16 px-6 sm:px-12 lg:px-16 border-t border-zinc-950">
          <div className="flex flex-wrap items-end justify-between mb-12 gap-6 border-b border-zinc-900 pb-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.35em] text-[#8B0000] uppercase mb-2 flex items-center gap-1">
                <span className="inline-block tracking-normal mr-1">//</span> {settings.productGrid.eyebrow}
              </div>
              <h2 className="font-bebas text-4xl sm:text-5xl text-[#E8E8E8] tracking-widest uppercase leading-none whitespace-pre-line">
                {settings.productGrid.title}
              </h2>
            </div>
            <a 
              href="#catalog"
              className="view-all text-[10px] font-mono tracking-widest uppercase text-[#888888] hover:text-[#E8E8E8] transition-colors flex items-center gap-2 group decoration-transparent"
            >
              <span>{settings.productGrid.viewAllText}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8B0000] group-hover:translate-x-2 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {gridProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-[#111111] group border border-zinc-900/60 hover:border-zinc-800 clip-corner-lg shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                
                {/* Image card wrapper */}
                <div className="w-full aspect-square bg-[#1a1a1a] overflow-hidden relative">
                  {product.badge && (
                    <div className="absolute top-0 right-0 bg-[#8B0000] text-white font-mono text-[7px] sm:text-[9px] tracking-wider uppercase py-1 px-3 z-10">
                      {product.badge}
                    </div>
                  )}
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-100 filter brightness-95 saturate-[0.6] group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Card body */}
                <div className="p-4 border-t border-zinc-900">
                  <div className="font-mono text-[8px] tracking-[0.25em] text-zinc-500 mb-1 uppercase">
                    {product.unitCode}
                  </div>
                  <h3 className="font-bebas text-[14px] sm:text-[15px] text-[#C8C8C8] group-hover:text-white leading-tight min-h-[36px] line-clamp-2 uppercase tracking-wide mb-4 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-950">
                    <span className="font-mono text-[14px] sm:text-[15px] text-[#C8C8C8] font-semibold tracking-wide">
                      ${product.price.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="add-btn text-[9px] font-mono tracking-wider px-3 py-1.5 border border-zinc-800 bg-transparent text-zinc-500 hover:text-white hover:bg-[#8B0000] hover:border-red-700 transition-all clip-corner-sm cursor-pointer"
                    >
                      DEPLOY
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* ── FIELD REPORT (Classified layout) ── */}
        <section className="section bg-[#111111] py-20 px-6 sm:px-12 lg:px-16 border-t border-b border-zinc-900/60 overflow-hidden relative">
          
          {/* Classified watermark text background */}
          <div className="hidden lg:block absolute right-[-3rem] top-1/2 -translate-y-1/2 rotate-90 font-bebas text-[9rem] tracking-[0.2em] text-transparent select-none pointer-events-none line-chrome whitespace-nowrap opacity-[0.04]">
            CLASSIFIED
          </div>

          <div className={`grid grid-cols-1 ${viewportMode === "mobile" ? "grid-cols-1" : "lg:grid-cols-2"} gap-12 sm:gap-14 items-center`}>
            
            {/* Feature lists column */}
            <div>
              <div className="font-mono text-[10px] tracking-[0.35em] text-[#8B0000] uppercase mb-2 flex items-center gap-1">
                <span className="text-[#888888]">//</span> {settings.fieldReport.eyebrow}
              </div>
              <h2 className="font-bebas text-4xl sm:text-5xl text-[#E8E8E8] tracking-widest uppercase leading-[0.95] mb-4">
                {settings.fieldReport.title}
              </h2>
              <p className="font-mono text-[11px] text-[#777777] leading-relaxed max-w-[460px] tracking-wide mb-8">
                {settings.fieldReport.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.fieldReport.features.map((spec) => (
                  <div 
                    key={spec.id}
                    className="bg-[#080808]/90 border border-zinc-800/80 p-4 relative overflow-hidden group hover:border-zinc-700 transition-all clip-spec-card"
                  >
                    {/* Vertical Crimson Stripe Decorator */}
                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#8B0000] opacity-60"></div>

                    <span className="text-xl mb-2 block">{spec.icon}</span>
                    <h4 className="font-bebas text-[14px] text-[#E8E8E8] tracking-wider uppercase mb-1">
                      {spec.name}
                    </h4>
                    <p className="text-[10.5px] text-[#777777] leading-relaxed font-light">
                      {spec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature visual column */}
            <div className="relative">
              <div className="w-full aspect-[4/5] bg-black border border-zinc-800 clip-corner-xl overflow-hidden shadow-2xl relative">
                <img 
                  src={settings.fieldReport.imgUrl} 
                  alt="Field tested action"
                  className="w-full h-full object-cover opacity-60 filter grayscale contrast-125 saturate-50 hover:opacity-75 transition-opacity duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Satisfaction stamp */}
              <div className="absolute bottom-[-1px] right-[-1px] width-[160px] h-32 w-32 sm:h-[150px] sm:w-[150px] bg-[#1a1a1a] border border-zinc-800 flex flex-col items-center justify-center clip-stamp shadow-2xl">
                <div className="font-bebas text-3xl sm:text-4xl text-[#E8E8E8] leading-none mb-1">
                  {settings.fieldReport.stampNum}
                </div>
                <div className="font-mono text-[7px] sm:text-[9px] tracking-widest text-[#888888] text-center uppercase leading-tight px-3">
                  {settings.fieldReport.stampLabel}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── INTEL TESTIMONIALS SECTION ── */}
        <section className="bg-black py-20 px-6 sm:px-12 lg:px-16 text-center border-b border-zinc-950">
          <div className="mb-12">
            <div className="font-mono text-[10px] tracking-[0.35em] text-[#8B0000] uppercase mb-2 flex items-center justify-center gap-1">
              <span className="text-[#888888]">//</span> {settings.testimonials.eyebrow}
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl text-[#E8E8E8] tracking-widest uppercase leading-none">
              {settings.testimonials.title}
            </h2>
          </div>

          <div className={`grid grid-cols-1 ${viewportMode === "mobile" ? "grid-cols-1" : "md:grid-cols-3"} gap-[2px] border border-zinc-900 bg-zinc-900 overflow-hidden`}>
            {settings.testimonials.blocks.map((review) => (
              <div 
                key={review.id}
                className="bg-[#111111] p-6 text-left relative min-h-[220px] flex flex-col justify-between group"
              >
                {/* Horizontal crimson top light */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#8B0000] to-transparent"></div>

                <div>
                  <div className="text-[#888888] text-[11px] tracking-widest mb-4">
                    {review.stars}
                  </div>
                  <p className="text-[12.5px] font-sans font-light leading-relaxed text-[#F0F0F0] italic opacity-85 group-hover:opacity-100 mb-6 transition-opacity">
                    {review.quote}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1a1a1a] border border-zinc-800 flex items-center justify-center font-mono text-[11px] text-[#888888] clip-corner-sm hover:border-zinc-600 transition-colors">
                    {review.initials}
                  </div>
                  <div>
                    <div className="font-mono text-[11px] tracking-wide text-[#E8E8E8] uppercase">
                      {review.author}
                    </div>
                    <div className="text-[9px] text-[#777777] font-mono uppercase mt-0.5">
                      {review.unit}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION BANNER CTA ── */}
        <section className="bg-[#1a1a1a] border-t border-b border-zinc-800/80 p-8 sm:p-16 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Mission critical watermark text */}
          <div className="absolute left-[-2rem] top-1/2 -translate-y-1/2 font-bebas text-5xl sm:text-[9rem] tracking-wider uppercase text-transparent select-none pointer-events-none line-chrome whitespace-nowrap opacity-[0.03]">
            MISSION CRITICAL
          </div>

          {/* Left subtle vertical crimson accent */}
          <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-gradient-to-b from-transparent via-[#8B0000] to-transparent"></div>

          <div className="relative z-10 max-w-[450px]">
            <h2 className="font-bebas text-3xl sm:text-5xl tracking-wide text-[#E8E8E8] uppercase leading-none mb-3">
              {settings.ctaBanner.title}
            </h2>
            <p className="font-mono text-[11px] text-[#777777] leading-relaxed tracking-wide">
              {settings.ctaBanner.subtitle}
            </p>
          </div>

          <button 
            onClick={() => {
              // Add featured item as a fallback
              onAddToCart(featuredProduct);
            }} 
            className="bg-[#8B0000] hover:bg-[#B00000] text-[#E8E8E8] hover:text-white font-mono text-[11px] tracking-widest uppercase hover:scale-[1.02] border border-red-700 hover:border-red-500 py-4 px-8 clip-corner-md transition-all shrink-0 z-10 focus:outline-none cursor-pointer"
          >
            {settings.ctaBanner.buttonText}
          </button>
        </section>

        {/* ── FOOTER BRANDING AND NAVIGATION ── */}
        <footer className="bg-black border-t border-zinc-900 px-6 sm:px-12 py-12 text-zinc-500 text-xs text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-8 border-b border-zinc-950">
            <div className="footer-brand flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 clip-hexagon flex items-center justify-center font-bebas text-xs text-[#888888]">
                  {settings.header.badgeInitials}
                </div>
                <div className="flex flex-col">
                  <span className="font-bebas text-sm tracking-widest text-[#C8C8C8] uppercase leading-none">
                    {settings.header.logoText}
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-zinc-600 uppercase">
                    {settings.header.subText}
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-mono tracking-wide leading-relaxed max-w-[280px]">
                {settings.footer.brandDescription}
              </p>
            </div>

            {/* Footer Col 1 */}
            <div>
              <div className="font-mono text-[10px] tracking-widest text-[#8B0000] uppercase mb-4 flex items-center gap-1.5">
                <span className="text-zinc-700">//</span> {settings.footer.col1Title}
              </div>
              <ul className="flex flex-col gap-2 list-none m-0 p-0">
                {col1Links.map((link: any, idx: number) => (
                  <li key={idx}>
                    <a href={link.url} className="text-[#777] hover:text-[#C8C8C8] text-[11px] font-mono uppercase decoration-transparent tracking-wide transition-colors">
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Col 2 */}
            <div>
              <div className="font-mono text-[10px] tracking-widest text-[#8B0000] uppercase mb-4 flex items-center gap-1.5">
                <span className="text-zinc-700">//</span> {settings.footer.col2Title}
              </div>
              <ul className="flex flex-col gap-2 list-none m-0 p-0">
                {col2Links.map((link: any, idx: number) => (
                  <li key={idx}>
                    <a href={link.url} className="text-[#777] hover:text-[#C8C8C8] text-[11px] font-mono uppercase decoration-transparent tracking-wide transition-colors">
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Col 3 */}
            <div>
              <div className="font-mono text-[10px] tracking-widest text-[#8B0000] uppercase mb-4 flex items-center gap-1.5">
                <span className="text-zinc-700">//</span> {settings.footer.col3Title}
              </div>
              <ul className="flex flex-col gap-2 list-none m-0 p-0">
                {col3Links.map((link: any, idx: number) => (
                  <li key={idx}>
                    <a href={link.url} className="text-[#777] hover:text-[#C8C8C8] text-[11px] font-mono uppercase decoration-transparent tracking-wide transition-colors">
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono tracking-wider opacity-60">
            <span>{settings.footer.copyrightText}</span>
            <span className="text-zinc-600 bg-zinc-950/80 px-3 py-1 border border-zinc-900/60 clip-corner-sm">
              {settings.footer.versionCode}
            </span>
          </div>
        </footer>

        {/* ── SHOPIFY CART AJAX DRAWER PANEL SIMULATOR ── */}
        {isCartOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity flex justify-end">
            <div className="w-full max-w-[380px] bg-[#111] border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl relative animate-fade-loop select-none">
              
              {/* Header */}
              <div className="border-b border-zinc-900 p-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#8B0000]" />
                  <span className="font-bebas text-lg uppercase tracking-wider text-[#E8E8E8] mt-0.5">
                    Your Deployment Package
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutSimulated(false);
                  }}
                  className="bg-transparent text-[#777] hover:text-white border-0 transition-colors cursor-pointer focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {checkoutSimulated ? (
                  <div className="text-center py-8 px-4 flex flex-col items-center justify-center h-full">
                    <div className="w-14 h-14 bg-red-950/50 border border-red-700/80 text-red-500 rounded-full flex items-center justify-center mb-4 clip-hexagon">
                      <Flame className="w-7 h-7 text-[#B00000]" />
                    </div>
                    <h4 className="font-bebas text-xl text-white uppercase tracking-wider mb-2">
                      Order Dispatched!
                    </h4>
                    <p className="text-[11px] font-mono text-zinc-500 line-height-relaxed max-w-[260px] mb-6">
                      Simulated Shopify checkout protocol successful. Your customized protectors are queued in the CNC manufacturing line.
                    </p>
                    <button 
                      onClick={() => {
                        setCheckoutSimulated(false);
                        setIsCartOpen(false);
                      }}
                      className="bg-[#222] hover:bg-zinc-800 text-neutral-200 text-[10px] font-mono tracking-widest uppercase px-6 py-2.5 border border-zinc-800 clip-corner-sm transition-all focus:outline-none"
                    >
                      RETURN TO BASE
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center h-full text-zinc-600">
                    <AlertTriangle className="w-8 h-8 text-[#8B0000]/60 mb-3" />
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-1">
                      No Hardware Deployed
                    </p>
                    <p className="text-[9px] font-mono text-zinc-500 tracking-wider">
                      Select protective gear to fortify your system rig.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="bg-zinc-950/40 p-2 border border-zinc-900 rounded-sm font-mono text-[9px] text-[#8B0000] tracking-widest flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 bg-[#8B0000] rounded-full inline-block animate-pulse"></span>
                      <span>SECURE LOCAL ENCRYPT CHECKOUT READY</span>
                    </div>

                    {cart.map((item) => (
                      <div 
                        key={item.product.id}
                        className="bg-[#171717]/90 border border-zinc-900 p-3 clip-corner-sm flex gap-3 relative"
                      >
                        <div className="w-16 h-16 bg-[#080808] border border-zinc-800 shrink-0 overflow-hidden rounded-sm">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className="w-full h-full object-cover filter saturate-50 contrast-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-0.5">
                              {item.product.unitCode}
                            </div>
                            <h4 className="font-bebas text-sm text-[#E8E8E8] tracking-wide leading-tight line-clamp-1">
                              {item.product.name}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-900/60">
                            {/* Quantity Toggles */}
                            <div className="flex items-center gap-2.5 bg-black/50 border border-zinc-800/80 px-2 py-0.5 clip-corner-sm">
                              <button 
                                onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                                className="bg-transparent text-zinc-400 hover:text-white border-0 p-0 focus:outline-none"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-mono text-[10px] text-zinc-300 w-3 text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                                className="bg-transparent text-zinc-400 hover:text-white border-0 p-0 focus:outline-none"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Total price */}
                            <span className="font-mono text-[11px] text-[#C8C8C8] font-semibold">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Remove item button */}
                        <button 
                          onClick={() => onRemoveFromCart(item.product.id)}
                          className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-red-500 focus:outline-none border-0 bg-transparent transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtotal Checkout Footer */}
              {!checkoutSimulated && cart.length > 0 && (
                <div className="border-t border-zinc-900 p-4 bg-[#0d0d0d] shrink-0">
                  <div className="flex items-center justify-between mb-4 font-mono">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      Estimated Subtotal
                    </span>
                    <span className="text-lg text-[#E8E8E8] font-bold tracking-tight">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[8.5px] font-mono text-[#777] leading-tight mb-4">
                    Automatic local duties check complete. Excludes simulated continental freight charges.
                  </p>

                  <button 
                    onClick={() => setCheckoutSimulated(true)}
                    className="w-full bg-[#8B0000] hover:bg-[#B00000] text-white text-[11px] font-mono tracking-widest uppercase py-3.5 border border-red-700 hover:border-red-600 clip-corner-md transition-all focus:outline-none cursor-pointer"
                  >
                    DEPLOY SECURE PAY PROTOCOL
                  </button>

                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-transparent hover:text-white text-[9px] font-mono tracking-widest uppercase text-[#777] py-2 mt-2 transition-all focus:outline-none cursor-pointer border-0"
                  >
                    CONTINUE PATROLLING SITE
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
