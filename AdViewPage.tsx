import { ArrowUpRight, ArrowDownRight, Award, RefreshCw, Layers } from 'lucide-react';
import { Transaction, Withdrawal } from '../types';

interface TransactionLedgerProps {
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  onRefresh: () => void;
}

export default function TransactionLedger({ transactions, withdrawals, onRefresh }: TransactionLedgerProps) {
  
  // Format standard timestamps
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Active';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  // Maps custom transaction icon configs
  const getTxStyle = (type: string) => {
    switch (type) {
      case 'Reward':
        return {
          icon: <ArrowUpRight className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          sign: '+৳',
          classAmt: 'text-emerald-400'
        };
      case 'Withdrawal_Pending':
        return {
          icon: <ArrowDownRight className="w-4 h-4 text-yellow-400 animate-pulse" />,
          bg: 'bg-yellow-500/10 border-yellow-500/20',
          sign: '-৳',
          classAmt: 'text-yellow-400'
        };
      case 'Withdrawal_Approved':
        return {
          icon: <ArrowDownRight className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-500/15 border-emerald-500/30',
          sign: '-৳',
          classAmt: 'text-emerald-400'
        };
      case 'Withdrawal_Rejected':
        return {
          icon: <RefreshCw className="w-4 h-4 text-red-400" />,
          bg: 'bg-red-500/10 border-red-500/20',
          sign: '+৳',
          classAmt: 'text-red-400'
        };
      case 'Membership_Upgrade':
        return {
          icon: <Award className="w-4 h-4 text-purple-400 animate-bounce" style={{ animationDuration: '4s' }} />,
          bg: 'bg-purple-500/10 border-purple-500/20',
          sign: '-৳',
          classAmt: 'text-purple-400'
        };
      default:
        return {
          icon: <ArrowUpRight className="w-4 h-4 text-gray-400" />,
          bg: 'bg-white/5 border-white/5',
          sign: '৳',
          classAmt: 'text-white'
        };
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl mb-8">
      
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-sans font-bold text-white tracking-tight">Active Financial Ledger</h2>
          <p className="text-gray-400 text-xs mt-0.5">Comprehensive audit trail of all earnings, upgrades and settlements</p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 hover:text-cyan-300 rounded-xl transition-all text-xs font-mono flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ledger history stream */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="border border-white/5 rounded-xl bg-black/20 overflow-hidden max-h-[380px] overflow-y-auto no-scrollbar">
            
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-mono text-xs">
                No ledger transactions found. Complete some tasks or request a payout to generate entries.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const style = getTxStyle(tx.type);
                  
                  return (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${style.bg}`}>
                          {style.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium leading-tight truncate">{tx.description}</p>
                          <span className="text-[9.5px] font-mono text-gray-400 mt-1 block">
                            {formatDateTime(tx.created_at)} • Type: <strong className="text-gray-300 uppercase">{tx.type}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <span className={`text-sm font-mono font-bold tracking-tight ${style.classAmt}`}>
                          {style.sign}{Number(tx.amount).toFixed(2)}
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold block">BDT</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* withdrawals tracking tracker panel */}
        <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-xl p-5">
          <h3 className="text-white text-sm font-bold tracking-wide uppercase flex items-center gap-2 font-mono mb-4">
            <Layers className="w-4 h-4 text-cyan-400" /> Withdrawal Settlement Log
          </h3>

          <div className="space-y-3.5 max-h-[320px] overflow-y-auto no-scrollbar">
            {withdrawals.length === 0 ? (
              <p className="text-gray-450 text-xs font-mono text-center py-6">
                No cashout history. Standard requests will settle here.
              </p>
            ) : (
              withdrawals.map((w) => {
                const isPending = w.status === 'Pending';
                const isApproved = w.status === 'Approved';
                const isRejected = w.status === 'Rejected';

                return (
                  <div key={w.id} className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-white font-mono">{w.mfs_provider} MFS</span>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Acc: {w.account_number}</span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isPending 
                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse'
                          : isApproved
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        {w.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-2">
                      <div>
                        <span className="text-[9px] text-gray-400 font-mono block">REF: {w.reference_id}</span>
                        <span className="text-[8.5px] text-gray-500 block">{formatDateTime(w.created_at)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white">৳ {Number(w.amount_bdt).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
