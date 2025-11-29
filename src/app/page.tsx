'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { discoverProjects } from '@/ai/flows/project-discovery-flow';
import { Project, projectTypes, areaTypes, designConceptOptions, totalFloorAreaOptions } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from 'lucide-react';
import FilterPanel from '@/components/FilterPanel';
import DiscoveryResults from '@/components/DiscoveryResults';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSearchStore } from '@/store/search-store';

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();

  const {
    query, setQuery,
    selectedProjectType, setSelectedProjectType,
    selectedAreaType, setSelectedAreaType,
    selectedTotalFloorArea, setSelectedTotalFloorArea,
    selectedDesignConcepts, setSelectedDesignConcepts,
    isDiscovering,
    discoveryResults,
    setDiscoveryState,
    resetSearch,
  } = useSearchStore();
  
  const handleDiscover = async () => {
    setDiscoveryState({ isDiscovering: true, discoveryResults: [] }); // Clear previous results
    try {
      const searchCriteria = {
        query,
        projectType: selectedProjectType,
        areaType: selectedAreaType,
        totalFloorArea: selectedTotalFloorArea,
        designConcepts: selectedDesignConcepts,
      };
      
      const result = await discoverProjects(searchCriteria);
      setDiscoveryState({ discoveryResults: result.projects || [] });

    } catch (err) {
      console.error("AI Discovery failed:", err);
      toast({ title: "내부 DB 검색 실패", description: "AI 추천 생성 중 오류가 발생했습니다.", variant: "destructive" });
      setDiscoveryState({ discoveryResults: [] });
    } finally {
      setDiscoveryState({ isDiscovering: false });
    }
  };

  const handleResetSearch = () => {
    resetSearch();
  };
  
  const handleProjectClick = (project: Project) => {
    router.push(`/project/${project.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <Card>
          <CardContent className="relative flex items-center justify-center p-6 min-h-[140px]">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <Image 
                src="https://www.koaiarchitecture.com/icons/logo.png"
                alt="KOAI Architecture Logo"
                width={200}
                height={48}
                style={{objectFit: 'contain'}}
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold">AIBIM-Reference Finder(Arch)</h1>
              <p className="text-muted-foreground">AI기반 건축 레퍼런스 검색</p>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <Image 
                src="https://mblogthumb-phinf.pstatic.net/20140809_284/ballvic123_1407568271273eLdH6_PNG/%B5%BF%B1%B9%B4%EB.png?type=w420" 
                alt="Dongguk University Logo" 
                width={160} 
                height={36} 
                style={{objectFit: 'contain'}}
                priority
              />
            </div>
          </CardContent>
        </Card>
      </header>

      <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle>프로젝트 검색</CardTitle>
            <CardDescription>Reference Finder는 입력된 조건을 기반으로, AI가 과거의 설계 정보, 이미지, 도면 등을 분석하여 제공합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="searchQuery">키워드</Label>
               <Input
                  id="searchQuery"
                  type="text"
                  placeholder="찾고 싶은 프로젝트 관련 정보를 입력하세요 (예: '미니멀한 카페')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleDiscover(); }}
                  className="text-base h-12"
                  disabled={isDiscovering}
                />
             </div>
            
            <FilterPanel
              projectTypes={projectTypes}
              areaTypes={areaTypes}
              totalFloorAreaOptions={totalFloorAreaOptions}
              designConceptOptions={designConceptOptions}
              selectedProjectType={selectedProjectType}
              onProjectTypeChange={setSelectedProjectType}
              selectedAreaType={selectedAreaType}
              onAreaTypeChange={setSelectedAreaType}
              selectedTotalFloorArea={selectedTotalFloorArea}
              onTotalFloorAreaChange={setSelectedTotalFloorArea}
              selectedDesignConcepts={selectedDesignConcepts}
              onDesignConceptsChange={setSelectedDesignConcepts}
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
               <Button onClick={handleDiscover} className="h-12 w-full sm:w-auto flex-grow" disabled={isDiscovering}>
                {isDiscovering ? <Loader2 className="animate-spin" /> : <Search />}
                유사 프로젝트 검색
              </Button>
              <Button onClick={handleResetSearch} variant="outline" className="h-12 w-full sm:w-auto" type="button">
                  모든 검색 초기화
              </Button>
            </div>
          </CardContent>
      </Card>
      
      {isDiscovering && (
        <div className="text-center text-muted-foreground mt-4 py-8">
          AI가 내부 데이터베이스에서 레퍼런스를 찾고 있습니다...
        </div>
      )}

      {discoveryResults && (
         <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-4">추천 프로젝트</h2>
          <DiscoveryResults
            dbProjects={discoveryResults}
            onProjectClick={handleProjectClick}
          />
        </div>
      )}
    </div>
  );
}
