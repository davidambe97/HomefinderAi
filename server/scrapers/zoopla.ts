/**
 * Zoopla scraper implementation
 */

import { PropertyListing, SearchQuery } from '../types.js';
import { fetchHtml } from '../utils/http.js';
import { SITE_URLS } from '../config.js';

/**
 * Map property type from query to Zoopla format
 */
function mapPropertyType(propertyType?: string): string {
  if (!propertyType || propertyType === 'any') return '';
  
  const mapping: Record<string, string> = {
    'house': 'houses',
    'flat': 'flats',
    'apartment': 'flats',
    'condo': 'flats',
    'detached': 'detached',
    'semi-detached': 'semi-detached',
    'terraced': 'terraced',
    'bungalow': 'bungalows',
    'land': 'land',
  };
  
  return mapping[propertyType.toLowerCase()] || '';
}

/**
 * Construct Zoopla search URL from query parameters
 */
function buildSearchUrl(query: SearchQuery): string {
  const baseUrl = `${SITE_URLS.zoopla}/for-sale/property`;
  const params = new URLSearchParams();
  
  // Location
  if (query.location) {
    params.append('q', query.location);
  }
  
  // Price range
  if (query.minPrice) {
    params.append('price_min', query.minPrice.toString());
  }
  if (query.maxPrice) {
    params.append('price_max', query.maxPrice.toString());
  }
  
  // Property type
  const propertyTypes = mapPropertyType(query.propertyType);
  if (propertyTypes) {
    params.append('property_type', propertyTypes);
  }
  
  // Bedrooms
  if (query.bedrooms) {
    params.append('beds_min', query.bedrooms.toString());
  }
  
  // Sorting (newest first)
  params.append('sort', 'newest_listings');
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Extract price from text (e.g., "£250,000" -> 250000)
 */
function extractPrice(priceText: string): number {
  const cleaned = priceText.replace(/[£,\s]/g, '');
  const match = cleaned.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract bedrooms from text (e.g., "3 bed" -> 3)
 */
function extractBedrooms(bedText: string): number | undefined {
  const match = bedText.match(/(\d+)\s*bed/i);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Extract property ID from URL or generate from title
 */
function extractPropertyId(url: string, title: string): string {
  // Try to extract ID from URL (e.g., /for-sale/details/12345678)
  const urlMatch = url.match(/\/(\d+)\.html/) || url.match(/\/details\/(\d+)/);
  if (urlMatch) {
    return `zoopla-${urlMatch[1]}`;
  }
  
  // Fallback: generate ID from title and URL
  const hash = url.split('/').pop() || title;
  return `zoopla-${hash.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

/**
 * Parse property listings from Zoopla HTML
 */
function parseListings(html: string, baseUrl: string): PropertyListing[] {
  const listings: PropertyListing[] = [];
  
  try {
    // Zoopla often embeds JSON data in script tags
    const jsonMatch = html.match(/window\.__ZOOPLA__\s*=\s*({.+?});/s) ||
                     html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/s);
    
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        // Parse properties from JSON if available
        if (data?.listings || data?.results) {
          const properties = data.listings || data.results || [];
          for (const prop of properties) {
            listings.push(parsePropertyFromJson(prop, baseUrl));
          }
        }
      } catch (e) {
        console.log('[Zoopla] Could not parse JSON data, falling back to HTML parsing');
      }
    }
    
    // If JSON parsing didn't work, parse HTML
    if (listings.length === 0) {
      // Zoopla property cards are typically in articles or divs with class containing "listing"
      const propertyCardRegex = /<article[^>]*class="[^"]*listing[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
      let match;
      
      while ((match = propertyCardRegex.exec(html)) !== null && listings.length < 100) {
        const cardHtml = match[1];
        const listing = parsePropertyCard(cardHtml, baseUrl);
        if (listing) {
          listings.push(listing);
        }
      }
      
      // Alternative: Look for property links
      if (listings.length === 0) {
        const linkRegex = /<a[^>]*href="(\/for-sale\/details\/\d+[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        let linkMatch;
        const seenUrls = new Set<string>();
        
        while ((linkMatch = linkRegex.exec(html)) !== null && listings.length < 50) {
          const url = linkMatch[1];
          if (seenUrls.has(url)) continue;
          seenUrls.add(url);
          
          const cardHtml = linkMatch[2];
          const listing = parsePropertyCard(cardHtml, baseUrl + url);
          if (listing) {
            listings.push(listing);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('[Zoopla] Error parsing listings:', error);
  }
  
  return listings;
}

/**
 * Parse property from JSON data
 */
function parsePropertyFromJson(prop: any, baseUrl: string): PropertyListing {
  const url = prop.url || prop.listingUrl || prop.detailsUrl || '';
  const fullUrl = url.startsWith('http') ? url : baseUrl + url;
  
  return {
    id: extractPropertyId(fullUrl, prop.title || prop.heading || ''),
    title: prop.title || prop.heading || prop.displayAddress || 'Property',
    price: prop.price || prop.priceAmount || extractPrice(prop.priceText || '0'),
    location: prop.displayAddress || prop.address || prop.location || '',
    city: prop.city || prop.town || (prop.address ? prop.address.split(',')[0] : ''),
    state: prop.county || prop.region || '',
    bedrooms: prop.bedrooms || prop.bedroomCount || extractBedrooms(prop.bedroomsText || ''),
    bathrooms: prop.bathrooms || prop.bathroomCount,
    propertyType: prop.propertyType || prop.propertySubType || 'Unknown',
    images: prop.images || prop.imageUrls || [prop.imageUrl].filter(Boolean) || [],
    description: prop.summary || prop.description,
    source: 'Zoopla',
    url: fullUrl,
  };
}

/**
 * Parse property card from HTML
 */
function parsePropertyCard(cardHtml: string, baseUrlOrUrl: string): PropertyListing | null {
  try {
    // Extract URL
    const urlMatch = cardHtml.match(/href="([^"]*\/for-sale\/details\/\d+[^"]*)"[^>]*>/i) ||
                     cardHtml.match(/href="([^"]*property[^"]*)"[^>]*>/i);
    if (!urlMatch) return null;
    
    const relativeUrl = urlMatch[1];
    const fullUrl = relativeUrl.startsWith('http') 
      ? relativeUrl 
      : (baseUrlOrUrl.includes('for-sale/details/') ? baseUrlOrUrl : SITE_URLS.zoopla + relativeUrl);
    
    // Extract title
    const titleMatch = cardHtml.match(/<h2[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h2>/i) ||
                      cardHtml.match(/<a[^>]*class="[^"]*listing[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i) ||
                      cardHtml.match(/data-testid="listing-title"[^>]*>([^<]+)</i);
    const title = titleMatch ? titleMatch[1].trim() : 'Property';
    
    // Extract price
    const priceMatch = cardHtml.match(/<p[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/p>/i) ||
                      cardHtml.match(/£([\d,]+)/i) ||
                      cardHtml.match(/data-testid="listing-price"[^>]*>([^<]+)</i);
    const priceText = priceMatch ? priceMatch[1] : '0';
    const price = extractPrice(priceText);
    
    // Extract location/address
    const locationMatch = cardHtml.match(/<address[^>]*>([^<]+)<\/address>/i) ||
                         cardHtml.match(/<p[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/p>/i) ||
                         cardHtml.match(/data-testid="listing-address"[^>]*>([^<]+)</i);
    const location = locationMatch ? locationMatch[1].trim() : '';
    
    // Extract bedrooms
    const bedroomsMatch = cardHtml.match(/(\d+)\s*bed/i) ||
                         cardHtml.match(/data-testid="listing-beds"[^>]*>(\d+)</i);
    const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : undefined;
    
    // Extract property type
    const typeMatch = cardHtml.match(/<span[^>]*class="[^"]*propertyType[^"]*"[^>]*>([^<]+)<\/span>/i);
    const propertyType = typeMatch ? typeMatch[1].trim() : 'Unknown';
    
    // Extract images
    const images: string[] = [];
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(cardHtml)) !== null && images.length < 5) {
      const imgUrl = imgMatch[1];
      if (imgUrl && !imgUrl.includes('placeholder') && !imgUrl.includes('logo')) {
        const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : SITE_URLS.zoopla + imgUrl;
        images.push(fullImgUrl);
      }
    }
    
    return {
      id: extractPropertyId(fullUrl, title),
      title,
      price,
      location,
      city: location.split(',')[0] || '',
      bedrooms,
      propertyType,
      images: images.length > 0 ? images : [],
      source: 'Zoopla',
      url: fullUrl,
    };
  } catch (error) {
    console.error('[Zoopla] Error parsing property card:', error);
    return null;
  }
}

/**
 * Scrape property listings from Zoopla
 * @param query - Search query parameters
 * @returns Array of property listings
 */
export async function scrape(query: SearchQuery): Promise<PropertyListing[]> {
  try {
    // Validate required query parameters
    if (!query.location) {
      console.warn('[Zoopla] No location provided in query');
      return [];
    }
    
    // Build search URL
    const searchUrl = buildSearchUrl(query);
    console.log('[Zoopla] Fetching:', searchUrl);
    
    // Fetch HTML with retry logic
    const html = await fetchHtml(searchUrl, {
      timeout: 30000,
      retries: 3,
    });
    
    console.log(`[Zoopla] Fetched ${html.length} bytes of HTML`);
    
    // Parse listings from HTML
    const listings = parseListings(html, SITE_URLS.zoopla);
    
    console.log(`[Zoopla] Found ${listings.length} properties`);
    
    // Log sample of results for debugging
    if (listings.length > 0) {
      console.log('[Zoopla] Sample listing:', {
        id: listings[0].id,
        title: listings[0].title,
        price: listings[0].price,
        location: listings[0].location,
      });
    }
    
    return listings;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Zoopla] Scraper error:', errorMessage);
    
    // Return empty array on error
    return [];
  }
}
