
'use client';

import { Project } from '@/types/project';
import DiscoveryCard from './DiscoveryCard';

interface DiscoveryResultsProps {
  dbProjects: Project[];
  onProjectClick?: (project: Project) => void;
}

const DiscoveryResults: React.FC<DiscoveryResultsProps> = ({ dbProjects, onProjectClick }) => {

  if (!dbProjects) {
    return null;
  }

  if (dbProjects.length === 0) {
    return (
      <div className="mt-8 py-12 text-center text-muted-foreground bg-gray-50 rounded-lg">
        <p className="text-lg font-medium">검색 결과가 없습니다.</p>
        <p className="mt-2 text-sm">다른 키워드나 필터로 다시 검색해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dbProjects.map((project) => {
          const projectDetails = (
            <div className="text-xs space-y-1.5">
              <p><strong className="font-semibold text-foreground">용도/지역:</strong> <span className="text-muted-foreground">{project.projectType} / {project.areaType || '정보없음'}</span></p>
              <p><strong className="font-semibold text-foreground">주소:</strong> <span className="text-muted-foreground">{project.address}</span></p>
              <p><strong className="font-semibold text-foreground">연면적:</strong> <span className="text-muted-foreground">{project.totalFloorArea.toLocaleString()} m²</span></p>
              <p><strong className="font-semibold text-foreground">규모:</strong> <span className="text-muted-foreground">지상 {project.storiesAboveGround}층 / 지하 {project.storiesBelowGround}층</span></p>
              <p><strong className="font-semibold text-foreground">구조:</strong> <span className="text-muted-foreground">{project.structureType}</span></p>
              {project.debugInfo && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs rounded-md font-mono break-all">
                    <strong>Debug:</strong> {project.debugInfo}
                </div>
              )}
            </div>
          );

          const imageFile = project.files?.[0];
          const thumbnailUrl = imageFile?.url || 'https://placehold.co/800x600.png';

          return (
             <DiscoveryCard
              key={project.id}
              title={project.name}
              description={projectDetails}
              imageUrl={thumbnailUrl}
              source="내부 DB"
              tags={project.designConcepts}
              onClick={() => onProjectClick?.(project)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DiscoveryResults;
