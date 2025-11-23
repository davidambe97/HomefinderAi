/**
 * Rightmove scraper implementation
 */

import { PropertyListing, SearchQuery } from '../types.js';
import { fetchHtml } from '../utils/http.js';
import { SITE_URLS } from '../config.js';

/**
 * Map property type from query to Rightmove format
 */
function mapPropertyType(propertyType?: string): string {
  if (!propertyType || propertyType === 'any') return '';
  
  const mapping: Record<string, string> = {
    'house': 'detached,semi-detached,terraced',
    'flat': 'flat',
    'apartment': 'flat',
    'condo': 'flat',
    'detached': 'detached',
    'semi-detached': 'semi-detached',
    'terraced': 'terraced',
    'bungalow': 'bungalow',
    'land': 'land',
  };
  
  return mapping[propertyType.toLowerCase()] || '';
}

/**
 * Construct Rightmove search URL from query parameters
 */
function buildSearchUrl(query: SearchQuery): string {
  const baseUrl = `${SITE_URLS.rightmove}/property-for-sale/find.html`;
  const params = new URLSearchParams();
  
  // Location - Rightmove accepts location as text in the search
  if (query.location) {
    params.append('locationIdentifier', '');
    params.append('searchLocation', query.location);
  }
  
  // Price range
  if (query.minPrice) {
    params.append('minPrice', query.minPrice.toString());
  }
  if (query.maxPrice) {
    params.append('maxPrice', query.maxPrice.toString());
  }
  
  // Property type
  const propertyTypes = mapPropertyType(query.propertyType);
  if (propertyTypes) {
    params.append('propertyTypes', propertyTypes);
  }
  
  // Bedrooms
  if (query.bedrooms) {
    params.append('propertyNumberOfBedrooms', query.bedrooms.toString());
  }
  
  // Default sorting (newest first)
  params.append('sortType', '6');
  params.append('includeSSTC', 'false');
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Extract price from text (e.g., "£250,000" -> 250000)
 */
function extractPrice(priceText: string): number {
  // Remove currency symbols, commas, and whitespace
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
 * Extract property ID from URL or data attributes
 */
function extractPropertyId(url: string, title: string): string {
  // Try to extract ID from URL (e.g., /properties/12345678)
  const urlMatch = url.match(/\/(\d+)\.html/);
  if (urlMatch) {
    return `rightmove-${urlMatch[1]}`;
  }
  
  // Fallback: generate ID from title and URL
  const hash = url.split('/').pop() || title;
  return `rightmove-${hash.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

/**
 * Parse property listings from Rightmove HTML
 */
function parseListings(html: string, baseUrl: string): PropertyListing[] {
  const listings: PropertyListing[] = [];
  
  try {
    // Rightmove embeds property data in JSON-LD or script tags
    // Try to extract JSON data first
    const jsonMatch = html.match(/window\.__PRELOADED_STATE__\s*=\s*({.+?});/s);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        // Parse properties from JSON if available
        if (data?.properties?.results) {
          for (const prop of data.properties.results) {
            listings.push(parsePropertyFromJson(prop, baseUrl));
          }
        }
      } catch (e) {
        console.log('[Rightmove] Could not parse JSON data, falling back to HTML parsing');
      }
    }
    
    // If JSON parsing didn't work or returned no results, parse HTML
    if (listings.length === 0) {
      // Rightmove property cards are typically in divs with class containing "propertyCard"
      const propertyCardRegex = /<div[^>]*class="[^"]*propertyCard[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
      let match;
      
      while ((match = propertyCardRegex.exec(html)) !== null) {
        const cardHtml = match[1];
        const listing = parsePropertyCard(cardHtml, baseUrl);
        if (listing) {
          listings.push(listing);
        }
      }
    }
    
    // Alternative: Look for property links
    if (listings.length === 0) {
      const linkRegex = /<a[^>]*href="(\/properties\/\d+\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
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
    
  } catch (error) {
    console.error('[Rightmove] Error parsing listings:', error);
  }
  
  return listings;
}

/**
 * Parse property from JSON data
 */
function parsePropertyFromJson(prop: any, baseUrl: string): PropertyListing {
  const url = prop.url || prop.propertyUrl || '';
  const fullUrl = url.startsWith('http') ? url : baseUrl + url;
  
  return {
    id: extractPropertyId(fullUrl, prop.title || ''),
    title: prop.title || prop.displayAddress || 'Property',
    price: prop.price?.amount || extractPrice(prop.priceText || '0'),
    location: prop.displayAddress || prop.address || '',
    city: prop.city || prop.town || '',
    state: prop.county || '',
    bedrooms: prop.bedrooms || extractBedrooms(prop.bedroomsText || ''),
    bathrooms: prop.bathrooms,
    propertyType: prop.propertyType || prop.propertySubType || 'Unknown',
    images: prop.images || [prop.imageUrl].filter(Boolean) || [],
    description: prop.summary || prop.description,
    source: 'Rightmove',
    url: fullUrl,
  };
}

/**
 * Parse property card from HTML
 */
function parsePropertyCard(cardHtml: string, baseUrlOrUrl: string): PropertyListing | null {
  try {
    // Extract URL
    const urlMatch = cardHtml.match(/href="([^"]*\/properties\/\d+[^"]*\.html)"/i) || 
                     cardHtml.match(/href="([^"]*property[^"]*)"[^>]*>/i);
    if (!urlMatch) return null;
    
    const relativeUrl = urlMatch[1];
    const fullUrl = relativeUrl.startsWith('http') 
      ? relativeUrl 
      : (baseUrlOrUrl.includes('properties/') ? baseUrlOrUrl : SITE_URLS.rightmove + relativeUrl);
    
    // Extract title
    const titleMatch = cardHtml.match(/<h2[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h2>/i) ||
                      cardHtml.match(/<a[^>]*class="[^"]*propertyCard[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i) ||
                      cardHtml.match(/data-test="property-title"[^>]*>([^<]+)</i);
    const title = titleMatch ? titleMatch[1].trim() : 'Property';
    
    // Extract price
    const priceMatch = cardHtml.match(/<div[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                      cardHtml.match(/£([\d,]+)/i) ||
                      cardHtml.match(/data-test="property-price"[^>]*>([^<]+)</i);
    const priceText = priceMatch ? priceMatch[1] : '0';
    const price = extractPrice(priceText);
    
    // Extract location/address
    const locationMatch = cardHtml.match(/<address[^>]*>([^<]+)<\/address>/i) ||
                         cardHtml.match(/<div[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                         cardHtml.match(/data-test="property-address"[^>]*>([^<]+)</i);
    const location = locationMatch ? locationMatch[1].trim() : '';
    
    // Extract bedrooms
    const bedroomsMatch = cardHtml.match(/(\d+)\s*bed/i) ||
                         cardHtml.match(/data-test="property-beds"[^>]*>(\d+)</i);
    const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : undefined;
    
    // Extract property type (if available)
    const typeMatch = cardHtml.match(/<span[^>]*class="[^"]*propertyType[^"]*"[^>]*>([^<]+)<\/span>/i);
    const propertyType = typeMatch ? typeMatch[1].trim() : 'Unknown';
    
    // Extract images
    const images: string[] = [];
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(cardHtml)) !== null && images.length < 5) {
      const imgUrl = imgMatch[1];
      if (imgUrl && !imgUrl.includes('placeholder') && !imgUrl.includes('logo')) {
        const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : SITE_URLS.rightmove + imgUrl;
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
      source: 'Rightmove',
      url: fullUrl,
    };
  } catch (error) {
    console.error('[Rightmove] Error parsing property card:', error);
    return null;
  }
}

/**
 * Scrape property listings from Rightmove
 * @param query - Search query parameters
 * @returns Array of property listings
 */
export async function scrape(query: SearchQuery): Promise<PropertyListing[]> {
  try {
    // Validate required query parameters
    if (!query.location) {
      console.warn('[Rightmove] No location provided in query');
      return [];
    }
    
    // Build search URL
    const searchUrl = buildSearchUrl(query);
    console.log('[Rightmove] Fetching:', searchUrl);
    
    // Fetch HTML with retry logic (handled by httpFetch)
    const html = await fetchHtml(searchUrl, {
      timeout: 30000,
      retries: 3,
    });
    
    console.log(`[Rightmove] Fetched ${html.length} bytes of HTML`);
    
    // Parse listings from HTML
    const listings = parseListings(html, SITE_URLS.rightmove);
    
    console.log(`[Rightmove] ✅ Successfully found ${listings.length} properties`);
    
    // Log sample of results for debugging
    if (listings.length > 0) {
      console.log('[Rightmove] Sample listing:', {
        id: listings[0].id,
        title: listings[0].title,
        price: listings[0].price,
        location: listings[0].location,
        source: listings[0].source,
      });
    } else {
      console.warn('[Rightmove] ⚠️  No properties found - HTML may need different parsing');
    }
    
    return listings;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Rightmove] Scraper error:', errorMessage);
    
    // Return empty array on error (error handling is done at the unified loader level)
    return [];
  }
}
