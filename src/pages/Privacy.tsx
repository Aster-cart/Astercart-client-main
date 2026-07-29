import React from "react";
import { Link } from "react-router-dom";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-off-white font-inter py-10 px-4 md:px-20">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-border p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-space font-bold text-ink">Privacy Policy</h1>
          <Link to="/signup" className="text-sm text-pry font-medium hover:underline">Back to Sign Up</Link>
        </div>
        <div className="text-sm text-body leading-relaxed space-y-4">
          <p className="text-base font-semibold text-ink">ASTERCART LIMITED — PRIVACY POLICY</p>
          <p><strong>Effective Date:</strong> 9th August, 2026</p>
          <p><strong>Last Updated:</strong> 9th August, 2026</p>

          <h2 className="text-base font-semibold text-ink pt-4">1. Introduction</h2>
          <p>Welcome to Astercart.</p>
          <p>This Privacy Policy explains how ASTERCART LIMITED ("Astercart", "we", "us", or "our") collects, uses, stores, protects, and shares information when you access or use our website, mobile applications, dashboards, and related services (collectively, the "Platform").</p>
          <p>Astercart operates a technology marketplace that connects customers with independent stores and delivery partners. Astercart does not own or directly sell the products listed on the Platform. Instead, we provide the technology infrastructure that enables customers to discover products, place orders, make payments, and receive deliveries from participating stores.</p>
          <p>By using Astercart, you agree to the practices described in this Privacy Policy.</p>

          <h2 className="text-base font-semibold text-ink pt-4">2. Information About Us</h2>
          <p><strong>Data Controller:</strong> ASTERCART LIMITED</p>
          <p><strong>Registered Office:</strong> 22 Isah Mohammed Road, Durumi, Nigeria.</p>
          <p><strong>Business Office:</strong> 22 School Road, Satellite Town, Nigeria.</p>
          <p><strong>Contact Email:</strong> admin@astercart.com.ng</p>
          <p><strong>Support Phone:</strong> 08138850996</p>

          <h2 className="text-base font-semibold text-ink pt-4">3. Information We Collect</h2>
          <p>We collect information necessary to provide, improve, secure, and personalize the Astercart experience. The information we collect may include:</p>

          <h3 className="text-sm font-semibold text-ink pt-2">3.1 Information You Provide Directly</h3>
          <p>When you create an account, place an order, interact with stores, or contact support, we may collect: Full name, Email address, Phone number, Password and account authentication information, Delivery addresses, Billing information, Order information, Customer preferences, Reviews and feedback, Communications with Astercart support.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">3.2 Google Sign-In Information</h3>
          <p>If you choose to register or log in using Google Sign-In, we may receive information from Google, including: Name, Email address, Google account identifier, Profile information made available through Google's authentication system. We use this information only to create, authenticate, and manage your Astercart account.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">3.3 Payment Information</h3>
          <p>Astercart may process payments through third-party payment providers, including but not limited to Flutterwave, Paystack, and other approved payment providers. We may collect: Payment transaction details, Payment status, Transaction references, Refund information. Astercart does not store complete payment card details. Payment information is processed according to the security and privacy practices of our payment partners.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">3.4 Location Information</h3>
          <p>Astercart may collect location information when necessary to provide specific services, including: Selecting delivery locations, Calculating delivery availability, Matching customers with nearby stores, Tracking active deliveries, Improving delivery accuracy. Astercart does not continuously collect background location when you are not actively using location-based features.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">3.5 Device and Technical Information</h3>
          <p>We may automatically collect technical information including: Device type, Operating system, Browser information, IP address, Application version, Device identifiers, Crash reports, Usage information. This helps us maintain security, improve performance, and troubleshoot technical problems.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">3.6 Store Information</h3>
          <p>For stores using Astercart, we may collect: Store name, Business information, Contact information, Verification documents, Bank settlement details, Product listings, Inventory information, Store performance information.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">3.7 Rider Information</h3>
          <p>For delivery partners, we may collect: Identity information, Contact details, Verification information, Vehicle information, Location information during active deliveries, Delivery history.</p>

          <h2 className="text-base font-semibold text-ink pt-4">4. How We Use Your Information</h2>
          <p>Astercart may use collected information to:</p>
          <p><strong>Provide Services</strong> — Creating and managing accounts, Processing orders, Connecting customers with stores, Coordinating deliveries, Processing payments, Providing customer support.</p>
          <p><strong>Improve Astercart</strong> — Improving platform functionality, Developing new features, Understanding user behaviour, Improving recommendations, Detecting technical issues.</p>
          <p><strong>Maintain Security</strong> — Preventing fraud, Detecting unauthorized access, Protecting users, Enforcing platform rules.</p>
          <p><strong>Communication</strong> — We may use your information to send: Order updates, Delivery notifications, Security alerts, Service announcements, Marketing communications where permitted. You may opt out of promotional communications.</p>

          <h2 className="text-base font-semibold text-ink pt-4">5. Sharing of Information</h2>
          <p>Astercart may share information with:</p>

          <h3 className="text-sm font-semibold text-ink pt-2">5.1 Stores</h3>
          <p>When you place an order, relevant information may be shared with the store fulfilling your order, including: Customer name, Order details, Delivery information.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">5.2 Riders</h3>
          <p>When delivery is required, relevant information may be shared with delivery partners, including: Delivery location, Customer contact information necessary for delivery, Order information.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">5.3 Payment Providers</h3>
          <p>Payment information may be shared with authorized payment processors to complete transactions.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">5.4 Service Providers</h3>
          <p>We may use third-party providers for: Cloud hosting, Analytics, Notifications, Security services, Customer support tools. These providers are required to handle information appropriately.</p>

          <h3 className="text-sm font-semibold text-ink pt-2">5.5 Legal Requirements</h3>
          <p>We may disclose information where required by law, regulation, court order, or lawful government request.</p>

          <h2 className="text-base font-semibold text-ink pt-4">6. Store and Product Responsibility</h2>
          <p>Astercart is a marketplace platform connecting customers with independent stores. Product ownership, quality, descriptions, legality, and compliance remain the responsibility of the individual stores offering products through the Platform. Astercart may take action against stores that violate our policies, including removing listings, suspending accounts, or permanently restricting access.</p>

          <h2 className="text-base font-semibold text-ink pt-4">7. Reviews and User Content</h2>
          <p>Astercart may allow users to submit: Reviews, Ratings, Feedback, Other content. By submitting content, you grant Astercart permission to use, display, moderate, and remove such content where necessary. Astercart may remove content that violates our policies, contains fraudulent information, is abusive or harmful, or misrepresents products or services.</p>

          <h2 className="text-base font-semibold text-ink pt-4">8. Future Features</h2>
          <p>Astercart may introduce additional features including: Digital wallet, Loyalty rewards, Coupons, Referral programs, Subscriptions, In-app messaging. Information collected through these features will be handled according to this Privacy Policy.</p>

          <h2 className="text-base font-semibold text-ink pt-4">9. Data Security</h2>
          <p>Astercart implements reasonable technical and organizational measures designed to protect user information. However, no online platform can guarantee complete security. Users are responsible for maintaining the confidentiality of their account credentials.</p>

          <h2 className="text-base font-semibold text-ink pt-4">10. Data Retention</h2>
          <p>We retain information only for as long as necessary to: Provide services, Meet legal obligations, Resolve disputes, Maintain records, Prevent fraud. When information is no longer required, it may be deleted or anonymized.</p>

          <h2 className="text-base font-semibold text-ink pt-4">11. Your Rights</h2>
          <p>Depending on applicable law, you may have rights including: Accessing your personal information, Requesting correction of inaccurate information, Requesting deletion where applicable, Restricting certain processing activities, Objecting to certain uses of your information. Requests may be sent to: admin@astercart.com.ng</p>

          <h2 className="text-base font-semibold text-ink pt-4">12. Children's Privacy</h2>
          <p>Astercart is not designed to knowingly collect personal information from children without appropriate authorization. If you believe a child has provided personal information improperly, contact us so appropriate action can be taken.</p>

          <h2 className="text-base font-semibold text-ink pt-4">13. Cookies and Similar Technologies</h2>
          <p>Our website and services may use cookies and similar technologies to: Improve functionality, Remember preferences, Analyze usage, Improve security. Users may control cookie settings through their browser.</p>

          <h2 className="text-base font-semibold text-ink pt-4">14. Changes to This Privacy Policy</h2>
          <p>Astercart may update this Privacy Policy periodically. When significant changes occur, we may notify users through appropriate channels.</p>

          <h2 className="text-base font-semibold text-ink pt-4">15. Contact Us</h2>
          <p>If you have questions regarding this Privacy Policy, contact:</p>
          <p><strong>ASTERCART LIMITED</strong><br />Email: admin@astercart.com.ng<br />Phone: 08138850996</p>

          <p className="text-xs text-muted pt-4">END OF PRIVACY POLICY</p>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center">
          <Link to="/signup" className="inline-block px-6 py-3 bg-pry text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
