import React, { useState, useEffect } from 'react';
import { User, Wallet, AdminAccountSale, AdminBuyingRequirement } from '../types';
import { apiService } from '../lib/db';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

interface AdminAccountSellerProps {
  user: User;
  wallet: Wallet | null;
  onRefreshTrigger: () => void;
  initialPlatform?: 'gmail' | 'fb' | 'insta';
  onBack?: () => void;
}

export default function AdminAccountSeller({ user, wallet, onRefreshTrigger, initialPlatform = 'gmail', onBack }: AdminAccountSellerProps) {
  const [activePlatform, setActivePlatform] = useState<'gmail' | 'fb' | 'insta'>(initialPlatform);
  const [sales, setSales] = useState<AdminAccountSale[]>([]);
  const [buyingRequirements, setBuyingRequirements] = useState<AdminBuyingRequirement[]>([]);
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [accountPassword, setAccountPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewHistory, setViewHistory] = useState<boolean>(false);

  useEffect(() => {
    setActivePlatform(initialPlatform);
  }, [initialPlatform]);

  const fetchSales = async () => {
    try {
      const data = await apiService.getAdminSales(user.id);
      setSales(data.filter(s => s.platform_type === activePlatform));
    } catch (e) {
      console.error('Error fetching admin sales:', e);
    }
  };

  const fetchRequirements = async () => {
    try {
      const data = await apiService.getAdminBuyingRequirements();
      setBuyingRequirements(data);
    } catch (e) {
      console.error('Error fetching requirements:', e);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchRequirements();
    
    const handleEvents = () => {
      fetchSales();
      fetchRequirements();
      onRefreshTrigger();
    };

    window.addEventListener('eebd_withdrawal_updated', handleEvents);
    window.addEventListener('eebd_buy_rules_updated', handleEvents);
    return () => {
      window.removeEventListener('eebd_withdrawal_updated', handleEvents);
      window.removeEventListener('eebd_buy_rules_updated', handleEvents);
    };
  }, [user.id, activePlatform]);

  // Find dynamic requirements set by admin in dashboard
  const currentReq = buyingRequirements.find(r => r.platform_type === activePlatform && r.active);
  const priceBdtVal = currentReq ? currentReq.price_bdt : (activePlatform === 'gmail' ? 16 : activePlatform === 'fb' ? 25 : 20);
  const requiredPass = currentReq ? currentReq.required_password : (activePlatform === 'gmail' ? '@super321' : '');
  const remainingLimit = currentReq ? currentReq.limit_count || 250 : 250;

  // Alert handler
  const fireAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') => {
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire({
        title,
        text,
        icon,
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#1877F2',
        customClass: {
          popup: 'rounded-3xl border border-gray-100 shadow-xl font-sans'
        }
      });
    } else {
      alert(`${title}\n${text}`);
    }
  };

  const getPlatformLabel = () => {
    if (activePlatform === 'gmail') return 'জিমেইল';
    if (activePlatform === 'fb') return 'ফেসবুক আইডি';
    return 'ইনস্টাগ্রাম আইডি';
  };

  const getPlatformTitle = () => {
    if (activePlatform === 'gmail') return 'জিমেইল মার্কেটিং';
    if (activePlatform === 'fb') return 'ফেসবুক আইডি সেল';
    return 'ইনস্টাগ্রাম অ্যাকাউন্ট সেল';
  };

  const getPlatformDesc = () => {
    if (activePlatform === 'gmail') return 'সঠিক নিয়মে কাজ করুন; ভুল Gmail/পাসওয়ার্ড সাবমিট করলে অ্যাকাউন্ট সাসপেন্ড হতে পারে।';
    if (activePlatform === 'fb') return 'সঠিক নিয়মে কাজ করুন; ভুল ফেসবুক আইডি/পাসওয়ার্ড সাবমিট করলে অ্যাকাউন্ট রিজেক্ট হতে পারে।';
    return 'সঠিক নিয়মে কাজ করুন; ভুল ইনস্টাগ্রাম আইডি/পাসওয়ার্ড সাবমিট করলে অ্যাকাউন্ট রিজেক্ট হতে পারে।';
  };

  const handleCopyPassword = () => {
    if (requiredPass) {
      navigator.clipboard.writeText(requiredPass);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Keep verification requirement check
    if (!user.is_verified) {
      fireAlert(
        'অ্যাকাউন্ট ভেরিফিকেশন প্রয়োজন!',
        `অ্যাডমিনের কাছে ডিরেক্ট ${getPlatformLabel()} বিক্রি করতে অনুগ্রহ করে প্রথমে লিডারবোর্ড বা হোমপেজ থেকে ভেরিফাই সম্পন্ন করুন।`,
        'warning'
      );
      return;
    }

    if (!accountEmail || !accountPassword) {
      setMessage({ type: 'error', text: 'অনুগ্রহ করে সব তথ্য সঠিকভাবে প্রদান করুন।' });
      return;
    }

    // Secure checking for password verification rule to match admin guide
    if (requiredPass && accountPassword.trim() !== requiredPass.trim()) {
      fireAlert(
        'পাসওয়ার্ড মেলেনি!',
        `গ্রুপের নিয়ম অনুযায়ী পাসওয়ার্ডটি অবশ্যই "${requiredPass}" হতে হবে। পরিবর্তন করে সাবমিট করুন।`,
        'error'
      );
      setMessage({ type: 'error', text: `ভুল পাসওয়ার্ড সাবমিট করছেন! সঠিক সিকিউরিটি পাসওয়ার্ডটি সেট করে দিনঃ "${requiredPass}"` });
      return;
    }

    setLoading(true);
    const res = await apiService.submitAdminSale(
      user.id,
      user.username,
      activePlatform,
      accountEmail,
      accountPassword,
      'Not Specified',
      `Submitted via ${getPlatformLabel()} Sell module`,
      priceBdtVal
    );
    setLoading(false);

    if (res.success && res.sale) {
      setMessage({
        type: 'success',
        text: `সফলভাবে অ্যাডমিন অডিট প্যানেলে জমা দেওয়া হয়েছে! এডমিন আপনার ${getPlatformLabel()} পাসওয়ার্ড যাচাই করে ওয়ালেটে টাকা এড করবে।`
      });
      fireAlert(
        'সাকসেসফুল সাবমিশন!',
        'আপনার জিমেইল আইডিটি সফলভাবে সিকিউরিটি রিভিউর জন্য সাবমিট করা হয়েছে। অনুগ্রহ করে ২-৩ দিন অপেক্ষা করুন।',
        'success'
      );
      setAccountEmail('');
      setAccountPassword('');
      fetchSales();
      onRefreshTrigger();
    } else {
      setMessage({ type: 'error', text: res.error || 'জিমেইল সাবমিট করতে ত্রুটি হয়েছে।' });
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto px-3 font-sans pb-10">
      
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-650 hover:text-gray-900 font-extrabold text-xs mb-4 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl border border-gray-100 transition-all cursor-pointer self-start select-none shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>ড্যাশবোর্ডে ফিরে যান</span>
        </button>
      )}

      {/* Platform Tabs Selection */}
      <div className="flex border-b border-gray-200 mb-4 bg-gray-50 p-1.5 rounded-2xl">
        <button 
          onClick={() => { setActivePlatform('gmail'); setViewHistory(false); }}
          className={`flex-1 py-2 px-3 text-center rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activePlatform === 'gmail' ? 'bg-[#1877F2] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          জিমেইল
        </button>
        <button 
          onClick={() => { setActivePlatform('fb'); setViewHistory(false); }}
          className={`flex-1 py-2 px-3 text-center rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activePlatform === 'fb' ? 'bg-[#1877F2] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          ফেসবুক
        </button>
        <button 
          onClick={() => { setActivePlatform('insta'); setViewHistory(false); }}
          className={`flex-1 py-2 px-3 text-center rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activePlatform === 'insta' ? 'bg-[#1877F2] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          ইনস্টাগ্রাম
        </button>
      </div>

      {/* টপ বাটন */}
      <div className="grid grid-cols-2 gap-[10px] mb-[15px]">
        <a 
          href="https://t.me/superearningbd_Official/2810" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center gap-2 p-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-red-700 hover:no-underline transition duration-200 active:scale-[0.98] select-none"
        >
          <i className="fa-brands fa-youtube text-base"></i> টিউটোরিয়াল
        </a>
        
        <button 
          onClick={() => setViewHistory(!viewHistory)}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-none cursor-pointer transition duration-200 active:scale-[0.98] select-none ${
            viewHistory 
              ? 'bg-blue-50 text-blue-600' 
              : 'bg-[#1877F2] text-white hover:bg-blue-700'
          }`}
        >
          <i className="fa-solid fa-clock-rotate-left"></i> হিস্ট্রি বোর্ড
        </button>
      </div>

      {viewHistory ? (
        /* HISTORY BOARD CONTENT CARD */
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 space-y-4 animate-fade-in text-left">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <button 
              onClick={() => setViewHistory(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent outline-none transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1877F2]">প্রেরিত {getPlatformLabel()} হিস্ট্রি বোর্ড</h2>
              <p className="text-[11px] text-gray-400 font-semibold">নিচে আপনার প্রেরিত সমস্ত {getPlatformLabel()} অ্যাকাউন্টের পেমেন্ট স্ট্যাটাস ট্র্যাক করতে পারেন।</p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="text-center py-8 text-gray-400 space-y-2">
              <Clock className="w-10 h-10 mx-auto text-gray-300 animate-pulse" />
              <p className="text-xs font-semibold">কোনো পূর্ববর্তী {getPlatformLabel()} সাবমিশন এর ডাটা পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {sales.map((sale) => {
                const isApproved = sale.status === 'Approved';
                const isRejected = sale.status === 'Rejected';
                return (
                  <div key={sale.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="font-mono text-gray-800 font-bold block max-w-[200px] sm:max-w-xs overflow-x-auto select-all">{sale.account_email}</span>
                        <span className="text-[10px] text-gray-400 font-bold font-mono">পাসওয়ার্ডঃ {sale.account_password}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                        isApproved ? 'bg-green-100 text-green-700 border border-green-200' :
                        isRejected ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                      }`}>
                        {isApproved ? 'Approved (সফল)' : isRejected ? 'Rejected (বাতিল)' : 'Checking (যাচাইকরণ)'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] border-t border-gray-200/50 pt-2 text-gray-400 font-bold font-mono">
                      <span>৳ {sale.price_bdt.toFixed(2)} BDT</span>
                      <span>
                        {new Date(sale.created_at).toLocaleDateString('bn-BD', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {sale.admin_notes && (
                      <div className="mt-1 bg-white p-2 border border-gray-100 rounded-lg text-[10px] text-gray-500 font-bold italic">
                        🎯 এডমিন ফিডব্যাকঃ {sale.admin_notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button 
            onClick={() => setViewHistory(false)}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-none font-bold text-xs rounded-xl cursor-pointer"
          >
            নতুন {getPlatformLabel()} সাবমিট করুন
          </button>
        </div>
      ) : (
        /* GMAIL FORM SUBMISSION MODULE */
        <div className="space-y-[15px]">
          
          {/* মেইন ইনফো কার্ড */}
          <div className="bg-white rounded-2xl p-5 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <h2 className="text-[#1877F2] m-0 mb-2.5 text-xl font-extrabold">{getPlatformTitle()}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {getPlatformDesc()}
            </p>
            
            <div className="grid grid-cols-2 gap-[10px] my-[15px]">
              <div className="bg-[#f8fbff] p-2.5 rounded-xl border border-[#e7f3ff]">
                <small className="block text-[11px] text-[#65676B] font-semibold">প্রতি {getPlatformLabel()} রেট</small>
                <b className="text-base text-[#1c1e21] font-bold">৳ {priceBdtVal.toFixed(2)}</b>
              </div>
              
              <div className="bg-[#f8fbff] p-2.5 rounded-xl border border-[#e7f3ff]">
                <small className="block text-[11px] text-[#65676B] font-semibold">বাকি লিমিট</small>
                <b className="text-base text-[#1c1e21] font-bold">{remainingLimit} টি</b>
              </div>
            </div>

            <span className="text-[#fa3e3e] font-bold text-[13px] block mb-[15px] text-center">
              রিপোর্ট টাইম: ২-৩ দিন
            </span>

            {/* পাসওয়ার্ড সেকশন */}
            {requiredPass && (
              <div className="bg-[#f0f2f5] p-3.5 rounded-xl border border-dashed border-[#1877F2] text-left">
                <div className="text-[11px] font-bold text-[#65676B]">নির্ধারিত সিকিউরিটি পাসওয়ার্ড কপি করুন:</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[20px] font-extrabold text-[#1c1e21] font-mono select-all bg-white/70 px-2.5 py-0.5 rounded-lg border border-gray-200" id="passVal">
                    {requiredPass}
                  </span>
                  
                  <button 
                    onClick={handleCopyPassword}
                    className={`border-none py-2 px-[18px] rounded-lg font-bold cursor-pointer transition duration-200 shrink-0 text-xs ${
                      copied 
                        ? 'bg-green-600 text-white scale-[1.02]' 
                        : 'bg-[#1877F2] text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submission Feedback Banner */}
          {message && (
            <div className={`p-4 rounded-xl text-xs text-left font-bold border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* সাবমিট ফরম */}
          <div className="bg-white p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <form onSubmit={handleSubmitSale} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-[#4b4d4f] mb-1 text-left">
                  {getPlatformLabel()} এর আইডি/ইউজারনেম/ইমেইল
                </label>
                <input 
                  type="text" 
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder={activePlatform === 'gmail' ? "example@gmail.com" : "ইউজারনেম বা আইডি লিখুন"} 
                  required 
                  className="w-full p-3 mb-1 border border-[#eef2f6] rounded-xl bg-[#f9f9f9] text-sm focus:outline-none focus:border-[#1877F2] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-[#4b4d4f] mb-1 text-left">
                  {getPlatformLabel()} এর পাসওয়ার্ড
                </label>
                <input 
                  type="text" 
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন" 
                  required 
                  className="w-full p-3 mb-1 border border-[#eef2f6] rounded-xl bg-[#f9f9f9] text-sm focus:outline-none focus:border-[#1877F2] transition"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full p-3.5 bg-[#1877F2] text-white border-none rounded-xl text-base font-bold cursor-pointer hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane text-sm"></i>
                    <span>সাবমিট করুন</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}
