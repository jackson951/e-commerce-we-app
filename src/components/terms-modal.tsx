"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export function TermsModal({
  isOpen,
  onClose,
  onAccept,
  title = "Terms and Conditions",
  description = "Please read and accept our terms and conditions to continue.",
  buttonText = "I Accept"
}: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    // Check if user has scrolled to bottom (within 10px tolerance)
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    setHasAccepted(true);
    onAccept();
  };

  const handleCancel = () => {
    setHasAccepted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <ShieldCheck className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Terms Content */}
            <div 
              className="h-[300px] w-full rounded-md border border-slate-200 p-4 overflow-y-auto"
              onScroll={handleScroll}
            >
              <div className="text-sm text-slate-600 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Acceptance of Terms</h3>
                  <p>
                    By accessing and using StreetLuxCity, you accept and agree to be bound by the terms and provision of this agreement.
                    In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">2. Use License</h3>
                  <p className="mb-2">
                    Permission is granted to temporarily download one copy of the materials (information or software) on StreetLuxCity's website for personal,
                    non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                    <li>Attempt to decompile or reverse engineer any software contained on the site</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                    <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">3. User Account</h3>
                  <p>
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                    Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">4. Prohibited Uses</h3>
                  <p className="mb-2">
                    You are prohibited from using the site or its content:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>For any unlawful purpose</li>
                    <li>To solicit others to perform or participate in any unlawful acts</li>
                    <li>To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances</li>
                    <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                    <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">5. Limitation of Liability</h3>
                  <p>
                    In no event shall StreetLuxCity, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect,
                    incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other
                    intangible losses, resulting from your access to or use of or inability to access or use the Service.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">6. Governing Law</h3>
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions.
                    Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">7. Changes</h3>
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide
                    at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">8. Contact Us</h3>
                  <p>
                    If you have any questions about these Terms, please contact us at support@streetluxcity.com.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptance Checkbox */}
            <div className="flex items-center space-x-3 border-t border-slate-200 pt-4">
              <input
                type="checkbox"
                id="terms-accept"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="h-4 w-4 text-rose-500 focus:ring-rose-500 border-slate-300 rounded disabled:opacity-50"
              />
              <label htmlFor="terms-accept" className="text-sm text-slate-600">
                I have read and agree to the terms and conditions
                {!hasScrolledToBottom && (
                  <span className="ml-2 text-xs text-amber-600"> (Please scroll to the bottom to continue)</span>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || !hasAccepted}
            className={`px-6 py-2 text-sm font-bold text-white rounded-xl transition-colors ${
              hasScrolledToBottom && hasAccepted
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
