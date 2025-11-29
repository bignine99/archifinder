# AIBIM-Reference Finder (Arch) AI 시스템 상세 분석 보고서

## 1. AI 시스템 개요: 3개의 두뇌, 하나의 목표

본 시스템의 AI는 단순히 하나의 거대한 모델이 아니라, 각기 다른 전문성을 가진 **3개의 핵심 AI 에이전트(Agent)**가 유기적으로 협력하는 구조로 설계되었습니다. 각 에이전트는 명확한 역할과 책임, 그리고 그에 최적화된 도구(Tool)와 지침(Prompt)을 가지고 있습니다.

1.  **내부 탐색 에이전트 (`project-discovery-flow`):** 사내 데이터베이스의 '사서'입니다. 방대한 과거 프로젝트 아카이브 내에서 가장 정확한 레퍼런스를 신속하게 찾아내는 역할을 합니다.
2.  **콘셉트 추출 에이전트 (`design-concept-extraction`):** 프로젝트의 '영혼'을 읽는 분석가입니다. 이미지나 PDF 문서만 보고도 그 안에 담긴 핵심 디자인 콘셉트를 꿰뚫어 보고, 이를 데이터로 만들어 시스템 전체의 지능을 높입니다.
3.  **외부 탐색 에이전트 (`web-discovery-flow`):** 최신 트렌드를 탐색하는 '웹 리서처'입니다. 인터넷이라는 무한한 정보의 바다에서 가장 빛나는 영감을 건져 올리는 역할을 합니다.

이 세 에이전트는 모두 `gemini-2.0-flash` 모델을 기반으로 하지만, 각기 다른 프롬프트와 작업 흐름을 통해 전문화되어, "설계자에게 최고의 영감을 제공한다"는 단 하나의 목표를 향해 움직입니다.

---

## 2. AI 에이전트별 상세 작동 방식

### 2.1. 내부 탐색 에이전트: `discoverProjects`

이 에이전트는 사용자가 입력한 다양한 조건들을 종합하여, 사내 데이터베이스에서 가장 적합한 프로젝트를 '추천'하는 알고리즘 기반의 지능형 검색 엔진입니다. (엄밀히 말해 LLM을 직접 호출하지 않지만, 복합적인 조건들을 지능적으로 분석하고 점수화하여 추천한다는 점에서 AI 시스템의 중요한 일부입니다.)

*   **입력:**
    *   **자연어 쿼리:** `'모던한 스타일의 작은 카페'`
    *   **정형 필터:** 프로젝트 유형(`근린생활시설`), 연면적(`1000m² 이하`), 디자인 콘셉트(`미니멀리스트`)
*   **작동 프로세스:**
    1.  **1단계 (필터링):** 시스템은 먼저 '근린생활시설'이면서 '연면적 1000m² 이하'인 모든 프로젝트를 데이터베이스에서 필터링합니다. 이것은 검색 범위를 좁히는 첫 번째 관문입니다.
    2.  **2단계 (용어 추출):** 자연어 쿼리 `'모던한 스타일의 작은 카페'`와 선택된 디자인 콘셉트 `'미니멀리스트'`를 `['모던한', '스타일의', '작은', '카페', '미니멀리스트']` 와 같은 핵심 검색어(Term)들로 분해합니다.
    3.  **3단계 (지능형 스코어링):** 1단계에서 필터링된 각 프로젝트에 대해, 2단계에서 추출된 검색어들과의 연관성을 계산하여 점수를 매깁니다.
        *   `프로젝트 이름`에 '카페'가 포함되면 **+10점** (가장 높은 가중치)
        *   `디자인 콘셉트` 목록에 '모던한' 또는 '미니멀리스트'가 포함되면 **+5점**
        *   `프로젝트 설명`에 '작은' 또는 '스타일'이 포함되면 **+2점** (가장 낮은 가중치)
    4.  **4단계 (결과 정렬):** 계산된 총점이 가장 높은 순으로 최종 추천 목록을 정렬하여 사용자에게 보여줍니다.

### 2.2. 콘셉트 추출 에이전트: `extractDesignConcepts`

이 에이전트는 이미지나 PDF 문서로부터 눈에 보이지 않는 '디자인 언어'를 추출하여 시스템의 데이터 자산을 스스로 학습하고 풍부하게 만드는 핵심적인 역할을 수행합니다.

*   **입력:** 사용자가 파일 뷰어에서 선택한 이미지 또는 PDF 파일 (Data URI 형식으로 변환됨)
*   **AI 모델:** `gemini-2.0-flash`
*   **핵심 프롬프트:**
    ```
    You are an AI assistant that extracts key design concepts from architectural project documents.

    Analyze the provided document and identify the main design ideas, principles, and features.
    Provide a list of 2-5 clear, concise design concepts in Korean. For example: "미니멀리즘", "자연과의 조화", "곡선 디자인".
    Return an empty list if no specific concepts are identifiable.

    Document: {{media url=documentDataUri}}
    ```
*   **작동 프로세스:**
    1.  **역할 정의:** 프롬프트의 첫 문장("You are an AI assistant...")을 통해, AI는 스스로를 '건축 문서 분석 전문가'로 인식하고 그에 맞는 사고를 시작합니다.
    2.  **문서 분석:** `{{media url=documentDataUri}}` 부분에 주입된 이미지/PDF를 시각적, 텍스트적으로 분석합니다. AI는 노출 콘크리트의 질감, 거대한 유리창, 주변 숲과의 관계 등을 종합적으로 인식합니다.
    3.  **콘셉트 추론:** 분석된 시각/텍스트 정보를 바탕으로, AI는 "이 건물의 핵심은 재료를 그대로 드러내는 것과 자연광을 적극적으로 활용하는 것이구나"라고 추론합니다.
    4.  **결과 형식화:** 프롬프트의 구체적인 지시("2-5개의... 한국어 디자인 콘셉트")에 따라, 추론 결과를 `["노출 콘크리트", "개방성", "자연 채광"]` 과 같은 명확하고 간결한 한국어 태그 목록으로 변환하여 출력합니다.
    5.  **데이터베이스 업데이트 (학습):** 이 결과는 즉시 해당 프로젝트의 `designConcepts` 필드에 추가됩니다. 이로써 시스템은 "노출 콘크리트"라는 새로운 검색 키워드를 학습하게 되며, 다음 검색부터는 이 프로젝트를 더 정확하게 추천할 수 있게 됩니다.

### 2.3. 외부 탐색 에이전트: `discoverWebProjects`

이 에이전트는 내부에 없는 새로운 영감을 찾기 위해, 가상의 검색 도구를 사용하여 웹을 탐색하는 '디지털 리서처'입니다. Genkit의 `Tool` 기능을 활용하여 LLM이 단순 정보 생성을 넘어 능동적으로 정보를 '찾아오도록' 설계되었습니다.

*   **입력:** 사용자가 입력한 검색어 (예: `'바다가 보이는 카페 건축'`)
*   **AI 모델:** `gemini-2.0-flash`
*   **사용 도구:** `googleSearchTool` (가상의 웹 검색 도구)
*   **핵심 프롬프트:**
    ```
    You are an expert architectural research assistant. A user is looking for inspirational projects on the web. Your task is to use the provided search tool to find them.

    1.  **Execute Search:** Use the `googleSearchTool` with the user's query: "{{{query}}}"
    2.  **Analyze Results:** The tool will provide mock search results as a JSON string. You must base your answer *only* on this data. Do not invent projects.
    3.  **Select & Format:**
        *   From the tool's output, select **up to two** of the most relevant architectural projects that best match the user's query.
        *   ... (중략) ...
    4.  **Final Output:** Structure your findings according to the required output schema. If no relevant projects are found, return an empty list.
    ```
*   **작동 프로세스:**
    1.  **작업 계획 수립:** 프롬프트의 단계별 지침에 따라, AI는 "먼저 `googleSearchTool`을 사용해서 사용자의 쿼리로 검색하고, 그 결과를 분석해서 가장 적절한 프로젝트 2개를 골라야겠다"고 작업 계획을 세웁니다.
    2.  **도구 호출:** 계획에 따라 `googleSearchTool`을 `query: '바다가 보이는 카페 건축'` 이라는 인자와 함께 호출합니다.
    3.  **도구 결과 수신:** 도구로부터 가상의 검색 결과(JSON 문자열)를 전달받습니다. 이 결과에는 'Waveon', 'Hillside Cafe' 등의 프로젝트 정보가 포함되어 있습니다.
    4.  **결과 분석 및 선별:** AI는 받은 JSON 데이터를 분석합니다. 'Waveon' 프로젝트의 키워드에 'sea', 'ocean-view'가 있고, 'Hillside Cafe'에는 'nature'가 있는 것을 보고, '바다'라는 사용자 쿼리와 더 직접적으로 관련된 'Waveon' 프로젝트를 우선적으로 선택합니다.
    5.  **환각 방지:** 프롬프트의 강력한 제약("You must base your answer *only* on this data. Do not invent projects.")에 따라, AI는 도구가 반환한 정보 외에 다른 정보를 절대 만들어내지 않고, 오직 주어진 데이터 안에서만 정보를 추출하고 가공합니다.
    6.  **최종 출력:** 선택된 프로젝트들의 `이름`, `설명`, `이미지 URL`, `출처` 등을 프롬프트의 `output schema` 요구사항에 맞춰 구조화된 JSON 객체로 변환하여 최종 결과를 반환합니다.

---

## 3. 결론

본 시스템의 AI는 각기 다른 작업을 수행하는 전문화된 에이전트들의 집합체입니다. 이들은 서로 다른 방식으로 정보를 처리하지만, **'정확한 데이터를 기반으로', '주어진 지침에 따라', '구조화된 결과를 출력한다'**는 공통된 원칙 아래 작동합니다. 이 아키텍처는 시스템의 정확성, 확장성, 그리고 예측 가능성을 보장하며, 단순한 정보 검색 도구를 넘어 진정한 의미의 '지능형 설계 파트너'를 구현하는 핵심입니다.
