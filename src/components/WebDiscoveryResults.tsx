
'use client';

import { WebDiscoveryOutput } from '@/ai/flows/web-discovery-flow';
import DiscoveryCard from './DiscoveryCard';

interface WebDiscoveryResultsProps {
  webProjects: WebDiscoveryOutput['webProjects'];
}

const WebDiscoveryResults: React.FC<WebDiscoveryResultsProps> = ({ webProjects }) => {

  if (!webProjects) {
    return null;
  }

  if (webProjects.length === 0) {
    return (
      <div className="mt-8 py-12 text-center text-muted-foreground bg-gray-50 rounded-lg">
        <p className="text-lg font-medium">웹 검색 결과가 없습니다.</p>
        <p className="mt-2 text-sm">다른 키워드로 다시 검색해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {webProjects.map((project, index) => (
          <DiscoveryCard
            key={`${project.sourceUrl}-${index}`}
            title={project.name}
            description={<p className="text-sm text-muted-foreground">{project.description}</p>}
            imageUrl={project.imageUrl}
            source={project.source}
            href={project.sourceUrl}
            dataAiHint="architecture web"
          />
        ))}
      </div>
    </div>
  );
};

export default WebDiscoveryResults;
