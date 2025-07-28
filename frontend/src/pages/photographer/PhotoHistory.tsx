import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Download, Filter, Image, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { photoService, Photo } from '@/services/photoService';
import { toast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { getImageUrl } from '@/utils/imageUtils';

const PhotoHistory: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        
        const filters: Record<string, any> = {};
        
        if (statusFilter !== 'all') {
          filters.status = statusFilter;
        }
        
        const response = await photoService.getAllPhotos(filters);
        
        if (response.success && response.data) {
          const photoData = Array.isArray(response.data) 
            ? response.data 
            : [];
          
          setPhotos(photoData);
        }
      } catch (error) {
        console.error("Failed to fetch photos:", error);
        toast("Failed to load photos", {
          description: "Please try again later"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotos();
  }, [activeTab, statusFilter]);
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getHoardingName = (photo: Photo) => {
    if (typeof photo.hoarding === 'object') {
      return photo.hoarding.name;
    }
    return "Unknown Hoarding";
  };
  
  const getLocationString = (photo: Photo) => {
    if (typeof photo.hoarding === 'object') {
      return `${photo.hoarding.location.address}, ${photo.hoarding.location.city}`;
    }
    return "Unknown Location";
  };
  
  const filteredPhotos = photos.filter(photo => {
    if (searchQuery) {
      const hoardingName = typeof photo.hoarding === 'object' ? photo.hoarding.name.toLowerCase() : '';
      const location = typeof photo.hoarding === 'object' 
        ? `${photo.hoarding.location.address} ${photo.hoarding.location.city}`.toLowerCase() 
        : '';
      
      if (!hoardingName.includes(searchQuery.toLowerCase()) && 
          !location.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    if (activeTab !== 'all') {
      return photo.status === activeTab;
    }
    
    return true;
  });
  
  const pendingCount = photos.filter(p => p.status === 'pending').length;
  const approvedCount = photos.filter(p => p.status === 'approved').length;
  const rejectedCount = photos.filter(p => p.status === 'rejected').length;
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    } else {
      return `${(kb / 1024).toFixed(1)} MB`;
    }
  };
  
  const formatDimension = (width?: number, height?: number) => {
    if (!width || !height) return 'Unknown';
    return `${width} × ${height}`;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Photo History</h1>
        <p className="text-muted-foreground">
          View and manage your uploaded hoarding photos
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center">
              <Image className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Photos awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approved Photos</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <Image className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Photos accepted by owner</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rejected Photos</CardTitle>
            <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
              <Image className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Photos needing retakes</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by hoarding name or location..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Photos</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderPhotoGrid(filteredPhotos, loading, getStatusColor, formatDate, getHoardingName, getLocationString, formatFileSize, formatDimension)}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          {renderPhotoGrid(
            filteredPhotos.filter(p => p.status === 'pending'),
            loading, 
            getStatusColor, 
            formatDate,
            getHoardingName,
            getLocationString,
            formatFileSize,
            formatDimension
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          {renderPhotoGrid(
            filteredPhotos.filter(p => p.status === 'approved'),
            loading, 
            getStatusColor, 
            formatDate,
            getHoardingName,
            getLocationString,
            formatFileSize,
            formatDimension
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          {renderPhotoGrid(
            filteredPhotos.filter(p => p.status === 'rejected'),
            loading, 
            getStatusColor, 
            formatDate,
            getHoardingName,
            getLocationString,
            formatFileSize,
            formatDimension
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const renderPhotoGrid = (
  photos: Photo[], 
  loading: boolean,
  getStatusColor: (status: string) => string,
  formatDate: (date: string) => string,
  getHoardingName: (photo: Photo) => string,
  getLocationString: (photo: Photo) => string,
  formatFileSize: (bytes?: number) => string,
  formatDimension: (width?: number, height?: number) => string
) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted"></div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div className="space-y-3">
          <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium">No photos found</h3>
          <p className="text-muted-foreground">
            No photos match your current filters.
          </p>
          <Button onClick={() => window.location.href = '/photographer/upload'}>
            Upload New Photos
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <Card key={photo._id} className="overflow-hidden">
          <div className="aspect-video bg-muted relative">
            <img 
              src={getImageUrl(photo.filePath)} 
              alt={typeof photo.hoarding === 'object' ? photo.hoarding.name : 'Hoarding photo'}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium select-none whitespace-nowrap 
              shadow-sm border border-white/10 backdrop-blur-sm
              flex items-center
              pointer-events-none
            ">
              <span className={`w-2 h-2 rounded-full mr-1 ${
                photo.status === 'approved' 
                  ? 'bg-green-500' 
                  : photo.status === 'rejected' 
                  ? 'bg-red-500' 
                  : 'bg-amber-500'
              }`}></span>
              <span className="capitalize">{photo.status}</span>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium text-base mb-1">{getHoardingName(photo)}</h3>
            <p className="text-sm text-muted-foreground mb-3">{getLocationString(photo)}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Date:</span> {formatDate(photo.createdAt)}
              </div>
              <div>
                <span className="font-medium">Resolution:</span> {formatDimension(photo.metadata?.width, photo.metadata?.height)}
              </div>
              <div>
                <span className="font-medium">File Size:</span> {formatFileSize(photo.metadata?.size)}
              </div>
              <div>
                <span className="font-medium">Format:</span> {photo.metadata?.format?.toUpperCase() || 'Unknown'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PhotoHistory;
