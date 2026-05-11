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
  const [page, setPage] = useState("landing");
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

      {/* LANDING and LOGIN are standalone (no shared header/footer) */}
      {page === "landing" && (
        <ProLanding navTo={navTo} />
      )}
      {page === "login" && (
        <LoginPage
          navTo={navTo}
          onLogin={() => { setIsLoggedIn(true); setPage("home"); window.scrollTo({ top: 0 }); }}
        />
      )}

      {/* STOREFRONT pages share header + footer */}
      {!["landing", "login"].includes(page) && (
        <>
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
        </>
      )}

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
              <button onClick={() => { setIsLoggedIn(false); navTo("landing"); }} style={{
                background: "transparent", border: "none", color: COLORS.darkGray, fontSize: 11, padding: 0,
                display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
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
              position: "relative",
            }}>
              {activeFilters.promoOnly && <Tag size={10}/>} Active promotion
              <span style={{
                background: COLORS.gold, color: COLORS.authority, fontSize: 8, fontWeight: 700,
                padding: "1px 4px", borderRadius: 99, marginLeft: 2,
              }} title="BigC: not native — requires custom JS or Searchanise/Boost app">⚙</span>
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
                    <BigCNote
                      label="PLACEMENT SELECTOR"
                      note="Spec: 'decide PLP grid position (e.g. position 3)'. NOT native to BigC — requires custom JS reading a metafield + repositioning, OR a page builder app (PageFly). PENDING DEV CONFIRMATION. Cheaper alternative: hardcoded position."
                      position="right"
                    />
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
// PDP PAGE — conditional template based on isInjectable
// ============================================================
function PDPPage({ isLoggedIn, product, navTo, addToCart, setShowLoginModal }) {
  const [qty, setQty] = useState(1);

  // CONDITIONAL: injectables get the medical/clinical format
  // (mirroring current obagi.com/saypha PDP structure)
  // skincare gets the modern spec 4.3 format (B&A, video, reviews, etc.)
  if (product.isInjectable) {
    return <PDPInjectable isLoggedIn={isLoggedIn} product={product} navTo={navTo} addToCart={addToCart} setShowLoginModal={setShowLoginModal} qty={qty} setQty={setQty} />;
  }
  return <PDPSkincare isLoggedIn={isLoggedIn} product={product} navTo={navTo} addToCart={addToCart} setShowLoginModal={setShowLoginModal} qty={qty} setQty={setQty} />;
}

// ============================================================
// PDP — INJECTABLE FORMAT (matches current obagi.com/saypha)
// Editorial headings, stacked sections in #F3F6FD, no B&A, no reviews
// ============================================================
function PDPInjectable({ isLoggedIn, product, navTo, addToCart, setShowLoginModal, qty, setQty }) {
  return (
    <main style={{ background: "white", paddingBottom: 48 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
        {/* TEMPLATE INDICATOR — only visible in POC */}
        <BigCNote
          label="INJECTABLE PDP TEMPLATE"
          note="This PDP uses the medical/clinical format mirroring current obagi.com/saypha. Triggered by product.custom_fields.is_injectable in Stencil. Spec sections that DO NOT apply here: B&A slider, Pro reviews, video module, 'Best for' tags. PENDING DECISION: Does OBAGI Legal approve B&A or reviews on injectable PDPs?"
        />

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, marginBottom: 24 }}>
          <button onClick={() => navTo("home")} style={linkBtn()}>HOME</button> / <button onClick={() => navTo("plp", { collection: null })} style={linkBtn()}>SHOP</button> / <button onClick={() => navTo("plp", { collection: product.line })} style={linkBtn()}>{product.line.toUpperCase()}</button> / <span>{product.name.toUpperCase()}</span>
        </div>

        {/* Hero: image + buy box (mirror saypha layout) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{
              background: "linear-gradient(180deg, #f5f7fa 0%, #e8ecf2 100%)",
              aspectRatio: "3/4", borderRadius: 4, position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                position: "absolute", top: 16, left: 16, background: COLORS.authority, color: "white",
                fontSize: 10, padding: "4px 10px", fontWeight: 600, letterSpacing: 1, zIndex: 2,
              }}>NEW</span>
              {/* Saypha box mockup — vertical, blue accent on top */}
              <div style={{
                width: "55%", height: "75%", background: "white",
                position: "relative", boxShadow: "0 8px 32px rgba(23, 36, 98, 0.15)",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ height: "8%", background: "#5DADE2" }}/>
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "20% 8%", flexDirection: "column",
                }}>
                  <div style={{
                    transform: "rotate(-90deg)", whiteSpace: "nowrap", color: COLORS.authority,
                    fontFamily: "Georgia, serif", letterSpacing: 6, fontSize: "min(3vw, 28px)", fontWeight: 600,
                  }}>OBAGI</div>
                  <div style={{
                    transform: "rotate(-90deg)", marginTop: 12, color: COLORS.authority,
                    fontSize: "min(1.2vw, 11px)", letterSpacing: 4, fontWeight: 500, opacity: 0.7,
                  }}>MEDICAL</div>
                </div>
                <div style={{
                  padding: "8% 10% 12%", borderTop: `1px solid #E8ECF2`,
                  display: "flex", flexDirection: "column", gap: 4,
                }}>
                  <div style={{ fontSize: "min(1.1vw, 10px)", color: COLORS.authority, letterSpacing: 1, fontWeight: 600 }}>SAYPHA® MAGIQ™</div>
                  <div style={{ height: 2, background: "#5DADE2", width: "40%", marginTop: 2 }}/>
                  <div style={{ fontSize: "min(0.9vw, 8px)", color: COLORS.darkGray, marginTop: 4 }}>Injectable Dermal Filler</div>
                  <div style={{ fontSize: "min(0.9vw, 8px)", color: COLORS.darkGray }}>with Lidocaine</div>
                  <div style={{ fontSize: "min(0.8vw, 7px)", color: COLORS.darkGray, marginTop: 6 }}>1 × 1 mL</div>
                </div>
              </div>
              {/* Syringe shadow accent */}
              <div style={{
                position: "absolute", bottom: "8%", right: "12%", width: "35%", height: "3%",
                background: "rgba(23, 36, 98, 0.15)", borderRadius: 99, transform: "rotate(15deg)",
              }}/>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600 }}>OBAGI MEDICAL</div>
            <h1 style={{ fontSize: 38, fontWeight: 600, color: COLORS.authority, margin: "8px 0 16px", lineHeight: 1.1, letterSpacing: -0.5 }}>
              Obagi® {product.name}<sup style={{ fontSize: 16 }}>™</sup>
            </h1>

            {isLoggedIn ? (
              <>
                <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.authority, marginBottom: 16 }}>${product.price.toFixed(2)}</div>
              </>
            ) : (
              <div style={{ marginBottom: 16, padding: 14, background: COLORS.blueLight, borderRadius: 4 }}>
                <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>PROFESSIONAL ACCOUNT REQUIRED</div>
                <button onClick={() => setShowLoginModal(true)} style={{
                  background: "transparent", border: "none", color: COLORS.physician,
                  fontSize: 13, fontWeight: 600, padding: 0, marginTop: 4,
                }}>Sign in to view price →</button>
              </div>
            )}

            <p style={{ fontSize: 14, color: COLORS.darkGray, lineHeight: 1.6, marginBottom: 16 }}>
              A hyaluronic acid (HA) dermal filler with the most usable HA concentration<sup>1</sup> to smooth wrinkles and folds in the lower face resulting in predictable performance and patient satisfaction<sup>2</sup>.
            </p>

            <p style={{ fontSize: 14, color: COLORS.darkGray, fontWeight: 600, marginBottom: 16 }}>
              ** Free Shipping on orders $1700+ **
            </p>

            <p style={{ fontSize: 13, color: COLORS.darkGray, marginBottom: 8 }}>
              Made in Austria by Croma-Pharma GmbH.
            </p>
            <p style={{ fontSize: 13, color: COLORS.darkGray, marginBottom: 24 }}>
              Distributed and sold in the United States by Obagi Cosmeceuticals LLC.
            </p>

            <div style={{ fontSize: 11, color: COLORS.darkGray, lineHeight: 1.6, padding: 12, background: "#fafafa", borderRadius: 4, marginBottom: 24 }}>
              1. Puljic A, Frank K, Cohen J, Otto K, Mayr J, Hugh-Bloch A, Kuroki-Hasenöhrl, D. A Scientific Framework for Comparing Hyaluronic Acid Filler Crosslinking Technologies. Gels. 2025; 11(7):487.<br/>
              2. saypha MagIQ. Directions for Use. Croma-Pharma GmbH; 2025.
            </div>

            {isLoggedIn && (
              <>
                <div style={{ fontSize: 13, color: COLORS.authority, fontWeight: 600, marginBottom: 8 }}>Quantity:</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", border: `0.5px solid ${COLORS.silver}`, borderRadius: 4 }}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} style={qtyBtn()}><Minus size={12}/></button>
                    <span style={{ padding: "0 16px", fontSize: 13, borderLeft: `0.5px solid ${COLORS.silver}`, borderRight: `0.5px solid ${COLORS.silver}` }}>{qty}</span>
                    <button onClick={() => setQty(qty + 1)} style={qtyBtn()}><Plus size={12}/></button>
                  </div>
                  <button onClick={() => { addToCart(product, qty); setQty(1); }} className="obagi-cta-primary" style={{
                    flex: 1, background: COLORS.authority, color: "white", border: "none",
                    padding: "14px 28px", borderRadius: 999, fontSize: 12, letterSpacing: 1.5, fontWeight: 600,
                  }}>ADD TO BAG</button>
                </div>
                <div style={{
                  padding: 12, background: "#FFF8E5", border: `0.5px solid ${COLORS.gold}`, borderRadius: 4,
                  display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: COLORS.darkGray,
                }}>
                  <Truck size={16} color={COLORS.authority}/>
                  <div><strong style={{ color: COLORS.authority }}>Injectable shipping</strong> — 2-day air, signature required, packaged separately</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* HOW TO USE — three columns (Assess / Inject / Note) — mirrors current saypha PDP */}
        <section style={{ background: COLORS.blueLight, padding: 40, borderRadius: 6, marginBottom: 24 }}>
          <h2 style={{ fontSize: 32, color: COLORS.authority, fontWeight: 700, margin: "0 0 24px" }}>How to Use</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            <div>
              <h3 style={{ fontSize: 18, color: COLORS.authority, fontWeight: 600, margin: "0 0 8px", borderBottom: `1px solid ${COLORS.silver}`, paddingBottom: 8 }}>Assess</h3>
              <p style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.6 }}>
                Indicated for injection into the mid to deep dermis for correction of moderate to severe facial wrinkles and folds (such as nasolabial folds) in adults over the age of 21.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, color: COLORS.authority, fontWeight: 600, margin: "0 0 8px", borderBottom: `1px solid ${COLORS.silver}`, paddingBottom: 8 }}>Inject</h3>
              <p style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.6 }}>
                In the clinical study, injection technique included needle injection with retrograde or fan technique (per treating investigator).<sup>*1</sup>
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, color: COLORS.authority, fontWeight: 600, margin: "0 0 8px", borderBottom: `1px solid ${COLORS.silver}`, paddingBottom: 8 }}>Note</h3>
              <p style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.6 }}>
                Prescription use only; refer to <a style={{ color: COLORS.physician }}>Directions for Use</a> for full administration guidance and <a style={{ color: COLORS.physician }}>Safety Information</a> available at: <a style={{ color: COLORS.physician }}>https://www.obagi.com/saypha</a>
              </p>
            </div>
          </div>
        </section>

        {/* INGREDIENTS */}
        <section style={{ background: COLORS.blueLight, padding: 40, borderRadius: 6, marginBottom: 24, position: "relative" }}>
          <BigCNote
            label="METAFIELD-DRIVEN"
            note="In BigC Stencil, this section reads from product.metafields.ingredient_deck. Pending: OBAGI to define proprietary complex naming format (spec 4.3)."
          />
          <h2 style={{ fontSize: 32, color: COLORS.authority, fontWeight: 700, margin: "0 0 16px" }}>Ingredients</h2>
          <p style={{ fontSize: 14, color: COLORS.darkGray, lineHeight: 1.7 }}>
            Cross-linked hyaluronic acid (in phosphate buffer) with 0.3% lidocaine.
          </p>
        </section>

        {/* SAFETY INFORMATION */}
        <section style={{ background: COLORS.blueLight, padding: 40, borderRadius: 6, marginBottom: 24 }}>
          <h2 style={{ fontSize: 32, color: COLORS.authority, fontWeight: 700, margin: "0 0 16px" }}>Safety Information</h2>
          <ul style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
            <li>Prescription use only</li>
            <li>Directions for Use for full administration guidance and safety information are available at <a style={{ color: COLORS.physician }}>obagi.com/saypha</a></li>
            <li><strong>Approved Use:</strong> Indicated for injection into the mid to deep dermis for correction of moderate to severe facial wrinkles and folds (such as nasolabial folds) in adults over the age of 21</li>
            <li>The most commonly observed side effects include swelling, redness, pain, bruising, tenderness, lump formation, and itching at the injection site. To learn more about serious but rare side effects and full <a style={{ color: COLORS.physician }}>Important Safety Information</a>, visit <a style={{ color: COLORS.physician }}>obagi.com/saypha</a></li>
            <li>To report a side effect with any product, please call Obagi® Customer Support at 1-888-798-9809</li>
          </ul>
          <h3 style={{ fontSize: 13, color: COLORS.authority, fontWeight: 700, letterSpacing: 1, margin: "24px 0 12px" }}>INTELLECTUAL PROPERTY</h3>
          <ul style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
            <li>For patent information, visit <a style={{ color: COLORS.physician }}>obagi.com/saypha</a></li>
            <li>Obagi® and all derivatives are registered trademarks of Obagi Cosmeceuticals LLC</li>
            <li>All other products/brand names, whether designated by notice or not, are trademarks of their respective owners</li>
          </ul>
        </section>

        {/* CLINICAL DATA */}
        <section style={{ background: COLORS.blueLight, padding: 40, borderRadius: 6, marginBottom: 24 }}>
          <h2 style={{ fontSize: 32, color: COLORS.authority, fontWeight: 700, margin: "0 0 16px" }}>Clinical Data</h2>
          <ul style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.7, paddingLeft: 20, margin: "0 0 20px" }}>
            <li>In a U.S. pivotal study of 270 participants, the product demonstrated non-inferiority to comparator filler through 12 months, confirming comparable safety and effectiveness.<sup>*1</sup></li>
            <li>At 3 months, 90% of patients were pleased with their results.<sup>*2</sup></li>
          </ul>
          <div style={{ fontSize: 11, color: COLORS.darkGray, lineHeight: 1.6 }}>
            * This summary reflects the clinical trial as conducted and published. Obagi® Medical was not involved in this research, and all information provided originates from third-party sources.<br/>
            1. Data on file. Clinical Study Report. 2025.<br/>
            2. Downie J, Gold M, Joseph J, Green J, Fabi S, Bank D, Cohen JL, Shamban A. Weiss R, Krames-Juerss A. Monheit G. Multicenter, Randomized Split-Face Trial of a Crosslinked Hyaluronic Acid Filler With Lidocaine for Nasolabial Fold Correction. Aesthet Surg J. 2025 Aug 1:sjaf137
          </div>
        </section>

        <div style={{ padding: 16, background: "#FFF8E5", border: `0.5px dashed ${COLORS.gold}`, borderRadius: 6, fontSize: 12, color: COLORS.darkGray, lineHeight: 1.6 }}>
          <strong style={{ color: COLORS.authority }}>⚠ Pending decision for tomorrow:</strong> Spec 4.3 requires B&A slider, Pro reviews, and video module on ALL PDPs. This injectable version omits them because (a) the current saypha PDP doesn't have them, (b) reviews and B&A on injectables may have FDA regulatory implications. Confirm with OBAGI Legal.
        </div>
      </div>
    </main>
  );
}

// ============================================================
// PDP — SKINCARE FORMAT (OneSkin-inspired layout)
// Long-scroll, no tabs, alternating section backgrounds,
// editorial section headers, sticky buy box
// ============================================================
function PDPSkincare({ isLoggedIn, product, navTo, addToCart, setShowLoginModal, qty, setQty }) {
  const [activeImage, setActiveImage] = useState(0);
  const [baSliderPos, setBaSliderPos] = useState(50);

  return (
    <main style={{ background: "white", paddingBottom: 0 }}>
      {/* TEMPLATE INDICATOR — top of page */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px 0", position: "relative" }}>
        <BigCNote
          label="SKINCARE PDP TEMPLATE"
          note="Full spec 4.3 implementation in OneSkin layout pattern: long-scroll, no tabs, alternating section backgrounds. Triggered by product.custom_fields.is_injectable === false. In Stencil this is a single template with conditional Handlebars rendering."
        />
        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, paddingTop: 32 }}>
          <button onClick={() => navTo("home")} style={linkBtn()}>HOME</button> / <button onClick={() => navTo("plp", { collection: null })} style={linkBtn()}>SHOP</button> / <button onClick={() => navTo("plp", { collection: product.line })} style={linkBtn()}>{product.line.toUpperCase()}</button> / <span>{product.name.toUpperCase()}</span>
        </div>
      </div>

      {/* ========== HERO: GALLERY + BUY BOX ========== */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "flex-start" }}>
          {/* Exposed gallery — multiple images stacked, not in tabs */}
          <div style={{ position: "relative" }}>
            <BigCNote
              label="EXPOSED GALLERY"
              note="OneSkin-style: stacked images, no slideshow. Custom Stencil component required — BigC native gallery is a thumbnail slideshow. Reads from product.images array."
              position="right"
            />
            <div style={{
              background: COLORS.blueLight, aspectRatio: "1/1", borderRadius: 8, position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inactive, fontSize: 14,
              marginBottom: 12,
            }}>
              <span style={{
                position: "absolute", top: 16, left: 16, background: COLORS.authority, color: "white",
                fontSize: 10, padding: "4px 10px", fontWeight: 600, letterSpacing: 1,
              }}>PRO</span>
              [Hero product image]
            </div>
            {/* Stacked secondary images — exposed style */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div style={{
                background: COLORS.blueLight, aspectRatio: "1/1", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inactive, fontSize: 12,
                position: "relative",
              }}>
                <span style={{
                  position: "absolute", top: 12, left: 12, background: "rgba(23,36,98,0.85)", color: "white",
                  fontSize: 9, padding: "3px 8px", fontWeight: 600, letterSpacing: 0.5, borderRadius: 4,
                  display: "flex", alignItems: "center", gap: 4,
                }}>▶ VIDEO</span>
                [Texture video]
              </div>
              <div style={{
                background: COLORS.blueLight, aspectRatio: "1/1", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inactive, fontSize: 12,
              }}>[Lifestyle shot]</div>
            </div>
            <div style={{
              background: COLORS.blueLight, aspectRatio: "16/10", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inactive, fontSize: 12,
            }}>[Detail / packaging shot]</div>
          </div>

          {/* Sticky buy box */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>{product.line.toUpperCase()}</div>
            <h1 style={{ fontSize: 36, fontWeight: 500, color: COLORS.authority, margin: "8px 0 12px", letterSpacing: -0.5, lineHeight: 1.1 }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ color: COLORS.gold, fontSize: 14 }}>{"★".repeat(Math.round(product.rating))}</span>
              <span style={{ fontSize: 12, color: COLORS.darkGray }}>{product.rating} · {product.reviews} Pro reviews</span>
            </div>

            <p style={{ fontSize: 15, color: COLORS.darkGray, lineHeight: 1.6, marginBottom: 24 }}>
              Professional-grade {product.concern.toLowerCase()} treatment formulated with {product.ingredient} and OBAGI's proprietary Penetrating Therapeutics™ complex. Clinically proven to deliver visible results.
            </p>

            {/* Best for tags inline */}
            <div style={{ marginBottom: 24, position: "relative" }}>
              <BigCNote
                label="BEST FOR — METAFIELD"
                note="Spec 4.3: end-user concern + skin type. In BigC, custom product fields populate this. Tags like 'Discoloration' map to facets in PLP filters."
                position="right"
              />
              <div style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1.5, fontWeight: 600, marginBottom: 8 }}>BEST FOR</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ background: COLORS.blueLight, color: COLORS.authority, fontSize: 11, padding: "5px 12px", borderRadius: 999, fontWeight: 600 }}>{product.concern}</span>
                <span style={{ background: COLORS.blueLight, color: COLORS.authority, fontSize: 11, padding: "5px 12px", borderRadius: 999, fontWeight: 600 }}>Fine Lines</span>
                <span style={{ background: COLORS.blueLight, color: COLORS.authority, fontSize: 11, padding: "5px 12px", borderRadius: 999, fontWeight: 600 }}>Uneven Tone</span>
              </div>
              <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 10 }}>
                <strong style={{ color: COLORS.authority }}>SKIN TYPES</strong> · Oily · Combination · Normal · Dry
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginBottom: 6 }}>SIZE</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{
                  background: COLORS.authority, color: "white", border: "none",
                  padding: "10px 18px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{product.size}</button>
                <button style={{
                  background: "white", color: COLORS.darkGray, border: `0.5px solid ${COLORS.silver}`,
                  padding: "10px 18px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                }}>Travel</button>
              </div>
            </div>

            {/* Price + ATC or Sign In */}
            {isLoggedIn ? (
              <>
                <div style={{ marginBottom: 16, padding: 18, background: COLORS.blueLight, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600 }}>PRO PRICE</div>
                  <div style={{ fontSize: 32, fontWeight: 600, color: COLORS.authority, marginTop: 4, lineHeight: 1 }}>${product.price.toFixed(2)}</div>
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", border: `0.5px solid ${COLORS.silver}`, borderRadius: 999 }}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ ...qtyBtn(), padding: "10px 14px" }}><Minus size={14}/></button>
                    <span style={{ padding: "0 16px", fontSize: 14, fontWeight: 600, color: COLORS.authority }}>{qty}</span>
                    <button onClick={() => setQty(qty + 1)} style={{ ...qtyBtn(), padding: "10px 14px" }}><Plus size={14}/></button>
                  </div>
                  <button onClick={() => { addToCart(product, qty); setQty(1); }} className="obagi-cta-primary" style={{
                    flex: 1, background: COLORS.authority, color: "white", border: "none",
                    padding: "14px 28px", borderRadius: 999, fontSize: 12, letterSpacing: 1.5, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>ADD TO BAG</button>
                </div>
                <div style={{ fontSize: 11, color: COLORS.darkGray, textAlign: "center", padding: 8, background: "#FFF8E5", borderRadius: 4 }}>
                  ✓ Free shipping on orders $250+
                </div>
              </>
            ) : (
              <div style={{ padding: 24, background: COLORS.blueLight, borderRadius: 8, textAlign: "center" }}>
                <Lock size={20} color={COLORS.authority} />
                <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginTop: 10 }}>PROFESSIONAL ACCOUNT REQUIRED</div>
                <div style={{ fontSize: 13, color: COLORS.authority, marginTop: 6, fontWeight: 500 }}>Sign in to view your Pro price</div>
                <button onClick={() => setShowLoginModal(true)} className="obagi-cta-primary" style={{
                  ...primaryCTA(), background: COLORS.authority, color: "white", width: "100%", marginTop: 16,
                }}>SIGN IN</button>
                <button onClick={() => alert("Request Account form would open here")} className="obagi-cta-secondary" style={{
                  ...secondaryCTA(), width: "100%", marginTop: 8,
                }}>REQUEST ACCOUNT</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== STAT CALLOUTS — clinical proof bar ========== */}
      <section style={{ background: COLORS.authority, color: "white", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 2, fontWeight: 600 }}>CLINICALLY PROVEN</div>
            <h2 style={{ fontSize: 28, fontWeight: 500, margin: "8px 0 0", letterSpacing: -0.3 }}>Real results from a 12-week clinical study</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { stat: "87%", label: "Showed visible improvement" },
              { stat: "94%", label: "Saw smoother texture" },
              { stat: "76%", label: "Reported brighter skin tone" },
            ].map((c, i) => (
              <div key={i} style={{ textAlign: "center", padding: "20px 16px", borderLeft: i > 0 ? `0.5px solid rgba(255,255,255,0.2)` : "none" }}>
                <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1, color: "white" }}>{c.stat}</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 12, lineHeight: 1.5 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== B&A SLIDER — full width feature ========== */}
      <section style={{ background: "white", padding: "80px 24px", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <BigCNote
            label="B&A SLIDER"
            note="Custom HTML/CSS/JS component. Drag the slider to reveal. Not native to BigC. Standard frontend implementation — no app required. Component reads from product metafields (ba_before_image, ba_after_image)."
            position="right"
          />
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 2, fontWeight: 600 }}>SEE THE DIFFERENCE</div>
            <h2 style={{ fontSize: 36, fontWeight: 500, color: COLORS.authority, margin: "8px 0 8px", letterSpacing: -0.5 }}>Before & After</h2>
            <p style={{ fontSize: 14, color: COLORS.darkGray, maxWidth: 480, margin: "0 auto" }}>Drag the slider to see real Pro patient results after 12 weeks of consistent use.</p>
          </div>
          <div style={{
            background: `linear-gradient(to right, ${COLORS.silver} ${baSliderPos}%, ${COLORS.blueLight} ${baSliderPos}%)`,
            aspectRatio: "16/7", borderRadius: 12, position: "relative", overflow: "hidden",
            boxShadow: "0 8px 32px rgba(23, 36, 98, 0.1)",
          }}>
            <div style={{ position: "absolute", left: `${baSliderPos}%`, top: 0, bottom: 0, width: 2, background: "white", transform: "translateX(-50%)", boxShadow: "0 0 12px rgba(0,0,0,0.2)" }}>
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                background: "white", color: COLORS.authority, width: 56, height: 56, borderRadius: 99,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 600,
                cursor: "ew-resize", boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}>⇆</div>
            </div>
            <span style={{ position: "absolute", left: 24, top: 24, background: "rgba(255,255,255,0.95)", padding: "8px 16px", fontSize: 11, color: COLORS.authority, fontWeight: 600, letterSpacing: 1, borderRadius: 4 }}>BEFORE</span>
            <span style={{ position: "absolute", right: 24, top: 24, background: COLORS.authority, color: "white", padding: "8px 16px", fontSize: 11, fontWeight: 600, letterSpacing: 1, borderRadius: 4 }}>AFTER 12 WEEKS</span>
            <input
              type="range"
              min="0"
              max="100"
              value={baSliderPos}
              onChange={(e) => setBaSliderPos(parseInt(e.target.value))}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                opacity: 0, cursor: "ew-resize", margin: 0,
              }}
            />
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS — alternating tinted bg ========== */}
      <section style={{ background: COLORS.blueLight, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 2, fontWeight: 600 }}>THE SCIENCE</div>
            <h2 style={{ fontSize: 36, fontWeight: 500, color: COLORS.authority, margin: "8px 0", letterSpacing: -0.5 }}>How it works</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { step: "01", title: "Penetrate", desc: "Proprietary delivery system enables active ingredients to reach skin's deeper layers where they're most effective." },
              { step: "02", title: "Activate", desc: `${product.ingredient} works at the cellular level to address ${product.concern.toLowerCase()} at its source.` },
              { step: "03", title: "Transform", desc: "Visible results emerge over 12 weeks, with continued improvement through ongoing use." },
            ].map((s, i) => (
              <div key={i} style={{ background: "white", padding: 32, borderRadius: 8 }}>
                <div style={{ fontSize: 48, fontWeight: 600, color: COLORS.authority, lineHeight: 1, opacity: 0.2 }}>{s.step}</div>
                <h3 style={{ fontSize: 22, fontWeight: 500, color: COLORS.authority, margin: "16px 0 12px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: COLORS.darkGray, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== VIDEO MODULE — full-bleed ========== */}
      <section style={{ background: "white", padding: "80px 24px", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <BigCNote
            label="VIDEO MODULE"
            note="Spec: 'independent mobile and desktop specs · text overlays · CTAs'. In BigC: custom Stencil component reading from product metafields (video_desktop_url, video_mobile_url, video_overlay_text). Not native — frontend build."
          />
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 2, fontWeight: 600 }}>USAGE & TEXTURE</div>
            <h2 style={{ fontSize: 36, fontWeight: 500, color: COLORS.authority, margin: "8px 0", letterSpacing: -0.5 }}>See it in action</h2>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.authority} 0%, ${COLORS.physician} 100%)`,
            aspectRatio: "16/7", borderRadius: 12, position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(23, 36, 98, 0.15)",
          }}>
            <button style={{
              width: 88, height: 88, borderRadius: 99, background: "rgba(255,255,255,0.2)",
              border: "1.5px solid rgba(255,255,255,0.5)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
              cursor: "pointer", backdropFilter: "blur(10px)",
            }}>▶</button>
            <span style={{
              position: "absolute", bottom: 24, left: 24, color: "white", fontSize: 12,
              background: "rgba(0,0,0,0.4)", padding: "6px 12px", borderRadius: 4, letterSpacing: 0.5,
            }}>Pro application technique · 0:48</span>
          </div>
        </div>
      </section>

      {/* ========== HOW TO USE — step-by-step lockup ========== */}
      <section style={{ background: COLORS.blueLight, padding: "80px 24px", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <BigCNote
            label="LOCK-UP MEDIA + TEXT"
            note="Spec 4.3: 'media + text lock-up' for How to Use. Implemented as Stencil partial with metafield-driven copy. Layout flexibility TBD by OBAGI."
            position="right"
          />
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 2, fontWeight: 600 }}>APPLICATION</div>
            <h2 style={{ fontSize: 36, fontWeight: 500, color: COLORS.authority, margin: "8px 0", letterSpacing: -0.5 }}>How to use</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div style={{
              background: "white", aspectRatio: "1/1", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.inactive, fontSize: 13,
            }}>[Application demo image]</div>
            <div>
              {[
                { num: "1", title: "Cleanse", desc: "Start with thoroughly cleansed skin, free of any other actives." },
                { num: "2", title: "Apply", desc: `Dispense 2-3 drops of ${product.name} onto fingertips and gently press into face and neck.` },
                { num: "3", title: "Massage", desc: "Massage in upward, circular motions until fully absorbed." },
                { num: "4", title: "Layer", desc: "Follow with moisturizer (AM/PM) and SPF (AM). Use morning and evening." },
              ].map(s => (
                <div key={s.num} style={{ display: "flex", gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: `0.5px solid rgba(23, 36, 98, 0.1)` }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 99, background: COLORS.authority, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0,
                  }}>{s.num}</div>
                  <div>
                    <div style={{ fontSize: 16, color: COLORS.authority, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== INGREDIENTS — full deck with benefits ========== */}
      <section style={{ background: "white", padding: "80px 24px", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <BigCNote
            label="METAFIELD-DRIVEN"
            note="In BigC Stencil, this section reads from product.metafields.ingredient_deck. Pending: OBAGI to define proprietary complex naming format (spec 4.3). Each hero ingredient + benefit pair is its own metafield."
          />
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 2, fontWeight: 600 }}>FULL TRANSPARENCY</div>
            <h2 style={{ fontSize: 36, fontWeight: 500, color: COLORS.authority, margin: "8px 0", letterSpacing: -0.5 }}>What's in the formula</h2>
          </div>

          {/* Hero ingredients with benefits */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
            {[
              { name: product.ingredient, role: "ACTIVE", desc: `Primary active ingredient. Clinically proven to address ${product.concern.toLowerCase()}.` },
              { name: "Penetrating Therapeutics™", role: "DELIVERY", desc: "OBAGI's proprietary complex enables deeper ingredient absorption." },
              { name: "Tocopheryl Acetate", role: "ANTIOXIDANT", desc: "Vitamin E derivative. Protects skin from environmental damage." },
            ].map((ing, i) => (
              <div key={i} style={{ padding: 28, background: COLORS.blueLight, borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: COLORS.physician, letterSpacing: 2, fontWeight: 700 }}>{ing.role}</div>
                <h3 style={{ fontSize: 18, color: COLORS.authority, fontWeight: 600, margin: "10px 0 12px" }}>{ing.name}</h3>
                <p style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.6, margin: 0 }}>{ing.desc}</p>
              </div>
            ))}
          </div>

          {/* Full ingredient deck */}
          <details style={{ borderTop: `0.5px solid ${COLORS.silver}`, paddingTop: 24 }}>
            <summary style={{
              fontSize: 12, color: COLORS.authority, fontWeight: 600, letterSpacing: 1, cursor: "pointer",
              listStyle: "none", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>+</span> VIEW FULL INGREDIENT DECK
            </summary>
            <div style={{
              background: COLORS.blueLight, padding: 24, borderRadius: 8, marginTop: 16,
              fontFamily: "ui-monospace, monospace", fontSize: 12, color: COLORS.darkGray, lineHeight: 1.8,
            }}>
              Aqua/Water, {product.ingredient}, OBAGI Penetrating Therapeutics™ (Proprietary Complex), Glycerin, Propylene Glycol, Sodium PCA, Tocopheryl Acetate, Allantoin, Citric Acid, Sodium Hyaluronate, Niacinamide, Aloe Barbadensis Leaf Juice, Panthenol, Sodium Hydroxide, Disodium EDTA, Phenoxyethanol, Caprylyl Glycol, Ethylhexylglycerin
            </div>
            <div style={{ fontSize: 11, color: COLORS.darkGray, marginTop: 12, fontStyle: "italic" }}>
              Metafield-driven · proprietary complex naming defined by OBAGI
            </div>
          </details>
        </div>
      </section>

      {/* ========== SAFETY INFORMATION ========== */}
      <section style={{ background: COLORS.blueLight, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 2, fontWeight: 600 }}>FOR PROFESSIONAL USE</div>
            <h2 style={{ fontSize: 32, fontWeight: 500, color: COLORS.authority, margin: "8px 0", letterSpacing: -0.3 }}>Safety information</h2>
          </div>
          <div style={{ background: "white", padding: 32, borderRadius: 8, fontSize: 13, color: COLORS.darkGray, lineHeight: 1.8 }}>
            <p style={{ margin: "0 0 12px" }}><strong style={{ color: COLORS.authority }}>For professional use.</strong> Patch test recommended before first use. Avoid contact with eyes — if contact occurs, rinse thoroughly with water.</p>
            <p style={{ margin: "0 0 12px" }}>If irritation occurs, discontinue use and consult a healthcare professional. Do not use on broken or damaged skin. Keep out of reach of children.</p>
            <p style={{ margin: 0 }}>Store at room temperature, away from direct sunlight. Consult Pro guidelines for combination with other actives.</p>
          </div>
        </div>
      </section>

      {/* ========== REVIEWS ========== */}
      <section style={{ background: "white", padding: "80px 24px", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <BigCNote
            label="REVIEWS ARCHITECTURE"
            note="Per 05.06 meeting: Pro reviews use the native section unhidden from Phase 1. D2C reviews curated by OBAGI as text testimonials (NOT imported via CSV). 3rd-party app only if native falls short. Pending: confirm email vs SMS solicitation method."
            position="right"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64, alignItems: "flex-start" }}>
            {/* Reviews summary card */}
            <div style={{ position: "sticky", top: 24 }}>
              <div style={{ fontSize: 11, color: COLORS.darkGray, letterSpacing: 2, fontWeight: 600 }}>WHAT PROS SAY</div>
              <h2 style={{ fontSize: 32, fontWeight: 500, color: COLORS.authority, margin: "8px 0 24px", letterSpacing: -0.3 }}>Reviews from professionals</h2>
              <div style={{ background: COLORS.blueLight, padding: 28, borderRadius: 8 }}>
                <div style={{ fontSize: 64, fontWeight: 600, color: COLORS.authority, lineHeight: 1 }}>{product.rating}</div>
                <div style={{ color: COLORS.gold, fontSize: 18, marginTop: 6 }}>{"★".repeat(Math.round(product.rating))}</div>
                <div style={{ fontSize: 12, color: COLORS.darkGray, marginTop: 8 }}>Based on {product.reviews} Pro reviews</div>
                <div style={{ borderTop: `0.5px solid ${COLORS.silver}`, marginTop: 16, paddingTop: 16 }}>
                  <div style={{ fontSize: 10, color: COLORS.darkGray, letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>D2C SELL-THROUGH</div>
                  <div style={{ fontSize: 11, color: COLORS.darkGray }}>★ {product.rating} from D2C consumers</div>
                  <div style={{ fontSize: 10, color: COLORS.darkGray, fontStyle: "italic", marginTop: 4 }}>Curated by OBAGI as testimonials</div>
                </div>
              </div>
              {isLoggedIn && (
                <button className="obagi-cta-secondary" style={{ ...secondaryCTA(), width: "100%", marginTop: 16 }}>WRITE A REVIEW</button>
              )}
            </div>
            {/* Reviews list */}
            <div>
              {[
                { stars: 5, name: "Dr. M. Chen, MD", title: "Holy grail product", text: "I've been recommending this to every patient with melasma concerns. The results in 6-8 weeks are consistent and visible. Pairs beautifully with our in-office protocols.", date: "2 weeks ago", verified: true },
                { stars: 5, name: "Sarah R., LE", title: "Has transformed my facials", text: "I incorporate this into nearly every facial protocol now. Clients notice the difference within their first treatment cycle. The texture is luxurious without being heavy.", date: "1 month ago", verified: true },
                { stars: 4, name: "Dr. A. Patel", title: "Effective for resistant cases", text: "Particularly effective for stubborn melasma cases that haven't responded well to other treatments. Pairs well with the Nu-Derm system for a complete protocol.", date: "1 month ago", verified: true },
                { stars: 5, name: "Jessica T., NP", title: "Patient favorite", text: "My patients consistently re-order this. The Pro pricing makes it easy to recommend, and the results speak for themselves. A staple in my practice.", date: "2 months ago", verified: true },
              ].map((r, i) => (
                <div key={i} style={{ padding: "24px 0", borderBottom: i < 3 ? `0.5px solid ${COLORS.silver}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ color: COLORS.gold, fontSize: 14 }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                    <span style={{ fontSize: 11, color: COLORS.darkGray }}>{r.date}</span>
                  </div>
                  <h4 style={{ fontSize: 15, color: COLORS.authority, fontWeight: 600, margin: "0 0 6px" }}>{r.title}</h4>
                  <p style={{ fontSize: 13, color: COLORS.darkGray, lineHeight: 1.6, margin: "0 0 10px" }}>{r.text}</p>
                  <div style={{ fontSize: 11, color: COLORS.darkGray, display: "flex", alignItems: "center", gap: 6 }}>
                    <strong style={{ color: COLORS.authority }}>{r.name}</strong>
                    {r.verified && <span style={{ background: COLORS.blueLight, color: COLORS.physician, padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 600 }}>✓ VERIFIED PRO</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FUTURE FLAG ========== */}
      <section style={{ background: COLORS.blueLight, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ padding: 16, background: "white", borderRadius: 6, fontSize: 12, color: COLORS.darkGray, fontStyle: "italic", borderLeft: `3px solid ${COLORS.gold}` }}>
            <strong style={{ color: COLORS.authority, fontStyle: "normal" }}>↗ FUTURE (not in Phase 2 scope):</strong> Shop the Regimen multi-product modules · Pro-UGC carousels (Cohley/ALOHA partner-sourced)
          </div>
        </div>
      </section>
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
            marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-start", position: "relative",
          }}>
            <BigCNote
              label="SPLIT FULFILLMENT"
              note="Per spec 4.6 + 05.06 meeting: cart UI is unified, split happens 100% on the back end (Velocity). BigC captures payment, Velocity records order and routes fulfillment. NO front-end split — this notice is informational only."
              position="right"
            />
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

        <div style={{ marginTop: 32, padding: 16, background: COLORS.blueLight, borderRadius: 6, fontSize: 11, color: COLORS.darkGray, fontStyle: "italic", position: "relative" }}>
          <BigCNote
            label="AUTO-ADD PROMO"
            note="Spec 4.4: 'CTA adds 5 products + applies coupon when clicked'. BigC native coupons handle the discount. Auto-adding multiple products on one click requires custom JS or a 3rd-party app (e.g. In-Cart Upsell). Standard 'Buy 5 Get 15%' coupon works natively without auto-add. PENDING DEV CONFIRMATION."
            position="right"
          />
          ⚠ PENDING DEV (spec 4.4): "Add CTA promo directly to cart" — auto-add 5 products + apply coupon when clicked
        </div>
      </div>
    </main>
  );
}

// ============================================================
// PRO LANDING PAGE — entry point for obagi-professional.com
// Mirrors the real Pro home (foto 1): centered logo header,
// hero with floating products, trust strip with gold checkmarks
// ============================================================
function ProLanding({ navTo }) {
  return (
    <div style={{ background: "white", minHeight: "100vh", fontFamily: "'Open Sans', system-ui, sans-serif" }}>
      {/* HEADER — logo centered, only person icon top right */}
      <header style={{
        padding: "20px 32px", position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "Georgia, serif", fontSize: 24, letterSpacing: 2,
            color: COLORS.authority, fontWeight: 600, lineHeight: 1,
          }}>OBAGI<sup style={{ fontSize: 10 }}>®</sup></div>
          <div style={{
            fontSize: 10, letterSpacing: 6, color: COLORS.authority,
            fontWeight: 500, marginTop: 4, opacity: 0.8,
          }}>MEDICAL</div>
        </div>
        <button onClick={() => navTo("login")} style={{
          position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)",
          background: "transparent", border: "none", padding: 8, cursor: "pointer",
          color: COLORS.authority,
        }} title="Sign in">
          <User size={22}/>
        </button>
      </header>

      {/* HERO — split: products floating left, copy right */}
      <section style={{
        background: COLORS.blueLight,
        padding: "60px 60px 100px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40, alignItems: "center",
        }}>
          {/* Floating products simulation — CSS mockup */}
          <div style={{ position: "relative", minHeight: 420 }}>
            {/* Multiple product placeholders at different rotations/positions */}
            {[
              { left: "5%", top: "20%", w: 70, h: 200, rot: -15, color: "#fefefe" },
              { left: "20%", top: "10%", w: 50, h: 170, rot: 25, color: "#8B4513" },
              { left: "32%", top: "40%", w: 80, h: 150, rot: -8, color: "#fafafa" },
              { left: "48%", top: "5%", w: 60, h: 200, rot: 15, color: "#D4AF37" },
              { left: "62%", top: "55%", w: 75, h: 100, rot: -20, color: "#fefefe" },
              { left: "20%", top: "60%", w: 55, h: 180, rot: 30, color: "#2C5F9E" },
              { left: "78%", top: "30%", w: 50, h: 160, rot: -25, color: "#fafafa" },
            ].map((p, i) => (
              <div key={i} style={{
                position: "absolute",
                left: p.left, top: p.top, width: p.w, height: p.h,
                background: p.color,
                transform: `rotate(${p.rot}deg)`,
                borderRadius: 4,
                boxShadow: "0 12px 32px rgba(23, 36, 98, 0.12)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}>
                <div style={{
                  position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%) rotate(-90deg)",
                  fontFamily: "Georgia, serif", fontSize: 8, letterSpacing: 2,
                  color: p.color === "#fefefe" || p.color === "#fafafa" ? COLORS.authority : "rgba(255,255,255,0.9)",
                  fontWeight: 600, whiteSpace: "nowrap",
                }}>OBAGI</div>
              </div>
            ))}
          </div>

          {/* Right: copy + CTAs */}
          <div>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: COLORS.authority,
              fontWeight: 500, opacity: 0.7, marginBottom: 16,
            }}>FOR PROFESSIONALS</div>
            <h1 style={{
              fontSize: 56, fontWeight: 500, color: COLORS.authority,
              margin: "0 0 16px", letterSpacing: -1, lineHeight: 1,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}>Obagi Medical</h1>
            <p style={{
              fontSize: 16, color: COLORS.darkGray,
              margin: "0 0 32px", lineHeight: 1.5,
            }}>Join our mission to transform skin health</p>
            <button onClick={() => navTo("login")} style={{
              background: COLORS.authority, color: "white", border: "none",
              padding: "14px 48px", borderRadius: 999, fontSize: 13,
              letterSpacing: 0.5, fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit",
            }} className="obagi-cta-primary">
              Become a Partner
            </button>
            <div style={{ marginTop: 16 }}>
              <button onClick={() => navTo("login")} style={{
                background: "transparent", border: "none", padding: 0, cursor: "pointer",
                color: COLORS.physician, fontSize: 13, textDecoration: "underline",
                fontFamily: "inherit",
              }}>Already a partner?</button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION — split: gel circle left, bulleted stats right */}
      <section style={{ padding: "80px 60px", background: "white" }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center",
        }}>
          {/* Left: circle with text overlay */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: 380, height: 380, borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.blueLight} 0%, ${COLORS.silver} 60%, ${COLORS.blueLight} 100%)`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
              boxShadow: "inset 0 0 60px rgba(23, 36, 98, 0.06)",
            }}>
              {/* Gel texture suggestion */}
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 40%),
                            radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 0%, transparent 30%)`,
              }}/>
              <div style={{
                fontSize: 28, fontWeight: 600, color: "white",
                position: "relative", textShadow: "0 2px 8px rgba(23, 36, 98, 0.3)",
              }}>Voted #1</div>
              <div style={{
                fontSize: 13, color: "white", marginTop: 12, textAlign: "center",
                position: "relative", textShadow: "0 1px 4px rgba(23, 36, 98, 0.3)",
                lineHeight: 1.5, maxWidth: 240,
              }}>Medical-grade Skincare Brand<br/>by physicians</div>
            </div>
          </div>

          {/* Right: stats list */}
          <div>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: COLORS.authority,
              fontWeight: 600, marginBottom: 32,
            }}>A PARTNER YOU CAN TRUST</div>
            {[
              "80+ Patents",
              "Over 100 Products Tested",
              "329+ Studies Conducted",
              "6K+ Participants Involved",
            ].map((stat, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 20,
                padding: "16px 0",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: COLORS.gold,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <ArrowRight size={18} color="white" strokeWidth={2.5}/>
                </div>
                <div style={{
                  fontSize: 22, color: COLORS.darkGray,
                  fontWeight: 400,
                }}>{stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky CTA bottom-left */}
      <div style={{
        position: "fixed", bottom: 24, left: 24, zIndex: 50,
        background: "white", border: `1px solid ${COLORS.silver}`,
        borderRadius: 6, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 4px 16px rgba(23, 36, 98, 0.08)",
        fontSize: 13, color: COLORS.authority, fontWeight: 500,
      }}>
        Contact a Sales Associate
        <X size={14} style={{ cursor: "pointer", opacity: 0.6 }}/>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN PAGE — simple centered card, mock auth
// ============================================================
function LoginPage({ navTo, onLogin }) {
  const [email, setEmail] = useState("mpeacock@fjsolutions.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setError("");
    onLogin();
  };

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.blueLight,
      fontFamily: "'Open Sans', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* HEADER — same as landing, logo centered */}
      <header style={{
        padding: "20px 32px", background: "white",
        borderBottom: `1px solid ${COLORS.silver}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <button onClick={() => navTo("landing")} style={{
          background: "transparent", border: "none", padding: 0, cursor: "pointer",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "Georgia, serif", fontSize: 24, letterSpacing: 2,
            color: COLORS.authority, fontWeight: 600, lineHeight: 1,
          }}>OBAGI<sup style={{ fontSize: 10 }}>®</sup></div>
          <div style={{
            fontSize: 10, letterSpacing: 6, color: COLORS.authority,
            fontWeight: 500, marginTop: 4, opacity: 0.8,
          }}>MEDICAL</div>
        </button>
      </header>

      {/* Centered login card */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "60px 24px",
      }}>
        <div style={{
          background: "white", padding: "48px 40px",
          borderRadius: 8, maxWidth: 440, width: "100%",
          boxShadow: "0 8px 32px rgba(23, 36, 98, 0.08)",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: 3, color: COLORS.authority,
            fontWeight: 600, marginBottom: 8,
          }}>FOR PROFESSIONALS</div>
          <h1 style={{
            fontSize: 28, fontWeight: 500, color: COLORS.authority,
            margin: "0 0 8px", letterSpacing: -0.3,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>Sign in</h1>
          <p style={{
            fontSize: 13, color: COLORS.darkGray, margin: "0 0 28px", lineHeight: 1.5,
          }}>Welcome back. Sign in to access Pro pricing and your account.</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 10, letterSpacing: 1.5,
              color: COLORS.darkGray, fontWeight: 600, marginBottom: 6,
            }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%", padding: "12px 14px",
                border: `1px solid ${COLORS.silver}`, borderRadius: 4,
                fontSize: 14, fontFamily: "inherit",
                boxSizing: "border-box", color: COLORS.authority,
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: "block", fontSize: 10, letterSpacing: 1.5,
              color: COLORS.darkGray, fontWeight: 600, marginBottom: 6,
            }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 14px",
                border: `1px solid ${COLORS.silver}`, borderRadius: 4,
                fontSize: 14, fontFamily: "inherit",
                boxSizing: "border-box", color: COLORS.authority,
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "#FEE",
              border: `1px solid ${COLORS.error}`, borderRadius: 4,
              fontSize: 12, color: COLORS.error, marginBottom: 16,
            }}>{error}</div>
          )}

          <button onClick={handleSubmit} className="obagi-cta-primary" style={{
            width: "100%", background: COLORS.authority, color: "white",
            border: "none", padding: "14px", borderRadius: 999,
            fontSize: 13, letterSpacing: 1, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
          }}>SIGN IN</button>

          <div style={{
            textAlign: "center", marginTop: 16, fontSize: 12, color: COLORS.darkGray,
          }}>
            <button style={{
              background: "transparent", border: "none", color: COLORS.physician,
              fontSize: 12, padding: 0, cursor: "pointer", fontFamily: "inherit",
              textDecoration: "underline",
            }}>Forgot password?</button>
          </div>

          <div style={{
            marginTop: 24, paddingTop: 24, borderTop: `1px solid ${COLORS.blueLight}`,
            textAlign: "center", fontSize: 12, color: COLORS.darkGray,
          }}>
            Don't have a Pro account?{" "}
            <button onClick={() => navTo("landing")} style={{
              background: "transparent", border: "none", color: COLORS.physician,
              fontWeight: 600, padding: 0, cursor: "pointer", fontFamily: "inherit",
            }}>Become a Partner</button>
          </div>

          {/* POC helper */}
          <div style={{
            marginTop: 20, padding: 10, background: COLORS.blueLight,
            borderRadius: 4, fontSize: 10, color: COLORS.darkGray, textAlign: "center",
            lineHeight: 1.5,
          }}>
            🎯 <strong style={{ color: COLORS.authority }}>POC:</strong> Any password works. Email pre-filled as <strong>mpeacock@fjsolutions.com</strong>
          </div>
        </div>
      </div>

      {/* Footer back link */}
      <div style={{ padding: "20px 32px", textAlign: "center" }}>
        <button onClick={() => navTo("landing")} style={{
          background: "transparent", border: "none", color: COLORS.darkGray,
          fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>← Back to home</button>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN MODAL (legacy) — still used for in-storefront sign-in
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
// BigC TECHNICAL NOTE — clickable marker that reveals BigCommerce
// implementation context. Used to flag pending dev confirmations,
// metafield-driven sections, and platform constraints.
// ============================================================
function BigCNote({ label, note, position = "left" }) {
  const [open, setOpen] = useState(false);
  const positionStyles = position === "right"
    ? { top: 12, right: 12 }
    : { top: 12, left: 12 };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          position: "absolute", ...positionStyles, zIndex: 10,
          background: open ? COLORS.authority : "rgba(255, 183, 0, 0.95)",
          color: open ? "white" : COLORS.authority,
          border: "none", padding: "4px 10px", borderRadius: 99,
          fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
          display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
          boxShadow: "0 2px 8px rgba(23, 36, 98, 0.15)",
        }}
        title="BigCommerce technical note"
      >
        <span style={{ fontSize: 10 }}>⚙</span> {label}
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", ...positionStyles,
            top: position === "right" ? 44 : 44,
            zIndex: 11,
            background: COLORS.authority, color: "white",
            padding: 14, borderRadius: 6,
            fontSize: 11, lineHeight: 1.6,
            maxWidth: 320, minWidth: 240,
            boxShadow: "0 8px 32px rgba(23, 36, 98, 0.3)",
            border: `1px solid ${COLORS.physician}`,
          }}
        >
          <div style={{
            fontSize: 9, color: COLORS.gold, fontWeight: 700, letterSpacing: 1,
            marginBottom: 6, display: "flex", alignItems: "center", gap: 4,
          }}>
            ⚙ BIGCOMMERCE NOTE
          </div>
          <div style={{ fontSize: 10, opacity: 0.95, fontWeight: 400 }}>{note}</div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "transparent", border: "none", color: "rgba(255,255,255,0.6)",
              fontSize: 10, padding: 0, marginTop: 8, cursor: "pointer",
            }}
          >Close ✕</button>
        </div>
      )}
    </>
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
// DEMO CONTROLS — floating panel with status, BigC notes toggle,
// and quick-access guide for the meeting demo.
// ============================================================
function DemoControls({ isLoggedIn, cartCount, page }) {
  const [open, setOpen] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

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
      border: `0.5px solid ${COLORS.silver}`, borderRadius: 8, padding: 14,
      fontSize: 11, color: COLORS.darkGray, zIndex: 90, minWidth: 240, maxWidth: 280,
      boxShadow: "0 4px 16px rgba(23, 36, 98, 0.15)",
      fontFamily: "'Open Sans', system-ui, sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: `0.5px solid ${COLORS.blueLight}` }}>
        <span style={{ fontSize: 10, color: COLORS.authority, fontWeight: 700, letterSpacing: 1 }}>OBAGI POC · DEMO PANEL</span>
        <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: COLORS.darkGray, padding: 0, cursor: "pointer" }}>
          <X size={12}/>
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span>Auth:</span>
        <span style={{ color: isLoggedIn ? COLORS.physician : COLORS.darkGray, fontWeight: 600 }}>
          {isLoggedIn ? "✓ LOGGED IN" : "○ LOGGED OUT"}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span>Page:</span>
        <span style={{ color: COLORS.authority, fontWeight: 600, textTransform: "uppercase" }}>{page}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span>Cart:</span>
        <span style={{ color: COLORS.authority, fontWeight: 600 }}>{cartCount} items</span>
      </div>

      <div style={{ paddingTop: 8, borderTop: `0.5px solid ${COLORS.blueLight}` }}>
        <button
          onClick={() => setShowGuide(!showGuide)}
          style={{
            background: showGuide ? COLORS.authority : COLORS.blueLight,
            color: showGuide ? "white" : COLORS.authority,
            border: "none", padding: "8px 10px", borderRadius: 4,
            fontSize: 10, fontWeight: 600, letterSpacing: 0.5, cursor: "pointer",
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: "inherit",
          }}
        >
          <span>📋 DEMO GUIDE</span>
          <span>{showGuide ? "▲" : "▼"}</span>
        </button>
        {showGuide && (
          <div style={{ marginTop: 8, padding: 10, background: COLORS.blueLight, borderRadius: 4, fontSize: 10, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: COLORS.authority, marginBottom: 6, fontSize: 9, letterSpacing: 0.5 }}>WHAT TO SHOW:</div>
            <div style={{ marginBottom: 6 }}>1. <strong>Pro Landing</strong> → "obagi-professional.com" entry point</div>
            <div style={{ marginBottom: 6 }}>2. Click <strong>"Already a partner?"</strong> → login page</div>
            <div style={{ marginBottom: 6 }}>3. <strong>Login</strong> (any password works) → storefront</div>
            <div style={{ marginBottom: 6 }}>4. <strong>Storefront home</strong> → prices visible, ATC enabled</div>
            <div style={{ marginBottom: 6 }}>5. <strong>PLP</strong> → live filters + promo metafield</div>
            <div style={{ marginBottom: 6 }}>6. <strong>PDP skincare</strong> (Vitamin C) → full spec 4.3</div>
            <div style={{ marginBottom: 6 }}>7. <strong>PDP injectable</strong> (MAGIQ) → current saypha format</div>
            <div style={{ marginBottom: 6 }}>8. Add 1 injectable + 1 skincare → <strong>cart split notice</strong></div>
            <div>9. Click ⚙ markers → BigC technical notes</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, padding: 8, background: "#FFF8E5", borderRadius: 4, fontSize: 9, color: COLORS.darkGray, lineHeight: 1.5 }}>
        <strong style={{ color: COLORS.authority }}>⚙ BigC Notes:</strong> click the yellow markers throughout the PDP to view technical notes about Stencil/BigCommerce implementation.
      </div>
    </div>
  );
}
