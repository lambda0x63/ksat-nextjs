import { z } from 'zod';

// 문제 타입
export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  example?: string;
}

// 문제 유형 (소분류만)
export const QuestionTypes = {
  // 어휘력
  WORD_MEANING: 'word-meaning',
  CONCEPT_UNDERSTANDING: 'concept-understanding',
  
  // 글의 구조와 전개
  PATTERN_ANALYSIS: 'pattern-analysis',
  ARGUMENT_STRUCTURE: 'argument-structure',
  
  // 내용 이해
  FACTUAL_UNDERSTANDING: 'factual-understanding',
  INFERENCE: 'inference',
  AUTHOR_INTENTION: 'author-intention',
  UNDERLINED_SENTENCE: 'underlined-sentence',
  
  // 비교와 평가
  CONCEPT_COMPARISON: 'concept-comparison',
  PERSPECTIVE_COMPARISON: 'perspective-comparison',
  VALIDITY_EVALUATION: 'validity-evaluation',
  
  // 적용과 확장
  PRINCIPLE_APPLICATION: 'principle-application',
  COMPLEX_DATA_INTERPRETATION: 'complex-data-interpretation',
  PROBLEM_SOLVING: 'problem-solving'
} as const;

export type QuestionType = typeof QuestionTypes[keyof typeof QuestionTypes];

// 난이도
export const Difficulties = {
  HIGH: '상',
  MEDIUM: '중',  
  LOW: '하'
} as const;

export type Difficulty = typeof Difficulties[keyof typeof Difficulties];

// API 요청 스키마
export const GenerateRequestSchema = z.object({
  passage: z.string().min(1, '지문은 필수입니다'),
  questionType: z.enum([
    QuestionTypes.WORD_MEANING,
    QuestionTypes.CONCEPT_UNDERSTANDING,
    QuestionTypes.PATTERN_ANALYSIS,
    QuestionTypes.ARGUMENT_STRUCTURE,
    QuestionTypes.FACTUAL_UNDERSTANDING,
    QuestionTypes.INFERENCE,
    QuestionTypes.AUTHOR_INTENTION,
    QuestionTypes.UNDERLINED_SENTENCE,
    QuestionTypes.CONCEPT_COMPARISON,
    QuestionTypes.PERSPECTIVE_COMPARISON,
    QuestionTypes.VALIDITY_EVALUATION,
    QuestionTypes.PRINCIPLE_APPLICATION,
    QuestionTypes.COMPLEX_DATA_INTERPRETATION,
    QuestionTypes.PROBLEM_SOLVING
  ]),
  count: z.number().int().min(1).max(10).default(1),
  difficulty: z.enum([Difficulties.HIGH, Difficulties.MEDIUM, Difficulties.LOW]).default(Difficulties.MEDIUM)
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// API 응답 타입
export interface GenerateResponse {
  questions: Question[];
  markedPassage?: string;
}

// 배치 요청 스키마
export const BatchGenerateRequestSchema = z.object({
  passage: z.string().min(1, '지문은 필수입니다'),
  items: z.array(z.object({
    questionType: z.string(),
    count: z.number().int().min(1).max(5).default(1),
    difficulty: z.enum([Difficulties.HIGH, Difficulties.MEDIUM, Difficulties.LOW]).default(Difficulties.MEDIUM)
  })).min(1)
});

export type BatchGenerateRequest = z.infer<typeof BatchGenerateRequestSchema>;

// OpenRouter 에러 타입
export interface OpenRouterError {
  error?: {
    message: string;
    type?: string;
    code?: string;
  };
}