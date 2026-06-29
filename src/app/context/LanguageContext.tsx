"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    // Compliance Banner
    compliance_act: "M.P. Societies Registration Act, 1973 Compliance Tracking",
    compliance_no_label: "Reg No:",
    
    // Navbar/Header
    nav_home: "Home",
    nav_about: "About Us",
    nav_courses: "Courses",
    nav_admissions: "Admissions",
    nav_fee_structure: "Fee Structure",
    nav_contact: "Contact",
    nav_login: "Login",
    nav_dashboard: "Dashboard",
    nav_logout: "Logout",
    nav_apply_now: "Apply Now",
    brand_name: "Maa Gauri Private ITI",

    // Hero Section
    hero_eyebrow: "NCVT approved skill training",
    hero_title_1: "Building Future",
    hero_title_2: "Skilled Professionals",
    hero_desc: "Maa Gauri Private ITI provides quality vocational training and skill development to empower youth with industry-ready expertise.",
    hero_btn_apply: "Apply for Admissions",
    hero_btn_explore: "Explore Trades",
    hero_card_tag: "ITI",
    hero_card_year: "2026 Admissions",
    hero_card_title: "Technical trades for real careers",
    hero_card_desc: "Practical labs, guided training, and placement support for every enrolled student.",
    hero_badge_govt: "Govt.",
    hero_badge_govt_desc: "Recognized",
    hero_badge_alumni: "500+",
    hero_badge_alumni_desc: "Alumni",
    hero_badge_placement: "100%",
    hero_badge_placement_desc: "Placement Help",

    // About Section
    about_eyebrow: "About the institute",
    about_title: "Training students for skilled, confident work.",
    about_desc: "Maa Gauri Private ITI provides quality vocational training and skill development to empower youth with industry-ready expertise.",
    about_stat_programs: "Core trade programs",
    about_stat_labs: "Practical lab modules",
    about_stat_guidance: "Student guidance",

    // Features Section
    features_title: "Why Choose Us?",
    feature_faculty_title: "Experienced Faculty",
    feature_faculty_desc: "Learn from industry experts with years of practical experience",
    feature_practical_title: "Practical Training",
    feature_practical_desc: "Hands-on training with modern equipment and real-world projects",
    feature_ncvt_title: "NCVT Approved Trades",
    feature_ncvt_desc: "All our courses are approved by National Council for Vocational Training",
    feature_industry_title: "Industry Exposure",
    feature_industry_desc: "Industrial visits and placement assistance for better career prospects",

    // Courses Section
    courses_eyebrow: "Popular trades",
    courses_title: "Our Courses",
    courses_desc: "Choose a practical ITI course designed around employable technical skills.",
    trade_electrician_duration: "Duration: 2 years",
    trade_electrician_desc: "Learn electrical installations, maintenance, and repair work.",
    trade_fitter_duration: "Duration: 2 years",
    trade_fitter_desc: "Master mechanical fitting, assembly, and maintenance skills.",
    trade_copa_duration: "Duration: 1 year",
    trade_copa_desc: "Computer Operator and Programming Assistant training program.",

    // Updates Section
    updates_title: "Notices & Updates",
    update_1_date: "Jan 25, 2026",
    update_1_title: "Admission Open for 2026-27 Batch",
    update_1_desc: "Applications are now being accepted for all ITI courses. Apply before Feb 28, 2026.",
    update_2_date: "Jan 20, 2026",
    update_2_title: "Workshop on Modern Electrical Systems",
    update_2_desc: "Special workshop scheduled for Electrician students on January 30, 2026.",
    update_3_date: "Jan 15, 2026",
    update_3_title: "Industrial Visit to Manufacturing Unit",
    update_3_desc: "Fitter trade students will visit local manufacturing facility on February 5, 2026.",

    // Gallery Section
    gallery_eyebrow: "Campus life",
    gallery_title: "Gallery",
    gallery_desc: "A quick look at practical training, labs, and hands-on learning spaces.",
    gallery_img_workshop: "Technical Training Workshop",
    gallery_img_computer: "Computer Lab Sessions",
    gallery_img_practical: "Practical Training",
    gallery_img_equipment: "Modern Equipment",
    gallery_img_infrastructure: "Campus Infrastructure",
    gallery_img_hands_on: "Hands-on Learning",

    // Contact Section
    contact_eyebrow: "Reach us",
    contact_title: "Contact Us",
    contact_desc: "Talk to the admission office for course details, eligibility, and visits.",
    contact_panel_title: "Get In Touch",
    contact_address: "Address",
    contact_address_l1: "123 Education Street, Industrial Area",
    contact_address_l2: "City, State - 123456",
    contact_phone: "Phone",
    contact_email: "Email",
    contact_hours: "Office Hours",
    contact_hours_l1: "Monday - Friday: 9:00 AM - 5:00 PM",
    contact_hours_l2: "Saturday: 9:00 AM - 1:00 PM",
    contact_map: "Map",

    // Footer
    footer_contact_info: "Contact Information",
    footer_quick_links: "Quick Links",
    footer_office_hours: "Office Hours",
    footer_sunday_closed: "Sunday: Closed",
    footer_copyright: "Copyright 2026 ITI Institute. All rights reserved.",

    // Admissions Form Page
    admissions_form_title: "Register Student",
    admissions_form_desc: "Enter student details below to save directly to the database.",
    lbl_fullname: "Full Name",
    lbl_fathername: "Father's Name",
    lbl_email: "Email Address",
    lbl_dob: "Date of Birth",
    lbl_phone: "Phone Number",
    lbl_address: "Address",
    lbl_course: "Course",
    lbl_qualification: "Qualification",
    opt_select_course: "Select Course",
    opt_select_qual: "Select Qualification",
    btn_pay_register: "Pay ₹2,000 & Register",
    btn_registering: "Registering...",
    admissions_list_title: "Registered Students",
    admissions_list_subtitle: "Real-time database sync directory",
    lbl_refresh: "Refresh",
    lbl_loading_dir: "Loading directory...",
    lbl_no_records: "No Student Records Found",
    lbl_table_empty: "The database table is empty. Add a student using the form.",

    // Fee Structure Page
    fee_title: "Fee Structure",
    fee_subtitle: "Academic fees breakdown for vocational trade programs.",
    fee_th_course: "Course / Trade",
    fee_th_duration: "Duration",
    fee_th_reg_fee: "Registration Fee",
    fee_th_tuition_fee: "Tuition Fee (Per Year)",
    fee_th_total_fee: "Total Fee",
    fee_btn_apply: "Proceed to Admission",
    fee_payment_options: "Payment Options",

    // Login Pages
    login_role_student: "Student",
    login_role_admin: "Admin",
    login_student_para: "Access your student dashboard",
    login_admin_para: "Access admin management panel",
    login_student_id: "Student ID",
    login_admin_email: "Admin Email",
    login_password: "Password",
    login_btn_signin: "Sign In",
    login_btn_back: "Back to roles",
    login_btn_home: "Go to Homepage",
    login_choose_role: "Choose Login Role",
    login_choose_subtitle: "Select your role to access the Student Management System portal",
    login_student_desc: "Log in to check results, fee balance, and view announcements.",
    login_admin_desc: "Log in to manage student admissions, update fees, and view metrics."
  },
  hi: {
    // Compliance Banner
    compliance_act: "एम.पी. सोसायटी रजिस्ट्रीकरण अधिनियम, 1973 अनुपालन ट्रैकिंग",
    compliance_no_label: "पंजीकरण संख्या:",

    // Navbar/Header
    nav_home: "मुख्य पृष्ठ",
    nav_about: "हमारे बारे में",
    nav_courses: "कोर्स / ट्रेड",
    nav_admissions: "प्रवेश",
    nav_fee_structure: "शुल्क संरचना",
    nav_contact: "संपर्क",
    nav_login: "लॉगिन",
    nav_dashboard: "डैशबोर्ड",
    nav_logout: "लॉगआउट",
    nav_apply_now: "अभी आवेदन करें",
    brand_name: "माँ गौरी प्राइवेट आईटीआई",

    // Hero Section
    hero_eyebrow: "एनसीवीटी (NCVT) स्वीकृत कौशल प्रशिक्षण",
    hero_title_1: "भविष्य के कुशल",
    hero_title_2: "पेशेवरों का निर्माण",
    hero_desc: "माँ गौरी प्राइवेट आईटीआई युवाओं को उद्योग-तैयार विशेषज्ञता के साथ सशक्त बनाने के लिए गुणवत्तापूर्ण व्यावसायिक प्रशिक्षण और कौशल विकास प्रदान करता है।",
    hero_btn_apply: "प्रवेश के लिए आवेदन करें",
    hero_btn_explore: "ट्रेड्स देखें",
    hero_card_tag: "आईटीआई",
    hero_card_year: "2026 प्रवेश",
    hero_card_title: "वास्तविक करियर के लिए तकनीकी ट्रेड्स",
    hero_card_desc: "प्रत्येक नामांकित छात्र के लिए व्यावहारिक प्रयोगशालाएं, निर्देशित प्रशिक्षण और प्लेसमेंट सहायता।",
    hero_badge_govt: "सरकारी",
    hero_badge_govt_desc: "मान्यता प्राप्त",
    hero_badge_alumni: "500+",
    hero_badge_alumni_desc: "पूर्व छात्र",
    hero_badge_placement: "100%",
    hero_badge_placement_desc: "प्लेसमेंट सहायता",

    // About Section
    about_eyebrow: "संस्थान के बारे में",
    about_title: "कुशल और आत्मविश्वासी कार्य के लिए छात्रों को प्रशिक्षित करना।",
    about_desc: "माँ गौरी प्राइवेट आईटीआई युवाओं को उद्योग-तैयार विशेषज्ञता के साथ सशक्त बनाने के लिए गुणवत्तापूर्ण व्यावसायिक प्रशिक्षण और कौशल विकास प्रदान करता है।",
    about_stat_programs: "मुख्य ट्रेड कार्यक्रम",
    about_stat_labs: "प्रायोगिक लैब मॉड्यूल",
    about_stat_guidance: "छात्र मार्गदर्शन",

    // Features Section
    features_title: "हमें क्यों चुनें?",
    feature_faculty_title: "अनुभवी संकाय",
    feature_faculty_desc: "वर्षों के व्यावहारिक अनुभव वाले उद्योग विशेषज्ञों से सीखें",
    feature_practical_title: "व्यावहारिक प्रशिक्षण",
    feature_practical_desc: "आधुनिक उपकरणों और वास्तविक दुनिया की परियोजनाओं के साथ व्यावहारिक प्रशिक्षण",
    feature_ncvt_title: "एनसीवीटी स्वीकृत ट्रेड्स",
    feature_ncvt_desc: "हमारे सभी पाठ्यक्रम राष्ट्रीय व्यावसायिक प्रशिक्षण परिषद (NCVT) द्वारा स्वीकृत हैं",
    feature_industry_title: "उद्योग अनुभव",
    feature_industry_desc: "बेहतर करियर की संभावनाओं के लिए औद्योगिक दौरे और प्लेसमेंट सहायता",

    // Courses Section
    courses_eyebrow: "लोकप्रिय ट्रेड्स",
    courses_title: "हमारे कोर्स",
    courses_desc: "रोजगार योग्य तकनीकी कौशल के आधार पर डिजाइन किए गए व्यावहारिक आईटीआई पाठ्यक्रम चुनें।",
    trade_electrician_duration: "अवधि: 2 वर्ष",
    trade_electrician_desc: "बिजली फिटिंग, रखरखाव और मरम्मत कार्य सीखें।",
    trade_fitter_duration: "अवधि: 2 वर्ष",
    trade_fitter_desc: "मैकेनिकल फिटिंग, असेंबली और रखरखाव कौशल में महारत हासिल करें।",
    trade_copa_duration: "अवधि: 1 वर्ष",
    trade_copa_desc: "कंप्यूटर ऑपरेटर और प्रोग्रामिंग असिस्टेंट प्रशिक्षण कार्यक्रम।",

    // Updates Section
    updates_title: "सूचनाएं एवं अपडेट",
    update_1_date: "25 जनवरी, 2026",
    update_1_title: "सत्र 2026-27 बैच के लिए प्रवेश प्रारंभ",
    update_1_desc: "सभी आईटीआई पाठ्यक्रमों के लिए आवेदन स्वीकार किए जा रहे हैं। 28 फरवरी, 2026 से पहले आवेदन करें।",
    update_2_date: "20 जनवरी, 2026",
    update_2_title: "आधुनिक विद्युत प्रणालियों पर कार्यशाला",
    update_2_desc: "इलेक्ट्रीशियन छात्रों के लिए 30 जनवरी, 2026 को विशेष कार्यशाला निर्धारित की गई है।",
    update_3_date: "15 जनवरी, 2026",
    update_3_title: "विनिर्माण इकाई का औद्योगिक दौरा",
    update_3_desc: "फिटर ट्रेड के छात्र 5 फरवरी, 2026 को स्थानीय विनिर्माण सुविधा का दौरा करेंगे।",

    // Gallery Section
    gallery_eyebrow: "कैंपस जीवन",
    gallery_title: "गैलरी",
    gallery_desc: "व्यावहारिक प्रशिक्षण, प्रयोगशालाओं और व्यावहारिक शिक्षण स्थानों पर एक त्वरित नज़र।",
    gallery_img_workshop: "तकनीकी प्रशिक्षण कार्यशाला",
    gallery_img_computer: "कंप्यूटर लैब सत्र",
    gallery_img_practical: "व्यावहारिक प्रशिक्षण",
    gallery_img_equipment: "आधुनिक उपकरण",
    gallery_img_infrastructure: "कैंपस का बुनियादी ढांचा",
    gallery_img_hands_on: "व्यावहारिक रूप से सीखना",

    // Contact Section
    contact_eyebrow: "संपर्क करें",
    contact_title: "हमसे संपर्क करें",
    contact_desc: "पाठ्यक्रम विवरण, पात्रता और परिसर के दौरे के लिए प्रवेश कार्यालय से बात करें।",
    contact_panel_title: "संपर्क स्थापित करें",
    contact_address: "पता",
    contact_address_l1: "123 एजुकेशन स्ट्रीट, इंडस्ट्रियलिया एरिया",
    contact_address_l2: "शहर, राज्य - 123456",
    contact_phone: "फ़ोन",
    contact_email: "ईमेल",
    contact_hours: "कार्यालय समय",
    contact_hours_l1: "सोमवार - शुक्रवार: सुबह 9:00 बजे - शाम 5:00 बजे",
    contact_hours_l2: "शनिवार: सुबह 9:00 बजे - दोपहर 1:00 बजे",
    contact_map: "मानचित्र",

    // Footer
    footer_contact_info: "संपर्क जानकारी",
    footer_quick_links: "त्वरित लिंक्स",
    footer_office_hours: "कार्यालय समय",
    footer_sunday_closed: "रविवार: बंद",
    footer_copyright: "कॉपीराइट 2026 आईटीआई संस्थान। सर्वाधिकार सुरक्षित।",

    // Admissions Form Page
    admissions_form_title: "छात्र पंजीकरण",
    admissions_form_desc: "डेटाबेस में सीधे सहेजने के लिए नीचे छात्र विवरण दर्ज करें।",
    lbl_fullname: "पूरा नाम",
    lbl_fathername: "पिता का नाम",
    lbl_email: "ईमेल पता",
    lbl_dob: "जन्म तिथि",
    lbl_phone: "फोन नंबर",
    lbl_address: "पता",
    lbl_course: "कोर्स (ट्रेड)",
    lbl_qualification: "योग्यता",
    opt_select_course: "कोर्स चुनें",
    opt_select_qual: "योग्यता चुनें",
    btn_pay_register: "₹2,000 का भुगतान करें और पंजीकरण करें",
    btn_registering: "पंजीकरण किया जा रहा है...",
    admissions_list_title: "पंजीकृत छात्र",
    admissions_list_subtitle: "वास्तविक समय डेटाबेस सिंक निर्देशिका",
    lbl_refresh: "ताज़ा करें",
    lbl_loading_dir: "निर्देशिका लोड हो रही है...",
    lbl_no_records: "कोई छात्र रिकॉर्ड नहीं मिला",
    lbl_table_empty: "डेटाबेस तालिका खाली है। फ़ॉर्म का उपयोग करके एक छात्र जोड़ें।",

    // Fee Structure Page
    fee_title: "शुल्क संरचना",
    fee_subtitle: "व्यावसायिक ट्रेड कार्यक्रमों के लिए शैक्षणिक शुल्क का विवरण।",
    fee_th_course: "कोर्स / ट्रेड",
    fee_th_duration: "अवधि",
    fee_th_reg_fee: "पंजीकरण शुल्क",
    fee_th_tuition_fee: "ट्यूशन शुल्क (प्रति वर्ष)",
    fee_th_total_fee: "कुल शुल्क",
    fee_btn_apply: "प्रवेश के लिए आगे बढ़ें",
    fee_payment_options: "भुगतान विकल्प",

    // Login Pages
    login_role_student: "छात्र",
    login_role_admin: "प्रशासक (एडमिन)",
    login_student_para: "अपने छात्र डैशबोर्ड तक पहुंचें",
    login_admin_para: "एडमिन प्रबंधन पैनल तक पहुंचें",
    login_student_id: "छात्र आईडी (Student ID)",
    login_admin_email: "एडमिन ईमेल",
    login_password: "पासवर्ड",
    login_btn_signin: "साइन इन करें",
    login_btn_back: "भूमिकाओं पर वापस जाएं",
    login_btn_home: "मुख्य पृष्ठ पर जाएं",
    login_choose_role: "लॉगिन भूमिका चुनें",
    login_choose_subtitle: "छात्र प्रबंधन प्रणाली पोर्टल तक पहुंचने के लिए अपनी भूमिका चुनें",
    login_student_desc: "परिणाम, शुल्क शेष राशि की जांच करने और घोषणाएं देखने के लिए लॉगिन करें।",
    login_admin_desc: "छात्र प्रवेश प्रबंधित करने, शुल्क अपडेट करने और मेट्रिक्स देखने के लिए लॉगिन करें।"
  }
};

type LanguageContextType = {
  language: "en" | "hi";
  toggleLanguage: () => void;
  t: (key: string) => string;
  mounted: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sms-lang");
    if (saved === "hi" || saved === "en") {
      setLanguage(saved as "en" | "hi");
    }
  }, []);

  const toggleLanguage = () => {
    const next = language === "en" ? "hi" : "en";
    setLanguage(next);
    localStorage.setItem("sms-lang", next);
  };

  const t = (key: string): string => {
    if (!mounted) {
      return translations.en[key as keyof typeof translations.en] || key;
    }
    const currentDict = translations[language];
    return currentDict[key as keyof typeof currentDict] || translations.en[key as keyof typeof translations.en] || key;
  };

  useEffect(() => {
    if (mounted) {
      if (language === "hi") {
        document.body.classList.add("lang-hi");
      } else {
        document.body.classList.remove("lang-hi");
      }
    }
  }, [language, mounted]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
