const fs = require('fs');
const path = require('path');
const filePath = path.join('D:', 'pj', 'spider-store-front', 'frontend', 'src', 'app', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

// Add visibleCount state
if (!content.includes('const [visibleCount, setVisibleCount] = useState(14);')) {
  content = content.replace('const [reviews, setReviews] = useState([]);', 'const [reviews, setReviews] = useState([]);\n  const [visibleCount, setVisibleCount] = useState(14);');
}

// Replace the categories rendering
const oldGridStart = content.indexOf('<div className="modern-grid">', content.indexOf('filteredCategories.length === 0'));
if (oldGridStart !== -1) {
  const oldGridEnd = content.indexOf('</div>', content.lastIndexOf('</Link>')) + 6;
  const newGrid = `<div className="categories-list-view">
            {filteredCategories.slice(0, visibleCount).map((cat) => {
              const color = cat.color || "#6366f1";
              let imgSrc = getFullImageUrl(cat.image);

              return (
                <Link
                  key={cat.id}
                  href={\`/category/\${cat.id}\`}
                  className="modern-card"
                  style={{ "--card-color": color }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="card-icon-wrapper">
                      {imgSrc && imgSrc !== "default" && imgSrc !== "null" ? (
                        <img src={imgSrc} alt={cat.name} className="card-icon-img" />
                      ) : (
                        <div className="card-icon-placeholder" style={{ backgroundColor: \`\${color}22\`, color: color }}>
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{cat.name}</h3>
                    </div>
                  </div>
                  <div className="card-action">
                    <span style={{ fontWeight: 'bold' }}>تصفح الخدمات</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
                  </div>
                  <div className="card-glow" style={{ backgroundColor: color }}></div>
                </Link>
              );
            })}
          </div>
          {visibleCount < filteredCategories.length && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => setVisibleCount(prev => prev + 14)}
                className="glass-btn"
                style={{ padding: '12px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', border: '1px solid var(--primary-color)', color: 'var(--text-main)', cursor: 'pointer', background: 'rgba(99, 102, 241, 0.1)' }}
              >
                عرض المزيد ▼
              </button>
            </div>
          )}`;
  content = content.substring(0, oldGridStart) + newGrid + content.substring(oldGridEnd);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated homepage categories');
