import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchStore } from '@/store/searchStore';
import { searchProperties, type PropertyListing } from '@/lib/api/api';

const Results = () => {
  const { filters } = useSearchStore();
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      // Don't search if no location is provided
      if (!filters.location || filters.location.trim() === '') {
        setLoading(false);
        setProperties([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('[Results] Fetching search results with filters:', filters);
        const response = await searchProperties({
          location: filters.location,
          propertyType: filters.propertyType !== 'any' ? filters.propertyType : undefined,
          minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
          maxPrice: filters.maxPrice < 10000000 ? filters.maxPrice : undefined,
          bedrooms: filters.bedrooms > 0 ? filters.bedrooms : undefined,
          bathrooms: filters.bathrooms > 0 ? filters.bathrooms : undefined,
        });
        
        console.log('[Results] Search results received:', {
          totalFound: response.totalFound,
          listingsCount: response.listings.length,
        });
        
        setProperties(response.listings);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch results';
        console.error('[Results] Error fetching results:', errorMessage);
        setError(errorMessage);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [filters]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">
                {loading ? 'Searching...' : `${properties.length} Properties Found`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filters.location && `in ${filters.location}`}
              </p>
            </div>

            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Error loading results</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold">No properties found</h2>
                <p className="text-muted-foreground">
                  {filters.location 
                    ? 'Try adjusting your search filters to see more results'
                    : 'Please enter a location to search for properties'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <ListingCard key={property.id} property={property as any} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
