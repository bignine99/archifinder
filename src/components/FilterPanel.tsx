// src/components/FilterPanel.tsx

'use client'; // 클라이언트 컴포넌트로 만들기

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  projectTypes: string[];
  areaTypes: string[];
  totalFloorAreaOptions: string[];
  designConceptOptions: string[];
  
  selectedProjectType: string;
  onProjectTypeChange: (value: string) => void;
  
  selectedAreaType: string;
  onAreaTypeChange: (value: string) => void;

  selectedTotalFloorArea: string;
  onTotalFloorAreaChange: (value: string) => void;
  
  selectedDesignConcepts: string[];
  onDesignConceptsChange: (concepts: string[]) => void;
}

/**
 * Filter panel component to select project search criteria.
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  projectTypes,
  areaTypes,
  totalFloorAreaOptions,
  designConceptOptions,
  selectedProjectType,
  onProjectTypeChange,
  selectedAreaType,
  onAreaTypeChange,
  selectedTotalFloorArea,
  onTotalFloorAreaChange,
  selectedDesignConcepts,
  onDesignConceptsChange,
}) => {
  // --- Handlers ---
  const handleDesignConceptChange = (concept: string, isChecked: boolean) => {
    let updatedConcepts: string[];
    if (isChecked) {
      updatedConcepts = [...selectedDesignConcepts, concept];
    } else {
      updatedConcepts = selectedDesignConcepts.filter(item => item !== concept);
    }
    onDesignConceptsChange(updatedConcepts);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">세부 필터</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        {/* Project Type Select */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="projectType">프로젝트 유형</Label>
          <Select onValueChange={onProjectTypeChange} value={selectedProjectType}>
            <SelectTrigger id="projectType">
              <SelectValue placeholder="유형 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 유형</SelectItem>
              {projectTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Type Select */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="areaType">지역 유형</Label>
          <Select onValueChange={onAreaTypeChange} value={selectedAreaType}>
            <SelectTrigger id="areaType">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 지역</SelectItem>
              {areaTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Total Floor Area Select */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="totalFloorArea">연면적</Label>
          <Select onValueChange={onTotalFloorAreaChange} value={selectedTotalFloorArea}>
            <SelectTrigger id="totalFloorArea">
              <SelectValue placeholder="연면적 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 면적</SelectItem>
              {totalFloorAreaOptions.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Design Concepts Multi-Select (using Popover and Checkboxes) */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="designConcepts">디자인 컨셉</Label>
           <Popover>
             <PopoverTrigger asChild>
               <Button variant="outline" className="justify-between pr-2" id="designConcepts">
                 {selectedDesignConcepts.length > 0
                   ? `${selectedDesignConcepts.length}개 선택됨`
                   : "컨셉 선택"}
                 <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
               <ScrollArea className="h-48">
                  <div className="flex flex-col space-y-2 p-4">
                    {designConceptOptions.map(concept => (
                      <div key={concept} className="flex items-center space-x-2">
                         <Checkbox
                           id={`concept-${concept}`}
                           checked={selectedDesignConcepts.includes(concept)}
                           onCheckedChange={(isChecked: boolean) => handleDesignConceptChange(concept, isChecked)}
                         />
                         <Label htmlFor={`concept-${concept}`} className="text-sm cursor-pointer">
                           {concept}
                         </Label>
                       </div>
                    ))}
                  </div>
               </ScrollArea>
             </PopoverContent>
           </Popover>
           {selectedDesignConcepts.length > 0 && (
             <div className="text-xs text-gray-600 mt-1 truncate">
                선택: {selectedDesignConcepts.join(', ')}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
