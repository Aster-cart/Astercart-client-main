import React from "react";
import { Link } from "react-router-dom";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-off-white font-inter py-10 px-4 md:px-20">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-border p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-space font-bold text-ink">Store Partner Agreement</h1>
          <Link to="/signup" className="text-sm text-pry font-medium hover:underline">Back to Sign Up</Link>
        </div>
        <div className="text-sm text-body leading-relaxed space-y-4">
          <p className="text-base font-semibold text-ink">ASTERCART LIMITED — STORE PARTNER AGREEMENT</p>
          <p><strong>Effective Date:</strong> 9th August, 2026</p>
          <p>This Store Partner Agreement ("Agreement") is made between Astercart Limited and the registered store/business accepted onto the Astercart platform ("Store Partner" or "Store").</p>

          <h2 className="text-base font-semibold text-ink pt-4">1. INTRODUCTION</h2>
          <p>Astercart Limited operates a digital marketplace platform that connects customers with independent supermarkets, grocery stores, and retail businesses. This Agreement establishes the relationship between Astercart and the Store Partner.</p>

          <h2 className="text-base font-semibold text-ink pt-4">2. DEFINITIONS</h2>
          <p><strong>"Astercart Platform"</strong> — Means the Astercart mobile application, website, software systems, dashboards, technology infrastructure, and related services operated by Astercart.</p>
          <p><strong>"Store Partner"</strong> — Means an independent supermarket, grocery store, retailer, or business approved to sell products through Astercart.</p>
          <p><strong>"Base Price"</strong> — Means the price of a product determined and provided by the Store Partner before any Astercart pricing adjustments.</p>
          <p><strong>"Customer Price"</strong> — Means the final price displayed to customers on the Astercart Platform.</p>
          <p><strong>"Commission"</strong> — Means the percentage deducted by Astercart from the Store Partner's Base Price for completed transactions.</p>
          <p><strong>"Order"</strong> — Means a customer request to purchase products through the Astercart Platform.</p>
          <p><strong>"Settlement"</strong> — Means payment made by Astercart to a Store Partner after deduction of applicable commissions, adjustments, refunds, and other applicable charges.</p>

          <h2 className="text-base font-semibold text-ink pt-4">3. APPOINTMENT AS A STORE PARTNER</h2>
          <p>The Store Partner appoints Astercart as a marketplace platform. Acceptance onto Astercart does not create a partnership, employment relationship, franchise relationship, agency relationship, or joint venture.</p>

          <h2 className="text-base font-semibold text-ink pt-4">4. INDEPENDENT BUSINESS RELATIONSHIP</h2>
          <p>The Store Partner remains an independent business entity responsible for its employees, operations, product sourcing, licences, taxes, regulatory compliance, and physical store operations.</p>

          <h2 className="text-base font-semibold text-ink pt-4">5. STORE REGISTRATION AND VERIFICATION</h2>
          <p>Before activation, the Store Partner shall provide registered business name, CAC registration information, store address, contact information, bank account details, identification documents, store photographs, and product information.</p>

          <h2 className="text-base font-semibold text-ink pt-4">6. STORE RESPONSIBILITIES</h2>
          <p>The Store Partner agrees to maintain accurate information, ensure product quality, and manage inventory responsibly.</p>

          <h2 className="text-base font-semibold text-ink pt-4">7. PRODUCT PRICING AND ASTERCART PRICING AUTHORITY</h2>
          <p>The Store Partner determines Base Prices. Astercart independently determines Customer Prices which may differ due to marketplace operating costs, promotions, discounts, and platform revenue strategies.</p>

          <h2 className="text-base font-semibold text-ink pt-4">8. COMMISSION AND ASTERCART FEES</h2>
          <p>Astercart receives a commission from each completed transaction. Commission is calculated based on the Store Partner's Base Price. Astercart may operate a tiered commission structure.</p>

          <h2 className="text-base font-semibold text-ink pt-4">9. CUSTOMER PAYMENTS AND STORE SETTLEMENT</h2>
          <p>Customers pay through approved Astercart payment channels. Settlements occur weekly (Monday – Sunday).</p>

          <h2 className="text-base font-semibold text-ink pt-4">10. ORDER MANAGEMENT</h2>
          <p>Upon receiving an order, the Store Partner shall review, prepare, and fulfil the order. The Store Partner shall not intentionally delay, reject, or cancel orders without reasonable justification.</p>

          <h2 className="text-base font-semibold text-ink pt-4">11. OUT-OF-STOCK ITEMS AND SUBSTITUTIONS</h2>
          <p>The Store Partner shall contact the customer through approved contact details to inform them of unavailable items and offer alternatives. Customer confirmation must be obtained before substitution.</p>

          <h2 className="text-base font-semibold text-ink pt-4">12. CUSTOMER INFORMATION</h2>
          <p>Customer information provided is for order fulfilment only and shall not be used for marketing, direct sales, or moving customers away from Astercart.</p>

          <h2 className="text-base font-semibold text-ink pt-4">13. DELIVERY SERVICES</h2>
          <p>Astercart facilitates delivery through independent third-party providers. Delivery riders are not employees of Astercart or the Store Partner.</p>

          <h2 className="text-base font-semibold text-ink pt-4">14. ASTERCART MARKETING RIGHTS</h2>
          <p>Astercart may request permission to display approved marketing materials within the Store Partner's premises.</p>

          <h2 className="text-base font-semibold text-ink pt-4">15. INTELLECTUAL PROPERTY</h2>
          <p>Astercart retains ownership of its application, software, branding, customer database, analytics, and marketplace technology.</p>

          <h2 className="text-base font-semibold text-ink pt-4">16. SUSPENSION AND TERMINATION</h2>
          <p>Astercart may suspend or terminate accounts for violation of this Agreement, false information, fraud, or repeated failure of customer expectations.</p>

          <h2 className="text-base font-semibold text-ink pt-4">17. LIMITATION OF LIABILITY</h2>
          <p>Astercart does not guarantee minimum sales, customer numbers, or specific revenue outcomes.</p>

          <h2 className="text-base font-semibold text-ink pt-4">18. GOVERNING LAW</h2>
          <p>This Agreement shall be governed by the laws of the Federal Republic of Nigeria.</p>

          <h2 className="text-base font-semibold text-ink pt-4">19. DISPUTE RESOLUTION</h2>
          <p>The Parties shall first attempt to resolve disputes amicably. If unresolved, disputes shall be handled through appropriate legal proceedings under Nigerian law.</p>

          <h2 className="text-base font-semibold text-ink pt-4">20. ACCEPTANCE</h2>
          <p>By registering and operating a Store Partner account on Astercart, the Store Partner confirms that it has read, understood, and agreed to be bound by this Agreement and applicable Astercart policies.</p>
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

export default Terms;
