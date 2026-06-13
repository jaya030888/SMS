"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function ComplianceBanner() {
  const { t } = useLanguage();

  return (
    <div className="compliance-banner" role="banner">
      <div className="compliance-container">
        <div className="compliance-item">
          <svg className="compliance-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>{t("compliance_act")}</span>
        </div>
        <div className="compliance-item">
          <span className="compliance-badge">{t("compliance_no_label")}</span>
          <strong className="compliance-value"> 01/01/01/19322/08</strong>
        </div>
        <div className="compliance-item compliance-certifications">
          <span className="cert-tag">CSR Form-1</span>
          <span className="cert-tag">12A Approved</span>
          <span className="cert-tag">80G Certified</span>
        </div>
      </div>
    </div>
  );
}
