# AIBIM-Reference Finder (Arch) 시스템 개발 보고서

## 1. 시스템 개요

**AIBIM-Reference Finder (Arch)**는 건축 설계 전문가를 위한 차세대 AI 기반 레퍼런스 검색 및 분석 플랫폼입니다. 과거 프로젝트의 방대한 데이터베이스를 활용하여 설계자가 필요로 하는 영감을 빠르고 정확하게 제공하는 것을 목표로 합니다.

본 시스템은 단순한 키워드 검색을 넘어, 자연어 쿼리, 다중 필터링, 그리고 AI 기반의 문서 분석 및 콘셉트 추출 기능을 통합하여, 설계 프로세스의 초기 단계에서 강력한 의사결정 지원 도구로 기능합니다.

---

## 2. 시스템 아키텍처 및 핵심 기술

본 시스템은 최신 웹 기술과 클라우드 네이티브 아키텍처를 기반으로 구축되어, 뛰어난 성능, 확장성, 그리고 보안성을 자랑합니다.

| 구분 | 기술 스택 | 역할 및 특징 |
| --- | --- | --- |
| **프론트엔드** | Next.js (App Router), React, TypeScript | 서버 컴포넌트와 클라이언트 컴포넌트를 혼합 사용하여 렌더링 성능을 최적화하고, 사용자 인터랙션이 풍부한 동적 UI를 구현했습니다. |
| | ShadCN UI, Tailwind CSS | 사전 정의된 고품질 UI 컴포넌트와 유틸리티 우선 CSS 프레임워크를 통해 신속하고 일관된 디자인 시스템을 구축했습니다. |
| | Zustand | 가볍고 효율적인 상태 관리 라이브러리를 사용하여 검색 조건, 결과 등 복잡한 클라이언트 상태를 중앙에서 관리합니다. |
| **백엔드 (서버리스)** | Next.js Server Actions, Firebase App Hosting | 별도의 서버 관리 없이, 프론트엔드와 동일한 Next.js 환경 내에서 안전한 백엔드 로직을 실행하는 서버리스 환경을 구축했습니다. |
| **데이터베이스** | Google Cloud Firestore | NoSQL 기반의 유연하고 확장성 높은 데이터베이스를 사용하여 프로젝트의 메타데이터(개요, 면적, 마감재 등)를 저장하고 관리합니다. |
| **파일 스토리지** | Google Cloud Storage | 프로젝트와 관련된 모든 파일(이미지, PDF 도면 등)을 안전하게 저장하고, 서버를 통해서만 접근을 허용하여 보안을 극대화했습니다. |
| **AI 및 GenAI** | Google AI (Gemini), Genkit | 프로젝트 검색, 문서 분석, 콘셉트 추출 등 시스템의 핵심 지능을 담당하는 AI 모델을 Genkit 프레임워크를 통해 안정적으로 통합했습니다. |
| **서버-클라우드 연동** | Firebase Admin SDK | 백엔드 서버가 Firestore와 Cloud Storage에 최고 관리자 권한으로 안전하게 접근하고 데이터를 처리할 수 있도록 하는 핵심적인 역할을 수행합니다. |

---

## 3. 핵심 기능 상세 설명

### 3.1. 하이브리드 AI 검색 엔진 (내부 DB)

사용자가 원하는 레퍼런스를 가장 빠르고 정확하게 찾을 수 있도록, 단순 키워드 검색과 정교한 AI 분석을 결합한 하이브리드 검색 엔진을 구현했습니다.

*   **다중 필터 시스템:** `프로젝트 유형`, `지역 유형`, `연면적` 등 명확한 조건으로 1차 필터링을 수행합니다.
*   **자연어 쿼리 및 콘셉트 검색:** 사용자가 입력한 자연어 키워드(예: '미니멀한 카페')와 `디자인 콘셉트` 태그를 분석합니다.
*   **지능형 스코어링:** 1차 필터링된 결과 내에서, 각 프로젝트의 `이름`, `설명`, `디자인 콘셉트` 필드와 사용자의 검색어의 연관성을 계산하여 점수를 매깁니다.
    *   프로젝트 이름에 포함 시 +10점
    *   디자인 콘셉트에 포함 시 +5점
    *   설명에 포함 시 +2점
*   **최종 결과:** 계산된 점수가 높은 순으로 가장 관련성 높은 프로젝트를 사용자에게 추천합니다. 이 모든 과정은 `src/ai/flows/project-discovery-flow.ts`와 `src/services/database.ts`의 `queryProjects` 함수를 통해 유기적으로 처리됩니다.

### 3.2. AI 기반 설계 콘셉트 자동 추출 및 학습 (`gemini-2.0-flash`)

단순히 저장된 데이터를 보여주는 것을 넘어, 시스템이 스스로 학습하고 발전하는 동적 기능을 구현했습니다. 이 기능의 핵심은 Google의 **Gemini 2.0 Flash 모델**을 활용한 `extractDesignConcepts` AI 플로우입니다.

*   **AI 모델:** `gemini-2.0-flash` 모델은 빠른 응답 속도와 우수한 멀티모달(텍스트+이미지) 분석 능력을 겸비하여, PDF 문서나 이미지 파일로부터 핵심적인 디자인 특징을 신속하게 추출하는 데 최적화되어 있습니다.

*   **작동 방식:**
    1.  **문서 분석:** 사용자가 프로젝트 상세 보기의 파일 뷰어(`FileViewerModal`)에서 이미지나 PDF 파일을 선택하고 '분석' 버튼을 누르면, 해당 파일이 데이터 URI로 변환되어 AI 플로우로 전송됩니다.
    2.  **프롬프트 실행:** AI 모델은 아래와 같이 정교하게 설계된 프롬프트를 통해 명확한 지시를 받습니다.
        ```
        You are an AI assistant that extracts key design concepts from architectural project documents.
        Analyze the provided document and identify the main design ideas, principles, and features.
        Provide a list of 2-5 clear, concise design concepts in Korean. For example: "미니멀리즘", "자연과의 조화", "곡선 디자인".
        Return an empty list if no specific concepts are identifiable.

        Document: {{media url=documentDataUri}}
        ```
        *   **역할 부여:** "You are an AI assistant that extracts key design concepts..." 구문을 통해 AI에게 '건축 문서 분석 전문가'라는 명확한 역할을 부여합니다.
        *   **구체적인 지시:** "2-5개의 명확하고 간결한 한국어 디자인 콘셉트를 제공하라"는 구체적인 지시와 예시("미니멀리즘", "자연과의 조화")를 통해 원하는 결과물의 형식과 품질을 명확히 합니다.
        *   **데이터 전달:** `{{media url=documentDataUri}}` 구문은 사용자가 업로드한 파일(이미지 또는 PDF)을 AI가 직접 보고 분석할 수 있도록 전달하는 핵심적인 부분입니다.
    3.  **데이터베이스 업데이트 (학습):** AI가 추출한 새로운 콘셉트들은 즉시 해당 프로젝트의 Firestore 문서에 `designConcepts` 배열 필드로 **자동 추가(Upsert)**됩니다.
    4.  **선순환 구조:** 이렇게 축적된 콘셉트 데이터는 다음 검색 시 정확도를 높이는 데 사용되어, 시스템을 사용할수록 점점 더 똑똑해지는 선순환 구조를 만들어냅니다.

### 3.3. 외부 웹 레퍼런스 탐색 기능 (`gemini-2.0-flash` + Tool)

내부 데이터베이스를 넘어, 웹상의 최신 건축 트렌드와 영감을 실시간으로 탐색할 수 있는 기능을 제공합니다. 이 기능은 동일한 `gemini-2.0-flash` 모델에 **가상 검색 도구(Tool)**를 결합하여 구현했습니다.

*   **가상 검색 도구(Tool) 활용:** Genkit의 'Tool' 기능을 활용하여, AI 모델이 필요에 따라 `googleSearchTool`이라는 가상 웹 검색 도구를 호출하도록 설계했습니다. 이를 통해 AI는 단순 텍스트 생성을 넘어, 외부 정보를 동적으로 가져와 답변에 활용하는 에이전트(Agent)처럼 행동합니다.

*   **작동 방식:**
    1.  **프롬프트 실행:** 사용자가 검색어를 입력하면, AI는 다음과 같은 지시가 담긴 프롬프트를 받습니다.
        ```
        You are an expert architectural research assistant. A user is looking for inspirational projects on the web. Your task is to use the provided search tool to find them.

        1.  **Execute Search:** Use the `googleSearchTool` with the user's query: "{{{query}}}"
        2.  **Analyze Results:** The tool will provide mock search results as a JSON string. You must base your answer *only* on this data. Do not invent projects.
        3.  **Select & Format:**
            *   From the tool's output, select **up to two** of the most relevant architectural projects that best match the user's query.
            *   ... (중략) ...
        4.  **Final Output:** Structure your findings according to the required output schema. If no relevant projects are found, return an empty list.
        ```
        *   **단계별 지시:** 프롬프트는 AI에게 '1. 검색 실행', '2. 결과 분석', '3. 선택 및 포맷', '4. 최종 출력'이라는 명확한 단계별 지침을 제공하여, 복잡한 작업을 안정적으로 수행하도록 유도합니다.
        *   **Tool 사용 강제:** `Use the 'googleSearchTool'` 구문을 통해 AI가 반드시 정의된 도구를 사용하도록 지시합니다.
        *   **환각 방지:** `You must base your answer *only* on this data. Do not invent projects.` 라는 강력한 제약을 통해, AI가 도구로 얻은 정보 외에 임의의 정보를 만들어내는 '환각 현상'을 방지합니다.
    2.  **동적 결과 생성:** AI는 사용자의 검색 쿼리(예: '바다가 보이는 카페 건축')를 바탕으로 이 도구를 사용해 웹상의 가상 프로젝트들을 검색하고, 그중 가장 관련성 높은 2개의 프로젝트를 선별합니다.
    3.  **구조화된 출력:** 최종적으로 AI는 각 프로젝트의 `이름`, `설명`, `이미지 URL`, `출처` 등을 포함한 구조화된 JSON 형태로 결과를 반환하여, UI에 일관된 카드 형태로 표시합니다.

### 3.4. 강력한 보안 아키텍처: Signed URL 기반의 안전한 파일 제공

사용자 편의성과 최고 수준의 보안을 동시에 달성하기 위해, 파일 접근에 대한 정교한 아키텍처를 구축했습니다.

*   **접근 규칙:** Cloud Storage의 보안 규칙은 `allow read, write: if false;`로 설정하여, **클라이언트(브라우저)에서의 모든 직접적인 파일 접근을 원천 차단**했습니다. 이는 데이터 탈취 및 무단 접근으로부터 파일을 완벽하게 보호합니다.
*   **서버를 통한 중개:** 모든 파일 요청은 반드시 백엔드 서버(`firebase-admin.ts`)를 통해서만 이루어집니다.
*   **Signed URL 메커니즘:**
    1.  사용자가 이미지나 파일 링크를 요청하면, 서버는 Firebase Admin SDK를 통해 Cloud Storage에 관리자 권한으로 안전하게 접근합니다.
    2.  서버는 요청된 파일에 대해서만 접근할 수 있는, **제한된 시간(1시간) 동안만 유효한 임시 보안 URL(Signed URL)**을 즉시 생성합니다.
    3.  사용자의 브라우저는 오직 이 임시 URL을 통해서만 파일을 볼 수 있으며, URL이 만료되면 접근이 자동으로 차단됩니다.
*   **결과:** 이 아키텍처를 통해 민감한 원본 파일의 경로를 외부에 노출하지 않으면서도, 인증된 사용자에게 원활한 파일 접근 경험을 제공하는 강력한 보안 시스템을 완성했습니다.

---

## 4. 결론

**AIBIM-Reference Finder (Arch)**는 최신 AI 기술과 안정적인 클라우드 아키텍처를 결합하여 건축 설계의 패러다임을 바꿀 잠재력을 가진 혁신적인 플랫폼입니다. 단순한 데이터 저장소를 넘어, 사용자와 상호작용하며 스스로 학습하고 발전하는 본 시스템은 설계자에게 가장 신뢰할 수 있는 파트너가 될 것입니다.
