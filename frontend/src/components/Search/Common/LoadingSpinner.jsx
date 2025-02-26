export default function LoadingSpinner({ text = "Loading" }) {
  return (
    <div className="flex justify-center mb-4 ">
      {/* Desktop version */}
      <div className="relative hidden md:inline-flex">
        {/* Main loading animation */}
        <div className="font-mono text-sm tracking-wider flex items-center gap-2 bg-gray-900/50 px-6 py-3 rounded-lg backdrop-blur-sm border border-cyan-500/20">
          <span className="text-pink-400">[</span>
          <div className="relative w-4 h-4">
            <div className="animate-spin rounded-full w-4 h-4 border-2 border-cyan-400 border-t-transparent"></div>
          </div>
          <span className="text-pink-400">::</span>
          <span className="text-gray-300">{text}</span>
          <span className="inline-flex space-x-1">
            <span className="inline-block animate-[bounce_1s_infinite] text-cyan-400">.</span>
            <span className="inline-block animate-[bounce_1s_infinite_200ms] text-pink-400">.</span>
            <span className="inline-block animate-[bounce_1s_infinite_400ms] text-cyan-400">.</span>
          </span>
          <span className="text-pink-400">]</span>
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="h-full w-full cyber-scan"></div>
        </div>

        <style jsx>{`
          .cyber-scan {
            background: linear-gradient(
              transparent 0%,
              rgba(6, 182, 212, 0.08) 50%,
              transparent 100%
            );
            animation: cyber-scanning 1.5s linear infinite;
          }

          @keyframes cyber-scanning {
            0% {
              transform: translateY(-100%);
            }
            100% {
              transform: translateY(100%);
            }
          }
        `}</style>
      </div>

      {/* Mobile version */}
      <div className="relative md:hidden w-full">
        <div className="font-mono text-sm tracking-wider flex items-center justify-center gap-2 bg-gray-900/50 px-4 py-3 rounded-lg backdrop-blur-sm border border-cyan-500/20">
          <span className="text-pink-400">[</span>
          <div className="relative w-4 h-4">
            <div className="animate-spin rounded-full w-4 h-4 border-2 border-cyan-400 border-t-transparent"></div>
          </div>
          <span className="text-pink-400">::</span>
          <span className="text-gray-300">{text}</span>
          <span className="inline-flex space-x-1">
            <span className="inline-block animate-[bounce_1s_infinite] text-cyan-400">.</span>
            <span className="inline-block animate-[bounce_1s_infinite_200ms] text-pink-400">.</span>
            <span className="inline-block animate-[bounce_1s_infinite_400ms] text-cyan-400">.</span>
          </span>
          <span className="text-pink-400">]</span>
        </div>

        {/* Mobile scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="h-full w-full cyber-scan"></div>
        </div>
      </div>

      <style jsx>{`
        .cyber-scan {
          background: linear-gradient(
            transparent 0%,
            rgba(6, 182, 212, 0.08) 50%,
            transparent 100%
          );
          animation: cyber-scanning 1.5s linear infinite;
        }

        @keyframes cyber-scanning {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
} 