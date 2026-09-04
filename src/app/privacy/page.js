"use client";

import Link from "next/link";
import React from "react";

export default function PrivacyPage() {
  return (
    <div className="up-page privacy-page" dir="rtl">

      {/* ── Hero Header ── */}
      <div className="up-hero">
        <div className="up-hero-icon">🔒</div>
        <div className="up-hero-text">
          <h1 className="up-hero-title">سياسة الخصوصية</h1>
          <p className="up-hero-desc">
            نحن في سيرفر الوفاق نلتزم بحماية خصوصيتك وبياناتك الشخصية.
            توضح هذه السياسة كيف نجمع بياناتك ونستخدمها ونحميها.
          </p>
        </div>
      </div>

      <div className="up-two-col">
        {/* ── Main Content ── */}
        <div className="up-stack">

          <div className="up-info-card">
            <h3 className="up-info-card-title">
              <span style={{ color: "var(--primary-color)" }}>👤</span> البيانات التي نجمعها
            </h3>
            <p className="up-info-card-body">
              نجمع فقط البيانات الضرورية لتقديم خدماتنا وتحسينها، مثل بيانات
              الحساب، معلومات الدفع، وسجلات الخوادم المرتبطة بالخدمة.
            </p>
          </div>

          <div className="up-info-card">
            <h3 className="up-info-card-title">
              <span style={{ color: "var(--primary-color)" }}>📊</span> كيف نستخدمها
            </h3>
            <p className="up-info-card-body">
              نستخدم بياناتك لتقديم الخدمات، معالجة الطلبات، تحسين الأداء، والتواصل
              معك بشأن التحديثات المهمة.
            </p>
          </div>

          <div className="up-info-card">
            <h3 className="up-info-card-title">
              <span style={{ color: "var(--primary-color)" }}>🔐</span> حماية البيانات
            </h3>
            <p className="up-info-card-body">
              نطبق أعلى معايير الأمان لحماية بياناتك من الوصول غير المصرح به،
              باستخدام التشفير، الجدران النارية، والمراقبة المستمرة.
            </p>
          </div>

          <div className="up-info-card">
            <h3 className="up-info-card-title">
              <span style={{ color: "var(--primary-color)" }}>👥</span> حقوقك
            </h3>
            <p className="up-info-card-body">
              لديك الحق في الوصول إلى بياناتك، تصحيحها، أو طلب حذفها. كما يمكنك
              الاعتراض على المعالجة أو سحب الموافقة في أي وقت.
            </p>
          </div>

          <div className="up-info-card">
            <h3 className="up-info-card-title">
              <span style={{ color: "var(--primary-color)" }}>🔄</span> تحديثات السياسة
            </h3>
            <p className="up-info-card-body">
              نحتفظ بالحق في تحديث سياسة الخصوصية. سيتم إشعارك بالتغييرات الجوهرية
              عبر البريد الإلكتروني أو إشعار بارز على الموقع.
            </p>
          </div>

        </div>

        {/* ── Side Box ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="up-side-box">
            <p className="up-side-box-title">
              <span>🙋</span> لديك سؤال متعلق بالخصوصية؟
            </p>
            <ul className="up-side-box-list">
              <li>فريقنا هنا لمساعدتك والرد على استفساراتك بسرية تامة.</li>
            </ul>
            <Link href="/services" className="up-btn-primary" style={{ marginTop: "16px", textAlign: "center", justifyContent: "center" }}>
              🛡️ تواصل بشأن الخصوصية
            </Link>
          </div>

          <div className="up-side-box">
            <p className="up-side-box-title">
              <span>🛡️</span> نلتزم بالثقة
            </p>
            <ul className="up-side-box-list">
              <li>خصوصيتك أولوية لنا. نحن ملتزمون بالشفافية والرد على استفساراتك باستمرار.</li>
              <li>بالشفافية وحماية بياناتك دائماً.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div className="up-footer-cta">
        <div>
          <p className="up-footer-cta-text">🔒 ملتزمون بحماية خصوصيتك</p>
          <p className="up-footer-cta-desc">بيانات آمنة ومحمية بأعلى معايير الأمان.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/" className="up-btn-ghost">🏠 الرئيسية</Link>
          <Link href="/terms" className="up-btn-primary">📋 شروط الاستخدام</Link>
        </div>
      </div>

    </div>
  );
}
