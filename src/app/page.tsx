'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, FileText, Brain, CheckCircle } from 'lucide-react';
import { QuestionTypes, Difficulties, Question, GenerateResponse } from '@/lib/types';

interface BatchItem {
  questionType: string;
  count: number;
  difficulty: string;
}

export default function Home() {
  const [passage, setPassage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Single mode states
  const [questionType, setQuestionType] = useState(QuestionTypes.FACTUAL_UNDERSTANDING);
  const [count, setCount] = useState(1);
  const [difficulty, setDifficulty] = useState(Difficulties.MEDIUM);
  const [singleResult, setSingleResult] = useState<GenerateResponse | null>(null);
  
  // Batch mode states
  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    { questionType: QuestionTypes.FACTUAL_UNDERSTANDING, count: 1, difficulty: Difficulties.MEDIUM }
  ]);
  const [batchResult, setBatchResult] = useState<{
    items?: Array<{
      questionType: string;
      count: number;
      difficulty: string;
      questions: Question[];
    }>;
    markedPassage?: string;
  } | null>(null);
  
  const questionTypeLabels: Record<string, string> = {
    [QuestionTypes.WORD_MEANING]: '어휘 의미 파악',
    [QuestionTypes.CONCEPT_UNDERSTANDING]: '개념/용어 이해',
    [QuestionTypes.PATTERN_ANALYSIS]: '패턴 분석',
    [QuestionTypes.ARGUMENT_STRUCTURE]: '논증 구조',
    [QuestionTypes.FACTUAL_UNDERSTANDING]: '사실적 이해',
    [QuestionTypes.INFERENCE]: '추론적 이해',
    [QuestionTypes.AUTHOR_INTENTION]: '글쓴이 의도',
    [QuestionTypes.UNDERLINED_SENTENCE]: '밑줄 친 부분',
    [QuestionTypes.CONCEPT_COMPARISON]: '개념 비교',
    [QuestionTypes.PERSPECTIVE_COMPARISON]: '관점 비교',
    [QuestionTypes.VALIDITY_EVALUATION]: '타당성 평가',
    [QuestionTypes.PRINCIPLE_APPLICATION]: '원리 적용',
    [QuestionTypes.COMPLEX_DATA_INTERPRETATION]: '복합 자료 해석',
    [QuestionTypes.PROBLEM_SOLVING]: '문제 해결'
  };
  
  const questionTypeGroups = {
    '내용 이해': [
      QuestionTypes.FACTUAL_UNDERSTANDING,
      QuestionTypes.INFERENCE,
      QuestionTypes.AUTHOR_INTENTION,
      QuestionTypes.UNDERLINED_SENTENCE
    ],
    '글의 구조와 전개': [
      QuestionTypes.PATTERN_ANALYSIS,
      QuestionTypes.ARGUMENT_STRUCTURE
    ],
    '비교와 평가': [
      QuestionTypes.CONCEPT_COMPARISON,
      QuestionTypes.PERSPECTIVE_COMPARISON,
      QuestionTypes.VALIDITY_EVALUATION
    ],
    '적용과 확장': [
      QuestionTypes.PRINCIPLE_APPLICATION,
      QuestionTypes.COMPLEX_DATA_INTERPRETATION,
      QuestionTypes.PROBLEM_SOLVING
    ],
    '어휘력': [
      QuestionTypes.WORD_MEANING,
      QuestionTypes.CONCEPT_UNDERSTANDING
    ]
  };
  
  const handleSingleGenerate = async () => {
    if (!passage.trim()) {
      setError('지문을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSingleResult(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, questionType, count, difficulty }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '문제 생성에 실패했습니다.');
      }
      
      const data = await response.json();
      setSingleResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBatchGenerate = async () => {
    if (!passage.trim()) {
      setError('지문을 입력해주세요.');
      return;
    }
    
    if (batchItems.length === 0) {
      setError('최소 하나 이상의 문제 유형을 추가해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    setBatchResult(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, items: batchItems }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '문제 생성에 실패했습니다.');
      }
      
      const data = await response.json();
      setBatchResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const addBatchItem = () => {
    setBatchItems([...batchItems, {
      questionType: QuestionTypes.FACTUAL_UNDERSTANDING,
      count: 1,
      difficulty: Difficulties.MEDIUM
    }]);
  };
  
  const updateBatchItem = (index: number, field: keyof BatchItem, value: string | number) => {
    const updated = [...batchItems];
    updated[index] = { ...updated[index], [field]: value };
    setBatchItems(updated);
  };
  
  const removeBatchItem = (index: number) => {
    setBatchItems(batchItems.filter((_, i) => i !== index));
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">수능 국어 비문학 문제 생성기</h1>
        <p className="text-muted-foreground">AI를 활용한 수능 국어 비문학 문제 자동 생성 시스템</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>지문 입력</CardTitle>
          <CardDescription>문제를 생성할 비문학 지문을 입력하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="지문을 입력하세요..."
            className="min-h-[300px] font-mono"
            value={passage}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPassage(e.target.value)}
          />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">단일 문제 생성</TabsTrigger>
          <TabsTrigger value="batch">배치 문제 생성</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>문제 설정</CardTitle>
              <CardDescription>생성할 문제의 유형과 난이도를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="single-type">문제 유형</Label>
                  <Select value={questionType} onValueChange={(value) => setQuestionType(value as typeof questionType)}>
                    <SelectTrigger id="single-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(questionTypeGroups).map(([group, types]) => (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {group}
                          </div>
                          {types.map(type => (
                            <SelectItem key={type} value={type}>
                              {questionTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="single-count">문제 개수</Label>
                  <Input
                    id="single-count"
                    type="number"
                    min="1"
                    max="10"
                    value={count}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCount(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="single-difficulty">난이도</Label>
                  <Select value={difficulty} onValueChange={(value) => setDifficulty(value as typeof difficulty)}>
                    <SelectTrigger id="single-difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Difficulties.HIGH}>상</SelectItem>
                      <SelectItem value={Difficulties.MEDIUM}>중</SelectItem>
                      <SelectItem value={Difficulties.LOW}>하</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleSingleGenerate} 
                disabled={loading || !passage.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    문제 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {singleResult && (
            <div className="mt-6 space-y-4">
              {singleResult.markedPassage && (
                <Card>
                  <CardHeader>
                    <CardTitle>마킹된 지문</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap font-mono text-sm">{singleResult.markedPassage}</p>
                  </CardContent>
                </Card>
              )}
              
              {singleResult.questions.map((question, idx) => (
                <QuestionCard key={question.id} question={question} index={idx + 1} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>배치 문제 설정</CardTitle>
              <CardDescription>여러 유형의 문제를 한 번에 생성합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {batchItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Select 
                    value={item.questionType} 
                    onValueChange={(value: string) => updateBatchItem(index, 'questionType', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(questionTypeGroups).map(([group, types]) => (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {group}
                          </div>
                          {types.map(type => (
                            <SelectItem key={type} value={type}>
                              {questionTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={item.count}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBatchItem(index, 'count', Number(e.target.value))}
                    className="w-20"
                    placeholder="개수"
                  />
                  
                  <Select 
                    value={item.difficulty} 
                    onValueChange={(value: string) => updateBatchItem(index, 'difficulty', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Difficulties.HIGH}>상</SelectItem>
                      <SelectItem value={Difficulties.MEDIUM}>중</SelectItem>
                      <SelectItem value={Difficulties.LOW}>하</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeBatchItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addBatchItem}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                문제 유형 추가
              </Button>
              
              <Separator />
              
              <Button 
                onClick={handleBatchGenerate} 
                disabled={loading || !passage.trim() || batchItems.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    배치 문제 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {batchResult && (
            <div className="mt-6 space-y-6">
              {batchResult.markedPassage && (
                <Card>
                  <CardHeader>
                    <CardTitle>마킹된 지문</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap font-mono text-sm">{batchResult.markedPassage}</p>
                  </CardContent>
                </Card>
              )}
              
              {batchResult.items?.map((item, groupIdx: number) => (
                <div key={groupIdx} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                      {questionTypeLabels[item.questionType]}
                    </h3>
                    <Badge variant="secondary">{item.difficulty}</Badge>
                  </div>
                  {item.questions.map((question: Question, idx: number) => (
                    <QuestionCard key={question.id} question={question} index={idx + 1} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function QuestionCard({ question, index }: { question: Question; index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">문제 {index}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? '정답 숨기기' : '정답 보기'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{question.text}</p>
        
        {question.example && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm whitespace-pre-wrap">{question.example}</p>
            </CardContent>
          </Card>
        )}
        
        {question.options && (
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <div key={idx} className="text-sm pl-2">
                {option}
              </div>
            ))}
          </div>
        )}
        
        {showAnswer && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">정답: {question.correctAnswer}</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {question.explanation}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}