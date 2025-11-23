/**
 * ScraperAPI helper function
 * Routes all scraping requests through ScraperAPI to bypass anti-bot measures
 */

/**
 * Fetch HTML content via ScraperAPI
 * @param url - The target URL to scrape
 * @returns HTML content as string
 * @throws Error if SCRAPER_API_KEY is missing or request fails
 */
export async function fetchViaScraperApi(url: string): Promise<string> {
  const apiKey = process.env.SCRAPER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing SCRAPER_API_KEY environment variable');
  }

  const encoded = encodeURIComponent(url);
  const apiUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encoded}&render=true`;

  console.log('[ScraperAPI] Used for:', url);
  console.log('[ScraperAPI] Request URL:', apiUrl.replace(apiKey, '***REDACTED***'));

  try {
    const res = await fetch(apiUrl, { 
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`ScraperAPI HTTP ${res.status}: ${res.statusText} - ${errorText}`);
    }

    const html = await res.text();
    console.log(`[ScraperAPI] Success! Received ${html.length} bytes of HTML for: ${url}`);
    
    return html;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ScraperAPI] Failed for ${url}:`, errorMessage);
    throw error;
  }
}

