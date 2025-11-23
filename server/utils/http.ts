/**
 * HTTP utility with ScraperAPI integration, retry logic, and timeout handling
 */

// Environment variable configuration
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || '';
const DEFAULT_TIMEOUT = process.env.SCRAPER_TIMEOUT ? parseInt(process.env.SCRAPER_TIMEOUT, 10) : 30000;
const DEFAULT_RETRIES = process.env.SCRAPER_RETRIES ? parseInt(process.env.SCRAPER_RETRIES, 10) : 3;
const SCRAPER_API_BASE = 'https://api.scraperapi.com/';

interface FetchOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeout(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);
  });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Build ScraperAPI URL
 */
function buildScraperApiUrl(targetUrl: string): string {
  if (!SCRAPER_API_KEY) {
    throw new Error('SCRAPER_API_KEY environment variable is not set');
  }
  
  const params = new URLSearchParams({
    api_key: SCRAPER_API_KEY,
    url: targetUrl,
    render: 'true',
  });
  
  return `${SCRAPER_API_BASE}?${params.toString()}`;
}

/**
 * Fetch HTML content using ScraperAPI with retry logic and timeout
 * @param url - The target URL to scrape
 * @param options - Optional fetch options (timeout, retries, retryDelay)
 * @returns HTML content as string
 * @throws Error if all retries fail or timeout occurs
 */
export async function fetchHtml(url: string, options?: FetchOptions): Promise<string> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = 1000, // 1 second between retries
  } = options || {};

  // Build ScraperAPI URL
  const scraperApiUrl = buildScraperApiUrl(url);
  console.log('[ScraperAPI] URL:', scraperApiUrl);
  console.log('[ScraperAPI] Target URL:', url);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[ScraperAPI] Attempt ${attempt + 1}/${retries} for: ${url}`);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await Promise.race([
          fetch(scraperApiUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
          }),
          createTimeout(timeout),
        ]);

        clearTimeout(timeoutId);

        console.log('[ScraperAPI] Status:', response.status);
        console.log('[ScraperAPI] Status Text:', response.statusText);

        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`ScraperAPI HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const html = await response.text();
        console.log(`[ScraperAPI] Success! Received ${html.length} bytes of HTML`);
        
        return html;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[ScraperAPI] Attempt ${attempt + 1} failed:`, lastError.message);

      // Don't retry on the last attempt
      if (attempt < retries - 1) {
        // Exponential backoff: delay increases with each retry
        const delay = retryDelay * Math.pow(2, attempt);
        console.log(`[ScraperAPI] Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new Error('ScraperAPI request failed after all retries');
}

/**
 * Fetch JSON content using ScraperAPI
 * @param url - The target URL to scrape
 * @param options - Optional fetch options
 * @returns Parsed JSON object
 */
export async function fetchJson<T = any>(url: string, options?: FetchOptions): Promise<T> {
  const html = await fetchHtml(url, options);
  try {
    return JSON.parse(html) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON from ScraperAPI response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Legacy httpFetch function for backward compatibility (not used with ScraperAPI)
 * @deprecated Use fetchHtml instead
 */
export async function httpFetch(
  url: string,
  options?: FetchOptions
): Promise<Response> {
  // For ScraperAPI, we don't use this function
  // But keeping it for compatibility
  const html = await fetchHtml(url, options);
  return new Response(html, {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html' },
  });
}
