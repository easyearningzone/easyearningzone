import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Default welcome message when chatbot starts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          text: 'আসসালামু আলাইকুম! ইজি আর্নিং বিডি (Easy Earning BD) বট সহকারীতে আপনাকে স্বাগতম! 🌸\n\nআমি আপনাকে প্ল্যাটফর্ম থেকে ফ্রিল্যান্স কাজ করে কিভাবে দ্রুত টাকা আয় করা যায়, বিকাশ/নগদে উইথড্র করা যায় এবং আপনার জিমেইল/ফেসবুক/ইন্সটাগ্রাম আইডি অ্যাডমিনের কাছে কিভাবে সরাসরি সেল করবেন সে বিষয়ে সাহায্য করতে পারি।\n\nযেকোনো প্রশ্ন লিখে পাঠান অথবা নিচের সাহায্যকারী টপিক গুলোতে ক্লিক করুনঃ',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Safe scroll to bottom on new chats
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Frequently Asked Questions chips
  const faqTips = [
    { q: 'টাকা ইনকাম করার নিয়ম কি?', trigger: 'earn' },
    { q: 'কিভাবে সরাসরি অ্যাকাউন্ট বিক্রি করবো?', trigger: 'sell' },
    { q: 'উইথড্র করার নিয়ম কি এবং কতক্ষণে পেমেন্ট দেয়?', trigger: 'withdraw' },
    { q: 'মেম্বারশিপ নিলে লাভ কি?', trigger: 'membership' },
    { q: 'অ্যাকাউন্ট ভেরিফিকেশন ফি কেন নেওয়া হয়?', trigger: 'verify' }
  ];

  // Simple clever Bangla matches to simulate highly intelligent contextual AI chats
  const getContextualReply = (input: string): string => {
    const text = input.toLowerCase();
    
    // Help & General Earning
    if (text.includes('আয়') || text.includes('ইনকাম') || text.includes('earn') || text.includes('কাজ') || text.includes('task')) {
      return 'ইজি আর্নিং প্ল্যাটফর্মে টাকা আয় করার ৩টি প্রধান মাধ্যম আছেঃ\n\n' +
        '১. 🎯 **মাইক্রোজব টাস্কঃ** আমাদের টাস্ক ফিড এ গিয়ে ছোট ভিডিও বিজ্ঞাপন দেখা, স্পন্সর্ড ওয়েবসাইট ভিজিট করা কাজগুলো করে সরাসরি ৳৩ থেকে ৳১৫ টাকা আয় করতে পারেন।\n' +
        '২. 🛒 **অ্যাডমিন ডিরেক্ট সেলঃ** আপনার কাছে অপ্রয়োজনীয় Gmail, Facebook, এবং Instagram অ্যাকাউন্টগুলো সরাসরি আমাদের "অ্যাডমিন ডিরেক্ট সেল" ফরমে সাবমিট করে ৳১৫০ থেকে ৳১৫০০ টাকা পর্যন্ত আয় করতে পারেন।\n' +
        '৩. 👥 **রেফারাল প্রোগ্রামঃ** বন্ধুদের রেফার করুন। আপনার রেফারাল কোড ব্যবহার করে তারা অ্যাকাউন্ট খুললে এবং ১ নম্বর লেভেল একটিভ করলে আপনি প্রতিটি জেনারেশন ১ থেকে ১০ পর্যন্ত ৫টাকা থেকে ৪০টাকা কমিশন পাবেন!';
    }
    
    // Direct Admin Sale Help
    if (text.includes('বিক্রি') || text.includes('সেল') || text.includes('sell') || text.includes('gmail') || text.includes('fb') || text.includes('insta') || text.includes('ইন্সটাগ্রাম') || text.includes('ফেসবুক') || text.includes('জিমেইল')) {
      return 'অ্যাডমিনের কাছে সরাসরি অ্যাকাউন্ট বিক্রি করার নিয়ম খুবই সহজঃ\n\n' +
        '১. প্রথমে আপনার প্রোফাইলটি ১ নম্বর রেফারেল ধাপে গিয়ে ১০০ টাকা দিয়ে ভেরিফাই নিশ্চিত করুন।\n' +
        '২. এরপর **"অ্যাডমিন ডিরেক্ট সেল (Direct Account Sell)"** ফরমে যান।\n' +
        '৩. আপনার জিমেইল, ফেসবুক বা ইন্সটাগ্রাম আইডি সিলেক্ট করে তার সঠিক ইউজারনেম, পাসওয়ার্ড এবং ব্যাকআপ কোড/রিকভারি মেইল দিন।\n' +
        '৪. আপনার অফার মূল্য নির্ধারণ করে সাবমিট করুন।\n\n' +
        '**যাচাইকরণ সময়ঃ** সাবমিট করা মাত্রই আমাদের অটোমেটেড চেকিং বট ৫-১২ সেকেন্ডের মধ্যে আইডির পাসওয়ার্ড চেক করে এবং সব ঠিক থাকলে সাথে সাথে আপনার মেইন ওয়ালেট ব্যালেন্সে টাকা দিয়ে দেয়!';
    }

    // Withdrawal help & time
    if (text.includes('উইথড্র') || text.includes('withdraw') || text.includes('বিকাশ') || text.includes('নগদ') || text.includes('রকেট') || text.includes('পেমেন্ট') || text.includes('payment') || text.includes('কত টাকা')) {
      return 'আমাদের উইথড্রয়াল পলিসি অত্যন্ত দ্রুত ও নিরাপদঃ\n\n' +
        '৳ **সর্বনিম্ন সীমাঃ** আপনার মেইন ওয়ালেট ব্যালেন্স ৳ ১৫০ টাকা বা তার বেশি হলে আপনি ক্যাশআউট রিকোয়েস্ট পাঠাতে পারবেন।\n' +
        '📱 **মাথড সমূহঃ** সরাসরি বিকাশ (bKash), নগদ (Nagad), ও রকেট (Rocket) পার্সোনাল নম্বরে পেমেন্ট নেওয়া যায়।\n' +
        '⏱️ **সময়কালঃ** রিকোয়েস্ট পাঠানোর পর আমাদের পেমেন্ট রোবট ৫-১০ মিনিটের মধ্যে পেমেন্ট প্রসেস সম্পন্ন করে। ডেমো স্টেটে উইথড্র সাবমিট করার পর ১৫ সেকেন্ডের মধ্যে ওয়ালেট ব্যালেন্স থেকে পেমেন্ট অটো-অ্যাপ্রুভড হয়ে যায়!';
    }

    // Membership & Upgrades
    if (text.includes('মেম্বার') || text.includes('আপগ্রেড') || text.includes('silver') || text.includes('gold') || text.includes('membership') || text.includes('premium')) {
      return 'মেম্বারশিপ আপগ্রেড করলে আপনার প্রতিটি টাস্ক ইনকামের ওপর অতিরিক্ত বোনাস যোগ হবেঃ\n\n' +
        '🥈 **Silver Tier (সিলভার):** প্রতিটি টাস্ক ইনকামে ১.২ গুন বোনাস পাবেন।\n' +
        '🥇 **Gold Tier (গোল্ড):** প্রতিটি টাস্ক ইনকামে ১.৫ গুন বোনাস পাবেন।\n' +
        '💎 **Platinum Tier (প্ল্যাটিনাম):** প্রতিটি টাস্ক ইনকামে দ্বিগুণ (২.০ গুন) বোনাস পাবেন।\n\n' +
        'এছাড়াও গোল্ড এবং প্ল্যাটিনাম মেম্বারদের পেমেন্ট রিকোয়েস্ট মাত্র ৫ সেকেন্ডে অটোমেটিক বিকাশ/নগদে ক্যাশআউট ডেলিভারি দেওয়া হয়!';
    }

    // Verification Help
    if (text.includes('ভেরিফাই') || text.includes('verify') || text.includes('ফি') || text.includes('১০০') || text.includes('100')) {
      return 'আমাদের প্ল্যাটফর্মে ডিরেক্ট অ্যাকাউন্ট বিক্রি এবং আনলিমিটেড রেফারাল ইনকাম সচল করার জন্য একবারের জন্য ৳১০০ টাকা অ্যাকাউন্ট ভেরিফিকেশন ফি প্রযোজ্য হয়। এটি করার মাধ্যমে আপনার অ্যাকাউন্টটি একটি উইথড্রয়াল প্রুফ মেম্বার প্রোফাইলে রূপান্তরিত হয় এবং কোনো ভুয়া বা জাল রেফারেল আইডি তৈরি করা প্রতিরোধ করে।';
    }

    // Default polite response
    return 'আপনার সুন্দর প্রশ্নের জন্য অনেক ধন্যবাদ। 😇\n\n' +
      'দয়া করে খেয়াল রাখবেন, আমাদের প্ল্যাটফর্মে দৈনিক ৮টির বেশি মাইক্রোজব অ্যাড বা সার্ভে সম্পন্ন করতে পারবেন। এবং অ্যাকাউন্ট বিক্রি সম্পর্কিত যেকোনো তথ্যের জন্য আপনি সরাসরি আপনার "অ্যাডমিন ডিরেক্ট সেল" ফরমের লাইভ হিস্ট্রি ট্র্যাকার থেকে আপডেট পেতে পারেন।\n\n' +
      'এই বিষয়ে আরও কিছু জানার থাকলে আমাকে নির্দ্বিধায় মেসেজ করতে পারেন!';
  };

  const handleSendChat = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'chat-' + Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulated typing lag (1 to 1.5 seconds) for organic human feel
    setTimeout(() => {
      const replyText = getContextualReply(text);
      const botMsg: ChatMessage = {
        id: 'chat-' + Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: replyText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div id="ai-chatbot-widget-container" className="fixed bottom-6 right-6 z-50">
      
      {/* FLOATING SPARKLE BUTTON ACTION BUBBLE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-gradient-premium rounded-full flex items-center justify-center text-white shadow-2xl shadow-pink-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          id="chatbot-trigger-bubble"
        >
          {/* Pulsing visual halo ripple glow */}
          <span className="absolute inset-0 rounded-full bg-pink-500/40 animate-ping opacity-75" />
          
          <MessageSquare className="w-6 h-6 relative group-hover:rotate-12 transition-transform" />
          
          <span className="absolute -top-1.5 -right-1 px-2 py-0.5 bg-yellow-400 text-slate-950 text-[9px] font-extrabold rounded-full animate-bounce">
            AI BOT
          </span>
        </button>
      )}

      {/* CHAT WINDOW INTERFACE PANEL */}
      {isOpen && (
        <div
          id="chatbot-drawer-card"
          className="w-80 sm:w-96 h-[500px] bg-[#0c0214] border border-pink-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-premium border-b border-pink-500/30 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shadow">
                <Bot className="w-5 h-5 animate-pulse text-yellow-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
                  <span>ইজি ইয়ার্নিং বট সহকারী</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </h4>
                <p className="text-[10px] text-pink-100/70 font-mono">Easy Earning AI Assistant v1.2</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 text-pink-100 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages stream area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#120524]/60">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 max-w-[85%] ${isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-pink-400" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                        isBot 
                          ? 'bg-black/40 border border-pink-500/10 text-pink-100 rounded-tl-none' 
                          : 'bg-gradient-premium text-white font-sans rounded-tr-none shadow-md shadow-pink-500/5'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-pink-300/30 px-1 font-mono">
                      {m.timestamp.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-2.5 max-w-[70%]">
                <div className="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-black/40 border border-pink-500/10 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQ shortcut chips drawer */}
          <div className="p-2 border-t border-pink-500/10 bg-black/30 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {faqTips.map((tip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendChat(tip.q)}
                className="px-3 py-1.5 bg-pink-500/5 hover:bg-pink-500/15 border border-pink-500/10 hover:border-pink-500/25 rounded-full text-[10.5px] text-pink-200 transition-all whitespace-nowrap cursor-pointer hover:-translate-y-0.5 flex items-center gap-1 shrink-0"
              >
                <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />
                <span>{tip.q}</span>
              </button>
            ))}
          </div>

          {/* Input text send dock */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat(inputText);
            }}
            className="p-3 border-t border-pink-500/10 bg-[#07010d] flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="যেকোনো প্রশ্ন বাংলায় লিখুন..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2 bg-black/60 border border-pink-500/15 rounded-2xl text-xs text-white placeholder-pink-200/20 focus:outline-none focus:border-pink-500 transition-all font-sans"
            />
            <button
              type="submit"
              className="w-9 h-9 bg-gradient-premium hover:opacity-90 rounded-xl flex items-center justify-center text-white shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
