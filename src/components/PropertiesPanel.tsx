import React from 'react';
import { TriangleMetrics } from '../types/geometry';
import { Check, ShieldCheck, HelpCircle, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

interface PropertiesPanelProps {
  metrics: TriangleMetrics;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ metrics }) => {
  const {
    A,
    B,
    C,
    sideA,
    sideB,
    sideC,
    perimeter,
    angleA,
    angleB,
    angleC,
    area,
    triangleType,
    specialType,
    circumcenter,
    circumradius,
    circumcenterLocation,
    incenter,
    inradius,
    distOI,
    angleBOC,
    angleBIC,
  } = metrics;

  // Middle school angle formula theoretical values
  const theoreticalAngleBOC = 2 * angleA;
  const theoreticalAngleBIC = 90 + angleA / 2;

  // Incenter area verification: S = 1/2 * r * (a + b + c)
  const incenterAreaCalculated = 0.5 * inradius * perimeter;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Comparison Header Card */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-blue-600 tracking-wide">
              중2 기하 완전정복
            </span>
            <h2 className="text-base font-bold text-slate-900">
              외심(O)과 내심(I) 핵심 성질 비교표
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {triangleType === 'acute'
              ? '예각삼각형'
              : triangleType === 'right'
              ? '직각삼각형'
              : '둔각삼각형'}
            {specialType !== 'scalene' && ` · ${specialType === 'equilateral' ? '정삼각형' : '이등변삼각형'}`}
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
          {/* Circumcenter Column */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="font-bold text-blue-900 text-sm">외심 (Circumcenter, O)</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-medium">
                외접원의 중심
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-700">
              <div>
                <span className="font-semibold text-blue-950">작도 방법:</span>{' '}
                <span className="text-slate-800">세 변의 수직이등분선의 교점</span>
              </div>
              <div>
                <span className="font-semibold text-blue-950">핵심 성질:</span>{' '}
                <span className="text-slate-800">세 꼭짓점에 이르는 거리가 같다</span>
                <div className="mt-0.5 font-mono text-[11px] text-blue-700 font-semibold bg-white/70 px-2 py-0.5 rounded border border-blue-100 inline-block">
                  OA = OB = OC = R ({circumradius.toFixed(1)}px)
                </div>
              </div>

              <div>
                <span className="font-semibold text-blue-950">삼각형별 위치:</span>
                <div className="mt-1 p-2 rounded-lg bg-white border border-blue-100 text-[11px]">
                  <div
                    className={
                      circumcenterLocation === 'inside'
                        ? 'font-bold text-blue-700'
                        : 'text-slate-500'
                    }
                  >
                    • 예각삼각형 → <span className="underline">내부</span>
                  </div>
                  <div
                    className={
                      circumcenterLocation === 'on_hypotenuse'
                        ? 'font-bold text-amber-700 bg-amber-50 px-1 rounded'
                        : 'text-slate-500'
                    }
                  >
                    • 직각삼각형 → <span className="underline font-bold">빗변의 중점 (★시험 1위)</span>
                  </div>
                  <div
                    className={
                      circumcenterLocation === 'outside'
                        ? 'font-bold text-rose-700 bg-rose-50 px-1 rounded'
                        : 'text-slate-500'
                    }
                  >
                    • 둔각삼각형 → <span className="underline">삼각형의 외부 (탈출)</span>
                  </div>
                </div>
              </div>

              {/* Angle Relationship */}
              <div className="pt-1 border-t border-blue-100">
                <span className="font-semibold text-blue-950">중심각 성질:</span>
                <div className="text-[11px] text-slate-800 mt-0.5">
                  <span className="font-mono text-blue-800 font-bold">∠BOC = 2 × ∠A</span>
                  <div className="text-slate-600">
                    2 × {angleA.toFixed(1)}° = <span className="font-semibold text-blue-700">{theoreticalAngleBOC.toFixed(1)}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Incenter Column */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="font-bold text-emerald-900 text-sm">내심 (Incenter, I)</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                내접원의 중심
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-700">
              <div>
                <span className="font-semibold text-emerald-950">작도 방법:</span>{' '}
                <span className="text-slate-800">세 내각의 이등분선의 교점</span>
              </div>
              <div>
                <span className="font-semibold text-emerald-950">핵심 성질:</span>{' '}
                <span className="text-slate-800">세 변에 이르는 거리가 같다</span>
                <div className="mt-0.5 font-mono text-[11px] text-emerald-700 font-semibold bg-white/70 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                  내접원 반지름 r = {inradius.toFixed(1)}px
                </div>
              </div>

              <div>
                <span className="font-semibold text-emerald-950">삼각형별 위치:</span>
                <div className="mt-1 p-2 rounded-lg bg-white border border-emerald-100 text-[11px]">
                  <div className="font-bold text-emerald-700">
                    • 모든 삼각형 → <span className="underline">언제나 삼각형 내부!</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    삼각형 안에 쏙 들어가는 원의 중심이므로 예각·직각·둔각 상관없이 밖으로 나갈 수 없습니다.
                  </p>
                </div>
              </div>

              {/* Angle Relationship */}
              <div className="pt-1 border-t border-emerald-100">
                <span className="font-semibold text-emerald-950">각도 성질:</span>
                <div className="text-[11px] text-slate-800 mt-0.5">
                  <span className="font-mono text-emerald-800 font-bold">∠BIC = 90° + ½ × ∠A</span>
                  <div className="text-slate-600">
                    90° + ½({angleA.toFixed(1)}°) = <span className="font-semibold text-emerald-700">{theoreticalAngleBIC.toFixed(1)}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Middle School Formula Lab (실시간 검증 실험실) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          중2 시험 빈출! 실시간 공식 검증 실험실
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Formula 1: S = 1/2 * r * (a + b + c) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>내접원 반지름으로 삼각형 넓이 구하기</span>
              <span className="text-[11px] text-emerald-600 font-mono font-bold">100% 일치</span>
            </div>
            <div className="font-mono text-emerald-700 font-bold text-sm my-1.5 bg-emerald-50 px-2 py-1 rounded">
              S = ½ × r × (a + b + c)
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              둘레: <span className="font-mono">{perimeter.toFixed(1)}</span> · 내접원 r:{' '}
              <span className="font-mono">{inradius.toFixed(1)}</span>
              <br />
              계산값: ½ × {inradius.toFixed(1)} × {perimeter.toFixed(1)} ={' '}
              <span className="font-bold text-slate-900">{incenterAreaCalculated.toFixed(0)}</span>
              <br />
              실제 넓이: <span className="font-bold text-slate-900">{area.toFixed(0)}</span>
            </p>
          </div>

          {/* Formula 2: Special properties of Equilateral & Isosceles */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>정삼각형과 이등변삼각형의 비밀</span>
              <span className="text-[11px] text-blue-600 font-mono font-bold">
                거리 OI = {distOI.toFixed(1)}px
              </span>
            </div>
            <div className="space-y-1 mt-1 text-[11px] text-slate-700">
              <div className="flex items-start gap-1">
                <span className="font-bold text-indigo-600">•</span>
                <span>
                  <strong>정삼각형:</strong> 외심(O)과 내심(I)이 완전히 같은 위치에 포개집니다 (거리 = 0).
                </span>
              </div>
              <div className="flex items-start gap-1">
                <span className="font-bold text-indigo-600">•</span>
                <span>
                  <strong>이등변삼각형:</strong> 꼭지각의 이등분선(대칭선) 위에 외심과 내심이 일직선으로 정렬됩니다.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Triangle Metrics Live Inspector */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900">도형 세부 측정값</h3>
          <span className="text-xs text-slate-400">실시간 측정 중</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
            <div className="text-slate-400 text-[10px]">각 A / B / C</div>
            <div className="font-bold text-slate-800 font-mono mt-0.5">
              {angleA.toFixed(0)}° / {angleB.toFixed(0)}° / {angleC.toFixed(0)}°
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
            <div className="text-slate-400 text-[10px]">변 a / b / c</div>
            <div className="font-bold text-slate-800 font-mono mt-0.5">
              {sideA.toFixed(0)} / {sideB.toFixed(0)} / {sideC.toFixed(0)}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
            <div className="text-slate-400 text-[10px]">외접원 R / 내접원 r</div>
            <div className="font-bold text-slate-800 font-mono mt-0.5">
              {circumradius.toFixed(0)} / {inradius.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
