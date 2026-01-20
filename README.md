# KSAT Generator (Next.js)

수능 국어 비문학 문제 생성 프론트엔드

## 기능

- 지문 입력 및 유형별 문제 생성
- 단일/배치 모드 (여러 유형 동시 생성)
- 난이도 선택 (상/중/하)
- 마킹된 지문 표시
- 정답/해설 토글

## 문제 유형 (14종)

### 내용 이해
- 사실적 이해, 추론적 이해, 글쓴이 의도, 밑줄 친 부분

### 글의 구조
- 패턴 분석, 논증 구조

### 비교와 평가
- 개념 비교, 관점 비교, 타당성 평가

### 적용과 확장
- 원리 적용, 복합 자료 해석, 문제 해결

### 어휘력
- 어휘 의미, 개념/용어 이해

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Radix UI
- Zod (데이터 검증)

## 설치

```bash
npm install
npm run dev
```

## 연관 프로젝트

- [ksat-nestjs](https://github.com/lambda0x63/ksat-nestjs) - 백엔드 API
