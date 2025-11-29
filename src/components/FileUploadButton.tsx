
"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
  buttonText?: string;
  className?: string;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
  acceptedFileTypes = ".jpg, .jpeg, .png, .pdf",
  buttonText = "파일 업로드",
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      event.target.value = '';
    }
  };

  return (
    <>
      <Button onClick={handleButtonClick} variant="outline" className={className}>
        <UploadCloud className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
        aria-label="파일 업로드"
      />
    </>
  );
};

export default FileUploadButton;

    