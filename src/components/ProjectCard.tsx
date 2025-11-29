// src/components/ProjectCard.tsx

'use client'; // 클라이언트 컴포넌트로 만들기 (클릭 이벤트 등 인터랙션 위해)

import type { Project } from '@/types/project'; // Project 타입 임포트
import Image from 'next/image'; // Next.js Image 컴포넌트 사용 (성능 최적화)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // shadcn/ui Card 컴포넌트 가정

interface ProjectCardProps {
  project: Project; // ProjectGrid로부터 받아올 개별 프로젝트 데이터
  onClick?: () => void; // 카드 클릭 시 실행될 이벤트 핸들러
}

/**
 * Displays a single project as a card.
 * Shows a thumbnail (first image), project name, and some key details.
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  // Find the first image file to use as a thumbnail
  const thumbnailFile = project.files.find(file => file.type.startsWith('image/'));

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      onClick={onClick} // 카드 클릭 이벤트 연결
    >
      {/* Thumbnail Image */}
      <div className="relative w-full aspect-video bg-gray-200 flex items-center justify-center">
        {thumbnailFile && (
          <Image
            src={thumbnailFile.url} // Firebase Storage 이미지 URL
            alt={`Thumbnail for ${project.name}`}
            fill // 부모 div 크기에 맞게 이미지를 채움
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // 반응형 사이즈
            style={{ objectFit: 'cover' }} // 이미지를 부모 컨테이너에 맞게 자르면서 채움
            priority={false} // 로딩 우선순위 (처음 몇 개만 true 줄 수도)
          />
        )}
        {!thumbnailFile && (
          <span className="text-sm text-gray-500">No Image Available</span>
        )}
      </div>

      {/* Project Info */}
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600">
        <p className="truncate">{project.address}</p>
        <p>{project.projectType} | {project.areaType}</p>
        {/* Optional: Display first few design concepts */}
        {project.designConcepts && project.designConcepts.length > 0 && (
           <p className="truncate mt-1">
             {project.designConcepts.slice(0, 3).join(', ')} {project.designConcepts.length > 3 ? '...' : ''}
           </p>
        )}
        {/* Add other key info if needed */}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
