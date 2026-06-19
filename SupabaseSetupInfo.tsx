import { useState } from 'react';
import { Award, Check, Sparkles, ShieldCheck, HelpCircle, X } from 'lucide-react';
import { MembershipLevel, Wallet } from '../types';

interface MembershipUpgradeProps {
  currentLevel: MembershipLevel;
  wallet: Wallet | null;
  onUpgrade: (level: MembershipLevel, cost: number) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export default function MembershipUpgrade({ currentLevel, wallet, onUpgrade, onClose }: MembershipUpgradeProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const tiers = [
    {
      level: 'Free' as MembershipLevel,
      title: 'Regular Level (Free)',
      cost: 0,
       multiplier: '1.0x Base',
      colorClass: 'from-gray-500 to-slate-450',
      textColor: 'text-gray-400',
      perks: [
        'Standard micropayment reward rates',
        'Normal 150 BDT withdrawal limits',
        'Traditional settlement clearance (1-2 days)'
      ]
    },
    {
      level: 'Silver' as MembershipLevel,
      title: 'Silver VIP',
      cost: 150,
      multiplier: '1.2x Boosted',
      colorClass: 'from-blue-600 to-teal-400',
      textColor: 'text-blue-400',
      perks: [
        '1.2x multiplication on ALL microjobs',
        'Priority withdraw authorizations',
        'VIP checkmark next to your username',
        'Exclusive Silver-only high payment rewards'
      ]
    },
    {
      level: 'Gold' as MembershipLevel,
      title: 'Gold Super VIP',
      cost: 350,
      multiplier: '1.5x Premium',
      colorClass: 'from-amber-500 to-yellow-300',
      textColor: 'text-amber-400',
      perks: [
        '1.5x payout boost on ALL active tasks',
        'Ultra-fast payout clearances',
        'Dedicated Gold VIP client support line',
        'Early release tasks access privilege'
      ]
    },
    {
      level: 'Platinum' as MembershipLevel,
      title: 'Platinum Elite Kingpin',
      cost: 650,
      multiplier: '2.0x Double',
      colorClass: 'from-purple-600 to-pink-500',
      textColor: 'text-purple-400',
      perks: [
        '2.0x DOUBLE rewards on ALL automated tasks',
        'Instantaneous automated transaction payouts',
        'Full Platinum Elite custom discord roles',
        'Automated daily loyalty bonus credits'
      ]
    }
  ];

  const handlePurchase = async (level: MembershipLevel, cost: number) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (level === currentLevel) {
       setErrorMsg('You already hold this membership status tier.');
       return;
    }

    if (wallet && Number(wallet.balance_bdt) < cost) {
       setErrorMsg(`Inadequate wallet balance. Purchasing this upgrade plan requires ৳ ${cost.toFixed(2)} BDT. Complete more tasks or deposit funds to continue.`);
       return;
    }

    const confirmAction = window.confirm(`Confirm premium upgrade to "${level} VIP" for ৳ ${cost} BDT Taka? The cost will be deducted from your Active Wallet balance.`);
    if (!confirmAction) return;

    setLoading(true);
    const res = await onUpgrade(level, cost);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Congratulations! Your account tier is upgraded to ${level} VIP status. Enjoy high payouts!`);
    } else {
      setErrorMsg(res.error || 'VIP Upgrade process failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Absolute Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-400 animate-pulse" /> Easy Earning VIP Perks <Sparkles className="text-yellow-450" />
          </h2>
          <p className="text-gray-400 text-xs mt-1">Upgrade your membership to unlock rewards multipliers up to 2.0x Taka payouts!</p>
        </div>

        {/* Status notification row */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs text-center flex items-center justify-center gap-1.5 font-sans font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> {successMsg}
          </div>
        )}

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {tiers.map((tier) => {
            const isCurrent = currentLevel === tier.level;
            const isFree = tier.level === 'Free';
            
            return (
              <div 
                key={tier.level}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 relative ${
                  isCurrent 
                    ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/60 border-cyan-400 shadow-lg shadow-cyan-500/5' 
                    : 'bg-black/30 border-white/5 hover:border-white/10 hover:bg-black/40'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 bg-cyan-400 text-slate-950 font-bold font-sans text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    CURRENT PLAN
                  </span>
                )}

                <div>
                  <span className={`text-[11px] font-mono font-bold tracking-wider uppercase block ${tier.textColor}`}>
                    {tier.level} TIER
                  </span>
                  
                  <h3 className="text-white text-lg font-bold mt-1 leading-snug">{tier.title}</h3>
                  
                  <div className="mt-3 mb-4">
                    <span className="text-2xl font-mono font-bold text-white">৳ {tier.cost}</span>
                    {!isFree && <span className="text-[10px] text-gray-400 font-mono block mt-0.5">One-time payment</span>}
                    {isFree && <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Free Default Status</span>}
                  </div>

                  <div className="py-1.5 px-2.5 bg-white/5 border border-white/5 rounded-lg text-center mb-5">
                    <span className="text-[11px] font-mono text-cyan-400">
                      Multiplier: <strong>{tier.multiplier}</strong>
                    </span>
                  </div>

                  {/* Perk lines */}
                  <ul className="space-y-2 mb-6">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="flex gap-1.5 items-start text-[11px] text-gray-300 leading-snug">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Button */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2 px-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl text-xs font-semibold text-center font-mono cursor-not-allowed"
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handlePurchase(tier.level, tier.cost)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      isFree 
                        ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300' 
                        : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold shadow shadow-yellow-500/10'
                    }`}
                  >
                    {loading ? 'Processing...' : isFree ? 'Downgrade (Free)' : `Upgrade for ৳${tier.cost}`}
                  </button>
                )}

              </div>
            );
          })}
        </div>

        {/* Footer info lock */}
        <div className="flex gap-2.5 items-start mt-6 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl">
          <HelpCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-yellow-300 leading-normal">
            <strong>Purchase terms:</strong> Payment requires available funds directly inside your Active Wallet. Upon approval, upgraded modifiers automatically multiply rewards on all future automated microjobs. Purchases are final and non-refundable.
          </p>
        </div>

      </div>
    </div>
  );
}
