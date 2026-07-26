const dashboardStyles = `
        .admin-dashboard-root {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          min-height: 100vh;
          background-color: #060814;
          background-image: 
            radial-gradient(circle at 5% 15%, rgba(239, 68, 68, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 85% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 45%),
            radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
          background-attachment: fixed;
          color: #f8fafc;
          font-family: 'Cairo', sans-serif;
          overflow-x: hidden;
        }

        /* Ambient animated aurora bg spheres */
        .admin-dashboard-root::before, .admin-dashboard-root::after {
          content: '';
          position: fixed;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(120px);
          opacity: 0.45;
          mix-blend-mode: screen;
        }

        .admin-dashboard-root::before {
          top: -100px;
          right: -50px;
          background: radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%);
          animation: adminFloat1 25s infinite alternate ease-in-out;
        }

        .admin-dashboard-root::after {
          bottom: -100px;
          left: -50px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 70%);
          animation: adminFloat2 30s infinite alternate ease-in-out;
        }

        @keyframes adminFloat1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-50px, 50px) scale(1.1); }
        }

        @keyframes adminFloat2 {
          0% { transform: translate(0, 0) scale(1.05); }
          100% { transform: translate(50px, -50px) scale(0.95); }
        }

        /* Sidebar Glass Styling */
        .premium-sidebar {
          background: rgba(10, 12, 26, 0.4);
          backdrop-filter: blur(35px) saturate(180%);
          -webkit-backdrop-filter: blur(35px) saturate(180%);
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 30px 24px;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 10;
          overflow-y: auto;
        }

        .premium-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .premium-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .premium-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .premium-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .premium-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 25px;
        }

        .premium-logo .logo-circle {
          width: 42px;
          height: 42px;
          font-size: 1.4rem;
          font-weight: 900;
          border-radius: 14px;
          background: linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
          animation: spiderPulse 2s ease-in-out infinite;
        }

        .premium-logo span {
          font-weight: 900;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #ff4444 0%, #ffffff 50%, #ff2222 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: spiderNameGlow 2.5s ease-in-out infinite;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
        }

        .nav-item-premium {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 14px;
          color: #94a3b8;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
        }

        .nav-item-premium:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(-4px);
        }

        .nav-item-premium.active {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(244, 63, 94, 0.03) 100%);
          border-color: rgba(239, 68, 68, 0.2);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.1);
          border-right: 3px solid #ef4444;
        }

        .nav-icon {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .nav-item-premium.active .nav-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 8px #ef4444);
        }

        /* Content Area */
        .premium-content {
          padding: 40px;
          z-index: 1;
          position: relative;
        }

        /* Top Header */
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 35px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .header-title-section h1 {
          font-size: 2.1rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .header-title-section p {
          color: #94a3b8;
          font-size: 0.92rem;
          margin-top: 6px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Stats Cards */
        .premium-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 35px;
        }

        .premium-stat-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        }

        .premium-stat-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.35);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .premium-stat-card::after {
          content: '';
          position: absolute;
          width: 100px;
          height: 100px;
          background: var(--glow-color, rgba(239, 68, 68, 0.12));
          filter: blur(40px);
          top: -20px;
          left: -20px;
          border-radius: 50%;
        }

        .stat-card-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 1;
        }

        .stat-card-title {
          font-size: 0.88rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .stat-card-value {
          font-size: 1.8rem;
          font-weight: 900;
          color: #ffffff;
        }

        .stat-card-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: var(--icon-bg, rgba(255, 255, 255, 0.02));
          border: 1px solid var(--icon-border, rgba(255, 255, 255, 0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          z-index: 1;
          color: var(--icon-color, #ffffff);
          box-shadow: var(--icon-shadow, none);
          transition: transform 0.3s ease;
        }

        .premium-stat-card:hover .stat-card-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        /* Filters and Actions Bar */
        .table-filter-bar {
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          gap: 15px;
          flex-wrap: wrap;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .search-input-wrapper {
          position: relative;
          flex-grow: 1;
          max-width: 340px;
        }

        .search-input-premium {
          width: 100%;
          background: rgba(255, 255, 255, 0.02) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 12px !important;
          padding: 10px 16px 10px 42px !important;
          color: white !important;
          font-size: 0.92rem !important;
          outline: none;
          transition: all 0.3s ease;
        }

        .search-input-premium:focus {
          border-color: rgba(239, 68, 68, 0.4) !important;
          background: rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.15) !important;
        }

        .search-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 1rem;
        }

        .status-tabs-wrapper {
          display: flex;
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 5px;
          border-radius: 12px;
        }

        .status-tab-btn {
          background: transparent;
          border: none;
          padding: 6px 16px;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .status-tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.02);
        }

        .status-tab-btn.active {
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        /* Glass Table Design */
        .premium-table-wrapper {
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 20px;
          overflow-x: auto;
          overflow-y: hidden;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3);
          margin-bottom: 25px;
        }

        .premium-table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
          text-align: right;
        }

        .premium-table th {
          background: rgba(255, 255, 255, 0.02);
          padding: 16px 20px;
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.88rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          white-space: nowrap;
        }

        .premium-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          font-size: 0.9rem;
          color: #cbd5e1;
          white-space: nowrap;
        }

        .premium-table tr:hover td {
          background: rgba(255, 255, 255, 0.015);
          color: #ffffff;
        }

        .premium-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          gap: 6px;
        }

        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .premium-badge-pending {
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.18);
        }
        .premium-badge-pending .badge-dot { background: #fbbf24; }

        .premium-badge-processing {
          background: #fbbf24;
          color: #000000 !important;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .premium-badge-processing .badge-dot { background: #000000; }

        .premium-badge-approved {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.18);
        }
        .premium-badge-approved .badge-dot { background: #34d399; }

        .premium-badge-completed {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.18);
        }
        .premium-badge-completed .badge-dot { background: #34d399; }

        .premium-badge-rejected {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.18);
        }
        .premium-badge-rejected .badge-dot { background: #f87171; }

        .premium-badge-cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.18);
        }
        .premium-badge-cancelled .badge-dot { background: #f87171; }

        /* Custom Action Buttons */
        .action-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-success-premium {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.22);
        }
        .btn-success-premium:hover {
          background: #10b981;
          color: white;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
        }

        .btn-danger-premium {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.22);
        }
        .btn-danger-premium:hover {
          background: #ef4444;
          color: white;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
        }

        .btn-edit-premium {
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-edit-premium:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }

        .btn-add-premium {
          background: linear-gradient(135deg, #ef4444 0%, #8b5cf6 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.25);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .btn-add-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
        }

        /* Categories Grid Layout */
        .category-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 20px;
        }

        .category-card-premium {
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .category-card-premium:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          background: rgba(255, 255, 255, 0.02);
        }

        .category-icon-big {
          font-size: 2.8rem;
          margin-bottom: 12px;
          display: inline-block;
          filter: drop-shadow(0 4px 10px rgba(239, 68, 68, 0.2));
        }

        .category-title-premium {
          font-size: 1.05rem;
          font-weight: 800;
          color: white;
          margin-bottom: 6px;
        }

        .category-slug {
          font-size: 0.72rem;
          color: #64748b;
          display: block;
          margin-bottom: 14px;
        }

        .pkg-tag {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 0.65rem;
          color: #94a3b8;
        }

        /* Modal Redone */
        .premium-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 5, 12, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .premium-modal {
          background: #0b0c16;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.08);
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          padding: 26px;
          position: relative;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-height: 85vh;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .premium-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .premium-modal-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: white;
        }

        .close-btn-premium {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn-premium:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        /* Form styling inside modals */
        .premium-modal label {
          font-weight: 700;
          font-size: 0.88rem;
          color: #cbd5e1;
          margin-bottom: 6px;
          display: block;
        }

        .premium-modal select, .premium-modal textarea, .premium-modal input, .premium-modal input[type="file"], .premium-modal input[type="color"] {
          width: 100%;
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          border-radius: 10px !important;
          padding: 10px 14px !important;
          color: white !important;
          font-size: 0.9rem !important;
          outline: none;
          transition: all 0.2s ease;
        }

        .premium-modal select:focus, .premium-modal textarea:focus, .premium-modal input:focus {
          border-color: rgba(239, 68, 68, 0.4) !important;
          background: rgba(255, 255, 255, 0.04) !important;
        }

        /* Package line items */
        .pkg-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 8px;
        }

        .pkg-row input {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          color: white !important;
          font-size: 0.85rem !important;
        }

        .pkg-row input:focus {
          border-color: rgba(239, 68, 68, 0.4) !important;
          background: rgba(255, 255, 255, 0.04) !important;
        }

        /* Drawer Overlay */
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 5, 12, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 40;
          animation: fadeIn 0.3s ease;
        }

        /* Burger Button */
        .admin-burger-btn {
          display: none;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
          color: #fff;
          font-size: 1.2rem;
          align-items: center;
          justify-content: center;
          margin-inline-end: 12px;
          transition: all 0.2s ease;
        }
        .admin-burger-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* Mobile Drawer Container */
        .mobile-drawer {
          position: fixed;
          top: 0;
          bottom: 0;
          right: 0;
          width: 280px;
          background: rgba(10, 12, 26, 0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          z-index: 45;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
        }

        .mobile-drawer.open {
          transform: translateX(0);
        }

        .mobile-drawer.closed {
          transform: translateX(100%);
        }

        .mobile-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mobile-drawer-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          color: #ffffff;
        }

        .mobile-drawer-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .mobile-drawer-user-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-drawer-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        .mobile-drawer-link {
          display: flex;
          align-items: center;
          padding: 12px 14px;
          border-radius: 10px;
          color: #cbd5e1;
          font-weight: 700;
          background: transparent;
          border: none;
          width: 100%;
          text-align: right;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-drawer-link:hover {
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }

        .mobile-drawer-link.active {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(244, 63, 94, 0.03) 100%);
          color: white;
          border-right: 3px solid #ef4444;
        }

        .mobile-drawer-link.danger {
          color: #f87171;
          margin-top: auto;
        }

        .user-menu-widget {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 100px;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-username {
          font-weight: 700;
          font-size: 0.88rem;
          color: #e2e8f0;
        }

        .logout-btn-text {
          font-size: 0.8rem;
          color: #ef4444;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .logout-btn-text:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        /* Desktop Top Header Logout adjustment */
        .header-actions .user-menu-widget {
          display: flex;
        }

        /* Responsiveness */
        @media (max-width: 992px) {
          .admin-dashboard-root {
            grid-template-columns: minmax(0, 1fr);
          }
          .premium-sidebar {
            display: none !important;
          }

          .admin-burger-btn {
            display: flex;
          }

          .header-actions .user-menu-widget {
            display: none !important;
          }

          .premium-content {
            padding: 24px 20px;
            max-height: none;
          }

          .content-header {
            margin-bottom: 25px;
          }

          .premium-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .content-header {
            gap: 12px;
            margin-bottom: 25px;
          }

          .header-actions {
            width: 100%;
            display: flex;
          }

          .header-actions .btn-add-premium {
            flex-grow: 1;
            text-align: center;
            justify-content: center;
          }

          .status-tabs-wrapper {
            width: 100%;
            overflow-x: auto;
            white-space: nowrap;
            display: flex;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .status-tabs-wrapper::-webkit-scrollbar {
            display: none;
          }

          .status-tab-btn {
            flex-shrink: 0;
          }

          .premium-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .premium-stat-card {
            padding: 16px;
          }

          .stat-card-value {
            font-size: 1.4rem;
          }

          .stat-card-icon-wrapper {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }

          .premium-content {
            padding: 16px 12px;
          }

          .header-title-section h1 {
            font-size: 1.6rem;
          }

          .header-title-section p {
            font-size: 0.85rem;
          }

          .btn-add-premium {
            padding: 8px 14px;
            font-size: 0.82rem;
          }

          .table-filter-bar {
            padding: 12px;
            gap: 10px;
          }

          .category-grid-premium {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .category-card-premium {
            padding: 14px;
          }
        }

        @media (max-width: 768px) {
          .premium-table-wrapper {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            overflow-x: visible !important;
          }
          .premium-table, 
          .premium-table thead, 
          .premium-table tbody, 
          .premium-table th, 
          .premium-table td, 
          .premium-table tr {
            display: block !important;
            width: 100% !important;
          }
          .premium-table thead {
            display: none !important;
          }
          .premium-table tr {
            background: rgba(255, 255, 255, 0.02) !important;
            backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
            border-radius: 16px !important;
            padding: 16px !important;
            margin-bottom: 16px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25) !important;
            transition: all 0.3s ease !important;
          }
          .premium-table tr:hover {
            border-color: rgba(239, 68, 68, 0.2) !important;
            background: rgba(255, 255, 255, 0.04) !important;
            transform: translateY(-2px);
          }
          .premium-table td {
            border: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
            padding: 10px 0 !important;
            font-size: 0.88rem !important;
            color: #cbd5e1 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            text-align: left !important;
            white-space: normal !important;
          }
          .premium-table td:last-child {
            border-bottom: none !important;
            padding-bottom: 0 !important;
          }
          .premium-table td::before {
            content: attr(data-label) !important;
            font-weight: 800 !important;
            color: #94a3b8 !important;
            margin-left: 16px !important;
            text-align: right !important;
            font-size: 0.82rem !important;
            flex-shrink: 0 !important;
          }
        }

        @media (max-width: 420px) {
          .premium-stats-grid {
            grid-template-columns: 1fr;
          }

          .premium-modal {
            padding: 18px;
          }

          .premium-modal-title {
            font-size: 1.05rem;
          }
        }
`;
export default dashboardStyles;
