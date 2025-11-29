
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectWithFiles } from '@/services/database';
import type { Project, ProjectFile } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SafeImage from '@/components/SafeImage';

const ProjectDetailSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-8" />
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </CardContent>
        </Card>
        <Skeleton className="h-8 w-32 mt-8 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="aspect-video w-full" />
        </div>
    </div>
);


const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => {
    if (!value && typeof value !== 'number') return null;
    return (
        <div className="flex flex-col sm:flex-row sm:items-center">
            <dt className="sm:w-1/3 font-semibold text-gray-700">{label}</dt>
            <dd className="mt-1 sm:mt-0 sm:w-2/3 text-gray-900">{value}</dd>
        </div>
    );
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) return;
        
        async function fetchProject() {
            setLoading(true);
            try {
                const fetchedProject = await getProjectWithFiles(projectId);
                if (fetchedProject) {
                    setProject(fetchedProject);
                } else {
                    setError('프로젝트를 찾을 수 없습니다.');
                }
            } catch (err) {
                console.error("Failed to fetch project:", err);
                setError('프로젝트 정보를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        }
        
        fetchProject();
    }, [projectId]);

    if (loading) {
        return <ProjectDetailSkeleton />;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">{error}</h2>
                <Button onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로가기
                </Button>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const imageFiles = project.files.filter(f => f.type.startsWith('image/') || f.type === 'image');
    const otherFiles = project.files.filter(f => !f.type.startsWith('image/') && f.type !== 'image');

    return (
        <main className="container mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> 검색페이지로
            </Button>
            
            <header className="mb-8">
                 <h1 className="text-4xl font-bold">{project.name}</h1>
                 <p className="text-lg text-muted-foreground mt-2">{project.address}</p>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>프로젝트 개요</CardTitle>
                        {project.description && <CardDescription>{project.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <dl className="space-y-4">
                            <DetailRow label="고유번호" value={project.id} />
                            <DetailRow label="프로젝트 유형" value={project.projectType} />
                            <DetailRow label="지역 유형" value={project.areaType} />
                            <DetailRow label="구조" value={project.structureType} />
                            <DetailRow label="지상/지하 층수" value={`지상 ${project.storiesAboveGround}층 / 지하 ${project.storiesBelowGround}층`} />
                            <Separator />
                            <DetailRow label="대지면적" value={`${project.siteArea} m²`} />
                            <DetailRow label="건축면적" value={`${project.buildingArea} m²`} />
                            <DetailRow label="연면적" value={`${project.totalFloorArea} m²`} />
                            <DetailRow label="건폐율" value={`${project.buildingCoverageRatio} %`} />
                            <DetailRow label="용적률" value={`${project.floorAreaRatio} %`} />
                             <Separator />
                            <DetailRow label="내부마감" value={project.internalFinish} />
                            <DetailRow label="외부마감" value={project.externalFinish} />
                            <Separator />
                             <div>
                                <dt className="font-semibold text-gray-700">디자인 컨셉</dt>
                                <dd className="mt-2 flex flex-wrap gap-2">
                                    {project.designConcepts.length > 0 ? project.designConcepts.map(c => <Badge key={c} variant="secondary">{c}</Badge>) : '정보 없음'}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                {imageFiles.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">이미지 자료</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {imageFiles.map(file => (
                                <div key={file.id} className="relative aspect-video w-full overflow-hidden rounded-lg">
                                    <SafeImage
                                        src={file.url}
                                        alt={file.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        loading="lazy" 
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                 {otherFiles.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4">문서 자료</h2>
                         <ul>
                            {otherFiles.map(file => (
                                <li key={file.id}>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="link">{file.name}</Button>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </main>
    );
}
