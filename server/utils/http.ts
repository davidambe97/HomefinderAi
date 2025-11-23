/**
 * HTTP utility with retry logic, timeout handling, and anti-blocking features
 */

import { USER_AGENT, DEFAULT_HEADERS } from '../config.js';

// Environment variable configuration
const DEFAULT_TIMEOUT = process.env.SCRAPER_TIMEOUT ? parseInt(process.env.SCRAPER_TIMEOUT, 10) : 30000;
const DEFAULT_RETRIES = process.env.SCRAPER_RETRIES ? parseInt(process.env.SCRAPER_RETRIES, 10) : 3;

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Get a random user agent from the pool
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
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
 * Enhanced fetch with retry logic, timeout, and anti-blocking headers
 */
export async function httpFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = 1000, // 1 second between retries
    headers = {},
    ...fetchOptions
  } = options;

  // Merge headers with defaults and random user agent
  const mergedHeaders = {
    ...DEFAULT_HEADERS,
    'User-Agent': getRandomUserAgent(),
    ...headers,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await Promise.race([
          fetch(url, {
            ...fetchOptions,
            headers: mergedHeaders,
            signal: controller.signal,
          }),
          createTimeout(timeout),
        ]);

        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on the last attempt
      if (attempt < retries - 1) {
        // Exponential backoff: delay increases with each retry
        const delay = retryDelay * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

/**
 * Fetch HTML content as text
 */
export async function fetchHtml(url: string, options?: FetchOptions): Promise<string> {
  const response = await httpFetch(url, options);
  return response.text();
}

/**
 * Fetch JSON content
 */
export async function fetchJson<T = any>(url: string, options?: FetchOptions): Promise<T> {
  const response = await httpFetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options?.headers,
    },
  });
  return response.json();
}

