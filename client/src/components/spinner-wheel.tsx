import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { WheelItem } from "@shared/schema";
import { useRecordSpin, useDeleteWheelItem } from "@/hooks/use-wheel-items";

// Modal component for showing the result
function ResultModal({ open, result, onClose, color }: { open: boolean; result: string | null; onClose: () => void; color?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div
        className="border-4 rounded-lg p-8 shadow-lg text-center"
        style={{
          backgroundColor: '#222',
          borderColor: color || '#00FF41',
        }}
      >
        <h2 className="text-2xl font-retro text-terminal-green mb-4">WINNER</h2>
        <div
          className="text-3xl font-retro mb-6"
          style={{ color: color || '#FF1493' }}
        >
          {result}
        </div>
        <button
          onClick={onClose}
          className="retro-button px-6 py-2 text-terminal-green hover:text-terminal-cyan"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

interface SpinnerWheelProps {
  items: WheelItem[];
}

export default function SpinnerWheel({ items }: SpinnerWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [rotation, setRotation] = useState(0);
  const [removeWinner, setRemoveWinner] = useState(true);
  const [showModal, setShowModal] = useState(false); // Modal state
  const [winnerColor, setWinnerColor] = useState<string | undefined>(undefined);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const recordSpin = useRecordSpin();
  const deleteItem = useDeleteWheelItem();

  const spin = useCallback(() => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setResult(null);
    setWinnerColor(undefined);

    // Generate random spin (5-10 full rotations + random final position)
    const spins = Math.random() * 5 + 5;
    const finalAngle = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + finalAngle;
    setRotation(totalRotation);

    // Calculate winner after spin completes
    setTimeout(() => {
      const segmentAngle = 360 / items.length;
      const adjustedAngle = (360 - (totalRotation % 360)) % 360;
      const pointerAngle = (adjustedAngle - 90 + 360) % 360;
      const winnerIndex = Math.floor(pointerAngle / segmentAngle);
      const winnerItem = items[winnerIndex] || items[0];
      // const winner = winnerItem?.text;

      if (winnerItem?.text) {
        setResult(winnerItem);
        setWinnerColor(winnerItem?.color);
        setShowModal(true); // Show modal when result is ready
        recordSpin.mutate(winnerItem?.text);
        // if (removeWinner && winnerItem) {
        //   setTimeout(() => {
        //     deleteItem.mutate(winnerItem.id);
        //   }, 1500);
        // }
      }
      setIsSpinning(false);
    }, 3000);
  }, [items, rotation, isSpinning, recordSpin, removeWinner, deleteItem]);

  const generateSegments = () => {
    if (items.length === 0) return null;
    if (items.length === 1) {
      // Special case: draw a full circle for one item
      const centerX = 225;
      const centerY = 225;
      const radius = 210;
      const item = items[0];
      return (
        <g key={item.id}>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill={item.color}
            stroke="#000"
            strokeWidth="2"
          />
          <text
            x={centerX}
            y={centerY}
            fill="#000"
            fontSize="22"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Courier Prime, monospace"
            transform={`translate(0, -150)`}
          >
            {item.text}
          </text>
        </g>
      );
    }
    const segmentAngle = 360 / items.length;
    return items.map((item, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      const centerX = 225;
      const centerY = 225;
      const radius = 210;
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      // Calculate text position
      const textAngle = startAngle + segmentAngle / 2;
      const textRadius = radius * 0.7;
      const textAngleRad = (textAngle * Math.PI) / 180;
      const textX = centerX + textRadius * Math.cos(textAngleRad);
      const textY = centerY + textRadius * Math.sin(textAngleRad);
      
      return (
        <g key={item.id}>
          <path
            d={pathData}
            fill={item.color}
            stroke="#000"
            strokeWidth="2"
          />
          <text
            x={textX}
            y={textY}
            fill="#000"
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
            fontFamily="Courier Prime, monospace"
          >
            {item.text}
          </text>
        </g>
      );
    });
  };

  if (items.length === 0) {
    return (
      <div className="terminal-border bg-crt-gray p-6">
        <div className="flex items-center mb-6">
          <i className="fas fa-circle-notch text-terminal-green mr-3"></i>
          <h2 className="text-xl font-retro text-terminal-green">PROBABILITY WHEEL</h2>
        </div>
        
        <div className="flex flex-col items-center space-y-6">
          <div className="w-[300px] h-[300px] border-4 border-terminal-green rounded-full bg-crt-gray flex items-center justify-center">
            <span className="text-terminal-amber font-retro">NO ITEMS</span>
          </div>
          
          <div className="terminal-border bg-black p-4 w-full text-center min-h-16">
            <div className="text-sm text-terminal-amber mb-2">RESULT OUTPUT:</div>
            <div className="text-lg font-retro text-terminal-cyan">
              ADD ITEMS TO SPIN<span className="animate-blink">█</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-border bg-crt-gray p-6">
      <div className="flex items-center mb-6">
        <i className="fas fa-circle-notch text-terminal-green mr-3"></i>
        <h2 className="text-xl font-retro text-terminal-green">PROBABILITY WHEEL</h2>
      </div>
      
      <div className="flex flex-col items-center space-y-6">
        {/* Spinning Wheel */}
        <div className="relative flex justify-center">
          <div className="spinner-pointer"></div>
          <motion.div
            ref={wheelRef}
            className="w-[450px] h-[450px] border-4 border-terminal-green rounded-full relative overflow-hidden"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 50px rgba(0, 0, 0, 0.3)'
            }}
            animate={{ rotate: rotation }}
            transition={{
              duration: isSpinning ? 3 : 0,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <svg width="450" height="450" className="absolute inset-0">
              {generateSegments()}
            </svg>
            <div className="spinner-center"></div>
          </motion.div>
        </div>
        
        {/* Options */}
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="remove-winner"
            checked={removeWinner}
            onCheckedChange={(checked) => setRemoveWinner(checked === true)}
            className="border-terminal-green data-[state=checked]:bg-terminal-green data-[state=checked]:text-green-foreground data-[state=unchecked]:bg-terminal-gray data-[state=unchecked]:text-terminal-gray-foreground"
          />
          <label
            htmlFor="remove-winner"
            className="text-sm font-mono text-terminal-amber cursor-pointer"
          >
            AUTO-REMOVE WINNER FROM WHEEL
          </label>
        </div>

        {/* Spin Button */}
        <button
          onClick={spin}
          disabled={isSpinning || items.length === 0}
          className="retro-button px-8 py-3 text-terminal-green font-retro text-lg hover:text-terminal-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="inline mr-2" size={20} />
          {isSpinning ? 'SPINNING...' : 'EXECUTE SPIN'}
        </button>
        
        {/* Result Modal */}
        <ResultModal
          open={showModal && !!result}
          result={result?.text as string}
          onClose={() => {
            setShowModal(false)
            if (removeWinner && result) {
              deleteItem.mutate(result.id);
            }
            setResult(null);
            setWinnerColor(undefined);
          }}
          color={winnerColor}
        />
      </div>
    </div>
  );
}
