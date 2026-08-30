export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', width: '100%' }}>
      <div style={{
        width: '100%',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        animation: 'pulse 1.5s infinite ease-in-out'
      }} />
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{
          width: '30%',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          animation: 'pulse 1.5s infinite ease-in-out',
          display: 'none' // hidden on mobile by default
        }} className="loading-sidebar" />
        <div style={{
          width: '100%',
          flex: 1,
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          animation: 'pulse 1.5s infinite ease-in-out'
        }} />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @media (min-width: 1024px) {
          .loading-sidebar {
            display: block !important;
          }
        }
      `}} />
    </div>
  );
}
