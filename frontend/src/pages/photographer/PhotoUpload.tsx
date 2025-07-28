import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, Upload, MapPin, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { photoService } from '@/services/photoService';
import { hoardingService } from '@/services/hoardingService';
import { useNavigate } from 'react-router-dom';

interface FileWithPreview extends File {
  preview: string;
  id: string;
}

interface Hoarding {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
}

const PhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedHoarding, setSelectedHoarding] = useState<string>('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [hoardings, setHoardings] = useState<Hoarding[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchHoardings = async () => {
      try {
        setLoading(true);
        const response = await hoardingService.getAllHoardings();
        if (response.success && response.data) {
          setHoardings(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching hoardings:', error);
        toast.error('Failed to load hoardings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHoardings();
  }, []);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2),
      })
    );
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} ${newFiles.length === 1 ? 'photo' : 'photos'} added`);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxSize: 5242880 // 5MB
  });
  
  const removeFile = (id: string) => {
    setFiles(files => {
      const fileToRemove = files.find(file => file.id === id);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return files.filter(file => file.id !== id);
    });
    toast.success("Photo removed");
  };
  
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setIsGettingLocation(false);
          toast.success("Location captured successfully");
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          toast.error("Failed to capture location. Please try again.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this device");
      setIsGettingLocation(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHoarding) {
      toast.error("Please select a hoarding");
      return;
    }
    
    if (files.length === 0) {
      toast.error("Please upload at least one photo");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('hoarding', selectedHoarding);
        formData.append('caption', comments);
        
        if (location) {
          formData.append('latitude', location.lat.toString());
          formData.append('longitude', location.lng.toString());
        }
        
        const response = await photoService.uploadPhoto(formData);
        
        if (!response.success) {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      toast.success("Photos uploaded successfully");
      
      files.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
      
      setSelectedHoarding('');
      setFiles([]);
      setComments('');
      setLocation(null);
      
      navigate('/photographer/history');
      
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error("Failed to upload photos. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Photos</h2>
        <p className="text-muted-foreground">
          Capture and upload advertisement photos for client hoardings
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Select Hoarding</CardTitle>
            <CardDescription>Choose the hoarding for which you are uploading photos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="hoarding">Hoarding</Label>
              <Select value={selectedHoarding} onValueChange={setSelectedHoarding}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hoarding" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading hoardings...</SelectItem>
                  ) : hoardings.length > 0 ? (
                    hoardings.map((hoarding) => (
                      <SelectItem key={hoarding._id} value={hoarding._id}>
                        {hoarding.name} ({hoarding.location.city})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No hoardings available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>2. Capture Location</CardTitle>
            <CardDescription>Verify you're at the correct hoarding location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button 
                type="button" 
                variant="outline" 
                onClick={getCurrentLocation} 
                disabled={isGettingLocation}
                className="w-full sm:w-auto"
              >
                {isGettingLocation ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Capture Current Location
                  </>
                )}
              </Button>
              
              {location && (
                <div className="text-sm flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                  <span>
                    Location captured: 
                    <span className="font-mono text-xs ml-1">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>3. Upload Photos</CardTitle>
            <CardDescription>Upload multiple photos of the advertisement</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer flex flex-col items-center justify-center bg-muted/30
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-muted">
                  {isDragActive ? (
                    <Upload className="h-8 w-8 text-primary" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold">
                    {isDragActive ? 'Drop the files here' : 'Drag photos here or click to browse'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 10 photos (max 5MB each)
                  </p>
                </div>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4 space-y-4">
                <h3 className="text-sm font-semibold">Uploaded Photos ({files.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden bg-muted">
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                          onLoad={() => { URL.revokeObjectURL(file.preview) }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <p className="text-xs truncate mt-1">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>4. Additional Comments</CardTitle>
            <CardDescription>Add any notes about the hoarding or advertisement</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g. Hoarding in good condition, advertisement fully visible"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-3">
          <Button type="reset" variant="outline" onClick={() => {
            setSelectedHoarding('');
            setFiles([]);
            setComments('');
            setLocation(null);
            toast.info("Form cleared");
          }}>
            Clear Form
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || files.length === 0 || !selectedHoarding}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PhotoUpload;
