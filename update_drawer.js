const fs = require('fs');
const path = require('path');
const filePath = path.join('D:', 'pj', 'spider-store-front', 'frontend', 'src', 'components', 'MainLayout.js');
let content = fs.readFileSync(filePath, 'utf8');

const drawerStart = content.indexOf('<div className={`mobile-drawer ${menuOpen ? "open" : "closed"}`}>');
if (drawerStart === -1) {
    console.log('Drawer start not found');
    process.exit(1);
}

const drawerEnd = content.indexOf('</div>', content.indexOf('mobile-drawer-divider', content.indexOf('تسجيل الخروج'))) + 6;

const newDrawer = `<div className={\`mobile-drawer \${menuOpen ? "open" : "closed"}\`}>
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-title" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "1.25rem" }}>
            {settings.site_logo && settings.site_logo !== "default" && !logoFailed ? (
              <img
                src={settings.site_logo.startsWith("http") || settings.site_logo.startsWith("/") || settings.site_logo.startsWith("data:") ? settings.site_logo : \`\${API_BASE_URL}\${settings.site_logo}\`}
                alt={settings.site_name}
                onError={() => setLogoFailed(true)}
                style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
              />
            ) : (
              <div className="logo-circle" style={{ width: "38px", height: "38px", fontSize: "1.2rem", background: "linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%)", borderRadius: "10px", color: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                {settings.site_name ? settings.site_name.charAt(0) : "S"}
              </div>
            )}
            <span style={{ fontWeight: 900 }}>{settings.site_name}</span>
          </span>
          <button className="mobile-drawer-close" onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.08)", border: "none", width: "36px", height: "36px", borderRadius: "50%", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>✕</button>
        </div>

        {isCustomerLoggedIn && customerUser ? (
          <div className="mobile-drawer-user-card" style={{ marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", padding: "16px", background: "linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(139, 92, 246, 0.1))", borderRadius: "16px", border: "1px solid rgba(79, 70, 229, 0.2)" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800 }}>مرحباً، {customerUser.username} 👋</div>
            <div style={{ fontSize: "0.9rem", color: "var(--primary-color)", fontWeight: 900, background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px", display: "inline-block" }}>
              {renderBalanceDropdownAndValue(customerUser)}
            </div>
          </div>
        ) : (
          <Link href="/login" className="mobile-drawer-link" onClick={() => setMenuOpen(false)} style={{ background: "var(--primary-color)", color: "white", justifyContent: "center", borderRadius: "12px", padding: "14px" }}>
            <span style={{ fontSize: "1.2rem" }}>👤</span>
            تسجيل الدخول / حساب جديد
          </Link>
        )}

        <div className="mobile-drawer-divider" style={{ margin: "12px 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link href="/" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: "1.2rem" }}>🏠</span> الرئيسية
          </Link>
          <Link href="/services" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: "1.2rem" }}>🛒</span> الخدمات المتاحة
          </Link>
          <Link href="/orders" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: "1.2rem" }}>📦</span> تتبع الطلبات
          </Link>
          {isCustomerLoggedIn && (
            <Link href="/wallet" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span style={{ fontSize: "1.2rem" }}>💳</span> شحن رصيدي
            </Link>
          )}
          <Link href="/terms" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: "1.2rem" }}>⚖️</span> الشروط وسياسة الاسترجاع
          </Link>
          <button
            type="button"
            onClick={() => { setSupportModalOpen(true); setMenuOpen(false); }}
            className="mobile-drawer-link"
            style={{ width: "100%", textAlign: "right", border: "none", display: "flex", alignItems: "center", background: "transparent", padding: "14px 16px" }}
          >
            <span style={{ fontSize: "1.2rem" }}>💬</span> الدعم الفني
          </button>
        </div>

        <div className="mobile-drawer-divider" style={{ margin: "16px 0" }} />

        {/* Premium Font Scale Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", margin: "4px 0" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>📝</span>
            حجم الخط
          </span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "10px" }}>
            <button
              onClick={() => adjustFontScale(-0.05)}
              style={{ background: "transparent", border: "none", color: "var(--text-main)", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold", transition: "0.2s" }}
              title="تصغير الخط"
              type="button"
            >A-</button>
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }}></div>
            <button
              onClick={resetFontScale}
              style={{ background: "transparent", border: "none", color: "var(--text-main)", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "900", transition: "0.2s" }}
              title="حجم افتراضي"
              type="button"
            >A</button>
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }}></div>
            <button
              onClick={() => adjustFontScale(0.05)}
              style={{ background: "transparent", border: "none", color: "var(--text-main)", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold", transition: "0.2s" }}
              title="تكبير الخط"
              type="button"
            >A+</button>
          </div>
        </div>

        {/* Premium Theme Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", margin: "4px 0" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>{theme === "dark" ? "🌙" : "☀️"}</span>
            المظهر الليلي
          </span>
          <button
            onClick={toggleTheme}
            style={{
              background: theme === "dark" ? "var(--primary-color)" : "rgba(0, 0, 0, 0.15)",
              border: "none",
              borderRadius: "20px",
              width: "56px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              cursor: "pointer",
              transition: "background-color 0.4s ease",
              position: "relative",
              outline: "none"
            }}
            type="button"
          >
            <div style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: theme === "dark" ? "translateX(-26px)" : "translateX(0)"
            }} />
          </button>
        </div>

        {isCustomerLoggedIn && (
          <>
            <div className="mobile-drawer-divider" style={{ margin: "12px 0" }} />
            <button className="mobile-drawer-link danger" onClick={() => { handleCustomerLogout(); setMenuOpen(false); }} style={{ justifyContent: "center", padding: "14px", borderRadius: "12px", fontWeight: 900 }}>
              🚪 تسجيل الخروج
            </button>
          </>
        )}
      </div>`;

content = content.substring(0, drawerStart) + newDrawer + content.substring(drawerEnd + 6);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Mobile drawer redesigned');
