
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SafeImage from './SafeImage';

interface DiscoveryCardProps {
  title: string;
  imageUrl: string;
  description: React.ReactNode;
  source: string;
  tags?: string[];
  dataAiHint?: string;
  href?: string;
  onClick?: () => void;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ title, imageUrl, description, source, tags, dataAiHint, href, onClick }) => {
  
  const cardContent = (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg">
      <div className="relative w-full aspect-video bg-gray-200">
        <SafeImage
          src={imageUrl}
          alt={`Image for ${title}`}
          fill
          className="object-cover"
          data-ai-hint={dataAiHint || 'architecture design'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
        <Badge variant={source === '내부 DB' ? 'default' : 'secondary'} className="absolute top-2 right-2">{source}</Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-6 pt-0">
        <div className="flex-grow">{description}</div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t">
            {tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
        {cardContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

export default DiscoveryCard;
