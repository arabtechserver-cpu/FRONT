"use client";

import React, { useContext } from "react";
import { AdminDashboardContext } from "../AdminDashboardContext";
import CatModal from "./parts/CatModal";
import EditCatModal from "./parts/EditCatModal";
import ServiceModal from "./parts/ServiceModal";
import EditServiceModal from "./parts/EditServiceModal";
import BannerModal from "./parts/BannerModal";
import EditBannerModal from "./parts/EditBannerModal";
import EditCustomerModal from "./parts/EditCustomerModal";
import OrderDetailsModal from "./parts/OrderDetailsModal";
import CodeModal from "./parts/CodeModal";
import ErrorModal from "./parts/ErrorModal";

export default function AdminDashboardModals() {
  const { errorMsg } = useContext(AdminDashboardContext);

  return (
    <React.Fragment>
      <CatModal />
      <EditCatModal />
      <ServiceModal />
      <EditServiceModal />
      <BannerModal />
      <EditBannerModal />
      <EditCustomerModal />
      <OrderDetailsModal />
      <CodeModal />
      <ErrorModal />
    </React.Fragment>
  );
}
