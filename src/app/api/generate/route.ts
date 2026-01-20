import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions, generateBatch } from '@/lib/llm';
import { GenerateRequestSchema, BatchGenerateRequestSchema, QuestionType, Difficulty } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    
    // 배치 요청인지 확인
    if (body.items && Array.isArray(body.items)) {
      // 배치 처리
      const result = BatchGenerateRequestSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          { error: '잘못된 요청 형식입니다.', details: result.error.flatten() },
          { status: 400 }
        );
      }
      
      const { passage, items } = result.data;
      const responses = await generateBatch(
        passage, 
        items as Array<{ questionType: QuestionType; count: number; difficulty: Difficulty }>
      );
      
      // 배치 응답 구성
      const markedPassage = responses.find(r => r.markedPassage)?.markedPassage;
      
      return NextResponse.json({
        items: responses.map((response, index) => ({
          ...items[index],
          questions: response.questions
        })),
        markedPassage
      });
    } else {
      // 단일 요청 처리
      const result = GenerateRequestSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          { error: '잘못된 요청 형식입니다.', details: result.error.flatten() },
          { status: 400 }
        );
      }
      
      const response = await generateQuestions(
        result.data.passage,
        result.data.questionType,
        result.data.count,
        result.data.difficulty
      );
      
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}