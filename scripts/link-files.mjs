import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

// --- CONFIGURATION ---
const SERVICE_ACCOUNT_PATH = './workspace/serviceAccountKey.json';
const BATCH_SIZE = 400; // Firestore batch write limit is 500
// ---------------------


async function main() {
  console.log('🔗 Initializing Firebase Admin SDK...');
  const serviceAccount = JSON.parse(
    await readFile(resolve(SERVICE_ACCOUNT_PATH), 'utf8')
  );
  initializeApp({
    credential: cert(serviceAccount),
    // storageBucket: serviceAccount.project_id + '.appspot.com',
    storageBucket: serviceAccount.project_id + '.firebasestorage.app',
  });

  const db = getFirestore();
  const storage = getStorage();
  const bucket = storage.bucket();

  console.log('📚 Fetching all projects from Firestore...');
  const projectsSnapshot = await db.collection('projects').get();
  const projectsMap = new Map();
  projectsSnapshot.docs.forEach(doc => {
    projectsMap.set(doc.id, { id: doc.id, ...doc.data() });
  });
  const projectsCount = projectsMap.size;
  console.log(`  > Found ${projectsCount} projects.`);
  // 가져온 프로젝트 ID 목록을 출력하여 확인
  console.log("  > Firestore project IDs:", Array.from(projectsMap.keys()));


  console.log('📂 Fetching all files from Firebase Storage...');
  const [files] = await bucket.getFiles();
  console.log(`  > Found ${files.length} files.`);
  // 처음 몇 개의 파일 이름만 출력하여 형식 확인
  console.log("  > First 10 Storage file names:", files.slice(0, 10).map(file => file.name));


  console.log('🔗 Linking files to projects based on naming convention (e.g., "A-00001_filename.jpg")...');

  let batch = db.batch();
  let writeCount = 0;
  let totalFilesLinked = 0;

  for (const file of files) {
      const fullPath = file.name;
      const fileName = fullPath.split('/').pop() || '';

      console.log(`\nProcessing file: ${fileName}`); // 개별 파일 처리 시작 로그

      // 파일 이름 시작 부분에서 프로젝트 ID 패턴 추출 (예: A-00003)
      const projectIdMatch = fileName.match(/^([A-Z]-\d+)/); 

      if (projectIdMatch && projectIdMatch[1]) {
          const extractedProjectId = projectIdMatch[1];
          console.log(`  > Extracted potential project ID: ${extractedProjectId}`); // 추출된 ID 로그

          // 추출된 ID로 Firestore 프로젝트 Map에서 찾기
          const matchingProject = projectsMap.get(extractedProjectId);

          if (matchingProject) {
              console.log(`  > Matched with Firestore project ID: ${matchingProject.id}`); // 매칭 성공 로그

              const fileRef = db.collection('projects').doc(matchingProject.id).collection('files').doc();
              
              const fileType = getFileType(fileName);
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(fullPath)}`;

              batch.set(fileRef, {
                name: fileName,
                fullPath: fullPath,
                type: fileType,
                url: publicUrl,
                thumbnailUrl: (fileType === 'image' || fileType === 'drawing') ? publicUrl : undefined,
                projectId: matchingProject.id,
                createdAt: new Date(),
              });

              writeCount++;
              totalFilesLinked++;

              if (writeCount >= BATCH_SIZE) {
                console.log(`  > Committing batch of ${writeCount} file links (Total linked so far: ${totalFilesLinked})...`);
                await batch.commit();
                batch = db.batch();
                writeCount = 0;
              }

          } else {
              console.log(`  > No matching project found in Firestore for extracted ID: ${extractedProjectId}. Skipping file.`); // 매칭 실패 로그
          }

      } else {
          console.log(`  > Could not extract project ID from file name: ${fileName}. Skipping file.`); // ID 추출 실패 로그
      }
  }

  if (writeCount > 0) {
    console.log(`  > Committing final batch of ${writeCount} file links (Total linked so far: ${totalFilesLinked})...`);
    await batch.commit();
  }
  
  console.log('\n----------------------------------------');
  console.log(`✅ Linking complete!`);
  console.log(`  - Total projects checked: ${projectsCount}`);
  console.log(`  - Total files linked: ${totalFilesLinked} of ${files.length}`);
  console.log('----------------------------------------');
}

function getFileType(fileName) {
    const extension = (fileName.split('.').pop() || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        return 'image';
    }
    if (extension === 'pdf') {
        return 'pdf';
    }
    if (extension === '') {
      return 'unknown';
    }
    return 'drawing';
}


main().catch(error => {
  console.error('❌ An error occurred:');
  console.error(error);
  process.exit(1);
});
