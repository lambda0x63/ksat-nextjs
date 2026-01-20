// src/lib/llm.ts
import { Question, GenerateResponse, QuestionType, Difficulty, QuestionTypes } from '@/lib/types';
import { buildPrompt, buildMarkingPrompt } from '@/lib/prompts';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(prompt: string, maxTokens: number = 8000): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API 오류: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('OpenRouter 응답 형식이 올바르지 않습니다.');
  }

  return data.choices[0].message.content;
}

export async function generateQuestions(
  passage: string,
  questionType: QuestionType,
  count: number,
  difficulty: Difficulty
): Promise<GenerateResponse> {
  try {
    let processedPassage = passage;
    let markedPassage: string | undefined;
    
    // 밑줄 문제 유형인 경우 먼저 마킹 처리
    if (questionType === QuestionTypes.UNDERLINED_SENTENCE) {
      markedPassage = await markPassage(passage, count);
      processedPassage = markedPassage;
    }
    
    // 프롬프트 생성
    const prompt = buildPrompt(processedPassage, questionType, count, difficulty);
    
    // OpenRouter API 호출
    const responseText = await callOpenRouter(prompt);
    
    // 응답 파싱
    const questions = parseResponse(responseText);
    
    return {
      questions,
      ...(markedPassage && { markedPassage })
    };
  } catch (error) {
    console.error('LLM API 오류:', error);
    throw new Error('문제 생성 중 오류가 발생했습니다.');
  }
}

async function markPassage(passage: string, count: number): Promise<string> {
  try {
    const prompt = buildMarkingPrompt(passage, count);
    
    // OpenRouter API 호출
    const responseText = await callOpenRouter(prompt, 4000);
    
    return responseText || passage;
  } catch (error) {
    console.error('마킹 오류:', error);
    return passage;
  }
}

function parseResponse(responseText: string): Question[] {
  try {
    // JSON 추출 (여러 형식 지원)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      // JSON 블록 코드 형식도 시도
      const codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        responseText = codeBlockMatch[1];
      } else {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }
    } else {
      responseText = jsonMatch[0];
    }
    
    const questions: Question[] = JSON.parse(responseText);
    
    // 데이터 정규화
    return questions.map(q => ({
      ...q,
      id: q.id || Math.random().toString(36).substr(2, 9),
      correctAnswer: typeof q.correctAnswer === 'string' 
        ? parseInt(q.correctAnswer, 10) 
        : q.correctAnswer
    }));
  } catch (error) {
    console.error('파싱 오류:', error);
    console.log('원본 응답:', responseText);
    throw new Error('응답 처리 중 오류가 발생했습니다.');
  }
}

// 배치 처리 헬퍼 함수
export async function generateBatch(
  passage: string,
  items: Array<{ questionType: QuestionType; count: number; difficulty: Difficulty }>
): Promise<GenerateResponse[]> {
  // 순차 처리로 변경 (API 속도 제한 고려)
  const results: GenerateResponse[] = [];
  
  for (const item of items) {
    try {
      const result = await generateQuestions(
        passage, 
        item.questionType, 
        item.count, 
        item.difficulty
      );
      results.push(result);
      
      // API 속도 제한을 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`배치 처리 중 오류 (${item.questionType}):`, error);
      // 오류 발생 시 빈 결과 추가
      results.push({ questions: [] });
    }
  }
  
  return results;
}