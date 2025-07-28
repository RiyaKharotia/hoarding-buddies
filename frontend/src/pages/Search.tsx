
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, FileText, Image, User, Calendar, CreditCard, Search as SearchIcon } from 'lucide-react';
import { searchService, SearchResults } from '@/services/searchService';
import { toast } from 'sonner';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResults>({});
  const [isLoading, setIsLoading] = useState(false);

  // Extract query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query') || '';
    setSearchQuery(query);
    
    if (query) {
      performSearch(query);
    }
  }, [location.search]);

  // Perform search
  const performSearch = async (query: string, type?: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await searchService.search(query, type);
      
      if (response.success) {
        setSearchResults(response.data);
      } else {
        toast.error("Error fetching search results");
        // Fallback to mock data
        setSearchResults(searchService.getMockData(type));
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching. Showing fallback results.");
      setSearchResults(searchService.getMockData(type));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    performSearch(searchQuery, activeTab !== 'all' ? activeTab : undefined);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    performSearch(searchQuery, value !== 'all' ? value : undefined);
  };

  // Navigate to result detail page
  const navigateToDetail = (type: string, id: string) => {
    let path = '';
    
    switch (type) {
      case 'hoarding':
        path = user?.role === 'owner' ? `/hoardings/${id}` : `/client/hoardings/${id}`;
        break;
      case 'contract':
        path = user?.role === 'owner' ? `/contracts/${id}` : `/client/contracts/${id}`;
        break;
      case 'photo':
        path = user?.role === 'owner' ? `/photos/${id}` : `/client/photos/${id}`;
        break;
      case 'user':
        path = user?.role === 'owner' ? `/users/${id}` : `/profile`;
        break;
      case 'assignment':
        path = user?.role === 'owner' ? `/assignments/${id}` : `/photographer/assignments/${id}`;
        break;
      case 'billing':
        path = user?.role === 'owner' ? `/billings/${id}` : `/client/billing/${id}`;
        break;
      default:
        return;
    }
    
    navigate(path);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find hoardings, contracts, and more</p>
      </div>
      
      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="flex space-x-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Tabs and Results */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="hoardings">Hoardings</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          {user?.role === 'owner' && (
            <>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="billings">Billings</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {/* Hoardings Section */}
          {searchResults.hoardings && searchResults.hoardings.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Hoardings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.hoardings.map((hoarding) => (
                  <Card 
                    key={hoarding._id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigateToDetail('hoarding', hoarding._id)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={hoarding.images[0] || "https://source.unsplash.com/random/800x600?billboard"} 
                        alt={hoarding.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{hoarding.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {hoarding.location.city}, {hoarding.location.state}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">
                          {hoarding.size.width}x{hoarding.size.height} {hoarding.size.unit}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          hoarding.status === 'active' ? 'bg-green-100 text-green-800' : 
                          hoarding.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {hoarding.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Contracts Section */}
          {searchResults.contracts && searchResults.contracts.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Contracts</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.contracts.map((contract) => (
                  <Card 
                    key={contract._id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigateToDetail('contract', contract._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Contract #{contract._id.slice(0, 8)}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          contract.status === 'active' ? 'bg-green-100 text-green-800' : 
                          contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Client:</span> {contract.client?.name || 'Unknown Client'}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Hoarding:</span> {contract.hoarding?.name || 'Unknown Hoarding'}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                        </span>
                        <span className="font-medium">₹{contract.amount.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Photos Section */}
          {searchResults.photos && searchResults.photos.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Photos</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.photos.map((photo) => (
                  <div 
                    key={photo._id} 
                    className="aspect-square relative cursor-pointer overflow-hidden rounded-md"
                    onClick={() => navigateToDetail('photo', photo._id)}
                  >
                    <img 
                      src={photo.url || "https://source.unsplash.com/random/300x300?billboard"} 
                      alt={photo.description || 'Hoarding photo'} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                      <p className="text-xs text-white truncate">{photo.hoarding?.name || 'Unknown location'}</p>
                      <p className="text-[10px] text-gray-300">{new Date(photo.takenAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No Results Message */}
          {(!searchResults.hoardings || searchResults.hoardings.length === 0) && 
          (!searchResults.contracts || searchResults.contracts.length === 0) && 
          (!searchResults.photos || searchResults.photos.length === 0) && !isLoading && searchQuery && (
            <Card>
              <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No results found</h3>
                <p className="text-muted-foreground">
                  We couldn't find anything matching "{searchQuery}"
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Individual Tab Contents */}
        <TabsContent value="hoardings">
          {searchResults.hoardings && searchResults.hoardings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.hoardings.map((hoarding) => (
                <Card 
                  key={hoarding._id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigateToDetail('hoarding', hoarding._id)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={hoarding.images[0] || "https://source.unsplash.com/random/800x600?billboard"} 
                      alt={hoarding.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{hoarding.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {hoarding.location.city}, {hoarding.location.state}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">
                        {hoarding.size.width}x{hoarding.size.height} {hoarding.size.unit}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        hoarding.status === 'active' ? 'bg-green-100 text-green-800' : 
                        hoarding.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {hoarding.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No hoardings found</h3>
                <p className="text-muted-foreground">
                  Try different search terms or browse all hoardings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Similar TabsContent blocks for other tabs (contracts, photos, etc.) */}
        
      </Tabs>
    </div>
  );
};

export default Search;
