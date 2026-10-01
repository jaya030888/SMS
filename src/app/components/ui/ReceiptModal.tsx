// src/app/components/ui/ReceiptModal.tsx
"use client";

import React from 'react';
import { Modal } from './Modal';
import { Printer, Download, CheckCircle2, GraduationCap, Building2 } from 'lucide-react';

interface ReceiptData {
  receiptNo: string;
  transactionId: string;
  date: string;
  studentName: string;
  studentId: number;
  rollNo: string;
  course: string;
  batch: string;
  amount: number;
  paymentMethod: string;
  paymentMode: string;
  remarks?: string;
  feeBreakdown?: {
    tuition: number;
    lab: number;
    library: number;
    exam: number;
    development: number;
  };
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Payment Receipt" maxWidth="2xl">
      <div className="space-y-6">
        {/* Printable Receipt Sheet */}
        <div id="printable-receipt" className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs print:border-none print:shadow-none print:p-0">
          
          {/* Receipt Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-800">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                <GraduationCap size={28} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  MAA GAURI PRIVATE ITI
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  NCVT Affiliated • DGT Govt. of India Approved • Reg: 01/01/01/19322/08
                </p>
                <p className="text-[11px] text-slate-400">
                  Campus: Sakri Road, Madhubani, Bihar - 847239 | Email: info@itiinstitute.edu
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block">Official Receipt</span>
              <p className="text-xs font-mono font-bold text-slate-800">{receipt.receiptNo}</p>
              <p className="text-[11px] text-slate-500">{new Date(receipt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold block">Student Name:</span>
              <b className="text-slate-800">{receipt.studentName}</b>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Roll / Student ID:</span>
              <b className="text-slate-800">{receipt.rollNo || `#${receipt.studentId}`}</b>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Trade / Course:</span>
              <b className="text-indigo-700 font-extrabold">{receipt.course}</b>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Batch:</span>
              <b className="text-slate-800">{receipt.batch || '2024-2026'}</b>
            </div>
          </div>

          {/* Payment Particulars Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Transaction Reference</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    Course Installment Fee ({receipt.course})
                    {receipt.remarks && <p className="text-[10px] text-slate-400 font-normal">{receipt.remarks}</p>}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">{receipt.transactionId}</td>
                  <td className="py-3 px-3 font-medium text-slate-600">{receipt.paymentMethod} ({receipt.paymentMode})</td>
                  <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                    {formatCurrency(receipt.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total & Status Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <div>
                <span className="font-bold text-emerald-800">Payment Status: Verified & Completed</span>
                <p className="text-[10px] text-slate-400">Electronic transaction recorded on ERP Ledger</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-slate-500 font-bold block text-[11px]">Total Paid Amount:</span>
              <strong className="text-lg font-black text-indigo-700">{formatCurrency(receipt.amount)}</strong>
            </div>
          </div>

          {/* Stamp & Signatures */}
          <div className="flex items-end justify-between pt-10 mt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 w-36 mb-1" />
              <span>Student / Payer Signature</span>
            </div>

            <div className="inline-flex flex-col items-center">
              <div className="h-12 w-28 border-2 border-dashed border-indigo-200 rounded-lg flex items-center justify-center text-[10px] font-black text-indigo-400 uppercase rotate-[-4deg] mb-1">
                ITI SEAL VERIFIED
              </div>
              <span>Authorized Officer Seal</span>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-300 w-36 mb-1" />
              <span>Accounts Officer</span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-white shadow-xs cursor-pointer"
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
