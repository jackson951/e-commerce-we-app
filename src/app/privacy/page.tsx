"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
                Privacy Policy
              </h1>
            </div>
            <p className="text-sm text-slate-500">Last updated: March 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <div className="space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Introduction</h2>
                <p className="text-slate-700 leading-relaxed">
                  StreetLuxCity ("we", "our", "us") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                  information when you visit our website and use our services.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>Name and contact information</li>
                      <li>Email address and phone number</li>
                      <li>Shipping and billing addresses</li>
                      <li>Payment information (processed securely)</li>
                      <li>Account credentials</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Usage Information</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>IP address and browser type</li>
                      <li>Pages visited and time spent</li>
                      <li>Purchase history and preferences</li>
                      <li>Device information</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li><strong>Order Processing:</strong> To process and fulfill your orders</li>
                  <li><strong>Customer Service:</strong> To respond to your inquiries and requests</li>
                  <li><strong>Personalization:</strong> To personalize your shopping experience</li>
                  <li><strong>Marketing:</strong> To send promotional materials (with your consent)</li>
                  <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
                  <li><strong>Improvements:</strong> To improve our website and services</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Information Sharing</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li><strong>Service Providers:</strong> Third-party vendors who help us operate our business</li>
                  <li><strong>Payment Processors:</strong> To process your payments securely</li>
                  <li><strong>Shipping Companies:</strong> To deliver your orders</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Data Security</h2>
                <p className="text-slate-700 leading-relaxed">
                  We implement appropriate security measures to protect your personal information, 
                  including encryption, secure servers, and access controls. However, no method of 
                  transmission over the internet is 100% secure.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Your Rights</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent at any time</li>
                  <li>File a complaint with a data protection authority</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Cookies</h2>
                <p className="text-slate-700 leading-relaxed">
                  We use cookies to enhance your browsing experience, analyze site usage, and 
                  deliver personalized content. You can manage your cookie preferences through 
                  your browser settings.
                </p>
              </section>

              {/* Contact Us */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p className="text-slate-700 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-slate-600">Email: privacy@streetluxcity.com</p>
                  <p className="text-slate-600">Address: 123 Commerce Street, Cape Town, South Africa</p>
                </div>
              </section>

            </div>
          </div>

          {/* Back to Home Button */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.17a1 1 0 0 0-1.34 0l-8.36 6.97C2.62 10.43 2.84 11 3.3 11H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z"/>
              </svg>
              Back to Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}