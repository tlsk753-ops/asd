import { Point, TriangleMetrics, TriangleState, TriangleType, SpecialType, PresetTriangle } from '../types/geometry';

export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

export function angleAt(vertex: Point, p1: Point, p2: Point): number {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.hypot(v1.x, v1.y);
  const mag2 = Math.hypot(v2.x, v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

export function projectPointToSegment(p: Point, a: Point, b: Point): Point {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const abLenSq = ab.x * ab.x + ab.y * ab.y;
  if (abLenSq === 0) return { ...a };
  const ap = { x: p.x - a.x, y: p.y - a.y };
  const t = (ap.x * ab.x + ap.y * ab.y) / abLenSq;
  return {
    x: a.x + t * ab.x,
    y: a.y + t * ab.y,
  };
}

export function isPointInsideTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  // Cross products sign method
  const cross1 = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const cross2 = (c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x);
  const cross3 = (a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x);

  const hasNeg = cross1 < -1e-4 || cross2 < -1e-4 || cross3 < -1e-4;
  const hasPos = cross1 > 1e-4 || cross2 > 1e-4 || cross3 > 1e-4;

  return !(hasNeg && hasPos);
}

export function computeTriangleMetrics(state: TriangleState): TriangleMetrics {
  const { a: A, b: B, c: C } = state;

  const sideA = distance(B, C);
  const sideB = distance(C, A);
  const sideC = distance(A, B);
  const perimeter = sideA + sideB + sideC;

  const angleA = angleAt(A, B, C);
  const angleB = angleAt(B, A, C);
  const angleC = angleAt(C, A, B);

  // Area via Shoelace Formula
  const area = Math.abs(A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)) / 2;

  // Triangle Classification
  const maxAngle = Math.max(angleA, angleB, angleC);
  let triangleType: TriangleType = 'acute';
  if (Math.abs(maxAngle - 90) <= 1.2) {
    triangleType = 'right';
  } else if (maxAngle > 90) {
    triangleType = 'obtuse';
  }

  // Special classification
  let specialType: SpecialType = 'scalene';
  const sideDiff1 = Math.abs(sideA - sideB);
  const sideDiff2 = Math.abs(sideB - sideC);
  const sideDiff3 = Math.abs(sideC - sideA);
  const avgSide = perimeter / 3;
  const tolerance = avgSide * 0.05;

  if (sideDiff1 < tolerance && sideDiff2 < tolerance && sideDiff3 < tolerance) {
    specialType = 'equilateral';
  } else if (sideDiff1 < tolerance || sideDiff2 < tolerance || sideDiff3 < tolerance) {
    specialType = 'isosceles';
  }

  // Circumcenter (O)
  const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  let circumcenter: Point;
  let circumradius: number;

  if (Math.abs(D) < 1e-5) {
    circumcenter = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
    circumradius = 0;
  } else {
    const A2 = A.x * A.x + A.y * A.y;
    const B2 = B.x * B.x + B.y * B.y;
    const C2 = C.x * C.x + C.y * C.y;

    circumcenter = {
      x: (A2 * (B.y - C.y) + B2 * (C.y - A.y) + C2 * (A.y - B.y)) / D,
      y: (A2 * (C.x - B.x) + B2 * (A.x - C.x) + C2 * (B.x - A.x)) / D,
    };
    circumradius = distance(circumcenter, A);
  }

  // Circumcenter location
  let circumcenterLocation: 'inside' | 'on_hypotenuse' | 'outside' = 'inside';
  if (triangleType === 'right') {
    circumcenterLocation = 'on_hypotenuse';
  } else if (triangleType === 'obtuse') {
    circumcenterLocation = 'outside';
  } else {
    circumcenterLocation = 'inside';
  }

  // Incenter (I)
  const safeP = perimeter > 0 ? perimeter : 1;
  const incenter: Point = {
    x: (sideA * A.x + sideB * B.x + sideC * C.x) / safeP,
    y: (sideA * A.y + sideB * B.y + sideC * C.y) / safeP,
  };
  const inradius = safeP > 0 ? (2 * area) / safeP : 0;

  // Midpoints of sides
  const midBC = midpoint(B, C);
  const midCA = midpoint(C, A);
  const midAB = midpoint(A, B);

  // Incircle tangent points
  const tangentBC = projectPointToSegment(incenter, B, C);
  const tangentCA = projectPointToSegment(incenter, C, A);
  const tangentAB = projectPointToSegment(incenter, A, B);

  const distOI = distance(circumcenter, incenter);

  // Theoretical / actual angles
  const angleBOC = angleAt(circumcenter, B, C);
  const angleBIC = angleAt(incenter, B, C);

  return {
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
    midBC,
    midCA,
    midAB,
    tangentBC,
    tangentCA,
    tangentAB,
    angleBOC,
    angleBIC,
  };
}

export function scaleTriangle(state: TriangleState, scaleFactor: number): TriangleState {
  const centroid = {
    x: (state.a.x + state.b.x + state.c.x) / 3,
    y: (state.a.y + state.b.y + state.c.y) / 3,
  };

  return {
    a: {
      x: centroid.x + (state.a.x - centroid.x) * scaleFactor,
      y: centroid.y + (state.a.y - centroid.y) * scaleFactor,
    },
    b: {
      x: centroid.x + (state.b.x - centroid.x) * scaleFactor,
      y: centroid.y + (state.b.y - centroid.y) * scaleFactor,
    },
    c: {
      x: centroid.x + (state.c.x - centroid.x) * scaleFactor,
      y: centroid.y + (state.c.y - centroid.y) * scaleFactor,
    },
  };
}

// Preset triangles tailored for Korean Middle School 2nd Grade Math curriculum
export const PRESET_TRIANGLES: PresetTriangle[] = [
  {
    id: 'acute_standard',
    name: '일반 예각삼각형',
    category: 'acute',
    badge: '세 각 모두 90° 미만',
    description: '외심(O)과 내심(I)이 모두 삼각형 내부에 위치하는 표준 예각삼각형입니다.',
    points: {
      a: { x: 300, y: 120 },
      b: { x: 140, y: 380 },
      c: { x: 460, y: 380 },
    },
  },
  {
    id: 'right_345',
    name: '직각삼각형 (3:4:5)',
    category: 'right',
    badge: '중2 시험 단골! 빗변의 중점',
    description: '한 각이 90°인 직각삼각형입니다. 외심(O)이 빗변의 정확한 중점에 위치합니다!',
    points: {
      a: { x: 180, y: 160 },
      b: { x: 180, y: 400 },
      c: { x: 460, y: 400 },
    },
  },
  {
    id: 'right_large',
    name: '큰 직각삼각형 (6:8:10 비율)',
    category: 'right',
    badge: '크기 2배 확장',
    description: '3:4:5 삼각형을 2배 확대한 모형입니다. 외심은 여전히 빗변 중점에 머물며, 외접원·내접원 반지름도 2배가 됩니다.',
    points: {
      a: { x: 140, y: 80 },
      b: { x: 140, y: 440 },
      c: { x: 500, y: 440 },
    },
  },
  {
    id: 'obtuse_standard',
    name: '둔각삼각형 (한 각 > 90°)',
    category: 'obtuse',
    badge: '외심이 외부로 탈출!',
    description: '꼭짓점 A가 둔각(>90°)이 되면서 외심(O)이 삼각형 바깥(외부)으로 이동합니다. 반면 내심(I)은 여전히 내부입니다.',
    points: {
      a: { x: 300, y: 280 },
      b: { x: 130, y: 380 },
      c: { x: 470, y: 380 },
    },
  },
  {
    id: 'equilateral_standard',
    name: '정삼각형',
    category: 'special',
    badge: '외심과 내심 일치 (O = I)',
    description: '세 변의 길이와 세 각(60°)이 모두 같은 정삼각형입니다. 외심과 내심, 무게중심이 정확히 한 점에서 일치합니다.',
    points: {
      a: { x: 300, y: 130 },
      b: { x: 150, y: 390 },
      c: { x: 450, y: 390 },
    },
  },
  {
    id: 'isosceles_sharp',
    name: '이등변삼각형',
    category: 'special',
    badge: '대칭축 위에 O와 I 정렬',
    description: '두 변의 길이가 같은 이등변삼각형입니다. 외심과 내심이 꼭지각의 이등분선(대칭축) 위에 나란히 놓입니다.',
    points: {
      a: { x: 300, y: 100 },
      b: { x: 200, y: 400 },
      c: { x: 400, y: 400 },
    },
  },
];
