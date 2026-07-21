import Link from "next/link";
import { MessageCircle, MessageSquare, MessageCircleHeart, MessageCircleMore, Shield, Zap, Globe, ArrowRight, Users, Send, Clock } from "lucide-react";
import Reveal from "@/components/Reveal";

const floatKeyframes = [
  { name: "fa", dur: "7s", x: 0, y: -35 },
  { name: "fb", dur: "5s", x: 12, y: -28 },
  { name: "fc", dur: "8s", x: -8, y: -32 },
  { name: "fd", dur: "6s", x: 15, y: -25 },
];

const floatingIcons = [
  { Icon: MessageCircle, top: "15%", left: "8%", kf: floatKeyframes[0], size: 28 },
  { Icon: MessageSquare, top: "22%", right: "15%", kf: floatKeyframes[1], size: 22 },
  { Icon: MessageCircleHeart, top: "50%", left: "6%", kf: floatKeyframes[2], size: 34 },
  { Icon: MessageCircleMore, top: "65%", right: "10%", kf: floatKeyframes[0], size: 24 },
  { Icon: MessageCircle, top: "78%", left: "18%", kf: floatKeyframes[3], size: 20 },
  { Icon: MessageSquare, top: "12%", left: "42%", kf: floatKeyframes[2], size: 18 },
  { Icon: MessageCircle, top: "72%", right: "22%", kf: floatKeyframes[1], size: 16 },
  { Icon: MessageCircleMore, top: "38%", left: "52%", kf: floatKeyframes[0], size: 26 },
];

const heroStats = [
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: Send, value: "1M+", label: "Messages Sent" },
  { icon: Clock, value: "99.9%", label: "Uptime" },
];

const features = [
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description:
      "Send and receive messages instantly. Stay connected with seamless real-time communication.",
    gradient: "from-indigo-500 to-violet-500",
    shadow: "shadow-indigo-500/20",
    border: "hover:border-indigo-200 dark:hover:border-indigo-700",
  },
  {
    icon: Globe,
    title: "Media Sharing",
    description:
      "Share images, videos, and files effortlessly. Express yourself beyond just text messages.",
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
    border: "hover:border-emerald-200 dark:hover:border-emerald-700",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "End-to-end encryption ensures your conversations stay private and protected.",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
    border: "hover:border-amber-200 dark:hover:border-amber-700",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for speed. Smooth, lag-free messaging on any device you use.",
    gradient: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/20",
    border: "hover:border-rose-200 dark:hover:border-rose-700",
  },
];

export default function Home() {
  return (
    <>
      <style>{`
        ${floatKeyframes.map(k => `
          @keyframes f-${k.name} {
            0%, 100% { transform: translate(0, 0); opacity: 0.15; }
            50% { transform: translate(${k.x}px, ${k.y}px); opacity: 0.4; }
          }
        `).join("")}
      `}</style>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-screen sm:min-h-[95vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        {floatingIcons.map((item, i) => {
          const Icon = item.Icon;
          return (
            <div
              key={i}
              className="absolute text-indigo-500 dark:text-indigo-400 pointer-events-none"
              style={{
                top: item.top,
                left: item.left,
                right: item.right,
                animation: `f-${item.kf.name} ${item.kf.dur} ease-in-out infinite`,
                animationDelay: `${i * 1.2}s`,
              }}
            >
              <Icon size={item.size} />
            </div>
          );
        })}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0ZjQ2ZTUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40 dark:opacity-20" />
        <div className="relative w-full px-4 sm:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Real-time Communication
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Connect Instantly with{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                KuraKani
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto px-2">
              Fast, secure, and beautifully designed real-time communication for everyone.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="group relative w-full sm:w-auto px-7 sm:px-9 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-center text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all overflow-hidden"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-lg transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Hero Stats */}
            <Reveal delay={300}>
              <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
                {heroStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          {stat.value}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-22 sm:py-26 lg:py-36 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-100 dark:bg-violet-900/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-emerald-100 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-40" />
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 lg:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-medium mb-4">
                <MessageCircle className="w-3 h-3" />
                Features
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Everything You Need
              </h2>
              <div className="mt-3 mx-auto w-16 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
              <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                Powerful features designed to make your conversations better.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} delay={(i + 1) * 120}>
                  <div className={`group relative h-full p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 ${feature.border} hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col`}>
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white w-fit shadow-md ${feature.shadow} group-hover:shadow-lg transition-shadow`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold text-slate-900 dark:text-white group-hover:translate-x-0.5 transition-transform">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                      {feature.description}
                    </p>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-white/5 group-hover:via-white/5 group-hover:to-transparent transition-all pointer-events-none" />
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Feature Stats */}
          <Reveal delay={600}>
            <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { label: "Messages Daily", value: "50K+", desc: "Average messages exchanged every day" },
                { label: "Countries", value: "120+", desc: "Used by people across the globe" },
                { label: "User Rating", value: "4.9★", desc: "Average rating from our users" },
              ].map((item) => (
                <div key={item.label} className="text-center p-5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{item.value}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{item.label}</div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
