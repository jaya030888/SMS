// src/app/pages/Admin/Landing_Page/page.tsx
"use client";

import { useState, useEffect } from "react";
import StuNav from "@/src/app/components/StuNav";
import Link from "next/link";
import { 
  Globe, 
  Sparkles, 
  Layers, 
  Image as ImageIcon, 
  Phone, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Award,
  Wrench,
  ShieldCheck,
  Briefcase,
  Monitor,
  BookOpen,
  Settings,
  Building,
  Lightbulb,
  Zap,
  Info,
  Sliders,
  Eye,
  Mail
} from "lucide-react";
import type { LandingCMSData } from "@/src/app/lib/mockData";

export default function LandingPageCMS() {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "features" | "gallery" | "contact">("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [cms, setCms] = useState<LandingCMSData | null>(null);

  // Load existing CMS data
  useEffect(() => {
    async function loadCMS() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/landing_cms");
        if (res.ok) {
          const data = await res.json();
          setCms(data);
        }
      } catch (err) {
        console.error("Failed to load CMS:", err);
        setErrorMsg("Failed to load landing page configuration.");
      } finally {
        setLoading(false);
      }
    }
    loadCMS();
  }, []);

  // Save changes to backend
  const handleSave = async () => {
    if (!cms) return;
    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await fetch("/api/admin/landing_cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cms),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Landing page updated successfully! Changes are live.");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(data.error || "Failed to update landing page.");
      }
    } catch (err: any) {
      setErrorMsg("Network error while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all landing page texts and cards to default values?")) {
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/admin/landing_cms", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCms(data.data);
        setSuccessMsg("Landing page content has been reset to defaults.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setErrorMsg("Failed to reset content.");
    } finally {
      setSaving(false);
    }
  };

  // Add new feature card
  const handleAddFeature = () => {
    if (!cms) return;
    const newId = cms.features.length > 0 ? Math.max(...cms.features.map(f => f.id)) + 1 : 1;
    const updatedFeatures = [
      ...cms.features,
      {
        id: newId,
        title: "New Institute Highlight",
        desc: "Describe this key facility, benefit, or achievement.",
        icon: "Zap"
      }
    ];
    setCms({ ...cms, features: updatedFeatures });
  };

  // Remove feature card
  const handleRemoveFeature = (id: number) => {
    if (!cms) return;
    setCms({
      ...cms,
      features: cms.features.filter(f => f.id !== id)
    });
  };

  // Update feature card
  const handleUpdateFeature = (id: number, field: string, val: string) => {
    if (!cms) return;
    setCms({
      ...cms,
      features: cms.features.map(f => f.id === id ? { ...f, [field]: val } : f)
    });
  };

  // Add new gallery photo/card
  const handleAddGalleryItem = () => {
    if (!cms) return;
    const newId = cms.gallery.length > 0 ? Math.max(...cms.gallery.map(g => g.id)) + 1 : 1;
    const updatedGallery = [
      ...cms.gallery,
      {
        id: newId,
        title: "New Campus Photo",
        category: "Campus",
        imageUrl: "",
        iconName: "Building"
      }
    ];
    setCms({ ...cms, gallery: updatedGallery });
  };

  // Remove gallery photo/card
  const handleRemoveGalleryItem = (id: number) => {
    if (!cms) return;
    setCms({
      ...cms,
      gallery: cms.gallery.filter(g => g.id !== id)
    });
  };

  // Update gallery item
  const handleUpdateGalleryItem = (id: number, field: string, val: string) => {
    if (!cms) return;
    setCms({
      ...cms,
      gallery: cms.gallery.map(g => g.id === id ? { ...g, [field]: val } : g)
    });
  };

  // Multiple Phone Numbers Helpers
  const getPhoneList = (): string[] => {
    if (!cms) return [];
    if (cms.contact.phones && Array.isArray(cms.contact.phones) && cms.contact.phones.length > 0) {
      return cms.contact.phones;
    }
    if (cms.contact.phone) {
      return cms.contact.phone.split(",").map(p => p.trim()).filter(Boolean);
    }
    return ["+91 94310 12345"];
  };

  const handleAddPhone = () => {
    if (!cms) return;
    const current = getPhoneList();
    const updated = [...current, ""];
    setCms({
      ...cms,
      contact: {
        ...cms.contact,
        phones: updated,
        phone: updated.filter(Boolean).join(", ")
      }
    });
  };

  const handleUpdatePhone = (index: number, val: string) => {
    if (!cms) return;
    const current = [...getPhoneList()];
    current[index] = val;
    setCms({
      ...cms,
      contact: {
        ...cms.contact,
        phones: current,
        phone: current.filter(Boolean).join(", ")
      }
    });
  };

  const handleRemovePhone = (index: number) => {
    if (!cms) return;
    const current = getPhoneList().filter((_, i) => i !== index);
    const updated = current.length > 0 ? current : [""];
    setCms({
      ...cms,
      contact: {
        ...cms.contact,
        phones: updated,
        phone: updated.filter(Boolean).join(", ")
      }
    });
  };

  // Multiple Email Addresses Helpers
  const getEmailList = (): string[] => {
    if (!cms) return [];
    if (cms.contact.emails && Array.isArray(cms.contact.emails) && cms.contact.emails.length > 0) {
      return cms.contact.emails;
    }
    if (cms.contact.email) {
      return cms.contact.email.split(",").map(e => e.trim()).filter(Boolean);
    }
    return ["info@mgiti.edu.in"];
  };

  const handleAddEmail = () => {
    if (!cms) return;
    const current = getEmailList();
    const updated = [...current, ""];
    setCms({
      ...cms,
      contact: {
        ...cms.contact,
        emails: updated,
        email: updated.filter(Boolean).join(", ")
      }
    });
  };

  const handleUpdateEmail = (index: number, val: string) => {
    if (!cms) return;
    const current = [...getEmailList()];
    current[index] = val;
    setCms({
      ...cms,
      contact: {
        ...cms.contact,
        emails: current,
        email: current.filter(Boolean).join(", ")
      }
    });
  };

  const handleRemoveEmail = (index: number) => {
    if (!cms) return;
    const current = getEmailList().filter((_, i) => i !== index);
    const updated = current.length > 0 ? current : [""];
    setCms({
      ...cms,
      contact: {
        ...cms.contact,
        emails: updated,
        email: updated.filter(Boolean).join(", ")
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <StuNav name="Landing Page CMS" role="admin" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-sm font-semibold">Loading landing page configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <StuNav name="Landing Page CMS" role="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 text-primary mb-1">
              <Globe size={22} />
              <span className="text-xs font-bold uppercase tracking-wider bg-[#EEF5FC] px-2.5 py-0.5 rounded-md">
                Live Website Manager
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Landing Page Content Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Update any text, hero banners, feature cards, gallery photos, and contact information displayed on the public website.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Eye size={14} />
              <span>Preview Site</span>
              <ExternalLink size={12} className="text-slate-400" />
            </Link>

            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
              title="Reset to institute defaults"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4285CD] hover:bg-[#2F8AD4] shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              ) : (
                <Save size={15} />
              )}
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-200">
          <button
            onClick={() => setActiveTab("hero")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "hero"
                ? "bg-[#4285CD] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Sparkles size={15} />
            <span>Hero & Banner</span>
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "about"
                ? "bg-[#4285CD] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Info size={15} />
            <span>About Section</span>
          </button>

          <button
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "features"
                ? "bg-[#4285CD] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Layers size={15} />
            <span>Feature Cards ({cms?.features.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "gallery"
                ? "bg-[#4285CD] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <ImageIcon size={15} />
            <span>Gallery & Photos ({cms?.gallery.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "contact"
                ? "bg-[#4285CD] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Phone size={15} />
            <span>Contact Information</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        {cms && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            
            {/* 1. HERO & BANNER TAB */}
            {activeTab === "hero" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Hero Header & Visual Banner</h2>
                  <p className="text-xs text-slate-500">Configure main headline, descriptive subtitle, and institute accreditation badges.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Eyebrow Tagline</label>
                    <input
                      type="text"
                      value={cms.hero.eyebrow}
                      onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, eyebrow: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="e.g. Govt. Recognized Vocational Training"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Hero Title Part 1</label>
                    <input
                      type="text"
                      value={cms.hero.title_1}
                      onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, title_1: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="e.g. Technical Skills for a"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Hero Title Highlight (Part 2)</label>
                    <input
                      type="text"
                      value={cms.hero.title_2}
                      onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, title_2: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-primary font-bold"
                      placeholder="e.g. Brighter Career"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Hero Narrative Description</label>
                    <textarea
                      rows={3}
                      value={cms.hero.desc}
                      onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, desc: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
                      placeholder="Main mission and introductory paragraph..."
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Hero Badge Metric Counters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Badge 1 (Affiliation)</label>
                      <input
                        type="text"
                        value={cms.hero.badge_govt}
                        onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, badge_govt: e.target.value } })}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                        placeholder="100%"
                      />
                      <input
                        type="text"
                        value={cms.hero.badge_govt_desc}
                        onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, badge_govt_desc: e.target.value } })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        placeholder="NCVT Affiliated"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Badge 2 (Alumni)</label>
                      <input
                        type="text"
                        value={cms.hero.badge_alumni}
                        onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, badge_alumni: e.target.value } })}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                        placeholder="1500+"
                      />
                      <input
                        type="text"
                        value={cms.hero.badge_alumni_desc}
                        onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, badge_alumni_desc: e.target.value } })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        placeholder="Certified Alumni"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Badge 3 (Placement)</label>
                      <input
                        type="text"
                        value={cms.hero.badge_placement}
                        onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, badge_placement: e.target.value } })}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                        placeholder="94%"
                      />
                      <input
                        type="text"
                        value={cms.hero.badge_placement_desc}
                        onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, badge_placement_desc: e.target.value } })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        placeholder="Placement Rate"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABOUT TAB */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">About Institute Section</h2>
                  <p className="text-xs text-slate-500">Edit the detailed background story, accreditation info, and core highlights.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">About Section Eyebrow</label>
                    <input
                      type="text"
                      value={cms.about.eyebrow}
                      onChange={(e) => setCms({ ...cms, about: { ...cms.about, eyebrow: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Main Heading</label>
                    <input
                      type="text"
                      value={cms.about.title}
                      onChange={(e) => setCms({ ...cms, about: { ...cms.about, title: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Paragraph 1 (Establishment & Vision)</label>
                    <textarea
                      rows={3}
                      value={cms.about.desc_1}
                      onChange={(e) => setCms({ ...cms, about: { ...cms.about, desc_1: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Paragraph 2 (Accreditation & Standards)</label>
                    <textarea
                      rows={3}
                      value={cms.about.desc_2}
                      onChange={(e) => setCms({ ...cms, about: { ...cms.about, desc_2: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. FEATURE CARDS TAB */}
            {activeTab === "features" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Feature & Highlight Cards</h2>
                    <p className="text-xs text-slate-500">Add, edit, or remove key value proposition cards displayed on the homepage.</p>
                  </div>
                  <button
                    onClick={handleAddFeature}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Add New Card</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cms.features.map((feature, idx) => (
                    <div key={feature.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-primary bg-[#EEF5FC] px-2 py-0.5 rounded-md">
                          Card #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveFeature(feature.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete card"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => handleUpdateFeature(feature.id, "title", e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                          placeholder="Feature title"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Description</label>
                        <textarea
                          rows={2}
                          value={feature.desc}
                          onChange={(e) => handleUpdateFeature(feature.id, "desc", e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white leading-relaxed"
                          placeholder="Short description of this feature..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Lucide Icon Type</label>
                        <select
                          value={feature.icon}
                          onChange={(e) => handleUpdateFeature(feature.id, "icon", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
                        >
                          <option value="Award">Award (Faculty / Excellence)</option>
                          <option value="Wrench">Wrench (Workshop / Practical)</option>
                          <option value="ShieldCheck">ShieldCheck (NCVT Certified)</option>
                          <option value="Briefcase">Briefcase (Placement / Jobs)</option>
                          <option value="Lightbulb">Lightbulb (Innovation)</option>
                          <option value="Zap">Zap (Performance / Fast)</option>
                          <option value="Building">Building (Infrastructure)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. GALLERY TAB */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Campus Gallery & Photo Cards</h2>
                    <p className="text-xs text-slate-500">Add or remove workshop, lab, and campus infrastructure cards with custom captions.</p>
                  </div>
                  <button
                    onClick={handleAddGalleryItem}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Add Photo Card</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {cms.gallery.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-primary bg-[#EEF5FC] px-2 py-0.5 rounded-md">
                          Photo #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveGalleryItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Caption / Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateGalleryItem(item.id, "title", e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                          placeholder="e.g. Electrical Lab Workshop"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Category Tag</label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleUpdateGalleryItem(item.id, "category", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          placeholder="e.g. Mechanical, COPA, Campus"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Custom Image URL (Optional)</label>
                        <input
                          type="url"
                          value={item.imageUrl || ""}
                          onChange={(e) => handleUpdateGalleryItem(item.id, "imageUrl", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          placeholder="https://... (or leave empty for icon card)"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Icon Representation</label>
                        <select
                          value={item.iconName || "Building"}
                          onChange={(e) => handleUpdateGalleryItem(item.id, "iconName", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="Wrench">Wrench (Workshop / Tools)</option>
                          <option value="Monitor">Monitor (Computer / IT Lab)</option>
                          <option value="BookOpen">BookOpen (Theory / Practical)</option>
                          <option value="Settings">Settings (Equipment / Machines)</option>
                          <option value="Building">Building (Infrastructure)</option>
                          <option value="Lightbulb">Lightbulb (Training / Project)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. CONTACT TAB (Multiple Phone Numbers & Email Addresses) */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Institute Contact & Campus Details</h2>
                  <p className="text-xs text-slate-500">Update official contact phone numbers, email addresses, physical campus address, and affiliation information shown on the website and student portals.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* MULTIPLE PHONE NUMBERS SECTION */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="text-indigo-600" />
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Official Contact Phone Numbers
                        </label>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {getPhoneList().length} Added
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {getPhoneList().map((pNum, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 w-5 text-center">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={pNum}
                            onChange={(e) => handleUpdatePhone(idx, e.target.value)}
                            className="flex-1 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                            placeholder="+91 94310 12345 (e.g. Admission / Main Office)"
                          />
                          {getPhoneList().length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhone(idx)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                              title="Delete phone number"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPhone}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition-all cursor-pointer mt-2"
                    >
                      <Plus size={14} />
                      <span>Add Another Phone Number</span>
                    </button>
                  </div>

                  {/* MULTIPLE EMAIL ADDRESSES SECTION */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="text-indigo-600" />
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Official Contact Email Addresses
                        </label>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {getEmailList().length} Added
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {getEmailList().map((eAddr, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 w-5 text-center">
                            #{idx + 1}
                          </span>
                          <input
                            type="email"
                            value={eAddr}
                            onChange={(e) => handleUpdateEmail(idx, e.target.value)}
                            className="flex-1 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                            placeholder="info@mgiti.edu.in (e.g. Enquiry / Admissions)"
                          />
                          {getEmailList().length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEmail(idx)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                              title="Delete email address"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition-all cursor-pointer mt-2"
                    >
                      <Plus size={14} />
                      <span>Add Another Email Address</span>
                    </button>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Campus Physical Address</label>
                    <input
                      type="text"
                      value={cms.contact.address}
                      onChange={(e) => setCms({ ...cms, contact: { ...cms.contact, address: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-xs"
                      placeholder="Campus Road, District, State - PIN"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Office & Admission Hours</label>
                    <input
                      type="text"
                      value={cms.contact.officeHours}
                      onChange={(e) => setCms({ ...cms, contact: { ...cms.contact, officeHours: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-xs"
                      placeholder="Monday – Saturday: 08:30 AM – 04:30 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">NCVT / DGT Affiliation Code</label>
                    <input
                      type="text"
                      value={cms.contact.affiliation}
                      onChange={(e) => setCms({ ...cms, contact: { ...cms.contact, affiliation: e.target.value } })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-xs"
                      placeholder="Affiliation Code: DGT-6/24/18/2018-TC"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Action Bar */}
            <div className="border-t border-slate-100 pt-6 mt-8 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Changes will be saved and published live immediately.
              </span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4285CD] hover:bg-[#2F8AD4] shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                ) : (
                  <Save size={15} />
                )}
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
