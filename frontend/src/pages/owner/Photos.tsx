
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { photoService, Photo } from "@/services/photoService";
import { getImageUrl } from "@/utils/imageUtils";
import { toast } from "@/components/ui/use-toast";

interface PhotoViewItem {
  id: string;
  url: string;
  hoarding: string;
  location: string;
  capturedAt: Date;
  photographer: string;
}

const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoViewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoardings, setHoardings] = useState<string[]>([]);
  const [selectedHoarding, setSelectedHoarding] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    fetchPhotos();
  }, []);
  
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getAllPhotos();
      
      if (response.success && response.data) {
        // Ensure we always have an array of photos
        const photoData = Array.isArray(response.data) ? response.data : [response.data];
        
        // Extract unique hoarding names for filtering
        const uniqueHoardings = new Set(photoData.map(photo => 
          typeof photo.hoarding === 'object' ? photo.hoarding.name : 'Unknown Hoarding'
        ));
        setHoardings(Array.from(uniqueHoardings));
        
        // Transform API data to PhotoViewItem format
        const transformedData: PhotoViewItem[] = photoData.map(photo => ({
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
        toast("No photos found", {
          description: "We couldn't find any photos in the system"
        });
        setPhotos([]);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      toast("Error fetching photos", {
        description: "There was a problem loading the photos"
      });
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter photos based on selected filters
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
  
  // Group photos by date
  const groupPhotosByDate = () => {
    const grouped: Record<string, PhotoViewItem[]> = {};
    
    filteredPhotos.forEach(photo => {
      const dateKey = format(photo.capturedAt, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(photo);
    });
    
    return grouped;
  };
  
  const groupedPhotos = groupPhotosByDate();
  const dates = Object.keys(groupedPhotos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Advertisement Photos</h2>
        <p className="text-muted-foreground">
          View and manage photos of advertisements
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>
            Browse and manage photos of advertisement campaigns
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
          
          {/* Show photo count */}
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
          ) : filteredPhotos.length > 0 ? (
            <div className="space-y-8">
              {dates.map((dateString) => {
                const photosForDate = groupedPhotos[dateString];
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
                          className="flex border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
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
                            <div className="text-xs text-muted-foreground">
                              Captured by {photo.photographer} on {format(photo.capturedAt, 'PP')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Photos;
