import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  ShoppingBag,
  Star,
  ArrowRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  CreditCard
} from 'lucide-react';

interface Theme {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  border_radius?: string;
  font_family?: string;
}

interface Section {
  type: string;
  content?: any;
  settings?: any;
}

interface Product {
  id?: string | number;
  name: string;
  price: string | number;
  image_url?: string;
  description?: string;
  badge?: string;
}

interface JsonStorefrontProps {
  storeName: string;
  storeSlug: string;
  whatsapp: string;
  logoUrl: string;
  design: any;
  dbProducts: Product[];
  onVisit?: () => void;
  onOrder?: (productName: string, productId?: string | number) => void;
}

const JsonStorefront: React.FC<JsonStorefrontProps> = ({
  storeName,
  storeSlug,
  whatsapp,
  logoUrl,
  design = {},
  dbProducts = [],
  onVisit,
  onOrder,
}) => {
  useEffect(() => {
    onVisit?.();
  }, [onVisit]);

  const tenant = design.tenant || {};
  const theme: Theme = {
    ...(design.theme || {}),
    ...(tenant.theme || {})
  };

  const colors = {
    primary: theme.primary_color || design.primaryColor || '#D91D2A',
    secondary: theme.secondary_color || '#0B1A2E',
    accent: theme.accent_color || '#FFC72C',
    bg: theme.background_color || '#FAFAFA',
    text: theme.text_color || '#111827',
    radius: theme.border_radius || '14px',
    font: theme.font_family || 'DM Sans, system-ui, sans-serif',
  };

  const sections: Section[] = design.layout_sections || design.sections || [];

  const normalizePhone = (phone: string) => {
    const clean = phone.replace(/\\D/g, '');
    if (!clean) return '';
    let normalized = clean;
    if (normalized.startsWith('0')) {
      normalized = '254' + normalized.slice(1);
    } else if (!normalized.startsWith('254') && normalized.length === 9) {
      normalized = '254' + normalized;
    }
    return normalized;
  };

  const getImageUrl = (url?: string, seed?: string) => {
    if (!url) return `https://picsum.photos/seed/${seed || 'default'}/800/600`;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `https://picsum.photos/seed/${seed || url}/800/600`;
  };

  const handleOrder = (product: Product) => {
    const phone = normalizePhone(whatsapp);
    const text = encodeURIComponent(`Hello ${storeName}, I would like to order: ${product.name} (Price: ${product.price})`);
    onOrder?.(product.name, product.id);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const allProducts = React.useMemo(() => {
    const jsonProducts: Product[] = [];
    sections.forEach(s => {
      if (s.type === 'product_grid' || s.type === 'products') {
        if (Array.isArray(s.content?.products)) {
          jsonProducts.push(...s.content.products);
        }
      }
    });

    const dbSet = new Set(jsonProducts.map(p => p.name.toLowerCase()));
    const filteredDb = dbProducts.filter(p => !dbSet.has(p.name.toLowerCase()));

    return [...jsonProducts, ...filteredDb];
  }, [sections, dbProducts]);

  const SectionRenderer = ({ section }: { section: Section }) => {
    const { type, content, settings } = section;

    switch (type) {
      case 'hero_carousel':
      case 'hero':
      case 'home': {
        const items = Array.isArray(content) ? content : [content];
        return (
          <section className="relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
            {items.map((item: any, i: number) => (
              <div key={i} className="relative min-h-[60vh] flex items-center justify-center px-6 py-20">
                <div className="absolute inset-0 z-0">
                  <img
                    src={getImageUrl(item.image, `hero-${i}`)}
                    className="w-full h-full object-cover opacity-40"
                    alt="Hero"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="relative z-10 text-center max-w-4xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                    style={{ fontFamily: colors.font }}
                  >
                    {item.headline || item.title || storeName}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl text-gray-200 mb-10"
                    style={{ fontFamily: colors.font }}
                  >
                    {item.subheadline || item.description || ''}
                  </motion.p>
                  <motion.a
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    href={`https://wa.me/${normalizePhone(whatsapp)}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold transition-transform hover:scale-105"
                    style={{ backgroundColor: colors.primary, borderRadius: colors.radius }}
                  >
                    <ShoppingBag size={20} />
                    {item.cta_text || 'Shop Now'}
                  </motion.a>
                </div>
              </div>
            ))}
          </section>
        );
      }

      case 'feature_grid':
      case 'features': {
        const features = Array.isArray(content) ? content : content?.features || [];
        return (
          <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f: any, i: number) => (
                <div key={i} className="p-8 text-center transition-all hover:shadow-lg" style={{ borderRadius: colors.radius, backgroundColor: 'white' }}>
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: colors.primary }}>
                    {f.icon === 'truck' && <ShoppingBag size={24} />}
                    {f.icon === 'secure' && <CheckCircle2 size={24} />}
                    {f.icon === 'support' && <MessageCircle size={24} />}
                    {f.icon === 'star' && <Star size={24} />}
                    {!['truck', 'secure', 'support', 'star'].includes(f.icon) && <CheckCircle2 size={24} />}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: colors.text, fontFamily: colors.font }}>{f.title}</h3>
                  <p className="text-gray-600" style={{ fontFamily: colors.font }}>{f.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'category_pills':
      case 'categories': {
        const cats = Array.isArray(content) ? content : content?.categories || [];
        return (
          <section className="py-12 px-6 max-w-7xl mx-auto">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {cats.map((c: any, i: number) => (
                <button
                  key={i}
                  className="whitespace-nowrap px-6 py-3 font-medium transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: 'white',
                    color: colors.text,
                    borderRadius: colors.radius,
                    border: `1px solid ${colors.primary}22`
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  {c.name || c.label}
                </button>
              ))}
            </div>
          </section>
        );
      }

      case 'product_grid':
      case 'products': {
        const products = Array.isArray(content?.products) ? content.products : [];
        const gridProducts = products.length > 0 ? products : allProducts;

        return (
          <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.text, fontFamily: colors.font }}>
                {settings?.title || 'Our Products'}
              </h2>
              <div className="w-20 h-1 mx-auto" style={{ backgroundColor: colors.primary }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {gridProducts.map((p: Product, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden transition-all"
                  style={{ borderRadius: colors.radius, backgroundColor: 'white', border: `1px solid ${colors.text}11` }}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={getImageUrl(p.image_url, p.name)}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      alt={p.name}
                    />
                    {p.badge && (
                      <div className="absolute top-3 left-3 px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: colors.accent, borderRadius: '4px' }}>
                        {p.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg truncate" style={{ color: colors.text, fontFamily: colors.font }}>{p.name}</h3>
                    <p className="text-xl font-bold mb-4" style={{ color: colors.primary, fontFamily: colors.font }}>{p.price}</p>
                    <button
                      onClick={() => handleOrder(p)}
                      className="w-full py-3 flex items-center justify-center gap-2 text-white font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.primary, borderRadius: colors.radius }}
                    >
                      <MessageCircle size={18} />
                      Order via WhatsApp
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );
      }

      case 'promo_strip': {
        return (
          <section className="py-12 px-6 max-w-7xl mx-auto">
            <div className="relative overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white" style={{ backgroundColor: colors.secondary, borderRadius: colors.radius }}>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: colors.font }}>{content?.title || 'Special Offer!'}</h2>
                <p className="text-lg opacity-90" style={{ fontFamily: colors.font }}>{content?.subtitle || 'Get the best deals today on our premium collection.'}</p>
              </div>
              <a
                href={`https://wa.me/${normalizePhone(whatsapp)}`}
                className="whitespace-nowrap px-8 py-4 rounded-full font-bold transition-transform hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: colors.primary, borderRadius: colors.radius }}
              >
                Claim Offer <ArrowRight size={20} />
              </a>
            </div>
          </section>
        );
      }

      case 'testimonial_grid': {
        const quotes = Array.isArray(content) ? content : content?.testimonials || [];
        return (
          <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text, fontFamily: colors.font }}>Customer Love</h2>
              <div className="flex justify-center gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quotes.map((q: any, i: number) => (
                <div key={i} className="p-8 relative transition-all" style={{ borderRadius: colors.radius, backgroundColor: 'white', border: `1px solid ${colors.text}11` }}>
                  <div className="text-4xl absolute top-4 right-4 opacity-10" style={{ color: colors.primary }}>“</div>
                  <p className="text-gray-600 mb-6 italic" style={{ fontFamily: colors.font }}>{q.text}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <img src={getImageUrl(q.image, q.author)} alt={q.author} />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: colors.text, fontFamily: colors.font }}>{q.author}</div>
                      <div className="text-sm text-gray-500">{q.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'footer':
      case 'contact': {
        return (
          <footer className="py-20 px-6 bg-white border-t" style={{ borderTopColor: `${colors.text}11` }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  {logoUrl && <img src={logoUrl} className="w-10 h-10 object-contain" alt="Logo" />}
                  <span className="text-2xl font-bold" style={{ color: colors.text, fontFamily: colors.font }}>{storeName}</span>
                </div>
                <p className="text-gray-600 mb-6" style={{ fontFamily: colors.font }}>{content?.about || `Welcome to ${storeName}. Quality products delivered to your doorstep.`}</p>
                <div className="flex gap-4">
                  <a href="#" className="p-3 rounded-full transition-colors" style={{ backgroundColor: `${colors.text}11`, color: colors.text }}><Facebook size={20} /></a>
                  <a href="#" className="p-3 rounded-full transition-colors" style={{ backgroundColor: `${colors.text}11`, color: colors.text }}><Instagram size={20} /></a>
                  <a href="#" className="p-3 rounded-full transition-colors" style={{ backgroundColor: `${colors.text}11`, color: colors.text }}><Mail size={20} /></a>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-6" style={{ color: colors.text, fontFamily: colors.font }}>Contact Us</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-600" style={{ fontFamily: colors.font }}>
                    <Phone size={18} style={{ color: colors.primary }} /> {content?.phone || whatsapp}
                  </li>
                  <li className="flex items-center gap-3 text-gray-600" style={{ fontFamily: colors.font }}>
                    <Mail size={18} style={{ color: colors.primary }} /> {content?.email || 'contact@store.com'}
                  </li>
                  <li className="flex items-center gap-3 text-gray-600" style={{ fontFamily: colors.font }}>
                    <MapPin size={18} style={{ color: colors.primary }} /> {content?.address || 'Nairobi, Kenya'}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-6" style={{ color: colors.text, fontFamily: colors.font }}>Quick Order</h4>
                <p className="text-gray-600 mb-6" style={{ fontFamily: colors.font }}>Ready to buy? Message us directly on WhatsApp for instant ordering.</p>
                <a
                  href={`https://wa.me/${normalizePhone(whatsapp)}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold transition-transform hover:scale-105"
                  style={{ backgroundColor: colors.primary, borderRadius: colors.radius }}
                >
                  <MessageCircle size={20} />
                  Chat with Us
                </a>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t text-center text-gray-500 text-sm" style={{ borderColor: `${colors.text}11`, fontFamily: colors.font }}>
              © {new Date().getFullYear()} {storeName}. Powered by StoYangu
            </div>
          </footer>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: colors.bg, fontFamily: colors.font, color: colors.text }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors" style={{ backgroundColor: `${colors.bg}ee`, borderBottomColor: `${colors.text}11` }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl && <img src={logoUrl} className="w-10 h-10 object-contain" alt="Logo" />}
            <span className="text-xl font-bold" style={{ color: colors.text }}>{storeName}</span>
          </div>
          <a
            href={`https://wa.me/${normalizePhone(whatsapp)}`}
            className="hidden md:flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: colors.primary, borderRadius: colors.radius }}
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
        </div>
      </header>

      <main>
        {sections.length > 0 ? (
          sections.map((s, i) => <SectionRenderer key={i} section={s} />)
        ) : (
          <div className="py-20 px-6 max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: colors.text }}>{storeName}</h1>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">Welcome to our store. Explore our curated collection of premium products.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {allProducts.map((p, i) => (
                <div key={i} className="p-4 text-center" style={{ backgroundColor: 'white', borderRadius: colors.radius, border: `1px solid ${colors.text}11` }}>
                  <img src={getImageUrl(p.image_url, p.name)} className="aspect-square object-cover mb-4 rounded-lg" alt={p.name} />
                  <h3 className="font-bold mb-2">{p.name}</h3>
                  <p className="text-lg font-bold mb-4" style={{ color: colors.primary }}>{p.price}</p>
                  <button
                    onClick={() => handleOrder(p)}
                    className="w-full py-2 text-white font-semibold"
                    style={{ backgroundColor: colors.primary, borderRadius: colors.radius }}
                  >
                    Order Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile WhatsApp FAB */}
      <a
        href={`https://wa.me/${normalizePhone(whatsapp)}`}
        className="fixed bottom-6 right-6 z-50 p-4 text-white shadow-2xl transition-transform hover:scale-110"
        style={{ backgroundColor: '#25D366', borderRadius: '50%' }}
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
};

export default JsonStorefront;
