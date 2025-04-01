
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, File, FileImage, FileVideo, FileAudio, FileArchive, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // This would be a blob URL for preview or the actual uploaded URL
  file: File;
}

interface FileUploadProps {
  onFileSelect: (files: FileInfo[]) => void;
  selectedFiles: FileInfo[];
  onRemoveFile: (fileId: string) => void;
  multiple?: boolean;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in bytes
  buttonVariant?: "default" | "outline" | "ghost";
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFiles,
  onRemoveFile,
  multiple = true,
  acceptedFileTypes = "*",
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  buttonVariant = "outline"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    const newFiles: FileInfo[] = [];
    const filesArray = Array.from(files);
    
    filesArray.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} exceeds the maximum file size of ${maxFileSize / (1024 * 1024)}MB`);
        return;
      }
      
      const fileUrl = URL.createObjectURL(file);
      newFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        file
      });
    });
    
    // In a real implementation, you would upload the files to a server here
    setTimeout(() => {
      onFileSelect(newFiles);
      setIsUploading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 500);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <FileImage className="h-4 w-4" />;
    if (fileType.startsWith("video/")) return <FileVideo className="h-4 w-4" />;
    if (fileType.startsWith("audio/")) return <FileAudio className="h-4 w-4" />;
    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar") || fileType.includes("7z")) 
      return <FileArchive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
        multiple={multiple}
        accept={acceptedFileTypes}
      />
      
      <Button 
        type="button" 
        variant={buttonVariant} 
        size="icon"
        onClick={triggerFileSelect}
        disabled={isUploading}
        title="Attach file"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
      </Button>
      
      {selectedFiles.length > 0 && (
        <div className="mt-2 space-y-2">
          {selectedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md text-xs">
              {getFileIcon(file.type)}
              <div className="flex-1 truncate">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-muted-foreground">{formatFileSize(file.size)}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onRemoveFile(file.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
