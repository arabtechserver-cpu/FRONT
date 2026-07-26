const fs = require('fs');

let content = fs.readFileSync('src/components/MainLayout.js', 'utf8');

// 1. Remove sidebar
content = content.replace(/\{\/\*\s*Desktop Sidebar \(RTL Right Side\)\s*\*\/\}[\s\S]*?<\/aside>/g, '');

// 2. Replace Header
const newHeader = `{/* Top Navbar */}
        <header className="custom-navbar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          height: '70px',
          background: 'rgba(10, 15, 30, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div className="custom-navbar-glow"></div>
          
          {/* Right Section (Logo & Mobile Menu) */}
          <div className="flex items-center gap-3">
            <button className="header-btn lg-hidden w-9 h-9" type="button" aria-label="القائمة" onClick={() => setMenuOpen(!menuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu w-5 h-5">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
            <Link className="flex items-center gap-2" style={{ textDecoration: 'none', minWidth: 0, flex: 1 }} href="/">
              {settings.site_logo && settings.site_logo !== 'default' && !logoFailed ? (
                <img src={settings.site_logo.startsWith('http') || settings.site_logo.startsWith('/') || settings.site_logo.startsWith('data:') ? settings.site_logo : \`\${API_BASE_URL}\${settings.site_logo}\`} alt={settings.site_name} onError={() => setLogoFailed(true)} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: 'linear-gradient(135deg, rgb(79, 70, 229) 0%, rgb(99, 102, 241) 100%)', color: '#ffffff', boxShadow: 'rgba(79, 70, 229, 0.3) 0px 2px 10px', flexShrink: 0 }}>
                  {settings.site_name ? settings.site_name.charAt(0) : 'S'}
                </div>
              )}
              <span className="font-black" style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)' }}>{settings.site_name}</span>
            </Link>
          </div>

          {/* Center Section (Desktop Links) */}
          <nav className="nav-desktop-links lg-flex hidden items-center gap-6" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Link href="/" className={\`desktop-link \${pathname === '/' ? 'active' : ''}\`}>الرئيسية</Link>
            <Link href="/services" className={\`desktop-link \${pathname.startsWith('/services') ? 'active' : ''}\`}>الخدمات</Link>
            <Link href="/orders" className={\`desktop-link \${pathname.startsWith('/orders') ? 'active' : ''}\`}>الطلبات</Link>
            <Link href="/wallet" className={\`desktop-link \${pathname.startsWith('/wallet') ? 'active' : ''}\`}>المحفظة</Link>
            <button type="button" onClick={() => setSupportModalOpen(true)} className="desktop-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>تواصل معنا</button>
          </nav>

          {/* Left Section (Auth & WhatsApp & Theme) */}
          <div className="flex items-center gap-3" style={{ position: 'relative' }}>
            <button onClick={toggleTheme} className="theme-toggle-btn header-btn lg-block hidden" aria-label="تبديل المظهر" style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            
            <div className="lg-block">
              {isCustomerLoggedIn && customerUser ? (
                <div style={{ position: 'relative' }}>
                  <button className="header-user-btn" type="button" onClick={() => setProfileMenuOpen(!profileMenuOpen)} title="الملف الشخصي" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                    <div className="font-black text-sm" style={{ color: 'rgb(79, 70, 229)' }}>
                      {customerUser.username ? customerUser.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{customerUser.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><path d="m6 9 6 6 6-6"></path></svg>
                  </button>

                  {/* Dropdown */}
                  {profileMenuOpen && (
                    <div className="header-profile-dropdown" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', width: '220px', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '12px', padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000 }}>
                      <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                        <div style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.85rem', marginTop: '2px' }}>
                          {renderBalanceDropdownAndValue(customerUser)}
                        </div>
                      </div>
                      <Link href="/orders" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>📦 طلباتي</Link>
                      <Link href="/wallet" className="header-dropdown-item" onClick={() => setProfileMenuOpen(false)}>💳 شحن المحفظة</Link>
                      <button onClick={() => { handleCustomerLogout(); setProfileMenuOpen(false); }} className="header-dropdown-item" style={{ color: 'var(--danger-color)', width: '100%', textAlign: 'right' }} type="button">🚪 تسجيل الخروج</button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href="/login" style={{ textDecoration: 'none', padding: '6px 16px', background: 'var(--primary-color)', color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>تسجيل</Link>
                  <Link href="/login" style={{ textDecoration: 'none', padding: '6px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>دخول</Link>
                </div>
              )}
            </div>
          </div>
        </header>`;

content = content.replace(/\{\/\* Top Navbar \(Reference style matching tsmart-one\.online\) \*\/\}[\s\S]*?<\/header>/g, newHeader);

fs.writeFileSync('src/components/MainLayout.js', content, 'utf8');
console.log('MainLayout updated!');
