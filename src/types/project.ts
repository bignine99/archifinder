// src/types/project.ts

/**
 * @fileOverview Defines the data structures for Project and related types.
 * This includes the main Project type, ProjectFile for file metadata,
 * and constants for various project attributes like types, areas, and design concepts.
 */

export interface ProjectFile {
  id: string; // Unique ID for the file document
  name: string; // Original file name
  url: string; // Firebase Storage download URL (or placeholder)
  type: string; // MIME type (e.g., 'image/jpeg', 'application/pdf')
  storagePath?: string; // The original path from Firestore (e.g., gs://...)
  thumbnailUrl?: string; // Optional: URL for a smaller thumbnail image
  dataAiHint?: string; // Optional: AI hints for image search
}

export interface Project {
  id: string; // Unique ID from Firestore (e.g., A-00001)
  name: string; // Project name
  location: string; // Broad location (e.g., "서울", "경기")
  address: string; // Detailed address
  projectType: string; // Type of building (e.g., "단독주택")
  areaType?: string; // Zoning area type (e.g., "주거지역")
  siteArea: number; // 대지면적 (m²)
  buildingArea: number; // 건축면적 (m²)
  totalFloorArea: number; // 총 연면적 (m²)
  buildingCoverageRatio: number; // 건폐율 (%)
  floorAreaRatio: number; // 용적률 (%)
  storiesAboveGround: number; // 지상층수
  storiesBelowGround: number; // 지하층수
  structureType: string; // 구조 (e.g., "철근콘크리트조")
  internalFinish?: string; // 내부마감
  externalFinish?: string; // 외부마감
  designConcepts: string[]; // AI-analyzed design concepts
  files: ProjectFile[]; // Array of associated files
  description?: string; // Optional project description
  year?: number; // Optional completion year
  debugInfo?: string; // For debugging server-side processes
}

// Constants for predefined project attributes, used for filtering.

// Based on the '용도' column in the Excel data
export const projectTypes = ["단독주택", "공동주택", "근린생활시설", "업무시설", "문화및집회시설", "교육연구시설", "숙박시설", "창고시설", "기타"];

// Based on the '지역2' column in the Excel data
export const areaTypes = ["도시지역", "주거지역", "상업지역", "공업지역", "녹지지역", "관리지역", "농림지역", "자연환경보전지역", "기타지역"];

// New constants for total floor area ranges
export const totalFloorAreaOptions = [
  "1000m² 이하",
  "1001m² ~ 5000m²",
  "5001m² ~ 10000m²",
  "10001m² ~ 50000m²",
  "50001m² 이상",
];

// Design concept tags, can be expanded by AI analysis
export const designConceptOptions = ["모던", "미니멀리스트", "지속가능한", "바이오필릭", "인더스트리얼", "브루탈리스트", "컨템포러리", "전통적인", "미래지향적", "파라메트릭", "에너지 효율", "친환경", "스마트", "모듈러"];
