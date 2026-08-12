"use client";

import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config";

const fallbackRate = 600;

export default function ExchangeRatesTab({ token }) {
  const [mode, setMode] = useState("auto");
  const [rate, setRate] = useState("");
  const [currentRate, setCurrentRate] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const applyRate = (data) => {
    const nextRate = Number(data?.rate) || fallbackRate;
    setCurrentRate(nextRate);
    setRate(String(nextRate));
    setMode(data?.mode === "manual" ? "manual" : "auto");
    setUpdatedAt(data?.updatedAt || null);
    setSource(data?.source || "");
  };

  const loadRate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange-rates/sdg`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load exchange rate.");
      applyRate(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRate();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange-rates/sdg`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, rate: Number(rate) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save exchange settings.");
      applyRate(data);
      setMessage("Exchange rate settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const refreshRate = async () => {
    setRefreshing(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/exchange-rates/sdg/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to refresh exchange rate.");
      applyRate(data);
      setMessage("Latest rate fetched and saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div style={{ background: "var(--bg-glass)", border: "var(--border-glass)", borderRadius: 16, padding: 24 }}>
        <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.45rem" }}>SDG exchange rate</h2>
        <p style={{ margin: "8px 0 0", color: "var(--text-muted)", lineHeight: 1.7 }}>
          Show the Sudanese pound value in the customer wallet only. Choose automatic daily data or enter a manual rate.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>1 USD equals</div>
          <strong style={{ display: "block", marginTop: 8, color: "#38bdf8", fontSize: "1.65rem" }}>
            {loading ? "..." : `${Number(currentRate || fallbackRate).toFixed(2)} SDG`}
          </strong>
        </div>
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>1 SDG equals</div>
          <strong style={{ display: "block", marginTop: 8, color: "#34d399", fontSize: "1.65rem" }}>
            {loading ? "..." : `$${(1 / Number(currentRate || fallbackRate)).toFixed(6)} USD`}
          </strong>
        </div>
      </div>

      <div style={{ background: "var(--bg-glass)", border: "var(--border-glass)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 8, color: "var(--text-main)", fontWeight: 700 }}>
          Update mode
          <select value={mode} onChange={(event) => setMode(event.target.value)} style={{ padding: 12, borderRadius: 10, background: "var(--input-bg)", color: "var(--text-main)", border: "var(--border-glass)" }}>
            <option value="auto">Automatic from free API</option>
            <option value="manual">Manual rate</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 8, color: "var(--text-main)", fontWeight: 700 }}>
          SDG per 1 USD
          <input type="number" min="0.000001" step="0.000001" value={rate} onChange={(event) => setRate(event.target.value)} disabled={mode !== "manual"} style={{ padding: 12, borderRadius: 10, background: "var(--input-bg)", color: "var(--text-main)", border: "var(--border-glass)", opacity: mode === "manual" ? 1 : 0.65 }} />
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button type="button" onClick={saveSettings} disabled={saving || loading} className="glass-btn glass-btn-primary">
            {saving ? "Saving..." : "Save settings"}
          </button>
          <button type="button" onClick={refreshRate} disabled={refreshing || loading} className="glass-btn">
            {refreshing ? "Refreshing..." : "Refresh from API"}
          </button>
        </div>

        <div style={{ color: "var(--text-muted)", fontSize: "0.84rem", lineHeight: 1.7 }}>
          <div>Source: {source || "saved rate"}</div>
          <div>Last update: {updatedAt ? new Date(updatedAt).toLocaleString() : "not available"}</div>
          <a href="https://www.exchangerate-api.com/docs/free" target="_blank" rel="noreferrer" style={{ color: "var(--primary-color)" }}>ExchangeRate-API Open Access documentation</a>
        </div>

        {(message || error) && (
          <div style={{ color: error ? "#f87171" : "#34d399", fontWeight: 700 }}>{error || message}</div>
        )}
      </div>
    </div>
  );
}
