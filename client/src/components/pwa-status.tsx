import { useState, useEffect } from "react";

export default function PWAStatus() {
  const [lastSync, setLastSync] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update sync time every 30 seconds
    const syncTimer = setInterval(() => {
      setLastSync(new Date());
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncTimer);
    };
  }, []);

  const syncTimeString = lastSync.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="terminal-border bg-crt-gray p-4 mt-8">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-terminal-green' : 'bg-terminal-pink'}`}></div>
            <span className="text-terminal-amber">PWA STATUS:</span>
            <span className={`ml-2 ${isOnline ? 'text-terminal-green' : 'text-terminal-pink'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-save text-terminal-cyan mr-2"></i>
            <span className="text-terminal-amber">AUTO-SAVE:</span>
            <span className="text-terminal-green ml-2">ENABLED</span>
          </div>
        </div>
        <div className="text-terminal-amber">
          LAST SYNC: <span>{syncTimeString}</span>
        </div>
      </div>
    </div>
  );
}
