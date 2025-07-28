
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Search, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { photoService, Photo } from "@/services/photoService";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/imageUtils";

interface PhotoItem {
  id: string;
  url: string;
  hoarding: string;
  location: string;
  capturedAt: Date;
  photographer: string;
}

const ClientPhotos: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHoarding, setSelectedHoarding] = useState<string | undefined>(undefined);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoardings, setHoardings] = useState<string[]>([]);
  
  useEffect(() => {
    fetchPhotos();
  }, []);
  
  const generateMockPhotos = (): PhotoItem[] => {
    const mockPhotos: PhotoItem[] = [];
    
    for (let i = 1; i <= 20; i++) {
      // Generate a random date within the last 30 days
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - randomDaysAgo);
      
      const hoarding = i % 3 === 0 ? "MG Road Billboard" : i % 3 === 1 ? "Indiranagar Display" : "Koramangala Unipole";
      const location = i % 3 === 0 ? "MG Road, Bangalore" : i % 3 === 1 ? "Indiranagar, Bangalore" : "Koramangala, Bangalore";
      
      mockPhotos.push({
        id: `photo-${i}`,
        url: `https://source.unsplash.com/random/800x600?billboard&sig=${i + 20}`,
        hoarding,
        location,
        capturedAt: date,
        photographer: "John Doe"
      });
    }
    
    return mockPhotos;
  };
  
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getAllPhotos();
      
      if (response.success && response.data) {
        const photoData = Array.isArray(response.data) ? response.data : [response.data];
        
        // Extract unique hoarding names for the filter
        const uniqueHoardings = new Set(photoData.map(photo => 
          typeof photo.hoarding === 'object' ? photo.hoarding.name : 'Unknown Hoarding'
        ));
        setHoardings(Array.from(uniqueHoardings));
        
        // Transform API data to PhotoItem format
        const transformedData: PhotoItem[] = photoData.map(photo => ({
          id: photo._id,
          url: getImageUrl(photo.filePath),
          hoarding: typeof photo.hoarding === 'object' ? photo.hoarding.name : 'Unknown Hoarding',
          location: typeof photo.hoarding === 'object' ? 
            `${photo.hoarding.location?.address || ''}, ${photo.hoarding.location?.city || ''}` : 
            'Unknown Location',
          capturedAt: new Date(photo.takenAt || photo.createdAt),
          photographer: typeof photo.uploadedBy === 'object' ? photo.uploadedBy.name : 'Unknown Photographer'
        }));
        
        setPhotos(transformedData);
      } else {
        console.info("No photos data from API, using mock data");
        // Generate mock data as fallback
        const mockPhotos = generateMockPhotos();
        setPhotos(mockPhotos);
        
        // Extract unique hoarding names for the filter
        const uniqueHoardings = new Set(mockPhotos.map(photo => photo.hoarding));
        setHoardings(Array.from(uniqueHoardings));
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      toast("Failed to load photos data", {
        description: "Please try again later"
      });
      
      // Fallback to mock data on error
      const mockPhotos = generateMockPhotos();
      setPhotos(mockPhotos);
      
      // Extract unique hoarding names for the filter
      const uniqueHoardings = new Set(mockPhotos.map(photo => photo.hoarding));
      setHoardings(Array.from(uniqueHoardings));
    } finally {
      setLoading(false);
    }
  };
  
  const filteredPhotos = photos.filter(photo => {
    // Filter by hoarding
    if (selectedHoarding && photo.hoarding !== selectedHoarding) {
      return false;
    }
    
    // Filter by date
    if (date && format(date, 'yyyy-MM-dd') !== format(photo.capturedAt, 'yyyy-MM-dd')) {
      return false;
    }
    
    return true;
  });
  
  const groupedByDate = filteredPhotos.reduce<Record<string, PhotoItem[]>>((acc, photo) => {
    const dateKey = format(photo.capturedAt, 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    acc[dateKey].push(photo);
    return acc;
  }, {});
  
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
  const handleDownload = (photoId: string, photoUrl: string) => {
    // Create an anchor element and set properties
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `photo-${photoId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Photo downloaded successfully");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Advertisement Photos</h2>
        <p className="text-muted-foreground">
          View and download photos of your advertisements
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>
            Browse photos of your advertisement campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
            <div className="flex flex-wrap gap-2">
              <Select value={selectedHoarding} onValueChange={setSelectedHoarding}>
                <SelectTrigger className="w-[200px]">
                  <span className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {selectedHoarding || "All Hoardings"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hoardings</SelectItem>
                  {hoardings.map(hoarding => (
                    <SelectItem key={hoarding} value={hoarding}>{hoarding}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal w-[200px]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Filter by date"}
                    {date && (
                      <span 
                        className="ml-auto cursor-pointer text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDate(undefined);
                        }}
                      >
                        ×
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="ghost" 
                size="icon"
                className={cn(viewMode === "grid" ? "bg-accent" : "")}
                onClick={() => setViewMode("grid")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className={cn(viewMode === "list" ? "bg-accent" : "")}
                onClick={() => setViewMode("list")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedHoarding(undefined);
                setDate(undefined);
              }}
            >
              Clear Filters
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
            {selectedHoarding && ` for ${selectedHoarding}`}
            {date && ` on ${format(date, 'PP')}`}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-square rounded-md bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="aspect-square rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity relative group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img 
                    src={photo.url} 
                    alt={`Advertisement at ${photo.location}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="text-white text-xs line-clamp-1">{photo.hoarding}</div>
                    <div className="text-gray-200 text-xs">{format(photo.capturedAt, 'PPP')}</div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(photo.id, photo.url);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDates.map((dateString) => {
                const photosForDate = groupedByDate[dateString];
                return (
                  <div key={dateString} className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(new Date(dateString), 'PPPP')}
                      <span className="text-muted-foreground ml-2">
                        ({photosForDate.length} photo{photosForDate.length !== 1 ? 's' : ''})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {photosForDate.map((photo) => (
                        <div 
                          key={photo.id}
                          className="flex border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <div className="w-24 h-24 bg-muted">
                            <img
                              src={photo.url}
                              alt={`Advertisement at ${photo.location}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3 flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="font-medium line-clamp-1">{photo.hoarding}</h4>
                              <p className="text-xs text-muted-foreground">{photo.location}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                By {photo.photographer}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(photo.id, photo.url);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {filteredPhotos.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No photos found</h3>
              <p className="text-muted-foreground">
                No photos match your current filters. Try adjusting your filters or check back later.
              </p>
            </div>
          )}
          
          <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
            <DialogContent className="max-w-2xl">
              {selectedPhoto && (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedPhoto.hoarding} - {format(selectedPhoto.capturedAt, 'PPP')}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="mt-4">
                    <div className="rounded-lg overflow-hidden bg-muted">
                      <img
                        src={selectedPhoto.url}
                        alt={`Advertisement at ${selectedPhoto.location}`}
                        className="w-full h-auto"
                      />
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Hoarding</p>
                        <p className="font-medium">{selectedPhoto.hoarding}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{selectedPhoto.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Captured On</p>
                        <p className="font-medium">{format(selectedPhoto.capturedAt, 'PPP')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Photographer</p>
                        <p className="font-medium">{selectedPhoto.photographer}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => handleDownload(selectedPhoto.id, selectedPhoto.url)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download High Resolution
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPhotos;
