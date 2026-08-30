"use client";

import React, { useContext } from "react";
import { AdminDashboardContext } from "../../AdminDashboardContext";
import OrderInspectionView from "../../OrderInspectionView";

export default function OrderDetailsModal() {
  const context = useContext(AdminDashboardContext);
  const { orderModal, token } = context || {};
  const { showOrderDetailsModal, setShowOrderDetailsModal, orderDetailsData } = orderModal || {};

  if (!showOrderDetailsModal || !orderDetailsData) return null;

  return (
    <div className="premium-overlay" onClick={() => setShowOrderDetailsModal(false)} style={{ zIndex: 99999 }}>
      <div
        className="premium-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "880px",
          width: "95%",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "transparent",
          border: "none",
          boxShadow: "none",
          padding: 0
        }}
      >
        <OrderInspectionView
          order={orderDetailsData}
          token={token}
          onClose={() => setShowOrderDetailsModal(false)}
          onOrderUpdated={(updated) => {
            if (orderModal.setOrders) {
              orderModal.setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            }
          }}
        />
      </div>
    </div>
  );
}
