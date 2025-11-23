/**
 * Configuration constants for scrapers
 */

export const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const DEFAULT_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
};

export const SITE_URLS = {
  rightmove: 'https://www.rightmove.co.uk',
  zoopla: 'https://www.zoopla.co.uk',
  openrent: 'https://www.openrent.co.uk',
  spareroom: 'https://www.spareroom.co.uk',
} as const;

export type SiteName = keyof typeof SITE_URLS;

