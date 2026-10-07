import React, { useState } from 'react';
import { TriangleState, TriangleMetrics } from '../types/geometry';
import { computeTriangleMetrics, scaleTriangle } from '../utils/geometryMath';
import { Maximize2, Scale, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

interface SizeComparisonViewProps {
  currentTriangle: TriangleState;
  onSelectTriangle: (triangle: TriangleState) => void;
}

export const SizeComparisonView: React.FC<SizeComparisonViewProps> = ({
  currentTriangle,
  onSelectTriangle,
}) => {
  // Scale factor comparison
  const [activeTab, setActiveTab] = useState<'scaling' | 'types'>('scaling');
  const [scaleK, setScaleK] = useState<number>(1.5);

  // Scaled version of current triangle
  const baseMetrics = computeTriangleMetrics(currentTriangle);
  const scaledTriangle = scaleTriangle(currentTriangle, scaleK);
  const scaledMetrics = computeTriangleMetrics(scaledTriangle);

  // Type comparison presets
  const acuteSample: TriangleState = {
    a: { x: 150, y: 50 },
    b: { x: 50, y: 220 },
    c: { x: 250, y: 220 },
  };
  const rightSample: TriangleState = {
    a: { x: 70, y: 60 },
    b: { x: 70, y: 220 },
    c: { x: 230, y: 220 },
  };
  const obtuseSample: TriangleState = {
    a: { x: 150, y: 160 },
    b: { x: 40, y: 220 },
    c: { x: 260, y: 220 },
  };

  const acuteMetrics = computeTriangleMetrics(acuteSample);
  const rightMetrics = computeTriangleMetrics(rightSample);
  const obtuseMetrics = computeTriangleMetrics(obtuseSample);

  // Mini canvas renderer for comparison cards
  const renderMiniCanvas = (
    metrics: TriangleMetrics,
    label: string,
    width = 300,
    height = 250
  ) => {
    const { A, B, C, circumcenter, incenter, circumradius, inradius, circumcenterLocation } =
      metrics;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44 bg-slate-900 rounded-xl drop-shadow"
      >
        {/* Circumcircle */}
        {circumradius > 0 && circumradius < 500 && (
          <circle
            cx={circumcenter.x}
            cy={circumcenter.y}
            r={circumradius}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />
        )}

        {/* Incircle */}
        {inradius > 0 && (
          <circle
            cx={incenter.x}
            cy={incenter.y}
            r={inradius}
            fill="rgba(16, 185, 129, 0.15)"
            stroke="#34d399"
            strokeWidth="1.8"
          />
        )}

        {/* Triangle ABC */}
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="rgba(255, 255, 255, 0.08)"
          stroke="#f8fafc"
          strokeWidth="2"
        />

        {/* Vertices */}
        <circle cx={A.x} cy={A.y} r="4" fill="#ffffff" />
        <circle cx={B.x} cy={B.y} r="4" fill="#ffffff" />
        <circle cx={C.x} cy={C.y} r="4" fill="#ffffff" />

        {/* Circumcenter O */}
        <circle cx={circumcenter.x} cy={circumcenter.y} r="6" fill="#2563eb" stroke="#93c5fd" />
        <text
          x={circumcenter.x}
          y={circumcenter.y - 8}
          fill="#93c5fd"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          O
        </text>

        {/* Incenter I */}
        <circle cx={incenter.x} cy={incenter.y} r="6" fill="#059669" stroke="#6ee7b7" />
        <text
          x={incenter.x}
          y={incenter.y + 14}
          fill="#6ee7b7"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          I
        </text>
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Mode Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            삼각형 크기별 & 형태별 외심·내심 비교실
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            크기(배율)를 바꿨을 때 반지름과 넓이가 어떻게 변하는지, 세 가지 삼각형 형태의 차이를 탐구합니다.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('scaling')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'scaling'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            크기 배율(닮음) 비교
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'types'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            예각·직각·둔각 3단 비교
          </button>
        </div>
      </div>

      {activeTab === 'scaling' ? (
        <div className="flex flex-col gap-5">
          {/* Scaling Slider Control */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  도형 확대 배율: <span className="text-blue-600 font-mono">{scaleK}배</span>
                </div>
                <div className="text-xs text-slate-500">
                  슬라이더를 움직여 현재 삼각형의 크기를 확대하고 수치 변화를 관찰해보세요.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-mono text-slate-500">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={scaleK}
                onChange={(e) => setScaleK(parseFloat(e.target.value))}
                className="w-48 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-500">2.0x</span>
            </div>
          </div>

          {/* Mathematical Scaling Law Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  기준 삼각형 (1.0배)
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                  {baseMetrics.triangleType === 'acute'
                    ? '예각'
                    : baseMetrics.triangleType === 'right'
                    ? '직각'
                    : '둔각'}
                </span>
              </div>
              {renderMiniCanvas(baseMetrics, '기준 삼각형', 640, 520)}

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-400 text-[10px]">외접원 반지름 R</div>
                  <div className="font-bold text-blue-700">{baseMetrics.circumradius.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-400 text-[10px]">내접원 반지름 r</div>
                  <div className="font-bold text-emerald-700">{baseMetrics.inradius.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-400 text-[10px]">삼각형 둘레</div>
                  <div className="font-bold text-slate-800">{baseMetrics.perimeter.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-400 text-[10px]">삼각형 넓이 S</div>
                  <div className="font-bold text-slate-800">{baseMetrics.area.toFixed(0)}</div>
                </div>
              </div>
            </div>

            {/* Scaled Card */}
            <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  확대 삼각형 ({scaleK}배)
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 font-mono text-blue-800">
                  비율 변화 관찰
                </span>
              </div>
              {renderMiniCanvas(scaledMetrics, `${scaleK}배 확대`, 640, 520)}

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200">
                  <div className="text-blue-500 text-[10px]">외접원 R (×{scaleK})</div>
                  <div className="font-bold text-blue-700">{scaledMetrics.circumradius.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                  <div className="text-emerald-500 text-[10px]">내접원 r (×{scaleK})</div>
                  <div className="font-bold text-emerald-700">{scaledMetrics.inradius.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-400 text-[10px]">둘레 (×{scaleK})</div>
                  <div className="font-bold text-slate-800">{scaledMetrics.perimeter.toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-slate-400 text-[10px]">넓이 (×{(scaleK * scaleK).toFixed(2)})</div>
                  <div className="font-bold text-slate-800">{scaledMetrics.area.toFixed(0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Conclusion for Middle Schoolers */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex flex-col gap-2">
            <div className="font-bold text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              중2 수학 핵심 원리: 닮음비와 외심·내심의 성질
            </div>
            <ul className="space-y-1 list-disc list-inside text-slate-700">
              <li>
                <strong>길이 비율:</strong> 삼각형을 <span className="font-bold text-blue-700">{scaleK}배</span> 확대하면, 변의 길이뿐만 아니라 <strong>외접원의 반지름(R)과 내접원의 반지름(r)도 정확히 {scaleK}배</strong>가 됩니다.
              </li>
              <li>
                <strong>넓이 비율:</strong> 삼각형의 넓이는 <span className="font-bold text-blue-700">닮음비의 제곱인 {(scaleK * scaleK).toFixed(2)}배</span>로 늘어납니다.
              </li>
              <li>
                <strong>위치의 불변성:</strong> 크기가 아무리 커지거나 작아져도 외심이 ‘내부/빗변 중점/외부’에 위치하는 성질은 모양이 변하지 않는 한 <strong>그대로 유지</strong>됩니다!
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* Acute vs Right vs Obtuse side-by-side comparison */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Acute */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">1. 예각삼각형</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                세 각 모두 &lt; 90°
              </span>
            </div>
            {renderMiniCanvas(acuteMetrics, '예각삼각형')}
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700">외심(O):</span>
                <span>삼각형의 내부</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-700">내심(I):</span>
                <span>삼각형의 내부</span>
              </div>
            </div>
            <button
              onClick={() => onSelectTriangle(acuteSample)}
              className="mt-2 w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-600 hover:text-white transition-colors"
            >
              이 삼각형으로 탐구하기
            </button>
          </div>

          {/* Card 2: Right */}
          <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm flex flex-col gap-3 ring-2 ring-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">2. 직각삼각형</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">
                ★ 시험 빈출 1위
              </span>
            </div>
            {renderMiniCanvas(rightMetrics, '직각삼각형')}
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700">외심(O):</span>
                <span className="font-bold text-amber-700">빗변의 정확한 중점</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-700">내심(I):</span>
                <span>삼각형의 내부</span>
              </div>
            </div>
            <button
              onClick={() => onSelectTriangle(rightSample)}
              className="mt-2 w-full py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              이 삼각형으로 탐구하기
            </button>
          </div>

          {/* Card 3: Obtuse */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">3. 둔각삼각형</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                한 각 &gt; 90°
              </span>
            </div>
            {renderMiniCanvas(obtuseMetrics, '둔각삼각형')}
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700">외심(O):</span>
                <span className="font-bold text-rose-700">삼각형의 외부 (탈출)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-700">내심(I):</span>
                <span>삼각형의 내부</span>
              </div>
            </div>
            <button
              onClick={() => onSelectTriangle(obtuseSample)}
              className="mt-2 w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-rose-600 hover:text-white transition-colors"
            >
              이 삼각형으로 탐구하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
