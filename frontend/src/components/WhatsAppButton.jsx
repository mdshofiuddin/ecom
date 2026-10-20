import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WHATSAPP_NUMBER = '8801712345678';

export function getWhatsAppUrl(text) {
  const encoded = encodeURIComponent(text || 'Hello ApexStore, I would like to inquire about your products.');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function WhatsAppButton() {
  return (
    <aside aria-label="Support and Contact Options">
      <a
        href={getWhatsAppUrl('Hi ApexStore Support, I have a question regarding my shopping.')}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        title="Chat with us on WhatsApp"
        aria-label="Chat with us on WhatsApp"
      >
        <span className="whatsapp-pulse"></span>
        <MessageCircle size={28} />
        <span className="whatsapp-text">WhatsApp Support</span>
      </a>
    </aside>
  );
}
