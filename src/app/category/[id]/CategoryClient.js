"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL, fetchWithTimeout } from "@/config";

export default function CategoryServices({ params }) {
  // Unwrap params using React.use() to comply with Next.js 15+ specifications
  const unwrappedParams = use(params);
  const categoryId = unwrappedParams.id;
  const router = useRouter();

  const [categoryName, setCategoryName] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);

  // Backup static services if backend is unreachable
  const staticServices = [
    {
      id: 1,
      category_id: 1,
      name: "ببجي موبايل (PUBG Mobile)",
      description: "اشحن شدات ببجي موبايل فوراً ومباشرة في حسابك عن طريق الآيدي ID بأفضل الأسعار.",
      price: 0.99,
      image: "pubg",
      packages: [
        { id: 1, name: "60 شدة (UC)", price: 0.99 },
        { id: 2, name: "325 شدة (UC)", price: 4.85 },
        { id: 3, name: "660 شدة (UC)", price: 9.50 }
      ]
    },
    {
      id: 2,
      category_id: 1,
      name: "فري فاير (Free Fire)",
      description: "اشحن جواهر فري فاير فوراً لتفعيل الفاير باس والحصول على أحدث سكنات اللعبة عبر الآيدي.",
      price: 1.10,
      image: "freefire",
      packages: [
        { id: 1, name: "110 جوهرة", price: 1.10 },
        { id: 2, name: "231 جوهرة", price: 2.20 }
      ]
    },
    {
      id: 3,
      category_id: 2,
      name: "بيجو لايف (Bigo Live)",
      description: "اشحن فاصوليا ومجوهرات تطبيق بيجو لايف لدعم البث المباشر المفضل لديك.",
      price: 1.25,
      image: "bigo",
      packages: [
        { id: 1, name: "42 جوهرة", price: 1.25 }
      ]
    },
    {
      id: 4,
      category_id: 3,
      name: "فودافون كاش مصر (Vodafone Cash)",
      description: "شحن رصيد وتحويل أموال عبر محفظة فودافون كاش مباشرة بسعر الصرف الممتاز.",
      price: 1.00,
      image: "vodafone",
      packages: [
        { id: 1, name: "إرسال 100 جنيه مصري", price: 2.10 }
      ]
    },
    {
      id: 5,
      category_id: 4,
      name: "شحن رصيد USDT (TRC20)",
      description: "شراء وسحب عملة USDT الرقمية بأفضل أسعار الصرف وبسرعة تنفيذ خيالية.",
      price: 1.00,
      image: "usdt",
      packages: [
        { id: 1, name: "10 USDT", price: 10.30 }
      ]
    },
    {
      id: 6,
      category_id: 5,
      name: "اشتراك كانفا برو (Canva Pro)",
      description: "تفعيل اشتراك كانفا برو الحساب الشخصي بكافة ميزات التصميم والذكاء الاصطناعي.",
      price: 1.99,
      image: "canva",
      packages: [
        { id: 1, name: "تفعيل لمدة شهر", price: 1.99 }
      ]
    },
    {
      id: 7,
      category_id: 6,
      name: "اشتراك نتفليكس (Netflix Premium)",
      description: "شاشة خاصة بك بجودة 4K UHD على حساب نتفليكس مشترك أو حساب مستقل بالكامل.",
      price: 2.50,
      image: "netflix",
      packages: [
        { id: 1, name: "شاشة واحدة لمدة شهر 4K", price: 2.50 }
      ]
    }
  ];

  const categoryNamesMap = {
    1: "قسم الالعاب",
    2: "تطبيقات اللايف",
    3: "بطاقات الكترونية",
    4: "الأرصدة والعملات",
    5: "سوشال ميديا",
    6: "خدمات السيرفر",
    7: "اشتراكات",
    8: "الذكاء الاصطناعي",
    9: "قسم الارقام",
    10: "البرمجة والتصميم",
    11: "حسابات جاهزة",
    12: "إعلانات ممولة",
    13: "خدمات Apple و iCloud",
    14: "قسم خدمات سيرفر والأدوات",
    15: "Apple",
    16: "أدوات وتفعيلات السيرفر (Schematics & Tools)"
  };

  useEffect(() => {
    // Fetch category name and all categories
    fetchWithTimeout(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(cats => {
        setAllCategories(cats || []);
        const cat = (cats || []).find(c => c.id === Number(categoryId));
        if (cat) setCategoryName(cat.name);
        else setCategoryName(categoryNamesMap[categoryId] || "الخدمات المتاحة");
      })
      .catch(() => {
        setCategoryName(categoryNamesMap[categoryId] || "الخدمات المتاحة");
      });

    // Fetch services filtering by category_id with optional customer token
    const token = typeof window !== 'undefined' ? localStorage.getItem("customer_token") : null;
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetchWithTimeout(`${API_BASE_URL}/api/services?category_id=${categoryId}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback filtering by category ID
        const filtered = staticServices.filter(s => s.category_id === Number(categoryId));
        setServices(filtered);
        setLoading(false);
      });
  }, [categoryId]);

  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "dark");
    const token = localStorage.getItem("customer_token");
    const userStr = localStorage.getItem("customer_user");
    if (token && userStr) {
      setIsCustomerLoggedIn(true);
      try {
        setCustomerUser(JSON.parse(userStr));
      } catch {}
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    setIsCustomerLoggedIn(false);
    setCustomerUser(null);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);

  const getFallbackEmoji = (name = "", image = "") => {
    const lowerName = (name || "").toLowerCase();
    const lowerImg = (image || "").toLowerCase();
    
    if (lowerImg.includes("pubg") || lowerName.includes("pubg") || lowerName.includes("ببجي")) return "🔫";
    if (lowerImg.includes("freefire") || lowerImg.includes("free fire") || lowerName.includes("فري فاير") || lowerName.includes("free fire") || lowerName.includes("freefire")) return "🔥";
    if (lowerImg.includes("bigo") || lowerName.includes("بيجو")) return "💬";
    if (lowerImg.includes("vodafone") || lowerName.includes("فودافون")) return "📱";
    if (lowerImg.includes("usdt") || lowerName.includes("usdt") || lowerName.includes("عملة") || lowerName.includes("أرصدة")) return "🪙";
    if (lowerImg.includes("canva") || lowerName.includes("كانفا")) return "🎨";
    if (lowerImg.includes("netflix") || lowerName.includes("نتفليكس")) return "🎬";
    if (lowerName.includes("ايفون") || lowerName.includes("iphone") || lowerName.includes("ipad") || lowerName.includes("ايباد") || lowerName.includes("bypass") || lowerName.includes("تخط") || lowerName.includes("icloud") || lowerName.includes("ايكلاود") || lowerName.includes("hello") || lowerName.includes("removal") || lowerName.includes("hfz") || lowerName.includes("smd") || lowerName.includes("otix")) return "📱";
    
    return "⚡";
  };

  const getServiceIcon = (image, name = "") => {
    if (!image) return getFallbackEmoji(name, image);
    if (image.startsWith("data:image") || image.startsWith("http") || image.includes("uploads")) {
      const src = image.startsWith("http") || image.startsWith("data:") 
        ? image 
        : (image.startsWith("/") ? `${API_BASE_URL}${image}` : `${API_BASE_URL}/${image}`);
      return <img 
        src={src} 
        alt="Service Icon" 
        onError={(e) => {
          e.target.style.display = 'none';
          const parent = e.target.parentElement;
          if (parent) {
            parent.innerText = getFallbackEmoji(name, image);
          }
        }}
        style={{ width: "45px", height: "45px", objectFit: "contain", borderRadius: "8px" }} 
      />;
    }
    if (image.includes("pubg")) return "🔫";
    if (image.includes("freefire")) return "🔥";
    if (image.includes("bigo")) return "💬";
    if (image.includes("vodafone")) return "📱";
    if (image.includes("usdt")) return "🪙";
    if (image.includes("canva")) return "🎨";
    if (image.includes("netflix")) return "🎬";
    return "⚡";
  };

  const currentCategory = allCategories.find(c => c.id === Number(categoryId));
  const parentCategory = currentCategory?.parent_id ? allCategories.find(c => c.id === Number(currentCategory.parent_id)) : null;
  const subCategories = allCategories.filter(c => Number(c.parent_id) === Number(categoryId)).sort((a, b) => a.name.localeCompare(b.name, 'en'));

  return (
    <>
      {/* Breadcrumb if subcategory */}
      {parentCategory && (
        <div style={{ marginBottom: "15px" }}>
          <Link href={`/category/${parentCategory.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary-color)", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem", background: "var(--bg-glass)", padding: "8px 16px", borderRadius: "100px", border: "var(--border-glass)", transition: "all 0.2s" }}>
            ← العودة إلى قسم {parentCategory.name}
          </Link>
        </div>
      )}

      {/* Page Title */}
      <div dir="ltr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "12px", flexWrap: "wrap" }}>
        <h2 className="section-title" style={{ fontSize: "calc(1.5rem * var(--font-scale, 1))", margin: 0 }}>قسم {categoryName}</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
          {services.length} خدمة متوفرة
        </span>
      </div>

      {/* Subcategories Grid if any */}
      {subCategories.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h3 dir="ltr" className="section-title" style={{ fontSize: "calc(1.25rem * var(--font-scale, 1))", marginBottom: "18px" }}>الأقسام الفرعية</h3>
          <div className="scc-grid">
            {subCategories.map((cat) => {
              const color = cat.color || "#6366f1";
              let imgSrc = null;
              if (cat.image && cat.image !== "default" && cat.image !== "null") {
                if (cat.image.startsWith("http") || cat.image.startsWith("data:")) {
                  imgSrc = cat.image;
                } else {
                  const cleanPath = cat.image.startsWith("/") ? cat.image : `/${cat.image}`;
                  imgSrc = `${API_BASE_URL}${cleanPath}`;
                }
              }

              const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '99, 102, 241';
              };
              const glow = `rgba(${hexToRgb(color)}, 0.35)`;

              return (
                <div className="scc-wrap" key={cat.id}>
                  <Link
                    className="scc-card"
                    dir="ltr"
                    href={`/category/${cat.id}`}
                    style={{ "--scc-ac": color, "--scc-gl": glow }}
                  >
                    <div className="scc-side-line"></div>
                    {imgSrc && (
                      <div className="scc-img-ring" style={{ borderColor: color }}>
                        <div className="scc-img-inner">
                          <img
                            src={imgSrc}
                            alt={cat.name}
                            loading="lazy"
                            className="scc-img"
                            onError={e => {
                              e.target.style.display = 'none';
                              const ring = e.target.closest('.scc-img-ring');
                              if (ring) ring.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="scc-content">
                      <span className="scc-name">{cat.name}</span>
                      <div className="scc-meta">
                        <div className="scc-dot" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
                        <span>دخول القسم</span>
                      </div>
                    </div>
                    <div className="scc-arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                        <path d="m9 18 6-6-6-6"></path>
                      </svg>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Services Grid (Subcategories scc-grid) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2rem", fontWeight: 700 }}>
          جاري تحميل الخدمات...
        </div>
      ) : services.length === 0 ? (
        subCategories.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: "center", padding: "40px" }}>
            <span style={{ fontSize: "3rem" }}>📭</span>
            <h3 style={{ margin: "15px 0 10px 0" }}>لا تتوفر خدمات في هذا القسم حالياً</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>سندرج خدمات جديدة قريباً جداً، ترقبوا التحديثات!</p>
            <Link href="/" className="glass-btn glass-btn-primary">العودة للرئيسية</Link>
          </div>
        ) : null
      ) : (
        <>
          {/* Category Services Search Bar */}
          {services.length > 2 && (
            <div style={{ marginBottom: "20px", position: "relative", width: "100%" }}>
              <input
                type="text"
                placeholder="البحث عن خدمة في هذا القسم..."
                value={serviceSearchTerm}
                onChange={(e) => setServiceSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 15px",
                  fontSize: "0.95rem",
                  borderRadius: "12px",
                  border: theme === "light" ? "1.5px solid #000000" : "1px solid var(--border-glass)",
                  background: "var(--bg-glass)",
                  color: "var(--text-main)",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
              <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", opacity: 0.6, fontSize: "1rem" }}>🔍</span>
              {serviceSearchTerm && (
                <button
                  type="button"
                  onClick={() => setServiceSearchTerm("")}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "1.1rem"
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {(() => {
            const filteredServices = services.filter(service => 
              service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
            ).sort((a, b) => a.name.localeCompare(b.name, 'en'));

            if (filteredServices.length === 0) {
              return (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-glass)", borderRadius: "16px", border: "var(--border-glass)" }}>
                  لا تتوفر خدمات مطابقة للبحث في هذا القسم.
                </div>
              );
            }

            return (
              <div className="scc-grid">
                {filteredServices.flatMap((service) => {
                  const isCustomImg = service.image && (service.image.startsWith("data:image") || service.image.startsWith("http") || service.image.includes("uploads"));
                  
                  // Premium colors per category
                  const categoryColors = {
                    1: '#6366f1', // games
                    2: '#eab308', // live apps
                    3: '#a855f7', // cards
                    4: '#06b6d4', // balances/currencies
                    5: '#ec4899', // social media
                    6: '#10b981', // server services
                    7: '#d946ef', // subscriptions
                    8: '#eab308', // AI
                    9: '#6366f1', // numbers
                    10: '#6366f1', // programming/design
                    11: '#eab308', // ready accounts
                    12: '#ec4899'  // ads
                  };
                  const catColor = categoryColors[service.category_id] || '#6366f1';
                  
                  const hexToRgb = (hex) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '99, 102, 241';
                  };
                  const catGlow = `rgba(${hexToRgb(catColor)}, 0.35)`;

                  const imgSrc = isCustomImg
                    ? (service.image.startsWith("http") || service.image.startsWith("data:") 
                        ? service.image 
                        : (service.image.startsWith("/") ? `${API_BASE_URL}${service.image}` : `${API_BASE_URL}/${service.image}`))
                    : null;

                  if (service.packages && service.packages.length > 0) {
                    return service.packages.map((pkg, idx) => {
                      return (
                        <div className="scc-wrap" key={`${service.id}-${pkg.id}`}>
                          <Link 
                            href={`/service/${service.id}?package=${pkg.id}`} 
                            className="scc-card" 
                            dir="ltr" 
                            style={{ '--scc-ac': catColor, '--scc-gl': catGlow }}
                          >
                            <div className="scc-side-line"></div>
                            {imgSrc && (
                              <div className="scc-img-ring">
                                <div className="scc-img-inner">
                                  <img 
                                    src={imgSrc} 
                                    alt={(pkg.name === "تفعيل فوري تلقائي" || !pkg.name) ? service.name : pkg.name} 
                                    loading="lazy" 
                                    className="scc-img" 
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const ring = e.target.closest('.scc-img-ring');
                                      if (ring) {
                                        ring.style.display = 'none';
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            <div className="scc-content">
                              <span className="scc-name">{(pkg.name === "تفعيل فوري تلقائي" || !pkg.name) ? service.name : pkg.name}</span>
                              <div className="scc-meta" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4.5px" }}>
                                <span style={{ color: "var(--primary-color)", fontWeight: 900, fontSize: "0.95rem" }}>
                                  $ {Number(pkg.price).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="scc-arrow">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                                <path d="m9 18 6-6-6-6"></path>
                              </svg>
                            </div>
                          </Link>
                        </div>
                      );
                    });
                  }

                  return (
                    <div className="scc-wrap" key={service.id}>
                      <Link 
                        href={`/service/${service.id}`} 
                        className="scc-card" 
                        dir="ltr" 
                        style={{ '--scc-ac': catColor, '--scc-gl': catGlow }}
                      >
                        <div className="scc-side-line"></div>
                        {imgSrc && (
                          <div className="scc-img-ring">
                            <div className="scc-img-inner">
                              <img 
                                src={imgSrc} 
                                alt={service.name} 
                                loading="lazy" 
                                className="scc-img" 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const ring = e.target.closest('.scc-img-ring');
                                  if (ring) {
                                    ring.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="scc-content">
                          <span className="scc-name">{service.name}</span>
                          <div className="scc-meta" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                            {service.price > 0 ? (
                              <span style={{ color: "var(--primary-color)", fontWeight: 900, fontSize: "0.9rem" }}>
                                $ {Number(service.price).toFixed(2)}
                              </span>
                            ) : (
                              <>
                                <div className="scc-dot"></div>
                                <span>اضغط للعرض</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="scc-arrow">
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                            <path d="m9 18 6-6-6-6"></path>
                          </svg>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </>
      )}
    </>
  );
}
