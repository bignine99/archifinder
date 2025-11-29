# Firebase Studio

This is a Next.js application built within Firebase Studio. It serves as a visual architecture finder and concept extraction tool for architectural projects.

Key Features:
- **Project Visualization:** Browse and view architectural projects with associated metadata and images.
- **AI-Powered Concept Extraction:** Utilize AI models to extract key design concepts and characteristics from project descriptions or uploaded files.
- **Project Search and Filtering:** Search and filter projects based on various criteria.

To understand the core structure and how to get started, explore `/src/app/page.tsx`.

## Firebase Admin 환경 변수 설정 (Vercel 포함)

Firebase Admin SDK는 서버 환경에서만 실행되며, `FIREBASE_SERVICE_ACCOUNT` 또는 다음 키 조합을 반드시 설정해야 합니다.

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (`\n`을 실제 줄바꿈으로 치환)
- (선택) `FIREBASE_STORAGE_BUCKET`

Vercel에서는 멀티라인 비밀키를 그대로 붙이지 말고 `\n`이 포함된 문자열로 저장하거나, JSON 전체를 `FIREBASE_SERVICE_ACCOUNT`에 넣어주세요. 새 초기화 로직이 Base64(`FIREBASE_SERVICE_ACCOUNT_BASE64`)와 JSON 문자열(`GOOGLE_APPLICATION_CREDENTIALS_JSON`)도 자동으로 감지합니다. 로컬 개발에서 gcloud/emu를 사용 중이라면 별도 설정 없이 기본 ADC로 동작합니다.

# Firebase Studio (한국어)

이 프로젝트는 Firebase Studio 내에서 구축된 Next.js 애플리케이션입니다. 건축 프로젝트를 위한 시각적 건축 검색 및 콘셉트 추출 도구 역할을 합니다.

주요 기능:
- **프로젝트 시각화:** 관련 메타데이터 및 이미지와 함께 건축 프로젝트를 탐색하고 볼 수 있습니다.
- **AI 기반 콘셉트 추출:** AI 모델을 활용하여 프로젝트 설명 또는 업로드된 파일에서 핵심 디자인 콘셉트와 특징을 추출합니다.
- **프로젝트 검색 및 필터링:** 다양한 기준에 따라 프로젝트를 검색하고 필터링할 수 있습니다.

핵심 구조를 이해하고 시작하는 방법을 알아보려면 `/src/app/page.tsx` 파일을 살펴보세요.
