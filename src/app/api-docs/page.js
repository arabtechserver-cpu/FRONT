"use client";

import React from "react";

export default function ApiDocsPage() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          padding: "36px 24px",
          borderRadius: "16px",
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          textAlign: "center",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 18px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
        >
          🔒
        </div>
        <h2
          style={{
            color: "#ef4444",
            fontSize: "1.35rem",
            fontWeight: 700,
            margin: "0 0 12px",
          }}
        >
          تم تعطيل هذه الميزة من قبل مسؤول النظام.
        </h2>
      </div>
    </div>
  );
}
