import React from "react";

export default function Page() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh", padding: "20px" }}>
      <div style={{ maxWidth: "500px", width: "100%", padding: "36px 24px", borderRadius: "16px", background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(239, 68, 68, 0.25)", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "18px" }}>🔒</div>
        <h2 style={{ color: "#ef4444", fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
          تم تعطيل هذه الميزة من قبل مسؤول النظام.
        </h2>
      </div>
    </div>
  );
}
