
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Menu, X, MapPin, FileText, Image, User, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchService } from '@/services/searchService';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Role-specific greeting
  const getRoleGreeting = () => {
    switch (user?.role) {
      case 'owner':
        return "Admin Dashboard";
      case 'photographer':
        return "Photographer Portal";
      case 'client':
        return "Client Dashboard";
      default:
        return "Dashboard";
    }
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    if (e.target.value.length >= 2) {
      handleSearch();
    } else {
      setSearchResults(null);
    }
  };

  // Handle search submission
  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    
    setIsSearching(true);
    try {
      const response = await searchService.search(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching. Showing fallback results.");
      // Fallback to mock data
      setSearchResults(searchService.getMockData());
    } finally {
      setIsSearching(false);
    }
  };

  // Handle click outside search results to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigate to search results page
  const navigateToSearchResults = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(null);
    }
  };

  // Navigate to a specific result
  const navigateToResult = (type: string, id: string) => {
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
      default:
        return;
    }
    
    navigate(path);
    setSearchResults(null);
  };

  return (
    <header className="bg-background border-b border-border z-10">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Page title and greeting */}
        <div className="flex-1 flex flex-col ml-2 md:ml-0">
          <h1 className="text-lg font-semibold">{getRoleGreeting()}</h1>
          <p className="text-xs text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        
        {/* Search input */}
        <div className="relative md:w-80 mx-4" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyUp={(e) => e.key === 'Enter' && navigateToSearchResults()}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {searchResults && (
            <Card className="absolute mt-1 w-full z-50 max-h-[400px] overflow-y-auto">
              <CardContent className="p-2">
                {isSearching ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    {/* Hoardings Results */}
                    {searchResults.hoardings && searchResults.hoardings.length > 0 && (
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold flex items-center mb-1 px-2">
                          <MapPin className="h-3 w-3 mr-1" /> Hoardings
                        </h3>
                        {searchResults.hoardings.slice(0, 3).map((hoarding: any) => (
                          <div 
                            key={hoarding._id} 
                            className="p-2 hover:bg-accent rounded-md text-sm cursor-pointer"
                            onClick={() => navigateToResult('hoarding', hoarding._id)}
                          >
                            <div className="font-medium">{hoarding.name}</div>
                            <div className="text-xs text-muted-foreground">{hoarding.location.city}, {hoarding.size.width}x{hoarding.size.height} {hoarding.size.unit}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Contracts Results */}
                    {searchResults.contracts && searchResults.contracts.length > 0 && (
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold flex items-center mb-1 px-2">
                          <FileText className="h-3 w-3 mr-1" /> Contracts
                        </h3>
                        {searchResults.contracts.slice(0, 3).map((contract: any) => (
                          <div 
                            key={contract._id} 
                            className="p-2 hover:bg-accent rounded-md text-sm cursor-pointer"
                            onClick={() => navigateToResult('contract', contract._id)}
                          >
                            <div className="font-medium">Contract #{contract._id.slice(0, 8)}</div>
                            <div className="text-xs text-muted-foreground">
                              {contract.client?.name || 'Unknown Client'} - {contract.hoarding?.name || 'Unknown Hoarding'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Photos Results */}
                    {searchResults.photos && searchResults.photos.length > 0 && (
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold flex items-center mb-1 px-2">
                          <Image className="h-3 w-3 mr-1" /> Photos
                        </h3>
                        {searchResults.photos.slice(0, 3).map((photo: any) => (
                          <div 
                            key={photo._id} 
                            className="p-2 hover:bg-accent rounded-md text-sm cursor-pointer"
                            onClick={() => navigateToResult('photo', photo._id)}
                          >
                            <div className="font-medium truncate">{photo.description || 'Photo'}</div>
                            <div className="text-xs text-muted-foreground">
                              {photo.hoarding?.name || 'Unknown Hoarding'} - {new Date(photo.takenAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No Results */}
                    {(!searchResults.hoardings || searchResults.hoardings.length === 0) &&
                    (!searchResults.contracts || searchResults.contracts.length === 0) &&
                    (!searchResults.photos || searchResults.photos.length === 0) && (
                      <div className="p-3 text-center text-muted-foreground text-sm">
                        No results found
                      </div>
                    )}
                    
                    {/* See All Results */}
                    {(searchResults.hoardings?.length > 0 || 
                      searchResults.contracts?.length > 0 || 
                      searchResults.photos?.length > 0) && (
                      <Button 
                        variant="secondary" 
                        className="w-full text-xs mt-1"
                        onClick={navigateToSearchResults}
                      >
                        See all results
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
