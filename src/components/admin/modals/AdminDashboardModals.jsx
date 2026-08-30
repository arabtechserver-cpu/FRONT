"use client";

import React, { useContext } from "react";
import dynamic from "next/dynamic";
import { AdminDashboardContext } from "../AdminDashboardContext";

const CatModal = dynamic(() => import("./parts/CatModal"));
const EditCatModal = dynamic(() => import("./parts/EditCatModal"));
const ServiceModal = dynamic(() => import("./parts/ServiceModal"));
const EditServiceModal = dynamic(() => import("./parts/EditServiceModal"));
const BannerModal = dynamic(() => import("./parts/BannerModal"));
const EditBannerModal = dynamic(() => import("./parts/EditBannerModal"));
const EditCustomerModal = dynamic(() => import("./parts/EditCustomerModal"));
const OrderDetailsModal = dynamic(() => import("./parts/OrderDetailsModal"));
const CodeModal = dynamic(() => import("./parts/CodeModal"));
const ErrorModal = dynamic(() => import("./parts/ErrorModal"));

export default function AdminDashboardModals() {
  const {
    errorMsg,
    catModal,
    editCatModal,
    serviceModal,
    editServiceModal,
    bannerModal,
    editBannerModal,
    customerModal,
    orderModal,
    codeModal,
  } = useContext(AdminDashboardContext);

  return (
    <React.Fragment>
      {catModal?.showCatModal && <CatModal />}
      {editCatModal?.showEditCatModal && <EditCatModal />}
      {serviceModal?.showServiceModal && <ServiceModal />}
      {editServiceModal?.showEditServiceModal && <EditServiceModal />}
      {bannerModal?.showBannerModal && <BannerModal />}
      {editBannerModal?.showEditBannerModal && <EditBannerModal />}
      {customerModal?.showEditCustomerModal && <EditCustomerModal />}
      {orderModal?.showOrderDetailsModal && <OrderDetailsModal />}
      {codeModal?.showCodeModal && <CodeModal />}
      {errorMsg && <ErrorModal />}
    </React.Fragment>
  );
}
