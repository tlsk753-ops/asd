import { TriangleMetrics } from '../types/geometry';

export interface InteractiveMission {
  id: string;
  title: string;
  difficulty: '기초' | '도전' | '심화';
  objective: string;
  hint: string;
  conceptTakeaway: string;
  check: (m: TriangleMetrics) => boolean;
  progressText: (m: TriangleMetrics) => string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  curriculumRef: string;
}

export const INTERACTIVE_MISSIONS: InteractiveMission[] = [
  {
    id: 'mission_right',
    title: '미션 1: 직각삼각형과 외심의 위치',
    difficulty: '기초',
    objective: '꼭짓점을 드래그하여 한 각이 90°인 직각삼각형을 만들고 외심(O)을 빗변의 중점에 올려보세요.',
    hint: '꼭짓점 A를 좌우로 움직여 각 A나 각 B를 직각(90°)에 가깝게 맞춰보세요. (89°~91°)',
    conceptTakeaway: '★ 중2 핵심 시험 포인트! 직각삼각형의 외심은 항상 "빗변의 중점"에 위치하며, 외접원의 반지름은 빗변 길이의 1/2입니다.',
    check: (m) => Math.abs(Math.max(m.angleA, m.angleB, m.angleC) - 90) <= 1.5,
    progressText: (m) => {
      const maxAngle = Math.max(m.angleA, m.angleB, m.angleC);
      return `현재 최대 각도: ${maxAngle.toFixed(1)}° (목표: 90.0°)`;
    },
  },
  {
    id: 'mission_obtuse',
    title: '미션 2: 외심을 삼각형 밖으로 탈출시키기',
    difficulty: '기초',
    objective: '삼각형을 변형하여 외심(O)이 삼각형 바깥(외부)으로 나가도록 둔각삼각형을 만드세요.',
    hint: '꼭짓점 A를 밑변 쪽으로 눌러 납작하게 만들면 꼭지각이 100° 이상으로 벌어집니다.',
    conceptTakeaway: '★ 둔각삼각형의 외심은 항상 "삼각형의 외부"에 위치합니다. 하지만 내심(I)은 여전히 삼각형 내부에 남아있습니다!',
    check: (m) => Math.max(m.angleA, m.angleB, m.angleC) > 95,
    progressText: (m) => {
      const maxAngle = Math.max(m.angleA, m.angleB, m.angleC);
      return `현재 최대 각도: ${maxAngle.toFixed(1)}° (목표: 95° 초과)`;
    },
  },
  {
    id: 'mission_equilateral',
    title: '미션 3: 외심(O)과 내심(I)을 하나로 포개기',
    difficulty: '도전',
    objective: '두 점 O와 I의 거리를 6px 이하로 줄여 정삼각형에 가깝게 맞춰보세요.',
    hint: '세 변의 길이가 비슷해지도록 꼭짓점 A를 중앙 상단 대칭 위치로 조절하세요.',
    conceptTakeaway: '★ 정삼각형에서는 외심(O), 내심(I), 무게중심(G)이 모두 정확히 한 점에서 일치합니다! (두 점 사이의 거리 = 0)',
    check: (m) => m.distOI <= 7,
    progressText: (m) => `현재 외심과 내심의 거리: ${m.distOI.toFixed(1)}px (목표: 7.0px 이하)`,
  },
  {
    id: 'mission_angle_boc',
    title: '미션 4: 외심 중심각 공식 (∠BOC = 2∠A) 검증',
    difficulty: '심화',
    objective: '각 A가 40°~70° 사이인 예각삼각형을 만들고 중심각 ∠BOC가 정확히 2배인지 확인하세요.',
    hint: '꼭짓점 A를 위아래로 조절하며 각도 패널의 계산식을 관찰하세요.',
    conceptTakeaway: '★ 외심의 성질: 점 O에서 꼭짓점 B, C를 연결한 중심각 ∠BOC는 꼭지각 ∠A의 정확히 2배 (∠BOC = 2∠A)입니다.',
    check: (m) => m.angleA >= 40 && m.angleA <= 70 && m.triangleType === 'acute',
    progressText: (m) => `현재 ∠A: ${m.angleA.toFixed(1)}°, 이론상 2∠A: ${(2 * m.angleA).toFixed(1)}°`,
  },
];

export const CONCEPT_QUIZZES: QuizQuestion[] = [
  {
    id: 1,
    question: '직각삼각형의 외심(O)은 항상 어디에 위치할까요?',
    options: ['삼각형의 내부', '직각인 꼭짓점 위', '빗변의 중점', '삼각형의 외부'],
    correctIndex: 2,
    explanation: '직각삼각형의 외심은 항상 빗변의 중점에 위치합니다. 따라서 빗변의 길이는 외접원 지름과 같고, 빗변의 절반이 외접원의 반지름이 됩니다.',
    curriculumRef: '중2 수학 - 삼각형의 외심의 위치',
  },
  {
    id: 2,
    question: '삼각형의 "세 내각의 이등분선의 교점"을 무엇이라고 부를까요?',
    options: ['외심 (Circumcenter)', '내심 (Incenter)', '무게중심 (Centroid)', '수심 (Orthocenter)'],
    correctIndex: 1,
    explanation: '세 내각의 이등분선의 교점은 "내심(Incenter)"입니다. 내심에서 세 변에 이르는 거리는 내접원의 반지름(r)으로 모두 같습니다.',
    curriculumRef: '중2 수학 - 내심의 정의와 작도',
  },
  {
    id: 3,
    question: '삼각형의 모양(예각, 직각, 둔각)과 상관없이 "항상 삼각형 내부"에 위치하는 점은?',
    options: ['외심만 항상 내부', '내심만 항상 내부', '외심과 내심 둘 다 항상 내부', '둘 다 외부에 갈 수 있음'],
    correctIndex: 1,
    explanation: '내심은 삼각형 안에 접하는 원(내접원)의 중심이므로 모양에 상관없이 "항상 내부"에 위치합니다. 반면 외심은 둔각삼각형일 때 외부에 위치합니다.',
    curriculumRef: '중2 수학 - 외심과 내심의 위치 비교',
  },
  {
    id: 4,
    question: '삼각형 ABC의 외심을 O라 할 때, ∠A = 52°라면 중심각 ∠BOC의 크기는?',
    options: ['52°', '104°', '116°', '128°'],
    correctIndex: 1,
    explanation: '외심에서 중심각의 성질: ∠BOC = 2 × ∠A = 2 × 52° = 104°입니다.',
    curriculumRef: '중2 수학 - 외심의 각도 성질',
  },
  {
    id: 5,
    question: '삼각형 ABC의 내심을 I라 할 때, ∠A = 60°라면 각 ∠BIC의 크기는 얼마일까요?',
    options: ['120°', '150°', '90°', '60°'],
    correctIndex: 0,
    explanation: '내심에서 각의 성질: ∠BIC = 90° + 1/2 × ∠A = 90° + 30° = 120°입니다.',
    curriculumRef: '중2 수학 - 내심의 각도 성질',
  },
];
