import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Users, CreditCard, Sparkles, Copy, Check, Info, Coins, Smartphone, ArrowDownRight, RefreshCw } from 'lucide-react';
import { User, Wallet, MfsProvider, VerificationRequest } from '../types';
import { apiService, COMMISSION_AMOUNTS } from '../lib/db';

interface VerificationAndAffiliateProps {
  user: User;
  wallet: Wallet | null;
  onVerificationSuccess: (updatedUser: User, updatedWallet?: Wallet) => void;
}

export default function VerificationAndAffiliate({
  user,
  wallet,
  onVerificationSuccess
}: VerificationAndAffiliateProps) {
  // Payment states
  const [payMethod, setPayMethod] = useState<'wallet' | 'mfs'>('mfs');
  const [selectedProvider, setSelectedProvider] = useState<MfsProvider>('bKash');
  const [mfsNumber, setMfsNumber] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);

  const loadRequests = async () => {
    try {
      const data = await apiService.getVerificationRequestsByUser(user.id);
      setVerificationRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRequests();

    const handleUpdate = () => {
      loadRequests();
    };

    window.addEventListener('eebd_verification_requests_updated', handleUpdate);
    return () => {
      window.removeEventListener('eebd_verification_requests_updated', handleUpdate);
    };
  }, [user.id]);

  const copyReferralCode = () => {
    try {
      const inviteLink = `${window.location.origin}/?ref=${user.referral_code}`;
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletVerification = async () => {
    setStatusMsg(null);
    if (!wallet || Number(wallet.balance_bdt) < 100) {
      setStatusMsg({ type: 'error', text: 'Inadequate wallet balance. Please complete more microtasks or use Mobile Money.' });
      return;
    }

    setLoading(true);
    const res = await apiService.payVerificationFee(user.id, true);
    setLoading(false);

    if (res.success && res.user) {
      setStatusMsg({ type: 'success', text: 'Merchant verification paid! Account verified instantly. Tap sync if wallet balance needs refresh.' });
      onVerificationSuccess(res.user, res.wallet);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Verification transaction rejected.' });
    }
  };

  const handleMfsVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Bangladeshi phone validations
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(mfsNumber)) {
      setStatusMsg({ type: 'error', text: 'Please input a valid Bangladeshi mobile account number.' });
      return;
    }

    if (!trxId || trxId.length < 6) {
      setStatusMsg({ type: 'error', text: 'Invalid Transaction ID. Send money first and input your 8-character bKash/Nagad TrxID.' });
      return;
    }

    setLoading(true);
    const res = await apiService.submitVerificationRequest(
      user.id,
      user.username,
      user.phone,
      selectedProvider,
      mfsNumber,
      trxId,
      100
    );
    setLoading(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `আপনার ভেরিফিকেশন আবেদনটি (৳১০০ BDT) সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন শীঘ্রই আপনার ট্রানজেকশন ID (${trxId}) রিভিও করে একাউন্ট এক্টিভেট করে দিবে।`
      });
      setMfsNumber('');
      setTrxId('');
      loadRequests();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'আবেদন জমা দিতে কোনো সমস্যা হয়েছে।' });
    }
  };

  return (
    <div id="verification-affiliate-section" className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl mb-8 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />

      {/* Header section with badge status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Referrals & Account Lock</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">10-Generation Affiliate commission network matrix</p>
          </div>
        </div>

        {user.is_verified ? (
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono text-xs font-bold leading-none uppercase">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Verified Premium Partner
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/25 font-mono text-xs font-bold leading-none uppercase animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            Verification Required (৳100 BDT)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Dynamic action panel based on whether user is verified */}
        <div className="lg:col-span-7 space-y-6">
          {!user.is_verified ? (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/15 rounded-xl p-4 text-xs text-gray-300 leading-relaxed flex gap-3">
                <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-white font-bold block">Why do I need verified status?</span>
                  <span>New accounts are locked from claiming active microjobs and transferring earnings to protect our platform from fake bot registration farms. Verifying for just ৳100 BDT instantly unlocks:</span>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-400">
                    <li>Unlimited microjob video and website visit tasks</li>
                    <li>Full access to buy/sell verification accounts in the Marketplace</li>
                    <li>Passive commissions up to 10 generations deep instantly</li>
                  </ul>
                </div>
              </div>

              {/* Verified Paywall Panel */}
              <div className="bg-black/40 rounded-xl p-5 border border-white/5 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" /> Choose Activation Pathway
                </h3>

                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setPayMethod('mfs')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${payMethod === 'mfs' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    Mobile Phone Money Check
                  </button>
                  <button
                    onClick={() => setPayMethod('wallet')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${payMethod === 'wallet' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    Wallet Balance (৳100 BDT)
                  </button>
                </div>

                {payMethod === 'wallet' ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-gray-400">YOUR WALLET BALANCE:</span>
                      <span className={`font-bold ${Number(wallet?.balance_bdt || 0) >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ৳ {wallet?.balance_bdt ? Number(wallet.balance_bdt).toFixed(2) : '0.00'} BDT
                      </span>
                    </div>

                    <button
                      onClick={handleWalletVerification}
                      disabled={loading || Number(wallet?.balance_bdt || 0) < 100}
                      className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                      <span>Activate Instantly using Wallet (৳100 BDT)</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMfsVerification} className="space-y-4 pt-1">
                    {/* Instructions for MFS merchant transfer */}
                    <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/15 rounded-xl text-xs space-y-1.5 leading-relaxed">
                      <p className="text-cyan-400 font-bold text-[11px] uppercase font-mono tracking-wide">MFS MERCHANT TRANSFER GUIDELINE:</p>
                      <p className="text-gray-300">
                        Please send exactly <span className="text-white font-bold">৳ 100.00 Taka</span> using "Send Money" (সেন্ড মানি) or "Cash Out" (ক্যাশ আউট) to our verified number:
                      </p>
                      <div className="flex flex-col gap-1 items-stretch text-yellow-400 font-mono text-sm bg-black/40 px-3 py-2 rounded border border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <span>bKash Personal No:</span>
                          <span className="text-white select-all font-bold text-sm">017410873592</span>
                        </div>
                        <div className="text-[10px] text-gray-400 italic text-left mt-1 border-t border-white/5 pt-1">
                          * আপনি বিকাশ, নগদ বা রকেট যেকোনো মাধ্যমে এই নম্বরে টাকা পাঠাতে পারবেন।
                        </div>
                      </div>
                      <p className="text-rose-400 text-[10.5px] font-semibold mt-1">
                        ⚠️ সতর্কর্তা: টাকা না পাঠিয়ে অথবা অবাস্তব/ভুল/ফেইক TrxID দিলে আপনার আইডি আজীবনের জন্য ব্যান (Lock/Suspended) করা হতে পারে।
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(['bKash', 'Nagad', 'Rocket'] as MfsProvider[]).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setSelectedProvider(prov)}
                          className={`py-2 px-2 border rounded-xl font-mono text-xs font-semibold text-center transition-all ${selectedProvider === prov ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'}`}
                        >
                          {prov}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wild text-left block">Your Sender Mobile No (যে নম্বর হতে পাঠিয়েছেন)</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[11px] font-mono text-gray-400">+88</span>
                          <input
                            type="tel"
                            placeholder="01712345678"
                            value={mfsNumber}
                            onChange={(e) => setMfsNumber(e.target.value)}
                            required
                            className="w-full pl-11 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wild text-left block">Transaction ID (TxID)</label>
                        <input
                          type="text"
                          placeholder="e.g. AM99KJS8A"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-cyan-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>আবেদন সাবমিট হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit Verification Request (৳ 100 BDT)</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Verification Requests List */}
                {verificationRequests.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider text-left">Your Verification Activity History</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar-y">
                      {verificationRequests.map((req) => (
                        <div key={req.id} className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs flex justify-between items-center gap-3">
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white font-mono bg-cyan-900/40 text-cyan-400 px-1.5 py-0.5 rounded text-[10px] uppercase border border-cyan-500/10">{req.mfs_provider}</span>
                              <span className="text-gray-400 font-mono text-[11px] font-bold">{req.sender_number}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              TxID: <span className="text-yellow-400 font-bold uppercase select-all bg-black/25 px-1 py-0.2 rounded">{req.trx_id}</span>
                            </div>
                            {req.admin_notes && (
                              <div className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/10 p-2 rounded mt-1.5 leading-relaxed font-sans shadow-inner">
                                <strong>প্রত্যাখ্যানের কারণ:</strong> <span className="italic">{req.admin_notes}</span>
                              </div>
                            )}
                          </div>
                          <div className="shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider border leading-none ${
                              req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              req.status === 'Processing' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse' :
                              req.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Verification is true: view referral code and tracking stats
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-xs text-gray-300 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-white font-bold block text-sm">You are an Verified Partner!</span>
                    <span>Your account holds premium priority clearance. Distribute your invitation link below to instantly capture passive commissions as referrals verify.</span>
                  </div>
                </div>
              </div>

              {/* Referral links display box */}
              <div className="bg-black/40 rounded-xl p-5 border border-white/5 space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-gray-400 tracking-wider font-semibold block mb-2 uppercase">Your Invitation Link (Affiliate Loop)</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-mono text-cyan-400 select-all tracking-tight break-all overflow-hidden whitespace-nowrap">
                      {window.location.origin}/?ref={user.referral_code}
                    </div>
                    <button
                      onClick={copyReferralCode}
                      className="p-3 bg-cyan-500 text-slate-950 rounded-xl shadow hover:bg-cyan-400 transition-all cursor-pointer flex items-center justify-center"
                      title="Copy Link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Your Invite Code</span>
                    <span className="text-sm font-mono font-bold text-white tracking-widest">{user.referral_code}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Active Commission levels</span>
                    <span className="text-sm font-sans font-bold text-emerald-400">10 Generations Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {statusMsg && (
            <div className={`p-4 rounded-xl text-xs flex gap-2 border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Right Side: Detailed 10-Generation Affiliate Matrix structure */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-xl border border-white/5">
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-cyan-400" /> Commission Matrix
            </h3>
            
            <p className="text-[11px] text-gray-400 leading-normal mb-4">
              When any user under your referral hierarchy verifies their profile for ৳100 BDT, rewards split up 10 levels deep as follows:
            </p>

            <div className="space-y-1.5 font-mono text-xs max-h-72 overflow-y-auto pr-1 no-scrollbar-y">
              {Object.entries(COMMISSION_AMOUNTS).map(([lvl, commission]) => {
                const isLvl1 = lvl === '1';
                return (
                  <div
                    key={lvl}
                    className={`flex justify-between items-center py-2 px-3.5 rounded-lg border text-xs ${isLvl1 ? 'bg-cyan-500/10 border-cyan-500/30 font-bold' : 'bg-black/20 border-white/5'}`}
                  >
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <span className={`w-2 h-2 rounded-full ${isLvl1 ? 'bg-cyan-400 animate-ping' : 'bg-gray-600'}`} />
                      Gen Level {lvl} {isLvl1 && <span className="text-[10px] text-cyan-400 font-sans italic tracking-normal">(Direct Referrer)</span>}
                    </span>
                    <span className={isLvl1 ? 'text-cyan-400 font-bold' : 'text-emerald-400'}>
                      ৳ {commission.toFixed(2)} BDT
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-[9.5px] text-gray-500 leading-normal font-mono">
              *Total payout distribution: ৳65.00 Taka automatically parsed. Rest is allocated for secure platform hosting, mobile banking tariffs, and automated microtasks seed rewards.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
