// src/app/components/StackedCards.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Award, 
  Wrench, 
  Briefcase, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface StackCardItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  icon: any;
  colorBg: string;
  colorText: string;
}

export default function StackedCards() {
  const { t, language } = useLanguage();
  const isHindi = language === "hi";

  const cards: StackCardItem[] = [
    {
      id: 0,
      tag: "Skill India Mission",
      title: isHindi ? "स्थानीय तकनीकी सशक्तिकरण" : "Empowering Local Youth",
      subtitle: isHindi ? "कुशल भारत, सशक्त बिहार" : "Industry-Ready Technical Careers",
      description: isHindi
        ? "मिथिला एवं बिहार के होनहार युवाओं को उच्च स्तरीय तकनीकी प्रशिक्षण देकर स्थानीय एवं राष्ट्रीय स्तर पर रोजगार योग्य बनाना।"
        : "Inspiring ambitious youth to build world-class technical skills and engineering careers right from their homeland.",
      icon: CheckCircle2,
      colorBg: "#4285CD",
      colorText: "#FFFFFF"
    },
    {
      id: 1,
      tag: "NCVT & DGT Affiliated",
      title: isHindi ? "100% सरकारी मान्यता" : "100% Govt. Recognized",
      subtitle: isHindi ? "राष्ट्रीय प्रमाणन एवं मान्यता" : "National Trade Certification",
      description: isHindi
        ? "भारत सरकार (DGT/NCVT) द्वारा मान्यता प्राप्त ट्रेड डिप्लोमा जो रेलवे, डिफेंस एवं प्राइवेट कंपनियों में 100% मान्य है।"
        : "Govt. of India certified ITI diplomas recognized across Indian Railways, PSUs, Defense, and top multinational industries.",
      icon: Award,
      colorBg: "#2F8AD4",
      colorText: "#FFFFFF"
    },
    {
      id: 2,
      tag: "Advanced Labs",
      title: isHindi ? "आधुनिक वर्कशॉप और लैब्स" : "Modern Practical Labs",
      subtitle: isHindi ? "प्रैक्टिकल हैंड्स-ऑन ट्रेनिंग" : "Live Machinery Experience",
      description: isHindi
        ? "COPA कंप्यूटर लैब, इलेक्ट्रीशियन पैनल बोर्ड और फिटर लेथ मशीनों पर वास्तविक इंडस्ट्री वर्कशॉप अनुभव।"
        : "Equipped with state-of-the-art computer labs, high-voltage electrical setups, and precision lathe engineering machinery.",
      icon: Wrench,
      colorBg: "#3B7BC4",
      colorText: "#FFFFFF"
    },
    {
      id: 3,
      tag: "Career Cell",
      title: isHindi ? "94% प्लेसमेंट सहायता" : "94% Placement Record",
      subtitle: isHindi ? "कैंपस इंटरव्यू और जॉब्स" : "Direct Industry Recruitment",
      description: isHindi
        ? "प्राइवेट एवं पब्लिक सेक्टर में रोजगार हेतु समर्पित प्लेसमेंट सेल, इंटरव्यू तैयारी और करियर गाइडेंस।"
        : "Dedicated training & placement cell connecting students with campus recruitment drives and industrial apprenticeships.",
      icon: Briefcase,
      colorBg: "#4285CD",
      colorText: "#FFFFFF"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-cycle every 3.8s when not hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3800);
    return () => clearInterval(timer);
  }, [isHovered, activeIndex]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % cards.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleCardClick = (index: number) => {
    if (index === activeIndex || isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div 
      className="relative w-full max-w-lg mx-auto py-6 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Perspective Card Stage */}
      <div className="relative h-[290px] sm:h-[310px] w-full flex items-center justify-center">
        {cards.map((card, idx) => {
          // Calculate relative position in circular stack
          const position = (idx - activeIndex + cards.length) % cards.length;
          
          // Compute transform styles based on stack depth
          // 0 = Front active card
          // 1 = First behind (top-right offset)
          // 2 = Second behind
          // 3 = Backmost card
          const isFront = position === 0;

          // Fan-out expansion when hovered vs stacked rest
          let offsetX = 0;
          let offsetY = 0;
          let scale = 1;
          let zIndex = cards.length - position;
          let opacity = 1;

          if (isHovered) {
            // Fan out horizontally & vertically slightly for preview
            offsetX = position * 22;
            offsetY = -position * 14;
            scale = 1 - position * 0.03;
            opacity = 1 - position * 0.12;
          } else {
            // Isometric deck stack
            offsetX = position * 20;
            offsetY = -position * 16;
            scale = 1 - position * 0.04;
            opacity = 1 - position * 0.15;
          }

          const IconComponent = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className="absolute w-full max-w-[340px] sm:max-w-[380px] p-6 sm:p-7 rounded-3xl shadow-xl transition-all duration-500 ease-out cursor-pointer"
              style={{
                backgroundColor: card.colorBg,
                color: card.colorText,
                transform: `translate3d(${offsetX}px, ${offsetY}px, 0px) scale(${scale})`,
                zIndex: zIndex,
                opacity: opacity,
                boxShadow: isFront 
                  ? "0 20px 35px -8px rgba(66, 133, 205, 0.45), 0 8px 16px -4px rgba(6, 9, 12, 0.15)"
                  : "0 10px 20px -6px rgba(6, 9, 12, 0.12)",
              }}
            >
              {/* Card Header Tag & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs text-white shadow-xs">
                    <IconComponent size={20} strokeWidth={2.4} />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-white">
                    {card.tag}
                  </span>
                </div>

                <span className="text-xs font-bold text-white/70">
                  0{idx + 1} / 0{cards.length}
                </span>
              </div>

              {/* Card Titles */}
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1.5 leading-tight text-white" style={{ color: "#ffffff" }}>
                {card.title}
              </h3>
              <p className="text-xs sm:text-[13px] font-bold mb-3 tracking-wide text-white" style={{ color: "#ffffff", opacity: 0.95 }}>
                {card.subtitle}
              </p>

              {/* Card Body Narrative */}
              <p className="text-xs sm:text-[13px] leading-relaxed line-clamp-3 text-white font-medium" style={{ color: "#ffffff", opacity: 0.95 }}>
                {card.description}
              </p>

              {/* Card Bottom Indicator Bar */}
              <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white" style={{ color: "#ffffff" }}>
                <span className="flex items-center gap-1.5" style={{ color: "#ffffff" }}>
                  <Sparkles size={13} className="text-white" />
                  <span style={{ color: "#ffffff" }}>{isFront ? (isHindi ? "सक्रिय विशेषता" : "Featured Highlight") : (isHindi ? "क्लिक करें" : "Click to View")}</span>
                </span>
                <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform" style={{ color: "#ffffff" }}>
                  <span style={{ color: "#ffffff" }}>{isHindi ? "विस्तार" : "Explore"}</span>
                  <ArrowRight size={13} className="text-white" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Navigation & Dots */}
      <div className="flex items-center justify-between mt-3 px-4 max-w-[380px] mx-auto">
        <button
          onClick={handlePrev}
          aria-label="Previous card"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary shadow-xs transition-colors cursor-pointer"
          style={{ minHeight: "auto", padding: 0 }}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {cards.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => handleCardClick(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                dotIdx === activeIndex
                  ? "w-6 bg-[#4285CD]"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              style={{ minHeight: "auto", padding: 0 }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next card"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary shadow-xs transition-colors cursor-pointer"
          style={{ minHeight: "auto", padding: 0 }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}
