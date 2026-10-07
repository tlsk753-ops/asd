import React, { useRef, useState, useCallback, useId } from 'react';
import { Point, TriangleState, TriangleMetrics } from '../types/geometry';
import { PRESET_TRIANGLES } from '../utils/geometryMath';
import {
  RotateCcw,
  Compass,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
  Crosshair,
  Layers,
} from 'lucide-react';

interface GeometryCanvasProps {
  triangle: TriangleState;
  metrics: TriangleMetrics;
  onTriangleChange: (newState: TriangleState) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
}

export type FocusMode = 'both' | 'circumcenter' | 'incenter';

export const GeometryCanvas: React.FC<GeometryCanvasProps> = ({
  triangle,
  metrics,
  onTriangleChange,
  scale,
  onScaleChange,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeVertex, setActiveVertex] = useState<'a' | 'b' | 'c' | null>(null);
  const [focusMode, setFocusMode] = useState<FocusMode>('both');

  // Visualization toggles
  const [showCircles, setShowCircles] = useState(true);
  const [showConstructionLines, setShowConstructionLines] = useState(true);
  const [showDistances, setShowDistances] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [showSideLengths, setShowSideLengths] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showIncenterAngleRelation, setShowIncenterAngleRelation] = useState(true);

  const canvasWidth = 640;
  const canvasHeight = 520;
  const gridPatternId = useId();

  // Convert client pointer to SVG coordinate space
  const getSVGCoordinates = useCallback(
    (clientX: number, clientY: number): Point | null => {
      if (!svgRef.current) return null;
      const svg = svgRef.current;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const point = svg.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      const svgPoint = point.matrixTransform(ctm.inverse());
      return {
        x: Math.max(30, Math.min(canvasWidth - 30, svgPoint.x)),
        y: Math.max(30, Math.min(canvasHeight - 30, svgPoint.y)),
      };
    },
    [canvasWidth, canvasHeight]
  );

  const handlePointerDown = (vertex: 'a' | 'b' | 'c') => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveVertex(vertex);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeVertex) return;
    const pt = getSVGCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    onTriangleChange({
      ...triangle,
      [activeVertex]: pt,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeVertex) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setActiveVertex(null);
    }
  };

  // Helper for quick right-triangle snap
  const snapToRightTriangle = () => {
    const b = { x: 180, y: 400 };
    const c = { x: 460, y: 400 };
    const a = { x: 180, y: 160 };
    onTriangleChange({ a, b, c });
  };

  // Helper for quick equilateral snap
  const snapToEquilateral = () => {
    const side = 280;
    const height = (side * Math.sqrt(3)) / 2;
    const midX = 320;
    const baseY = 400;
    onTriangleChange({
      a: { x: midX, y: baseY - height },
      b: { x: midX - side / 2, y: baseY },
      c: { x: midX + side / 2, y: baseY },
    });
  };

  // Helper for obtuse snap
  const snapToObtuse = () => {
    onTriangleChange({
      a: { x: 320, y: 300 },
      b: { x: 140, y: 390 },
      c: { x: 500, y: 390 },
    });
  };

  const { A, B, C, circumcenter, incenter, circumradius, inradius } = metrics;

  // Arc path generator for angle visualization
  const createAngleArc = (vertex: Point, p1: Point, p2: Point, radius = 24) => {
    const a1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const a2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let diff = a2 - a1;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;

    const startAngle = a1;
    const endAngle = a1 + diff;
    const sx = vertex.x + Math.cos(startAngle) * radius;
    const sy = vertex.y + Math.sin(startAngle) * radius;
    const ex = vertex.x + Math.cos(endAngle) * radius;
    const ey = vertex.y + Math.sin(endAngle) * radius;
    const largeArc = Math.abs(diff) > Math.PI ? 1 : 0;
    const sweep = diff > 0 ? 1 : 0;

    return `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${ex} ${ey}`;
  };

  // Helper to find midpoint angle position for placing angle text labels
  const getMidAnglePos = (vertex: Point, p1: Point, p2: Point, radius: number): Point => {
    const a1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const a2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let diff = a2 - a1;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    const midAngle = a1 + diff / 2;
    return {
      x: vertex.x + Math.cos(midAngle) * radius,
      y: vertex.y + Math.sin(midAngle) * radius,
    };
  };

  // Helper to extend perpendicular bisector across the canvas
  const getPerpendicularBisectorLine = (p1: Point, p2: Point) => {
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Perpendicular vector (-dy, dx)
    const len = Math.hypot(dx, dy);
    if (len === 0) return { x1: mid.x, y1: mid.y, x2: mid.x, y2: mid.y };
    const nx = -dy / len;
    const ny = dx / len;
    const extend = 260;
    return {
      x1: mid.x - nx * extend,
      y1: mid.y - ny * extend,
      x2: mid.x + nx * extend,
      y2: mid.y + ny * extend,
    };
  };

  const bisectorBC = getPerpendicularBisectorLine(B, C);
  const bisectorCA = getPerpendicularBisectorLine(C, A);
  const bisectorAB = getPerpendicularBisectorLine(A, B);

  const isCircumActive = focusMode === 'both' || focusMode === 'circumcenter';
  const isIncenterActive = focusMode === 'both' || focusMode === 'incenter';

  // Points and positions for incenter base-angles relationship (∠BIC = 90° + 1/2∠A)
  const midBPos = getMidAnglePos(B, C, incenter, 38);
  const midCPos = getMidAnglePos(C, incenter, B, 38);
  const midBicPos = getMidAnglePos(incenter, B, C, 34);

  return (
    <div className="flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Canvas Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/90 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setFocusMode('both')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              focusMode === 'both'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            외심 & 내심 동시 비교
          </button>
          <button
            onClick={() => setFocusMode('circumcenter')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              focusMode === 'circumcenter'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            외심(O) 집중
          </button>
          <button
            onClick={() => setFocusMode('incenter')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              focusMode === 'incenter'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            내심(I) 집중
          </button>
        </div>

        {/* Quick Shape Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">원클릭 변형:</span>
          <button
            onClick={snapToRightTriangle}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40 transition-colors"
            title="외심이 빗변의 중점에 오는지 확인"
          >
            직각삼각형
          </button>
          <button
            onClick={snapToObtuse}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/40 transition-colors"
            title="외심이 삼각형 외부로 나가는 모습 확인"
          >
            둔각삼각형
          </button>
          <button
            onClick={snapToEquilateral}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/40 transition-colors"
            title="외심과 내심이 일치(O=I)하는 상태 확인"
          >
            정삼각형
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative w-full bg-slate-900 select-none overflow-hidden flex items-center justify-center p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="w-full h-auto max-h-[540px] touch-none cursor-crosshair drop-shadow-md"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            {/* Blueprint Grid pattern */}
            <pattern
              id={gridPatternId}
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            </pattern>
            {/* Circumcenter Radial Gradient */}
            <radialGradient id="circumGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </radialGradient>
            {/* Incircle Radial Gradient */}
            <radialGradient id="incenterGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          {showGrid && (
            <rect
              width={canvasWidth}
              height={canvasHeight}
              fill={`url(#${gridPatternId})`}
            />
          )}

          {/* 1. Circumcircle (외접원) */}
          {isCircumActive && showCircles && circumradius > 0 && circumradius < 2000 && (
            <g className="transition-all duration-75">
              <circle
                cx={circumcenter.x}
                cy={circumcenter.y}
                r={circumradius}
                fill="url(#circumGradient)"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="6 3"
                className="opacity-80"
              />
            </g>
          )}

          {/* 2. Incircle (내접원) */}
          {isIncenterActive && showCircles && inradius > 0 && (
            <g className="transition-all duration-75">
              <circle
                cx={incenter.x}
                cy={incenter.y}
                r={inradius}
                fill="url(#incenterGradient)"
                stroke="#34d399"
                strokeWidth="2.5"
                className="opacity-95"
              />
            </g>
          )}

          {/* 3. Construction Lines - Perpendicular Bisectors (수직이등분선) */}
          {isCircumActive && showConstructionLines && (
            <g className="opacity-40" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="4 4">
              <line
                x1={bisectorBC.x1}
                y1={bisectorBC.y1}
                x2={bisectorBC.x2}
                y2={bisectorBC.y2}
              />
              <line
                x1={bisectorCA.x1}
                y1={bisectorCA.y1}
                x2={bisectorCA.x2}
                y2={bisectorCA.y2}
              />
              <line
                x1={bisectorAB.x1}
                y1={bisectorAB.y1}
                x2={bisectorAB.x2}
                y2={bisectorAB.y2}
              />
            </g>
          )}

          {/* 4. Construction Lines - Angle Bisectors (내각의 이등분선) */}
          {isIncenterActive && showConstructionLines && (
            <g className="opacity-45" stroke="#6ee7b7" strokeWidth="1.2" strokeDasharray="3 3">
              <line x1={A.x} y1={A.y} x2={incenter.x} y2={incenter.y} />
              <line x1={B.x} y1={B.y} x2={incenter.x} y2={incenter.y} />
              <line x1={C.x} y1={C.y} x2={incenter.x} y2={incenter.y} />
            </g>
          )}

          {/* 5. Circumcenter Radii to Vertices (OA, OB, OC) */}
          {isCircumActive && showDistances && (
            <g stroke="#3b82f6" strokeWidth="1.6" strokeDasharray="2 2" className="opacity-75">
              <line x1={circumcenter.x} y1={circumcenter.y} x2={A.x} y2={A.y} />
              <line x1={circumcenter.x} y1={circumcenter.y} x2={B.x} y2={B.y} />
              <line x1={circumcenter.x} y1={circumcenter.y} x2={C.x} y2={C.y} />
            </g>
          )}

          {/* 6. Incenter Perpendiculars to Edges (Inradius r to sides) */}
          {isIncenterActive && showDistances && (
            <g stroke="#10b981" strokeWidth="1.8" className="opacity-80">
              <line
                x1={incenter.x}
                y1={incenter.y}
                x2={metrics.tangentBC.x}
                y2={metrics.tangentBC.y}
              />
              <line
                x1={incenter.x}
                y1={incenter.y}
                x2={metrics.tangentCA.x}
                y2={metrics.tangentCA.y}
              />
              <line
                x1={incenter.x}
                y1={incenter.y}
                x2={metrics.tangentAB.x}
                y2={metrics.tangentAB.y}
              />
              {/* Tangent points */}
              <circle cx={metrics.tangentBC.x} cy={metrics.tangentBC.y} r="3" fill="#10b981" />
              <circle cx={metrics.tangentCA.x} cy={metrics.tangentCA.y} r="3" fill="#10b981" />
              <circle cx={metrics.tangentAB.x} cy={metrics.tangentAB.y} r="3" fill="#10b981" />
            </g>
          )}

          {/* 6.5. Incenter Base-Angle Relationship (내심 밑각 보조선 및 각도 표시: ∠BIC = 90° + ½∠A) */}
          {isIncenterActive && showIncenterAngleRelation && (
            <g className="transition-all duration-75">
              {/* Highlighted triangle IBC interior wash */}
              <polygon
                points={`${incenter.x},${incenter.y} ${B.x},${B.y} ${C.x},${C.y}`}
                fill="rgba(16, 185, 129, 0.16)"
                stroke="#10b981"
                strokeWidth="1.6"
                strokeDasharray="4 2"
              />

              {/* Connecting auxiliary lines IB and IC */}
              <line
                x1={incenter.x}
                y1={incenter.y}
                x2={B.x}
                y2={B.y}
                stroke="#059669"
                strokeWidth="2.5"
              />
              <line
                x1={incenter.x}
                y1={incenter.y}
                x2={C.x}
                y2={C.y}
                stroke="#059669"
                strokeWidth="2.5"
              />

              {/* Arc for central angle ∠BIC at incenter */}
              <path
                d={createAngleArc(incenter, B, C, 28)}
                fill="none"
                stroke="#34d399"
                strokeWidth="3.2"
              />

              {/* Angle arc for lower half-angle at B (∠IBC) */}
              <path
                d={createAngleArc(B, C, incenter, 26)}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
              />
              {/* Angle arc for upper half-angle at B (∠ABI) */}
              <path
                d={createAngleArc(B, incenter, A, 32)}
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Angle arc for lower half-angle at C (∠ICB) */}
              <path
                d={createAngleArc(C, incenter, B, 26)}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
              />
              {/* Angle arc for upper half-angle at C (∠ACI) */}
              <path
                d={createAngleArc(C, A, incenter, 32)}
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Label at B for half-angle */}
              <text
                x={midBPos.x}
                y={midBPos.y}
                fill="#a7f3d0"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                className="select-none pointer-events-none drop-shadow"
              >
                ½∠B ({(metrics.angleB / 2).toFixed(0)}°)
              </text>

              {/* Label at C for half-angle */}
              <text
                x={midCPos.x}
                y={midCPos.y}
                fill="#a7f3d0"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                className="select-none pointer-events-none drop-shadow"
              >
                ½∠C ({(metrics.angleC / 2).toFixed(0)}°)
              </text>

              {/* Label badge at I for ∠BIC */}
              <g
                transform={`translate(${midBicPos.x}, ${midBicPos.y})`}
                className="select-none pointer-events-none"
              >
                <rect
                  x="-72"
                  y="-11"
                  width="144"
                  height="22"
                  rx="6"
                  fill="#064e3b"
                  fillOpacity="0.95"
                  stroke="#34d399"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="4"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ∠BIC = {(90 + metrics.angleA / 2).toFixed(1)}°
                </text>
              </g>
            </g>
          )}

          {/* 7. Triangle ABC Body & Sides */}
          <polygon
            points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
            fill="rgba(241, 245, 249, 0.08)"
            stroke="#f8fafc"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* 8. Angle Arcs & Degree Text */}
          {showAngles && (
            <g>
              <path
                d={createAngleArc(A, B, C, 26)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <path
                d={createAngleArc(B, C, A, 26)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <path
                d={createAngleArc(C, A, B, 26)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <text
                x={A.x}
                y={A.y - 20}
                fill="#fef08a"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                {metrics.angleA.toFixed(1)}°
              </text>
              <text
                x={B.x - 22}
                y={B.y + 20}
                fill="#fef08a"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                {metrics.angleB.toFixed(1)}°
              </text>
              <text
                x={C.x + 22}
                y={C.y + 20}
                fill="#fef08a"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                {metrics.angleC.toFixed(1)}°
              </text>
            </g>
          )}

          {/* 9. Side Length Labels */}
          {showSideLengths && (
            <g fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="500">
              <text x={metrics.midBC.x} y={metrics.midBC.y + 16}>
                a = {Math.round(metrics.sideA)}px
              </text>
              <text x={metrics.midCA.x + 14} y={metrics.midCA.y}>
                b = {Math.round(metrics.sideB)}px
              </text>
              <text x={metrics.midAB.x - 14} y={metrics.midAB.y}>
                c = {Math.round(metrics.sideC)}px
              </text>
            </g>
          )}

          {/* 10. Distance Line between O and I (Euler Line segment) */}
          {focusMode === 'both' && (
            <g>
              <line
                x1={circumcenter.x}
                y1={circumcenter.y}
                x2={incenter.x}
                y2={incenter.y}
                stroke="#e2e8f0"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                className="opacity-70"
              />
              {metrics.distOI > 15 && (
                <text
                  x={(circumcenter.x + incenter.x) / 2}
                  y={(circumcenter.y + incenter.y) / 2 - 6}
                  fill="#cbd5e1"
                  fontSize="10"
                  textAnchor="middle"
                  className="font-mono bg-slate-900"
                >
                  OI={Math.round(metrics.distOI)}
                </text>
              )}
            </g>
          )}

          {/* 11. Circumcenter Marker (O) */}
          {isCircumActive && (
            <g
              transform={`translate(${circumcenter.x}, ${circumcenter.y})`}
              className="cursor-pointer"
            >
              <circle r="9" fill="#1e40af" stroke="#93c5fd" strokeWidth="2.5" />
              <circle r="3" fill="#ffffff" />
              <rect
                x="12"
                y="-10"
                width="64"
                height="20"
                rx="4"
                fill="#1e3a8a"
                fillOpacity="0.85"
                stroke="#3b82f6"
                strokeWidth="1"
              />
              <text
                x="44"
                y="4"
                fill="#ffffff"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                외심 O
              </text>
            </g>
          )}

          {/* 12. Incenter Marker (I) */}
          {isIncenterActive && (
            <g
              transform={`translate(${incenter.x}, ${incenter.y})`}
              className="cursor-pointer"
            >
              <circle r="9" fill="#065f46" stroke="#6ee7b7" strokeWidth="2.5" />
              <circle r="3" fill="#ffffff" />
              <rect
                x="12"
                y="-10"
                width="64"
                height="20"
                rx="4"
                fill="#064e3b"
                fillOpacity="0.85"
                stroke="#10b981"
                strokeWidth="1"
              />
              <text
                x="44"
                y="4"
                fill="#ffffff"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                내심 I
              </text>
            </g>
          )}

          {/* 13. Draggable Vertices A, B, C */}
          {(['a', 'b', 'c'] as const).map((vKey) => {
            const pt = vKey === 'a' ? A : vKey === 'b' ? B : C;
            const label = vKey.toUpperCase();
            const isDragging = activeVertex === vKey;

            return (
              <g
                key={vKey}
                transform={`translate(${pt.x}, ${pt.y})`}
                onPointerDown={handlePointerDown(vKey)}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Large invisible touch hit area */}
                <circle r="26" fill="transparent" />
                {/* Glow ring when dragging */}
                {isDragging && (
                  <circle
                    r="18"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    className="animate-ping opacity-60"
                  />
                )}
                {/* Outer handle */}
                <circle
                  r="12"
                  fill="#ffffff"
                  stroke={isDragging ? '#0284c7' : '#475569'}
                  strokeWidth="3"
                  className="transition-transform duration-100 hover:scale-125"
                />
                {/* Inner dot */}
                <circle r="4" fill="#0f172a" />
                {/* Vertex Label */}
                <text
                  x="0"
                  y="-16"
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="select-none pointer-events-none drop-shadow"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Real-time Status Overlay pill in canvas */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs shadow-lg">
            <span className="font-semibold text-slate-200">
              {metrics.triangleType === 'acute'
                ? '예각삼각형 (세 각 < 90°)'
                : metrics.triangleType === 'right'
                ? '직각삼각형 (한 각 = 90°)'
                : '둔각삼각형 (한 각 > 90°)'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">
              {metrics.specialType === 'equilateral'
                ? '정삼각형'
                : metrics.specialType === 'isosceles'
                ? '이등변삼각형'
                : '일반 부등변삼각형'}
            </span>
          </div>

          {/* Circumcenter Live Position Callout */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md shadow-lg border ${
              metrics.circumcenterLocation === 'inside'
                ? 'bg-blue-950/80 text-blue-200 border-blue-500/50'
                : metrics.circumcenterLocation === 'on_hypotenuse'
                ? 'bg-amber-950/90 text-amber-200 border-amber-400 animate-pulse'
                : 'bg-rose-950/80 text-rose-200 border-rose-500/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>
              외심(O) 위치:{' '}
              {metrics.circumcenterLocation === 'inside'
                ? '삼각형 내부'
                : metrics.circumcenterLocation === 'on_hypotenuse'
                ? '★ 빗변의 중점 (직각삼각형)'
                : '삼각형 외부 (탈출!)'}
            </span>
          </div>

          {/* Incenter Live Position Callout */}
          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-200 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>내심(I) 위치: 언제나 삼각형 내부</span>
          </div>
        </div>

        {/* Real-time Incenter Base-Angle Property Proof Box (90° + 반각) */}
        {isIncenterActive && showIncenterAngleRelation && (
          <div className="hidden sm:flex flex-col absolute top-4 right-4 max-w-[270px] bg-slate-900/95 backdrop-blur-md border border-emerald-500/70 p-3 rounded-xl shadow-2xl text-xs text-slate-200 pointer-events-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80">
              <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                ★ 내심 밑각 성질 (90° + ½∠A)
              </span>
              <span className="text-[10px] text-emerald-300 font-mono">실시간 계산</span>
            </div>

            <div className="mt-2 space-y-1 font-mono text-[11px]">
              <div className="text-emerald-300 font-bold bg-emerald-950/70 px-2 py-1 rounded border border-emerald-800">
                ∠BIC = 90° + ½ × ∠A
              </div>
              <div className="text-slate-300 pl-1 text-[11px]">
                = 90° + ½({metrics.angleA.toFixed(1)}°)
              </div>
              <div className="text-slate-300 pl-1 text-[11px]">
                = 90° + {(metrics.angleA / 2).toFixed(1)}°
              </div>
              <div className="text-emerald-400 font-bold pl-1 pt-0.5 border-t border-slate-700 text-[11px]">
                = {(90 + metrics.angleA / 2).toFixed(1)}°
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-700/80 text-[10px] text-slate-300 leading-relaxed font-sans">
              <strong>원리:</strong> △IBC에서 밑각 절반 합{' '}
              <span className="text-emerald-300 font-mono">½(∠B+∠C)={((180 - metrics.angleA) / 2).toFixed(1)}°</span>이므로,{' '}
              ∠BIC = 180° - {((180 - metrics.angleA) / 2).toFixed(1)}° ={' '}
              <span className="text-emerald-300 font-bold">{(90 + metrics.angleA / 2).toFixed(1)}°</span>
            </div>
          </div>
        )}

        {/* Drag Instruction Banner */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-1 rounded-lg text-[11px] text-slate-300 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>꼭짓점 A, B, C를 마우스나 손가락으로 드래그해보세요!</span>
        </div>
      </div>

      {/* Layer Toggles and Scale Control Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white border-t border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            보조선:
          </span>
          <button
            onClick={() => setShowIncenterAngleRelation(!showIncenterAngleRelation)}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              showIncenterAngleRelation
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
            title="내심과 두 밑각의 연결선, 각의 이등분 각도 및 ∠BIC = 90°+½∠A 표시"
          >
            내심 밑각 관계 (90°+½∠A)
          </button>
          <button
            onClick={() => setShowCircles(!showCircles)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              showCircles
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            외접원·내접원
          </button>
          <button
            onClick={() => setShowConstructionLines(!showConstructionLines)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              showConstructionLines
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            작도선 (수직/각 이등분선)
          </button>
          <button
            onClick={() => setShowDistances(!showDistances)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              showDistances
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            거리선 (반지름 R / r)
          </button>
          <button
            onClick={() => setShowAngles(!showAngles)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              showAngles
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            각도 (°)
          </button>
          <button
            onClick={() => setShowSideLengths(!showSideLengths)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              showSideLengths
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            변의 길이
          </button>
        </div>

        {/* Scale Slider */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">크기 배율:</span>
          <input
            type="range"
            min="0.5"
            max="1.6"
            step="0.05"
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="w-24 accent-blue-600 cursor-pointer"
          />
          <span className="font-mono text-slate-700 w-10 text-right">
            {(scale * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
