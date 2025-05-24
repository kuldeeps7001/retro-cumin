import Header from "@/components/header";
import SpinnerWheel from "@/components/spinner-wheel";
import ItemManager from "@/components/item-manager";
import PWAStatus from "@/components/pwa-status";
import { useWheelItems } from "@/hooks/use-wheel-items";

export default function Home() {
  const { data: items = [], isLoading } = useWheelItems();

  return (
    <div className="min-h-screen bg-black text-terminal-green crt-effect overflow-x-hidden">
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute w-full h-1 bg-terminal-green opacity-20 animate-scanline"></div>
      </div>
      
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Spinner Section */}
          {isLoading ? (
            <div className="terminal-border bg-crt-gray p-6">
              <div className="text-terminal-green">Loading wheel...</div>
            </div>
          ) : (
            <SpinnerWheel items={items} />
          )}
          
          {/* Input Management Section */}
          <ItemManager />
        </div>
        
        {/* PWA Status Bar */}
        <PWAStatus />
      </div>
      
      {/* Footer */}
      <footer className="terminal-border bg-crt-gray p-4 m-4 mt-8">
        <div className="flex justify-between items-center text-xs">
          <div className="text-terminal-amber">
            RETRO-SPINNER PWA © 2024 | BUILD: v1.0.42
          </div>
          <div className="text-terminal-green">
            <span className="animate-blink">■</span> SYSTEM OPERATIONAL
          </div>
        </div>
      </footer>
    </div>
  );
}
