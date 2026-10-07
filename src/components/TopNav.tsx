import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

export type MainTab = 'canvas' | 'comparison' | 'size_comparison' | 'missions';

interface TopNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onReset: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentTab, onTabChange, onReset }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <span className="text-lg font-bold tracking-tight text-slate-900 select-none">
        외심과 내심 기하 탐구실
      </span>

      {/* Zone 2: 4 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onTabChange('canvas')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
            currentTab === 'canvas' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          실시간 캔버스
        </button>
        <button
          onClick={() => onTabChange('comparison')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
            currentTab === 'comparison' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          외심·내심 비교표
        </button>
        <button
          onClick={() => onTabChange('size_comparison')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
            currentTab === 'size_comparison' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          크기별 비교
        </button>
        <button
          onClick={() => onTabChange('missions')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
            currentTab === 'missions' ? 'text-blue-600 font-semibold' : ''
          }`}
        >
          탐구 미션 &amp; 퀴즈
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          초기화
        </button>
      </div>
    </header>
  );
};
