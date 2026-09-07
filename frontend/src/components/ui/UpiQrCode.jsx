import React, { useState } from "react";
import { QrCode, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function UpiQrCode({ upiId, payeeName, amount, note = "HR Tunes Course Enrollment" }) {
    const [copied, setCopied] = useState(false);

    // Standard UPI URI format
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    
    // High-res QR code generated via secure SVG chart service
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}&margin=10`;

    const handleCopyUpi = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        toast.success("UPI ID copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="flex flex-col items-center bg-black/60 border border-red-500/20 rounded-xl p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600/20 text-red-400">
                    <QrCode className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
                    Scan with any UPI App
                </h4>
            </div>

            {/* QR Code Container with sleek glow */}
            <div className="relative p-3 bg-white rounded-lg shadow-[0_0_25px_rgba(225,29,72,0.25)] border-2 border-red-500/30">
                <img
                    src={qrImageUrl}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 object-contain rounded"
                    loading="eager"
                />
                <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                    <span className="bg-red-600 text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        ₹{amount} INR
                    </span>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <span>Supported:</span>
                <span className="text-neutral-200 font-medium">GPay • PhonePe • Paytm • BHIM</span>
            </div>

            {/* UPI ID Copy Bar */}
            <div className="mt-4 w-full flex items-center justify-between gap-2 px-3 py-2 bg-neutral-900/80 border border-neutral-800 rounded-lg text-xs">
                <div className="truncate">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Payee UPI ID</span>
                    <span className="text-neutral-200 font-mono font-medium">{upiId}</span>
                </div>
                <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded transition text-[11px] font-medium shrink-0"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
        </div>
    );
}
