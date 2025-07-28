
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Camera, Clock, Image, MapPin, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { photographerService, Assignment, Photo } from '@/services/photographerService';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/utils/constants';

const AssignmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch assignment details
        const assignmentResponse = await photographerService.getAssignments(id);
        
        if (assignmentResponse.success && assignmentResponse.data) {
          const assignmentData = Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0
            ? assignmentResponse.data[0]
            : null;
          
          if (assignmentData) {
            // Ensure status is one of the allowed values
            const status = ['assigned', 'in_progress', 'completed', 'cancelled'].includes(assignmentData.status)
              ? assignmentData.status as Assignment['status']
              : 'assigned';
              
            const typedAssignment: Assignment = {
              ...assignmentData,
              status
            };
            
            setAssignment(typedAssignment);
            
            // Fetch photos for this assignment
            const photosResponse = await photographerService.getPhotosByAssignment(id);
            if (photosResponse.success && photosResponse.data) {
              const photoData = Array.isArray(photosResponse.data) 
                ? photosResponse.data 
                : [];
              
              setPhotos(photoData);
            }
          } else {
            toast.error("Assignment not found", {
              description: "The requested assignment could not be found"
            });
            navigate('/photographer/assignments');
          }
        } else {
          toast.error("Failed to load assignment", {
            description: assignmentResponse.message || "Please try again later"
          });
          navigate('/photographer/assignments');
        }
      } catch (error) {
        console.error("Error fetching assignment data:", error);
        toast.error("Failed to load assignment", {
          description: "Please try again later"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignmentData();
  }, [id, navigate]);
  
  const handleUpdateStatus = async (newStatus: string) => {
    if (!assignment || !id) return;
    
    try {
      const response = await photographerService.updateAssignmentStatus(id, newStatus);
      
      if (response.success) {
        // Update the local state
        setAssignment({
          ...assignment,
          status: newStatus as Assignment['status']
        });
        
        toast.success("Status updated", {
          description: `Assignment marked as ${newStatus.replace('_', ' ')}`
        });
      } else {
        toast.error("Failed to update status", {
          description: response.message || "Please try again later"
        });
      }
    } catch (error) {
      console.error("Failed to update assignment status:", error);
      toast.error("Failed to update status", {
        description: "Please try again later"
      });
    }
  };
  
  const formatDate = (dateString: string, includeTime: boolean = true) => {
    try {
      const date = parseISO(dateString);
      return format(date, includeTime ? 'MMMM d, yyyy h:mm a' : 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const getImageUrl = (relativePath: string) => {
    if (!relativePath) return '';
    
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    const path = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return `${API_BASE_URL}/${path}`;
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!assignment) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div className="space-y-3">
          <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium">Assignment not found</h3>
          <p className="text-muted-foreground">
            The requested assignment could not be found.
          </p>
          <Button onClick={() => navigate('/photographer/assignments')}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assignment Details</h1>
          <p className="text-muted-foreground">
            View and manage your assignment for {assignment.hoarding.name}
          </p>
        </div>
        <Button onClick={() => navigate('/photographer/assignments')}>
          Back to Assignments
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{assignment.hoarding.name}</CardTitle>
              <Badge className={getStatusColor(assignment.status)}>
                {getStatusText(assignment.status)}
              </Badge>
            </div>
            <CardDescription>
              {assignment.hoarding.location.address}, {assignment.hoarding.location.city}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Due Date</div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(assignment.dueDate)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Assignment Created</div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {formatDate(assignment.createdAt)}
                </div>
              </div>
            </div>
            
            {assignment.notes && (
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm font-medium mb-2">Notes</div>
                <p className="text-muted-foreground">{assignment.notes}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              {assignment.status !== 'completed' && (
                <Button onClick={() => navigate(`/photographer/upload?assignment=${assignment._id}`)}>
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photos
                </Button>
              )}
              
              {assignment.status === 'assigned' && (
                <Button 
                  variant="outline"
                  onClick={() => handleUpdateStatus('in_progress')}
                >
                  Mark In Progress
                </Button>
              )}
              
              {assignment.status === 'in_progress' && (
                <Button 
                  variant="outline"
                  onClick={() => handleUpdateStatus('completed')}
                >
                  Mark Completed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Assignment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Assigned By</div>
              <div className="flex items-center text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                {assignment.assignedBy ? assignment.assignedBy.name : 'Owner'}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">Location</div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {assignment.hoarding.location.address}
              </div>
              <div className="text-muted-foreground ml-6">
                {assignment.hoarding.location.city}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">Photos Uploaded</div>
              <div className="flex items-center text-muted-foreground">
                <Image className="mr-2 h-4 w-4" />
                {photos.length} photos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Assignment Photos</span>
            <Button 
              size="sm" 
              disabled={assignment.status === 'completed'}
              onClick={() => navigate(`/photographer/upload?assignment=${assignment._id}`)}
            >
              <Camera className="mr-2 h-4 w-4" />
              Upload More
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo._id} className="group relative">
                  <div className="aspect-square bg-muted rounded-md overflow-hidden">
                    <img 
                      src={getImageUrl(photo.filePath)} 
                      alt="Hoarding" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 transition-opacity opacity-0 group-hover:opacity-100">
                    <p className="text-xs text-white">
                      {formatDate(photo.createdAt, false)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className={`w-2 h-2 rounded-full mr-1 ${
                        photo.status === 'approved' 
                          ? 'bg-green-500' 
                          : photo.status === 'rejected' 
                          ? 'bg-red-500' 
                          : 'bg-amber-500'
                      }`}></span>
                      <span className="text-[10px] text-white">
                        {photo.status.charAt(0).toUpperCase() + photo.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Image className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium mt-2">No photos uploaded yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload photos for this assignment to complete your task
              </p>
              <Button 
                onClick={() => navigate(`/photographer/upload?assignment=${assignment._id}`)}
                disabled={assignment.status === 'completed'}
              >
                <Camera className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDetails;
