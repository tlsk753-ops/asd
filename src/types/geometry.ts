export interface Point {
  x: number;
  y: number;
}

export type TriangleType = 'acute' | 'right' | 'obtuse';
export type SpecialType = 'equilateral' | 'isosceles' | 'scalene';

export interface TriangleState {
  a: Point; // Vertex A
  b: Point; // Vertex B
  c: Point; // Vertex C
}

export interface TriangleMetrics {
  // Vertices
  A: Point;
  B: Point;
  C: Point;
  // Side lengths (a = |BC|, b = |CA|, c = |AB|)
  sideA: number;
  sideB: number;
  sideC: number;
  perimeter: number;
  // Angles in degrees
  angleA: number;
  angleB: number;
  angleC: number;
  // Area
  area: number;
  // Classifications
  triangleType: TriangleType;
  specialType: SpecialType;
  // Circumcenter (O)
  circumcenter: Point;
  circumradius: number;
  circumcenterLocation: 'inside' | 'on_hypotenuse' | 'outside';
  // Incenter (I)
  incenter: Point;
  inradius: number;
  // Distance between O and I
  distOI: number;
  // Midpoints of sides
  midBC: Point;
  midCA: Point;
  midAB: Point;
  // Incircle tangent points on sides (feet of perpendiculars from I)
  tangentBC: Point;
  tangentCA: Point;
  tangentAB: Point;
  // Middle school angle relationships
  angleBOC: number; // For circumcenter: should be 2 * angleA
  angleBIC: number; // For incenter: should be 90 + angleA / 2
}

export interface PresetTriangle {
  id: string;
  name: string;
  category: 'acute' | 'right' | 'obtuse' | 'special';
  description: string;
  points: TriangleState;
  badge: string;
}

export interface Mission {
  id: string;
  title: string;
  targetDescription: string;
  hint: string;
  explanation: string;
  check: (metrics: TriangleMetrics) => boolean;
}
