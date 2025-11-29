'use strict';
/**
 * @fileOverview Script to import project metadata from a CSV file into Firestore.
 */
import fs from 'fs';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import csv from 'csv-parser';

// --- Configuration ---
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'workspace', 'serviceAccountKey.json');
const CSV_FILE_PATH = path.join(process.cwd(), 'workspace', 'metadata.csv');
const FIRESTORE_COLLECTION = 'projects';
const BATCH_SIZE = 500; // Firestore batch writes are limited to 500 operations.

// --- Helper Functions ---

/**
 * Checks if the required files exist.
 * @returns {boolean} True if all files are found, otherwise false.
 */
function checkRequiredFiles() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`❌ Error: Service account key not found at ${SERVICE_ACCOUNT_PATH}`);
    console.error('Please download it from Firebase Console > Project Settings > Service accounts and save it as "serviceAccountKey.json" in your workspace directory.');
    return false;
  }
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ Error: CSV file not found at ${CSV_FILE_PATH}`);
    console.error('Please ensure your "metadata.csv" file is in your workspace directory.');
    return false;
  }
  return true;
}

/**
 * Initializes Firebase Admin SDK.
 */
function initializeFirebase() {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({
    credential: cert(serviceAccount),
  });
  console.log('🔥 Firebase Admin SDK initialized.');
}

/**
 * Parses a string value from CSV into a number. Returns 0 if invalid.
 * @param {string} value The string value to parse.
 * @returns {number} The parsed number or 0.
 */
function parseNumber(value) {
  if (value === null || value === undefined || value.trim() === '') return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Transforms a CSV row into a Firestore document object.
 * @param {object} row A single row object from the CSV parser.
 * @returns {object} A Firestore document object.
 */
function transformRowToDoc(row) {
  // Map CSV column names (in Korean) to Firestore document fields (in English).
  const doc = {
    id: row['고유번호'], // <-- '고유번호' 필드가 비어있지 않은지 확인 중요!
    name: row['프로젝트'] || '',
    location: row['지역'] || '',
    address: row['주소'] || '',
    projectType: row['용도'] || '기타',
    areaType: row['지역2'] || '기타지역',
    siteArea: parseNumber(row['대지면적']),
    buildingArea: parseNumber(row['건축면적']),
    totalFloorArea: parseNumber(row['연면적']),
    buildingCoverageRatio: parseNumber(row['건폐율']),
    floorAreaRatio: parseNumber(row['용적률']),
    storiesAboveGround: parseNumber(row['지상층수']),
    storiesBelowGround: parseNumber(row['지하층수']),
    structureType: row['구조'] || '',
    internalFinish: row['내부마감'] || '',
    externalFinish: row['외부마감'] || '',
    description: row['설계개념'] || '',
    // --- Default values for fields not in CSV ---
    designConcepts: [],
    files: [],
    createdAt: new Date(),
  };
  console.log('DEBUG: Transformed doc:', doc); // 변환된 문서 객체 로그
  return doc;
}


/**
 * Main function to run the import process.
 */
async function main() {
  console.log('🚀 Starting Firestore data import...');
  if (!checkRequiredFiles()) {
    process.exit(1);
  }

  try {
    initializeFirebase();
    const db = getFirestore();
    const projects = [];

  // 1. Read and parse the CSV file
  await new Promise((resolve, reject) => {
      
    // ✨ 여기에 headers 배열 정의 코드를 추가합니다. ✨
    const headers = [
      '고유번호', '프로젝트', '지역', '주소', '시도', '시군구', '읍면동', '지역2', '지구', '용도',
      '대지면적', '건축면적', '연면적', '건폐율', '용적률', '지상층수', '지하층수', '구조', '내부마감',
      '외부마감', '설계개념'
    ]; // CSV 헤더 이름을 직접 배열로 정의

    // ✨ 파서 초기화 부분을 수정합니다. headers: true 대신 headers 배열을 전달합니다. ✨
    const parser = csv({ headers: headers, separator: ',' }); 

    fs.createReadStream(CSV_FILE_PATH)
      .on('error', (streamError) => {
          console.error('❌ Error reading CSV file stream:', streamError);
          reject(streamError);
      })
      .pipe(parser)
      // .on('headers', (headers) => { // headers 배열을 직접 전달하므로 이 핸들러는 더 이상 필요 없습니다. 주석 처리하거나 삭제합니다.
      //   console.log('DEBUG: CSV Headers:', headers); 
      // })
      .on('data', (row) => {
        // console.log('DEBUG: Raw CSV row:', row); 

        console.log('--- Processing New Row ---'); 
        console.log('DEBUG: Parsed row:', row); 

        console.log('DEBUG: Keys in parsed row:', Object.keys(row)); 

        const hasIdProperty = Object.prototype.hasOwnProperty.call(row, '고유번호');
        const idValue = row['고유번호'];
        const isIdTruthy = !!idValue; 
        const isIdTrimmedEmpty = typeof idValue === 'string' && idValue.trim() === ''; 

        console.log(`DEBUG: Check '고유번호': Has property=${hasIdProperty}, Value='${idValue}', IsTruthy=${isIdTruthy}, IsTrimmedEmpty=${isIdTrimmedEmpty}`);

        if (hasIdProperty && isIdTruthy && !isIdTrimmedEmpty) { 
          const projectDoc = transformRowToDoc(row);
          projects.push(projectDoc);
          console.log('DEBUG: Row ADDED to projects array.'); 
        } else {
          console.log('DEBUG: Skipping row (failed check).'); 
        }
      })
      .on('end', () => {
        console.log(`✅ CSV file successfully processed.`);
        console.log(`DEBUG: Projects array length after processing: ${projects.length}`);
        console.log(`DEBUG: First few project IDs from CSV:`, projects.slice(0, 5).map(p => p.id)); 
        console.log(`DEBUG: Last few project IDs from CSV:`, projects.slice(-5).map(p => p.id)); 

        if (projects.length === 0) {
            console.warn('⚠️ No valid projects found in CSV file.');
        }
        resolve();
      })
      .on('error', (parserError) => { 
        console.error('❌ Error during CSV parsing:', parserError);
        reject(parserError);
      });
  });

    if (projects.length === 0) {
      console.warn('⚠️ No projects to import to Firestore. Exiting.');
      return;
    }

    // 2. Write data to Firestore in batches
    const collectionRef = db.collection(FIRESTORE_COLLECTION);
    let committedCount = 0;

    console.log(`⏳ Starting Firestore batch writes for ${projects.length} projects...`);

    for (let i = 0; i < projects.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = projects.slice(i, i + BATCH_SIZE);

      chunk.forEach((project) => {
        if (project.id) { // 유효한 프로젝트 ID가 있는 경우에만 배치에 추가
            const docRef = collectionRef.doc(project.id);
            batch.set(docRef, project);
            // console.log(`DEBUG: Added project ${project.id} to batch.`); // 배치에 추가된 프로젝트 로그
        } else {
            console.warn('WARNING: Skipping project with empty ID during batch write:', project); // ID가 없는 프로젝트 경고
        }
      });

      if (chunk.length > 0 && chunk.some(p => p.id)) { // 청크에 유효한 ID를 가진 프로젝트가 하나라도 있는 경우에만 커밋
        await batch.commit();
        committedCount += chunk.filter(p => p.id).length;
        console.log(`...Committed ${committedCount} of ${projects.length} projects to Firestore.`);
      } else {
          console.log(`DEBUG: Skipping commit for empty batch.`);
      }
    }

    console.log('\n✅ Import complete!');
    console.log(`📊 Total projects attempted to import: ${projects.length}`);
    console.log(`📊 Total projects successfully committed to Firestore: ${committedCount}`);

  } catch (error) {
    console.error('\n❌ An error occurred during the import process:');
    console.error(error);
    process.exit(1);
  }
}

main();
