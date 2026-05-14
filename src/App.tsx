import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Play,
  ArrowRight,
  ArrowLeft,
  Home,
  Gem,
  User,
  Sparkles,
  ExternalLink,
} from "lucide-react";

/* ─── social icons (inline SVGs) ─── */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/* ───────────────── routing context ───────────────── */

type Page = "home" | "collection";

interface RouterCtx {
  page: Page;
  navigate: (p: Page) => void;
}

import { createContext, useContext } from "react";

const RouterContext = createContext<RouterCtx>({
  page: "home",
  navigate: () => {},
});

function useRouter() {
  return useContext(RouterContext);
}

/* ─── lightbox context ─── */

interface LightboxCtx {
  open: (product: Product) => void;
}

const LightboxContext = createContext<LightboxCtx>({ open: () => {} });

function useLightbox() {
  return useContext(LightboxContext);
}

function LightboxModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (product) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-espresso/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 mx-6 w-full max-w-3xl transition-all duration-500 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/20 hover:text-white"
          aria-label="Close preview"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Image container */}
        <div className="overflow-hidden rounded-2xl bg-linen">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product info */}
        <div className="mt-6 text-center">
          <span className={`inline-block rounded-xl border font-sans text-[10px] font-semibold uppercase tracking-[.12em] px-3 py-1.5 ${
            product.material === "Gold"
              ? "border-camel/30 bg-white/80 text-cocoa backdrop-blur-sm"
              : "border-espresso/15 bg-white/80 text-espresso backdrop-blur-sm"
          }`}>
            {product.material}
          </span>
          <h3 className="mt-3 font-serif text-2xl font-semibold text-white md:text-3xl">
            {product.name}
          </h3>
          <p className="mt-2 font-sans text-xs tracking-wider text-white/50">
            Visit store for pricing & details
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── data ───────────────── */

type Category = "All" | "Gold" | "Silver" | "Necklaces" | "Earrings" | "Bangles" | "Rings" | "Bracelets" | "Pendants";

const CATEGORIES: Category[] = [
  "All",
  "Gold",
  "Silver",
  "Necklaces",
  "Pendants",
  "Earrings",
  "Bangles",
  "Rings",
  "Bracelets",
];

interface Product {
  id: number;
  name: string;
  material: "Gold" | "Silver";
  category: Category;
  price: string;
  image: string;
}

const ALL_PRODUCTS: Product[] = [
  { id: 1, name: "Eternal Gold Pendant", material: "Gold", category: "Pendants", price: "₹45,900", image: "/images/product-gold-1.jpg" },
  { id: 2, name: "Royal Jhumka Earrings", material: "Gold", category: "Earrings", price: "₹38,500", image: "/images/product-gold-2.jpg" },
  { id: 3, name: "Heritage Gold Bangles", material: "Gold", category: "Bangles", price: "₹72,000", image: "/images/product-gold-3.jpg" },
  { id: 4, name: "Minimalist Silver Chain", material: "Silver", category: "Necklaces", price: "₹4,200", image: "/images/product-silver-1.jpg" },
  { id: 5, name: "Silver Elegance Bracelet", material: "Silver", category: "Bracelets", price: "₹6,800", image: "/images/product-silver-2.jpg" },
  { id: 6, name: "Contemporary Silver Rings", material: "Silver", category: "Rings", price: "₹3,500", image: "/images/product-silver-3.jpg" },
  { id: 7, name: "Regal Gold Necklace", material: "Gold", category: "Necklaces", price: "₹1,24,500", image: "/images/product-gold-1.jpg" },
  { id: 8, name: "Temple Gold Jhumka", material: "Gold", category: "Earrings", price: "₹28,900", image: "/images/product-gold-2.jpg" },
  { id: 9, name: "Delicate Gold Bangle Set", material: "Gold", category: "Bangles", price: "₹56,000", image: "/images/product-gold-3.jpg" },
  { id: 10, name: "Silver Filigree Pendant", material: "Silver", category: "Pendants", price: "₹3,800", image: "/images/product-silver-1.jpg" },
  { id: 11, name: "Oxidised Silver Earrings", material: "Silver", category: "Earrings", price: "₹2,200", image: "/images/product-silver-3.jpg" },
  { id: 12, name: "Gold statement Ring", material: "Gold", category: "Rings", price: "₹18,500", image: "/images/product-gold-2.jpg" },
  { id: 13, name: "Gold Charm Bracelet", material: "Gold", category: "Bracelets", price: "₹42,000", image: "/images/product-gold-1.jpg" },
  { id: 14, name: "Silver Cuff Bracelet", material: "Silver", category: "Bracelets", price: "₹5,400", image: "/images/product-silver-2.jpg" },
  { id: 15, name: "Antique Gold Pendant", material: "Gold", category: "Pendants", price: "₹34,200", image: "/images/product-gold-3.jpg" },
  { id: 16, name: "Silver Layered Necklace", material: "Silver", category: "Necklaces", price: "₹7,600", image: "/images/product-silver-1.jpg" },
  { id: 17, name: "Pearl Gold Jhumka", material: "Gold", category: "Earrings", price: "₹44,800", image: "/images/product-gold-1.jpg" },
  { id: 18, name: "Silver Anklet Pair", material: "Silver", category: "Bracelets", price: "₹4,900", image: "/images/product-silver-2.jpg" },
];

/* Featured products for homepage (first 6) */
const FEATURED = ALL_PRODUCTS.slice(0, 6);

interface Review {
  id: number;
  name: string;
  text: string;
  rating: number;
}

const REVIEWS: Review[] = [
  { id: 1, name: "Ananya Deshmukh", text: "Absolutely stunning collection! The gold necklace I bought for my wedding was beyond my expectations. The craftsmanship is remarkable.", rating: 5 },
  { id: 2, name: "Priya Bhoyar", text: "Best jeweller in Nagpur. The staff is incredibly helpful and the designs are unique. I always find something special here.", rating: 5 },
  { id: 3, name: "Shruti Khandekar", text: "The silver collection is contemporary and elegant. Great quality at fair prices. My go-to store for everyday jewelry.", rating: 5 },
  { id: 4, name: "Mehek Jain", text: "Purchased a beautiful bangle set for my mother's birthday. She loved it! The packaging was also very premium.", rating: 5 },
  { id: 5, name: "Kavita Raut", text: "Wonderful experience from start to finish. The team helped me pick the perfect earrings for my sister's wedding.", rating: 5 },
  { id: 6, name: "Sneha Thakur", text: "Authentic jewelry with beautiful designs. The purity certification gave me complete confidence in my purchase.", rating: 5 },
];

const REEL_IMAGES = [
  "/images/reel-1.jpg",
  "/images/reel-2.jpg",
  "/images/reel-3.jpg",
  "/images/hero.jpg",
  "/images/product-gold-2.jpg",
  "/images/product-silver-2.jpg",
];

/* ───────────────── landing header ───────────────── */

function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = ["#home", "#collection"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.querySelector(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = useCallback((href: string) => {
    setActive(href);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_30px_rgba(74,52,42,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-10 lg:py-4">
        {/* Left nav icons */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => handleNav("#home")}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2 transition-all duration-300 lg:px-5 lg:py-2.5 ${
              active === "#home"
                ? "border-camel/30 bg-camel/8 text-camel"
                : "border-transparent text-cocoa hover:border-khaki/40 hover:text-espresso"
            }`}
            title="Home"
          >
            <Home className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden text-xs font-medium tracking-widest uppercase lg:block">Home</span>
          </button>

          <button
            onClick={() => handleNav("#collection")}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2 transition-all duration-300 lg:px-5 lg:py-2.5 ${
              active === "#collection"
                ? "border-camel/30 bg-camel/8 text-camel"
                : "border-transparent text-cocoa hover:border-khaki/40 hover:text-espresso"
            }`}
            title="Collection"
          >
            <Gem className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden text-xs font-medium tracking-widest uppercase lg:block">Collection</span>
          </button>
        </nav>

        {/* Center — logo */}
        <button onClick={() => handleNav("#home")} className="absolute left-1/2 -translate-x-1/2">
          {logoError ? (
            <span className="font-serif text-2xl font-semibold tracking-wide text-espresso lg:text-3xl">Pooja Jewellers</span>
          ) : (
            <img
              src="https://plain-apac-prod-public.komododecks.com/202605/14/tFeA5iA04YT6LpCKL6em/image.png"
              alt="Pooja Jewellers"
              className="h-11 w-auto object-contain lg:h-14"
              onError={() => setLogoError(true)}
            />
          )}
        </button>

        {/* Right — Instagram */}
        <a
          href="https://www.instagram.com/pooja_jewellers_nagpur"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-2xl border border-transparent px-3 py-2 text-cocoa transition-all duration-300 hover:border-khaki/40 hover:text-espresso lg:px-4"
          title="Follow on Instagram"
        >
          <InstagramIcon className="h-4 w-4" />
          <span className="hidden text-xs font-medium tracking-widest uppercase lg:block">Follow</span>
        </a>
      </div>
    </header>
  );
}

/* ───────────────── collection page header ───────────────── */

function CollectionHeader() {
  const [logoError, setLogoError] = useState(false);
  const { navigate } = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-khaki/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-10 lg:py-4">
        {/* Back button */}
        <button
          onClick={() => {
            navigate("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 rounded-2xl border border-khaki/40 px-4 py-2 text-cocoa transition-all duration-300 hover:border-camel hover:bg-camel hover:text-white lg:px-5 lg:py-2.5"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden text-xs font-medium tracking-widest uppercase lg:block">Back</span>
        </button>

        {/* Center — logo */}
        <button onClick={() => { navigate("home"); window.scrollTo({ top: 0 }); }} className="absolute left-1/2 -translate-x-1/2">
          {logoError ? (
            <span className="font-serif text-2xl font-semibold tracking-wide text-espresso lg:text-3xl">Pooja Jewellers</span>
          ) : (
            <img
              src="https://plain-apac-prod-public.komododecks.com/202605/14/tFeA5iA04YT6LpCKL6em/image.png"
              alt="Pooja Jewellers"
              className="h-11 w-auto object-contain lg:h-14"
              onError={() => setLogoError(true)}
            />
          )}
        </button>

        {/* Right spacer */}
        <div className="w-[80px] lg:w-[100px]" />
      </div>
    </header>
  );
}

/* ───────────────── hero ───────────────── */

function Hero() {
  const { navigate } = useRouter();

  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
      <div className="absolute inset-0 bg-linen/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-linen via-linen/20 to-linen/60" />

      <div className="relative z-10 px-6 text-center">
        <p className="mb-5 font-sans text-[11px] font-semibold uppercase tracking-[.35em] text-camel md:text-xs">
          Gittikhadan, Nagpur
        </p>
        <h1 className="mx-auto max-w-4xl font-fancy text-6xl leading-[1.2] text-espresso sm:text-7xl md:text-8xl lg:text-9xl">
          Pooja Jewellers
        </h1>
        <p className="mx-auto mt-6 font-serif text-xl italic leading-relaxed text-cocoa/80 sm:text-2xl md:text-3xl">
          Timeless Elegance in Gold &amp; Silver
        </p>
        <p className="mx-auto mt-5 max-w-md font-sans text-sm font-normal leading-relaxed text-cocoa/60 md:text-[15px]">
          Discover handcrafted jewelry that celebrates tradition with a modern sensibility. Each piece tells a story of artistry and grace.
        </p>
        <button
          onClick={() => { navigate("collection"); window.scrollTo({ top: 0 }); }}
          className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-camel/40 bg-transparent px-8 py-4 font-sans text-[11px] font-semibold uppercase tracking-[.2em] text-espresso transition-all duration-500 hover:border-camel hover:bg-camel hover:text-white md:px-10"
        >
          Explore Collection
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}

/* ───────────────── product card ───────────────── */

function ProductCard({ product }: { product: Product }) {
  const { open } = useLightbox();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => open(product)}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
        <span className={`absolute top-4 left-4 rounded-xl border font-sans text-[10px] font-semibold uppercase tracking-[.12em] px-3 py-1.5 ${
          product.material === "Gold"
            ? "border-camel/30 bg-white/80 text-cocoa backdrop-blur-sm"
            : "border-espresso/15 bg-white/80 text-espresso backdrop-blur-sm"
        }`}>
          {product.material}
        </span>
      </div>
      <div className="pt-5 pb-2">
        <h3 className="font-serif text-lg font-semibold text-espresso transition-colors duration-300 group-hover:text-camel md:text-xl">
          {product.name}
        </h3>
      </div>
    </div>
  );
}

/* ───────────────── homepage featured collection ───────────────── */

function FeaturedCollection() {
  const { navigate } = useRouter();

  return (
    <section id="collection" className="bg-white px-6 pt-28 pb-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[.35em] text-camel">Curated for You</p>
          <h2 className="font-serif text-4xl font-semibold text-espresso md:text-5xl">Our Collection</h2>
          <div className="mx-auto mt-7 h-px w-12 bg-khaki" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
          {FEATURED.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Explore Full Collection — navigates to collection page */}
        <div className="mt-16 text-center">
          <button
            onClick={() => {
              navigate("collection");
              window.scrollTo({ top: 0 });
            }}
            className="group inline-flex items-center gap-3 rounded-2xl border border-camel/30 bg-transparent px-9 py-4 font-sans text-[11px] font-semibold uppercase tracking-[.18em] text-espresso transition-all duration-500 hover:border-camel hover:bg-camel hover:text-white"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Explore Full Collection
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── reviews ───────────────── */

function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth < 640 ? el.clientWidth - 32 : 360;
    el.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
  };

  return (
    <section className="bg-linen px-6 pt-28 pb-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[.35em] text-camel">What Our Clients Say</p>
          <h2 className="font-serif text-4xl font-semibold text-espresso md:text-5xl">Customer Reviews</h2>
          <div className="mx-auto mt-7 h-px w-12 bg-khaki" />
        </div>
        <div className="relative">
          {canScrollLeft && (
            <button onClick={() => scroll("left")} className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-2xl border border-khaki/50 bg-white p-2.5 text-cocoa transition-all duration-300 hover:border-camel hover:bg-camel hover:text-white lg:flex" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
          {canScrollRight && (
            <button onClick={() => scroll("right")} className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-2xl border border-khaki/50 bg-white p-2.5 text-cocoa transition-all duration-300 hover:border-camel hover:bg-camel hover:text-white lg:flex" aria-label="Next">
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
          <div ref={scrollRef} className="hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-1 pb-4 sm:gap-6">
            {REVIEWS.map((r) => (
              <div key={r.id} className="w-[85vw] max-w-[400px] flex-shrink-0 rounded-2xl border border-khaki/30 bg-white p-6 sm:w-[350px] sm:p-8">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-camel text-camel" />
                  ))}
                </div>
                <p className="mb-6 font-sans text-sm leading-relaxed text-cocoa/80">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linen">
                    <User className="h-4 w-4 text-camel" strokeWidth={1.5} />
                  </div>
                  <p className="font-serif text-sm font-semibold text-espresso">{r.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── reels ───────────────── */

function ReelsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <section className="bg-white px-6 pt-28 pb-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-khaki/40 bg-linen">
            <InstagramIcon className="h-5 w-5 text-camel" />
          </div>
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[.35em] text-camel">Follow Our Journey</p>
          <h2 className="font-serif text-3xl font-semibold text-espresso md:text-4xl">Latest Reels</h2>
          <div className="mx-auto mt-7 h-px w-12 bg-khaki" />
        </div>
        <div className="relative">
          <button onClick={() => scroll("left")} className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-2xl border border-khaki/50 bg-white p-2.5 text-cocoa transition-all duration-300 hover:border-camel hover:bg-camel hover:text-white lg:flex" aria-label="Scroll left">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button onClick={() => scroll("right")} className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-2xl border border-khaki/50 bg-white p-2.5 text-cocoa transition-all duration-300 hover:border-camel hover:bg-camel hover:text-white lg:flex" aria-label="Scroll right">
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div ref={scrollRef} className="hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-5">
            <div className="hidden shrink-0 lg:block lg:w-[calc((100%-6*210px-5*20px)/2)]" />
            {REEL_IMAGES.map((src, i) => (
              <div key={i} className="w-[180px] shrink-0 sm:w-[200px] md:w-[210px]">
                <a href="https://www.instagram.com/pooja_jewellers_nagpur" target="_blank" rel="noopener noreferrer" className="group relative block aspect-[9/16] overflow-hidden rounded-2xl bg-espresso">
                  <img src={src} alt={`Reel ${i + 1}`} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-espresso/20 transition-all duration-500 group-hover:bg-espresso/35">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-white/50 group-hover:bg-white/25">
                      <Play className="h-6 w-6 ml-0.5 text-white" fill="white" />
                    </div>
                    <span className="mt-3 font-sans text-[10px] font-semibold uppercase tracking-[.15em] text-white/80">Watch Reel</span>
                  </div>
                </a>
                <p className="mt-3 text-center font-sans text-[10px] font-medium uppercase tracking-wider text-cocoa/60">@pooja_jewellers_nagpur</p>
              </div>
            ))}
            <div className="hidden shrink-0 lg:block lg:w-[calc((100%-6*210px-5*20px)/2)]" />
          </div>
        </div>
        <div className="mt-14 text-center">
          <a href="https://www.instagram.com/pooja_jewellers_nagpur" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 rounded-2xl border border-camel/30 bg-transparent px-7 py-3.5 font-sans text-[11px] font-semibold uppercase tracking-[.15em] text-espresso transition-all duration-500 hover:border-camel hover:bg-camel hover:text-white">
            <InstagramIcon className="h-4 w-4" />
            Follow @pooja_jewellers_nagpur
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── footer ───────────────── */

function Footer() {
  return (
    <footer id="contact" className="bg-espresso px-6 pt-28 pb-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 md:grid-cols-3 md:gap-10">
          <div>
            <h3 className="mb-7 font-serif text-xl font-semibold text-white">Visit Us</h3>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-espresso-light">
              <iframe
                title="Pooja Jewellers Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.7897218417087!2d79.0500!3d21.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4c0d5_!2sGittikhadan%2C+Nagpur!5e0!3m2!1sen!2sin!4v1700000000000"
                className="h-full w-full border-0 opacity-60 grayscale contrast-[1.1]"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div className="flex flex-col items-start md:items-center">
            <h3 className="mb-7 font-serif text-xl font-semibold text-white">Contact Us</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-3.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-camel" strokeWidth={1.5} />
                <p className="font-sans text-sm leading-relaxed text-white/60">Pooja Jewellers,<br />Gittikhadan, Nagpur,<br />Maharashtra, India</p>
              </div>
              <div className="flex items-center gap-3.5">
                <Phone className="h-4 w-4 shrink-0 text-camel" strokeWidth={1.5} />
                <a href="tel:+919876543210" className="font-sans text-sm text-white/60 transition-colors hover:text-camel">+91 98765 43210</a>
              </div>
              <div className="flex items-center gap-3.5">
                <Mail className="h-4 w-4 shrink-0 text-camel" strokeWidth={1.5} />
                <a href="mailto:info@poojajewellers.com" className="font-sans text-sm text-white/60 transition-colors hover:text-camel">info@poojajewellers.com</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <h3 className="mb-7 font-serif text-xl font-semibold text-white">Connect</h3>
            <div className="mb-10 flex gap-3">
              <a href="https://instagram.com/pooja_jewellers_nagpur" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white/50 transition-all duration-300 hover:border-camel hover:text-camel">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href="https://facebook.com/poojajewellers" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white/50 transition-all duration-300 hover:border-camel hover:text-camel">
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
            <h4 className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[.2em] text-white/30">Store Hours</h4>
            <div className="space-y-1.5 text-right">
              <p className="font-sans text-sm text-white/50">Mon – Sat: 10:00 AM – 8:30 PM</p>
              <p className="font-sans text-sm text-white/50">Sunday: 11:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>
        <div className="mt-20 border-t border-white/8 pt-8 text-center">
          <p className="font-sans text-xs text-white/25">© {new Date().getFullYear()} Pooja Jewellers, Gittikhadan, Nagpur. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────── full collection page ───────────────── */

function CollectionPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const categoriesRef = useRef<HTMLDivElement>(null);

  const filtered = activeCategory === "All"
    ? ALL_PRODUCTS
    : activeCategory === "Gold" || activeCategory === "Silver"
      ? ALL_PRODUCTS.filter((p) => p.material === activeCategory)
      : ALL_PRODUCTS.filter((p) => p.category === activeCategory);

  /* Scroll category into view when selected */
  useEffect(() => {
    const el = document.querySelector(`[data-cat="${activeCategory}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      <CollectionHeader />

      {/* Page title */}
      <div className="px-6 pt-12 pb-8 lg:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[.35em] text-camel">Browse Our Range</p>
          <h1 className="font-serif text-4xl font-semibold text-espresso md:text-5xl">Full Collection</h1>
          <div className="mx-auto mt-7 h-px w-12 bg-khaki" />
        </div>
      </div>

      {/* Category filter bar — horizontal scroll */}
      <div className="sticky top-[60px] z-40 bg-white/80 backdrop-blur-xl border-b border-khaki/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div
            ref={categoriesRef}
            className="hide-scrollbar flex gap-2 overflow-x-auto py-4 sm:gap-3"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-cat={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-2xl border px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[.12em] transition-all duration-300 ${
                  activeCategory === cat
                    ? "border-camel bg-camel text-white"
                    : "border-khaki/40 bg-transparent text-cocoa hover:border-camel/50 hover:text-espresso"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product count */}
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-2 lg:px-10">
        <p className="font-sans text-xs tracking-wider text-cocoa/50">
          Showing <span className="font-semibold text-espresso">{filtered.length}</span> {filtered.length === 1 ? "piece" : "pieces"}
          {activeCategory !== "All" && (
            <span> in <span className="font-semibold text-camel">{activeCategory}</span></span>
          )}
        </p>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-28 lg:px-10">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <Gem className="mx-auto mb-4 h-10 w-10 text-khaki" strokeWidth={1} />
            <p className="font-serif text-xl text-cocoa">No pieces found in this category</p>
            <p className="mt-2 font-sans text-sm text-cocoa/50">Try browsing a different category</p>
          </div>
        )}
      </div>

      {/* CTA at bottom */}
      <div className="border-t border-khaki/15 bg-linen px-6 py-16 text-center">
        <p className="mb-3 font-serif text-2xl font-semibold text-espresso md:text-3xl">
          Looking for something bespoke?
        </p>
        <p className="mx-auto mb-8 max-w-md font-sans text-sm text-cocoa/60">
          Visit our store in Gittikhadan, Nagpur for custom designs and personalized consultations.
        </p>
        <a
          href="https://www.instagram.com/pooja_jewellers_nagpur"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-2xl border border-camel/40 bg-transparent px-8 py-4 font-sans text-[11px] font-semibold uppercase tracking-[.18em] text-espresso transition-all duration-500 hover:border-camel hover:bg-camel hover:text-white"
        >
          <InstagramIcon className="h-4 w-4" />
          Get in Touch
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

/* ───────────────── landing page ───────────────── */

function LandingPage() {
  return (
    <>
      <LandingHeader />
      <Hero />
      <FeaturedCollection />
      <Reviews />
      <ReelsSection />
      <Footer />
    </>
  );
}

/* ───────────────── app root ───────────────── */

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);

  const navigate = useCallback((p: Page) => {
    setPage(p);
  }, []);

  const openLightbox = useCallback((product: Product) => {
    setLightboxProduct(product);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxProduct(null);
  }, []);

  return (
    <RouterContext.Provider value={{ page, navigate }}>
      <LightboxContext.Provider value={{ open: openLightbox }}>
        <div className="min-h-screen bg-white font-sans">
          {page === "home" && <LandingPage />}
          {page === "collection" && <CollectionPage />}
        </div>
        <LightboxModal product={lightboxProduct} onClose={closeLightbox} />
      </LightboxContext.Provider>
    </RouterContext.Provider>
  );
}
