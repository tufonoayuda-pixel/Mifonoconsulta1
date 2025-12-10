"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

interface Attachment {
  name: string;
  url: string; // For display/download, could be a blob URL or actual URL
  type: string; // MIME type
}

interface FileUploadProps {
  onFilesChange: (files: Attachment[]) => void;
  initialFiles?: Attachment[];
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  initialFiles = [],
  disabled = false,
}) => {
  const [files, setFiles] = useState<Attachment[]>(initialFiles);

  React.useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAttachments: Attachment[] = acceptedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file), // Create a temporary URL for preview
      type: file.type,
    }));
    const updatedFiles = [...files, ...newAttachments];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    showSuccess(`${acceptedFiles.length} archivo(s) añadido(s).`);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    disabled,
  });

  const handleRemoveFile = (fileToRemove: Attachment) => {
    const updatedFiles = files.filter((file) => file.name !== fileToRemove.name);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    URL.revokeObjectURL(fileToRemove.url); // Clean up the object URL
    showSuccess(`Archivo "${fileToRemove.name}" eliminado.`);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
          disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
        )}
      >
        <Input {...getInputProps()} disabled={disabled} />
        <UploadCloud className="h-8 w-8 text-gray-500 mb-2" />
        {isDragActive ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Suelta los archivos aquí...</p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Arrastra y suelta archivos aquí, o haz clic para seleccionar
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          (PDF, DOC, DOCX - máximo 5MB por archivo)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Archivos Adjuntos:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                <FileText className="h-4 w-4" />
                {file.name}
              </a>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFile(file)}
                  className="h-6 w-6 text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Eliminar archivo</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;