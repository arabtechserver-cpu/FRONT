"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const SOCIAL_LINKS = [
  {
    id: "wa1",
    title: "واتساب الإدارة 1",
    url: "https://wa.me/16728972935",
    color: "#25D366",
    bg: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/>
      </svg>
    )
  },
  {
    id: "fb",
    title: "صفحة الفيسبوك",
    url: "https://www.facebook.com/ARABTECHSERVEROnline",
    color: "#1877F2",
    bg: "linear-gradient(135deg, #1877F2 0%, #0056b3 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    id: "wa2",
    title: "واتساب الإدارة 2",
    url: "https://wa.me/249123667227",
    color: "#10b981",
    bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/>
      </svg>
    )
  },
  {
    id: "yt",
    title: "قناة اليوتيوب",
    url: "https://youtube.com/@arab-tech-server?si=1L5yUgv_jlCk3Vez",
    color: "#FF0000",
    bg: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  {
    id: "tg",
    title: "قناة تيليجرام",
    url: "https://t.me/arabtechserveronline",
    color: "#0088cc",
    bg: "linear-gradient(135deg, #0088cc 0%, #006699 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.763-.169.711-.43 1.05-.683 1.073-.55.05-1.042-.366-1.575-.716-.834-.547-1.306-.888-2.116-1.421-.937-.618-.329-.958.204-1.512.14-.145 2.569-2.356 2.616-2.557.006-.025.011-.122-.047-.173-.058-.051-.144-.034-.206-.02-.089.02-1.501.954-4.238 2.802-.401.275-.764.41-1.089.403-.358-.008-1.047-.202-1.56-.369-.629-.205-1.129-.313-1.085-.661.023-.182.274-.369.753-.561 2.955-1.287 4.927-2.137 5.914-2.548 2.822-1.173 3.407-1.377 3.79-1.384.084-.001.272.02.394.119.103.084.132.197.145.276.014.08.03.26-.002.434z"/>
      </svg>
    )
  },
  {
    id: "tt",
    title: "تيك توك",
    url: "https://tiktok.com/@arabtechsuppurt",
    color: "#fe2c55",
    bg: "linear-gradient(135deg, #000000 0%, #fe2c55 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.378A6.347 6.347 0 0 0 3.5 15.672a6.35 6.35 0 0 0 10.84 4.492V12.38a8.217 8.217 0 0 0 5.25 1.862V10.8a4.79 4.79 0 0 1-3.77-4.114z"/>
      </svg>
    )
  },
  {
    id: "comm",
    title: "مجتمع الواتساب",
    url: "https://chat.whatsapp.com/DINRDwU2lVjFcGRowxT3m5",
    color: "#34d399",
    bg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    )
  }
];

export default function ContactFloatingButton() {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "16px",
        bottom: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse",
        gap: "12px",
        alignItems: "center"
      }}
    >
      {/* Main Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="التواصل معنا"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: open 
            ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" 
            : "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
          color: "#ffffff",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          boxShadow: open 
            ? "0 8px 25px rgba(239, 68, 68, 0.5)" 
            : "0 8px 25px rgba(14, 165, 233, 0.5)",
          transform: open ? "rotate(90deg) scale(1.05)" : "rotate(0deg) scale(1)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          cursor: "pointer",
          outline: "none"
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Pop-up List of Circular Social Icons */}
      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            gap: "10px",
            alignItems: "center",
            animation: "fadeInUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        >
          {SOCIAL_LINKS.map((item) => {
            const isHovered = hoveredId === item.id;

            return (
              <div
                key={item.id}
                style={{ position: "relative", display: "flex", alignItems: "center" }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Circular Icon Button */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.title}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: item.bg,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isHovered
                      ? `0 6px 20px ${item.color}88, 0 0 0 3px rgba(255,255,255,0.2)`
                      : "0 4px 12px rgba(0, 0, 0, 0.25)",
                    transform: isHovered ? "scale(1.14)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    textDecoration: "none",
                    cursor: "pointer"
                  }}
                >
                  {item.icon}
                </a>

                {/* Tooltip on Hover */}
                {isHovered && (
                  <div
                    style={{
                      position: "absolute",
                      left: "56px",
                      whiteSpace: "nowrap",
                      background: "rgba(15, 23, 42, 0.92)",
                      color: "#ffffff",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      pointerEvents: "none",
                      zIndex: 10000
                    }}
                  >
                    {item.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

