import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/db';
import { AdminBuyingRequirement, AdminAccountSale, Withdrawal, User, Task, Wallet, VerificationRequest, WithdrawalStatus } from '../types';
import { ShieldCheck, Settings, ListChecks, Landmark, Save, CheckCircle2, XCircle, RefreshCw, Sparkles, HelpCircle, AlertCircle, Users, Briefcase, UserCheck, UserX, Trash2, PlusCircle, Ban, Coins, ShieldAlert } from 'lucide-react';

interface AdminPanelProps {
  onRefreshTrigger: () => void;
}

export default function AdminPanel({ onRefreshTrigger }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'sales' | 'withdrawals' | 'users' | 'tasks' | 'verifications'>('rules');
  const [requirements, setRequirements] = useState<AdminBuyingRequirement[]>([]);
  const [sales, setSales] = useState<AdminAccountSale[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Balance adjustment states
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustingBalance, setAdjustingBalance] = useState<boolean>(false);

  // Input states for editing rules
  const [gmailPass, setGmailPass] = useState('');
  const [gmailRate, setGmailRate] = useState('');
  const [gmailGuideline, setGmailGuideline] = useState('');

  const [fbPass, setFbPass] = useState('');
  const [fbRate, setFbRate] = useState('');
  const [fbGuideline, setFbGuideline] = useState('');

  const [instaPass, setInstaPass] = useState('');
  const [instaRate, setInstaRate] = useState('');
  const [instaGuideline, setInstaGuideline] = useState('');

  // Action notes for approvals
  const [adminNote, setAdminNote] = useState<string>('');
  const [txRefId, setTxRefId] = useState<string>('');

  // Task Creator input states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskUrl, setTaskUrl] = useState('');
  const [taskReward, setTaskReward] = useState('2.00');
  const [taskDuration, setTaskDuration] = useState('15');
  const [taskType, setTaskType] = useState<'video' | 'visit' | 'social' | 'survey'>('visit');
  const [taskCategory, setTaskCategory] = useState('MICROJOB');

  const loadData = async () => {
    setLoading(true);
    try {
      const reqList = await apiService.getAdminBuyingRequirements();
      setRequirements(reqList);

      // Populate input forms
      const gmail = reqList.find(r => r.platform_type === 'gmail');
      if (gmail) {
        setGmailPass(gmail.required_password);
        setGmailRate(gmail.price_bdt.toString());
        setGmailGuideline(gmail.description_guideline);
      }

      const fb = reqList.find(r => r.platform_type === 'fb');
      if (fb) {
        setFbPass(fb.required_password);
        setFbRate(fb.price_bdt.toString());
        setFbGuideline(fb.description_guideline);
      }

      const insta = reqList.find(r => r.platform_type === 'insta');
      if (insta) {
        setInstaPass(insta.required_password);
        setInstaRate(insta.price_bdt.toString());
        setInstaGuideline(insta.description_guideline);
      }

      const salesList = await apiService.getAllSalesForAdmin();
      setSales(salesList);

      const cashList = await apiService.getAllWithdrawalsForAdmin();
      setWithdrawals(cashList);

      const usersList = await apiService.getAllUsersForAdmin();
      setUsers(usersList);

      const walletsList = await apiService.getAllWalletsForAdmin();
      setWallets(walletsList);

      const verRequests = await apiService.getAllVerificationRequests();
      setVerificationRequests(verRequests);

      const tasksFeedRes = await apiService.getTasks('admin-master');
      if (tasksFeedRes && tasksFeedRes.tasks) {
        setTasks(tasksFeedRes.tasks);
      }
    } catch (err) {
      console.error('Error loading admin configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to updates to update status change immediately on-screen
    const handleEvents = () => {
      loadData();
    };

    window.addEventListener('eebd_withdrawal_updated', handleEvents);
    window.addEventListener('eebd_users_updated', handleEvents);
    window.addEventListener('eebd_tasks_updated', handleEvents);
    window.addEventListener('eebd_verification_requests_updated', handleEvents);
    return () => {
      window.removeEventListener('eebd_withdrawal_updated', handleEvents);
      window.removeEventListener('eebd_users_updated', handleEvents);
      window.removeEventListener('eebd_tasks_updated', handleEvents);
      window.removeEventListener('eebd_verification_requests_updated', handleEvents);
    };
  }, []);

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const updatedRules: AdminBuyingRequirement[] = [
      {
        id: 'rule-gmail',
        platform_type: 'gmail',
        required_password: gmailPass,
        price_bdt: parseFloat(gmailRate) || 150,
        description_guideline: gmailGuideline,
        active: true
      },
      {
        id: 'rule-fb',
        platform_type: 'fb',
        required_password: fbPass,
        price_bdt: parseFloat(fbRate) || 350,
        description_guideline: fbGuideline,
        active: true
      },
      {
        id: 'rule-insta',
        platform_type: 'insta',
        required_password: instaPass,
        price_bdt: parseFloat(instaRate) || 250,
        description_guideline: instaGuideline,
        active: true
      }
    ];

    try {
      const res = await apiService.saveAdminBuyingRequirements(updatedRules);
      if (res) {
        setMessage({ type: 'success', text: 'অভিনন্দন! জিমেইল, ফেসবুক এবং ইন্সটাগ্রাম একাউন্টের পাসওয়ার্ড ও ক্রয়ের দাম সফলভাবে আপডেট করা হয়েছে।' });
        onRefreshTrigger();
        loadData();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'সেটিংস সেভ করতে কোনো সমস্যা হয়েছে।' });
    }
  };

  const handleEvaluateSale = async (saleId: string, status: 'Approved' | 'Rejected' | 'Processing' | 'Pending') => {
    try {
      const finalNotes = adminNote.trim() || (
        status === 'Approved' ? 'অ্যাকাউন্ট ভেরিফিকেশন সফল! পাসওয়ার্ড এবং সিকিউরিটি কোড সঠিক পাওয়া গেছে।' :
        status === 'Processing' ? 'অ্যাকাউন্ট চেক করা হচ্ছে (Processing)... অনুগ্রহ করে অপেক্ষা করুন।' :
        status === 'Pending' ? 'রিভিউ পেন্ডিং (Pending)' :
        'প্রত্যাখ্যাত: পাসওয়ার্ড অথবা মেইল সঠিক পাওয়া যায়নি!'
      );
      const res = await apiService.updateSaleStatusByAdmin(saleId, status, finalNotes);
      if (res.success) {
        const Swal = (window as any).Swal;
        if (Swal) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `অ্যাকাউন্টটি '${status}' স্টেটাসে আপডেট করা হয়েছে!`,
            showConfirmButton: false,
            timer: 2000,
            background: '#120524',
            color: '#fce7f3'
          });
        }
        setAdminNote('');
        loadData();
        onRefreshTrigger();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEvaluateVerification = async (requestId: string, status: 'Approved' | 'Rejected' | 'Processing' | 'Pending') => {
    try {
      const finalNotes = adminNote.trim() || (
        status === 'Approved' ? 'আপনার ভেরিফিকেশন পেমেন্ট সফলভাবে রিভিও এবং অনুমোদিত হয়েছে!' :
        status === 'Processing' ? 'আপনার পেমেন্ট ট্রানজেকশন চেক করা হচ্ছে (Processing)... অনুগ্রহ করে অপেক্ষা করুন।' :
        status === 'Pending' ? 'রিভিউ পেন্ডিং (Pending)' :
        'প্রত্যাখ্যাত: আপনার প্রেরিত TrxID অথবা স্যান্ডার নম্বরটির সাথে কোনো পেমেন্ট মেলেনি।'
      );
      const res = await apiService.updateVerificationRequestStatusByAdmin(requestId, status, finalNotes);
      if (res.success) {
        const Swal = (window as any).Swal;
        if (Swal) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `আবেদনটি '${status}' স্টেটাসে আপডেট করা হয়েছে!`,
            showConfirmButton: false,
            timer: 2000,
            background: '#120524',
            color: '#fce7f3'
          });
        }
        setAdminNote('');
        loadData();
        onRefreshTrigger();
      } else {
        alert(res.error || 'আবেদন আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEvaluateWithdrawal = async (cashId: string, status: WithdrawalStatus) => {
    try {
      const ref = txRefId.trim() || (status === 'Approved' ? 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase() : '');
      const res = await apiService.updateWithdrawalStatusByAdmin(cashId, status, ref);
      if (res.success) {
        const Swal = (window as any).Swal;
        if (Swal) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `ক্যাশআউট রিকোয়েস্ট '${status}' স্টেটাসে আপডেট করা হয়েছে!`,
            showConfirmButton: false,
            timer: 2000,
            background: '#120524',
            color: '#fce7f3'
          });
        }
        setTxRefId('');
        loadData();
        onRefreshTrigger();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('অনুগ্রহ করে সঠিক পরিমাণ (Amount) প্রদান করুন যা ০-এর চেয়ে বড়!');
      return;
    }

    setAdjustingBalance(true);
    try {
      const result = await apiService.adjustUserBalanceByAdmin(
        selectedUserForBalance.id,
        amountNum,
        adjustType,
        adjustReason.trim()
      );
      if (result.success) {
        const Swal = (window as any).Swal;
        if (Swal) {
          Swal.fire({
            icon: 'success',
            title: 'ওয়ালেট ব্যালেন্স আপডেট করা হয়েছে!',
            text: `@${selectedUserForBalance.username} এর একাউন্টে সফলভাবে ৳ ${amountNum.toFixed(2)} টাকা ${adjustType === 'add' ? 'যোগ করা হয়েছে' : 'কর্তন করা হয়েছে'}। একাউন্টের নতুন ব্যালেন্স: ৳ ${result.newBalance?.toFixed(2)}।`,
            background: '#0c0214',
            color: '#fce7f3',
            confirmButtonColor: '#9333ea'
          });
        }
        // Reset states
        setSelectedUserForBalance(null);
        setAdjustAmount('');
        setAdjustReason('');
        loadData();
        onRefreshTrigger();
      } else {
        alert(result.error || 'ব্যালেন্স আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      console.error(err);
      alert('একটি ত্রুটি দেখা দিয়েছে: ' + err.message);
    } finally {
      setAdjustingBalance(false);
    }
  };

  const handleToggleSuspend = async (userId: string) => {
    try {
      const result = await apiService.suspendUserToggle(userId);
      if (result.success) {
        const Swal = (window as any).Swal;
        if (Swal) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: result.is_suspended ? 'error' : 'success',
            title: `ইউজার স্থিতি: ${result.is_suspended ? 'suspended (স্থগিত)' : 'active (সচল)'}!`,
            showConfirmButton: false,
            timer: 2000,
            background: '#120524',
            color: '#fce7f3'
          });
        }
        loadData();
        onRefreshTrigger();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleVerify = async (userId: string) => {
    try {
      const result = await apiService.verifyUserToggle(userId);
      if (result.success) {
        const Swal = (window as any).Swal;
        if (Swal) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `ভেরিফিকেশন স্থিতি: ${result.is_verified ? 'Verified (ভেরিফাইড)' : 'Unverified (নিষ্ক্রিয়)'}!`,
            showConfirmButton: false,
            timer: 2000,
            background: '#120524',
            color: '#fce7f3'
          });
        }
        loadData();
        onRefreshTrigger();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskUrl) {
      alert('শিরোনাম এবং টাস্ক লিংক দেয়া বাধ্যতামূলক!');
      return;
    }

    try {
      const res = await apiService.createNewTaskByAdmin({
        title: taskTitle,
        description: taskDesc,
        external_url: taskUrl,
        reward_bdt: parseFloat(taskReward) || 2.0,
        duration_seconds: parseInt(taskDuration) || 15,
        task_type: taskType,
        category: taskCategory,
        active: true
      });
      if (res.success) {
        const Swal = (window as any).Swal;
        if (Swal) {
          Swal.fire({
            icon: 'success',
            title: 'টাস্ক সফলভাবে তৈরি!',
            text: 'টাস্কটি ইনস্ট্যান্ট সচল ফ্রিল্যান্স ফিডে পাবলিশ হয়েছে।',
            background: '#0c0214',
            color: '#fce7f3',
            confirmButtonColor: '#9333ea'
          });
        }
        setTaskTitle('');
        setTaskDesc('');
        setTaskUrl('');
        setTaskReward('2.00');
        setTaskDuration('15');
        loadData();
        onRefreshTrigger();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই টাস্কটি মুছে ফেলতে চান?")) return;
    try {
      const res = await apiService.deleteTaskByAdmin(taskId);
      if (res.success) {
        const Swal = (window as any).Swal;
        if (Swal) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'টাস্কটি ডিলিট করা হয়েছে!',
            showConfirmButton: false,
            timer: 1500,
            background: '#120524',
            color: '#fce7f3'
          });
        }
        loadData();
        onRefreshTrigger();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="admin-panel-control-center" className="bg-[#0b0c16]/95 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6 shrink-0 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>ADMIN CONTROLS PORTAL</span>
              <span className="text-[10px] bg-purple-500/30 text-purple-300 border border-purple-500/50 rounded-full px-2 py-0.5 font-bold uppercase">Master Desk</span>
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">অ্যাকাউন্টের দাম, পাসওয়ার্ড কাস্টমাইজেশন, ক্যাশআউট রিলিজ ও সিকিউরিটি ভেরিফিকেশন প্যানেল</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-white/5 border border-white/10 text-gray-200 text-xs rounded-xl hover:bg-white/10 transition-all font-mono flex items-center gap-2 justify-center cursor-pointer ml-auto sm:ml-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিলোড ডেটা</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex gap-2 border mb-6 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Primary Switcher Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 mb-6 col-span-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('rules')}
          className={`py-3 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'rules' ? 'bg-purple-600 font-extrabold text-white shadow-lg shadow-purple-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span>ক্রয় শর্তাবলী</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('sales')}
          className={`py-3 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'sales' ? 'bg-purple-600 font-extrabold text-white shadow-lg shadow-purple-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <ListChecks className="w-3.5 h-3.5 shrink-0" />
          <span>অ্যাকাউন্টস ({sales.filter(s => s.status === 'Pending').length} পেন্ডিং)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('withdrawals')}
          className={`py-3 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'withdrawals' ? 'bg-purple-600 font-extrabold text-white shadow-lg shadow-purple-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Landmark className="w-3.5 h-3.5 shrink-0" />
          <span>ক্যাশআউট ({withdrawals.filter(w => w.status === 'Pending').length} পেন্ডিং)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('users')}
          className={`py-3 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'users' ? 'bg-purple-600 font-extrabold text-white shadow-lg shadow-purple-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>ইউজার ({users.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('tasks')}
          className={`py-3 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'tasks' ? 'bg-purple-600 font-extrabold text-white shadow-lg shadow-purple-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Briefcase className="w-3.5 h-3.5 shrink-0" />
          <span>টাস্ক ({tasks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('verifications')}
          className={`py-3 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'verifications' ? 'bg-purple-600 font-extrabold text-white shadow-lg shadow-purple-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
          <span>ভেরিফিকেশন ({verificationRequests.filter(v => v.status === 'Pending').length} পেন্ডিং)</span>
        </button>
      </div>

      {/* Tab Contents: 1. Rules Editor */}
      {activeSubTab === 'rules' && (
        <form onSubmit={handleSaveRules} className="space-y-6">
          <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10 mb-2">
            <span className="text-yellow-300 font-extrabold text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              ইন্সট্রাকশন সেটিংস গাইডঃ
            </span>
            <p className="text-gray-300 leading-relaxed text-xs mt-1 font-sans">
              এখান থেকে জিমেইল, ফেসবুক ও ইন্সটাগ্রাম অ্যাকাউন্টের নির্দিষ্ট পাসওয়ার্ড ও ক্রয় মূল্য নির্ধারণ করুন। ফ্রিল্যান্সাররা অ্যাকাউন্ট সেকশনে গেলে এখানে কনফিগার করা দাম ও পাসওয়ার্ড দেখতে পাবে এবং সেই পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলে সাবমিট করতে বাধ্য থাকবে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Gmail Rule Panel */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-[#ea4335] text-white font-bold flex items-center justify-center text-[10px]">G</span>
                <span className="text-xs font-mono font-bold text-white uppercase">Gmail Configuration</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Required Password</label>
                <input
                  type="text"
                  value={gmailPass}
                  onChange={(e) => setGmailPass(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Rate Price (BDT)</label>
                <input
                  type="number"
                  value={gmailRate}
                  onChange={(e) => setGmailRate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Description / Checklist Guideline</label>
                <textarea
                  value={gmailGuideline}
                  onChange={(e) => setGmailGuideline(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none leading-normal"
                />
              </div>
            </div>

            {/* FB Rule Panel */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-[#1877f2] text-white font-bold flex items-center justify-center text-[10px]">F</span>
                <span className="text-xs font-mono font-bold text-white uppercase">Facebook Configuration</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Required Password</label>
                <input
                  type="text"
                  value={fbPass}
                  onChange={(e) => setFbPass(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Rate Price (BDT)</label>
                <input
                  type="number"
                  value={fbRate}
                  onChange={(e) => setFbRate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Description / Checklist Guideline</label>
                <textarea
                  value={fbGuideline}
                  onChange={(e) => setFbGuideline(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none leading-normal"
                />
              </div>
            </div>

            {/* Insta Rule Panel */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-[#c13584] text-white font-bold flex items-center justify-center text-[10px]">I</span>
                <span className="text-xs font-mono font-bold text-white uppercase">Instagram Configuration</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Required Password</label>
                <input
                  type="text"
                  value={instaPass}
                  onChange={(e) => setInstaPass(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Rate Price (BDT)</label>
                <input
                  type="number"
                  value={instaRate}
                  onChange={(e) => setInstaRate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-purple-300 uppercase">Description / Checklist Guideline</label>
                <textarea
                  value={instaGuideline}
                  onChange={(e) => setInstaGuideline(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none leading-normal"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 cursor-pointer"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>আপডেট এবং সংরক্ষণ করুন (Save Pricing configs)</span>
          </button>
        </form>
      )}

      {/* Tab Contents: 2. Submitted Accounts Review Panel */}
      {activeSubTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center mb-1">
            <h3 className="text-white text-xs font-mono font-bold tracking-wider uppercase">Submitted Freelancer Accounts Manual Audit Log</h3>
            <span className="text-[10px] bg-yellow-400/10 text-yellow-300 border border-yellow-500/20 px-2 py-0.5 rounded-full font-mono">
              Total {sales.length} items
            </span>
          </div>

          {sales.length === 0 ? (
            <div className="p-8 text-center bg-black/10 rounded-2xl border border-white/5">
              <p className="text-gray-400 text-sm">কোনো ইউজার এখনো অ্যাডমিন সেল প্যানেলে একাউন্ট সাবমিট করেনি।</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              {sales.map((sale) => {
                const isPending = sale.status === 'Pending';
                return (
                  <div key={sale.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl transition-all hover:border-purple-500/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 border border-purple-500/30 font-mono rounded font-medium">
                            {sale.id.toUpperCase()}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${sale.platform_type === 'gmail' ? 'bg-red-500' : sale.platform_type === 'fb' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                          <span className="text-xs uppercase font-mono text-white font-bold">{sale.platform_type}</span>
                          <span className="text-gray-500 text-[11px] font-mono">By @{sale.username}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 mt-2 text-xs">
                          <div><strong className="text-gray-400">Email/Id: </strong><code className="text-cyan-300 font-mono select-all bg-slate-900/40 px-1 py-0.5 rounded">{sale.account_email}</code></div>
                          <div><strong className="text-gray-400">Password: </strong><code className="text-yellow-300 font-mono select-all bg-slate-900/40 px-1 py-0.5 rounded">{sale.account_password}</code></div>
                          <div><strong className="text-gray-400">Recovery: </strong><code className="text-pink-300 font-mono select-all bg-slate-900/40 px-1 py-0.5 rounded">{sale.recovery_info}</code></div>
                        </div>

                        {sale.additional_notes && (
                          <p className="text-[11px] text-gray-400 mt-1 italic">"নোটঃ {sale.additional_notes}"</p>
                        )}

                        <div className="text-[10px] text-gray-500 font-mono mt-1">
                          তারিখ: {new Date(sale.created_at).toLocaleString('bn-BD')} | মূল্য: <span className="text-emerald-400 font-extrabold text-xs">৳ {sale.price_bdt.toFixed(2)} টাকা</span>
                        </div>

                        {sale.admin_notes && (
                          <div className="mt-2 text-xs bg-slate-950/40 p-2 rounded-lg border border-white/5 text-gray-300">
                            <strong>অ্যাডমিন রিভিউ ফিডব্যাকঃ</strong> <span className="italic text-emerald-400">{sale.admin_notes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mt-2 md:mt-0 shrink-0 md:w-72">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase leading-none border self-end mb-1 ${
                          sale.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          sale.status === 'Processing' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse' :
                          sale.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          Status: {sale.status}
                        </span>

                        <input
                          type="text"
                          placeholder="রিভিউ নোট লিখুন (ঐচ্ছিক)"
                          className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 font-sans"
                          onChange={(e) => setAdminNote(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => handleEvaluateSale(sale.id, 'Approved')}
                            disabled={sale.status === 'Approved'}
                            className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Payout</span>
                          </button>
                          
                          <button
                            onClick={() => handleEvaluateSale(sale.id, 'Processing')}
                            disabled={sale.status === 'Processing'}
                            className="px-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing</span>
                          </button>

                          <button
                            onClick={() => handleEvaluateSale(sale.id, 'Rejected')}
                            disabled={sale.status === 'Rejected'}
                            className="px-2 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject & Void</span>
                          </button>

                          <button
                            onClick={() => handleEvaluateSale(sale.id, 'Pending')}
                            disabled={sale.status === 'Pending'}
                            className="px-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Reset Pending</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: 3. Withdrawals Approval Desk */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center mb-1">
            <h3 className="text-white text-xs font-mono font-bold tracking-wider uppercase">Pending User Withdrawal cashouts Desk</h3>
            <span className="text-[10px] bg-yellow-400/10 text-yellow-300 border border-yellow-500/20 px-2 py-0.5 rounded-full font-mono">
              Total {withdrawals.length} cashouts
            </span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-8 text-center bg-black/10 rounded-2xl border border-white/5">
              <p className="text-gray-400 text-sm">কোনো ইউজার এখনো উইথড্র রিকোয়েস্ট সাবমিট করেনি।</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              {withdrawals.map((withdrawal) => {
                const isPending = withdrawal.status === 'Pending';
                return (
                  <div key={withdrawal.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl transition-all hover:border-purple-500/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 border border-pink-500/30 font-mono rounded font-medium">
                            {withdrawal.id.toUpperCase()}
                          </span>
                          <span className="text-xs text-white uppercase font-bold font-mono">
                            {withdrawal.mfs_provider}
                          </span>
                          <span className="text-gray-500 text-[11px] font-mono">User ID: @{withdrawal.user_id.substr(0, 10)}</span>
                        </div>

                        <div className="text-xs space-y-1 mt-1 font-sans">
                          <div>রিসিভার মোবাইল নম্বরঃ <strong className="text-pink-300 font-mono select-all font-bold bg-slate-900/40 px-1 py-0.5 rounded">{withdrawal.account_number}</strong></div>
                          <div>উইথড্রভাল ক্যাশআউট এমাউন্টঃ <strong className="text-emerald-400 font-sans font-extrabold text-sm">৳ {withdrawal.amount_bdt.toFixed(2)} টাকা BDT</strong></div>
                        </div>

                        <div className="text-[10px] text-gray-500 font-mono mt-1">
                          রিকোয়েস্ট ডেট: {new Date(withdrawal.created_at).toLocaleString('bn-BD')}
                        </div>

                        {withdrawal.reference_id && (
                          <div className="text-[11px] text-emerald-400 font-mono mt-1">
                            পেমেন্ট ট্রানজেকশন রেফারেন্স ID: {withdrawal.reference_id}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mt-2 md:mt-0 shrink-0 md:w-72">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase leading-none border self-end mb-1 ${
                          withdrawal.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          withdrawal.status === 'Processing' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 animate-pulse' :
                          withdrawal.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          Status: {withdrawal.status}
                        </span>

                        <input
                          type="text"
                          placeholder="bKash / Nagad TrxID লিখুন (ঐচ্ছিক)"
                          className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 font-sans"
                          onChange={(e) => setTxRefId(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => handleEvaluateWithdrawal(withdrawal.id, 'Approved')}
                            disabled={withdrawal.status === 'Approved'}
                            className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Pay</span>
                          </button>
                          
                          <button
                            onClick={() => handleEvaluateWithdrawal(withdrawal.id, 'Processing')}
                            disabled={withdrawal.status === 'Processing'}
                            className="px-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing</span>
                          </button>

                          <button
                            onClick={() => handleEvaluateWithdrawal(withdrawal.id, 'Rejected')}
                            disabled={withdrawal.status === 'Rejected'}
                            className="px-2 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject & Refund</span>
                          </button>

                          <button
                            onClick={() => handleEvaluateWithdrawal(withdrawal.id, 'Pending')}
                            disabled={withdrawal.status === 'Pending'}
                            className="px-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Set Pending</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Tab Contents: 4. User Master Management */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          
          {selectedUserForBalance && (
            <div className="p-5 bg-gradient-to-tr from-slate-900/90 via-purple-950/40 to-cyan-950/95 border border-cyan-500/30 rounded-2xl space-y-4 animate-fade-in shadow-xl shadow-cyan-500/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <h4 className="text-white text-sm font-bold font-sans">
                    ব্যালেন্স নিয়ন্ত্রণ করুন: <span className="text-cyan-400">@{selectedUserForBalance.username}</span>
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustBalance} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end font-sans">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] text-gray-400 font-bold block">লেনদেনের ধরন (Type):</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/60 border border-white/10 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAdjustType('add')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        adjustType === 'add' 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      টাকা যোগ (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('deduct')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        adjustType === 'deduct' 
                          ? 'bg-red-650 bg-red-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      টাকা কাটা (-)
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] text-gray-400 block font-bold">টাকার পরিমাণ (BDT):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="যেমনঃ ৫০.০০"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] text-gray-400 block font-bold">কারন / নোট (Reason for Ledger):</label>
                  <input
                    type="text"
                    placeholder="যেমনঃ Daily Bonus / Admin cut"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={adjustingBalance}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold text-slate-950 transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      adjustType === 'add' 
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300' 
                        : 'bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-300 hover:to-pink-300'
                    } disabled:opacity-50`}
                  >
                    {adjustingBalance ? (
                      <span>আপডেট হচ্ছে...</span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>কনফার্ম করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
            <div className="flex gap-2 items-center">
              <h3 className="text-white text-xs font-mono font-bold tracking-wider uppercase">Active Registered Freelancers List ({users.length})</h3>
              <span className="text-[10px] bg-cyan-400/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">
                Real-time Sync
              </span>
            </div>

            <input
              type="text"
              placeholder="🔍 ইউজারনাম, ইমেইল বা মোবাইল দিয়ে খুঁজুন..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="px-3.5 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full sm:max-w-xs font-sans"
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-1 no-scrollbar space-y-3">
            {users
              .filter(u => {
                if (!userSearch) return true;
                const s = userSearch.toLowerCase();
                return (
                  u.username?.toLowerCase().includes(s) ||
                  u.email?.toLowerCase().includes(s) ||
                  u.phone?.toLowerCase().includes(s)
                );
              })
              .map(u => {
                const isUserSuspended = !!u.is_suspended;
                const userWallet = wallets.find(w => w.user_id === u.id);
                return (
                  <div
                    key={u.id}
                    className={`p-4 bg-black/40 border rounded-2xl transition-all ${
                      isUserSuspended ? 'border-red-500/20 bg-red-950/5' : 'border-white/5 hover:border-purple-500/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">@{u.username}</span>
                          <span className="text-[10px] font-mono text-gray-500">ID: {u.id.substring(0, 8)}</span>
                          {u.email === 'songworld061@gmail.com' && (
                            <span className="text-[9px] bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded px-1 font-bold">PRIMARY ADMIN</span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono space-y-0.5">
                          <p className="text-gray-400">মেইলঃ <span className="text-cyan-300 select-all">{u.email}</span></p>
                          <p className="text-gray-400">মোবাইলঃ <span className="text-pink-300 select-all">{u.phone}</span></p>
                          <p className="text-gray-400">লেভেলঃ <span className="text-yellow-400 font-sans font-bold">{u.membership_level || 'General'}</span></p>
                          <p className="text-gray-400">চলতি ব্যালেন্সঃ <span className="text-emerald-400 font-sans font-bold">৳ {userWallet?.balance_bdt !== undefined ? Number(userWallet.balance_bdt).toFixed(2) : '0.00'} BDT</span></p>
                          <p className="text-gray-400">সর্বমোট আয়ঃ <span className="text-sky-400 font-sans font-bold">৳ {userWallet?.total_earned_bdt !== undefined ? Number(userWallet.total_earned_bdt).toFixed(2) : '0.00'} BDT</span></p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            u.is_verified 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                            {u.is_verified ? 'Verified (সক্রিয়)' : 'Unverified (নিষ্ক্রিয়)'}
                          </span>
                          
                          {isUserSuspended && (
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-2 py-0.5 rounded">
                              Suspended (স্থগিত)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* User actions */}
                      <div className="flex flex-row sm:flex-col gap-2 shrink-0 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForBalance(u);
                            setAdjustAmount('');
                            setAdjustReason('');
                            setAdjustType('add');
                          }}
                          className="px-3.5 py-1.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 shadow-md"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>ব্যালেন্স নিয়ন্ত্রণ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleVerify(u.id)}
                          className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            u.is_verified
                              ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 text-white'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{u.is_verified ? 'আন-ভেরিফাই করুন' : 'ম্যানুয়াল ভেরিফাই'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(u.id)}
                          disabled={u.email === 'songworld061@gmail.com'}
                          className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 ${
                            isUserSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-505/30'
                              : 'bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-500/30 font-bold'
                          }`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{isUserSuspended ? 'সাসপেনশন তুলুন (Unban)' : 'সাসপেন্ড করুন (Suspend)'}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab Contents: 5. Microjob/Task Creator and Manager */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Task Creator Form */}
            <div className="lg:col-span-5 p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4">
              <h3 className="text-white text-sm font-bold border-b border-white/5 pb-2 uppercase tracking-wide flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-purple-400" />
                <span>নতুন মাইক্রোজব পাবলিশ করূন (Add Task)</span>
              </h3>

              <form onSubmit={handleCreateTask} className="space-y-4 font-sans text-xs">
                
                <div className="space-y-1.5">
                  <label className="text-gray-400 block font-bold">টাস্ক টাইটেল / কাজ শিরোনামঃ</label>
                  <input
                    type="text"
                    placeholder="যেমনঃ YouTube channel subscribe করুন..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 block font-bold">কাজ সম্পর্কে সংক্ষিপ্ত বিবরণঃ</label>
                  <textarea
                    placeholder="ইউজারকে কি কি নিয়ম ফলো করতে হবে তা লিখুন..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 block font-bold">কাজ বা ভিডিও এর সোর্স লিংক (Task Source URL):</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... অথবা ওয়েবসাইট লিংক"
                    value={taskUrl}
                    onChange={(e) => setTaskUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 block font-bold">পুরস্কার / বোনাস টাকা (BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="2.00"
                      value={taskReward}
                      onChange={(e) => setTaskReward(e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-400 block font-bold">লিংকে অবস্থান কাল (সেকেন্ড):</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={taskDuration}
                      onChange={(e) => setTaskDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 block font-bold">টাস্ক টাইপ (Task Type):</label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
                    >
                      <option value="visit">🌐 Web Visit</option>
                      <option value="video">📺 YouTube Video</option>
                      <option value="social">📣 Social Share</option>
                      <option value="survey">📊 Survey Task</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-400 block font-bold">ক্যাটাগরি ব্যাজঃ</label>
                    <input
                      type="text"
                      placeholder="যেমনঃ MICROJOB / VIDEO / EASY"
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>লাইভ পাবলিশ করূন (Post Microjob)</span>
                </button>

              </form>
            </div>

            {/* Right: Active Tasks List */}
            <div className="lg:col-span-7 space-y-3">
              <h4 className="text-white text-xs font-mono font-bold tracking-wider uppercase border-b border-white/5 pb-2">
                Active posted microjobs list ({tasks.length})
              </h4>

              <div className="max-h-[500px] overflow-y-auto pr-1 no-scrollbar space-y-3.5">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-gray-400 text-xs">কোনো টাস্ক এখনো পোস্ট করা হয়নি।</p>
                  </div>
                ) : (
                  tasks.map(t => (
                    <div key={t.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl transition-all hover:border-purple-500/20">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                              {t.category || 'MICROJOB'}
                            </span>
                            <span className="text-gray-500 text-[10px] font-mono">Type: {t.task_type}</span>
                          </div>
                          
                          <h5 className="text-white text-sm font-bold font-sans">{t.title}</h5>
                          <p className="text-gray-400 text-xs leading-normal font-sans line-clamp-1">{t.description}</p>
                          
                          <div className="grid grid-cols-2 xs:flex gap-x-4 gap-y-1 text-xs text-gray-500 font-mono">
                            <div>পারিশ্রমিকঃ <span className="text-emerald-400 font-bold">৳ {t.reward_bdt} tk</span></div>
                            <div>টাইমারঃ <span className="text-yellow-400 font-bold">{t.duration_seconds}s</span></div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-2 bg-red-950/20 hover:bg-rose-900/40 border border-red-500/20 rounded-xl text-red-400 transition-all cursor-pointer shrink-0"
                          title="টাস্ক ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center mb-1">
            <h3 className="text-white text-xs font-mono font-bold tracking-wider uppercase mb-1">User Profile MFS Verification Requests</h3>
            <span className="text-[10px] bg-cyan-400/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">
              Total {verificationRequests.length} submissions
            </span>
          </div>

          {verificationRequests.length === 0 ? (
            <div className="p-8 text-center bg-black/10 rounded-2xl border border-white/5">
              <p className="text-gray-400 text-xs">কোনো ইউজার ভেরিফিকেশনের জন্য পেমেন্ট আবেদন করেনি।</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar text-left">
              {verificationRequests.map((req) => (
                <div key={req.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl transition-all hover:border-cyan-500/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 border border-cyan-500/30 font-mono rounded font-medium">
                          REF: {req.id.toUpperCase().substring(0, 8)}
                        </span>
                        <span className="text-xs uppercase font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/15">{req.mfs_provider}</span>
                        <span className="text-xs text-white font-bold">Sender: {req.sender_number}</span>
                        <span className="text-gray-400 text-xs">(@{req.username})</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
                        <div>
                          <strong className="text-gray-400">Transaction ID (TrxID): </strong>
                          <code className="text-yellow-400 font-mono select-all bg-slate-900/40 px-1 py-0.5 rounded text-xs tracking-wider uppercase font-extrabold font-mono">{req.trx_id}</code>
                        </div>
                        <div>
                          <strong className="text-gray-400">User Phone (Registered): </strong>
                          <span className="text-gray-300 font-mono">{req.phone}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-500 font-mono mt-1">
                        তারিখ: {new Date(req.created_at).toLocaleString('bn-BD')} | পরিমাণঃ <span className="text-emerald-400 font-bold">৳ {req.amount_bdt} টাকা</span>
                      </div>

                      {req.admin_notes && (
                        <div className="mt-2 text-xs bg-slate-950/40 p-2 rounded-lg border border-white/5 text-gray-300">
                          <strong>রিভিউ নোট:</strong> <span className="italic text-cyan-400">{req.admin_notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 md:w-64">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase leading-none border self-end mb-1 ${
                        req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        req.status === 'Processing' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                        req.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        Status: {req.status}
                      </span>

                      <input
                        type="text"
                        placeholder="রিভিউ ফিডব্যাক/রিজেকশন কারণ (ঐচ্ছিক)"
                        className="w-full px-3 py-1 bg-[#10031c] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-sans"
                        onChange={(e) => setAdminNote(e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleEvaluateVerification(req.id, 'Approved')}
                          disabled={req.status === 'Approved'}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve (ভেরিফাই)</span>
                        </button>
                        
                        <button
                          onClick={() => handleEvaluateVerification(req.id, 'Processing')}
                          disabled={req.status === 'Approved'}
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Processing</span>
                        </button>

                        <button
                          onClick={() => handleEvaluateVerification(req.id, 'Rejected')}
                          disabled={req.status === 'Approved'}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject (বাতিল)</span>
                        </button>

                        <button
                          onClick={() => handleEvaluateVerification(req.id, 'Pending')}
                          disabled={req.status === 'Approved'}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Pending</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
