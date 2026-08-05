"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SiteLoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const pathname = usePathname();

  // Skip loading screen on Admin pages
  const isAdmin = pathname && pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      setVisible(false);
      return;
    }

    // Start progress bar animation to 100% over 7s
    const timer = setTimeout(() => {
      setProgress(100);
    }, 50);

    // Fade out after ~6.4s, remove from DOM after 7.2s
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 6400);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 7200);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [isAdmin]);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      if (duration && duration > 0) {
        // Dynamically adjust playbackRate so video finishes right around 6.5s - 7s
        const targetRate = duration / 6.5;
        videoRef.current.playbackRate = Math.min(Math.max(targetRate, 1.0), 3.0);
      } else {
        videoRef.current.playbackRate = 1.5;
      }
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 500);
  };

  if (isAdmin || !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "#030712",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadingOut ? 0 : 1,
        visibility: fadingOut ? "hidden" : "visible",
        transition: "opacity 0.8s ease, visibility 0.8s ease",
        pointerEvents: fadingOut ? "none" : "all",
        overflow: "hidden"
      }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src="/site_loading.mp4"
        autoPlay
        muted
        playsInline
        onLoadedMetadata={handleVideoLoaded}
        onEnded={handleSkip}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          inset: 0,
          zIndex: 1,
          filter: "brightness(0.9) contrast(1.05)"
        }}
      />

      {/* Subtle Overlay Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 40%, rgba(3, 7, 18, 0.7) 100%)",
          zIndex: 2,
          pointerEvents: "none"
        }}
      />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        type="button"
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 10,
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#ffffff",
          padding: "8px 18px",
          borderRadius: "100px",
          fontSize: "0.85rem",
          fontWeight: 700,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease"
        }}
      >
        تخطي التحميل ✕
      </button>

      {/* Bottom 7-Second Progress Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: "rgba(255, 255, 255, 0.1)",
          zIndex: 10
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #0ea5e9, #6366f1, #10b981)",
            transition: "width 6.8s linear",
            boxShadow: "0 0 12px rgba(14, 165, 233, 0.8)"
          }}
        />
      </div>
    </div>
  );
}
