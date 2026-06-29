import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Spinner } from '../ui/Spinner';
import { useToast } from '../ui/Toast';

interface ImageUploadProps {
  onUploadComplete: (file: File, previewUrl: string) => void;
  onClear: () => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete, onClear, className }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('Please upload a valid image file', 'error');
      return;
    }
    setIsProcessing(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setIsProcessing(false);
      onUploadComplete(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border-2 border-dashed transition-colors p-6 flex flex-col items-center justify-center min-h-[200px] text-center cursor-pointer overflow-hidden",
        isDragging ? "border-cta bg-cta/10" : "border-primary hover:bg-primary/20 bg-secondary/50",
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !preview && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />

      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
          <Spinner className="w-8 h-8 text-cta mb-2" />
          <p className="text-sm text-text font-body">Processing image...</p>
        </div>
      )}

      {preview ? (
        <div className="relative w-full h-full min-h-[200px]">
          <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-red-500/20 text-red-500 rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 right-2 bg-green-500 text-background px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Ready
          </div>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8 text-cta" />
          </div>
          <h3 className="font-heading font-bold text-lg mb-1 text-text">Upload Issue Photo</h3>
          <p className="text-sm text-text/60 font-body mb-4">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-text/40 font-body">
            Supports JPG, PNG (Max 10MB)
          </p>
        </>
      )}
    </div>
  );
};
