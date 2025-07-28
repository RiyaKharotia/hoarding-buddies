
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Camera, Clock, MapPin, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { Assignment, photographerService } from '@/services/photographerService';
import { toast } from "@/components/ui/use-toast";
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import { API_BASE_URL } from "@/utils/constants";

const getImageUrl = (relativePath: string) => {
  if (!relativePath) return '';
  
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  const path = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  return `${API_BASE_URL}/${path}`;
};

const PhotographerAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [counts, setCounts] = useState({
    urgent: 0,
    upcoming: 0,
    completed: 0
  });
  
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const status = activeTab !== 'all' ? activeTab : undefined;
        const response = await photographerService.getAssignments(undefined, status);
        
        if (response.success && response.data) {
          const assignmentData = Array.isArray(response.data) 
            ? response.data 
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
          
          setAssignments(typedAssignments);
          
          // Calculate counts
          const urgentCount = typedAssignments.filter(a => isUrgent(a.dueDate)).length;
          const upcomingCount = typedAssignments.filter(a => a.status === 'assigned' || a.status === 'in_progress').length;
          const completedCount = typedAssignments.filter(a => a.status === 'completed').length;
          
          setCounts({
            urgent: urgentCount,
            upcoming: upcomingCount,
            completed: completedCount
          });
        } else {
          toast.error("Failed to load assignments", {
            description: response.message || "Please try again later"
          });
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
        toast.error("Failed to load assignments", {
          description: "Please try again later"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [activeTab]);
  
  const handleUpdateStatus = async (assignmentId: string, newStatus: string) => {
    try {
      const response = await photographerService.updateAssignmentStatus(assignmentId, newStatus);
      
      if (response.success) {
        setAssignments(prevAssignments => 
          prevAssignments.map(assignment => 
            assignment._id === assignmentId 
              ? { ...assignment, status: newStatus as Assignment['status'] } 
              : assignment
          )
        );
        
        toast.success("Status updated", {
          description: `Assignment marked as ${newStatus.replace('_', ' ')}`
        });
        
        // Update counts after status change
        if (newStatus === 'completed') {
          setCounts(prev => ({
            ...prev,
            upcoming: prev.upcoming > 0 ? prev.upcoming - 1 : 0,
            completed: prev.completed + 1
          }));
        } else if (newStatus === 'in_progress' && activeTab === 'assigned') {
          // If we're on the assigned tab and marking as in_progress, we need to refetch
          const response = await photographerService.getAssignments(undefined, activeTab);
          if (response.success && response.data) {
            setAssignments(response.data as Assignment[]);
          }
        }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatDueDate = (dueDateString: string) => {
    try {
      const dueDate = parseISO(dueDateString);
      
      if (isToday(dueDate)) {
        return `Today, ${format(dueDate, 'h:mm a')}`;
      } else if (isTomorrow(dueDate)) {
        return `Tomorrow, ${format(dueDate, 'h:mm a')}`;
      } else {
        return format(dueDate, 'MMMM d, h:mm a');
      }
    } catch (error) {
      return dueDateString;
    }
  };
  
  const isUrgent = (dueDateString: string) => {
    try {
      const dueDate = parseISO(dueDateString);
      const now = new Date();
      const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      return diffHours <= 24 && !isPast(dueDate);
    } catch {
      return false;
    }
  };

  const filteredAssignments = assignments.filter(assignment => 
    assignment.hoarding.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (assignment.hoarding.location.address && 
     assignment.hoarding.location.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (assignment.hoarding.location.city && 
     assignment.hoarding.location.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">My Assignments</h1>
        <p className="text-muted-foreground">
          View and manage your hoarding photography assignments
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Urgent Assignments</CardTitle>
            <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.urgent}</div>
            <p className="text-xs text-muted-foreground mt-1">Due within 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.upcoming}</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned or in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed assignments</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search assignments..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-muted h-48"></div>
                  <div className="p-6 flex-1 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-10 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <Card key={assignment._id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-muted relative">
                    <img 
                      src={
                        assignment.hoarding.images && assignment.hoarding.images.length > 0
                          ? getImageUrl(assignment.hoarding.images[0])
                          : `https://source.unsplash.com/random/400x300?billboard&sig=${assignment._id}`
                      }
                      alt={assignment.hoarding.name}
                      className="w-full h-full object-cover md:h-60"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={getStatusColor(
                          isUrgent(assignment.dueDate) && assignment.status !== 'completed' 
                            ? 'urgent' 
                            : assignment.status
                        )}
                      >
                        {isUrgent(assignment.dueDate) && assignment.status !== 'completed'
                          ? 'Urgent'
                          : assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{assignment.hoarding.name}</h3>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs ${
                          isUrgent(assignment.dueDate) ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <Clock className="mr-1 h-3 w-3" />
                          Due: {formatDueDate(assignment.dueDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {assignment.hoarding.location.address}, {assignment.hoarding.location.city}
                      </div>
                      {assignment.notes && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                          <span className="font-medium">Notes:</span> {assignment.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {assignment.status !== 'completed' && (
                        <Button onClick={() => navigate(`/photographer/upload?assignment=${assignment._id}`)}>
                          <Camera className="mr-2 h-4 w-4" />
                          Capture Photos
                        </Button>
                      )}
                      
                      {assignment.status === 'assigned' && (
                        <Button 
                          variant="outline"
                          onClick={() => handleUpdateStatus(assignment._id, 'in_progress')}
                        >
                          Mark In Progress
                        </Button>
                      )}
                      
                      {assignment.status === 'in_progress' && (
                        <Button 
                          variant="outline"
                          onClick={() => handleUpdateStatus(assignment._id, 'completed')}
                        >
                          Mark Completed
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/photographer/assignment-details/${assignment._id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center p-12 text-center">
              <div className="space-y-3">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">No assignments found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "No assignments match your search criteria." 
                    : "You don't have any assignments yet."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
        
        {['assigned', 'in_progress', 'completed'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-6">
            {loading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-muted h-48"></div>
                    <div className="p-6 flex-1 space-y-4">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-10 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredAssignments.filter(a => a.status === status).length > 0 ? (
              filteredAssignments
                .filter(a => a.status === status)
                .map((assignment) => (
                  <Card key={assignment._id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 bg-muted relative">
                        <img 
                          src={
                            assignment.hoarding.images && assignment.hoarding.images.length > 0
                              ? getImageUrl(assignment.hoarding.images[0])
                              : `https://source.unsplash.com/random/400x300?billboard&sig=${assignment._id}`
                          }
                          alt={assignment.hoarding.name}
                          className="w-full h-full object-cover md:h-60"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{assignment.hoarding.name}</h3>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className={`flex items-center px-2 py-1 rounded-full text-xs ${
                              isUrgent(assignment.dueDate) ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              <Clock className="mr-1 h-3 w-3" />
                              Due: {formatDueDate(assignment.dueDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {assignment.hoarding.location.address}, {assignment.hoarding.location.city}
                          </div>
                          {assignment.notes && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                              <span className="font-medium">Notes:</span> {assignment.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {status !== 'completed' && (
                            <Button onClick={() => navigate(`/photographer/upload?assignment=${assignment._id}`)}>
                              <Camera className="mr-2 h-4 w-4" />
                              Capture Photos
                            </Button>
                          )}
                          
                          {status === 'assigned' && (
                            <Button 
                              variant="outline"
                              onClick={() => handleUpdateStatus(assignment._id, 'in_progress')}
                            >
                              Mark In Progress
                            </Button>
                          )}
                          
                          {status === 'in_progress' && (
                            <Button 
                              variant="outline"
                              onClick={() => handleUpdateStatus(assignment._id, 'completed')}
                            >
                              Mark Completed
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/photographer/assignment-details/${assignment._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
            ) : (
              <div className="flex items-center justify-center p-12 text-center">
                <div className="space-y-3">
                  <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">No {status.replace('_', ' ')} assignments</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No assignments match your search criteria." 
                      : `You don't have any ${status.replace('_', ' ')} assignments.`}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PhotographerAssignments;
