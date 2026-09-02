import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getCourseById } from '../../api/courseApi';
import { createOrder, verifyPayment } from '../../api/checkoutApi';
import { showToast, notificationReceived } from '../../features/preferenceNotification/preferenceNotificationSlice';

const STEPS = {
  REVIEW: 'review',
  PAYING: 'paying',
  SUCCESS: 'success',
};

// Available mock coupons dictionary
const AVAILABLE_COUPONS = {
  'THINKZ10': { discountPercent: 10, description: '10% off your order' },
  'SAVE20': { discountPercent: 20, description: '20% off your order' },
};

function CreditCardIcon() {
  return (
    <svg className="w-6 h-6 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function UpiIcon() {
  return (
    <svg className="w-6 h-6 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

export default function CheckoutPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Core Data State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(STEPS.REVIEW);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [generatedRewardCoupon, setGeneratedRewardCoupon] = useState('');

  // UI State
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState({
    name: "Alex Johnson",
    street: "123 Innovation Way, Suite 400",
    city: "Tech City",
    state: "CA",
    zip: "94016"
  });
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  useEffect(() => {
    let cancelled = false;
    getCourseById(courseId)
      .then((res) => {
        if (!cancelled) setCourse(res.data.data || res.data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load course details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [courseId]);

  // Derived Pricing Calculations with Coupon Support
  const coursePrice = typeof course?.price === 'number' ? course.price : 0;

  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = (coursePrice * appliedCoupon.discountPercent) / 100;
  }

  const discountedPrice = Math.max(0, coursePrice - discountAmount);
  const shippingFee = 0;
  const tax = discountedPrice * 0.18; // 18% tax on discounted total
  const grandTotal = (discountedPrice + shippingFee + tax).toFixed(2);

  // Handle Coupon Application
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCodeInput.trim().toUpperCase();

    if (!code) return;

    if (AVAILABLE_COUPONS[code]) {
      setAppliedCoupon({ code, ...AVAILABLE_COUPONS[code] });
      toast.success(`Coupon ${code} applied successfully!`, { theme: 'dark' });
      setCouponCodeInput('');
    } else {
      setCouponError('Invalid coupon code. Try THINKZ10 or SAVE20');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed', { theme: 'dark' });
  };

  const handlePay = async () => {
    setError(null);
    setProcessing(true);
    setStep(STEPS.PAYING);

    try {
      const order = await createOrder({ courseId, amount: parseFloat(grandTotal) });

      const mockPaymentId = `pay_mock_${Date.now()}`;
      const mockSignature = 'mock_signature';

      const result = await verifyPayment({
        orderId: order.orderId,
        paymentId: mockPaymentId,
        signature: mockSignature,
      });

      if (result.success) {
        setStep(STEPS.SUCCESS);

        // Generate a reward coupon for future purchases
        const newRewardCode = `WELCOMEBACK-${Math.floor(1000 + Math.random() * 9000)}`;
        setGeneratedRewardCoupon(newRewardCode);

        dispatch(showToast({
          title: 'Enrollment Successful!',
          message: `You are securely enrolled in ${course.title}. Reward code: ${newRewardCode}`,
          type: 'success'
        }));

        dispatch(notificationReceived({
          id: `order_${Date.now()}`,
          title: 'Order Confirmed & Reward Unlocked!',
          message: `Payment received for ${course.title}. Use code ${newRewardCode} for your next course!`,
          type: 'purchase',
          read: false,
          createdAt: new Date().toISOString(),
        }));

        toast.success('Payment successful — you are enrolled!', { theme: 'dark' });
      } else {
        throw new Error('Payment could not be verified.');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep(STEPS.REVIEW);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#151821] text-slate-900 dark:text-slate-100">
        <div className="p-6 text-sm">Loading checkout...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#151821]">
        <div className="p-6 text-sm text-red-500">Course not found.</div>
      </div>
    );
  }

  if (step === STEPS.SUCCESS) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-[fadeIn_0.4s_ease-out] px-4">
        <div className="w-full rounded-3xl bg-white dark:bg-[#1a1e2b] border border-slate-200 dark:border-[#262b38] backdrop-blur-xl p-8 text-center shadow-2xl space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Payment successful!</h2>
          <p className="text-sm text-slate-500 dark:text-[#94a3b8]">
            You're securely enrolled in <span className="text-slate-900 dark:text-zinc-200 font-semibold">{course.title}</span>.
          </p>

          {/* Generated Reward Coupon Box */}
          {generatedRewardCoupon && (
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-1 text-left">
              <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold uppercase tracking-wider">🎉 Reward Coupon Unlocked</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-widest">{generatedRewardCoupon}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedRewardCoupon);
                    toast.success('Coupon code copied to clipboard!', { theme: 'dark' });
                  }}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Copy
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Use this code on your next course purchase for a special discount.</p>
            </div>
          )}

          <button
            onClick={() => navigate('/learner')}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all cursor-pointer"
          >
            Go to my dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 md:p-8 flex items-center justify-center bg-slate-50 dark:bg-[#151821] text-slate-900 dark:text-[#f1f3f9] transition-colors duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-[#1a1e2b] border border-slate-200 dark:border-[#262b38] rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

        {/* Left Side: Billing & Payment Options */}
        <div className="lg:col-span-7 p-6 md:p-8 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#262b38]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">Checkout Experience</h1>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Secure Information Badge */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <ShieldCheckIcon />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">256-Bit SSL Encrypted & Secure Checkout</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Your financial and billing information is protected with industry-standard security.</p>
            </div>
          </div>

          {/* Step 1: Billing Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-[#94a3b8] uppercase">1. Billing Details</h2>
              <button
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                {isEditingAddress ? 'Done' : 'Change'}
              </button>
            </div>

            {isEditingAddress ? (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-[#323846] bg-slate-50 dark:bg-[#222736]">
                <input
                  type="text"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  placeholder="Full Name"
                  className="col-span-2 bg-white dark:bg-[#1a1e2b] border border-slate-300 dark:border-[#3e4658] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="Street Address"
                  className="col-span-2 bg-white dark:bg-[#1a1e2b] border border-slate-300 dark:border-[#3e4658] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                  className="bg-white dark:bg-[#1a1e2b] border border-slate-300 dark:border-[#3e4658] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  placeholder="ZIP / Postal Code"
                  className="bg-white dark:bg-[#1a1e2b] border border-slate-300 dark:border-[#3e4658] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#323846] bg-slate-50 dark:bg-[#222736]/50 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{address.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{address.street}, {address.city}, {address.state} {address.zip}</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_#10b981]" />
              </div>
            )}
          </div>

          {/* Step 2: Payment Methods */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-[#94a3b8] uppercase">2. Choose Payment Method</h2>

            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedMethod === 'upi' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-200 dark:border-[#323846] bg-slate-50 dark:bg-[#222736]/40 hover:bg-slate-100 dark:hover:bg-[#222736]'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedMethod === 'upi'}
                    onChange={() => setSelectedMethod('upi')}
                    className="accent-purple-600"
                  />
                  <UpiIcon />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">UPI / QR Code</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Google Pay, PhonePe, Paytm or any UPI app</p>
                  </div>
                </div>
              </label>

              {selectedMethod === 'upi' && (
                <div className="pl-7 pr-2">
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. username@oksbi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-white dark:bg-[#222736] border border-slate-300 dark:border-[#3e4658] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-200 dark:border-[#323846] bg-slate-50 dark:bg-[#222736]/40 hover:bg-slate-100 dark:hover:bg-[#222736]'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedMethod === 'card'}
                    onChange={() => setSelectedMethod('card')}
                    className="accent-purple-600"
                  />
                  <CreditCardIcon />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Credit / Debit Card</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Visa, Mastercard, RuPay, Amex</p>
                  </div>
                </div>
              </label>

              {selectedMethod === 'card' && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-[#323846] bg-slate-50 dark:bg-[#222736]/55">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="col-span-2 bg-white dark:bg-[#1a1e2b] border border-slate-300 dark:border-[#3e4658] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500 font-mono tracking-widest"
                  />
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    className="bg-white dark:bg-[#1a1e2b] border border-slate-300 dark:border-[#3e4658] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500 font-mono"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    maxLength={4}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className="bg-white dark:bg-[#1a1e2b] border border-slate-300 dark:border-[#3e4658] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary, Coupons & CTA */}
        <div className="lg:col-span-5 bg-slate-100 dark:bg-[#222736]/60 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-[#94a3b8] uppercase">Order Summary</h2>

            {/* Coupon Section */}
            <div className="space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. THINKZ10)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-[#1a1e2b] border border-slate-300 dark:border-[#3e4658] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white uppercase outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-md"
                >
                  Apply
                </button>
              </form>

              {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}

              {appliedCoupon && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-300">
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% off)</span>
                  <button onClick={handleRemoveCoupon} className="hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer">×</button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Course: {course.title}</span>
                <span className="font-mono">₹{coursePrice.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount ({appliedCoupon.discountPercent}%)</span>
                  <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Estimated Tax (18% GST)</span>
                <span className="font-mono">₹{tax.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 dark:border-[#323846] pt-3 flex justify-between items-baseline font-bold text-lg text-slate-900 dark:text-white">
                <span>Order Total</span>
                <span className="font-mono text-xl text-purple-600 dark:text-purple-400">₹{grandTotal}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-60"
          >
            {processing ? (step === STEPS.PAYING ? 'Processing payment…' : 'Please wait…') : 'Pay now'}
          </button>
        </div>

      </div>
    </div>
  );
}