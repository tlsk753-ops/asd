import React from 'react';
import { PRESET_TRIANGLES } from '../utils/geometryMath';
import { TriangleState } from '../types/geometry';

interface PresetSelectorProps {
  onSelectPreset: (presetPoints: TriangleState) => void;
  currentPoints: TriangleState;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelectPreset }) => {
  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800">
          중2 교과서 표준 삼각형 프리셋
        </span>
        <span className="text-[11px] text-slate-400">클릭 시 캔버스에 즉시 반영</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PRESET_TRIANGLES.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset.points)}
            className="p-2 rounded-xl text-left border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex flex-col gap-1 cursor-pointer group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 truncate">
              {preset.name}
            </div>
            <div className="text-[10px] text-slate-500 line-clamp-1">
              {preset.badge}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
