// src/components/FileViewerModal.tsx

'use client'; 

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { extractDesignConcepts } from '@/ai/flows/design-concept-extraction';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import type { Project, ProjectFile } from '@/types/project';

interface FileViewerModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ project, open, onClose }) => {
  const { toast } = useToast();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [analyzingFileId, setAnalyzingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (open && project) {
      setCurrentProject(project);
      setSelectedFile(null); 
      setPageNumber(1);
      setNumPages(null);
    } else if (!open) {
      setCurrentProject(null);
      setSelectedFile(null);
      setPageNumber(1);
      setNumPages(null);
      setAnalyzingFileId(null);
    }
  }, [open, project]);

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFile(file);
    setPageNumber(1);
    setNumPages(null);
  };
  
  const handleAnalyzeFile = async (fileToAnalyze: ProjectFile) => {
    if (!currentProject) return;
    setAnalyzingFileId(fileToAnalyze.id);
    
    try {
      // 1. Fetch the file from its URL
      const response = await fetch(fileToAnalyze.url);
      if (!response.ok) throw new Error('Failed to fetch file for analysis.');
      const blob = await response.blob();

      // 2. Convert to a Data URI
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // 3. Call the AI flow
        const result = await extractDesignConcepts({
            projectId: currentProject.id,
            documentDataUri: base64data,
        });

        const newConcepts = result.designConcepts;

        // 4. Update UI state and show success toast
        if (newConcepts && newConcepts.length > 0) {
            setCurrentProject(prevProject => {
                if (!prevProject) return null;
                const existingConcepts = new Set(prevProject.designConcepts);
                newConcepts.forEach(c => existingConcepts.add(c));
                return { ...prevProject, designConcepts: Array.from(existingConcepts) };
            });
            toast({
                title: "컨셉 분석 성공",
                description: `새로운 컨셉 [${newConcepts.join(', ')}]이(가) 추가되었습니다.`,
            });
        } else {
             toast({
                title: "컨셉 분석 완료",
                description: "추가할 새로운 디자인 컨셉을 찾지 못했습니다.",
             });
        }
        setAnalyzingFileId(null);
      };
      reader.onerror = () => {
        throw new Error('Failed to read file as data URI.');
      }
    } catch (error) {
        console.error("Analysis failed:", error);
        toast({
            title: "컨셉 분석 실패",
            description: "AI 분석 중 오류가 발생했습니다. 나중에 다시 시도해주세요.",
            variant: "destructive",
        });
        setAnalyzingFileId(null);
    }
  };


  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPreviousPage = () => setPageNumber(pageNumber => Math.max(1, pageNumber - 1));
  const goToNextPage = () => setPageNumber(pageNumber => Math.min(numPages || 1, pageNumber + 1));

  const renderFileContent = () => {
    if (!selectedFile) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          왼쪽 목록에서 파일을 선택하여 미리보세요.
        </div>
      );
    }

    if (selectedFile.type.startsWith('image/')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-100 overflow-hidden">
          <Image
            src={selectedFile.url}
            alt={selectedFile.name}
            layout="fill"
            objectFit="contain"
            className="rounded-md"
          />
        </div>
      );
    } else if (selectedFile.type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center w-full h-full overflow-auto">
          <Document
            file={selectedFile.url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error('Error loading PDF:', error)}
            className="max-w-full"
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              renderMode="canvas"
              width={typeof window !== 'undefined' ? Math.min(800, window.innerWidth * 0.9) : 800}
            />
          </Document>
          {numPages && (
            <div className="flex items-center justify-center mt-4 space-x-2">
              <Button onClick={goToPreviousPage} disabled={pageNumber <= 1}>
                이전 페이지
              </Button>
              <span>페이지 {pageNumber} / {numPages}</span>
              <Button onClick={goToNextPage} disabled={pageNumber >= numPages}>
                다음 페이지
              </Button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>미리보기를 지원하지 않는 파일 형식입니다: {selectedFile.type}</p>
          <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2">
            <Button variant="link">원본 파일 다운로드/열기</Button>
          </a>
        </div>
      );
    }
  };

  if (!open || !currentProject) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{currentProject.name} 파일 보기</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          <div className="w-full md:w-80 md:min-w-[20rem] border-r flex flex-col">
             <div className="p-4 border-b">
                <h3 className="text-lg font-semibold mb-2">파일 목록</h3>
                <p className="text-sm text-muted-foreground">분석할 파일을 선택하고 버튼을 누르세요.</p>
             </div>
            <ScrollArea className="flex-grow">
              <ul className="p-2 space-y-1">
                {currentProject.files.length === 0 && (
                  <li className="text-sm text-gray-500 px-2 py-4 text-center">첨부 파일이 없습니다.</li>
                )}
                {currentProject.files.map((file) => {
                  const isAnalysable = file.type.startsWith('image/') || file.type === 'application/pdf';
                  const isAnalyzingThis = analyzingFileId === file.id;
                  const isAnotherAnalyzing = analyzingFileId !== null && !isAnalyzingThis;
                  
                  return (
                  <li
                    key={file.id}
                    className={`flex items-center p-2 rounded-md transition-colors group
                                 ${selectedFile?.id === file.id ? 'bg-primary/10' : 'hover:bg-gray-100'}`}
                  >
                     <div className="flex items-center flex-grow gap-2 cursor-pointer"  onClick={() => handleFileSelect(file)}>
                        {file.type.startsWith('image/') ? (
                           <ImageIcon className="w-5 h-5 text-blue-500 shrink-0" />
                         ) : file.type === 'application/pdf' ? (
                           <FileText className="w-5 h-5 text-red-500 shrink-0" />
                         ) : (
                            <FileText className="w-5 h-5 text-gray-500 shrink-0" />
                         )}
                        <span className="text-sm font-medium truncate flex-grow">{file.name}</span>
                     </div>
                     {isAnalysable && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            onClick={() => handleAnalyzeFile(file)}
                            disabled={isAnalyzingThis || isAnotherAnalyzing}
                            aria-label="Analyse file for concepts"
                        >
                            {isAnalyzingThis ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                            )}
                        </Button>
                     )}
                  </li>
                )})}
              </ul>
            </ScrollArea>
             <div className="mt-auto text-sm text-gray-700 border-t p-4">
               <h4 className="font-semibold mb-2">프로젝트 세부 정보</h4>
               <p><strong>유형:</strong> {currentProject.projectType}</p>
               <p><strong>지역:</strong> {currentProject.areaType}</p>
               <p><strong>연면적:</strong> {currentProject.totalFloorArea} m²</p>
               <div className="mt-2">
                 <h5 className="font-semibold">디자인 컨셉:</h5>
                 {currentProject.designConcepts && currentProject.designConcepts.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {currentProject.designConcepts.map(c => <span key={c} className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">{c}</span>)}
                    </div>
                 ) : <p className="text-xs text-gray-500 mt-1">아직 분석된 컨셉이 없습니다.</p>}
               </div>
             </div>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center p-4 overflow-hidden bg-gray-50">
             {renderFileContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerModal;
