import React from "react";
import { API_BASE_URL } from "@/config";

export default function BannersTab({
  banners,
  bannerSearch,
  setBannerSearch,
  handleOpenEditBanner,
  handleDeleteBanner
}) {
  const filteredBanners = banners.filter((b) => b.title.toLowerCase().includes(bannerSearch.toLowerCase()));

  return (
    <>
      <div className="table-filter-bar" style={{ justifyContent: "flex-start" }}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input-premium"
            placeholder="ابحث باسم الشريحة..."
            value={bannerSearch}
            onChange={(e) => setBannerSearch(e.target.value)}
          />
          <span className="search-input-icon">🔍</span>
        </div>
      </div>

      <div className="premium-table-wrapper">
        <table className="premium-table">
          <thead>
            <tr>
              <th>رقم الشريحة</th>
              <th>الشريحة / العنوان</th>
              <th>الوصف</th>
              <th>الشارة / الخصم</th>
              <th>الرمز / اللون</th>
              <th style={{ textAlign: "center" }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  لا توجد شرائح إعلانية مضافة حالياً.
                </td>
              </tr>
            ) : (
              filteredBanners.map((banner) => (
                <tr key={banner.id}>
                  <td data-label="رقم الشريحة" style={{ fontWeight: 800, color: "#38bdf8" }}>#{banner.id}</td>
                  <td data-label="الشريحة / العنوان">
                    <div style={{ fontWeight: 700 }}>{banner.title}</div>
                    <div style={{ fontSize: "0.85rem", color: banner.color || "#8b5cf6", fontWeight: "bold" }}>
                      {banner.highlight}
                    </div>
                  </td>
                  <td data-label="الوصف" style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {banner.desc}
                  </td>
                  <td data-label="الشارة / الخصم">
                    {banner.badge ? (
                      <span className="premium-badge" style={{ background: `${banner.color || "#8b5cf6"}22`, color: banner.color || "#8b5cf6", border: `1px solid ${banner.color || "#8b5cf6"}33` }}>
                        {banner.badge}
                      </span>
                    ) : (
                      <span style={{ color: "#64748b" }}>لا يوجد</span>
                    )}
                  </td>
                  <td data-label="الرمز / اللون">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {banner.icon && (banner.icon.startsWith("data:image") || banner.icon.startsWith("http") || banner.icon.startsWith("/uploads")) ? (
                        <img src={banner.icon.startsWith("/uploads") ? `${API_BASE_URL}${banner.icon}` : banner.icon} alt={banner.title} style={{ width: "35px", height: "35px", objectFit: "contain", borderRadius: "6px" }} />
                      ) : (
                        <span style={{ fontSize: "1.4rem" }}>{banner.icon}</span>
                      )}
                      <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: banner.color || "#8b5cf6", display: "inline-block", border: "1px solid rgba(255,255,255,0.1)" }} />
                    </div>
                  </td>
                  <td data-label="الإجراءات" style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => handleOpenEditBanner(banner)} className="action-btn btn-edit-premium">
                        تعديل
                      </button>
                      <button onClick={() => handleDeleteBanner(banner.id)} className="action-btn btn-danger-premium">
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
