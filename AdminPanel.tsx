import React, { useState } from 'react';
import { Smartphone, Mail, User, Lock, ShieldCheck, Database, HelpCircle } from 'lucide-react';
import { apiService, isSupabaseConfigured } from '../lib/db';
import { User as UserType } from '../types';
import BrandLogo from './BrandLogo';

interface AuthScreenProps {
  onAuthSuccess: (user: UserType) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [referredByCode, setReferredByCode] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    // Validations
    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    if (isLogin) {
      if (!phone && !email) {
        setErrorMsg('Please program your Phone or Email address.');
        return;
      }
      
      setLoading(true);
      const identity = email || phone;
      const res = await apiService.login(identity, password);
      setLoading(false);

      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Login attempt failed.');
      }
    } else {
      // Registrations
      if (!phone || !email || !username) {
        setErrorMsg('All registration parameters are mandatory.');
        return;
      }

      // Check phone number length/prefixes for Bangladeshi market (e.g., 017/019/018/015/016/013/014)
      const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
      if (!bdPhoneRegex.test(phone)) {
        setErrorMsg('Please input a valid Bangladeshi phone number (e.g. 01712345678).');
        return;
      }

      // Email parsing
      if (!email.includes('@')) {
        setErrorMsg('Please provide a working email address.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Confirm password mismatch!');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Password must range above 6 characters.');
        return;
      }

      setLoading(true);
      // Clean phone to standard 11 digits format internally
      const cleanedPhone = phone.replace('+88', '').replace('88', '');
      const res = await apiService.register(cleanedPhone, email, username, password, referredByCode);
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg('Registration complete! Automatic loading... Welcome Greeting added.');
        setTimeout(() => {
          if (res.user) onAuthSuccess(res.user);
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Could not instantiate user.');
      }
    }
  };

  // Preset accounts for testing convenience
  const fillDemoAccount = (isUser: boolean) => {
    setErrorMsg('');
    if (isUser) {
      setEmail('demouser@easyearning.bd');
      setPhone('01712345678');
      setPassword('password123');
      setUsername('Tanvir Rahman');
    }
  };

  return (
    <div id="auth-screen-container" className="flex flex-col justify-center items-center min-h-[85vh] px-4 py-6 md:py-12">
      {/* Platform Branding Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md transition-all duration-300">
        
        <div id="auth-branding-header" className="flex flex-col items-center justify-center text-center mb-6">
          <BrandLogo size="lg" className="mb-2" />
          <p className="text-gray-500 text-xs font-sans font-semibold max-w-[280px]">
            বাংলাদেশের বিশ্বস্ত মাইক্রো-টাস্ক ও ফ্রিল্যান্সিং প্ল্যাটফর্ম
          </p>
        </div>

        {/* Database Integration Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-6 py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-200 mx-auto w-fit">
          <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-green-600' : 'text-blue-500 animate-pulse'}`} />
          <span className="text-[10px] font-sans font-black">
            {isSupabaseConfigured ? (
              <span className="text-green-600">অনলাইন ডাটাবেস সক্রিয় আছে</span>
            ) : (
              <span className="text-blue-600">সুরক্ষিত লোকাল স্টোরেজ সক্রিয়</span>
            )}
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-semibold flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 block" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs sm:text-sm font-semibold flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 block animate-ping" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Register Mode extra fields */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11.5px] font-bold text-gray-700 tracking-wide block uppercase">আপনার সম্পূর্ণ নাম (Full Name)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="উদাঃ Tanvir Rahman"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>
          )}

          {/* Phone input */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-gray-700 block uppercase">মোবাইল নাম্বার (11-Digit Phone Number)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700 font-extrabold font-mono text-xs border-r border-gray-200 pr-2">
                +88
              </span>
              <input
                type="tel"
                placeholder="উদাঃ 01712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm font-mono font-medium"
                required={!isLogin}
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-gray-700 block uppercase">ইমেইল এড্রেস (Email Address)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="email"
                placeholder="developer@easyearning.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm font-mono font-medium"
                required={!isLogin}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-gray-700 block uppercase">পাসওয়ার্ড (6+ Digit Password)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Confirm Password fields for Registration */}
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-[11.5px] font-bold text-gray-700 block uppercase">পাসওয়ার্ড পুনরায় দিন (Confirm Password)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="w-4 h-4 text-blue-500" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11.5px] font-bold text-gray-700 block uppercase">রেফারাল কোড - ঐচ্ছিক (Referral Code)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 font-mono text-xs font-black">
                    REF
                  </span>
                  <input
                    type="text"
                    placeholder="উদাঃ EEBD-123456"
                    value={referredByCode}
                    onChange={(e) => setReferredByCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm font-mono font-medium"
                  />
                </div>
                <p className="text-[9.5px] text-gray-400 font-sans pl-1">যদি পরিচিত কেউ আপনাকে আমন্ত্রণ জানিয়ে থাকে, ওনার রেফার কোড ব্যবহার করুন।</p>
              </div>
            </>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-sans font-black rounded-xl shadow-md transition-all flex justify-center items-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : isLogin ? (
              'অ্যাকাউন্টে প্রবেশ করুন (Login)'
            ) : (
              'নতুন অ্যাকাউন্ট খুলুন (Register)'
            )}
          </button>
        </form>

        {/* Change Mode Toggle */}
        <div className="text-center mt-6 pt-5 border-t border-gray-100">
          <p className="text-gray-500 text-xs font-semibold">
            {isLogin ? "নতুন ইউজার একাউন্ট খুলতে চান?" : "ইতিমধ্যে একাউন্ট আছে?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-blue-600 font-black hover:underline cursor-pointer ml-1"
            >
              {isLogin ? "এখানে ফ্রী রেজিস্ট্রেশন করুন" : "লগইন স্ক্রিনে ফিরে যান"}
            </button>
          </p>
        </div>

        {/* Local Demo Quickfill Panel for Testing */}
        <div className="mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-black text-gray-500 tracking-wide uppercase flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />evaluation Demo একাউন্ট
            </span>
            <span className="text-[9px] px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded font-bold">
              ১-ক্লিক ডেমো
            </span>
          </div>
          <p className="text-[10.5px] text-gray-500 leading-normal font-medium">
            দ্রুত অ্যাপ ও কাজের সিস্টেম পরীক্ষা করার জন্য নিচে ক্লিক করে ডেমো অ্যাকাউন্ট দিয়ে সরাসরি লগইন করুন:
          </p>
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => fillDemoAccount(true)}
              className="text-left w-full px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-sans text-gray-800 font-bold hover:text-black transition-all flex items-center justify-between cursor-pointer shadow-sm"
            >
              <span>👤 ডেমো একাউন্ট লোড করুন (Demo Login)</span>
              <span className="text-[9.5px] text-green-700 font-bold bg-green-50 px-1 py-0.5 rounded">৳ ৫০.০০ ব্যালেন্স সহ</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
