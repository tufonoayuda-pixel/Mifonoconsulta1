"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  initialImageUrl?: string | null;
  disabled?: boolean;
  label?: string;
  description?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageChange,
  initialImageUrl,
  disabled = false,
  label = "Arrastra y suelta una imagen aquí, o haz clic para seleccionar",
  description = "(JPG, PNG, GIF - máximo 5MB)",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Only update previewUrl from initialImageUrl if no file is currently selected
    if (initialImageUrl && !selectedFile) {
      setPreviewUrl(initialImageUrl);
    } else if (!initialImageUrl && !selectedFile) {
      setPreviewUrl(null);
    }
  }, [initialImageUrl, selectedFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      onImageChange(file);
      showSuccess(`Imagen "${file.name}" seleccionada.`);
    }
  }, [onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    disabled,
  });

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    onImageChange(null);
    showSuccess("Imagen eliminada.");
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
          <p className="text-sm text-gray-600 dark:text-gray-400">Suelta la imagen aquí...</p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {label}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </div>

      {previewUrl && (
        <div className="relative w-full h-48 rounded-md overflow-hidden border">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          {!disabled && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
              title="Eliminar imagen"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Eliminar imagen</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;