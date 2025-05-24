import { useState, useEffect } from "react";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="terminal-border bg-crt-gray p-4 m-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-terminal-green rounded-full animate-blink"></div>
          <h1 className="text-2xl font-retro animate-glow">RETRO-SPINNER v1.0</h1>
        </div>
        <div className="text-sm font-mono">
          <span>{timeString}</span>
          <span className="animate-blink ml-2">█</span>
        </div>
      </div>
      <div className="mt-2 text-xs opacity-70">
        &gt; SYSTEM READY _ ENTER COMMAND OR TYPE 'HELP'
      </div>
    </header>
  );
}
