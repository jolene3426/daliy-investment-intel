import React, { useState, useEffect } from 'react';
import { Sliders, Check, Zap } from 'lucide-react';
import { NewsPreferences } from '../types';

interface PreferencePanelProps {
  onConfirm: (prefs: NewsPreferences) => void;
}

export const PreferencePanel: React.FC<PreferencePanelProps> = ({ onConfirm }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [prefs, setPrefs] = useState<NewsPreferences>({
    politics: 30,
    economics: 50,
    lifestyle: 20,
    includeAiSummary: true,
  });

  // Handle slider change with linked logic (Total must be 100)
  const handleSliderChange = (changedKey: 'politics' | 'economics' | 'lifestyle', newValue: number) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, newValue));
    
    setPrefs(prev => {
      const oldValue = prev[changedKey];
      const delta = clampedValue - oldValue;
      
      // If no change, return previous state
      if (delta === 0) return prev;

      const keys: ('politics' | 'economics' | 'lifestyle')[] = ['politics', 'economics', 'lifestyle'];
      const otherKeys = keys.filter(k => k !== changedKey);
      
      // Calculate total of other keys
      const totalOthers = otherKeys.reduce((sum, k) => sum + prev[k], 0);

      let newPrefs = { ...prev, [changedKey]: clampedValue };

      // Distribute the delta (subtracted from others)
      // If we increased the target, we need to decrease others.
      // If we decreased the target, we need to increase others.
      
      let remainingToDistribute = 100 - clampedValue;

      if (totalOthers === 0) {
        // If others were 0, split remaining evenly
        const split = Math.floor(remainingToDistribute / 2);
        newPrefs[otherKeys[0]] = split;
        newPrefs[otherKeys[1]] = remainingToDistribute - split;
      } else {
        // Distribute proportionally
        let distributed = 0;
        otherKeys.forEach((key, index) => {
          if (index === otherKeys.length - 1) {
            // Last one gets the remainder to avoid rounding errors
            newPrefs[key] = remainingToDistribute - distributed;
          } else {
            const ratio = prev[key] / totalOthers;
            const newVal = Math.floor(remainingToDistribute * ratio);
            newPrefs[key] = newVal;
            distributed += newVal;
          }
        });
      }
      
      return newPrefs;
    });
  };

  const toggleAiSummary = () => {
    setPrefs(prev => ({ ...prev, includeAiSummary: !prev.includeAiSummary }));
  };

  const handleConfirm = () => {
    onConfirm(prefs);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#FFFBEB] border border-yellow-200 text-yellow-800 py-2 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FEF3C7] transition-colors mb-4 text-sm font-medium shadow-sm"
      >
        <Sliders className="w-4 h-4" />
        調整新聞比重 (Adjust Preferences)
      </button>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-yellow-200 rounded-2xl p-5 mb-6 shadow-[0_4px_20px_-4px_rgba(253,230,138,0.3)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-900 font-bold flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          新聞側重點設定 (總和 100%)
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-stone-400 hover:text-stone-600 text-xs"
        >
          收起
        </button>
      </div>

      <div className="space-y-6">
        {/* Politics */}
        <div>
          <div className="flex justify-between text-sm mb-2 text-stone-600 font-medium">
            <span className="flex items-center gap-1">🏛️ 政治與地緣 <span className="text-xs text-stone-400">(Politics)</span></span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{prefs.politics}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={prefs.politics}
            onChange={(e) => handleSliderChange('politics', Number(e.target.value))}
            className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
          />
        </div>

        {/* Economics */}
        <div>
          <div className="flex justify-between text-sm mb-2 text-stone-600 font-medium">
            <span className="flex items-center gap-1">📈 經濟與市場 <span className="text-xs text-stone-400">(Economy)</span></span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{prefs.economics}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={prefs.economics}
            onChange={(e) => handleSliderChange('economics', Number(e.target.value))}
            className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
          />
        </div>

        {/* Lifestyle */}
        <div>
          <div className="flex justify-between text-sm mb-2 text-stone-600 font-medium">
            <span className="flex items-center gap-1">🏥 生活與健康 <span className="text-xs text-stone-400">(Lifestyle)</span></span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{prefs.lifestyle}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={prefs.lifestyle}
            onChange={(e) => handleSliderChange('lifestyle', Number(e.target.value))}
            className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
          />
        </div>

        {/* AI Summary Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-yellow-100 mt-2 cursor-pointer" onClick={toggleAiSummary}>
          <div className="flex items-center gap-2 text-stone-700">
            <Zap className={`w-4 h-4 ${prefs.includeAiSummary ? 'text-yellow-500 fill-yellow-500' : 'text-stone-400'}`} />
            <span className="text-sm font-medium">包含 AI 總結與延伸觀點</span>
          </div>
          <div
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
              prefs.includeAiSummary ? 'bg-yellow-400' : 'bg-stone-200'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                prefs.includeAiSummary ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm text-sm"
        >
          <Check className="w-4 h-4" />
          確認並傳送設定 (Confirm)
        </button>
      </div>
    </div>
  );
};