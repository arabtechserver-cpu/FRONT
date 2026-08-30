import React, { useContext } from "react";
import { AdminDashboardContext } from "../../AdminDashboardContext";

export default function ErrorModal() {
  const { errorMsg } = useContext(AdminDashboardContext);
  if (!errorMsg) return null;

  return (
    <div style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: "600" }}>
                  ⚠️ {errorMsg}
                </div>
  );
}
