/**
 * Shared TypeScript types for the HomeFinder AI backend
 */

export interface PropertyListing {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  propertyType: string;
  images: string[];
  description?: string;
  features?: string[];
  yearBuilt?: number;
  lotSize?: number;
  source: string;
  listingDate?: string;
  url: string;
}

export interface SearchQuery {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  [key: string]: any;
}

export interface ScraperResult {
  success: boolean;
  listings: PropertyListing[];
  error?: string;
  source: string;
}

