import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Clock, Image, Map, Upload, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { photographerService, Assignment } from '@/services/photographerService';
import { photoService, Photo } from '@/services/photoService';
import { toast } from "@/components/ui/use-toast";
import { format, parseISO, isAfter, addDays, formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from '@/utils/imageUtils';

interface DashboardStats {
  assignedHoardings: number;
  locations: number;
  photosUploaded: number;
  thisMonth: number;
  pendingUploads: number;
  dueSoon: number;
  imageQualityScore: number;
  lastFiftyUploads: number;
}

const PhotographerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    assignedHoardings: 0,
    locations: 0,
    photosUploaded: 0,
    thisMonth: 0,
    pendingUploads: 0,
    dueSoon: 0,
    imageQualityScore: 0,
    lastFiftyUploads: 0
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const statsResponse = await photographerService.getDashboardStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
        
        const assignmentsResponse = await photographerService.getAssignments();
        if (assignmentsResponse.success && assignmentsResponse.data) {
          const assignmentData = Array.isArray(assignmentsResponse.data) 
            ? assignmentsResponse.data 
            : [];
            
          const typedAssignments = assignmentData.map(assignment => {
            const status = ['assigned', 'in_progress', 'completed', 'cancelled'].includes(assignment.status)
              ? assignment.status as Assignment['status']
              : 'assigned';
              
            return {
              ...assignment,
              status
            } as Assignment;
          });
          
          setAssignments(typedAssignments.slice(0, 4));
        }
        
        const photosResponse = await photoService.getAllPhotos({ limit: 6 });
        if (photosResponse.success && photosResponse.data) {
          const photoData = Array.isArray(photosResponse.data) 
            ? photosResponse.data 
            : [];
          setRecentPhotos(photoData.slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data", {
          description: "Please try again later"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Photographer Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your hoarding photography assignments and uploads
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Assigned Hoardings</CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedHoardings}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {stats.locations} locations</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Photos Uploaded</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <Image className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.photosUploaded}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.thisMonth} this month</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Uploads</CardTitle>
            <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center">
              <Upload className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingUploads}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.dueSoon} due soon</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Image Quality Score</CardTitle>
            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.imageQualityScore}/5</div>
            <p className="text-xs text-muted-foreground mt-1">Based on last {stats.lastFiftyUploads} uploads</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Assigned Hoardings</span>
              <Button size="sm" onClick={() => navigate('/photographer/assignments')}>View All</Button>
            </CardTitle>
            <CardDescription>Hoardings assigned to you for photography</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-muted/50 rounded-md p-3 h-24 animate-pulse"></div>
                ))}
              </div>
            ) : assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="bg-muted/50 rounded-md p-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{assignment.hoarding.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {assignment.hoarding.location.address}, {assignment.hoarding.location.city}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDate(assignment.dueDate)}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/photographer/upload?assignment=${assignment._id}`)}>
                      <Camera className="mr-1 h-4 w-4" />
                      Capture
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No assignments found</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Recent Uploads</span>
              <Button size="sm" onClick={() => navigate('/photographer/history')}>View All</Button>
            </CardTitle>
            <CardDescription>Your recently uploaded photos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square rounded-md bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : recentPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {recentPhotos.map((photo) => (
                  <div key={photo._id} className="aspect-square rounded-md bg-muted overflow-hidden relative">
                    <img 
                      src={getImageUrl(photo.filePath)} 
                      alt="Hoarding" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                      <p className="text-[10px] text-white truncate">
                        {typeof photo.hoarding === 'object' ? photo.hoarding.name : 'Hoarding'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No photos uploaded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-brand-blue/10 border-brand-blue">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-semibold text-lg">Quick Upload</h3>
            <p className="text-sm text-muted-foreground">
              Capture and upload photos directly to your assignments
            </p>
          </div>
          <Button onClick={() => navigate('/photographer/upload')}>
            <Camera className="mr-2 h-5 w-5" />
            Capture Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotographerDashboard;
