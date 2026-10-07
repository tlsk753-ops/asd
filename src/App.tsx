/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TriangleState } from './types/geometry';
import { computeTriangleMetrics, PRESET_TRIANGLES, scaleTriangle } from './utils/geometryMath';
import { TopNav, MainTab } from './components/TopNav';
import { GeometryCanvas } from './components/GeometryCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SizeComparisonView } from './components/SizeComparisonView';
import { CurriculumMissions } from './components/CurriculumMissions';
import { PresetSelector } from './components/PresetSelector';
import { Sparkles, Info, Compass, ShieldCheck } from 'lucide-react';

const INITIAL_TRIANGLE: TriangleState = {
  a: { x: 320, y: 130 },
  b: { x: 160, y: 390 },
  c: { x: 480, y: 390 },
};

export default function App() {
  const [triangle, setTriangle] = useState<TriangleState>(INITIAL_TRIANGLE);
  const [scale, setScale] = useState<number>(1.0);
  const [currentTab, setCurrentTab] = useState<MainTab>('canvas');

  // Compute live geometric properties
  const metrics = useMemo(() => {
    return computeTriangleMetrics(triangle);
  }, [triangle]);

  const handleReset = () => {
    setTriangle(INITIAL_TRIANGLE);
    setScale(1.0);
  };

  const handleSelectPreset = (points: TriangleState) => {
    setTriangle(points);
    setScale(1.0);
  };

  const handleScaleChange = (newScale: number) => {
    if (newScale <= 0) return;
    const factor = newScale / scale;
    setTriangle((prev) => scaleTriangle(prev, factor));
    setScale(newScale);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 3-zone Header */}
      <TopNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between p-1 bg-slate-200/80 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setCurrentTab('canvas')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'canvas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            실시간 캔버스
          </button>
          <button
            onClick={() => setCurrentTab('comparison')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'comparison' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            외심·내심 비교
          </button>
          <button
            onClick={() => setCurrentTab('size_comparison')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'size_comparison' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            크기별 비교
          </button>
          <button
            onClick={() => setCurrentTab('missions')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'missions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            미션 &amp; 퀴즈
          </button>
        </div>

        {/* Tab 1: Live Interactive Canvas (Core Sandbox) */}
        {currentTab === 'canvas' && (
          <div className="flex flex-col gap-5">
            <PresetSelector
              onSelectPreset={handleSelectPreset}
              currentPoints={triangle}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Interactive Stage (7 cols on large desktop) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <GeometryCanvas
                  triangle={triangle}
                  metrics={metrics}
                  onTriangleChange={setTriangle}
                  scale={scale}
                  onScaleChange={handleScaleChange}
                />
              </div>

              {/* Real-time Properties & Formulas (5 cols on large desktop) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <PropertiesPanel metrics={metrics} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dedicated Comparison View */}
        {currentTab === 'comparison' && (
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                중학교 2학년 수학: 외심과 내심 총정리
              </h2>
              <p className="text-xs text-slate-500">
                수학 교과서 필수 개념을 표와 시각화로 한눈에 비교합니다.
              </p>
            </div>
            <PropertiesPanel metrics={metrics} />
          </div>
        )}

        {/* Tab 3: Size & Scale Comparison View */}
        {currentTab === 'size_comparison' && (
          <SizeComparisonView
            currentTriangle={triangle}
            onSelectTriangle={(t) => {
              setTriangle(t);
              setCurrentTab('canvas');
            }}
          />
        )}

        {/* Tab 4: Middle School Curriculum Missions & Quiz */}
        {currentTab === 'missions' && (
          <CurriculumMissions
            metrics={metrics}
            onApplyPreset={handleSelectPreset}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        중학교 2학년 2학기 기하 교육과정 · 삼각형의 성질 (외심과 내심) 인터랙티브 탐구실
      </footer>
    </div>
  );
}
