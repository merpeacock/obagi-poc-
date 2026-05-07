import { useState, useMemo } from "react";
import { ShoppingBag, Search, User, Heart, ChevronDown, Plus, Minus, Star, Tag, Truck, ArrowRight, X, Lock, LogOut, Filter, Grid, List as ListIcon, Eye } from "lucide-react";

// ============================================================
// OBAGI Phase 2 Storefront — Interactive POC
// Style Library: Authority Blue #172462, Physician Blue #0A49D1
// Open Sans SemiCondensed (proxied with Open Sans)
// ============================================================

const COLORS = {
  authority: "#172462",
  physician: "#0A49D1",
  white: "#FFFFFF",
  blueLight: "#F3F6FD",
  darkGray: "#4D4F57",
  inactive: "#8F929B",
  silver: "#D9D9D9",
  gold: "#FFB700",
  error: "#FF0000",
};

// Mock catalog
const PRODUCTS = [
  { id: 1, line: "Nu-Derm", name: "Clear Fx", category: "Retail", concern: "Discoloration", ingredient: "Arbutin", size: "2 oz", price: 95, rating: 4.8, reviews: 142, badge: "BESTSELLER", isInjectable: false, hasPromo: false },
  { id: 2, line: "Vitamin C", name: "Professional-C Serum 20%", category: "Retail", concern: "Aging", ingredient: "Vitamin C", size: "1 oz", price: 155, rating: 4.6, reviews: 216, badge: "BESTSELLER", isInjectable: false, hasPromo: true },
  { id: 3, line: "Elastiderm", name: "Facial Serum", category: "Retail", concern: "Aging", ingredient: "Bi-Mineral Complex", size: "1 oz", price: 142, rating: 4.5, reviews: 103, badge: null, isInjectable: false, hasPromo: false },
  { id: 4, line: "SuzanObagiMD", name: "Retivance Skin Rejuvenating Complex", category: "Retail", concern: "Fine Lines", ingredient: "Retinaldehyde", size: "1 oz", price: 110, rating: 4.8, reviews: 87, badge: "NEW", isInjectable: false, hasPromo: false },
  { id: 5, line: "Sun Shield", name: "Mineral Broad Spectrum SPF 50", category: "Retail", concern: "Sun Protection", ingredient: "Zinc Oxide", size: "3 oz", price: 65, rating: 4.7, reviews: 198, badge: "BESTSELLER", isInjectable: false, hasPromo: false },
  { id: 6, line: "Nu-Derm", name: "Toner", category: "Back Bar", concern: "Discoloration", ingredient: "Witch Hazel", size: "6.7 oz", price: 48, rating: 4.4, reviews: 62, badge: null, isInjectable: false, hasPromo: false },
  { id: 7, line: "Vitamin C", name: "Travel Serum", category: "Travel", concern: "Aging", ingredient: "Vitamin C", size: "0.25 oz", price: 38, rating: 4.5, reviews: 45, badge: null, isInjectable: false, hasPromo: false },
  { id: 8, line: "Hydrate", name: "Luxe Moisturizer", category: "Retail", concern: "Hydration", ingredient: "Hydromanil", size: "1.7 oz", price: 86, rating: 4.6, reviews: 156, badge: null, isInjectable: false, hasPromo: true },
  { id: 9, line: "MAGIQ", name: "Injectable Filler Pro", category: "Retail", concern: "Volume Loss", ingredient: "Hyaluronic Acid", size: "1 mL", price: 240, rating: 4.9, reviews: 28, badge: "NEW", isInjectable: true, hasPromo: false },
  { id: 10, line: "Clenziderm", name: "Acne Therapeutic System", category: "Retail", concern: "Acne", ingredient: "Salicylic Acid", size: "Set", price: 132, rating: 4.5, reviews: 94, badge: null, isInjectable: false, hasPromo: false },
];

const FILTERS = {
  category: ["Retail", "Back Bar", "Travel"],
  line: ["Nu-Derm", "Vitamin C", "Elastiderm", "SuzanObagiMD", "Sun Shield", "Hydrate", "MAGIQ", "Clenziderm"],
  concern: ["Discoloration", "Aging", "Fine Lines", "Sun Protection", "Hydration", "Acne", "Volume Loss"],
  ingredient: ["Vitamin C", "Retinaldehyde", "Hyaluronic Acid", "Zinc Oxide", "Salicylic Acid", "Hydromanil", "Arbutin"],
};

export default function OBAGIPoC() {
  const [page, setPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeCollection, setActiveCollection] = useState(null);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    line: [],
    concern: [],
    ingredient: [],
    promoOnly: false,
  });
  const [sortBy, setSortBy] = useState("bestseller");

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const hasInjectable = cart.some(item => item.isInjectable);
  const hasSkincare = cart.some(item => !item.isInjectable);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { ...product, qty }];
    });
  };

  const updateCartQty = (id, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
    }
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleFilter = (type, value) => {
    setActiveFilters(prev => {
      if (type === "promoOnly") return { ...prev, promoOnly: !prev.promoOnly };
      const current = prev[type] || [];
      return {
        ...prev,
        [type]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
      };
    });
  };

  const clearFilters = () => {
    setActiveFilters({ category: [], line: [], concern: [], ingredient: [], promoOnly: false });
  };

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];
    if (activeCollection) {
      result = result.filter(p => p.line === activeCollection);
    }
    if (activeFilters.category.length) result = result.filter(p => activeFilters.category.includes(p.category));
    if (activeFilters.line.length) result = result.filter(p => activeFilters.line.includes(p.line));
    if (activeFilters.concern.length) result = result.filter(p => activeFilters.concern.includes(p.concern));
    if (activeFilters.ingredient.length) result = result.filter(p => activeFilters.ingredient.includes(p.ingredient));
    if (activeFilters.promoOnly) result = result.filter(p => p.hasPromo);

    if (sortBy === "newest") result.sort((a, b) => (b.badge === "NEW" ? 1 : 0) - (a.badge === "NEW" ? 1 : 0));
    if (sortBy === "bestseller") result.sort((a, b) => b.reviews - a.reviews);
    if (sortBy === "priceLow") result.sort((a, b) => a.price - b.price);
    if (sortBy === "priceHigh") result.sort((a, b) => b.price - a.price);
    return result;
  }, [activeFilters, sortBy, activeCollection]);

  const navTo = (target, opts = {}) => {
    if (target === "pdp" && opts.product) setActiveProduct(opts.product);
    if (target === "plp" && opts.collection !== undefined) {
      setActiveCollection(opts.collection);
      clearFilters();
    }
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Shared font face
  const fontStack = "'Open Sans', 'Open Sans SemiCondensed', system-ui, sans-serif";

  return (
    <div style={{ background: COLORS.blueLight, minHeight: "100vh", fontFamily: fontStack, color: COLORS.darkGray }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap');
        body { margin: 0; }
        .obagi-cta-primary { transition: all 0.2s ease; }
        .obagi-cta-primary:hover { background: ${COLORS.physician} !important; color: white !important; }
        .obagi-cta-secondary:hover { background: ${COLORS.physician} !important; color: white !important; border-color: ${COLORS.physician} !important; }
        .obagi-product-card { transition: all 0.2s ease; }
        .obagi-product-card:hover { box-shadow: 0 4px 16px rgba(23, 36, 98, 0.08); transform: translateY(-2px); }
        .obagi-link:hover { color: ${COLORS.physician} !important; }
        .obagi-fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .obagi-pulse { animation: pulse 1s ease infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        button { font-family: inherit; cursor: pointer; }
        input { font-family: inherit; }
      `}</style>

      {/* GLOBAL HEADER */}
      <Header
        isLoggedIn={isLoggedIn}
        cartCount={cartCount}
        page={page}
        navTo={navTo}
        setShowLoginModal={setShowLoginModal}
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* PAGES */}
      <div className="obagi-fade-in" key={page + (activeCollection || "") + (activeProduct?.id || "")}>
        {page === "home" && <HomePage isLoggedIn={isLoggedIn} navTo={navTo} addToCart={addToCart} setShowLoginModal={setShowLoginModal} />}
        {page === "plp" && (
          <PLPPage
            isLoggedIn={isLoggedIn}
            navTo={navTo}
            addToCart={addToCart}
            products={filteredProducts}
            activeFilters={activeFilters}
            toggleFilter={toggleFilter}
            clearFilters={clearFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setShowLoginModal={setShowLoginModal}
            activeCollection={activeCollection}
          />
        )}
        {page === "pdp" && activeProduct && (
          <PDPPage
            isLoggedIn={isLoggedIn}
            product={activeProduct}
            navTo={navTo}
            addToCart={addToCart}
            setShowLoginModal={setShowLoginModal}
          />
        )}
        {page === "cart" && (
          <CartPage
            isLoggedIn={isLoggedIn}
            cart={cart}
            cartTotal={cartTotal}
            hasInjectable={hasInjectable}
            hasSkincare={hasSkincare}
            updateCartQty={updateCartQty}
            removeFromCart={removeFromCart}
            navTo={navTo}
            setShowLoginModal={setShowLoginModal}
          />
        )}
        {page === "offers" && (
          <OffersPage isLoggedIn={isLoggedIn} addToCart={addToCart} navTo={navTo} setShowLoginModal={setShowLoginModal} />
        )}
      </div>

      {/* FOOTER */}
      <Footer />

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onLogin={() => { setIsLoggedIn(true); setShowLoginModal(false); }} />
      )}

      {/* DEMO CONTROLS */}
      <DemoControls isLoggedIn={isLoggedIn} cartCount={cartCount} page={page} />
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================
function Header({ isLoggedIn, cartCount, page, navTo, setShowLoginModal, setIsLoggedIn }) {
  return (
    <>
      {/* Promo bar */}
      <div style={{
        background: COLORS.authority, color: "white", textAlign: "center",
        padding: "8px 14px", fontSize: 11, letterSpacing: 1.5, fontWeight: 600,
      }}>
        {isLoggedIn ? "FREE SHIPPING ON ORDERS $250+ · PRO ACCOUNT" : "PROFESSIONAL ACCOUNT REQUIRED FOR PRICING"}
      </div>

      {/* Pre-header utility */}
      <div style={{
        background: COLORS.blueLight, padding: "5px 24px",
        display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.darkGray,
      }}>
        <span style={{ display: "flex", gap: 14 }}>
          <a href="https://obagi.com" target="_blank" rel="noopener" className="obagi-link" style={{ color: COLORS.darkGray, textDecoration: "none" }}>obagi.com ↗</a>
          <span>Physician Finder</span>
        </span>
        <span style={{ display: "flex", gap: 14 }}>
          {isLoggedIn ? (
            <>
              <span style={{ color: COLORS.authority, fontWeight: 600 }}>Welcome back, Dr. Smith</span>
              <button onClick={() => setIsLoggedIn(false)} style={{
                background: "transparent", border: "none", color: COLORS.darkGray, fontSize: 11, padding: 0,
                display: "flex", alignItems: "center", gap: 4,
              }} className="obagi-link">
                <LogOut size={11} /> Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => setShowLoginModal(true)} style={{
              background: "transparent", border: "none", color: COLORS.authority, fontSize: 11, padding: 0,
              fontWeight: 600,
            }} className="obagi-link">Sign In</button>
          )}
        </span>
      </div>

      {/* Main nav */}
      <header style={{ background: "white", borderBottom: `0.5px solid ${COLORS.silver}` }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "16px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <button onClick={() => navTo("home")} style={{
            background: "transparent", border: "none", padding: 0,
            fontFamily: "Georgia, serif", fontSize: 22, letterSpacing: 4, color: COLORS.authority, fontWeight: 500,
          }}>OBAGI</button>

          <nav style={{ display: "flex", gap: 24, fontSize: 11, fontWeight: 600, letterSpacing: 1.2 }}>
            <NavLink active={page === "plp" && !activeCollectionFilter()} onClick={() => navTo("plp", { collection: null })}>SHOP</NavLink>
            <NavLink active={false} onClick={() => navTo("plp", { collection: null })}>NEW</NavLink>
            <NavLink active={page === "offers"} onClick={() => navTo("offers")}>OFFERS</NavLink>
            {isLoggedIn && <NavLink active={false} onClick={() => alert("Quick Order would open a tabular bulk order view")}>QUICK ORDER</NavLink>}
            <span style={{ color: COLORS.darkGray }}>RESOURCES ↗</span>
          </nav>

          <div style={{ display: "flex", gap: 16, alignItems: "center", color: COLORS.darkGray }}>
            <Search size={18} style={{ cursor: "pointer" }} />
            <User size={18} style={{ cursor: "pointer" }} onClick={() => !isLoggedIn && setShowLoginModal(true)} />
            <button onClick={() => navTo("cart")} style={{
              background: "transparent", border: "none", padding: 0, position: "relative",
              color: COLORS.darkGray, display: "flex", alignItems: "center",
            }}>
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -8,
                  background: COLORS.authority, color: "white", fontSize: 9, fontWeight: 700,
                  borderRadius: 99, padding: "2px 6px", minWidth: 16, textAlign: "center",
                }} className="obagi-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sub-nav: collections */}
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 24px 12px",
          display: "flex", gap: 20, fontSize: 11, color: COLORS.darkGray,
        }}>
          <span style={{ color: COLORS.inactive, fontSize: 10, letterSpacing: 1.2, fontWeight: 600 }}>SHOP BY LINE</span>
          {["Nu-Derm", "Vitamin C", "Elastiderm", "Sun Shield", "MAGIQ"].map(line => (
            <button key={line} onClick={() => navTo("plp", { collection: line })} className="obagi-link" style={{
              background: "transparent", border: "none", padding: 0, color: COLORS.darkGray, fontSize: 11,
            }}>{line}</button>
          ))}
        </div>
      </header>
    </>
  );
}

function activeCollectionFilter() { return false; }

function NavLink({ children, active, onClick }) {
  return (
    <button onClick={onClick} className="obagi-link" style={{
      background: "transparent", border: "none", padding: 0,
      color: active ? COLORS.authority : COLORS.darkGray,
      borderBottom: active ? `1.5px solid ${COLORS.authority}` : "none",
      paddingBottom: 2, fontWeight: 600, letterSpacing: 1.2, fontSize: 11,
    }}>{children}</button>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
function HomePage({ isLoggedIn, navTo, addToCart, setShowLoginModal }) {
  const featured = PRODUCTS.filter(p => p.badge === "BESTSELLER" || p.badge === "NEW").slice(0, 4);

  return (
    <main>
      {/* HERO */}
      <section style={{
        background: `linear-gradient(135deg, ${COLORS.authority} 0%, ${COLORS.physician} 100%)`,
        color: "white", padding: "64px 24px", position: "relative",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.7, fontWeight: 600 }}>
            {isLoggedIn ? "FEATURED FOR YOUR PRACTICE" : "CLINICALLY PROVEN PROFESSIONAL SKINCARE"}
          </div>
          <h1 style={{
            fontSize: 56, fontWeight: 500, lineHeight: 1.1, margin: "12px 0 0", maxWidth: 600,
            letterSpacing: -0.5,
          }}>
            {isLoggedIn ? "Trusted by Pros. Powered by science." : "The Pro standard in transformative skincare."}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.9, margin: "16px 0 0", maxWidth: 540, lineHeight: 1.5 }}>
            {isLoggedIn
              ? "New formulations, exclusive Pro pricing, and clinical resources for your practice."
              : "Professional-grade formulations for licensed skincare practitioners worldwide."}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            {isLoggedIn ? (
              <button onClick={() => navTo("plp", { collection: null })} className="obagi-cta-primary" style={primaryCTA()}>
                SHOP THE COLLECTION
              </button>
            ) : (
              <>
                <button onClick={() => alert("Request Account form would open here")} className="obagi-cta-primary" style={primaryCTA()}>
                  REQUEST ACCOUNT
                </button>
                <button onClick={() => setShowLoginModal(true)} className="obagi-cta-secondary" style={secondaryCTA()}>
                  SIGN IN
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ background: "white", padding: "32px 24px", borderBottom: `0.5px solid ${COLORS.silver}` }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center",
        }}>
          {[
            { metric: "#1", label: "Professional skincare brand" },
            { metric: "50K+", label: "Pros worldwide" },
            { metric: "60+", label: "Countries" },
            { metric: "Rx", label: "Clinically proven formulas" },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: 36, fontWeight: 600, color: COLORS.authority, lineHeight: 1 }}>{item.metric}</div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 6, letterSpacing: 0.5 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section style={{ padding: "48px 24px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600 }}>BESTSELLERS</div>
              <h2 style={{ fontSize: 32, fontWeight: 500, color: COLORS.authority, margin: "4px 0 0" }}>Featured products</h2>
            </div>
            <button onClick={() => navTo("plp", { collection: null })} className="obagi-link" style={{
              background: "transparent", border: "none", color: COLORS.authority, fontSize: 12, fontWeight: 600,
              letterSpacing: 1, display: "flex", alignItems: "center", gap: 6, padding: 0,
            }}>VIEW ALL <ArrowRight size={14} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {featured.map(p => (
              <ProductCard key={p.id} product={p} isLoggedIn={isLoggedIn} navTo={navTo} addToCart={addToCart} setShowLoginModal={setShowLoginModal} />
            ))}
          </div>
        </div>
      </section>

      {/* BECOME A PARTNER (logged out only) or ACTIVE OFFERS (logged in) */}
      {!isLoggedIn ? (
        <section style={{ background: COLORS.authority, color: "white", padding: "56px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.7, fontWeight: 600 }}>JOIN OBAGI PROFESSIONAL</div>
            <h2 style={{ fontSize: 36, fontWeight: 500, margin: "8px 0 12px" }}>Become a Partner</h2>
            <p style={{ fontSize: 14, opacity: 0.9, margin: "0 0 24px", lineHeight: 1.6 }}>
              Unlock Pro pricing, full ingredient decks, clinical resources, B&amp;A galleries, and exclusive offers for your practice.
            </p>
            <button onClick={() => alert("Request Account form would open here")} className="obagi-cta-primary" style={{
              ...primaryCTA(), background: "white", color: COLORS.authority,
            }}>REQUEST ACCOUNT</button>
          </div>
        </section>
      ) : (
        <section style={{ background: COLORS.physician, color: "white", padding: "32px 24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.7, fontWeight: 600 }}>ACTIVE OFFERS</div>
              <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}>Promotions tailored to your account</div>
            </div>
            <button onClick={() => navTo("offers")} style={{
              background: "white", color: COLORS.authority, border: "none",
              padding: "12px 24px", borderRadius: 999, fontSize: 11, letterSpacing: 1.5, fontWeight: 600,
            }}>VIEW OFFERS</button>
          </div>
        </section>
      )}

      {/* B&A SECTION */}
      <section style={{ padding: "56px 24px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600 }}>CLINICALLY PROVEN</div>
            <h2 style={{ fontSize: 32, fontWeight: 500, color: COLORS.authority, margin: "4px 0 0" }}>Real results, before and after</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: COLORS.blueLight, borderRadius: 6, overflow: "hidden" }}>
                <div style={{
                  background: `linear-gradient(to right, ${COLORS.silver} 50%, ${COLORS.blueLight} 50%)`,
                  aspectRatio: "4/3", position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                  color: COLORS.darkGray, fontSize: 11, fontWeight: 600, letterSpacing: 1,
                }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: COLORS.authority, transform: "translateX(-50%)" }}>
                    <div style={{
                      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                      background: COLORS.authority, color: "white", width: 32, height: 32, borderRadius: 99,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                    }}>⇆</div>
                  </div>
                </div>
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, color: COLORS.authority, fontWeight: 600 }}>Treatment {i}</div>
                  <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 2 }}>12-week clinical study</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NPD SECTION */}
      <section style={{ background: COLORS.blueLight, padding: "56px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600 }}>NEW PRODUCT DEVELOPMENT</div>
            <h2 style={{ fontSize: 32, fontWeight: 500, color: COLORS.authority, margin: "4px 0 0" }}>Coming soon to Pro</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: COLORS.authority, color: "white", padding: 32, borderRadius: 8 }}>
              <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1.5, fontWeight: 600 }}>LAUNCHING SOON</div>
              <div style={{ fontSize: 20, fontWeight: 500, marginTop: 8 }}>Next Pro innovation</div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {[{n: 12, l: "DAYS"}, {n: 4, l: "HRS"}, {n: 28, l: "MIN"}].map((t, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: 4,
                    textAlign: "center", minWidth: 56,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{t.n}</div>
                    <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: 1 }}>{t.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <input placeholder="Email me when available" style={{
                  flex: 1, background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.3)",
                  color: "white", padding: "10px 14px", borderRadius: 4, fontSize: 12,
                }}/>
                <button style={{
                  background: "white", color: COLORS.authority, border: "none",
                  padding: "10px 18px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                }}>NOTIFY ME</button>
              </div>
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 10 }}>↗ Klaviyo waitlist integration</div>
            </div>
            <div style={{ background: "white", padding: 32, borderRadius: 8, border: `0.5px solid ${COLORS.silver}` }}>
              <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600 }}>PRO RESOURCES</div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {["Webinars", "Training programs", "Marketing assets", "Loyalty rewards"].map(r => (
                  <div key={r} style={{
                    display: "flex", justifyContent: "space-between", padding: "12px 0",
                    borderBottom: `0.5px solid ${COLORS.blueLight}`, fontSize: 13, color: COLORS.physician, cursor: "pointer",
                  }} className="obagi-link">
                    <span>{r}</span>
                    <span style={{ color: COLORS.darkGray, fontSize: 11 }}>Business Center ↗</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 12, fontStyle: "italic" }}>
                External links to OBAGI Business Center
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ============================================================
// PLP PAGE
// ============================================================
function PLPPage({ isLoggedIn, navTo, addToCart, products, activeFilters, toggleFilter, clearFilters, sortBy, setSortBy, setShowLoginModal, activeCollection }) {
  const totalActiveFilters = activeFilters.category.length + activeFilters.line.length + activeFilters.concern.length + activeFilters.ingredient.length + (activeFilters.promoOnly ? 1 : 0);

  return (
    <main style={{ background: "white", paddingBottom: 48 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px" }}>
        {/* Breadcrumb + header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1 }}>
            SHOP / {activeCollection ? activeCollection.toUpperCase() : "ALL PRODUCTS"}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 500, color: COLORS.authority, margin: "8px 0 4px", letterSpacing: -0.3 }}>
            {activeCollection || "All products"}
          </h1>
          <div style={{ fontSize: 12, color: COLORS.darkGray }}>{products.length} products</div>
        </div>

        {/* TOP COLLECTION PROMO */}
        <div style={{
          background: `linear-gradient(90deg, ${COLORS.authority} 0%, ${COLORS.physician} 100%)`,
          color: "white", padding: "20px 24px", borderRadius: 8, marginBottom: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 1.5, fontWeight: 600 }}>FEATURED</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
              Top collection promo · configurable via metafield
            </div>
          </div>
          <button style={{
            background: "white", color: COLORS.authority, border: "none",
            padding: "10px 20px", borderRadius: 999, fontSize: 11, letterSpacing: 1, fontWeight: 600,
          }}>EXPLORE ↗</button>
        </div>

        {/* HORIZONTAL FILTER BAR */}
        <div style={{
          background: COLORS.blueLight, padding: "14px 16px", borderRadius: 8, marginBottom: 8,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginRight: 4 }}>
              <Filter size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }}/>
              FILTER
            </span>
            <FilterDropdown label="Category" options={FILTERS.category} active={activeFilters.category} onToggle={(v) => toggleFilter("category", v)} />
            <FilterDropdown label="Line" options={FILTERS.line} active={activeFilters.line} onToggle={(v) => toggleFilter("line", v)} />
            <FilterDropdown label="Concern" options={FILTERS.concern} active={activeFilters.concern} onToggle={(v) => toggleFilter("concern", v)} />
            <FilterDropdown label="Ingredient" options={FILTERS.ingredient} active={activeFilters.ingredient} onToggle={(v) => toggleFilter("ingredient", v)} />
            <button onClick={() => toggleFilter("promoOnly")} style={{
              background: activeFilters.promoOnly ? COLORS.gold : "white",
              border: `0.5px solid ${activeFilters.promoOnly ? COLORS.gold : COLORS.silver}`,
              padding: "6px 12px", borderRadius: 999, fontSize: 11, color: activeFilters.promoOnly ? COLORS.authority : COLORS.darkGray,
              fontWeight: activeFilters.promoOnly ? 600 : 400, display: "flex", alignItems: "center", gap: 4,
            }}>
              {activeFilters.promoOnly && <Tag size={10}/>} Active promotion
            </button>
            {totalActiveFilters > 0 && (
              <button onClick={clearFilters} style={{
                background: "transparent", border: "none", color: COLORS.physician,
                fontSize: 11, fontWeight: 600, padding: "6px 8px", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
              }}>
                <X size={11}/> Clear all ({totalActiveFilters})
              </button>
            )}
          </div>
        </div>

        {/* Sort + view */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 20px" }}>
          <div style={{ fontSize: 12, color: COLORS.darkGray }}>{products.length} products</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>SORT BY</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
              background: "white", border: `0.5px solid ${COLORS.silver}`, padding: "8px 12px",
              borderRadius: 999, fontSize: 12, color: COLORS.darkGray, fontFamily: "inherit",
            }}>
              <option value="bestseller">Best seller</option>
              <option value="newest">Newest</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={{
                background: "white", border: `0.5px solid ${COLORS.authority}`, padding: 8, borderRadius: 4,
                color: COLORS.authority, display: "flex",
              }}><Grid size={14}/></button>
              <button style={{
                background: "white", border: `0.5px solid ${COLORS.silver}`, padding: 8, borderRadius: 4,
                color: COLORS.darkGray, display: "flex",
              }}><ListIcon size={14}/></button>
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: COLORS.blueLight, borderRadius: 8 }}>
            <div style={{ fontSize: 16, color: COLORS.authority, fontWeight: 500 }}>No products match your filters</div>
            <button onClick={clearFilters} style={{
              ...secondaryCTA(), marginTop: 16,
            }} className="obagi-cta-secondary">CLEAR FILTERS</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {products.map((p, idx) => (
              <>
                <ProductCard key={p.id} product={p} isLoggedIn={isLoggedIn} navTo={navTo} addToCart={addToCart} setShowLoginModal={setShowLoginModal} />
                {/* In-line promo metafield at position 5 (after 4 cards) */}
                {idx === 3 && (
                  <div key="promo" style={{
                    gridColumn: "span 4",
                    background: `linear-gradient(135deg, ${COLORS.authority} 0%, ${COLORS.physician} 100%)`,
                    color: "white", padding: 32, borderRadius: 8, position: "relative", margin: "8px 0",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 1.5, fontWeight: 600 }}>SPECIAL FEATURE</div>
                        <div style={{ fontSize: 22, fontWeight: 500, marginTop: 6 }}>In-line promo metafield</div>
                        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Image · video · text · CTAs · placement selector</div>
                      </div>
                      <button style={{
                        background: "white", color: COLORS.authority, border: "none",
                        padding: "12px 24px", borderRadius: 999, fontSize: 11, letterSpacing: 1, fontWeight: 600,
                      }}>EXPLORE ↗</button>
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>
        )}

        {/* BECOME A PARTNER (logged out) */}
        {!isLoggedIn && (
          <div style={{
            background: COLORS.authority, color: "white", padding: "40px 24px", borderRadius: 8,
            textAlign: "center", marginTop: 32,
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.7, fontWeight: 600 }}>UNLOCK PRO PRICING</div>
            <h3 style={{ fontSize: 28, fontWeight: 500, margin: "8px 0 16px" }}>Become a Partner</h3>
            <button onClick={() => alert("Request Account form would open here")} style={{
              ...primaryCTA(), background: "white", color: COLORS.authority,
            }} className="obagi-cta-primary">REQUEST ACCOUNT</button>
          </div>
        )}
      </div>
    </main>
  );
}

function FilterDropdown({ label, options, active, onToggle }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: active.length > 0 ? COLORS.authority : "white",
        color: active.length > 0 ? "white" : COLORS.darkGray,
        border: `0.5px solid ${active.length > 0 ? COLORS.authority : COLORS.silver}`,
        padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: active.length > 0 ? 600 : 400,
        display: "flex", alignItems: "center", gap: 4,
      }}>
        {label} {active.length > 0 && `(${active.length})`} <ChevronDown size={10}/>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }}/>
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 51,
            background: "white", border: `0.5px solid ${COLORS.silver}`, borderRadius: 6,
            boxShadow: "0 4px 16px rgba(23, 36, 98, 0.1)", minWidth: 200, padding: 8,
          }}>
            {options.map(opt => (
              <label key={opt} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                fontSize: 12, color: COLORS.darkGray, cursor: "pointer", borderRadius: 4,
              }}>
                <input type="checkbox" checked={active.includes(opt)} onChange={() => onToggle(opt)}/>
                {opt}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// PRODUCT CARD
// ============================================================
function ProductCard({ product, isLoggedIn, navTo, addToCart, setShowLoginModal }) {
  const [qty, setQty] = useState(1);

  return (
    <div className="obagi-product-card" style={{
      background: "white", border: `0.5px solid ${COLORS.blueLight}`, borderRadius: 6,
      padding: 14, position: "relative", display: "flex", flexDirection: "column",
    }}>
      {product.badge && (
        <span style={{
          position: "absolute", top: 8, right: 8, zIndex: 2,
          background: product.hasPromo ? COLORS.gold : COLORS.authority,
          color: product.hasPromo ? COLORS.authority : "white",
          fontSize: 9, padding: "3px 7px", letterSpacing: 0.5, fontWeight: 600,
        }}>{product.hasPromo ? "PROMO" : product.badge}</span>
      )}
      <button onClick={() => navTo("pdp", { product })} style={{
        background: "transparent", border: "none", padding: 0, cursor: "pointer",
      }}>
        <div style={{
          background: COLORS.blueLight, aspectRatio: "1/1", borderRadius: 4, marginBottom: 10,
          display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inactive, fontSize: 10,
        }}>
          [Product image]
        </div>
      </button>
      <div style={{ fontSize: 9, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>{product.line.toUpperCase()}</div>
      <button onClick={() => navTo("pdp", { product })} style={{
        background: "transparent", border: "none", padding: 0, textAlign: "left", cursor: "pointer",
        fontSize: 13, color: COLORS.authority, fontWeight: 500, marginTop: 2,
      }}>{product.name}</button>
      <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ color: COLORS.gold, fontSize: 11 }}>{"★".repeat(Math.round(product.rating))}</span>
        <span style={{ fontSize: 10, color: COLORS.darkGray }}>{product.rating} ({product.reviews})</span>
      </div>

      {isLoggedIn ? (
        <>
          <div style={{ fontSize: 14, color: COLORS.authority, fontWeight: 600, marginTop: 8 }}>${product.price.toFixed(2)}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", border: `0.5px solid ${COLORS.silver}`, borderRadius: 4 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={qtyBtn()}><Minus size={10}/></button>
              <span style={{ padding: "0 8px", fontSize: 11, borderLeft: `0.5px solid ${COLORS.silver}`, borderRight: `0.5px solid ${COLORS.silver}` }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={qtyBtn()}><Plus size={10}/></button>
            </div>
            <button onClick={() => { addToCart(product, qty); setQty(1); }} className="obagi-cta-primary" style={{
              flex: 1, background: COLORS.authority, color: "white", border: "none",
              padding: "8px", borderRadius: 999, fontSize: 10, letterSpacing: 1, fontWeight: 600,
            }}>ADD</button>
          </div>
        </>
      ) : (
        <button onClick={() => setShowLoginModal(true)} style={{
          marginTop: 10, padding: 10, background: COLORS.blueLight, border: "none", borderRadius: 4,
          fontSize: 10, color: COLORS.physician, fontWeight: 600, letterSpacing: 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Lock size={11}/> SIGN IN FOR PRICE
        </button>
      )}
    </div>
  );
}

function qtyBtn() {
  return {
    background: "transparent", border: "none", padding: "6px 8px",
    color: COLORS.darkGray, display: "flex", alignItems: "center",
  };
}

// ============================================================
// PDP PAGE
// ============================================================
function PDPPage({ isLoggedIn, product, navTo, addToCart, setShowLoginModal }) {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("ingredients");
  const [activeImage, setActiveImage] = useState(0);

  return (
    <main style={{ background: "white", paddingBottom: 48 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, marginBottom: 24 }}>
          <button onClick={() => navTo("home")} style={linkBtn()}>HOME</button> / <button onClick={() => navTo("plp", { collection: null })} style={linkBtn()}>SHOP</button> / <button onClick={() => navTo("plp", { collection: product.line })} style={linkBtn()}>{product.line.toUpperCase()}</button> / <span>{product.name.toUpperCase()}</span>
        </div>

        {/* Hero: gallery + buy box */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }}>
          {/* Exposed gallery */}
          <div>
            <div style={{
              background: COLORS.blueLight, aspectRatio: "1/1", borderRadius: 8, position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inactive, fontSize: 13,
            }}>
              <span style={{
                position: "absolute", top: 16, left: 16, background: COLORS.authority, color: "white",
                fontSize: 10, padding: "4px 8px", fontWeight: 600, letterSpacing: 1,
              }}>PRO</span>
              [Hero product image]
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 8 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <button key={i} onClick={() => setActiveImage(i)} style={{
                  background: COLORS.blueLight, aspectRatio: "1/1", border: activeImage === i ? `1.5px solid ${COLORS.authority}` : `0.5px solid ${COLORS.silver}`,
                  borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: COLORS.darkGray,
                }}>
                  {i === 0 ? "▶ Video" : i === 4 ? "B&A" : `Img ${i}`}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: COLORS.darkGray, marginTop: 8, fontStyle: "italic" }}>
              Exposed gallery (OneSkin reference style)
            </div>
          </div>

          {/* Buy box */}
          <div>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>{product.line.toUpperCase()}</div>
            <h1 style={{ fontSize: 32, fontWeight: 500, color: COLORS.authority, margin: "6px 0 8px", letterSpacing: -0.3 }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: COLORS.gold, fontSize: 14 }}>{"★".repeat(Math.round(product.rating))}</span>
              <span style={{ fontSize: 12, color: COLORS.darkGray }}>{product.rating} ({product.reviews} Pro reviews)</span>
            </div>

            {isLoggedIn ? (
              <>
                <div style={{ marginTop: 20, padding: 16, background: COLORS.blueLight, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>PRO PRICE</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.authority, marginTop: 4 }}>
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ marginTop: 16, fontSize: 12, color: COLORS.darkGray }}>
                  <strong style={{ color: COLORS.authority }}>Size:</strong> {product.size}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: COLORS.darkGray, display: "flex", alignItems: "center", gap: 12 }}>
                  <strong style={{ color: COLORS.authority }}>QTY:</strong>
                  <div style={{ display: "flex", alignItems: "center", border: `0.5px solid ${COLORS.silver}`, borderRadius: 4 }}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} style={qtyBtn()}><Minus size={12}/></button>
                    <span style={{ padding: "0 14px", fontSize: 13, borderLeft: `0.5px solid ${COLORS.silver}`, borderRight: `0.5px solid ${COLORS.silver}` }}>{qty}</span>
                    <button onClick={() => setQty(qty + 1)} style={qtyBtn()}><Plus size={12}/></button>
                  </div>
                </div>
                <button onClick={() => { addToCart(product, qty); setQty(1); }} className="obagi-cta-primary" style={{
                  ...primaryCTA(), width: "100%", marginTop: 20, background: COLORS.authority, color: "white",
                }}>ADD TO BAG</button>
                {product.isInjectable && (
                  <div style={{
                    marginTop: 12, padding: 12, background: "#FFF8E5", border: `0.5px solid ${COLORS.gold}`, borderRadius: 4,
                    display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: COLORS.darkGray,
                  }}>
                    <Truck size={16} color={COLORS.authority}/>
                    <div>
                      <strong style={{ color: COLORS.authority }}>Injectable shipping</strong> — 2-day air, signature required, packaged separately from skincare items
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: 20, padding: 20, background: COLORS.blueLight, borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>PRO PRICING</div>
                <div style={{ fontSize: 13, color: COLORS.authority, marginTop: 8, fontWeight: 500 }}>Sign in to view your account price</div>
                <button onClick={() => setShowLoginModal(true)} className="obagi-cta-primary" style={{
                  ...primaryCTA(), background: COLORS.authority, color: "white", width: "100%", marginTop: 14,
                }}>SIGN IN</button>
                <button onClick={() => alert("Request Account form would open here")} className="obagi-cta-secondary" style={{
                  ...secondaryCTA(), width: "100%", marginTop: 8,
                }}>REQUEST ACCOUNT</button>
              </div>
            )}

            {/* Best for */}
            <div style={{ marginTop: 24, padding: 14, background: COLORS.blueLight, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600 }}>BEST FOR</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ background: COLORS.authority, color: "white", fontSize: 10, padding: "4px 10px", borderRadius: 999 }}>{product.concern}</span>
                <span style={{ background: COLORS.authority, color: "white", fontSize: 10, padding: "4px 10px", borderRadius: 999 }}>Fine Lines</span>
                <span style={{ background: COLORS.authority, color: "white", fontSize: 10, padding: "4px 10px", borderRadius: 999 }}>Uneven Tone</span>
              </div>
              <div style={{ fontSize: 10, color: COLORS.darkGray, marginTop: 8 }}>
                <strong>SKIN TYPES</strong> · Oily · Combination · Normal
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: `0.5px solid ${COLORS.silver}`, marginBottom: 24 }}>
          {[
            { id: "ingredients", label: "INGREDIENTS" },
            { id: "clinicals", label: "CLINICALS" },
            { id: "usage", label: "HOW TO USE" },
            { id: "safety", label: "SAFETY" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "14px 20px", background: "transparent", border: "none",
              fontSize: 12, letterSpacing: 1.2, fontWeight: 600,
              color: activeTab === tab.id ? COLORS.authority : COLORS.darkGray,
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.authority}` : "none",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div style={{ minHeight: 200, marginBottom: 32 }}>
          {activeTab === "ingredients" && (
            <div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>FULL INGREDIENT DECK</div>
              <div style={{
                background: COLORS.blueLight, padding: 20, borderRadius: 6,
                fontFamily: "ui-monospace, monospace", fontSize: 12, color: COLORS.darkGray, lineHeight: 1.7,
              }}>
                Aqua/Water, {product.ingredient}, OBAGI Penetrating Therapeutics™ (Proprietary Complex), Glycerin, Propylene Glycol, Sodium PCA, Tocopheryl Acetate, Allantoin, Citric Acid, Phenoxyethanol...
              </div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 8, fontStyle: "italic" }}>
                Metafield-driven · proprietary complex naming defined by OBAGI
              </div>
            </div>
          )}
          {activeTab === "clinicals" && (
            <div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>WHY IT WORKS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { stat: "87%", label: "showed improvement in 12 weeks" },
                  { stat: "94%", label: "saw smoother texture" },
                  { stat: "76%", label: "reported brighter skin" },
                ].map((c, i) => (
                  <div key={i} style={{ padding: 24, background: COLORS.blueLight, borderRadius: 6 }}>
                    <div style={{ fontSize: 36, fontWeight: 600, color: COLORS.authority }}>{c.stat}</div>
                    <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 6 }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "usage" && (
            <div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>HOW TO USE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                <div style={{ background: COLORS.blueLight, aspectRatio: "1/1", borderRadius: 6 }}/>
                <div style={{ padding: 16 }}>
                  <ol style={{ paddingLeft: 20, fontSize: 13, color: COLORS.darkGray, lineHeight: 1.8 }}>
                    <li>Cleanse skin thoroughly before application</li>
                    <li>Apply 2-3 drops to face and neck, morning and evening</li>
                    <li>Gently massage until fully absorbed</li>
                    <li>Follow with moisturizer and SPF (AM)</li>
                  </ol>
                  <div style={{ fontSize: 10, color: COLORS.darkGray, marginTop: 12, fontStyle: "italic" }}>
                    Lock-up: media + text · metafield-driven · layout flexibility TBD
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "safety" && (
            <div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>SAFETY INFORMATION</div>
              <div style={{ padding: 20, background: COLORS.blueLight, borderRadius: 6, fontSize: 13, color: COLORS.darkGray, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.authority }}>For professional use.</strong> Patch test recommended before first use. Avoid contact with eyes. If irritation occurs, discontinue use. Keep out of reach of children. Store at room temperature. Do not use on broken or damaged skin. Consult Pro guidelines for combination with other actives.
              </div>
            </div>
          )}
        </div>

        {/* B&A SLIDER */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600, marginBottom: 12 }}>CLINICALLY PROVEN — BEFORE & AFTER</div>
          <div style={{
            background: `linear-gradient(to right, ${COLORS.silver} 50%, ${COLORS.blueLight} 50%)`,
            aspectRatio: "16/6", borderRadius: 8, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: COLORS.authority, transform: "translateX(-50%)" }}>
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                background: COLORS.authority, color: "white", width: 44, height: 44, borderRadius: 99,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>⇆</div>
            </div>
            <span style={{ position: "absolute", left: 16, top: 16, background: "rgba(255,255,255,0.95)", padding: "6px 12px", fontSize: 11, color: COLORS.authority, fontWeight: 600 }}>BEFORE</span>
            <span style={{ position: "absolute", right: 16, top: 16, background: "rgba(255,255,255,0.95)", padding: "6px 12px", fontSize: 11, color: COLORS.authority, fontWeight: 600 }}>AFTER 12 WEEKS</span>
          </div>
        </div>

        {/* VIDEO MODULE */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600, marginBottom: 12 }}>USAGE & TEXTURE</div>
          <div style={{
            background: COLORS.authority, aspectRatio: "16/6", borderRadius: 8, position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 99, background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, cursor: "pointer",
            }}>▶</div>
            <span style={{ position: "absolute", bottom: 16, left: 20, fontSize: 10, opacity: 0.7 }}>
              Standalone video · independent mobile/desktop specs · text overlays + CTAs
            </span>
          </div>
        </div>

        {/* REVIEWS */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600, marginBottom: 12 }}>PRO REVIEWS · NATIVE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { stars: 5, name: "Dr. M. Chen, MD", text: "Holy grail for my clinical practice. Patients see results in 6 weeks." },
                { stars: 5, name: "Sarah R., LE", text: "Has transformed my facial protocols. Recommending to every client." },
                { stars: 4, name: "Dr. A. Patel", text: "Very effective for melasma cases. Pairs well with Nu-Derm system." },
              ].map((r, i) => (
                <div key={i} style={{ padding: 14, background: "white", border: `0.5px solid ${COLORS.blueLight}`, borderRadius: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ color: COLORS.gold, fontSize: 12 }}>{"★".repeat(r.stars)}</span>
                    <span style={{ fontSize: 10, color: COLORS.darkGray, fontWeight: 600 }}>{r.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.darkGray, fontStyle: "italic" }}>"{r.text}"</div>
                </div>
              ))}
            </div>
            {isLoggedIn && (
              <button className="obagi-cta-secondary" style={{ ...secondaryCTA(), marginTop: 12 }}>WRITE A REVIEW</button>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600, marginBottom: 12 }}>D2C SELL-THROUGH</div>
            <div style={{ background: COLORS.blueLight, padding: 24, borderRadius: 6, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 600, color: COLORS.authority }}>★ {product.rating}</div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 4 }}>{product.reviews} D2C reviews</div>
              <div style={{ fontSize: 10, color: COLORS.darkGray, marginTop: 6, fontStyle: "italic" }}>Curated as testimonials</div>
            </div>
          </div>
        </div>

        {/* FUTURE FLAG */}
        <div style={{ marginTop: 32, padding: 16, background: COLORS.blueLight, borderRadius: 6, fontSize: 11, color: COLORS.darkGray, fontStyle: "italic" }}>
          ↗ FUTURE (not in Phase 2 scope): Shop the Regimen multi-product modules · Pro-UGC carousels
        </div>
      </div>
    </main>
  );
}

function linkBtn() {
  return { background: "transparent", border: "none", padding: 0, color: COLORS.darkGray, fontSize: 11, letterSpacing: 1, cursor: "pointer", fontFamily: "inherit" };
}

// ============================================================
// CART PAGE
// ============================================================
function CartPage({ isLoggedIn, cart, cartTotal, hasInjectable, hasSkincare, updateCartQty, removeFromCart, navTo, setShowLoginModal }) {
  if (!isLoggedIn) {
    return (
      <main style={{ background: "white", padding: "64px 24px", minHeight: 400 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <Lock size={32} color={COLORS.authority}/>
          <h2 style={{ fontSize: 24, color: COLORS.authority, fontWeight: 500, marginTop: 16 }}>Sign in to view your cart</h2>
          <p style={{ fontSize: 13, color: COLORS.darkGray, marginTop: 8, lineHeight: 1.6 }}>
            Pro account required for ordering and pricing.
          </p>
          <button onClick={() => setShowLoginModal(true)} className="obagi-cta-primary" style={{ ...primaryCTA(), background: COLORS.authority, color: "white", marginTop: 20 }}>
            SIGN IN
          </button>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main style={{ background: "white", padding: "64px 24px", minHeight: 400 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <ShoppingBag size={32} color={COLORS.authority}/>
          <h2 style={{ fontSize: 24, color: COLORS.authority, fontWeight: 500, marginTop: 16 }}>Your bag is empty</h2>
          <button onClick={() => navTo("plp", { collection: null })} className="obagi-cta-primary" style={{ ...primaryCTA(), background: COLORS.authority, color: "white", marginTop: 20 }}>
            CONTINUE SHOPPING
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "white", padding: "32px 24px", minHeight: 400 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, color: COLORS.authority, fontWeight: 500, marginBottom: 24 }}>Your bag</h1>

        {/* SPLIT FULFILLMENT NOTICE */}
        {hasInjectable && hasSkincare && (
          <div style={{
            background: "#FFF8E5", border: `0.5px solid ${COLORS.gold}`, padding: 20, borderRadius: 8,
            marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-start",
          }}>
            <Truck size={24} color={COLORS.authority} style={{ flexShrink: 0, marginTop: 2 }}/>
            <div>
              <div style={{ fontSize: 13, color: COLORS.authority, fontWeight: 600, letterSpacing: 0.5 }}>SPLIT SHIPMENT NOTICE</div>
              <div style={{ fontSize: 12, color: COLORS.darkGray, marginTop: 6, lineHeight: 1.6 }}>
                Your order contains items requiring different shipping methods. <strong style={{ color: COLORS.authority }}>Injectables</strong> ship 2-day air with signature required (separate package). <strong style={{ color: COLORS.authority }}>Skincare items</strong> ship ground. You'll see one unified order — fulfillment is split on the back end.
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
          {/* Cart items */}
          <div>
            {/* Group by type */}
            {hasInjectable && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: COLORS.authority, letterSpacing: 1, fontWeight: 600 }}>INJECTABLES</span>
                  <span style={{ fontSize: 10, color: COLORS.darkGray, background: COLORS.blueLight, padding: "2px 8px", borderRadius: 999 }}>2-day air · signature</span>
                </div>
                {cart.filter(i => i.isInjectable).map(item => (
                  <CartItem key={item.id} item={item} updateCartQty={updateCartQty} removeFromCart={removeFromCart} />
                ))}
              </div>
            )}
            {hasSkincare && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: COLORS.authority, letterSpacing: 1, fontWeight: 600 }}>SKINCARE</span>
                  <span style={{ fontSize: 10, color: COLORS.darkGray, background: COLORS.blueLight, padding: "2px 8px", borderRadius: 999 }}>Ground shipping</span>
                </div>
                {cart.filter(i => !i.isInjectable).map(item => (
                  <CartItem key={item.id} item={item} updateCartQty={updateCartQty} removeFromCart={removeFromCart} />
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div style={{ background: COLORS.blueLight, padding: 24, borderRadius: 8 }}>
              <h3 style={{ fontSize: 18, color: COLORS.authority, fontWeight: 500, margin: "0 0 16px" }}>Order summary</h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.darkGray, marginBottom: 8 }}>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.darkGray, marginBottom: 8 }}>
                <span>Shipping</span>
                <span>{cartTotal >= 250 ? <span style={{ color: COLORS.physician, fontWeight: 600 }}>FREE</span> : "Calculated at checkout"}</span>
              </div>
              <div style={{ borderTop: `0.5px solid ${COLORS.silver}`, marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 16, color: COLORS.authority, fontWeight: 600 }}>
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => alert("Checkout flow would start here. Payment captured in BigCommerce → order recorded in Velocity → split fulfillment routing applied.")} className="obagi-cta-primary" style={{
                ...primaryCTA(), background: COLORS.authority, color: "white", width: "100%", marginTop: 20,
              }}>CHECKOUT</button>
              <button onClick={() => navTo("plp", { collection: null })} style={{
                background: "transparent", border: "none", color: COLORS.physician, fontSize: 12, fontWeight: 600,
                width: "100%", marginTop: 12, padding: 8,
              }}>← Continue shopping</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function CartItem({ item, updateCartQty, removeFromCart }) {
  return (
    <div style={{
      display: "flex", gap: 16, padding: 16, background: "white",
      border: `0.5px solid ${COLORS.blueLight}`, borderRadius: 6, marginBottom: 8, alignItems: "center",
    }}>
      <div style={{ width: 80, height: 80, background: COLORS.blueLight, borderRadius: 4, flexShrink: 0 }}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>{item.line.toUpperCase()}</div>
        <div style={{ fontSize: 14, color: COLORS.authority, fontWeight: 500, marginTop: 2 }}>{item.name}</div>
        <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 2 }}>{item.size}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", border: `0.5px solid ${COLORS.silver}`, borderRadius: 4 }}>
        <button onClick={() => updateCartQty(item.id, item.qty - 1)} style={qtyBtn()}><Minus size={12}/></button>
        <span style={{ padding: "0 12px", fontSize: 13, borderLeft: `0.5px solid ${COLORS.silver}`, borderRight: `0.5px solid ${COLORS.silver}` }}>{item.qty}</span>
        <button onClick={() => updateCartQty(item.id, item.qty + 1)} style={qtyBtn()}><Plus size={12}/></button>
      </div>
      <div style={{ fontSize: 14, color: COLORS.authority, fontWeight: 600, minWidth: 80, textAlign: "right" }}>
        ${(item.price * item.qty).toFixed(2)}
      </div>
      <button onClick={() => removeFromCart(item.id)} style={{
        background: "transparent", border: "none", color: COLORS.darkGray, padding: 4,
      }}><X size={16}/></button>
    </div>
  );
}

// ============================================================
// OFFERS PAGE
// ============================================================
function OffersPage({ isLoggedIn, addToCart, navTo, setShowLoginModal }) {
  const offers = [
    { id: "o1", title: "Buy 5, Save 15%", desc: "On any Vitamin C line products", products: PRODUCTS.filter(p => p.line === "Vitamin C").slice(0, 3), code: "PRO15" },
    { id: "o2", title: "Free Shipping on $250+", desc: "Always-on for Pro accounts", products: [], code: null },
    { id: "o3", title: "Bundle Bonus", desc: "Pair Nu-Derm + Sun Shield, save $25", products: [PRODUCTS[0], PRODUCTS[4]], code: "BUNDLE25" },
  ];

  return (
    <main style={{ background: "white", padding: "32px 24px", paddingBottom: 64 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>SHOP / OFFERS</div>
          <h1 style={{ fontSize: 36, color: COLORS.authority, fontWeight: 500, margin: "8px 0 4px", letterSpacing: -0.3 }}>Active offers</h1>
          <div style={{ fontSize: 12, color: COLORS.darkGray }}>Promotions and bonuses for Pro accounts · No discounts language per OBAGI brand guidelines</div>
        </div>

        {!isLoggedIn && (
          <div style={{
            background: COLORS.blueLight, padding: 20, borderRadius: 8, marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13, color: COLORS.authority, fontWeight: 600 }}>Some offers vary by customer group</div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 4 }}>Sign in to see your account-specific offers</div>
            </div>
            <button onClick={() => setShowLoginModal(true)} className="obagi-cta-primary" style={{
              ...primaryCTA(), background: COLORS.authority, color: "white",
            }}>SIGN IN</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {offers.map(offer => (
            <div key={offer.id} style={{
              background: "white", border: `0.5px solid ${COLORS.silver}`, borderRadius: 8, overflow: "hidden",
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${COLORS.authority} 0%, ${COLORS.physician} 100%)`,
                color: "white", padding: 24,
              }}>
                <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1.5, fontWeight: 600 }}>OFFER</div>
                <h3 style={{ fontSize: 22, fontWeight: 500, margin: "6px 0 4px" }}>{offer.title}</h3>
                <div style={{ fontSize: 12, opacity: 0.9 }}>{offer.desc}</div>
                {offer.code && (
                  <div style={{
                    marginTop: 12, padding: "6px 12px", background: "rgba(255,255,255,0.15)",
                    borderRadius: 4, fontSize: 11, fontFamily: "monospace", display: "inline-block",
                  }}>CODE: {offer.code}</div>
                )}
              </div>
              {offer.products.length > 0 && (
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>INCLUDED PRODUCTS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {offer.products.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `0.5px solid ${COLORS.blueLight}` }}>
                        <div>
                          <div style={{ fontSize: 9, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>{p.line.toUpperCase()}</div>
                          <div style={{ fontSize: 12, color: COLORS.authority }}>{p.name}</div>
                        </div>
                        {isLoggedIn && (
                          <div style={{ fontSize: 12, color: COLORS.authority, fontWeight: 600 }}>${p.price.toFixed(2)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  {isLoggedIn && (
                    <button onClick={() => {
                      offer.products.forEach(p => addToCart(p, offer.id === "o1" ? 5 : 1));
                      alert(`Added to cart with code ${offer.code} · This is the "auto-add promo" pending dev confirmation in spec 4.4`);
                    }} className="obagi-cta-primary" style={{
                      ...primaryCTA(), background: COLORS.authority, color: "white", width: "100%", marginTop: 12,
                    }}>ADD TO BAG</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 16, background: COLORS.blueLight, borderRadius: 6, fontSize: 11, color: COLORS.darkGray, fontStyle: "italic" }}>
          ⚠ PENDING DEV (spec 4.4): "Add CTA promo directly to cart" — auto-add 5 products + apply coupon when clicked
        </div>
      </div>
    </main>
  );
}

// ============================================================
// LOGIN MODAL
// ============================================================
function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState("dr.smith@practice.com");
  const [password, setPassword] = useState("••••••••");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(23, 36, 98, 0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "white", borderRadius: 8, padding: 32, maxWidth: 420, width: "100%",
        boxShadow: "0 16px 48px rgba(23, 36, 98, 0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, letterSpacing: 4, color: COLORS.authority, fontWeight: 500 }}>OBAGI</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: COLORS.darkGray, padding: 4 }}>
            <X size={18}/>
          </button>
        </div>
        <h2 style={{ fontSize: 22, color: COLORS.authority, fontWeight: 500, margin: "8px 0 6px" }}>Sign in</h2>
        <div style={{ fontSize: 12, color: COLORS.darkGray, marginBottom: 20 }}>Welcome to OBAGI Professional</div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>EMAIL</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{
            width: "100%", padding: 12, border: `0.5px solid ${COLORS.silver}`, borderRadius: 4,
            fontSize: 13, marginTop: 4, fontFamily: "inherit", boxSizing: "border-box",
          }}/>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>PASSWORD</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{
            width: "100%", padding: 12, border: `0.5px solid ${COLORS.silver}`, borderRadius: 4,
            fontSize: 13, marginTop: 4, fontFamily: "inherit", boxSizing: "border-box",
          }}/>
        </div>
        <button onClick={onLogin} className="obagi-cta-primary" style={{
          ...primaryCTA(), background: COLORS.authority, color: "white", width: "100%",
        }}>SIGN IN</button>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: COLORS.darkGray }}>
          Don't have a Pro account?{" "}
          <button style={{ background: "transparent", border: "none", color: COLORS.physician, fontWeight: 600, padding: 0 }}>
            Request Account
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 14, padding: 8, background: COLORS.blueLight, borderRadius: 4, fontSize: 10, color: COLORS.darkGray }}>
          🎯 POC: any credentials will sign you in
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer style={{ background: COLORS.blueLight, marginTop: 48, padding: "48px 24px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 14, color: COLORS.authority, fontWeight: 600 }}>Stay up to date with Obagi.</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input placeholder="Enter email address" style={{
                flex: 1, padding: 10, border: `0.5px solid ${COLORS.silver}`, fontSize: 12, background: "white", borderRadius: 4,
              }}/>
              <button style={{ background: COLORS.authority, color: "white", border: "none", padding: "10px 14px", borderRadius: 4 }}>
                <ArrowRight size={14}/>
              </button>
            </div>
            <div style={{ fontSize: 10, color: COLORS.darkGray, marginTop: 12 }}>#ObagiObsessed</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginTop: 8 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: COLORS.silver, aspectRatio: "1/1", borderRadius: 2 }}/>
              ))}
            </div>
          </div>
          {[
            { title: "About", links: ["Our Science", "Our Story", "SkinclusionMD"] },
            { title: "Partners", links: ["Obagi Professional", "International Partners", "Authorized Retailers"] },
            { title: "Resources", links: ["Physician Finder", "Skin Analyzer", "Skincare 101"] },
            { title: "Help", links: ["FAQs", "Order Status", "Promotions", "Returns"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, color: COLORS.authority, letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>{col.title.toUpperCase()}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize: 12, color: COLORS.darkGray, marginBottom: 6, cursor: "pointer" }} className="obagi-link">{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          borderTop: `0.5px solid ${COLORS.silver}`, paddingTop: 16,
          display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.darkGray,
        }}>
          <div style={{ fontFamily: "Georgia, serif", letterSpacing: 3, color: COLORS.authority, fontWeight: 500, fontSize: 11 }}>
            OBAGI <span style={{ fontSize: 8, marginLeft: 4 }}>PROFESSIONAL</span>
          </div>
          <div>©2026 Obagi Cosmeceuticals LLC. All rights reserved. OBS.02313.USA.16</div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// CTAs (style helpers)
// ============================================================
function primaryCTA() {
  return {
    background: "white", color: COLORS.authority, border: "none",
    padding: "12px 28px", borderRadius: 999, fontSize: 11, letterSpacing: 1.5, fontWeight: 600,
    fontFamily: "inherit", cursor: "pointer",
  };
}
function secondaryCTA() {
  return {
    background: "transparent", color: COLORS.authority, border: `0.5px solid ${COLORS.authority}`,
    padding: "12px 28px", borderRadius: 999, fontSize: 11, letterSpacing: 1.5, fontWeight: 600,
    fontFamily: "inherit", cursor: "pointer",
  };
}

// ============================================================
// DEMO CONTROLS (floating helper for demo)
// ============================================================
function DemoControls({ isLoggedIn, cartCount, page }) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        position: "fixed", bottom: 16, right: 16, background: COLORS.authority, color: "white",
        border: "none", padding: 10, borderRadius: 99, zIndex: 90,
        boxShadow: "0 4px 16px rgba(23, 36, 98, 0.3)",
      }}><Eye size={16}/></button>
    );
  }
  return (
    <div style={{
      position: "fixed", bottom: 16, right: 16, background: "white",
      border: `0.5px solid ${COLORS.silver}`, borderRadius: 8, padding: 12,
      fontSize: 11, color: COLORS.darkGray, zIndex: 90, minWidth: 180,
      boxShadow: "0 4px 16px rgba(23, 36, 98, 0.15)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: COLORS.authority, fontWeight: 600, letterSpacing: 1 }}>POC STATUS</span>
        <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: COLORS.darkGray, padding: 0 }}>
          <X size={12}/>
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span>Auth:</span>
        <span style={{ color: isLoggedIn ? COLORS.physician : COLORS.darkGray, fontWeight: 600 }}>
          {isLoggedIn ? "LOGGED IN" : "LOGGED OUT"}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span>Page:</span>
        <span style={{ color: COLORS.authority, fontWeight: 600, textTransform: "uppercase" }}>{page}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Cart:</span>
        <span style={{ color: COLORS.authority, fontWeight: 600 }}>{cartCount} items</span>
      </div>
    </div>
  );
}
