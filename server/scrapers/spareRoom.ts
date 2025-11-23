/**
 * SpareRoom scraper implementation
 */

import { PropertyListing, SearchQuery } from '../types.js';
import { fetchViaScraperApi } from '../utils/scraperApi.js';
import { SITE_URLS } from '../config.js';

/**
 * Map property type from query to SpareRoom format
 * Note: SpareRoom is primarily for room rentals, not full properties
 */
function mapPropertyType(propertyType?: string): string {
  if (!propertyType || propertyType === 'any') return '';
  
  const mapping: Record<string, string> = {
    'room': 'room',
    'studio': 'studio',
    'flat': 'flat',
    'apartment': 'flat',
    'house': 'house',
  };
  
  return mapping[propertyType.toLowerCase()] || '';
}

/**
 * Construct SpareRoom search URL from query parameters
 */
function buildSearchUrl(query: SearchQuery): string {
  const baseUrl = `${SITE_URLS.spareroom}/flatshare`;
  const params = new URLSearchParams();
  
  // Location
  if (query.location) {
    params.append('search', query.location);
  }
  
  // Price range (SpareRoom uses weekly prices)
  if (query.minPrice) {
    // Convert monthly to weekly if needed (approximate)
    const weeklyMin = Math.floor(query.minPrice / 4.33);
    params.append('min_rent', weeklyMin.toString());
  }
  if (query.maxPrice) {
    const weeklyMax = Math.ceil(query.maxPrice / 4.33);
    params.append('max_rent', weeklyMax.toString());
  }
  
  // Property type (SpareRoom focuses on rooms)
  const propertyTypes = mapPropertyType(query.propertyType);
  if (propertyTypes) {
    params.append('property_type', propertyTypes);
  }
  
  // Bedrooms (for shared properties, this might be total bedrooms)
  if (query.bedrooms) {
    params.append('bedrooms', query.bedrooms.toString());
  }
  
  // Sorting (newest first)
  params.append('sort_by', 'date');
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Extract price from text (e.g., "£250 pw" -> 250 * 4.33 = monthly equivalent)
 */
function extractPrice(priceText: string, isWeekly: boolean = true): number {
  const cleaned = priceText.replace(/[£,\s]/g, '');
  const match = cleaned.match(/(\d+)/);
  if (!match) return 0;
  
  const amount = parseInt(match[1], 10);
  // Convert weekly to monthly if needed
  return isWeekly ? Math.round(amount * 4.33) : amount;
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
  // Try to extract ID from URL (e.g., /room/123456)
  const urlMatch = url.match(/\/(\d+)(?:\.html)?$/);
  if (urlMatch) {
    return `spareroom-${urlMatch[1]}`;
  }
  
  // Fallback: generate ID from title and URL
  const hash = url.split('/').pop() || title;
  return `spareroom-${hash.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

/**
 * Parse property listings from SpareRoom HTML
 */
function parseListings(html: string, baseUrl: string): PropertyListing[] {
  const listings: PropertyListing[] = [];
  
  try {
    // SpareRoom may embed JSON data in script tags
    const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/s) ||
                     html.match(/window\.__SPAREROOM__\s*=\s*({.+?});/s);
    
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        // Parse properties from JSON if available
        if (data?.listings || data?.results || data?.rooms) {
          const properties = data.listings || data.results || data.rooms || [];
          for (const prop of properties) {
            listings.push(parsePropertyFromJson(prop, baseUrl));
          }
        }
      } catch (e) {
        console.log('[SpareRoom] Could not parse JSON data, falling back to HTML parsing');
      }
    }
    
    // If JSON parsing didn't work, parse HTML
    if (listings.length === 0) {
      // SpareRoom property cards are typically in divs with class containing "listing" or "room"
      const propertyCardRegex = /<div[^>]*class="[^"]*listing[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
      let match;
      
      while ((match = propertyCardRegex.exec(html)) !== null && listings.length < 100) {
        const cardHtml = match[1];
        const listing = parsePropertyCard(cardHtml, baseUrl);
        if (listing) {
          listings.push(listing);
        }
      }
      
      // Alternative: Look for property/room links
      if (listings.length === 0) {
        const linkRegex = /<a[^>]*href="(\/room\/\d+[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
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
    console.error('[SpareRoom] Error parsing listings:', error);
  }
  
  return listings;
}

/**
 * Parse property from JSON data
 */
function parsePropertyFromJson(prop: any, baseUrl: string): PropertyListing {
  const url = prop.url || prop.roomUrl || prop.listingUrl || prop.slug || '';
  const fullUrl = url.startsWith('http') ? url : baseUrl + (url.startsWith('/') ? url : '/' + url);
  
  // SpareRoom prices are typically weekly, convert to monthly
  const priceText = prop.price || prop.rent || prop.priceText || '0';
  const price = typeof priceText === 'number' 
    ? Math.round(priceText * 4.33) 
    : extractPrice(priceText, true);
  
  return {
    id: extractPropertyId(fullUrl, prop.title || prop.heading || ''),
    title: prop.title || prop.heading || prop.name || 'Room Available',
    price,
    location: prop.address || prop.location || prop.displayAddress || '',
    city: prop.city || prop.town || (prop.address ? prop.address.split(',')[0] : ''),
    state: prop.county || prop.region || '',
    bedrooms: prop.bedrooms || prop.bedroomCount || extractBedrooms(prop.bedroomsText || ''),
    bathrooms: prop.bathrooms || prop.bathroomCount,
    propertyType: prop.propertyType || prop.type || 'Room',
    images: prop.images || prop.imageUrls || [prop.imageUrl].filter(Boolean) || [],
    description: prop.summary || prop.description,
    source: 'SpareRoom',
    url: fullUrl,
  };
}

/**
 * Parse property card from HTML
 */
function parsePropertyCard(cardHtml: string, baseUrlOrUrl: string): PropertyListing | null {
  try {
    // Extract URL
    const urlMatch = cardHtml.match(/href="([^"]*\/room\/\d+[^"]*)"[^>]*>/i) ||
                     cardHtml.match(/href="([^"]*listing[^"]*)"[^>]*>/i);
    if (!urlMatch) return null;
    
    const relativeUrl = urlMatch[1];
    const fullUrl = relativeUrl.startsWith('http') 
      ? relativeUrl 
      : (baseUrlOrUrl.includes('room/') ? baseUrlOrUrl : SITE_URLS.spareroom + relativeUrl);
    
    // Extract title
    const titleMatch = cardHtml.match(/<h2[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h2>/i) ||
                      cardHtml.match(/<h3[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h3>/i) ||
                      cardHtml.match(/<a[^>]*class="[^"]*listing[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Room Available';
    
    // Extract price (SpareRoom shows weekly prices)
    const priceMatch = cardHtml.match(/<div[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                      cardHtml.match(/£([\d,]+)\s*(?:pw|per week)/i) ||
                      cardHtml.match(/£([\d,]+)/i);
    const priceText = priceMatch ? priceMatch[1] : '0';
    const price = extractPrice(priceText, true); // Convert weekly to monthly
    
    // Extract location/address
    const locationMatch = cardHtml.match(/<address[^>]*>([^<]+)<\/address>/i) ||
                         cardHtml.match(/<div[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                         cardHtml.match(/<p[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/p>/i);
    const location = locationMatch ? locationMatch[1].trim() : '';
    
    // Extract bedrooms
    const bedroomsMatch = cardHtml.match(/(\d+)\s*bed/i) ||
                         cardHtml.match(/<span[^>]*class="[^"]*bedrooms[^"]*"[^>]*>(\d+)</i);
    const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : undefined;
    
    // SpareRoom is primarily for rooms, so default property type
    const propertyType = 'Room';
    
    // Extract images
    const images: string[] = [];
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(cardHtml)) !== null && images.length < 5) {
      const imgUrl = imgMatch[1];
      if (imgUrl && !imgUrl.includes('placeholder') && !imgUrl.includes('logo')) {
        const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : SITE_URLS.spareroom + imgUrl;
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
      source: 'SpareRoom',
      url: fullUrl,
    };
  } catch (error) {
    console.error('[SpareRoom] Error parsing property card:', error);
    return null;
  }
}

/**
 * Scrape property listings from SpareRoom
 * @param query - Search query parameters
 * @returns Array of property listings
 */
export async function scrape(query: SearchQuery): Promise<PropertyListing[]> {
  try {
    // Validate required query parameters
    if (!query.location) {
      console.warn('[SpareRoom] No location provided in query');
      return [];
    }
    
    // Build search URL
    const searchUrl = buildSearchUrl(query);
    console.log('[SpareRoom] Fetching:', searchUrl);
    
    // Fetch HTML via ScraperAPI
    const html = await fetchViaScraperApi(searchUrl);
    
    console.log(`[SpareRoom] Fetched ${html.length} bytes of HTML`);
    
    // Parse listings from HTML
    const listings = parseListings(html, SITE_URLS.spareroom);
    
    console.log(`[SpareRoom] ✅ Successfully found ${listings.length} properties`);
    
    // Log sample of results for debugging
    if (listings.length > 0) {
      console.log('[SpareRoom] Sample listing:', {
        id: listings[0].id,
        title: listings[0].title,
        price: listings[0].price,
        location: listings[0].location,
        source: listings[0].source,
      });
    } else {
      console.warn('[SpareRoom] ⚠️  No properties found - HTML may need different parsing');
    }
    
    return listings;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SpareRoom] Scraper error:', errorMessage);
    
    // Return empty array on error
    return [];
  }
}
