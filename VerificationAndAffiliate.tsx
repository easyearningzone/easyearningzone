import React, { useState } from 'react';
import { Wallet as WalletType, Withdrawal, MfsProvider } from '../types';

interface CashoutEngineProps {
  wallet: WalletType | null;
  withdrawals: Withdrawal[];
  onRequestWithdraw: (amount: number, provider: MfsProvider, number: string) => Promise<{ success: boolean; error?: string }>;
}

export default function CashoutEngine({ wallet, withdrawals, onRequestWithdraw }: CashoutEngineProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<MfsProvider>('bKash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const MIN_WITHDRAWAL_BDT = 150;

  // Retrieve SweetAlert helper safely from outer window injection
  const fireAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') => {
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire({
        title,
        text,
        icon,
        background: '#0c0214',
        color: '#fce7f3',
        confirmButtonColor: '#C71585',
        customClass: {
          popup: 'rounded-3xl border border-pink-500/30'
        }
      });
    } else {
      alert(`${title}\n${text}`);
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      fireAlert('ঐতিহাসিক ত্রুটি!', 'আপনার ওয়ালেট ব্যালেন্স ডাটা লোড হতে পারেনি। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', 'error');
      return;
    }

    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      fireAlert('ভুল পরিমাণ!', 'দয়া করে একটি সঠিক উইথড্রয়াল পরিমাণ টাকা বাংলায় বা ইংরেজিতে লিখুন।', 'warning');
      return;
    }

    if (numAmt < MIN_WITHDRAWAL_BDT) {
      fireAlert('ন্যূনতম সীমা!', `আমাদের প্ল্যাটফর্মে সর্বনিম্ন ক্যাশআউট সীমা হলো ৳ ${MIN_WITHDRAWAL_BDT} টাকা।`, 'warning');
      return;
    }

    if (numAmt > Number(wallet.balance_bdt)) {
      fireAlert('অপর্যাপ্ত ব্যালেন্স!', `দুঃখিত! আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। বর্তমান ব্যালেন্স: ৳ ${Number(wallet.balance_bdt).toFixed(2)} টাকা। আরও বেশি টাস্ক কমপ্লিট করুন।`, 'error');
      return;
    }

    // Checking 11-digit mobile standard
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(accountNumber)) {
      fireAlert('ভুল মোবাইল নম্বর!', 'দয়া করে একটি সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর (যেমন: 017xxxxxxxx) প্রদান করুন।', 'warning');
      return;
    }

    // Request Confirm via SweetAlert first
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire({
        title: 'ক্যাশআউট নিশ্চিত করুন!',
        text: `আপনি কি নিশ্চিত যে আপনি ৳ ${numAmt.toFixed(2)} টাকা আপনার ${selectedProvider} নম্বর (${accountNumber})-এ উইথড্র করতে চান?`,
        icon: 'question',
        showCancelButton: true,
        background: '#0c0214',
        color: '#fce7f3',
        confirmButtonColor: '#C71585',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'হ্যাঁ, নিশ্চিত করুন',
        cancelButtonText: 'বাতিল',
        customClass: {
          popup: 'rounded-3xl border border-pink-500/30'
        }
      }).then(async (result: any) => {
        if (result.isConfirmed) {
          await processWithdrawRequest(numAmt);
        }
      });
    } else {
      // Fallback
      if (window.confirm(`আপনি কি ৳ ${numAmt} টাকা উইথড্র করতে চান?`)) {
        await processWithdrawRequest(numAmt);
      }
    }
  };

  const processWithdrawRequest = async (numAmt: number) => {
    setLoading(true);
    const res = await onRequestWithdraw(numAmt, selectedProvider, accountNumber);
    setLoading(false);

    if (res.success) {
      fireAlert(
        'ক্যাশআউট রিকোয়েস্ট সফল!',
        `আপনার ৳ ${numAmt.toFixed(2)} টাকার ক্যাশআউট রিকোয়েস্ট অ্যাডমিন প্যানেলে পাঠানো হয়েছে। আগামী ৫-১০ মিনিটের মধ্যে পেমেন্ট সম্পন্ন হবে।`,
        'success'
      );
      setAmount('');
      setAccountNumber('');
    } else {
      fireAlert('রিকোয়েস্ট ব্যর্থ!', res.error || 'সিস্টেম মেইনটেন্যান্সের কারণে ক্যাশআউট সাময়িক বন্ধ আছে।', 'error');
    }
  };

  const providerConfigs = {
    bKash: {
      brandName: 'bKash (বিকাশ)',
      bgClass: 'bg-pink-600 hover:bg-pink-500',
      activeBorder: 'border-pink-500 ring-4 ring-pink-500/30',
      color: '#e2125f',
      logoChar: 'ব',
      icon: 'fa-mobile-screen-button'
    },
    Nagad: {
      brandName: 'Nagad (নগদ)',
      bgClass: 'bg-orange-600 hover:bg-orange-500',
      activeBorder: 'border-orange-500 ring-4 ring-orange-500/30',
      color: '#f6291a',
      logoChar: 'ন',
      icon: 'fa-wallet'
    },
    Rocket: {
      brandName: 'Rocket (রকেট)',
      bgClass: 'bg-indigo-600 hover:bg-indigo-500',
      activeBorder: 'border-indigo-500 ring-4 ring-indigo-500/30',
      color: '#8c248b',
      logoChar: 'র',
      icon: 'fa-building-columns'
    }
  };

  return (
    <div id="cashout-engine-container" className="bg-[#120524]/80 backdrop-blur-md rounded-3xl p-6 border border-pink-500/15 shadow-2xl mb-8 relative overflow-hidden">
      {/* Decorative gradient glowing orb */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title block */}
      <div className="flex items-center gap-4 mb-6 border-b border-pink-500/10 pb-4">
        <div className="w-12 h-12 bg-gradient-premium rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
          <i className="fa-solid fa-wallet text-xl animate-bounce" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-gradient-premium">মোবাইল ব্যাংকিং উইথড্রয়াল (Wallet)</span>
          </h2>
          <p className="text-pink-200/60 text-xs mt-0.5">সহজ ও দ্রুত উপায়ে সরাসরি বিকাশ, নগদ বা রকেটে পেমেন্ট বুঝে নিন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Withdraw forms */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmitWithdrawal} className="space-y-5">
            
            {/* Step 1 */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-mono font-bold tracking-wider text-pink-300 flex items-center gap-1">
                <i className="fa-solid fa-circle-check text-[10px] text-pink-500" />
                ধাপ ১: পেমেন্ট মেথড সিলেক্ট করুন (MFS)
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(providerConfigs) as MfsProvider[]).map(provider => {
                  const conf = providerConfigs[provider];
                  const isActive = selectedProvider === provider;

                  return (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setSelectedProvider(provider)}
                      className={`relative py-4 px-2 rounded-2xl bg-black/40 border text-center transition-all flex flex-col items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer ${
                        isActive 
                          ? conf.activeBorder + ' bg-pink-500/5'
                          : 'border-white/5 hover:border-pink-500/15'
                      }`}
                    >
                      {/* Round icon logo container */}
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md transition-transform scale-105"
                        style={{ backgroundColor: conf.color }}
                      >
                        {conf.logoChar}
                      </span>
                      <span className="text-[11px] text-pink-100 font-semibold">{conf.brandName.split(' ')[0]}</span>
                      
                      {isActive && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 & 3 Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-pink-300 flex items-center gap-1">
                  <i className="fa-solid fa-bangladeshi-taka-sign text-[9px]" />
                  ধাপ ২: উইথড্র পরিমাণ (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-pink-400 font-bold font-sans text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    placeholder="যেমনঃ ২০০"
                    min={MIN_WITHDRAWAL_BDT}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-black/50 border border-pink-500/10 rounded-2xl text-white placeholder-pink-200/20 focus:outline-none focus:ring-1 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-sm font-sans"
                    required
                  />
                </div>
                <span className="text-[10px] text-pink-300/40 block">সর্বনিম্ন উইথড্র সীমা: ৳ {MIN_WITHDRAWAL_BDT} টাকা</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-pink-300 flex items-center gap-1">
                  <i className="fa-solid fa-mobile-screen" />
                  ধাপ ৩: মোবাইল নম্বর (১১ ডিজিট)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <i className="fa-solid fa-phone text-xs text-pink-400" />
                  </span>
                  <input
                    type="tel"
                    placeholder="যেমনঃ 017xxxxxxxx"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-black/50 border border-pink-500/10 rounded-2xl text-white placeholder-pink-200/20 focus:outline-none focus:ring-1 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-sm font-sans"
                    required
                  />
                </div>
                <span className="text-[10px] text-pink-300/40 block">১১ ডিজিটের পার্সোনাল নম্বর দিন</span>
              </div>

            </div>

            {/* Presets shortcut pills */}
            <div className="flex gap-2 items-center flex-wrap pt-1">
              <span className="text-[10px] font-bold text-pink-300/60 mr-1 flex items-center gap-1">
                <i className="fa-solid fa-wand-magic-sparkles text-[9px]" /> শর্টকাট এমাউন্ট:
              </span>
              {[150, 250, 500, 1000, 2000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-3.5 py-1.5 bg-pink-500/5 hover:bg-pink-500/15 border border-pink-500/10 hover:border-pink-500/30 rounded-xl text-xs text-pink-200 transition-all cursor-pointer"
                >
                  ৳ {val}
                </button>
              ))}
            </div>

            {/* Submission button with gradient overlay */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-premium hover:opacity-90 text-white font-bold text-sm rounded-2xl shadow-xl shadow-pink-500/10 flex justify-center items-center gap-2 hover:-translate-y-0.5 transition-all text-center cursor-pointer select-none"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <span>নিরাপদ উইথড্রয়াল রিকোয়েস্ট পাঠান via {selectedProvider}</span>
                  <i className="fa-solid fa-shield-halved text-sm" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right column: Instructions & guidelines */}
        <div className="lg:col-span-5 bg-black/40 border border-pink-500/10 rounded-3xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-white text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 border-b border-pink-500/10 pb-3">
              <i className="fa-solid fa-circle-info text-pink-400" /> ক্যাশআউট নিয়ম ও শর্তাবলী
            </h3>
            
            <ul className="space-y-3.5 text-xs text-pink-100/70 leading-relaxed">
              <li className="flex gap-2.5">
                <span className="text-pink-500 font-bold font-sans"><i className="fa-solid fa-circle-check" /></span>
                <span><strong className="text-white">১০০% ফ্রি প্রসেসিং:</strong> আমাদের এখানে কোনো প্রকার ট্যাক্স বা চার্জ কাটা হয় না। আপনার উইথড্রকৃত সঠিক এমাউন্টই আপনার নম্বরে পাঠানো হবে।</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-pink-500 font-bold font-sans"><i className="fa-solid fa-circle-check" /></span>
                <span><strong className="text-white">ফাস্ট পেমেন্ট গ্যারান্টি:</strong> রিকোয়েস্ট সাবমিট করার পর আমাদের অটোমেটেড পেমেন্ট রোবট ৫-১০ মিনিটের মধ্যে আপনার বিকাশ বা নগদ নম্বরে পেমেন্ট নিশ্চিত করবে।</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-pink-500 font-bold font-sans"><i className="fa-solid fa-circle-check" /></span>
                <span><strong className="text-white">সিমুলেশন মোড:</strong> টেস্ট করার জন্য কোনো আসল ব্যালেন্স খরচ হবে না। ডেমো স্টেটে উইথড্রয়াল করার ১৫ সেকেন্ডের মধ্যেই পেন্ডিং উইথড্রয়ালগুলো গ্রাহকের ওয়ালেটে অটোমেটিক অ্যাপ্রুভ হয়ে যাবে।</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-pink-500/10 bg-gradient-premium/5 p-4 rounded-2xl border border-pink-500/10">
            <div className="flex gap-3 items-start">
              <i className="fa-solid fa-gift text-pink-400 text-sm mt-0.5 animate-pulse" />
              <div className="text-[10.5px] text-pink-200/80 leading-snug">
                <strong>ভিআইপি মেম্বারশিপ ট্রিগার:</strong> আপনি কি গোল্ড বা প্ল্যাটিনাম মেম্বার? প্রতিটি ভিআইপি ব্যবহারকারী উইথড্রয়ালের ক্ষেত্রে ১ নম্বর প্রায়োরিটি পাবেন এবং ৫ সেকেন্ডে ক্যাশআউট পাবেন!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded dynamic display list of historic withdrawals for this session */}
      {withdrawals.length > 0 && (
        <div className="mt-8 border-t border-pink-500/10 pt-6">
          <h3 className="text-xs font-mono font-bold text-pink-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <i className="fa-solid fa-clock-rotate-left text-xs" /> সাম্প্রতিক উইথড্রয়াল হিস্ট্রি
          </h3>
          
          <div className="overflow-x-auto no-scrollbar rounded-2xl border border-pink-500/5 bg-black/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pink-500/10 text-pink-300/60 font-mono text-[10px]">
                  <th className="p-3 pl-4">পেমেন্ট মেথড</th>
                  <th className="p-3">মোবাইল নম্বর</th>
                  <th className="p-3">পরিমাণ</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3 pr-4 text-right">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-500/5 text-pink-100/90">
                {withdrawals.slice(0, 5).map((w) => {
                  const isApproved = w.status === 'Approved';
                  const isRejected = w.status === 'Rejected';
                  
                  return (
                    <tr key={w.id} className="hover:bg-pink-500/5 transition-all">
                      <td className="p-3 pl-4 flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              w.mfs_provider === 'bKash' ? '#e2125f' :
                              w.mfs_provider === 'Nagad' ? '#f6291a' : '#8c248b'
                          }}
                        />
                        <span className="font-semibold">{w.mfs_provider}</span>
                      </td>
                      <td className="p-3 font-mono">{w.account_number}</td>
                      <td className="p-3 font-semibold text-rose-300">৳{Number(w.amount_bdt).toFixed(2)}</td>
                      <td className="p-3 text-pink-200/40 text-[10px] font-mono">
                        {new Date(w.created_at).toLocaleDateString('bn-BD', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-[10px] font-bold uppercase leading-none ${
                          isApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          isRejected ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {isApproved ? 'Approved (সফল)' : isRejected ? 'Rejected' : 'Pending (অপেক্ষমান)'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
