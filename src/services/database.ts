
'use server';
/**
 * @fileOverview Services for interacting with Firebase Storage and Firestore using the Admin SDK.
 * This file contains the definitive, most robust versions of data fetching and querying logic.
 * This version implements a high-performance architecture where queries fetch only thumbnails,
 * and full file sets are fetched only on the detail page, preventing timeouts.
 */

import { db, admin } from '@/lib/firebase-admin'; // Use the Admin SDK
import { getStorage } from 'firebase-admin/storage';
import type { Project, ProjectFile } from '@/types/project';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Generates signed URLs for a given list of project files from Firebase Storage.
 * @param files An array of ProjectFile objects with storage paths.
 * @returns A promise that resolves to an array of ProjectFile objects with signed URLs.
 */
async function getSignedUrlsForFiles(files: ProjectFile[]): Promise<ProjectFile[]> {
    if (!files || files.length === 0) return [];

    const options = { action: 'read' as const, expires: Date.now() + 1000 * 60 * 60 }; // 1 hour
    
    const bucket = getStorage().bucket();

    const signedUrlPromises = files.map(async (file) => {
        const storagePath = file.storagePath; 
        if (!storagePath || storagePath.startsWith('https://')) {
            return { ...file, url: storagePath || `https://placehold.co/800x600.png` };
        }
        
        try {
            const fileRef = bucket.file(storagePath);
            const [exists] = await fileRef.exists();
            if (!exists) {
                console.warn(`URL_SIGNER: File does not exist at path: ${storagePath}`);
                return { ...file, url: `https://placehold.co/800x600.png` };
            }
            const [signedUrl] = await fileRef.getSignedUrl(options);
            return { ...file, url: signedUrl };
        } catch (e: any) {
            console.error(`URL_SIGNER: FAILED to sign URL for '${storagePath}'. Error:`, e.message);
            return { ...file, url: `https://placehold.co/800x600.png` };
        }
    });

    return Promise.all(signedUrlPromises);
}

const safeGetNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const num = parseFloat(value.replace(/,/g, ''));
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

/**
 * [DETAIL PAGE FUNCTION] Retrieves a SINGLE project by ID and dynamically discovers ALL its associated files from Storage.
 * This is meant for the project detail page and is more exhaustive.
 * If Storage files are not found, it will still return the Firestore data.
 * @param projectId The ID of the project.
 * @returns A Project object with all file URLs signed, or null if not found.
 */
export async function getProjectWithFiles(projectId: string): Promise<Project | null> {
  noStore();
  let projectData: Project | null = null;
  
  try {
    // Step 1: Fetch data from Firestore. This is the most critical part.
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      console.warn(`DATABASE_SERVICE (Detail): Project with ID ${projectId} not found in Firestore.`);
      return null;
    }

    const data = projectDoc.data() || {};
    projectData = {
      id: projectId,
      name: data.name || 'Untitled Project',
      location: data.location || 'Unknown Location',
      address: data.address || '',
      projectType: data.projectType || '기타',
      areaType: data.areaType || '기타지역',
      siteArea: safeGetNumber(data.siteArea),
      buildingArea: safeGetNumber(data.buildingArea),
      totalFloorArea: safeGetNumber(data.totalFloorArea),
      buildingCoverageRatio: safeGetNumber(data.buildingCoverageRatio),
      floorAreaRatio: safeGetNumber(data.floorAreaRatio),
      storiesAboveGround: safeGetNumber(data.storiesAboveGround),
      storiesBelowGround: safeGetNumber(data.storiesBelowGround),
      structureType: data.structureType || 'Unknown Structure',
      internalFinish: data.internalFinish || '',
      externalFinish: data.externalFinish || '',
      description: data.description || '',
      designConcepts: Array.isArray(data.designConcepts) ? data.designConcepts : [],
      files: [], // Initialize with empty files
    };

  } catch (error: any) {
    console.error(`DATABASE_SERVICE (Detail): CRITICAL error fetching project document ${projectId} from Firestore:`, error.stack || error.message);
    return null; // If Firestore fetch fails, we can't proceed.
  }
  
  try {
    // Step 2: Try to find associated files in Storage. This part is allowed to fail without nullifying the whole result.
    const bucket = getStorage().bucket();
    
    // Check for files in a "folder" (e.g., "A-00001/image.jpg")
    const [folderFiles] = await bucket.getFiles({ prefix: `${projectId}/` });
    
    // Check for files prefixed with the ID (e.g., "A-00001_image.jpg")
    const [prefixedFiles] = await bucket.getFiles({ prefix: projectId, delimiter: '/' });
    
    const allStorageFiles = [...folderFiles, ...prefixedFiles];
    
    // Use a Set to avoid duplicates if a file matches both queries
    const uniqueFiles = Array.from(new Map(allStorageFiles.map(f => [f.name, f])).values());
    
    let files: ProjectFile[] = [];
    if (uniqueFiles.length > 0) {
        files = uniqueFiles
          .filter(file => !file.name.endsWith('/')) // Exclude folder objects
          .map((storageFile, index) => ({
            id: storageFile.id || `${projectId}-file-${index}`,
            name: storageFile.name.split('/').pop() || storageFile.name,
            url: '',
            type: storageFile.metadata.contentType || 'application/octet-stream',
            storagePath: storageFile.name,
        }));
    }

    projectData.files = await getSignedUrlsForFiles(files);

  } catch (error: any) {
      console.error(`DATABASE_SERVICE (Detail): Non-critical error finding files for project ${projectId} in Storage. Returning project data without files. Error:`, error.message);
      // We already have projectData, so we just return it with empty or partially filled files.
  }

  return projectData;
}

interface QueryFilters {
  projectType?: string;
  areaType?: string;
  totalFloorArea?: string;
  searchTerms?: string[];
}

const parseFloorArea = (range: string): { min: number; max: number } => {
    if (!range) return { min: 0, max: Infinity };
    if (range.includes('이하')) {
        return { min: 0, max: parseInt(range.replace(/\D/g, ''), 10) };
    }
    if (range.includes('이상')) {
        return { min: parseInt(range.replace(/\D/g, ''), 10), max: Infinity };
    }
    const parts = range.replace(/m²|\s|,/g, '').split('~');
    const min = parseInt(parts[0], 10);
    const max = parseInt(parts[1], 10);
    return { min: isNaN(min) ? 0 : min, max: isNaN(max) ? Infinity : max };
};

/**
 * [SEARCH PAGE FUNCTION] Fetches, filters, and scores projects for the main search results.
 * This version includes robust error handling and returns debug information on failure.
 */
export async function queryProjects(filters: QueryFilters): Promise<Project[]> {
    noStore();
    try {
        const projectsSnapshot = await db.collection('projects').get();
        if (projectsSnapshot.empty) {
            return [];
        }

        const allProjects: Project[] = projectsSnapshot.docs.map(doc => {
            const data = doc.data() || {};
            return {
                id: doc.id,
                name: data.name || 'Untitled Project',
                location: data.location || 'Unknown Location',
                address: data.address || '',
                projectType: data.projectType || '기타',
                areaType: data.areaType || '기타지역',
                siteArea: safeGetNumber(data.siteArea),
                buildingArea: safeGetNumber(data.buildingArea),
                totalFloorArea: safeGetNumber(data.totalFloorArea),
                buildingCoverageRatio: safeGetNumber(data.buildingCoverageRatio),
                floorAreaRatio: safeGetNumber(data.floorAreaRatio),
                storiesAboveGround: safeGetNumber(data.storiesAboveGround),
                storiesBelowGround: safeGetNumber(data.storiesBelowGround),
                structureType: data.structureType || 'Unknown Structure',
                internalFinish: data.internalFinish || '',
                externalFinish: data.externalFinish || '',
                description: data.description || '',
                designConcepts: data.designConcepts || [],
                files: [], // Files will be added later for performance
            };
        });
        
        // Step 1: Apply HARD filters. These are absolute requirements.
        const hardFilteredProjects = allProjects.filter(p => {
            if (filters.projectType && filters.projectType !== 'all' && p.projectType !== filters.projectType) {
                return false;
            }
            if (filters.totalFloorArea && filters.totalFloorArea !== 'all') {
                const { min, max } = parseFloorArea(filters.totalFloorArea);
                if (p.totalFloorArea < min || p.totalFloorArea > max) {
                    return false;
                }
            }
            return true;
        });

        // Step 2: Score the remaining projects based on SOFT filters and keywords.
        const terms = (filters.searchTerms || []).map(t => t.toLowerCase()).filter(t => t.trim() !== '');
        
        const scoredProjects = hardFilteredProjects.map(p => {
            let score = 0;
            const name = p.name.toLowerCase();
            const description = (p.description || '').toLowerCase();
            const concepts = (p.designConcepts || []).join(' ').toLowerCase();
            const projectAreaType = (p.areaType || '').toLowerCase();
            
            if (filters.areaType && filters.areaType !== 'all' && projectAreaType === filters.areaType.toLowerCase()) {
                score += 20;
            }
            for (const term of terms) {
                if (name.includes(term)) score += 10;
                if (concepts.includes(term)) score += 5;
                if (description.includes(term)) score += 2;
            }
            return { ...p, score };
        });

        scoredProjects.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        
        const topProjects = scoredProjects.slice(0, 9);
        if (topProjects.length === 0) return [];

        const projectsWithThumbnails = await Promise.all(topProjects.map(async (project) => {
            try {
                const bucket = getStorage().bucket();
                const [storageFiles] = await bucket.getFiles({ prefix: project.id, autoPaginate: false, maxResults: 5 });
                const imageFile = storageFiles.find(f => 
                    !f.name.endsWith('/') && 
                    (f.metadata.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name))
                );
    
                if (imageFile) {
                    const [signedUrl] = await imageFile.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 });
                    project.files = [{
                        id: imageFile.id || `${project.id}-thumb`,
                        name: imageFile.name,
                        url: signedUrl,
                        type: imageFile.metadata.contentType || 'image',
                        storagePath: imageFile.name,
                    }];
                }
            } catch (e: any) {
                console.warn(`(Query) Non-critical error getting thumbnail for project ${project.id}. Error:`, e.message);
                project.debugInfo = `썸네일 로딩 실패: ${e.message}`;
            }
            return project;
        }));

        return projectsWithThumbnails;

    } catch (error: any) {
        console.error("DATABASE_SERVICE (Query): CRITICAL DATABASE QUERY FAILED.", error.stack || error.message);
        // Return a special error object that the UI can render to show the problem.
        return [{
            id: 'DEBUG_QUERY_FAILED',
            name: 'DB 쿼리 실패',
            projectType: 'Error',
            address: 'Query Failed',
            location: 'N/A',
            areaType: 'N/A',
            siteArea: 0,
            buildingArea: 0,
            totalFloorArea: 0,
            buildingCoverageRatio: 0,
            floorAreaRatio: 0,
            storiesAboveGround: 0,
            storiesBelowGround: 0,
            structureType: 'N/A',
            designConcepts: [],
            files: [],
            debugInfo: `데이터베이스 쿼리 중 오류가 발생했습니다: ${error.message}`
        }];
    }
}

export async function getInitialProjects(): Promise<Project[]> {
    return queryProjects({});
}


export async function upsertProjectMetadata(
  projectId: string,
  metadata: { designConcepts: string[] }
): Promise<void> {
  if (!projectId || !metadata.designConcepts || metadata.designConcepts.length === 0) {
    console.log('DATABASE_SERVICE (Metadata): Skipping metadata update due to empty input.');
    return;
  }
  const projectRef = db.collection('projects').doc(projectId);

  try {
    await projectRef.update({
      designConcepts: admin.firestore.FieldValue.arrayUnion(...metadata.designConcepts),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`DATABASE_SERVICE (Metadata): Successfully upserted metadata for project ${projectId}.`);
  } catch (error) {
    console.error(`DATABASE_SERVICE (Metadata): Error upserting metadata for project ${projectId}:`, error);
    throw new Error('Failed to update project metadata in database.');
  }
}
