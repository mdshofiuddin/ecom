import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Smartphone, Hash, AlertCircle } from 'lucide-react';

export const BKASH_MERCHANT_NUMBER = '01712345678';
export const ROCKET_MERCHANT_NUMBER = '017123456789';

export function BkashPaymentGuide({ amount, bKashNumber, setBkashNumber, trxId, setTrxId }) {
  const [copied, setCopied] = useState(false);

  const copyNumber = () => {
    navigator.clipboard.writeText(BKASH_MERCHANT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="payment-guide-box bkash-theme">
      <div className="payment-guide-header">
        <div className="brand-pill bkash-pill">
          <span className="dot"></span>
          <span>bKash Payment Gateway</span>
        </div>
        <div className="amount-pill">
          Payable: <strong>৳{Math.round(amount * 120).toLocaleString()} BDT</strong> (${amount.toFixed(2)} USD)
        </div>
      </div>

      <div className="merchant-box">
        <div>
          <div className="label">bKash Merchant / Personal Wallet Number</div>
          <div className="number">{BKASH_MERCHANT_NUMBER}</div>
        </div>
        <button type="button" onClick={copyNumber} className="btn-copy">
          {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="steps-container">
        <div className="step-item">
          <span className="step-num">1</span>
          <span>Open <strong>bKash App</strong> or dial <code>*247#</code></span>
        </div>
        <div className="step-item">
          <span className="step-num">2</span>
          <span>Select <strong>Send Money</strong> or <strong>Payment</strong> to the number above</span>
        </div>
        <div className="step-item">
          <span className="step-num">3</span>
          <span>Enter amount <strong>৳{Math.round(amount * 120)}</strong>, Ref: <strong>Apex</strong>, and confirm with your PIN</span>
        </div>
        <div className="step-item">
          <span className="step-num">4</span>
          <span>Copy the <strong>TrxID</strong> (Transaction ID) from your bKash SMS and paste below</span>
        </div>
      </div>

      <div className="payment-inputs-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="bkash_number">
            <Smartphone size={14} style={{ display: 'inline', marginRight: 4 }} />
            Your bKash Wallet Number *
          </label>
          <input
            type="text"
            id="bkash_number"
            className="form-input"
            required
            placeholder="017XXXXXXXX"
            value={bKashNumber}
            onChange={(e) => setBkashNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bkash_trx">
            <Hash size={14} style={{ display: 'inline', marginRight: 4 }} />
            bKash Transaction ID (TrxID) *
          </label>
          <input
            type="text"
            id="bkash_trx"
            className="form-input"
            required
            placeholder="e.g. BL9A4K89Z1"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="security-notice">
        <ShieldCheck size={16} color="#10b981" />
        <span>TrxID is verified against duplicate reuse. Your order will be confirmed immediately.</span>
      </div>
    </div>
  );
}

export function RocketPaymentGuide({ amount, rocketNumber, setRocketNumber, trxId, setTrxId }) {
  const [copied, setCopied] = useState(false);

  const copyNumber = () => {
    navigator.clipboard.writeText(ROCKET_MERCHANT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="payment-guide-box rocket-theme">
      <div className="payment-guide-header">
        <div className="brand-pill rocket-pill">
          <span className="dot"></span>
          <span>Dutch-Bangla Rocket Payment</span>
        </div>
        <div className="amount-pill">
          Payable: <strong>৳{Math.round(amount * 120).toLocaleString()} BDT</strong> (${amount.toFixed(2)} USD)
        </div>
      </div>

      <div className="merchant-box">
        <div>
          <div className="label">Rocket Merchant / Agent Wallet Number</div>
          <div className="number">{ROCKET_MERCHANT_NUMBER}</div>
        </div>
        <button type="button" onClick={copyNumber} className="btn-copy">
          {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="steps-container">
        <div className="step-item">
          <span className="step-num">1</span>
          <span>Open <strong>Rocket App</strong> or dial <code>*322#</code></span>
        </div>
        <div className="step-item">
          <span className="step-num">2</span>
          <span>Select <strong>Payment / Send Money</strong> to the 12-digit number above</span>
        </div>
        <div className="step-item">
          <span className="step-num">3</span>
          <span>Enter amount <strong>৳{Math.round(amount * 120)}</strong> and enter your 4-digit PIN</span>
        </div>
        <div className="step-item">
          <span className="step-num">4</span>
          <span>Copy the <strong>Transaction ID</strong> from DBBL Rocket SMS and enter below</span>
        </div>
      </div>

      <div className="payment-inputs-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="rocket_number">
            <Smartphone size={14} style={{ display: 'inline', marginRight: 4 }} />
            Your Rocket Mobile Account (12 digits) *
          </label>
          <input
            type="text"
            id="rocket_number"
            className="form-input"
            required
            placeholder="017XXXXXXXXX"
            value={rocketNumber}
            onChange={(e) => setRocketNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="rocket_trx">
            <Hash size={14} style={{ display: 'inline', marginRight: 4 }} />
            Rocket Transaction ID (TrxID) *
          </label>
          <input
            type="text"
            id="rocket_trx"
            className="form-input"
            required
            placeholder="e.g. 9842103561"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="security-notice">
        <ShieldCheck size={16} color="#10b981" />
        <span>DBBL Rocket automated audit verification enabled.</span>
      </div>
    </div>
  );
}
