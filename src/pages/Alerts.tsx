/**
 * Alerts page for HomeFinder AI SaaS
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getAlerts, type Alert as AlertType } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Bell, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';

const AlertsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [totalNewListings, setTotalNewListings] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
    }
  }, [isAuthenticated]);

  const fetchAlerts = async () => {
    if (refreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('[Alerts] Fetching alerts');
      const response = await getAlerts();
      setAlerts(response.alerts);
      setTotalNewListings(response.totalNewListings);
      console.log('[Alerts] Alerts fetched:', {
        totalAlerts: response.totalAlerts,
        totalNewListings: response.totalNewListings,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch alerts';
      console.error('[Alerts] Error:', errorMessage);
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
    fetchAlerts();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>Please log in to view alerts.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">Alerts & Notifications</h1>
              <p className="text-sm text-muted-foreground">
                New property listings for your clients
              </p>
            </div>
            
            <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No new alerts at this time.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You'll be notified when new properties match your clients' search criteria.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>
                    {alerts.length} client{alerts.length !== 1 ? 's' : ''} with new listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold">{totalNewListings}</p>
                      <p className="text-sm text-muted-foreground">Total New Listings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts List */}
              {alerts.map((alert) => (
                <Card key={alert.clientId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-primary" />
                          {alert.clientName}
                        </CardTitle>
                        <CardDescription>
                          {new Date(alert.timestamp).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="text-lg">
                        {alert.totalNew} new
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {alert.newListings.map((listing) => (
                        <div key={listing.id} className="relative">
                          <ListingCard property={listing as any} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => window.open(listing.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AlertsPage;

