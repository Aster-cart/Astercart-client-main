import React from "react";

const SupportAD: React.FC = () => {
  return (
    <div className="font-inter">
      <div className="bg-white rounded-xl p-6 border mb-6">
        <h2 className="text-lg font-semibold mb-2">Customer Support</h2>
        <p className="text-sm text-gray-500 mb-6">
          Support requests are sent directly to your email (<strong>support@astercart.com</strong>)
          and via WhatsApp. Manage them from your WhatsApp Business account.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: "📱",
              title: "WhatsApp Business",
              desc: "All customer chats land here. Respond directly from WhatsApp.",
              action: "Open WhatsApp",
              href: "https://web.whatsapp.com",
            },
            {
              icon: "📧",
              title: "Email inbox",
              desc: "Every support request sends a formatted email copy to your admin email.",
              action: "Open email",
              href: "mailto:support@astercart.com",
            },
            {
              icon: "⚙️",
              title: "WhatsApp number",
              desc: "Update the WhatsApp number in Support.tsx in the mobile app.",
              action: null,
              href: null,
            },
          ].map((card, i) => (
            <div key={i} className="border rounded-xl p-5">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{card.desc}</p>
              {card.action && card.href && (
                <a
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-pry font-medium"
                >
                  {card.action} →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 font-medium mb-1">📌 Phase 2 — In-app support chat</p>
        <p className="text-sm text-amber-700">
          A full in-app support chat system with ticket tracking, SLA timers, and agent assignment
          is planned for Phase 2 once the marketplace has active users.
        </p>
      </div>
    </div>
  );
};

export default SupportAD;
