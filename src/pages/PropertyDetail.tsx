import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Calendar, Home as HomeIcon, Heart, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getPropertyById, type Property } from '@/lib/api/mock';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <Skeleton className="mb-6 h-10 w-32" />
            <Skeleton className="mb-6 aspect-[16/9] w-full" />
            <Skeleton className="mb-4 h-12 w-3/4" />
            <Skeleton className="mb-8 h-6 w-1/2" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Property Not Found</h1>
            <Link to="/results">
              <Button>Back to Results</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Link to="/results">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Button>
          </Link>

          {/* Image Gallery */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <img
                src={property.images[0]}
                alt={property.title}
                className="aspect-[16/9] w-full rounded-lg object-cover"
              />
            </div>
            {property.images.slice(1).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title} - Image ${index + 2}`}
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold md:text-4xl">{property.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>
                        {property.location}, {property.city}, {property.state}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {property.source}
                  </Badge>
                </div>

                <div className="mb-6 text-4xl font-bold text-primary">{formatPrice(property.price)}</div>

                <div className="flex flex-wrap gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    <span className="font-medium">{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5" />
                    <span className="font-medium">{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="h-5 w-5" />
                    <span className="font-medium">{property.area.toLocaleString()} sqft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HomeIcon className="h-5 w-5" />
                    <span className="font-medium">{property.propertyType}</span>
                  </div>
                </div>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{property.description}</p>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {property.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Year Built</p>
                      <p className="font-medium">{property.yearBuilt}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lot Size</p>
                      <p className="font-medium">
                        {property.lotSize > 0 ? `${property.lotSize.toLocaleString()} sqft` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-medium">{property.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Listed Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {new Date(property.listingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="mb-2 text-sm text-muted-foreground">Listed by</p>
                    <p className="text-lg font-semibold">{property.source}</p>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      Contact Agent
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Heart className="h-4 w-4" />
                      Save Property
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>

                  <div className="mt-6 rounded-lg bg-muted p-4">
                    <p className="mb-2 text-sm font-medium">Interested in this property?</p>
                    <p className="text-xs text-muted-foreground">
                      Schedule a tour or request more information from the listing agent.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
