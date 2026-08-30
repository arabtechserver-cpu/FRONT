"use client";

import { useState } from 'react';

export default function AnnouncementOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(10, 10, 10, 0.98)',
      color: 'white',
      zIndex: 999999999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#ff4d4d', fontWeight: 'bold' }}>
        تنبيه هام جداً
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '15px', lineHeight: '1.8' }}>
        تم نقل الموقع بالكامل إلى الرابط الجديد:<br/>
        <a href="https://arabtechproserver.tech" style={{ color: '#00b4d8', textDecoration: 'underline', fontWeight: 'bold', display: 'inline-block', marginTop: '10px' }} dir="ltr">
          https://arabtechproserver.tech
        </a>
      </p>
      <p style={{ fontSize: '1.2rem', marginBottom: '20px', lineHeight: '1.6', color: '#e0e0e0' }}>
        يرجى التواصل مع الدعم الفني عبر واتساب لنقل رصيدك وأموالك إلى الموقع الجديد:
        <br/>
        <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginTop: '10px', fontSize: '1.5rem', padding: '10px 20px', border: '2px solid #25D366', borderRadius: '8px' }} dir="ltr">
          💬 +249 12 366 7227
        </a>
      </p>
      <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '40px' }}>
        شكراً لتعاونكم وثقتكم بنا.
      </p>
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          padding: '12px 40px',
          fontSize: '1.2rem',
          backgroundColor: '#333',
          color: 'white',
          border: '1px solid #555',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background 0.3s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#444'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#333'}
      >
        إغلاق الرسالة
      </button>
    </div>
  );
}
