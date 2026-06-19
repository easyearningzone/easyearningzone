import { useState, useEffect } from 'react';
import { Sparkles, PlayCircle, ShieldCheck, Gift } from 'lucide-react';

export default function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "বাংলাদেশি ফ্রিল্যান্সারদের বিশ্বস্ত প্ল্যাটফর্ম! 🇧🇩",
      desc: "সহজ মাইক্রো-টাস্ক সম্পন্ন করুন এবং সরাসরি বিকাশ, নগদ বা রকেটে পেমেন্ট বুঝে নিন।",
      highlight: "১০০% নিরাপদ ও ইনস্ট্যান্ট পেমেন্ট সুবিধা",
      badge: "Super Earning BD",
      gradient: "from-[#1877F2] via-[#0052D4] to-[#2563eb]",
      icon: <ShieldCheck className="w-12 h-12 text-green-300 animate-bounce" />
    },
    {
      title: "রেফার করুন এবং সীমাহীন কমিশন আয় করুন! 👥",
      desc: "আপনার বন্ধুদের আমন্ত্রণ জানান এবং প্রতিটি ভেরিফাইড রেফারে পান আকর্ষণীয় কমিশন প্লাস লাইফটাইম কমিশন!",
      highlight: "আনলিমিটেড রেফার বোনাস ও জেনারেশন বোনাস",
      badge: "MLM Generation Earning",
      gradient: "from-emerald-600 via-teal-700 to-green-600",
      icon: <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
    },
    {
      title: "পছন্দের সোশ্যাল এবং গেমিং অ্যাকাউন্ট কিনুন! 🛒",
      desc: "সবচেয়ে কম মূল্যে শতভাগ ভেরিফাইড ফেসবুক আইডি, জিমেইল, টিকটক পেইজ সরাসরি এডমিন ডিল থেকে সংগ্রহ করুন।",
      highlight: "এডমিন ডিরেক্ট ডিল ও ইনস্ট্যান্ট ডেলিভারি",
      badge: "Premium Account Shop",
      gradient: "from-amber-500 via-orange-600 to-red-600",
      icon: <Gift className="w-12 h-12 text-white animate-pulse" />
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-6 shadow-md border border-gray-200">
      <div 
        className="flex transition-transform duration-700 ease-out h-[180px] sm:h-[220px]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div 
            key={idx}
            className={`w-full shrink-0 h-full bg-gradient-to-r ${slide.gradient} p-6 sm:p-8 flex flex-col justify-between text-white relative`}
          >
            {/* Ambient pattern backdrop */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
              <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" />
              </svg>
            </div>

            <div className="flex justify-between items-start">
              <span className="bg-white/20 text-white font-sans text-[10px] sm:text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                🚩 {slide.badge}
              </span>
              <div className="flex gap-1.5">
                {slides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentSlide(dotIdx)}
                    className={`w-2 h-2 rounded-full transition-all ${currentSlide === dotIdx ? 'bg-white w-5' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 my-auto">
              <div className="hidden sm:block shrink-0">
                {slide.icon}
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
                  {slide.title}
                </h2>
                <p className="text-white/90 text-xs sm:text-sm font-medium max-w-xl">
                  {slide.desc}
                </p>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-yellow-300 font-bold tracking-wide flex items-center gap-1.5 bg-black/20 w-fit px-3 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{slide.highlight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
