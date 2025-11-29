// src/components/ProjectGrid.tsx

import type { Project } from '@/types/project'; // Project 타입 임포트
import ProjectCard from './ProjectCard'; // 개별 프로젝트 카드를 위한 컴포넌트

interface ProjectGridProps {
  projects: Project[]; // src/app/page.tsx에서 받아올 프로젝트 목록
  // onClick handlers for card clicks or file viewer modal if managed here
  onProjectClick?: (project: Project) => void;
}

/**
 * Renders a grid of project cards.
 * Receives a list of projects and displays them using ProjectCard components.
 */
const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onProjectClick }) => {
  if (!projects || projects.length === 0) {
    return <div className="text-center text-gray-500">No projects to display.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id} // 각 카드의 고유 key는 project.id 사용
          project={project} // 개별 프로젝트 데이터 전달
          onClick={() => onProjectClick?.(project)} // 카드 클릭 시 이벤트 핸들러 (옵션)
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
