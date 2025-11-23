import { searchProperties } from '../../../server/api/searchProperties';
import { SearchQuery } from '../../../server/types';

/**
 * API route handler for property search
 * POST /api/search
 * Body: { location?, propertyType?, minPrice?, maxPrice?, bedrooms?, bathrooms? }
 */
export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json().catch(() => ({}));
    
    // Extract query parameters
    const query: SearchQuery = {
      location: body.location,
      propertyType: body.propertyType,
      minPrice: body.minPrice,
      maxPrice: body.maxPrice,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
    };

    // Search properties across all scrapers
    const result = await searchProperties(query);

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        listings: result.listings,
        totalFound: result.totalFound,
        sources: result.results.map(r => ({
          source: r.source,
          success: r.success,
          count: r.listings.length,
          error: r.error,
        })),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[API] Search error:', errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        listings: [],
        totalFound: 0,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

