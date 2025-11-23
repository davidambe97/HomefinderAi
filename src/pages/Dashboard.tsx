/**
 * Dashboard page for HomeFinder AI SaaS
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getDashboard, type DashboardResponse, type DashboardResult } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  const fetchDashboard = async () => {
    if (refreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('[Dashboard] Fetching dashboard data');
      const data = await getDashboard();
      setDashboard(data);
      console.log('[Dashboard] Dashboard fetched:', {
        totalClients: data.totalClients,
        totalListings: data.totalListings,
      });
      
      if (data.results.length > 0 && !selectedClient) {
        setSelectedClient(data.results[0].clientId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard';
      console.error('[Dashboard] Error:', errorMessage);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>Please log in to access the dashboard.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedClientData = dashboard?.results.find(r => r.clientId === selectedClient);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name || 'Agent'}! View property listings for all your clients.
              </p>
            </div>
            
            <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] w-full" />
                ))}
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !dashboard || dashboard.totalClients === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No clients found.</p>
                  <p className="text-sm text-muted-foreground">Add clients to start viewing property listings.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Clients</CardDescription>
                    <CardTitle className="text-3xl">{dashboard.totalClients}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Listings</CardDescription>
                    <CardTitle className="text-3xl">{dashboard.totalListings}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Active Searches</CardDescription>
                    <CardTitle className="text-3xl">
                      {dashboard.results.filter(r => r.totalListings > 0).length}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Client Tabs */}
              <Tabs value={selectedClient || undefined} onValueChange={setSelectedClient}>
                <TabsList className="grid w-full grid-cols-auto">
                  {dashboard.results.map((result) => (
                    <TabsTrigger key={result.clientId} value={result.clientId}>
                      {result.clientName}
                      <Badge variant="secondary" className="ml-2">
                        {result.totalListings}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {dashboard.results.map((result) => (
                  <TabsContent key={result.clientId} value={result.clientId} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{result.clientName}</CardTitle>
                            <CardDescription>{result.clientEmail}</CardDescription>
                          </div>
                          <Badge variant={result.error ? 'destructive' : 'default'}>
                            {result.error ? 'Error' : `${result.totalListings} listings`}
                          </Badge>
                        </div>
                      </CardHeader>
                      {result.error && (
                        <CardContent>
                          <Alert variant="destructive">
                            <AlertDescription>{result.error}</AlertDescription>
                          </Alert>
                        </CardContent>
                      )}
                    </Card>

                    {result.totalListings === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No listings found for this client.</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {result.listings.map((listing) => (
                          <ListingCard key={listing.id} property={listing as any} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;

