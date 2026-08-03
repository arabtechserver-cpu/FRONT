"use client";

import React, { useState, useEffect } from "react";
import { FEATURES } from "@/features";

export default function ProtectionModal() {
  const [verified, setVerified] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || verified || !FEATURES.showProtectionModal) return null;

  const handleVerify = () => {
    setVerified(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 15, 30, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(34, 211, 238, 0.05) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "30px 24px",
          width: "100%",
          maxWidth: "360px",
          textAlign: "center",
          boxShadow: "rgba(0, 0, 0, 0.5) 0px 20px 40px, rgba(255, 255, 255, 0.02) 0px 0px 20px inset",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: "2.5rem",
              marginBottom: "12px",
              filter: "drop-shadow(rgba(255, 255, 255, 0.2) 0px 0px 10px)",
            }}
          >
            🛡️
          </div>
          <h3
            style={{
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "8px",
              fontSize: "1.2rem",
            }}
          >
            نظام حماية الموقع
          </h3>
          <p
            style={{
              color: "#ef4444",
              fontWeight: "bold",
              fontSize: "0.9rem",
              marginBottom: "14px",
              lineHeight: 1.5,
            }}
          >
            يرجى نقل الموقع على سيرفر خاص لتجنب المشاكل
          </p>
          <p
            style={{
              color: "rgb(148, 163, 184)",
              fontSize: "0.85rem",
              marginBottom: "22px",
              lineHeight: 1.5,
            }}
          >
            يرجى النقر على الزر أدناه للتحقق من أنك إنسان
          </p>
          <button
            onClick={handleVerify}
            style={{
              position: "relative",
              width: "100%",
              height: "54px",
              background: "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "rgba(0, 0, 0, 0.2) 0px 8px 20px",
              transition: "0.3s",
              outline: "none",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                border: "2px solid rgba(255, 255, 255, 0.5)",
                display: "inline-block",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
            أنا إنسان (انقر للتحقق)
          </button>
        </div>
      </div>
    </div>
  );
}
