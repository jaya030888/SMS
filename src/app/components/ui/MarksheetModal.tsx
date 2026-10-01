// src/app/components/ui/MarksheetModal.tsx
"use client";

import React from "react";
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  QrCode,
  Award,
  Building
} from "lucide-react";
import type { PublishedMarksheet } from "@/src/app/lib/mockData";

interface MarksheetModalProps {
  marksheet: PublishedMarksheet | null;
  onClose: () => void;
  onAccept?: (id: number) => void;
  accepting?: boolean;
}

export default function MarksheetModal({
  marksheet,
  onClose,
  onAccept,
  accepting = false
}: MarksheetModalProps) {
  if (!marksheet) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAccepted = marksheet.status === "Accepted by Student";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 my-8 overflow-hidden print:border-none print:shadow-none print:m-0 print:rounded-none">
        
        {/* Header Bar - Hidden in Print */}
        <div className="flex items-center justify-between p-4 sm:p-6 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4285CD] text-white">
              <GraduationCap size={18} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">Official NCVT / Institute Marksheet</h3>
              <p className="text-[11px] text-slate-400">Certificate No: {marksheet.certificate_no}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAccepted && onAccept && (
              <button
                onClick={() => onAccept(marksheet.id)}
                disabled={accepting}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                <span>{accepting ? "Signing..." : "Accept Marksheet"}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Official Printable Certificate Body */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-800 bg-linear-to-b from-white via-slate-50/50 to-white">
          
          {/* Institutional Crest & Govt Header */}
          <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-5">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Directorate General of Training (DGT) • Ministry of Skill Development & Entrepreneurship
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              MAA GAURI PRIVATE INDUSTRIAL TRAINING INSTITUTE
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              NCVT Affiliated Vocational Campus • Main Road, Madhubani, Bihar - 847211
            </p>
            <div className="inline-block px-4 py-1 mt-2 rounded-full bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-wider">
              {marksheet.semester} • {marksheet.exam_session}
            </div>
          </div>

          {/* Student Candidate Credentials Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidate Name</span>
              <strong className="text-slate-900 font-extrabold text-sm">{marksheet.student_name}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Roll Number</span>
              <strong className="text-slate-900 font-mono font-extrabold">{marksheet.roll_no}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Trade / Course</span>
              <strong className="text-[#4285CD] font-extrabold">{marksheet.course}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Academic Batch</span>
              <strong className="text-slate-900 font-extrabold">{marksheet.batch}</strong>
            </div>
          </div>

          {/* Subject Scores Table */}
          <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left min-w-[500px] sm:min-w-full">
              <thead className="bg-slate-900 text-white font-extrabold">
                <tr>
                  <th className="py-2.5 px-3">Subject Code & Paper</th>
                  <th className="py-2.5 px-3 text-center">Max Marks</th>
                  <th className="py-2.5 px-3 text-center">Min Pass</th>
                  <th className="py-2.5 px-3 text-center">Marks Secured</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-medium text-slate-800">
                {marksheet.subjects.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-400 mr-2">{sub.code}</span>
                      <span className="font-bold text-slate-800">{sub.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{sub.max_marks}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{sub.min_pass_marks}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 font-mono">{sub.secured_marks}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300">
                <tr>
                  <td className="py-3 px-3 uppercase text-slate-700">Grand Aggregate Total</td>
                  <td className="py-3 px-3 text-center font-mono">{marksheet.max_marks}</td>
                  <td className="py-3 px-3 text-center text-slate-400">-</td>
                  <td className="py-3 px-3 text-center font-mono text-sm text-[#4285CD]">{marksheet.total_marks}</td>
                  <td className="py-3 px-3 text-center text-emerald-700 font-black">{marksheet.grade}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-3">
              <Award className="text-emerald-700 h-8 w-8 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Final Result</span>
                <h4 className="text-base font-black text-emerald-950">{marksheet.result} ({marksheet.percentage}%)</h4>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Issue Date</span>
                <strong className="text-slate-800">{marksheet.issue_date}</strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Grade Conferred</span>
                <strong className="text-emerald-700 font-black text-sm">{marksheet.grade}</strong>
              </div>
            </div>
          </div>

          {/* Authentication & Signatures Footer */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <QrCode size={40} />
              </div>
              <p className="text-[9px] text-slate-400">Scan to verify authenticity with NCVT portal</p>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Acceptance</span>
              {isAccepted ? (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                  <CheckCircle2 size={13} />
                  <span>Digitally Accepted</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-amber-600">Pending Student Acceptance</span>
              )}
              {marksheet.accepted_at && (
                <p className="text-[9px] text-slate-400">{new Date(marksheet.accepted_at).toLocaleString("en-IN")}</p>
              )}
            </div>

            <div className="text-right space-y-1">
              <div className="h-10 flex items-end justify-end">
                <span className="font-serif italic font-bold text-xs text-indigo-900 border-b border-slate-400 pb-0.5 px-3">
                  Er. R. K. Mishra
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-800">{marksheet.admin_signature}</p>
              <p className="text-[9px] text-slate-400">Seal & Authorized Signatory</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
