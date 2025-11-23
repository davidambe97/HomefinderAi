import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Property } from '@/lib/api/mock';

interface ListingCardProps {
  property: Property;
}

const ListingCard = ({ property }: ListingCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg" style={{ boxShadow: 'var(--card-shadow)' }}>
      <Link to={`/property/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images?.[0] || '/placeholder.svg'}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div className="absolute right-3 top-3">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-background/90 backdrop-blur hover:bg-background"
              onClick={(e) => {
                e.preventDefault();
                // Handle favorite
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur">
              {property.source}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/property/${property.id}`}>
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-xl font-bold text-foreground">{formatPrice(property.price)}</h3>
          </div>

          <h4 className="mb-2 font-semibold text-foreground line-clamp-1">{property.title}</h4>

          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {property.location}{property.city ? `, ${property.city}` : ''}{property.state ? `, ${property.state}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} bd</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} ba</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>{property.area.toLocaleString()} sqft</span>
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
