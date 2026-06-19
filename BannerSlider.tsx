import { useState, useEffect } from 'react';
import { Smartphone, Mail, ShieldCheck, Database, Award, Wallet, Calendar, Wifi, Sparkles, RefreshCw, HelpCircle, HardDrive } from 'lucide-react';

import { User, Wallet as WalletType, Task, Withdrawal, Transaction, MembershipLevel, MfsProvider } from './types';
import { apiService, isSupabaseConfigured } from './lib/db';

// Modular component imports
import AuthScreen from './components/AuthScreen';
import DashboardStats from './components/DashboardStats';
import TaskSystem from './components/TaskSystem';
import CashoutEngine from './components/CashoutEngine';
import TransactionLedger from './components/TransactionLedger';
import MembershipUpgrade from './components/MembershipUpgrade';
import SupabaseSetupInfo from './components/SupabaseSetupInfo';
import VerificationAndAffiliate from './components/VerificationAndAffiliate';
import AccountMarketplace from './components/AccountMarketplace';
import AdminAccountSeller from './components/AdminAccountSeller';
import AdminPanel from './components/AdminPanel';
import ChatbotWidget from './components/ChatbotWidget';
import BrandLogo from './components/BrandLogo';
import ProfileSystem from './components/ProfileSystem';
import BannerSlider from './components/BannerSlider';
import AdViewPage from './components/AdViewPage';

const SESSION_KEY = 'eebd_session_v1';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Modals & overlay control states
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);
  const [isDeveloperSetupOpen, setIsDeveloperSetupOpen] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'marketplace' | 'referrals' | 'admin-sell' | 'ad-work' | 'admin-desk' | 'income' | 'profile'>('tasks');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedSellPlatform, setSelectedSellPlatform] = useState<'gmail' | 'fb' | 'insta'>('gmail');

  // States for interactive project mini-apps/modals
  const [activeProjModal, setActiveProjModal] = useState<'typing' | 'ad_view' | 'gift' | 'updates' | 'monthly_salary' | 'leadership' | 'leader_board' | 'job_post' | null>(null);
  const [typingInput, setTypingInput] = useState<string>('');
  const [typingTarget, setTypingTarget] = useState<string>('SUPER EARNING BD');
  const [typingChances, setTypingChances] = useState<number>(5);
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [adPlaying, setAdPlaying] = useState<boolean>(false);
  const [adTimeLeft, setAdTimeLeft] = useState<number>(5);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoStatus, setPromoStatus] = useState<{success?: string, error?: string} | null>(null);

  // Helper to securely identify admins (e.g. songworld061@gmail.com)
  const isUserAdmin = (u: User | null): boolean => {
    if (!u) return false;
    const email = (u.email || '').toLowerCase().trim();
    const username = (u.username || '').toLowerCase().trim();
    return email === 'songworld061@gmail.com' || username === 'admin' || email === 'admin@gmail.com';
  };

  // Security barrier to unpack administrative operations under Bangladesh freelance guidelines
  const tryAccessAdminPortal = () => {
    const Swal = (window as any).Swal;

    if (!isUserAdmin(user)) {
      if (Swal) {
        Swal.fire({
          icon: 'error',
          title: 'অ্যাডমিন এক্সেস প্রত্যাখ্যাত 🔐',
          text: 'দুঃখিত, এই প্যানেলটি শুধুমাত্র প্রধান অ্যাডমিন songworld061@gmail.com এর জন্য সুরক্ষিত।',
          background: '#0c071d',
          color: '#fce7f3',
          confirmButtonColor: '#bd1b60',
          confirmButtonText: 'ঠিক আছে'
        });
      } else {
        alert("দুঃখিত, এই প্যানেলটি শুধুমাত্র প্রধান অ্যাডমিন songworld061@gmail.com এর জন্য সুরক্ষিত।");
      }
      return;
    }

    if (isAdminUnlocked) {
      setActiveTab(activeTab === 'admin-desk' ? 'tasks' : 'admin-desk');
      return;
    }

    if (Swal) {
      Swal.fire({
        title: 'অ্যাডমিন সিকিউরিটি লক 🔑',
        text: 'অ্যাডমিন কন্ট্রোল ডেস্কে প্রবেশ করতে সিকিউরিটি পাসকোড টাইপ করুন। (ডিমো পিনঃ ১২৩৪৫৬ অথবা admin)',
        input: 'password',
        inputPlaceholder: 'কনফিগারেশন পাসকোড...',
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        background: '#0c071d',
        color: '#fce7f3',
        confirmButtonColor: '#9333ea',
        confirmButtonText: 'ভেরিফাই ও প্রবেশ করুন',
        showCancelButton: true,
        cancelButtonText: 'বাতিল',
        customClass: {
          input: 'text-center font-mono tracking-widest text-[#a855f7]'
        },
        preConfirm: (pin: string) => {
          if (pin === '123456' || pin === 'admin123' || pin.toLowerCase() === 'admin') {
            return true;
          } else {
            Swal.showValidationMessage('❌ ভুল সিকিউরিটি পাসকোড! অনুগ্রহ করে সঠিক পাসকোড দিন।');
            return false;
          }
        }
      }).then((result: any) => {
        if (result.isConfirmed) {
          setIsAdminUnlocked(true);
          setActiveTab('admin-desk');
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'অ্যাডমিন প্যানেল সফলভাবে আনলক হয়েছে!',
            showConfirmButton: false,
            timer: 2000,
            background: '#090514',
            color: '#fce7f3'
          });
        }
      });
    } else {
      const pin = window.prompt("অ্যাডমিন সিকিউরিটি পিন দিন (ডিমো পিনঃ 123456):");
      if (pin === '123456' || pin === 'admin123' || pin === 'admin') {
        setIsAdminUnlocked(true);
        setActiveTab('admin-desk');
      } else if (pin !== null) {
        alert("ভুল পাসকোড!");
      }
    }
  };

  // Check for existing saved auth session
  useEffect(() => {
    const cachedSession = window.localStorage.getItem(SESSION_KEY);
    if (cachedSession) {
      try {
        const cachedUser = JSON.parse(cachedSession) as User;
        setUser(cachedUser);
      } catch (e) {
        console.error('Error reading cached auth session:', e);
      }
    }
  }, []);

  // Fetch / Sync all user metrics when user is authenticated
  const syncUserData = async (silent = false) => {
    if (!user) return;
    if (!silent) setSyncing(true);

    try {
      // 1. Core Profile check (to reflect current membership level changes)
      const freshProfile = await apiService.getUserProfile(user.id);
      if (freshProfile) {
        setUser(freshProfile);
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(freshProfile));
      }

      // 2. Fetch Wallet state
      const freshWallet = await apiService.getWallet(user.id);
      setWallet(freshWallet);

      // 3. Fetch Tasks feed & completions
      const taskResponse = await apiService.getTasks(user.id);
      setTasks(taskResponse.tasks);
      setCompletedTaskIds(taskResponse.completedTaskIds);

      // 4. Fetch Withdrawals & Transactions
      const FreshWithdrawals = await apiService.getWithdrawals(user.id);
      setWithdrawals(FreshWithdrawals);

      const freshTransactions = await apiService.getTransactions(user.id);
      setTransactions(freshTransactions);

    } catch (error) {
      console.error('Error synchronizing user session data:', error);
    } finally {
      if (!silent) setSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      syncUserData();
    }
  }, [user?.id]);

  // Listen to auto-simulation withdrawals triggers (15 seconds after cashout)
  useEffect(() => {
    const handleSimulatedPayout = (e: Event) => {
      console.log('Simulation withdrawal status change detected:', (e as CustomEvent).detail);
      // Re-trigger silent sync to update ledger / wallet numbers live on screen
      syncUserData(true);
    };

    window.addEventListener('eebd_withdrawal_updated', handleSimulatedPayout);
    return () => {
      window.removeEventListener('eebd_withdrawal_updated', handleSimulatedPayout);
    };
  }, [user]);

  // Auth Action callbacks
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
  };

  const handleLogout = () => {
    const confirmExit = window.confirm("Are you sure you want to log out from Easy Earning BD?");
    if (confirmExit) {
      setUser(null);
      setWallet(null);
      setWithdrawals([]);
      setTransactions([]);
      window.localStorage.removeItem(SESSION_KEY);
    }
  };

  // Business logic wrappers
  const handleTaskComplete = async (taskId: string, reward: number) => {
    if (!user) return;
    const res = await apiService.completeTask(user.id, taskId, reward);
    if (res.success && res.wallet) {
      setWallet(res.wallet);
      // Instantly push completed ID to local array to reflect UI changes without reload
      setCompletedTaskIds(prev => [...prev, taskId]);
      // Silently sync transactions/ledger in background
      syncUserData(true);
    } else {
      throw new Error(res.error || 'Server rejected verification trigger.');
    }
  };

  const handleWithdrawalRequest = async (amount: number, provider: MfsProvider, number: string) => {
    if (!user) return { success: false, error: 'User context is blank.' };
    const res = await apiService.requestWithdrawal(user.id, amount, provider, number);
    if (res.success) {
      if (res.wallet) setWallet(res.wallet);
      syncUserData(true);
      return { success: true };
    } else {
      return { success: false, error: res.error };
    }
  };

  const handleMembershipUpgrade = async (level: MembershipLevel, fee: number) => {
    if (!user) return { success: false, error: 'User is unauthenticated.' };
    const res = await apiService.upgradeMembership(user.id, level, fee);
    if (res.success) {
      if (res.user) setUser(res.user);
      if (res.wallet) setWallet(res.wallet);
      syncUserData(true);
      return { success: true };
    } else {
      return { success: false, error: res.error };
    }
  };

  const handleVerificationSuccess = (updatedUser: User, updatedWallet?: WalletType) => {
    setUser(updatedUser);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    if (updatedWallet) setWallet(updatedWallet);
    // Silent background reload to reflect MLM logs or balance updates
    syncUserData(true);
  };

  const handleTypeJobSubmit = () => {
    if (!user || !wallet) return;
    if (typingChances <= 0) {
      setTypingMessage('❌ দুঃখিত! আজকের টাইপিং সীমা অতিক্রম করেছেন। আগামীকাল আবার চেষ্টা করুন।');
      return;
    }
    if (typingInput.trim().toUpperCase() === typingTarget) {
      const reward = 0.50;
      const updatedWallet = {
        ...wallet,
        balance_bdt: wallet.balance_bdt + reward
      };
      setWallet(updatedWallet);
      setTypingChances(prev => prev - 1);
      setTypingMessage(`🎉 অভিনন্দন! সঠিকভাবে টাইপ করেছেন। ৳ ${reward.toFixed(2)} টাকা ব্যালেন্সে যোগ হয়েছে।`);
      setTypingInput('');
      const words = ['TRUSTED EARNING', 'MOBILE RECHARGE', 'EASY INCOME BDT', 'SUPER ACTIVE USER', 'VIP MEMBRS ONLY'];
      const nextWord = words[Math.floor(Math.random() * words.length)];
      setTypingTarget(nextWord);
      
      apiService.awardDirectBonus(user.id, reward, `Typing challenge reward: ${typingTarget}`)
        .then(() => syncUserData(true))
        .catch(err => console.error(err));
    } else {
      setTypingMessage('❌ ভুল টাইপিং! হুবহু অক্ষরগুলো বড় হাতের অক্ষরে টাইপ করুন।');
    }
  };

  const startAdViewingGame = () => {
    if (!user || !wallet || adPlaying) return;
    setAdPlaying(true);
    setAdTimeLeft(5);
    
    const interval = setInterval(() => {
      setAdTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdPlaying(false);
          setActiveProjModal(null);
          
          const reward = 0.25;
          const updatedWallet = {
            ...wallet,
            balance_bdt: wallet.balance_bdt + reward
          };
          setWallet(updatedWallet);
          
          const Swal = (window as any).Swal;
          if (Swal) {
            Swal.fire({
              icon: 'success',
              title: 'বিজ্ঞাপন বোনাস সফল! 🎉',
              text: `৳ ${reward.toFixed(2)} টাকা আপনার প্রধান ওয়ালেটে সফলভাবে যোগ করা হয়েছে।`,
              confirmButtonText: 'ধন্যবাদ BDT'
            });
          } else {
            alert(`বিজ্ঞাপন বোনাস সফল! ৳ ${reward.toFixed(2)} টাকা যোগ করা হয়েছে।`);
          }
          
          apiService.awardDirectBonus(user.id, reward, 'Sponsor ad view reward')
            .then(() => syncUserData(true))
            .catch(err => console.error(err));
            
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitPromoCouponCode = () => {
    if (!user || !wallet) return;
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoStatus({ error: '❌ অনুগ্রহ করে একটি গিফট কোড টাইপ করুন!' });
      return;
    }
    
    if (code === 'SUPER50' || code === 'BDT100' || code === 'FREE50') {
      const amount = code === 'BDT100' ? 100.00 : 50.00;
      setPromoStatus({ success: `🎉 অভিনন্দন! উপহার কোড সফল হয়েছে। ৳ ${amount.toFixed(2)} ব্যালেন্স যোগ হয়েছে।` });
      const updatedWallet = {
        ...wallet,
        balance_bdt: wallet.balance_bdt + amount
      };
      setWallet(updatedWallet);
      setPromoCodeInput('');
      
      apiService.awardDirectBonus(user.id, amount, `Promo code: ${code}`)
        .then(() => syncUserData(true))
        .catch(err => console.error(err));
    } else {
      setPromoStatus({ error: '❌ ভুল উপহার কোড! সঠিক কোড সাবমিট করুন।' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] font-sans text-gray-800 flex flex-col no-scrollbar">
      
      {/* RESPONSIVE FLOATING SIDEBAR NAVIGATION */}
      {user && (
        <>
          {/* Dark Overlay Backdrop */}
          {isSidebarOpen && (
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300"
            />
          )}

          {/* Sliding Navigation Sidebar drawer */}
          <div className={`fixed top-0 bottom-0 left-0 w-[290px] bg-white z-55 shadow-2xl transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto flex flex-col`}>
            
            {/* Header portion of Sidebar */}
            <div className="bg-gradient-to-br from-[#1877F2] to-[#0052D4] text-white p-6 relative rounded-br-[40px] shadow-md shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:scale-105 transition-all text-xl cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-2xl" />
              </button>

              <div className="flex flex-col items-center text-center mt-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    className="w-[75px] h-[75px] rounded-full border-3 border-white/40 object-cover shadow-md bg-white mb-2"
                    alt="User profile"
                  />
                ) : (
                  <div className="w-[75px] h-[75px] rounded-full border-3 border-white/40 bg-white/20 text-white flex items-center justify-center font-bold text-2xl mb-2">
                    {user.username ? user.username.charAt(0).toUpperCase() : '👤'}
                  </div>
                )}

                <div className="font-extrabold text-base flex items-center gap-1.5 justify-center leading-snug">
                  {user.full_name || user.username || 'Valued Partner'}
                  {user.is_verified && (
                    <i className="fa-solid fa-circle-check text-[#2ecc71] text-sm" />
                  )}
                </div>

                <span className="bg-white/15 border border-white/25 text-white font-sans text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full mt-1.5">
                  🛡️ {user.membership_level === 'Free' ? 'সুপার ফ্রি একাউন্ট' : `VIP LEVEL: ${user.membership_level}`}
                </span>

                <p className="text-[10px] text-white/75 mt-1 font-mono">ID: {user.phone}</p>

                {/* Affiliate Link / Referral Code Quick-copy Box */}
                <div 
                  onClick={() => {
                    navigator.clipboard.writeText(user.id.substring(0, 8).toUpperCase());
                    const Swal = (window as any).Swal;
                    if (Swal) {
                      Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'রেফার কোড কপি হয়েছে!',
                        showConfirmButton: false,
                        timer: 1500
                      });
                    } else {
                      alert('Referral code copied successfully!');
                    }
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 mt-3 px-3 py-1.5 rounded-xl flex items-center gap-2 justify-center text-xs font-bold font-mono cursor-pointer transition-all w-fit"
                  title="Click to copy Referral Code"
                >
                  <span className="text-white/80 font-sans text-[9px] uppercase font-black">REF:</span>
                  <span className="text-yellow-300 tracking-wider text-[11px]">{user.id.substring(0, 8).toUpperCase()}</span>
                  <i className="fa-regular fa-copy text-[10px] text-white/90" />
                </div>
              </div>
            </div>

            {/* Scrolling Menu of Sidebar */}
            <div className="flex-1 px-4 py-6 space-y-2">
              <button 
                onClick={() => { setActiveTab('tasks'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-sans font-extrabold text-sm text-left cursor-pointer border ${activeTab === 'tasks' ? 'bg-[#f0f7ff] border-blue-100 text-blue-700 shadow-sm' : 'bg-transparent border-transparent text-gray-700 hover:bg-gray-50 hover:text-black'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${activeTab === 'tasks' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <i className="fa-solid fa-house-user" />
                </div>
                <span>হোম (Home Services)</span>
              </button>

              <button 
                onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-sans font-extrabold text-sm text-left cursor-pointer border ${activeTab === 'profile' ? 'bg-[#f0f7ff] border-blue-100 text-blue-700 shadow-sm' : 'bg-transparent border-transparent text-gray-700 hover:bg-gray-50 hover:text-black'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <i className="fa-solid fa-user-circle" />
                </div>
                <span>আমার প্রোফাইল (My Profile)</span>
              </button>

              <button 
                onClick={() => { setActiveTab('referrals'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-sans font-extrabold text-sm text-left cursor-pointer border ${activeTab === 'referrals' ? 'bg-[#f0f7ff] border-blue-100 text-blue-700 shadow-sm' : 'bg-transparent border-transparent text-gray-700 hover:bg-gray-50 hover:text-black'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${activeTab === 'referrals' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <i className="fa-solid fa-users-rays" />
                </div>
                <span>রেফার ও ভেরিফাই (Affiliate)</span>
              </button>

              <button 
                onClick={() => { setActiveTab('income'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-sans font-extrabold text-sm text-left cursor-pointer border ${activeTab === 'income' ? 'bg-[#f0f7ff] border-blue-100 text-blue-700 shadow-sm' : 'bg-transparent border-transparent text-gray-700 hover:bg-gray-50 hover:text-black'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${activeTab === 'income' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <i className="fa-solid fa-chart-line" />
                </div>
                <span>ইনকাম ও স্টেটমেন্ট (Withdraw)</span>
              </button>

              <a 
                href="https://t.me/superearningbd_Official" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setIsSidebarOpen(false)}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-sans font-extrabold text-sm text-left border bg-transparent border-transparent text-gray-700 hover:bg-gray-50 hover:text-black hover:no-underline"
              >
                <div className="w-8 h-8 rounded-lg bg-[#e1f5fe] text-[#0088cc] flex items-center justify-center text-base">
                  <i className="fa-brands fa-telegram" />
                </div>
                <span>অফিশিয়াল টেলিগ্রাম</span>
              </a>

              <button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  const cb = document.getElementById('chatbot-toggle-trigger');
                  if (cb) cb.click();
                  else alert("সহায়তার জন্য নিচে ডান পাশের চ্যাটবট আইকনে ক্লিক করুন!");
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-sans font-extrabold text-sm text-left cursor-pointer border bg-transparent border-transparent text-gray-700 hover:bg-gray-50 hover:text-black"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-base">
                  <i className="fa-solid fa-headset" />
                </div>
                <span>২৪/৭ লাইভ সাপোর্ট সেন্টার</span>
              </button>

              <button 
                onClick={() => { setIsSidebarOpen(false); setIsDeveloperSetupOpen(true); }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-sans font-extrabold text-sm text-left cursor-pointer border bg-transparent border-transparent text-gray-700 hover:bg-gray-50 hover:text-black"
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-base">
                  <i className="fa-solid fa-code" />
                </div>
                <span>ডেভেলপার কানেকশন পোর্টাল</span>
              </button>

              <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-sans font-extrabold text-sm text-left cursor-pointer border bg-transparent border-transparent text-red-600 hover:bg-red-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-base">
                    <i className="fa-solid fa-power-off" />
                  </div>
                  <span>লগ আউট (Sign Out)</span>
                </button>
              </div>
            </div>
            
            {/* Version credit */}
            <div className="p-4 text-center text-[10px] font-sans text-gray-400 mt-auto border-t border-gray-100 bg-gray-50">
              Developer Emon Licensed Applet
            </div>
          </div>
        </>
      )}

      {/* GLOBAL HIGH-CONTRAST LIGHT NAVIGATION HEADER */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-40 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          
          {user ? (
            <div className="flex items-center gap-3">
              {/* Menu hamburger trigger */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-xl hover:bg-gray-100 transition-all text-blue-600 text-lg cursor-pointer focus:outline-none"
                title="Open Navigation"
              >
                <i className="fa-solid fa-bars-staggered text-xl" />
              </button>
              
              {/* Central Premium Logo */}
              <BrandLogo size="md" />
            </div>
          ) : (
            <BrandLogo size="md" />
          )}

          {/* Connection check/Syncing status */}
          <div className="flex items-center gap-2">
            
            {user && isUserAdmin(user) && (
              <button
                onClick={tryAccessAdminPortal}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer font-sans text-[11px] font-bold ${
                  activeTab === 'admin-desk'
                    ? 'bg-purple-100 border-purple-300 text-purple-700 shadow-sm'
                    : 'bg-purple-50/50 border-purple-200 text-purple-600 hover:bg-purple-100'
                }`}
              >
                <i className="fa-solid fa-user-gear text-xs shrink-0 animate-pulse" />
                <span>⚙️ অ্যাডমিন প্যানেল</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => syncUserData()}
                disabled={syncing}
                title="Synchronize Data"
                className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">রিফ্রেশ করুন</span>
              </button>
            )}

            {/* Simple indicators */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-green-50 border border-green-200 text-[10px] font-bold text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 block animate-ping" />
              <span>সার্ভার সচল আছে</span>
            </div>

            {/* Profile Avatar Trigger on RHS header */}
            {user && (
              <button 
                onClick={() => setActiveTab('profile')}
                className="shrink-0 focus:outline-none transition-transform hover:scale-105 active:scale-95"
                title="Profile Settings"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    className="w-[36px] h-[36px] rounded-full object-cover border-2 border-blue-600 shadow-sm"
                    referrerPolicy="no-referrer"
                    alt="User avatar"
                  />
                ) : (
                  <div className="w-[36px] h-[36px] rounded-full bg-blue-100 text-blue-700 font-bold border-2 border-blue-600 flex items-center justify-center text-sm shadow-sm">
                    {user.username ? user.username.charAt(0).toUpperCase() : '👤'}
                  </div>
                )}
              </button>
            )}

          </div>

        </div>
      </header>

      {/* CENTRAL PLATFORM BODY LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 relative">
        {!user ? (
          /* Secure entry guard layout */
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        ) : user.is_suspended ? (
          /* Active User Account Suspension Notice */
          <div className="max-w-2xl mx-auto my-12 bg-red-950/20 border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-500/5 animate-pulse">
              <i className="fa-solid fa-triangle-exclamation text-4xl animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে!</h1>
              <p className="text-red-200/70 text-sm leading-relaxed font-sans">
                দুঃখিত, কোনো ভুল কাজ (Vul Kaj) জমা দেওয়ার কারণে অথবা কোম্পানির নীতিমালা ভঙ্গ করার কারণে আপনার অ্যাকাউন্টটি এডমিন কর্তৃক স্থগিত রাখা হয়েছে।
              </p>
            </div>

            <div className="bg-black/40 border border-red-500/15 p-5 rounded-2xl text-left text-xs text-gray-300 space-y-1.5 leading-normal font-sans">
              <span className="text-red-400 font-bold block mb-1">স্থগিতকরণের নিয়মাবলী ও সমাধানঃ</span>
              <p>১. ভুল বা ফেক জিমেইল, ফেসবুক বা সোশ্যাল একাউন্ট সেল সাবমিট করলে একাউন্ট পুনরায় সচল করতে জরিমানা হতে পারে।</p>
              <p>২. একাউন্ট আন-সাসপেন্ড করতে অথবা রিভিউর জন্য সরাসরি আমাদের অফিশিয়াল এডমিনের সাথে যোগাযোগ করুন।</p>
              <p className="pt-2 font-semibold">যোগাযোগ ইমেইলঃ <span className="text-cyan-400 font-mono select-all font-bold">songworld061@gmail.com</span></p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/10 flex items-center gap-2 cursor-pointer font-sans"
              >
                <i className="fa-solid fa-sign-out" />
                <span>লগ-আউট করুন</span>
              </button>
            </div>
          </div>
        ) : activeTab === 'admin-sell' ? (
          /* Separate custom page for Admin Account Selling */
          <div className="fade-in transition-all overflow-hidden mb-6">
            {/* Sync spinner bar */}
            {syncing && (
              <div className="mb-6 py-2 px-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-sans flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                <span>সার্ভার থেকে আপনার ডাটা লোড হচ্ছে... অনুগ্রহ করে একটু অপেক্ষা করুন।</span>
              </div>
            )}

            <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6 sm:p-8">
              <AdminAccountSeller
                user={user}
                wallet={wallet}
                onRefreshTrigger={() => syncUserData(true)}
                initialPlatform={selectedSellPlatform}
                onBack={() => {
                  setActiveTab('tasks');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        ) : activeTab === 'ad-work' ? (
          /* Separate custom page for Premium Video Ad watching */
          <div className="fade-in transition-all">
            {/* Sync spinner bar */}
            {syncing && (
              <div className="mb-6 py-2 px-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-sans flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                <span>সার্ভার থেকে আপনার ডাটা লোড হচ্ছে... অনুগ্রহ করে একটু অপেক্ষা করুন।</span>
              </div>
            )}

            <AdViewPage
              user={user}
              wallet={wallet}
              onRefreshTrigger={() => syncUserData(true)}
              onBack={() => {
                setActiveTab('tasks');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        ) : (
          /* Active User dashboard workspace layout */
          <div className="fade-in transition-all">
            
            {/* Sync spinner bar */}
            {syncing && (
              <div className="mb-6 py-2 px-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-sans flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                <span>সার্ভার থেকে আপনার ডাটা লোড হচ্ছে... অনুগ্রহ করে একটু অপেক্ষা করুন।</span>
              </div>
            )}

            {/* NEW BANNER CAROUSEL ILLUSTRATION WRAPPER */}
            <BannerSlider />

            {/* BENGALI ROLLING MARQUEE NOTICE BOARD */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl py-3 px-4 mb-6 flex items-center gap-3">
              <span className="shrink-0 bg-blue-100 text-blue-600 font-bold px-2.5 py-1 rounded-lg text-xs sm:text-xs">
                📢 নোটিশ:
              </span>
              <div className="flex-1 overflow-hidden">
                <marquee className="text-gray-700 text-xs sm:text-sm font-semibold" scrollamount="4">
                  আসসালামু আলাইকুম। সহজ আর্নিং ডিজিটাল বিজনেসে আপনাকে স্বাগতম! 🫶 টাস্ক ফিড থেকে প্রতিদিন সহজ ফ্রী কাজ সম্পন্ন করুন ও সরাসরি বিকাশ, নগদ বা রকেটে পেমেন্ট বুঝে নিন। যেকোনো নতুন আপডেট বা সহায়তার জন্য আমাদের অফিশিয়াল গ্রুপে জয়েন থাকুন। ধন্যবাদ! 🥰
                </marquee>
              </div>
            </div>

            {/* Part 1: Hero & Real-time Stats ledger variables */}
            <DashboardStats
              user={user}
              wallet={wallet}
              completedCount={completedTaskIds.length}
              onLogout={handleLogout}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
              onOpenDeveloperSetup={() => setIsDeveloperSetupOpen(true)}
            />

            {/* DYNAMIC CLIPBOARD COPIER REFER LINK CONTAINER */}
            <div className="bg-[#f0f7ff] border-2 border-dashed border-[#1877F2]/40 rounded-3xl p-6 mb-8 mt-5 relative overflow-hidden shadow-sm">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-[#1877F2]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-[#111] text-base font-sans">
                    <i className="fa-solid fa-gift text-blue-600 animate-bounce" />
                    <span>আপনার ফ্রী রেফারাল লিঙ্ক (Affiliate URL Link)</span>
                    <span className="bg-yellow-400 text-slate-950 font-sans text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full">৳ ২৫.০০ বোনাস</span>
                  </div>
                  <p className="text-gray-500 font-sans text-xs max-w-xl font-medium leading-relaxed">
                    আপনার রেফারেল লিঙ্কের মাধ্যমে নতুন ইউজার জয়েন করালেই প্রতি ভেরিফাইড একাউন্টে পাবেন সরাসরী <span className="text-green-600 font-extrabold font-mono">৳ ২৫.০০</span> বোনাস ও আজীবন ১০% কাজের কমিশন বোনাস!
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-stretch gap-2 bg-white p-1.5 rounded-2xl border border-gray-200">
                  <input 
                    type="text" 
                    value={`https://superearningbd.com/register.php?refer=${user.id.substring(0, 8).toUpperCase()}`} 
                    readOnly 
                    className="px-4 py-2 bg-transparent text-xs sm:text-xs font-mono text-blue-800 font-bold outline-none select-all w-full md:w-[260px]"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://superearningbd.com/register.php?refer=${user.id.substring(0, 8).toUpperCase()}`);
                      const Swal = (window as any).Swal;
                      if (Swal) {
                        Swal.fire({
                          toast: true,
                          position: 'top-end',
                          icon: 'success',
                          title: 'রেফার লিঙ্ক কপি হয়েছে!',
                          showConfirmButton: false,
                          timer: 1500
                        });
                      } else {
                        alert('Referral link copied successfully!');
                      }
                    }}
                    className="bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <i className="fa-regular fa-copy text-xs" />
                    <span>লিঙ্ক কপি করুন</span>
                  </button>
                </div>
              </div>
            </div>

            {/* HIGH-END INTERACTIVE MFS & SOCIAL PROJECTS BENTO-GRID */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] animate-ping" />
                    <h3 className="text-gray-900 font-extrabold text-base sm:text-lg">আমাদের ডিজিটাল প্রজেক্ট সমূহ (Our Projects)</h3>
                  </div>
                  <p className="text-gray-400 text-xs font-sans font-medium">নিচের যেকোনো প্রজেক্ট আইকনে ক্লিক করে সরাসরি কাজ বা সেবা উপভোগ করতে পারবেন।</p>
                </div>
                <span className="bg-blue-50 border border-blue-200 text-blue-700 font-bold font-sans text-[10px] px-3 py-1 rounded-full shrink-0">
                  ⚡ সচল প্রজেক্ট সংখ্যাঃ ২০ টি
                </span>
              </div>

              {/* Grid block */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                
                {/* 1. Mobile Recharge */}
                <button 
                  onClick={() => setActiveTab('income')}
                  className="bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-mobile-screen-button" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">মোবাইল রিচার্জ</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">পেমেন্ট মেথড সরাসরি</span>
                </button>

                {/* 2. Drive Offer */}
                <button 
                  onClick={() => setActiveTab('marketplace')}
                  className="bg-white border border-gray-100 hover:border-purple-200 hover:bg-purple-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-box-open" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">ড্রাইভ অফার</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">জিপি, রবি, বাংলালিংক</span>
                </button>

                {/* 3. Micro Jobs */}
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className="bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-briefcase" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">মাইক্রো জব (Micro Job)</span>
                  <span className="text-[9px] text-green-600 font-extrabold font-sans mt-1">৳ ১০.০০ বোনাস সহ</span>
                </button>

                {/* 4. Job Post */}
                <button 
                  onClick={() => setActiveProjModal('job_post')}
                  className="bg-white border border-gray-100 hover:border-orange-200 hover:bg-orange-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-address-card" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">জব পোস্ট করুন</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">মেম্বার নিয়োগ দিন</span>
                </button>

                {/* 5. Gmail Sale */}
                <button 
                  onClick={() => {
                    setSelectedSellPlatform('gmail');
                    setActiveTab('admin-sell');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-gray-100 hover:border-red-200 hover:bg-red-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-envelope" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">জিমেইল সেল দিন</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">৳ ১৫.০০ থেকে ৳ ২৫.০০</span>
                </button>

                {/* 6. Facebook Sale */}
                <button 
                  onClick={() => {
                    setSelectedSellPlatform('fb');
                    setActiveTab('admin-sell');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-brands fa-facebook-f" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">ফেসবুক একাউন্ট সেল</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">অ্যাক্টিভ ওল্ড প্রোফাইল</span>
                </button>

                {/* 7. Instagram Sale */}
                <button 
                  onClick={() => {
                    setSelectedSellPlatform('insta');
                    setActiveTab('admin-sell');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-gray-100 hover:border-pink-200 hover:bg-pink-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-brands fa-instagram" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">ইনস্টাগ্রাম অ্যাকাউন্ট</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">ইনস্ট্যান্ট এডমিন ডিল</span>
                </button>

                {/* 8. TikTok ID Sale */}
                <button 
                  onClick={() => {
                    setSelectedSellPlatform('insta');
                    setActiveTab('admin-sell');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-gray-100 text-black flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-brands fa-tiktok" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">টিকটক আইডি সেল</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">BD অরগানিক ফলোয়ারস</span>
                </button>

                {/* 9. Facebook Cookies */}
                <button 
                  onClick={() => setActiveTab('marketplace')}
                  className="bg-white border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-cookie" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">ফেসবুক কুকিজ শপ</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">অটোমেটেড ডাউনলোড মেথড</span>
                </button>

                {/* 10. Instagram Cookies */}
                <button 
                  onClick={() => setActiveTab('marketplace')}
                  className="bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-cookie-bite" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">ইনস্টাগ্রাম কুকিজ</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">ফাইল কুকিজ ডট টেক্সট</span>
                </button>

                {/* 11. Digital Services */}
                <button 
                  onClick={() => setActiveTab('marketplace')}
                  className="bg-white border border-gray-100 hover:border-amber-200 hover:bg-amber-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                     <i className="fa-solid fa-gears" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">ডিজিটাল সার্ভিস</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">সোশ্যাল ফলোয়ার, সাবস্ক্রাইব</span>
                </button>

                {/* 12. Premium Apps */}
                <button 
                  onClick={() => setActiveTab('marketplace')}
                  className="bg-white border border-gray-100 hover:border-yellow-300 hover:bg-yellow-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-gem" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">প্রিমিয়ার একাউন্ট এপ্স</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">ক্যানভা প্র প্রো পাইনাকি</span>
                </button>

                {/* 13. Typing Job (REAL PLAYABLE CHALLENGE) */}
                <button 
                  onClick={() => {
                    setTypingMessage('');
                    setTypingInput('');
                    setActiveProjModal('typing');
                  }}
                  className="bg-white border-2 border-green-200 hover:border-green-300 hover:bg-green-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <span className="absolute top-2 right-2 bg-green-500 text-white font-sans text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full select-none animate-pulse">
                    ৳ ০.৫০ আয়
                  </span>
                  <div className="w-11 h-11 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-keyboard" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">টাইপিং জব</span>
                  <span className="text-[9px] text-green-600 font-bold font-sans mt-1">স্পিড চ্যালেঞ্জ টাইপিং</span>
                </button>

                {/* 14. Ad View (REAL PAYING PROGRESS VIDEO) */}
                <button 
                  onClick={() => {
                    setActiveTab('ad-work');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <span className="absolute top-2 right-2 bg-indigo-500 text-white font-sans text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full select-none animate-pulse">
                    ৳ ০.৩০ আয়
                  </span>
                  <div className="w-11 h-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-eye" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">বিজ্ঞাপন দেখে আয়</span>
                  <span className="text-[9px] text-indigo-600 font-bold font-sans mt-1">৫ সেকেন্ড বিজ্ঞাপন দেখুন</span>
                </button>

                {/* 15. Target Bonus */}
                <button 
                  onClick={() => setActiveProjModal('monthly_salary')}
                  className="bg-white border border-gray-100 hover:border-amber-200 hover:bg-amber-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-100/50 text-yellow-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-star" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">টার্গেট বোনাস</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">মাসিক কাজের টার্গেট লিষ্ট</span>
                </button>

                {/* 16. Gift Code Redemption */}
                <button 
                  onClick={() => {
                    setPromoStatus(null);
                    setPromoCodeInput('');
                    setActiveProjModal('gift');
                  }}
                  className="bg-white border border-dashed border-red-300 hover:border-red-400 hover:bg-red-50/5 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative animate-pulse"
                >
                  <span className="absolute top-2 right-2 bg-red-500 text-white font-sans text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full select-none">
                    কোড: SUPER50
                  </span>
                  <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-gift" />
                  </div>
                  <span className="text-xs font-extrabold text-red-600 leading-snug">উপহার কোড (Gift Code)</span>
                  <span className="text-[9px] text-gray-500 font-bold font-sans mt-1">৳ ৫০.০০ ইনস্ট্যান্ট বোনাস</span>
                </button>

                {/* 17. Update Feed */}
                <button 
                  onClick={() => setActiveProjModal('updates')}
                  className="bg-white border border-gray-100 hover:border-teal-200 hover:bg-teal-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-bell" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">নথিভুক্তি ও আপডেট</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">আজকের নোটিফিকেশন</span>
                </button>

                {/* 18. Monthly Salary */}
                <button 
                  onClick={() => setActiveProjModal('monthly_salary')}
                  className="bg-white border border-gray-100 hover:border-lime-200 hover:bg-lime-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-lime-50 text-lime-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-money-check-dollar" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">মাসিক স্যালারি ফিড</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">১ম শ্রেনী সুপার মেম্বার্স</span>
                </button>

                {/* 19. Leadership Level info */}
                <button 
                  onClick={() => setActiveProjModal('leadership')}
                  className="bg-white border border-gray-100 hover:border-amber-200 hover:bg-amber-50/10 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-users-gear" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">নেতৃত্ব (Leadership)</span>
                  <span className="text-[9px] text-gray-400 font-sans mt-1">১০% রেফারেল কমিশন</span>
                </button>

                {/* 20. Leader Board ranking list */}
                <button 
                  onClick={() => setActiveProjModal('leader_board')}
                  className="bg-white border border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50/5 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer group relative animate-pulse"
                >
                  <div className="w-11 h-11 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-105 transition-transform animate-spin" style={{ animationDuration: '8s' }}>
                    <i className="fa-solid fa-trophy" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 leading-snug">লিডার বোর্ড (Leader Board)</span>
                  <span className="text-[9px] text-yellow-700 font-extrabold font-sans mt-1">সেরা ১0 জন টপ আর্নার্স</span>
                </button>

              </div>
            </div>

            {/* OUR PROJECTS & SUPPORT CHANNELS BENTO GRID */}
            <div className="bg-white border border-gray-200/80 shadow-sm rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                <i className="fa-solid fa-share-nodes text-blue-600 text-lg" />
                <h3 className="text-gray-900 font-extrabold text-sm sm:text-base">আমাদের অফিশিয়াল সোশ্যাল মিডিয়া ও সাহায্য কেন্দ্র</h3>
              </div>
              
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                <a 
                  href="https://www.facebook.com/share/g/1DeMnJBhMy/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 bg-blue-50/35 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-brands fa-facebook-f" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">ফেসবুক গ্রুপ</span>
                </a>

                <a 
                  href="https://www.facebook.com/share/18ZVF9P69q/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 bg-blue-50/35 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-brands fa-facebook" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">ফেসবুক পেজ</span>
                </a>

                <a 
                  href="https://youtube.com/@superearningbd_official" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 bg-red-50 hover:bg-red-100/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-brands fa-youtube" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">ইউটিউব চ্যানেল</span>
                </a>

                <a 
                  href="https://t.me/superearningbd_Official" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 bg-cyan-50 hover:bg-cyan-100/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-brands fa-telegram" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">টেলিগ্রাম চ্যানেল</span>
                </a>

                <a 
                  href="https://chat.whatsapp.com/HiIQM1m8yPdAQSai1SDCfG" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 bg-green-50 hover:bg-green-100/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-brands fa-whatsapp" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">হোয়াটসঅ্যাপ সাপোর্ট</span>
                </a>

                <button 
                  onClick={() => {
                    const cb = document.getElementById('chatbot-toggle-trigger');
                    if (cb) cb.click();
                    else alert("সহায়তার জন্য নিচে ডান পাশের চ্যাটবট আইকনে ক্লিক করুন!");
                  }}
                  className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100 bg-amber-50 hover:bg-amber-100/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-headset" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">লাইভ সাপোর্ট</span>
                </button>
              </div>
            </div>


            {/* Part 2: Active Tab View Switcher with Account Lock Guard for Tasks */}
            {activeTab !== 'tasks' && (
              <div className="mb-6 flex items-center justify-between bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm animate-fade-in">
                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 hover:bg-gray-100 text-gray-700 hover:text-blue-600 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-100 transition-all cursor-pointer select-none font-sans bg-gray-50"
                >
                  <i className="fa-solid fa-arrow-left text-xs text-gray-500" />
                  <span>হোম ড্যাশবোর্ডে ফিরে যান (Back to Home)</span>
                </button>
                <div className="bg-blue-50 text-blue-750 text-xs sm:text-xs font-black font-sans px-3.5 py-1.5 rounded-xl border border-blue-105">
                  {activeTab === 'marketplace' ? '🛒 অ্যাকাউন্ট শপ' : 
                   activeTab === 'referrals' ? '👥 রেফার ও ভেরিফাই' : 
                   activeTab === 'income' ? '💸 টাকা উত্তোলন' : 
                   activeTab === 'profile' ? '👤 আমার প্রোফাইল' : 
                   activeTab === 'admin-desk' ? '⚙️ এডমিন প্যানেল' : '📄 অতিরিক্ত পেজ'}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && !user.is_verified ? (
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center max-w-2xl mx-auto my-12 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500" />
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 shadow-inner border border-amber-100 animate-bounce">
                  <i className="fa-solid fa-lock" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">কাজের লিস্ট লক করা আছে 🔒</h3>
                <h4 className="text-amber-600 font-extrabold text-xs sm:text-sm mb-4 bg-amber-50 rounded-xl px-4 py-2 inline-block border border-amber-100 font-sans">
                  আপনার অ্যাকাউন্টটি সচল বা ভেরিফাইড করা হয়নি!
                </h4>
                
                <p className="text-gray-600 font-semibold text-xs sm:text-xs leading-relaxed max-w-md mx-auto mb-6">
                  সহজ মেম্বারসদের এন্টি-চিট পলিসি এবং রিয়েল ইউজার নিশ্চিত করতে, টাস্ক সম্পন্ন করে সরাসরি বিকাশ/নগদে ১০০% পেমেন্ট নিতে প্রথমে আপনার অ্যাকাউন্টটি মাত্র <span className="text-red-500 font-black font-sans text-base">১০০.০০ টাকা</span> দিয়ে চিরদিনের জন্য ভেরিফাই করে নিন।
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-left space-y-1.5">
                  <span className="font-extrabold text-blue-900 text-xs sm:text-xs block border-b border-blue-200 pb-1">ভেরিভাইড আইডির এক্সক্লুসিভ সুবিধাসมূহঃ</span>
                  <ul className="text-xs text-blue-800 font-semibold leading-relaxed space-y-1 pl-1 list-disc list-inside">
                    <li>প্রতিটি মাইক্রোজব সঠিকভাবে সাবমিট করতে পারবেন।</li>
                    <li>অ্যাকাউন্ট ভেরিফাই বোনাস ইনস্ট্যান্ট ওয়ালেটে যুক্ত হবে।</li>
                    <li>বিকাশ অথবা নগদ মেথডে সর্বোচ্চ ৫ মিনিটে নিশ্চিত ক্যাশআউট।</li>
                    <li>রেফারাল লিঙ্কের মাধ্যমে আজীবন ১০% আনলিমিটেড টাস্ক কমিশন।</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setActiveTab('referrals')}
                    className="px-6 py-3.5 bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs sm:text-xs rounded-xl shadow-lg shadow-blue-100 cursor-pointer active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-shield-check text-xs" />
                    <span>এখুনি অ্যাকাউন্ট ভেরিফাই করুন (Verify Now)</span>
                  </button>
                </div>
              </div>
            ) : activeTab === 'tasks' ? (
              <TaskSystem
                user={user}
                tasks={tasks}
                completedTaskIds={completedTaskIds}
                onTaskComplete={handleTaskComplete}
              />
            ) : null}

            {activeTab === 'marketplace' && (
              <AccountMarketplace
                user={user}
                wallet={wallet}
                onPurchaseSuccess={(walletUpdated) => setWallet(walletUpdated)}
                onRefreshTrigger={() => syncUserData(true)}
              />
            )}

            {activeTab === 'referrals' && (
              <VerificationAndAffiliate
                user={user}
                wallet={wallet}
                onVerificationSuccess={handleVerificationSuccess}
              />
            )}

            {activeTab === 'admin-desk' && isUserAdmin(user) && (
              <AdminPanel
                onRefreshTrigger={() => syncUserData(true)}
              />
            )}

            {activeTab === 'income' && (
              <div className="space-y-8 animate-fade-in">
                <CashoutEngine
                  wallet={wallet}
                  withdrawals={withdrawals}
                  onRequestWithdraw={handleWithdrawalRequest}
                />
                <TransactionLedger
                  transactions={transactions}
                  withdrawals={withdrawals}
                  onRefresh={() => syncUserData(false)}
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileSystem
                user={user}
                onProfileUpdate={(updatedUser) => {
                  setUser(updatedUser);
                  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
                }}
              />
            )}

          </div>
        )}
      </main>

      {/* MODALS GATEWAYS */}
      {isUpgradeOpen && user && (
        <MembershipUpgrade
          currentLevel={user.membership_level}
          wallet={wallet}
          onUpgrade={handleMembershipUpgrade}
          onClose={() => setIsUpgradeOpen(false)}
        />
      )}

      {isDeveloperSetupOpen && (
        <SupabaseSetupInfo
          onClose={() => setIsDeveloperSetupOpen(false)}
        />
      )}

      {/* STICKY BOTTOM NAVIGATION FOR MOBILE USERS */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-3 flex justify-around items-center z-50 rounded-t-2xl shadow-[0_-8px_25px_rgba(0,0,0,0.08)]">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'tasks' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === 'tasks' ? 'bg-blue-50' : 'bg-transparent'}`}>
              <i className="fa-solid fa-layer-group text-lg" />
            </div>
            <span className="text-[10px] font-bold">কাজের লিস্ট</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'marketplace' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === 'marketplace' ? 'bg-blue-50' : 'bg-transparent'}`}>
              <i className="fa-solid fa-shop text-lg" />
            </div>
            <span className="text-[10px] font-bold">মার্কেট</span>
          </button>

          <button 
            onClick={() => setActiveTab('income')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'income' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === 'income' ? 'bg-blue-50' : 'bg-transparent'}`}>
              <i className="fa-solid fa-wallet text-lg" />
            </div>
            <span className="text-[10px] font-bold">উত্তোলন</span>
          </button>

          <button 
            onClick={() => setActiveTab('referrals')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'referrals' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === 'referrals' ? 'bg-blue-50' : 'bg-transparent'}`}>
              <i className="fa-solid fa-user-plus text-lg" />
            </div>
            <span className="text-[10px] font-bold">রেফার</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'profile' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === 'profile' ? 'bg-blue-50' : 'bg-transparent'}`}>
              <i className="fa-solid fa-user-circle text-lg" />
            </div>
            <span className="text-[10px] font-bold">প্রোফাইল</span>
          </button>
        </div>
      )}

      {/* SECURE SYSTEM FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 shrink-0 pb-24 lg:pb-6 text-gray-500 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-gray-800">© 2026 Easy Earning BD. All rights reserved.</p>
            <p className="text-[10px] text-gray-400 mt-1">স্বল্প সময়ে সহজ কাজ করে পেমেন্ট নেওয়ার জন্য বাংলাদেশের নির্ভরযোগ্য বিশ্বস্ত প্ল্যাটফর্ম।</p>
          </div>
          
          <div className="flex gap-4 items-center text-xs font-semibold">
            <span className="hover:text-blue-600 transition-all cursor-pointer">টাস্ক রুলস</span>
            <span>•</span>
            <span className="hover:text-blue-600 transition-all cursor-pointer">গাইডলাইনস</span>
            <span>•</span>
            <button
              onClick={() => setIsDeveloperSetupOpen(true)}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Developer Portal (DDL)
            </button>
          </div>
        </div>
      </footer>

      {/* MULTIPLEX INTERACTIVE PROJECTS MODAL OVERLAYS */}
      {activeProjModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-100 shadow-2xl relative animate-fade-in my-8">
            <button 
              onClick={() => {
                setActiveProjModal(null);
                setTypingMessage('');
                setPromoStatus(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-all text-lg cursor-pointer"
            >
              <i className="fa-solid fa-circle-xmark text-2xl" />
            </button>

            <div className="mt-2">
              
              {/* CONTENT 1: TYPING JOB */}
              {activeProjModal === 'typing' && (
                <div className="space-y-4 font-sans">
                  <div className="text-center space-y-1">
                    <span className="bg-green-100 text-green-700 font-extrabold text-[10px] uppercase font-sans tracking-widest px-3 py-1 rounded-full">টাইপিং স্পিড চ্যালেঞ্জ ⌨️</span>
                    <h4 className="text-gray-900 font-black text-lg sm:text-xl">নিচের লেখাটি হুবহু টাইপ করুন</h4>
                    <p className="text-xs text-gray-400 font-medium font-sans">প্রতিটি সঠিক টাইপিং এ পাবেন ৳ ০.৫০ টাকা ইনস্ট্যান্ট ব্যালেন্স বোনাস।</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center space-y-2">
                    <span className="text-gray-400 text-[10px] font-bold block tracking-widest uppercase">টার্গেট টেক্সট</span>
                    <p className="text-gray-800 font-black tracking-wider text-lg font-mono bg-white p-3 rounded-xl border border-gray-200 inline-block shadow-sm select-none">{typingTarget}</p>
                  </div>

                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={typingInput}
                      onChange={(e) => setTypingInput(e.target.value)}
                      placeholder="এখানে টার্গেট কথাটি ডাবল চেক করে টাইপ করুন..."
                      className="w-full border-2 border-green-200 outline-none p-3.5 rounded-2xl text-center font-mono font-bold text-gray-800 text-sm focus:border-green-500 uppercase transition-all"
                    />

                    {typingMessage && (
                      <p className={`text-center font-extrabold text-xs sm:text-xs py-1 ${typingMessage.includes('❌') ? 'text-red-500' : 'text-green-600 animate-bounce'}`}>
                        {typingMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button 
                      onClick={handleTypeJobSubmit}
                      className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-green-100 cursor-pointer text-center"
                    >
                      সাবমিট চ্যালেঞ্জ (Submit)
                    </button>
                    <button 
                      onClick={() => {
                        const words = ['TRUSTED EARNING', 'MOBILE RECHARGE', 'EASY INCOME BDT', 'SUPER ACTIVE USER', 'VIP MEMBRS ONLY'];
                        const nextWord = words[Math.floor(Math.random() * words.length)];
                        setTypingTarget(nextWord);
                        setTypingInput('');
                        setTypingMessage('');
                      }}
                      className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      লেখা পরিবর্তন
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <span className="text-[10px] text-gray-400 font-semibold font-sans">আজকের অবশিষ্ট ফ্রী টাইপিং ক্লিয়ার সীট: {typingChances}/৫ বার</span>
                  </div>
                </div>
              )}

              {/* CONTENT 2: AD VIEW */}
              {activeProjModal === 'ad_view' && (
                <div className="space-y-5 font-sans text-center">
                  <div className="space-y-1">
                    <span className="bg-indigo-100 text-indigo-700 font-extrabold text-[10px] uppercase font-sans tracking-widest px-3 py-1 rounded-full">স্পন্সর ভিডিও অ্যাড 📺</span>
                    <h4 className="text-gray-900 font-black text-lg sm:text-xl">বিজ্ঞাপন দেখে নিশ্চিত টাকা আয়</h4>
                    <p className="text-xs text-gray-400 font-medium font-sans">নিচের "বিজ্ঞাপন লোড করুন" বাটনে ক্লিক করে ৫ সেকেন্ড সম্পূর্ণ দেখুন।</p>
                  </div>

                  <div className="bg-slate-900 aspect-video rounded-3xl flex flex-col items-center justify-center p-6 text-white relative overflow-hidden border border-slate-800 shadow-inner">
                    {adPlaying ? (
                      <div className="space-y-4 z-10">
                        <div className="relative w-20 h-20 mx-auto">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-700" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-indigo-500" strokeWidth="2.5" strokeDasharray={`${(adTimeLeft / 5) * 100}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-xl text-indigo-400">
                            {adTimeLeft}s
                          </div>
                        </div>
                        <p className="text-xs text-indigo-200 font-bold tracking-wide animate-pulse">বিজ্ঞাপন বোনাস প্রসেস হচ্ছে, শেষ পর্যন্ত অপেক্ষা করুন...</p>
                      </div>
                    ) : (
                      <div className="space-y-3 z-10 p-4">
                        <i className="fa-solid fa-clapperboard text-indigo-400 text-4xl animate-bounce" />
                        <p className="text-xs text-slate-300 font-semibold leading-relaxed">স্পন্সর বিজ্ঞাপন এখন দেখার জন্য প্রস্তুত আছে। ৫ সেকেন্ড দেখলে পাবেন ৳ ০.২৫ ইনস্ট্যান্ট ওয়ালেট বোনাস।</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  </div>

                  <button 
                    onClick={startAdViewingGame}
                    disabled={adPlaying}
                    className={`w-full py-3.5 font-extrabold text-xs rounded-xl shadow-lg transition-all text-center flex justify-center items-center gap-1.5 cursor-pointer ${adPlaying ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'}`}
                  >
                    <i className="fa-solid fa-play text-xs" />
                    <span>অ্যাড লোড ও চালু করুন (Start Video Ad)</span>
                  </button>
                </div>
              )}

              {/* CONTENT 3: GIFT CODE REDEMPTION */}
              {activeProjModal === 'gift' && (
                <div className="space-y-4 font-sans">
                  <div className="text-center space-y-1">
                    <span className="bg-red-100 text-red-600 font-extrabold text-[10px] uppercase font-sans tracking-widest px-3 py-1 rounded-full">লিমিটেড উপহার কুপন 🎁</span>
                    <h4 className="text-gray-900 font-black text-lg sm:text-xl">গিফট কোড কুপন সাবমিট</h4>
                    <p className="text-xs text-gray-400 font-medium font-sans">অফিশিয়াল গ্রুপ থেকে আপনার সংগৃহীত উপহার বা প্রমো কোড সাবমিট করুন।</p>
                  </div>

                  <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-center">
                    <p className="text-xs text-red-700 font-extrabold leading-relaxed">
                      💡 সুপার আপডেট: আজ আপনি ফ্রী ১০০% অ্যাক্টিভ প্রোমো কোড <span className="font-mono bg-white border border-red-200 px-2.5 py-1 text-sm rounded-lg text-red-600 tracking-wider">SUPER50</span> ব্যবহার করে তখনি ৳ ৫০.০০ পেতে পারেন!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="এখানে গিফট কোড টাইপ করুন (উদাঃ SUPER50)..."
                      className="w-full border-2 border-red-200 outline-none p-3.5 rounded-2xl text-center font-mono font-bold text-gray-800 text-sm focus:border-red-500 uppercase tracking-widest transition-all"
                    />

                    {promoStatus && (
                      <p className={`text-center font-bold text-xs ${promoStatus.error ? 'text-red-500' : 'text-green-600 animate-bounce'}`}>
                        {promoStatus.error || promoStatus.success}
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={submitPromoCouponCode}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-100 cursor-pointer text-center"
                  >
                    কোড ভেরিফাই ও রিডিম করুন (Redeem Code)
                  </button>
                </div>
              )}

              {/* CONTENT 4: UPDATE FEED NOTIFICATION */}
              {activeProjModal === 'updates' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="text-center">
                    <span className="bg-teal-100 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">আজকের খবরাখবর ও নোটিফিকেশন 📢</span>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 leading-relaxed">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-[10px] text-gray-400 font-mono font-bold block">আজ সকাল ০৯:৩০ • সিস্টেম অ্যাডমিন</span>
                      <h5 className="font-extrabold text-gray-900 text-xs sm:text-xs">✅ ১ মিনিটে ইনস্ট্যান্ট ক্যাশআউট সুবিধা চালু করা হয়েছেঃ</h5>
                      <p className="text-gray-500 font-semibold text-xs leading-normal">
                        মেম্বারসদের পেমেন্ট রিকোয়েস্ট সফল করতে আমাদের অটোমেটিক গেটওয়ে আপডেট করা হয়েছে। এখন উইথড্র রিকোয়েস্ট সাবমিটের পর ১ মিনিটের ভেতর নগদ বা বিকাশে ইনস্ট্যান্ট পেমেন্ট ঢুকে যাবে।
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-[10px] text-gray-400 font-mono font-bold block">গতকাল বিকাল ০৪:১০ • সাপোর্ট ডেস্ক</span>
                      <h5 className="font-extrabold text-gray-900 text-xs sm:text-xs">🤝 রেফার বোনাস ও MLM ১০% আজীবন কমিশন কমিশনঃ</h5>
                      <p className="text-gray-500 font-semibold text-xs leading-normal">
                        আপনার রেফারেল নেটওয়ার্ক বৃদ্ধি করতে চেষ্টা করুন! প্রতি সফল ভেরিফাইড মেম্বারস রেফারে পাবেন সরাসরি ৳ ২৫.০০ টাকা ও আজীবন সে কাজ করলে ১০% ফিক্সড কমিশন বোনাস।
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveProjModal(null)}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl text-center cursor-pointer shadow-md shadow-teal-100"
                  >
                    বুঝেছি, ধন্যবাদ
                  </button>
                </div>
              )}

              {/* CONTENT 5: MONTHLY SALARY SUMMARY */}
              {activeProjModal === 'monthly_salary' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="text-center">
                    <span className="bg-lime-100 text-lime-700 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">মেম্বার মাসিক স্যালারি ও ফিক্সড প্রফিট 💸</span>
                  </div>

                  <div className="bg-lime-50/50 p-4 rounded-2xl border border-lime-100 space-y-3">
                    <p className="font-extrabold text-lime-950 text-center leading-relaxed">
                      আপনি কি আমাদের সহজ আর্নিং এ একটি ফিক্সড মাসিক স্যালারি অফার চালু করতে চান? 
                    </p>

                    <div className="space-y-2 text-lime-900 leading-normal font-semibold">
                      <p>১. প্রতি মাসে মিনিমাম ৫০ টি সফল রেফার নিশ্চিত করতে পারলে ১লা তারিখে পাবেন ৳ ৫,০০০.০০ ফিক্সড স্যালারি।</p>
                      <p>২. অ্যাডমিন লাইনে স্পেশাল লিডারশিপ ব্যাক অফিস সাপোর্ট ও স্যালারি বোনাস বোনাস অফার গ্রান্টেড।</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                    <span className="font-bold text-gray-700 block">আপনার এই মাসের অগ্রগতির গ্রাফঃ</span>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-lime-500 h-full rounded-full" style={{ width: '25%' }} />
                    </div>
                    <div className="flex justify-between font-mono font-semibold text-[10px] text-gray-400">
                      <span>অগ্রগতি: ২৫%</span>
                      <span>২৫ টি সম্পন্ন / ১০০ টার্গেট</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveProjModal(null)}
                    className="w-full py-3 bg-lime-600 hover:bg-lime-700 text-white font-extrabold text-xs rounded-xl text-center cursor-pointer shadow-md shadow-lime-100"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              )}

              {/* CONTENT 6: LEADERSHIP LEVEL */}
              {activeProjModal === 'leadership' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-blue-50 text-blue-900 p-4 rounded-2xl flex items-start gap-2.5 border border-blue-100">
                    <i className="fa-solid fa-users text-lg mt-1 filter drop-shadow-sm text-blue-600 font-black animate-pulse" />
                    <div>
                      <h5 className="font-extrabold text-blue-950 text-sm mb-1">ফ্রিল্যান্সিং লিডারশিপ প্রজেক্ট</h5>
                      <p className="text-blue-900 leading-normal font-semibold">
                        সহজ আর্নিং মেম্বারদের জন্য রয়েছে সুপার লিডারশিপ সুবিধা। একটি ছোট টিম গঠন করার মাধ্যমে আপনি হাজার হাজার মানুষের কাজের আজীবন ১০% কমিশন ফিক্সড করে নিতে পারেন।
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 p-2">
                    <p className="font-extrabold text-gray-900">গাইডলাইন এবং প্রধান সুবিধাঃ</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 font-semibold leading-relaxed">
                      <li>সহজ মাইক্রোজবগুলো সঠিকভাবে করতে সাহায্য করুন।</li>
                      <li>উইথড্র করার রিকোয়েস্ট সাথে সাথে ইনস্ট্যান্ট পেমেন্ট ১ মিনিটে।</li>
                      <li>প্রতি মাসে ফিক্সড বোনাস অফার ও অফিস সাপোর্ট।</li>
                      <li>সুপার ইমার্জেন্সি লাইভ হেল্প ডেক্স সুবিধা সর্বক্ষণ।</li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => setActiveProjModal(null)}
                    className="w-full py-3 bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl"
                  >
                    লিডারশিপের জন্য আবেদন করুন
                  </button>
                </div>
              )}

              {/* CONTENT 7: REAL STANDINGS LEADERBOARD */}
              {activeProjModal === 'leader_board' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="text-center">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">টপ সাপ্তাহিক আর্নার্স লিস্ট (Top 10 Rankings)</span>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm font-sans text-xs">
                    <div className="bg-gradient-to-r from-[#1877F2] to-[#0052D4] text-white p-3 flex justify-between font-extrabold">
                      <span className="w-12 text-center">র‍্যাংক</span>
                      <span className="flex-1 pl-2">ইউজার নেম (Username)</span>
                      <span className="w-24 text-right">মোট ইনকাম (BDT)</span>
                    </div>

                    <div className="divide-y divide-gray-100 font-medium font-sans">
                      <div className="p-2.5 flex justify-between items-center bg-yellow-50/40">
                        <span className="w-12 text-center font-black text-yellow-600 text-sm">🥇 1</span>
                        <span className="flex-1 pl-2 font-extrabold text-gray-900 flex items-center gap-1">Emon Sheikh Sheikh <i className="fa-solid fa-circle-check text-blue-500 text-[10px]" /></span>
                        <span className="w-24 text-right font-mono font-bold text-green-600">৳ ৫২,৩০০.০০ BDT</span>
                      </div>
                      <div className="p-2.5 flex justify-between items-center bg-gray-50/50">
                        <span className="w-12 text-center font-black text-gray-400 text-sm">🥈 2</span>
                        <span className="flex-1 pl-2 font-extrabold text-gray-800">Shakil Khan BD</span>
                        <span className="w-24 text-right font-mono font-bold text-green-600">৳ ২৮,৯০০.০০ BDT</span>
                      </div>
                      <div className="p-2.5 flex justify-between items-center">
                        <span className="w-12 text-center font-black text-orange-500 text-sm">🥉 3</span>
                        <span className="flex-1 pl-2 font-extrabold text-gray-800">Jannat Mim Nila</span>
                        <span className="w-24 text-right font-mono font-bold text-green-600">৳ ১৯,৪৫০.০০ BDT</span>
                      </div>
                      <div className="p-2.5 flex justify-between items-center">
                        <span className="w-12 text-center font-bold text-gray-400">4</span>
                        <span className="flex-1 pl-2 text-gray-700">Faisal Alam (Robi)</span>
                        <span className="w-24 text-right font-mono font-bold text-gray-600">৳ ১২,৮০০.০০ BDT</span>
                      </div>
                      <div className="p-2.5 flex justify-between items-center">
                        <span className="w-12 text-center font-bold text-gray-400">5</span>
                        <span className="flex-1 pl-2 text-gray-700">Tanzila Rahman Mim</span>
                        <span className="w-24 text-right font-mono font-bold text-gray-600">৳ ৯,৩৫০.০০ BDT</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveProjModal(null)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              )}

              {/* CONTENT 8: JOB POST REGULATIONS */}
              {activeProjModal === 'job_post' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-orange-50 text-orange-800 p-4 rounded-2xl flex items-start gap-2.5 border border-orange-100">
                    <i className="fa-solid fa-address-card text-base mt-2 filter drop-shadow-sm text-orange-600" />
                    <div>
                      <h5 className="font-extrabold text-orange-950 text-sm mb-1">মাইক্রো জব পোস্ট করার নিয়মাবলী</h5>
                      <p className="text-orange-900 leading-normal font-semibold">
                        আপনি যদি আমাদের প্ল্যাটফর্মের হাজার হাজার সচল মেম্বার্সদের দিয়ে আপনার নিজের কাজ করিয়ে নিতে চান (যেমন: ইউটিউব সাবস্ক্রাইব, ফেসবুক ফলো, রিভিও ও জিমেইল অ্যাকাউন্ট বা সাইন-আপ), তাহলে খুব সহজেই সস্তা রেটে কাজ পোস্ট করতে পারবেন।
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 p-2 leading-relaxed">
                    <p className="font-extrabold text-gray-900">কিভাবে কাজ সাবমিট বা পোস্ট করবেনঃ</p>
                    <p className="text-gray-600 font-semibold">১. আমাদের অফিশিয়াল ফেসবুক পেজ অথবা এডমিন টেলিগ্রাম লাইভে কাজটির বর্ণনা, লিঙ্ক এবং বাজেট লিখে পাঠান।</p>
                    <p className="text-gray-600 font-semibold">২. এডমিন আপনার কাজের রিকোয়েস্ট রিভিউ করে ইনস্ট্যান্টলি কাজের লিস্টে টাস্ক হিসেবে পাবলিশ করে দিবেন।</p>
                    <p className="text-gray-600 font-semibold">৩. পেমেন্ট আপনি বিকাশ, নগদ অথবা ওয়ালেট ফান্ড ব্যালেন্সের মাধ্যমে নিষ্পত্তি করতে পারবেন।</p>
                  </div>

                  <a 
                    href="https://t.me/superearningbd_Official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl text-center flex justify-center items-center gap-1.5 cursor-pointer hover:no-underline"
                  >
                    <i className="fa-brands fa-telegram text-sm" />
                    <span>সরাসরি এডমিন সাপোর্ট সেন্টারে কথা বলুন</span>
                  </a>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {user && <ChatbotWidget />}

    </div>
  );
}
