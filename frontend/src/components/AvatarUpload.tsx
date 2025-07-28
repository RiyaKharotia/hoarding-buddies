
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';

interface AvatarUploadProps {
  onFileChange: (file: File | null) => void;
  initialImage?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onFileChange, initialImage }) => {
  const [preview, setPreview] = useState<string | undefined>(initialImage);
  const [dragActive, setDragActive] = useState(false);
  
  const handleFile = (file: File | null) => {
    if (file) {
      onFileChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onFileChange(null);
      setPreview(undefined);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const removeImage = () => {
    handleFile(null);
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {preview ? (
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={preview} alt="Preview" />
            <AvatarFallback>Avatar</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center w-full h-32 ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
        </div>
      )}
      
      <div className="flex justify-center">
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-center"
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            Select Image
          </Button>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default AvatarUpload;
