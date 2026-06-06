import { useState, useEffect, FormEvent } from "react";
import { 
  INITIAL_PRODUCTS, 
  INITIAL_COLLECTIONS, 
  DEFAULT_THEME_SETTINGS 
} from "./data";
import { 
  ShopifyProduct, 
  ThemeSettings, 
  CartItem, 
  TestimonialBlock, 
  FeatureBlock,
  TickerItemBlock
} from "./types";
import StorefrontPreview from "./components/StorefrontPreview";
import { getLiquidCode } from "./utils";
import { 
  Settings, 
  Sliders, 
  Code, 
  LayoutGrid, 
  ShoppingBag, 
  Eye, 
  Copy, 
  RefreshCw, 
  Layers, 
  Monitor, 
  Tablet, 
  Smartphone, 
  FileCode2, 
  PlusCircle, 
  Check, 
  Trash, 
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";

export default function App() {
  // State Initialization
  const [products, setProducts] = useState<ShopifyProduct[]>(INITIAL_PRODUCTS);
  const [collections] = useState(INITIAL_COLLECTIONS);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // App views: "preview" | "liquid" | "catalog"
  const [activeTab, setActiveTab] = useState<"preview" | "liquid" | "catalog">("preview");
  
  // Section index editing: Header | Hero | Ticker | Grid | Field | Testi | CTA | Footer
  const [activeThemeSection, setActiveThemeSection] = useState<keyof ThemeSettings>("hero");
  
  // Live viewport size frame simulator
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Selected liquid file code inspect
  const [inspectSection, setInspectSection] = useState<keyof ThemeSettings | "all">("hero");
  
  // Copied indicator state
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // New product item input draft state for the manager
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("29.99");
  const [newProductBadge, setNewProductBadge] = useState("");
  const [newProductSku, setNewProductSku] = useState("Unit-005");
  const [newProductImage, setNewProductImage] = useState("");
  const [catManagerMsg, setCatManagerMsg] = useState("");

  // Sticky header helper notice state
  const [adminNotification, setAdminNotification] = useState<string | null>(
    "Welcome to the StompGuard Shopify Customizer Node. Click side options to tweak live parameters!"
  );

  // Auto-expire notifications
  useEffect(() => {
    if (adminNotification) {
      const t = setTimeout(() => setAdminNotification(null), 8000);
      return () => clearTimeout(t);
    }
  }, [adminNotification]);

  // Dynamic AJAX Cart CRUD Handlers
  const handleAddToCart = (product: ShopifyProduct) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setIsCartOpen(true);
    setAdminNotification(`Deployed dynamic Shopify Cart payload // Added ${product.name} to package.`);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    setAdminNotification("Removed unit payload from deployment cart.");
  };

  // Preset Section Code Coppy Actions
  const handleCopyCode = (sectionKey: keyof ThemeSettings | "all", codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedSection(sectionKey);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
    setAdminNotification(`Section Liquid Markup copied code for ${sectionKey}.liquid successfully.`);
  };

  // Settings modify builders helper
  const updateSettingField = (
    section: keyof ThemeSettings, 
    field: string, 
    value: any
  ) => {
    setThemeSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section] as any,
        [field]: value
      }
    }));
  };

  // Repeating schema array actions block (announcements ticker, features report bullet list cards, and feedback ratings)
  const handleAddTickerItem = () => {
    const freshId = `tick-${Date.now()}`;
    const newItem: TickerItemBlock = { id: freshId, text: "Tactical Premium Spec Announcement" };
    updateSettingField("ticker", "items", [...themeSettings.ticker.items, newItem]);
    setAdminNotification("Added fresh ticker announcement announcement block.");
  };

  const handleRemoveTickerItem = (id: string) => {
    const nextArr = themeSettings.ticker.items.filter(item => item.id !== id);
    updateSettingField("ticker", "items", nextArr);
  };

  const handleAddFeatureItem = () => {
    const freshId = `feat-${Date.now()}`;
    const newItem: FeatureBlock = { 
      id: freshId, 
      icon: "⚙️", 
      name: "Custom Fortification", 
      description: "Additional rugged defense guards tailored with structural armor." 
    };
    updateSettingField("fieldReport", "features", [...themeSettings.fieldReport.features, newItem]);
    setAdminNotification("Added new spec parameter to Field Report section.");
  };

  const handleRemoveFeatureItem = (id: string) => {
    const nextArr = themeSettings.fieldReport.features.filter(item => item.id !== id);
    updateSettingField("fieldReport", "features", nextArr);
  };

  const handleAddTestimonialItem = () => {
    const freshId = `testi-${Date.now()}`;
    const newItem: TestimonialBlock = {
      id: freshId,
      stars: "★★★★★",
      quote: '"Rugged construct perfectly shields knobs, ports, and cables seamlessly. Immediate five star!"',
      author: "Alex P.",
      initials: "AP",
      unit: "Line 6 Helix StompGuard"
    };
    updateSettingField("testimonials", "blocks", [...themeSettings.testimonials.blocks, newItem]);
    setAdminNotification("Registered custom operator review testimonial block.");
  };

  const handleRemoveTestimonialItem = (id: string) => {
    const nextArr = themeSettings.testimonials.blocks.filter(item => item.id !== id);
    updateSettingField("testimonials", "blocks", nextArr);
  };

  // Add Custom Product to Simulator Catalog Collection
  const handleAppendCatalogProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      setCatManagerMsg("Classification designation name required.");
      return;
    }
    const generatedId = `prod-custom-${Date.now()}`;
    const imageFall = newProductImage.trim() || "https://stompguard.com/cdn/shop/files/d9c0fafb-il_fullxfull.6924149105_frep.jpg?v=1773128059&width=500";
    
    const freshProduct: ShopifyProduct = {
      id: generatedId,
      sku: newProductSku || "Unit-00X",
      name: newProductName,
      price: parseFloat(newProductPrice) || 24.99,
      image: imageFall,
      badge: newProductBadge || undefined,
      unitCode: (newProductSku || "Unit-00X").toUpperCase()
    };

    setProducts([...products, freshProduct]);
    setNewProductName("");
    setNewProductBadge("");
    setNewProductSku(`Unit-00${products.length + 2}`);
    setNewProductPrice("19.99");
    setNewProductImage("");
    setCatManagerMsg("Hardware custom design integrated successfully in theme lists!");
    setTimeout(() => setCatManagerMsg(""), 5000);
    setAdminNotification(`Injected ${freshProduct.name} as active unit SKU choice.`);
  };

  // Restore Default settings values
  const handleRestoreDefaults = () => {
    if (confirm("Reset layout variables back to original stompguard.com design specifications?")) {
      setThemeSettings(DEFAULT_THEME_SETTINGS);
      setProducts(INITIAL_PRODUCTS);
      setCart([]);
      setAdminNotification("Re-synchronized components back to tactical baseline limits.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-300 font-sans flex flex-col antialiased">
      
      {/* ── CENTRAL TACTICAL SIMULATION CONSOLE TOPBAR ── */}
      <header className="bg-gradient-to-r from-[#0d0d0d] via-[#141414] to-[#0c0c0c] border-b border-zinc-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-50">
        <div className="flex items-center gap-3">
          <div className="flex bg-red-950/40 p-2.5 rounded-sm border border-red-800 text-[#B00000] items-center justify-center shadow-lg">
            <Sliders className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bebas text-2xl tracking-[0.08em] text-white leading-none uppercase">
                StompGuard Theme Protocol
              </h1>
              <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-green-500 px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                Online Store 2.0
              </span>
            </div>
            <p className="text-[10.5px] font-mono text-zinc-500 tracking-wider mt-0.5">
              INTEGRAL SIMULATOR // LIQUID COMPONENT ARCHITECT
            </p>
          </div>
        </div>

        {/* Global Toolbar and Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-black border border-zinc-900 rounded-md p-1 flex items-center gap-1.5 shadow-inner">
            <button
              onClick={() => { setActiveTab("preview"); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-[11px] font-mono tracking-widest uppercase transition-all border-0 cursor-pointer ${activeTab === "preview" ? "bg-red-900/40 text-white font-semibold border-b-2 border-red-600 shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Eye className="w-3.5 h-3.5 text-red-600" />
              <span>CUSTOMIZER PREVIEW</span>
            </button>
            <button
              onClick={() => { setActiveTab("liquid"); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-[11px] font-mono tracking-widest uppercase transition-all border-0 cursor-pointer ${activeTab === "liquid" ? "bg-red-900/40 text-white font-semibold border-b-2 border-red-600 shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>LIQUID SECTION CODES</span>
            </button>
            <button
              onClick={() => { setActiveTab("catalog"); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-[11px] font-mono tracking-widest uppercase transition-all border-0 cursor-pointer ${activeTab === "catalog" ? "bg-red-900/40 text-white font-semibold border-b-2 border-red-600 shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
              <span>PRODUCT MANAGE</span>
            </button>
          </div>

          <button 
            onClick={handleRestoreDefaults}
            title="Reset to Baseline Design"
            className="p-2.5 bg-[#141414] hover:bg-[#1a1a1a] text-zinc-400 hover:text-white border border-zinc-800 rounded-md transition-all cursor-pointer flex items-center justify-center focus:outline-none"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Quick Notification HUD */}
      {adminNotification && (
        <div className="bg-[#8B0000] text-neutral-100 px-6 py-2 flex items-center gap-2 justify-between text-xs font-mono select-none shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-200 shrink-0" />
            <span>{adminNotification}</span>
          </div>
          <button 
            onClick={() => setAdminNotification(null)}
            className="text-white hover:text-red-200 font-bold bg-transparent border-0 cursor-pointer text-xs"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* ── PANEL SPLIT CONTAINER ── */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ── LEFT COLUMN: REUSABLE SHOPIFY CUSTOMIZER PANEL ── */}
        <section className="w-full lg:w-[420px] bg-gradient-to-b from-[#111] to-[#0a0a0a] border-r border-zinc-900 overflow-y-auto shrink-0 flex flex-col p-4 sm:p-5 select-none text-left">
          
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
            <span className="font-bebas text-lg tracking-widest uppercase text-white mt-1">
              Shopify 2.0 Theme Editor
            </span>
            <span className="font-mono text-[9px] text-[#888] tracking-widest uppercase flex items-center gap-1.5 bg-zinc-950 p-1 px-2 border border-zinc-900">
              <span className="w-1.5 h-1.5 rounded-full bg-red-700 animate-pulse"></span>
              LIVE CONNECTED
            </span>
          </div>

          <p className="text-[11px] font-mono text-zinc-500 leading-relaxed mb-6 bg-zinc-950/60 p-3 border border-zinc-900 rounded">
            Click any section below to reveal corresponding editor parameters. Modifying any input reflects instantaneously inside the high-fidelity storefront preview on the right.
          </p>

          {/* SECTION CONTROLS ACCORDION */}
          <div className="flex flex-col gap-2.5">
            
            {/* 1. Header Section Settings Toggle */}
            <div className={`border rounded p-1.5 transition-colors ${activeThemeSection === "header" ? "bg-zinc-950/90 border-[#8B0000]" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"}`}>
              <button 
                onClick={() => setActiveThemeSection("header")}
                className="w-full bg-transparent flex items-center justify-between text-left p-1 cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-400 border border-zinc-800">01</div>
                  <span className="font-bebas text-sm tracking-wider uppercase text-[#E8E8E8]">Store Header Nav</span>
                </div>
                <span className="text-[10px] font-mono text-[#8B0000]">{activeThemeSection === 'header' ? '▼' : '▶'}</span>
              </button>

              {activeThemeSection === "header" && (
                <div className="mt-3 p-2.5 flex flex-col gap-3.5 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">LOGO TEXT</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 focus:outline-none focus:border-red-600 font-sans"
                      value={themeSettings.header.logoText}
                      onChange={(e) => updateSettingField("header", "logoText", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">SUB-LOGO BRAND TEXT</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 focus:outline-none focus:border-red-600 font-sans"
                      value={themeSettings.header.subText}
                      onChange={(e) => updateSettingField("header", "subText", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">HEX BADGE INITIALS</label>
                    <input 
                      type="text"
                      maxLength={3}
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 focus:outline-none focus:border-red-600 font-mono text-center font-bold"
                      value={themeSettings.header.badgeInitials}
                      onChange={(e) => updateSettingField("header", "badgeInitials", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">NAVIGATION MENU (JSON SPEC)</label>
                    <textarea 
                      rows={5}
                      className="w-full bg-black text-green-500 border border-zinc-800 rounded p-2 font-mono text-[10.5px] focus:outline-none focus:border-red-600"
                      value={themeSettings.header.menuJson}
                      onChange={(e) => updateSettingField("header", "menuJson", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">CTA BASKET BUTTON LABEL</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 focus:outline-none focus:border-red-600"
                      value={themeSettings.header.ctaText}
                      onChange={(e) => updateSettingField("header", "ctaText", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Hero Section Settings Toggle */}
            <div className={`border rounded p-1.5 transition-colors ${activeThemeSection === "hero" ? "bg-zinc-950/90 border-[#8B0000]" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"}`}>
              <button 
                onClick={() => setActiveThemeSection("hero")}
                className="w-full bg-transparent flex items-center justify-between text-left p-1 cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-400 border border-zinc-800">02</div>
                  <span className="font-bebas text-sm tracking-wider uppercase text-[#E8E8E8]">Split Hero Screen</span>
                </div>
                <span className="text-[10px] font-mono text-[#8B0000]">{activeThemeSection === 'hero' ? '▼' : '▶'}</span>
              </button>

              {activeThemeSection === "hero" && (
                <div className="mt-3 p-2.5 flex flex-col gap-3.5 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">EYEBROW CONSOLE BRIEF</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 focus:outline-none focus:border-red-600 font-sans"
                      value={themeSettings.hero.eyebrow}
                      onChange={(e) => updateSettingField("hero", "eyebrow", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1">HERO DISPLAY HEADLINE</label>
                    <span className="text-[9px] text-zinc-500 mb-2 block">Divided into 3 chrome, solid & crimson display slots.</span>
                    <div className="flex flex-col gap-1.5">
                      <input 
                        type="text"
                        placeholder="Line 1 Outline"
                        className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-1.5 font-sans"
                        value={themeSettings.hero.lineChrome}
                        onChange={(e) => updateSettingField("hero", "lineChrome", e.target.value)}
                      />
                      <input 
                        type="text"
                        placeholder="Line 2 Solid"
                        className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-1.5 font-sans"
                        value={themeSettings.hero.lineSolid}
                        onChange={(e) => updateSettingField("hero", "lineSolid", e.target.value)}
                      />
                      <input 
                        type="text"
                        placeholder="Line 3 Red"
                        className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-1.5 font-sans animate-fade-loop"
                        value={themeSettings.hero.lineRed}
                        onChange={(e) => updateSettingField("hero", "lineRed", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">STAGE HERO BACKGROUND PHOTO</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#777] border border-zinc-800 rounded p-2 text-[10px] focus:outline-none focus:border-red-600"
                      value={themeSettings.hero.bgImage}
                      onChange={(e) => updateSettingField("hero", "bgImage", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">SPEC PARAGRAPH LABELS (BRIEF)</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-zinc-300 border border-zinc-800 rounded p-2 font-sans font-bold uppercase tracking-wider mb-1"
                      value={themeSettings.hero.specTitle}
                      onChange={(e) => updateSettingField("hero", "specTitle", e.target.value)}
                    />
                    <textarea 
                      rows={3}
                      className="w-full bg-black text-zinc-400 border border-zinc-800 rounded p-2 font-sans"
                      value={themeSettings.hero.specText}
                      onChange={(e) => updateSettingField("hero", "specText", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">FEATURED PRODUCT UNIT (RIGHT PANEL)</label>
                    <select 
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 focus:outline-none focus:border-red-600 text-xs font-mono"
                      value={themeSettings.hero.featuredProductId}
                      onChange={(e) => updateSettingField("hero", "featuredProductId", e.target.value)}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-zinc-500 font-bold text-[9px] uppercase tracking-wider mb-1">BTN 1 ACTION LABEL</label>
                      <input 
                        type="text"
                        className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-1.5 text-[11px]"
                        value={themeSettings.hero.deployButtonText}
                        onChange={(e) => updateSettingField("hero", "deployButtonText", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 font-bold text-[9px] uppercase tracking-wider mb-1">BTN 2 ACTION LABEL</label>
                      <input 
                        type="text"
                        className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-1.5 text-[11px]"
                        value={themeSettings.hero.catalogButtonText}
                        onChange={(e) => updateSettingField("hero", "catalogButtonText", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Status Bar Ticker Settings Toggle */}
            <div className={`border rounded p-1.5 transition-colors ${activeThemeSection === "ticker" ? "bg-zinc-950/90 border-[#8B0000]" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"}`}>
              <button 
                onClick={() => setActiveThemeSection("ticker")}
                className="w-full bg-transparent flex items-center justify-between text-left p-1 cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-400 border border-zinc-800">03</div>
                  <span className="font-bebas text-sm tracking-wider uppercase text-[#E8E8E8]">Marquee Status Ticker</span>
                </div>
                <span className="text-[10px] font-mono text-[#8B0000]">{activeThemeSection === 'ticker' ? '▼' : '▶'}</span>
              </button>

              {activeThemeSection === "ticker" && (
                <div className="mt-3 p-2.5 flex flex-col gap-3.5 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1 flex justify-between">
                      <span>SPEED PARAM (SECONDS)</span>
                      <span className="text-[#8B0000] font-bold">{themeSettings.ticker.speedSeconds}s</span>
                    </label>
                    <input 
                      type="range" 
                      min="5" 
                      max="60" 
                      step="5"
                      className="w-full accent-red-700 cursor-pointer"
                      value={themeSettings.ticker.speedSeconds}
                      onChange={(e) => updateSettingField("ticker", "speedSeconds", parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider">TICKER REPEAT BLOCKS</label>
                      <button 
                        onClick={handleAddTickerItem}
                        className="text-[9px] bg-red-950/40 text-red-500 border border-red-800 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-2.5 h-2.5" /> ADD BLOCK
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {themeSettings.ticker.items.map((item, idx) => (
                        <div key={item.id} className="flex gap-2 items-center bg-black/60 border border-zinc-900 p-1 rounded">
                          <span className="text-[8px] text-zinc-600 select-none px-1">#{idx+1}</span>
                          <input 
                            type="text"
                            className="flex-1 bg-transparent text-white border-0 focus:ring-0 p-1 text-[11px] font-sans"
                            value={item.text}
                            onChange={(e) => {
                              const updatedItems = themeSettings.ticker.items.map(i => 
                                i.id === item.id ? { ...i, text: e.target.value } : i
                              );
                              updateSettingField("ticker", "items", updatedItems);
                            }}
                          />
                          <button 
                            onClick={() => handleRemoveTickerItem(item.id)}
                            className="bg-transparent border-0 text-[#777] hover:text-red-500 cursor-pointer p-1"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Protective Covers Grid Settings Toggle */}
            <div className={`border rounded p-1.5 transition-colors ${activeThemeSection === "productGrid" ? "bg-zinc-950/90 border-[#8B0000]" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"}`}>
              <button 
                onClick={() => setActiveThemeSection("productGrid")}
                className="w-full bg-transparent flex items-center justify-between text-left p-1 cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-400 border border-zinc-800">04</div>
                  <span className="font-bebas text-sm tracking-wider uppercase text-[#E8E8E8]">Hardware Product Catalog Grid</span>
                </div>
                <span className="text-[10px] font-mono text-[#8B0000]">{activeThemeSection === 'productGrid' ? '▼' : '▶'}</span>
              </button>

              {activeThemeSection === "productGrid" && (
                <div className="mt-3 p-2.5 flex flex-col gap-3.5 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">EYEBROW SUB-HEADER LABEL</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2"
                      value={themeSettings.productGrid.eyebrow}
                      onChange={(e) => updateSettingField("productGrid", "eyebrow", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">SECTION MAIN TITLE (USE LINE REFACTOR)</label>
                    <textarea 
                      rows={2}
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 font-sans"
                      value={themeSettings.productGrid.title}
                      onChange={(e) => updateSettingField("productGrid", "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">SHOPIFY COLLECTION SELECT</label>
                    <select 
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 focus:outline-none focus:border-red-600 text-xs font-mono"
                      value={themeSettings.productGrid.collectionId}
                      onChange={(e) => updateSettingField("productGrid", "collectionId", e.target.value)}
                    >
                      {collections.map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.id === "all" ? products.length : c.productIds.length} items)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">VIEW ALL LINK TEXT</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2"
                      value={themeSettings.productGrid.viewAllText}
                      onChange={(e) => updateSettingField("productGrid", "viewAllText", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Field Report Features Section Toggle */}
            <div className={`border rounded p-1.5 transition-colors ${activeThemeSection === "fieldReport" ? "bg-zinc-950/90 border-[#8B0000]" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"}`}>
              <button 
                onClick={() => setActiveThemeSection("fieldReport")}
                className="w-full bg-transparent flex items-center justify-between text-left p-1 cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-400 border border-zinc-800">05</div>
                  <span className="font-bebas text-sm tracking-wider uppercase text-[#E8E8E8]">Field Report specification</span>
                </div>
                <span className="text-[10px] font-mono text-[#8B0000]">{activeThemeSection === 'fieldReport' ? '▼' : '▶'}</span>
              </button>

              {activeThemeSection === "fieldReport" && (
                <div className="mt-3 p-2.5 flex flex-col gap-3.5 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">EYEBROW PREFIX LABEL</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2"
                      value={themeSettings.fieldReport.eyebrow}
                      onChange={(e) => updateSettingField("fieldReport", "eyebrow", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">SECTION DISPLAY HEADING</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 font-sans"
                      value={themeSettings.fieldReport.title}
                      onChange={(e) => updateSettingField("fieldReport", "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">INTRO DESCRIPTION</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-black text-zinc-400 border border-zinc-800 rounded p-2 font-sans"
                      value={themeSettings.fieldReport.description}
                      onChange={(e) => updateSettingField("fieldReport", "description", e.target.value)}
                    />
                  </div>

                  {/* Features blocks editor list */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider">SPEC CARDS BLOCKS (MAX 4 RECOM)</label>
                      <button 
                        onClick={handleAddFeatureItem}
                        className="text-[9px] bg-red-950/40 text-red-500 border border-red-800 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-2.5 h-2.5" /> ADD
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                      {themeSettings.fieldReport.features.map((spec) => (
                        <div key={spec.id} className="bg-black/60 border border-zinc-900 p-2 rounded flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <input 
                              type="text" 
                              maxLength={3} 
                              className="w-8 text-center bg-zinc-900 border border-zinc-800 rounded text-xs p-0.5" 
                              value={spec.icon}
                              onChange={(e) => {
                                const nextFs = themeSettings.fieldReport.features.map(f => 
                                  f.id === spec.id ? { ...f, icon: e.target.value } : f
                                );
                                updateSettingField("fieldReport", "features", nextFs);
                              }}
                            />
                            <button 
                              onClick={() => handleRemoveFeatureItem(spec.id)}
                              className="bg-transparent border-0 text-[#777] hover:text-red-500 cursor-pointer p-0.5"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input 
                            type="text" 
                            className="bg-zinc-950 text-[#fff] text-[11px] p-1 rounded font-bebas tracking-wide" 
                            placeholder="Title"
                            value={spec.name}
                            onChange={(e) => {
                              const nextFs = themeSettings.fieldReport.features.map(f => 
                                f.id === spec.id ? { ...f, name: e.target.value } : f
                              );
                              updateSettingField("fieldReport", "features", nextFs);
                            }}
                          />
                          <input 
                            type="text" 
                            className="bg-zinc-950 text-zinc-400 text-[10.5px] p-1 rounded font-sans" 
                            placeholder="Brief description"
                            value={spec.description}
                            onChange={(e) => {
                              const nextFs = themeSettings.fieldReport.features.map(f => 
                                f.id === spec.id ? { ...f, description: e.target.value } : f
                              );
                              updateSettingField("fieldReport", "features", nextFs);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-900">
                    <div>
                      <label className="block text-zinc-500 font-bold text-[9px] uppercase tracking-wider mb-1">STAMP DIGITS</label>
                      <input 
                        type="text"
                        className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-1.5 text-center font-bold"
                        value={themeSettings.fieldReport.stampNum}
                        onChange={(e) => updateSettingField("fieldReport", "stampNum", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 font-bold text-[9px] uppercase tracking-wider mb-1">STAMP LABEL</label>
                      <input 
                        type="text"
                        className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-1.5 text-[10px]"
                        value={themeSettings.fieldReport.stampLabel}
                        onChange={(e) => updateSettingField("fieldReport", "stampLabel", e.target.value)}
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* 6. Operator Reports Testimonials Section Toggle */}
            <div className={`border rounded p-1.5 transition-colors ${activeThemeSection === "testimonials" ? "bg-zinc-950/90 border-[#8B0000]" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"}`}>
              <button 
                onClick={() => setActiveThemeSection("testimonials")}
                className="w-full bg-transparent flex items-center justify-between text-left p-1 cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-400 border border-zinc-800">06</div>
                  <span className="font-bebas text-sm tracking-wider uppercase text-[#E8E8E8]">Operator Intel Testi</span>
                </div>
                <span className="text-[10px] font-mono text-[#8B0000]">{activeThemeSection === 'testimonials' ? '▼' : '▶'}</span>
              </button>

              {activeThemeSection === "testimonials" && (
                <div className="mt-3 p-2.5 flex flex-col gap-3.5 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">EYEBROW ACCENT</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2"
                      value={themeSettings.testimonials.eyebrow}
                      onChange={(e) => updateSettingField("testimonials", "eyebrow", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">SECTION SECTION TITLE</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 font-sans"
                      value={themeSettings.testimonials.title}
                      onChange={(e) => updateSettingField("testimonials", "title", e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider">TESTIMONIAL REVIEWS BLOCKS</label>
                      <button 
                        onClick={handleAddTestimonialItem}
                        className="text-[9px] bg-red-950/40 text-red-500 border border-red-800 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-2.5 h-2.5" /> ADD BLOCK
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                      {themeSettings.testimonials.blocks.map((review) => (
                        <div key={review.id} className="bg-black/60 border border-zinc-900 p-2.5 rounded flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <input 
                              type="text" 
                              placeholder="Stars" 
                              className="bg-zinc-950 font-bold border border-zinc-800 rounded text-yellow-500 px-1 py-0.5 text-[9px]"
                              value={review.stars}
                              onChange={(e) => {
                                const nextB = themeSettings.testimonials.blocks.map(b => 
                                  b.id === review.id ? { ...b, stars: e.target.value } : b
                                );
                                updateSettingField("testimonials", "blocks", nextB);
                              }}
                            />
                            <button 
                              onClick={() => handleRemoveTestimonialItem(review.id)}
                              className="bg-transparent border-0 text-[#777] hover:text-red-500 cursor-pointer p-0.5"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea 
                            rows={3}
                            className="bg-zinc-950 text-zinc-300 font-sans text-[11px] rounded p-1 border border-zinc-900"
                            placeholder="Quote text"
                            value={review.quote}
                            onChange={(e) => {
                              const nextB = themeSettings.testimonials.blocks.map(b => 
                                b.id === review.id ? { ...b, quote: e.target.value } : b
                              );
                              updateSettingField("testimonials", "blocks", nextB);
                            }}
                          />
                          <div className="grid grid-cols-3 gap-1">
                            <input 
                              type="text" 
                              placeholder="Name" 
                              className="bg-zinc-950 text-white text-[10px] p-1 rounded font-mono"
                              value={review.author}
                              onChange={(e) => {
                                const nextB = themeSettings.testimonials.blocks.map(b => 
                                  b.id === review.id ? { ...b, author: e.target.value } : b
                                );
                                updateSettingField("testimonials", "blocks", nextB);
                              }}
                            />
                            <input 
                              type="text" 
                              placeholder="Unit/Tag" 
                              className="bg-zinc-950 text-zinc-400 text-[9px] p-1 rounded font-mono col-span-2"
                              value={review.unit}
                              onChange={(e) => {
                                const nextB = themeSettings.testimonials.blocks.map(b => 
                                  b.id === review.id ? { ...b, unit: e.target.value } : b
                                );
                                updateSettingField("testimonials", "blocks", nextB);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. CTA Mission Banner Section Toggle */}
            <div className={`border rounded p-1.5 transition-colors ${activeThemeSection === "ctaBanner" ? "bg-zinc-950/90 border-[#8B0000]" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"}`}>
              <button 
                onClick={() => setActiveThemeSection("ctaBanner")}
                className="w-full bg-transparent flex items-center justify-between text-left p-1 cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-400 border border-zinc-800">07</div>
                  <span className="font-bebas text-sm tracking-wider uppercase text-[#E8E8E8]">Tactical CTA Mission Banner</span>
                </div>
                <span className="text-[10px] font-mono text-[#8B0000]">{activeThemeSection === 'ctaBanner' ? '▼' : '▶'}</span>
              </button>

              {activeThemeSection === "ctaBanner" && (
                <div className="mt-3 p-2.5 flex flex-col gap-3.5 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">CTA HEADLINE</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2 font-sans"
                      value={themeSettings.ctaBanner.title}
                      onChange={(e) => updateSettingField("ctaBanner", "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">SUB-LABELS EXPLANATION</label>
                    <textarea 
                      rows={2}
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2"
                      value={themeSettings.ctaBanner.subtitle}
                      onChange={(e) => updateSettingField("ctaBanner", "subtitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">BUTTON ACTION LABEL</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2"
                      value={themeSettings.ctaBanner.buttonText}
                      onChange={(e) => updateSettingField("ctaBanner", "buttonText", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 8. Footer Section Settings Toggle */}
            <div className={`border rounded p-1.5 transition-colors ${activeThemeSection === "footer" ? "bg-zinc-950/90 border-[#8B0000]" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"}`}>
              <button 
                onClick={() => setActiveThemeSection("footer")}
                className="w-full bg-transparent flex items-center justify-between text-left p-1 cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-400 border border-zinc-800">08</div>
                  <span className="font-bebas text-sm tracking-wider uppercase text-[#E8E8E8]">Theme Footer Parameters</span>
                </div>
                <span className="text-[10px] font-mono text-[#8B0000]">{activeThemeSection === 'footer' ? '▼' : '▶'}</span>
              </button>

              {activeThemeSection === "footer" && (
                <div className="mt-3 p-2.5 flex flex-col gap-3.5 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">BRAND EXPLAINER FIELD DESCRIPTION</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-black text-zinc-300 border border-zinc-800 rounded p-2 font-sans"
                      value={themeSettings.footer.brandDescription}
                      onChange={(e) => updateSettingField("footer", "brandDescription", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1">LINKS COLUMNS BLOCK</label>
                    <div className="flex flex-col gap-2 mt-1.5">
                      <div className="bg-black/40 border border-zinc-900 p-2 rounded">
                        <span className="block text-zinc-500 font-bold text-[9px] mb-1">COLUMN 1: {themeSettings.footer.col1Title}</span>
                        <input className="w-full bg-black border border-zinc-850 p-1 text-zinc-400 text-[10.5px] rounded" value={themeSettings.footer.col1LinksJson} onChange={(e) => updateSettingField("footer", "col1LinksJson", e.target.value)} />
                      </div>
                      <div className="bg-black/40 border border-zinc-900 p-2 rounded">
                        <span className="block text-zinc-500 font-bold text-[9px] mb-1">COLUMN 2: {themeSettings.footer.col2Title}</span>
                        <input className="w-full bg-black border border-zinc-850 p-1 text-zinc-400 text-[10.5px] rounded" value={themeSettings.footer.col2LinksJson} onChange={(e) => updateSettingField("footer", "col2LinksJson", e.target.value)} />
                      </div>
                      <div className="bg-black/40 border border-zinc-900 p-2 rounded">
                        <span className="block text-zinc-500 font-bold text-[9px] mb-1">COLUMN 3: {themeSettings.footer.col3Title}</span>
                        <input className="w-full bg-black border border-zinc-850 p-1 text-zinc-400 text-[10.5px] rounded" value={themeSettings.footer.col3LinksJson} onChange={(e) => updateSettingField("footer", "col3LinksJson", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">COPYRIGHT TEXT</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-[#E8E8E8] border border-zinc-800 rounded p-2"
                      value={themeSettings.footer.copyrightText}
                      onChange={(e) => updateSettingField("footer", "copyrightText", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[#fff] font-bold text-[10px] uppercase tracking-wider mb-1.5">SG REVISION VERSION TAG</label>
                    <input 
                      type="text"
                      className="w-full bg-black text-red-500 border border-zinc-800 rounded p-2 font-mono text-center font-bold"
                      value={themeSettings.footer.versionCode}
                      onChange={(e) => updateSettingField("footer", "versionCode", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="mt-8 pt-5 border-t border-zinc-950 flex flex-col gap-2 text-[10.5px] font-mono text-zinc-600">
            <span>STOMPGUARD TACTICAL v2.0 STATUS</span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              All dynamic models synchronized
            </span>
          </div>
        </section>

        {/* ── RIGHT COLUMN CONTENT: LIVE WORKSPACE SIMBOARD ── */}
        <section className="flex-1 bg-[#0b0b0b] overflow-y-auto flex flex-col relative text-center">
          
          {/* Active View Title indicator hub */}
          <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-900 flex justify-between items-center z-10 shrink-0">
            
            <div className="flex items-center gap-2">
              {activeTab === "preview" && (
                <>
                  <Eye className="w-4 h-4 text-red-500" />
                  <span className="text-xs uppercase font-mono tracking-widest text-[#E8E8E8]">
                    LIVE STOREFRONT INTERACTION VIEWPORT
                  </span>
                </>
              )}
              {activeTab === "liquid" && (
                <>
                  <Code className="w-4 h-4 text-green-500" />
                  <span className="text-xs uppercase font-mono tracking-widest text-green-500">
                    SHOPIFY .LIQUID CODE GENERATOR OUTPOST
                  </span>
                </>
              )}
              {activeTab === "catalog" && (
                <>
                  <LayoutGrid className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs uppercase font-mono tracking-widest text-indigo-400">
                    CATALOG DEVELOPER STOCKROOM
                  </span>
                </>
              )}
            </div>

            {/* Viewport Frame Resizer Controls (active only in previewer tab) */}
            {activeTab === "preview" && (
              <div className="bg-[#111] p-1 border border-zinc-850 rounded-sm flex items-center gap-1">
                <button
                  onClick={() => setViewportMode("desktop")}
                  title="Desktop View (width: 100%)"
                  className={`p-1.5 rounded transition-all cursor-pointer border-0 flex items-center justify-center ${viewportMode === "desktop" ? "bg-red-900/60 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode("tablet")}
                  title="Tablet View (width: 768px)"
                  className={`p-1.5 rounded transition-all cursor-pointer border-0 flex items-center justify-center ${viewportMode === "tablet" ? "bg-red-900/60 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode("mobile")}
                  title="Mobile View (width: 420px)"
                  className={`p-1.5 rounded transition-all cursor-pointer border-0 flex items-center justify-center ${viewportMode === "mobile" ? "bg-red-900/60 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* VIEWPORT AREA */}
          <div className="flex-1 overflow-y-auto relative w-full flex flex-col justify-start">
            
            {/* 1. Preview View Area */}
            {activeTab === "preview" && (
              <div className="w-full h-full flex flex-col shrink-0 flex-1">
                <StorefrontPreview 
                  settings={themeSettings}
                  products={products}
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onUpdateCartQty={handleUpdateCartQty}
                  onRemoveFromCart={handleRemoveFromCart}
                  viewportMode={viewportMode}
                  isCartOpen={isCartOpen}
                  setIsCartOpen={setIsCartOpen}
                />
              </div>
            )}

            {/* 2. Liquid Section Export Hub View Area */}
            {activeTab === "liquid" && (
              <div className="w-full p-6 sm:p-8 max-w-4xl mx-auto flex flex-col gap-6 text-left shrink-0">
                
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-sm flex flex-col md:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#8B0000]/20 border border-[#8B0000] flex items-center justify-center font-bebas text-lg text-red-500">
                      LQ
                    </div>
                    <div>
                      <h3 className="font-bebas text-lg text-white uppercase tracking-wider leading-none">
                        Section Template Export Hub
                      </h3>
                      <p className="text-[10.5px] font-mono text-zinc-500 tracking-wide mt-1">
                        Copy Online Store 2.0 section files to deploy them in your production store.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                  {(["header", "hero", "ticker", "productGrid", "fieldReport", "testimonials", "ctaBanner", "footer"] as Array<keyof ThemeSettings>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setInspectSection(key)}
                      className={`text-[9.5px] font-mono tracking-widest uppercase p-2 border rounded transition-all text-center cursor-pointer ${inspectSection === key ? "bg-red-900/30 text-white border-red-700" : "bg-black text-zinc-500 border-zinc-900 hover:border-zinc-800"}`}
                    >
                      {key === "productGrid" ? "grid" : key === "fieldReport" ? "features" : key === "ctaBanner" ? "banner" : key}
                    </button>
                  ))}
                </div>

                {/* Inspect and Code Viewer Card */}
                <div className="bg-[#050505] border border-zinc-900 rounded overflow-hidden shadow-2xl flex flex-col">
                  
                  {/* Card top bar */}
                  <div className="bg-zinc-950/90 px-4 py-3 border-b border-zinc-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="font-mono text-xs text-[#888] font-bold uppercase tracking-widest">
                        {inspectSection}.liquid // generated schema file
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(inspectSection, getLiquidCode(inspectSection, themeSettings))}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 font-mono text-[9px] tracking-widest uppercase py-1.5 px-3.5 clip-corner-sm flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none"
                    >
                      {copiedSection === inspectSection ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500 animate-bounce" />
                          <span className="text-green-500">COPIED PROTOCOL!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY SCHEMATICS</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Liquid text content output */}
                  <div className="p-4 overflow-x-auto bg-[#050505] text-[#78d37a] font-mono text-[11px] leading-relaxed max-h-[500px]">
                    <pre className="whitespace-pre-wrap font-mono tracking-wide selection:bg-zinc-800 selection:text-white">
                      {getLiquidCode(inspectSection, themeSettings)}
                    </pre>
                  </div>

                </div>

                <div className="p-4 bg-zinc-950/60 border border-zinc-900 text-[11px] font-mono text-zinc-500 leading-relaxed rounded">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-400 block uppercase tracking-wide mb-1">Developer Implementation Checklist:</strong>
                      1. Create a section file in your theme code editor under <code className="text-zinc-300">sections/{inspectSection}.liquid</code>.<br />
                      2. Overwrite its entire contents with the generated code above.<br />
                      3. Use standard liquid settings inside your section schemas matching all variables perfectly!<br />
                      4. Safe and ready to run. Designed strictly according to Online Store 2.0 blocks/presets.
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 3. Catalog Stock Warehouse Manager View Area */}
            {activeTab === "catalog" && (
              <div className="w-full p-6 sm:p-8 max-w-4xl mx-auto flex flex-col gap-6 text-left shrink-0">
                
                {/* Catalog Introduction Banner */}
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-sm flex flex-col md:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#8B0000]/20 border border-[#8B0000] flex items-center justify-center font-bebas text-lg text-red-500">
                      SG
                    </div>
                    <div>
                      <h3 className="font-bebas text-lg text-white uppercase tracking-wider leading-none">
                        Catalog Stockroom Developer Hub
                      </h3>
                      <p className="text-[10.5px] font-mono text-zinc-500 tracking-wide mt-1">
                        Inject custom products into the simulator array to review responsive layout flow and spacing behavior.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Form to append fresh product */}
                  <form 
                    onSubmit={handleAppendCatalogProduct}
                    className="bg-[#0f0f0f] border border-zinc-900 rounded p-5 flex flex-col gap-4"
                  >
                    <h3 className="font-bebas text-base text-[#E8E8E8] tracking-widest uppercase border-b border-zinc-900 pb-2 mb-1">
                      Add Simulated Product Design
                    </h3>

                    {catManagerMsg && (
                      <div className="bg-green-950/60 border border-green-800 text-green-400 px-3 py-2 text-[11px] font-mono rounded">
                        {catManagerMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9.5px] text-zinc-500 font-mono uppercase tracking-wider mb-1">SKU DESIGNATION CODE</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Unit-005"
                          className="w-full bg-black border border-zinc-850 p-2 font-mono text-xs rounded text-[#fff]"
                          value={newProductSku}
                          onChange={(e) => setNewProductSku(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-zinc-500 font-mono uppercase tracking-wider mb-1">PRICE (USD)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          placeholder="24.99"
                          className="w-full bg-black border border-zinc-850 p-2 font-mono text-xs rounded text-[#fff]"
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-zinc-500 font-mono uppercase tracking-wider mb-1">CLASSIFICATION NAME</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Line 6 HX StompGuard Custom Cover"
                        className="w-full bg-black border border-zinc-850 p-2 font-sans text-xs rounded text-[#fff]"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9.5px] text-zinc-500 font-mono uppercase tracking-wider mb-1">TEST CRITERIA BADGE</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Field Tested / Limited Edition"
                          className="w-full bg-black border border-zinc-850 p-2 font-sans text-xs rounded text-[#fff]"
                          value={newProductBadge}
                          onChange={(e) => setNewProductBadge(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-zinc-500 font-mono uppercase tracking-wider mb-1">IMAGE SOURCE URL</label>
                        <input 
                          type="text" 
                          placeholder="Leave blank for defaults"
                          className="w-full bg-black border border-zinc-850 p-1.5 text-[10.5px] truncate font-mono rounded text-zinc-400"
                          value={newProductImage}
                          onChange={(e) => setNewProductImage(e.target.value)}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="bg-[#8B0000] hover:bg-[#B00000] text-white text-[11px] font-mono tracking-widest uppercase py-3 border border-red-700 hover:border-red-650 clip-corner-md transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-2 mt-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>SECURE INTEGRATION PROTOCOL</span>
                    </button>
                  </form>

                  {/* Current Active Product Registry */}
                  <div className="bg-[#0f0f0f] border border-zinc-900 rounded p-5 flex flex-col">
                    <h3 className="font-bebas text-base text-[#E8E8E8] tracking-widest uppercase border-b border-zinc-900 pb-2 mb-3 shrink-0">
                      Active Unit Registry ({products.length})
                    </h3>

                    <div className="flex-1 overflow-y-auto max-h-[310px] pr-1 flex flex-col gap-2">
                      {products.map((p) => (
                        <div 
                          key={p.id}
                          className="bg-black border border-zinc-900 p-2 rounded-sm flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-[#161616] border border-zinc-850 overflow-hidden shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover filter saturate-50 contrast-110" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className="font-mono text-[9px] text-[#8B0000] tracking-wider">{p.unitCode}</span>
                              {p.badge && (
                                <span className="bg-zinc-900 border border-zinc-850 text-[7px] text-zinc-500 font-mono tracking-widest uppercase px-1 py-0.5 rounded-sm">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <h4 className="font-sans text-[11px] text-[#E8E8E8] font-bold truncate tracking-wide mt-1">
                              {p.name}
                            </h4>
                          </div>
                          <div className="font-mono text-xs text-[#C8C8C8] px-2">
                            ${p.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>

        </section>

      </main>

    </div>
  );
}
