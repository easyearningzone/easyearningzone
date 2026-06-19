import { useState, useEffect, useRef } from 'react';
import { Task, User } from '../types';

interface TaskSystemProps {
  user: User;
  tasks: Task[];
  completedTaskIds: string[];
  onTaskComplete: (taskId: string, reward: number) => Promise<void>;
}

export default function TaskSystem({ user, tasks, completedTaskIds, onTaskComplete }: TaskSystemProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [hasVisited, setHasVisited] = useState<boolean>(false);
  const [successAnimation, setSuccessAnimation] = useState<boolean>(false);
  const [creditedAmount, setCreditedAmount] = useState<number>(0);
  const [warningMessage, setWarningMessage] = useState<string>('');
  
  // Screenshot and proof upload state
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Safely trigger SweetAlert alerts
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

  // multiplier for premium account tiers
  const getMultiplier = () => {
    switch (user.membership_level) {
      case 'Silver': return 1.2;
      case 'Gold': return 1.5;
      case 'Platinum': return 2.0;
      default: return 1.0;
    }
  };

  const getAdjustedReward = (baseReward: number) => {
    return Number((baseReward * getMultiplier()).toFixed(2));
  };

  // Launch task
  const startTask = (task: Task) => {
    if (!user.is_verified) {
      fireAlert('অ্যাকাউন্ট ভেরিফিকেশন প্রয়োজন 🔐', 'টাস্ক সম্পন্ন করতে এবং বোনাস টাকা উইথড্র করতে প্রথমে আপনার অ্যাকাউন্টটি ১০০ টাকা দিয়ে ভেরিফাই করুন। (Invite & Verify ট্যাব থেকে পেমেন্ট করুন)', 'warning');
      return;
    }

    if (completedTaskIds.includes(task.id)) {
      fireAlert('ইতিমধ্যেই সম্পূর্ণ!', 'আপনি এই টাস্কটি আগেই সম্পূর্ণ করেছেন। ডাবল স্পেন্ডিং বা একই কাজ বারবার করে বোনাস নেওয়া অবৈধ।', 'warning');
      return;
    }

    setActiveTask(task);
    setHasVisited(false);
    setIsVerifying(false);
    setSuccessAnimation(false);
    setScreenshotDataUrl(null);
    setScreenshotName('');
    setWarningMessage('প্রমাণ জমা দিন: লিংকে প্রবেশ করে কাজটি সম্পন্ন করুন এবং প্রুফ হিসেবে স্ক্রিনশট আপলোড করুন।');
    
    // Auto-open external URL
    window.open(task.external_url, '_blank', 'noopener,noreferrer');
    setHasVisited(true);
  };

  const handleScreenshotChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotDataUrl(reader.result as string);
        setWarningMessage('স্ক্রিনশট সফলভাবে লোড হয়েছে! এবার নিচের "টাস্ক প্রুফ জমা দিন" বাটনে চাপুন।');
      };
      reader.readAsDataURL(file);
    } else {
      fireAlert('ভুল ফাইল টাইপ!', 'অনুগ্রহ করে শুধুমাত্র একটি ইমেজ (PNG, JPG) ফাইল আপলোড করুন।', 'error');
    }
  };

  const triggerVerification = async () => {
    if (!activeTask) return;
    if (!screenshotDataUrl) {
      fireAlert('স্ক্রিনশট প্রয়োজন 📸', 'অনুগ্রহ করে কাজটি সম্পন্ন করে একটি স্ক্রিনশট প্রুফ ইমেজ ড্রপ অথবা সিলেক্ট করে আপলোড করুন।', 'warning');
      return;
    }

    setIsVerifying(true);
    setWarningMessage('আপলোড করা স্ক্রিনশট ও কাজ সিঙ্ক্রোনাইজ হচ্ছে এবং এন্টি-চিট অডিট চলছে...');

    // Simulate cryptographic processing (1.8 seconds proof inspection)
    setTimeout(async () => {
      setIsVerifying(false);
      const targetReward = getAdjustedReward(activeTask.reward_bdt);
      
      try {
        await onTaskComplete(activeTask.id, targetReward);
        setCreditedAmount(targetReward);
        setSuccessAnimation(true);
        fireAlert('টাস্ক প্রুফ সফল! ✅', `অভিনন্দন! আপনার জমা দেওয়া কাজের স্ক্রিনশটটি ভেরিফাই করা হয়েছে এবং +৳ ${targetReward.toFixed(2)} টাকা সরাসরি আপনার ওয়ালেটে যোগ করা হয়েছে।`, 'success');
      } catch (err: any) {
        setWarningMessage('ত্রুটি: আপনার ডাটা সাবমিশন সার্ভারে ভেরিফাই হতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার ট্রাই করুন।');
        fireAlert('ভেরিফিকেশন ব্যর্থ!', 'প্রুফ ভেরিফিকেশন ব্যর্থ হয়েছে। আইপি পরিবর্তন বা ভুল ইমেজ আপলোডের কারণে এমন হতে পারে।', 'error');
      }
    }, 1800);
  };

  const closeTaskWorkspace = () => {
    setActiveTask(null);
    setIsVerifying(false);
    setSuccessAnimation(false);
    setScreenshotDataUrl(null);
    setScreenshotName('');
    setWarningMessage('');
  };

  // Font Awesome icon mapper
  const getTaskIconClass = (type: string) => {
    switch (type) {
      case 'video': return 'fa-brands fa-youtube text-red-500 animate-pulse';
      case 'visit': return 'fa-solid fa-earth-americas text-blue-400';
      case 'social': return 'fa-solid fa-bullhorn text-pink-400';
      case 'survey': return 'fa-solid fa-square-poll-vertical text-teal-400';
      default: return 'fa-solid fa-circle-play text-purple-400';
    }
  };

  return (
    <div id="freelance-tasks-section" className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <i className="fa-solid fa-circle-play text-xl" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">সহজ ফ্রিল্যান্স মাইক্রোজব ফীড (Active Tasks)</h2>
            <p className="text-gray-500 text-xs mt-0.5 font-medium">সহজ লাইক, সাবস্ক্রাইব বা ফেসবুক পেজ ভিজিট করে ফ্রিতে আয় করুন</p>
          </div>
        </div>
        
        <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-[11px] font-bold text-green-700 flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
          <span>টাস্ক সিস্টেম সচল আছে</span>
        </div>
      </div>

      {/* Grid of Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tasks.map(task => {
          const isCompleted = completedTaskIds.includes(task.id);
          const currentReward = getAdjustedReward(task.reward_bdt);

          return (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between overflow-hidden group ${
                isCompleted 
                  ? 'bg-green-50/40 border-green-200 opacity-80' 
                  : 'bg-gray-50/50 border-gray-200 hover:border-blue-300 hover:bg-white hover:-translate-y-1 hover:shadow-sm'
              }`}
            >
              {isCompleted && (
                <div className="absolute top-4 right-4 bg-green-100 border border-green-200 rounded-full py-1 px-2.5 text-[10px] text-green-800 font-bold flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-xs text-green-600" />
                  <span>সম্পন্ন হয়েছে</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-md">
                    <i className={getTaskIconClass(task.task_type)} />
                  </div>
                  <span className="text-[10px] tracking-wide text-blue-700 font-extrabold px-2 py-0.5 bg-blue-100/60 rounded-lg border border-blue-100 uppercase">
                    {task.category || 'MICROJOB'}
                  </span>
                  {!isCompleted && (
                    <span className="text-[10px] font-sans text-gray-400 font-bold ml-auto flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      <i className="fa-solid fa-image text-[9px] text-gray-500" /> প্রমাণ প্রয়োজন (Proof)
                    </span>
                  )}
                </div>

                <h3 className="text-gray-900 text-base font-extrabold mb-1.5 leading-snug font-sans group-hover:text-blue-600 transition-colors">{task.title}</h3>
                <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed mb-4">{task.description}</p>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3.5 mt-auto">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block">কাজের বোনাস (Reward):</span>
                  <span className="text-base font-black text-green-600 font-mono">
                    ৳ {currentReward.toFixed(2)} BDT
                  </span>
                </div>

                {isCompleted ? (
                  <button
                    disabled
                    className="py-1.5 px-3 bg-green-100 border border-green-200 rounded-xl text-green-800 text-xs font-bold flex items-center gap-1.5 opacity-80"
                  >
                    <span>টাকা ওয়ালেটে যোগ হয়েছে</span>
                    <i className="fa-solid fa-circle-check text-xs text-green-600" />
                  </button>
                ) : (
                  <button
                    onClick={() => startTask(task)}
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>কাজ শুরু করুন</span>
                    <i className="fa-solid fa-circle-play text-[11px]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE TASK COUNTDOWN OVERLAY WORKSPACE */}
      {activeTask && (
        <div className="fixed inset-0 bg-[#0c0214]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#150729] border border-pink-500/20 rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-premium" />

            {/* Header controls */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-pink-300 px-2.5 py-1 bg-pink-500/10 border border-pink-500/20 rounded uppercase">
                  অ্যাক্টিভ ফ্রিল্যান্স ওয়ার্কস্পেস (প্রমাণ বা স্ক্রিনশট উইন্ডো)
                </span>
                <h3 className="text-white text-lg font-bold mt-2.5 text-ellipsis overflow-hidden">{activeTask.title}</h3>
              </div>
              <button
                onClick={closeTaskWorkspace}
                className="p-1 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-300 hover:text-red-400 transition-all font-sans font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <i className="fa-solid fa-circle-xmark" /> বাতিল করুন
              </button>
            </div>

            {/* Instruction container */}
            <div className="bg-black/30 border border-pink-500/10 p-4 rounded-2xl mb-6 space-y-1.5">
              <p className="text-xs text-pink-100/80 leading-normal">
                👉 <strong className="text-pink-300">মূল নির্দেশনাঃ</strong> নতুন সিকিউর উইন্ডোতে টাস্ক লিংকটি ওপেন করা হয়েছে। কাজটি সফলভাবে সম্পন্ন করুন এবং প্রমাণ হিসেবে একটি স্ক্রিনশট নিন। এরপর নিচে স্ক্রিনশটটি আপলোড করে সাবমিট করুন।
              </p>
              
              <div className="flex gap-2.5 items-center bg-pink-500/5 border border-pink-500/10 p-2.5 rounded-xl">
                <i className="fa-solid fa-image text-pink-400 text-sm mt-0.5" />
                <span className="text-[10.5px] text-pink-200/90 leading-tight">
                  কোন প্রকার ফেক বা অন্য কারো স্ক্রিনশট আপলোড করবেন না, করলে অ্যাকাউন্ট পার্মানেন্ট ব্যান করা হবে।
                </span>
              </div>
            </div>

            {/* SCREENSHOT DROP & UPLOAD ZONE */}
            {!successAnimation ? (
              <div className="space-y-4">
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleScreenshotChange(file);
                  }}
                  onClick={() => document.getElementById('microjob-screenshot-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all ${
                    isDragOver 
                      ? 'border-pink-500 bg-pink-500/10 scale-[1.02]' 
                      : screenshotDataUrl 
                        ? 'border-emerald-500/40 bg-emerald-950/10' 
                        : 'border-white/10 bg-black/20 hover:border-pink-500/30'
                  }`}
                >
                  <input 
                    id="microjob-screenshot-input"
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScreenshotChange(file);
                    }}
                  />

                  {screenshotDataUrl ? (
                    <div className="w-full flex flex-col items-center gap-3">
                      <div className="relative max-h-36 overflow-hidden rounded-xl border border-emerald-500/20 shadow-md">
                        <img 
                          src={screenshotDataUrl} 
                          alt="Screenshot Proof" 
                          className="max-h-32 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-emerald-400 font-bold font-mono truncate max-w-[280px]">✔ {screenshotName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">অন্য স্ক্রিনশট দিতে চাইলে ক্লিক বা ড্র্যাগ করুন</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20 text-pink-400">
                        <i className="fa-solid fa-cloud-arrow-up text-lg animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-white font-bold">এখানে স্ক্রিনশট ড্রপ করুন অথবা ব্রাউজ করুন</p>
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG (সর্বোচ্চ ৫ মেগাবাইট)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500 flex flex-col items-center justify-center text-emerald-400 animate-bounce">
                  <i className="fa-solid fa-circle-check text-3xl" />
                  <span className="text-[9px] font-bold mt-1.5 font-sans tracking-wide">ভেরিফাইড</span>
                </div>
              </div>
            )}

            {/* Status and dynamic messages info */}
            <div className="mt-4 text-center px-4 min-h-8 flex items-center justify-center bg-black/20 rounded-xl p-2 border border-white/5">
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
                  <span className="text-[11px] text-pink-300 animate-pulse font-bold">এন্টি-চিট ফ্রড অডিট ভেরিফিকেশন চলছে...</span>
                </div>
              ) : successAnimation ? (
                <div className="space-y-1">
                  <p className="text-emerald-400 font-bold text-[12px] flex items-center justify-center gap-1.5 animate-pulse">
                    <i className="fa-solid fa-gift text-yellow-400" /> পেমেন্ট বোনাস সিঙ্ক করা হয়েছে! +৳ {creditedAmount.toFixed(2)} টাকা সরাসরি অ্যাকাউন্টে যোগ হয়েছে।
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-pink-200/70 italic">
                  {warningMessage}
                </p>
              )}
            </div>

            {/* Workspace action footer */}
            <div className="border-t border-pink-500/10 pt-5 mt-5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-pink-300/40 block">আপনার ভিআইপি বোনাসঃ</span>
                <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-gold">
                  ৳ {getAdjustedReward(activeTask.reward_bdt).toFixed(2)} BDT
                </span>
              </div>

              <div className="flex gap-2">
                {!hasVisited && (
                  <button
                    onClick={() => {
                      window.open(activeTask.external_url, '_blank', 'noopener,noreferrer');
                      setHasVisited(true);
                    }}
                    className="py-2.5 px-4 bg-purple-600/30 border border-purple-500/20 text-white font-bold text-xs rounded-xl hover:bg-purple-600/40 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>লিংক ওপেন করুন</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                  </button>
                )}

                {successAnimation ? (
                  <button
                    onClick={closeTaskWorkspace}
                    className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                ) : (
                  <button
                    onClick={triggerVerification}
                    disabled={isVerifying || !screenshotDataUrl}
                    className="py-2.5 px-5 bg-gradient-premium hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow hover:shadow-pink-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isVerifying ? (
                      <span>ভেরিফাই হচ্ছে...</span>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane" />
                        <span>টাস্ক প্রুফ জমা দিন</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
