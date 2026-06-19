import { useState } from 'react';
import { Wallet, Award, TrendingUp, CheckCircle, ArrowUpRight, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import { User, Wallet as WalletType } from '../types';

interface DashboardStatsProps {
  user: User;
  wallet: WalletType | null;
  completedCount: number;
  onLogout: () => void;
  onOpenUpgrade: () => void;
  onOpenDeveloperSetup: () => void;
}

export default function DashboardStats({
  user,
  wallet,
  completedCount,
  onLogout,
  onOpenUpgrade,
  onOpenDeveloperSetup
}: DashboardStatsProps) {
  const currentLevel = user.membership_level || 'Free';

  // Config colors for membership levels
  const levelConfigs = {
    Free: {
      color: 'from-gray-500 to-slate-400',
      label: 'Regular Level (Free)',
      iconClass: 'text-gray-400',
      multiplier: '1.0x Base Payout'
    },
    Silver: {
      color: 'from-blue-600 to-teal-400',
      label: 'Silver VIP',
      iconClass: 'text-blue-400',
      multiplier: '1.2x Boosted Payout'
    },
    Gold: {
      color: 'from-amber-500 to-yellow-300',
      label: 'Gold Super VIP',
      iconClass: 'text-amber-400',
      multiplier: '1.5x Premium Boost'
    },
    Platinum: {
      color: 'from-purple-600 to-pink-500',
      label: 'Platinum Elite Kingpin',
      iconClass: 'text-purple-400',
      multiplier: '2.0x Double Ultimate'
    }
  };

  const config = levelConfigs[currentLevel] || levelConfigs.Free;

  return (
    <div id="stats-panel-container" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Profile summary card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {(() => {
                const avatar = user.avatar_url || '';
                if (avatar.startsWith('http')) {
                  return (
                    <img
                      src={avatar}
                      className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-200"
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                    />
                  );
                }
                const presets: Record<string, { gradient: string; char: string }> = {
                  hustler: { gradient: 'from-blue-500 to-indigo-600', char: '👤' },
                  earner: { gradient: 'from-green-400 to-emerald-600', char: '💸' },
                  verified: { gradient: 'from-emerald-400 to-teal-600', char: '✔' },
                  king: { gradient: 'from-amber-500 to-orange-500', char: '👑' },
                  guardian: { gradient: 'from-indigo-500 to-purple-600', char: '🛡' },
                  spark: { gradient: 'from-pink-500 to-rose-600', char: '✨' },
                };
                const configPre = presets[avatar] || { gradient: 'from-blue-500 to-emerald-500', char: user.username ? user.username.charAt(0).toUpperCase() : 'U' };
                return (
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${configPre.gradient} flex items-center justify-center font-bold text-white shadow-sm text-lg`}>
                    {configPre.char}
                  </div>
                );
              })()}
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-gray-900 text-base font-bold leading-tight truncate max-w-[150px]" title={user.full_name || user.username}>{user.full_name || user.username || 'Valued User'}</h3>
                  {user.is_verified && (
                    <span className="bg-green-100 text-green-700 p-0.5 rounded-full" title="Verified Account">
                      <CheckCircle className="w-4 h-4 fill-green-600 text-white shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs font-mono mt-0.5">ID: {user.id.substring(0, 10)}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 hover:text-red-700 transition-all font-sans text-xs flex items-center gap-1 cursor-pointer border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>লগ-আউট</span>
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-gray-500 font-medium">ইউজার ইমেইল (Email):</span>
              <span className="text-gray-800 font-semibold truncate max-w-[180px]">{user.email}</span>
            </div>
            <div className="flex justify-between text-xs font-sans">
              <span className="text-gray-500 font-medium">মোবাইল নম্বর (Phone):</span>
              <span className="text-blue-600 font-bold font-mono">+88 {user.phone}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
          <span className="w-full text-center text-[11px] font-sans text-gray-500 py-1 bg-gray-50 rounded-lg border border-gray-100">
            Developer Emon Verified Companion
          </span>
        </div>
      </div>

      {/* Wallet balance view */}
      <div className="bg-gradient-to-r from-[#1877F2] to-[#0052D4] rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between text-white">
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
        
        <div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold tracking-wider text-blue-100 uppercase">আমার একটিভ ওয়ালেট ব্যালেন্স</span>
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Wallet className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>

          <div className="mt-1">
            <span className="text-4xl font-mono font-black text-white tracking-tight">
              ৳ {wallet?.balance_bdt ? Number(wallet.balance_bdt).toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-green-300 font-black ml-2 uppercase tracking-wide">BDT</span>
          </div>

          <p className="text-blue-100 text-xs mt-1 font-medium">
            সর্বনিম্ন উত্তোলন সীমা মাত্রঃ <span className="text-white font-mono font-bold bg-white/15 px-1.5 py-0.5 rounded">৳ ১৫০ BDT</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
          <div>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">মোট আয় (Total Earned)</p>
            <p className="text-base font-mono font-extrabold text-green-300">
              ৳ {wallet?.total_earned_bdt ? Number(wallet.total_earned_bdt).toFixed(2) : '0.00'}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">মোট উত্তোলন (Withdrawn)</p>
            <p className="text-base font-mono font-extrabold text-yellow-300">
              ৳ {wallet?.total_withdrawn_bdt ? Number(wallet.total_withdrawn_bdt).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Membership VIP tier card */}
      <div className={`bg-gradient-to-br ${config.color} p-0.5 rounded-2xl shadow-sm flex flex-col justify-between`}>
        <div className="bg-white rounded-[15px] p-6 h-full flex flex-col justify-between border border-gray-100">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">একাউন্ট মেম্বারশিপ লেভেল</span>
              <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <Award className={`w-5 h-5 ${config.iconClass}`} />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <h2 className="text-2xl font-sans font-extrabold text-gray-900">{config.label === 'Regular Level (Free)' ? 'ফ্রি অ্যাকাউন্ট (Free)' : config.label}</h2>
              {currentLevel !== 'Free' && (
                <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" style={{ animationDuration: '6s' }} />
              )}
            </div>

            <p className="text-gray-600 text-xs mt-1">
              কাজের বোনাস গুণকঃ <span className="text-blue-600 font-extrabold bg-[#E7F3FF] px-1.5 py-0.5 rounded">{config.multiplier}</span>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-sans text-gray-500 font-bold">কাজ সম্পন্ন করেছেন: <span className="text-black font-extrabold bg-gray-100 px-1.5 py-0.5 rounded">{completedCount} টি কাজ</span></span>
            
            <button
              onClick={onOpenUpgrade}
              className="py-1.5 px-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black font-sans text-xs rounded-xl transition-all transform active:translate-y-0 flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>ভিআইপি আপগ্রেড</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
