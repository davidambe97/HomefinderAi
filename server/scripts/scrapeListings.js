/**
 * Playwright-based property scraper (JavaScript version)
 * Scrapes listings from Rightmove, Zoopla, and OpenRent
 */

const fs = require('fs');
const { chromium } = require('playwright');

// CONFIG
const SEARCH_QUERY = process.argv[2] || 'London';
const MAX_LISTINGS = parseInt(process.argv[3]) || 10; // Limit top N listings per site
const OUTPUT_FILE = `listings_${SEARCH_QUERY.replace(/\s+/g, '_')}_${Date.now()}.json`;
const OUTPUT_DIR = './data';

const SITES = [
  {
    name: 'Rightmove',
    url: `https://www.rightmove.co.uk/property-for-sale/find.html?searchLocation=${encodeURIComponent(SEARCH_QUERY)}&sortType=6`,
    listingSelector: '.l-searchResults > div[class*="PropertyCard"], .propertyCard',
    extract: (el) => {
      const titleEl = el.querySelector('h2[class*="propertyCard-title"], .propertyCard-title');
      const priceEl = el.querySelector('.propertyCard-priceValue, [class*="priceValue"]');
      const addressEl = el.querySelector('.propertyCard-address, [class*="address"]');
      const descEl = el.querySelector('.propertyCard-description, [class*="description"]');
      const linkEl = el.querySelector('a.propertyCard-link, a[href*="/properties/"]');
      const imgEl = el.querySelector('.propertyCard-img img, img[class*="propertyCard"]');
      
      const bedroomsMatch = descEl?.innerText?.match(/(\d+)\s*bed/i);
      
      return {
        title: titleEl?.innerText?.trim() || '',
        price: priceEl?.innerText?.trim() || '',
        address: addressEl?.innerText?.trim() || '',
        bedrooms: bedroomsMatch ? bedroomsMatch[0] : '',
        url: linkEl?.href || '',
        image: imgEl?.src || imgEl?.getAttribute('data-src') || ''
      };
    }
  },
  {
    name: 'Zoopla',
    url: `https://www.zoopla.co.uk/for-sale/property?q=${encodeURIComponent(SEARCH_QUERY)}&sort=newest_listings&premium=true`,
    listingSelector: 'ul[class*="listing-results"] > li, article[class*="listing"], .listing-results-wrapper',
    extract: (el) => {
      const titleEl = el.querySelector('h2[class*="listing-title"], a[class*="listing-title"], .listing-results-attr');
      const priceEl = el.querySelector('.listing-price, [data-testid="listing-price"], .listing-results-price');
      const addressEl = el.querySelector('.listing-address, [data-testid="listing-address"], .listing-results-address');
      const bedsEl = el.querySelector('.num-beds, [data-testid="listing-beds"], .listing-beds');
      const linkEl = el.querySelector('a[href*="/for-sale/details/"], a[class*="listing-link"]');
      const imgEl = el.querySelector('img[class*="listing"], img[data-testid="listing-image"]');
      
      return {
        title: titleEl?.innerText?.trim() || '',
        price: priceEl?.innerText?.trim() || '',
        address: addressEl?.innerText?.trim() || '',
        bedrooms: bedsEl?.innerText?.trim() || '',
        url: linkEl?.href || '',
        image: imgEl?.src || imgEl?.getAttribute('data-src') || ''
      };
    }
  },
  {
    name: 'OpenRent',
    url: `https://www.openrent.co.uk/properties-to-rent?term=${encodeURIComponent(SEARCH_QUERY)}&sort=date`,
    listingSelector: '.property-list-item, .property-card, .listing-card',
    extract: (el) => {
      const titleEl = el.querySelector('h2.property-title, .property-title, .listing-title');
      const priceEl = el.querySelector('.property-price, .price, .listing-price');
      const addressEl = el.querySelector('.property-address, .address, .listing-address');
      const bedsEl = el.querySelector('.property-beds, .beds, .listing-beds');
      const linkEl = el.querySelector('a.property-link, a[href*="/property/"]');
      const imgEl = el.querySelector('.property-image img, .property-photo img, img[class*="property"]');
      
      return {
        title: titleEl?.innerText?.trim() || '',
        price: priceEl?.innerText?.trim() || '',
        address: addressEl?.innerText?.trim() || '',
        bedrooms: bedsEl?.innerText?.trim() || '',
        url: linkEl?.href || '',
        image: imgEl?.src || imgEl?.getAttribute('data-src') || ''
      };
    }
  },
  {
    name: 'SpareRoom',
    url: `https://www.spareroom.co.uk/flatshare/search.pl?search=${encodeURIComponent(SEARCH_QUERY)}&sort_by=date`,
    listingSelector: '.listing-result, .room-card, [class*="listing-result"]',
    extract: (el) => {
      const titleEl = el.querySelector('h2.listing-title, .room-title, [class*="title"]');
      const priceEl = el.querySelector('.listing-price, .room-price, [class*="price"]');
      const addressEl = el.querySelector('.listing-address, .room-address, [class*="address"]');
      const bedsEl = el.querySelector('.listing-beds, .room-beds, [class*="beds"]');
      const linkEl = el.querySelector('a.listing-link, a[href*="/room/"]');
      const imgEl = el.querySelector('.listing-image img, .room-image img, img[class*="listing"]');
      
      return {
        title: titleEl?.innerText?.trim() || '',
        price: priceEl?.innerText?.trim() || '',
        address: addressEl?.innerText?.trim() || '',
        bedrooms: bedsEl?.innerText?.trim() || '',
        url: linkEl?.href || '',
        image: imgEl?.src || imgEl?.getAttribute('data-src') || ''
      };
    }
  }
];

(async () => {
  console.log(`🚀 Starting scraper for: "${SEARCH_QUERY}"`);
  console.log(`📊 Max listings per site: ${MAX_LISTINGS}`);
  console.log(`📁 Output file: ${OUTPUT_FILE}\n`);

  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-GB',
    timezoneId: 'Europe/London',
  });

  // Add stealth features
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  const results = [];

  for (const site of SITES) {
    console.log(`\n🔍 Scraping ${site.name}...`);
    console.log(`   URL: ${site.url}`);

    try {
      const page = await context.newPage();

      // Navigate with timeout
      await page.goto(site.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for listings to render
      await page.waitForTimeout(2000);

      // Try to wait for listing selector
      try {
        await page.waitForSelector(site.listingSelector, { timeout: 10000 });
      } catch (e) {
        console.log(`   ⚠️  Selector "${site.listingSelector}" not found, trying to extract anyway...`);
      }

      // Scroll down to trigger lazy loading
      await page.evaluate(() => {
        window.scrollBy(0, 500);
      });
      await page.waitForTimeout(1000);

      // Extract listings
      const listings = await page.$$eval(site.listingSelector, (els, maxListings, extractFnString) => {
        // Parse the extract function string and execute it
        const extractFn = new Function('el', `return (${extractFnString})(el)`);
        
        return els.slice(0, maxListings).map(el => {
          try {
            return extractFn(el);
          } catch (err) {
            console.error('Error extracting listing:', err);
            return null;
          }
        }).filter(item => item !== null && item.title && item.price);
      }, MAX_LISTINGS, site.extract.toString());

      // Clean up listings
      const cleanedListings = listings.map(listing => ({
        ...listing,
        // Ensure URLs are absolute
        url: listing.url && !listing.url.startsWith('http') 
          ? (site.url.includes('rightmove') ? 'https://www.rightmove.co.uk' : 
             site.url.includes('zoopla') ? 'https://www.zoopla.co.uk' :
             site.url.includes('openrent') ? 'https://www.openrent.co.uk' :
             'https://www.spareroom.co.uk') + listing.url
          : listing.url,
        // Ensure image URLs are absolute
        image: listing.image && !listing.image.startsWith('http')
          ? (site.url.includes('rightmove') ? 'https://www.rightmove.co.uk' : 
             site.url.includes('zoopla') ? 'https://www.zoopla.co.uk' :
             site.url.includes('openrent') ? 'https://www.openrent.co.uk' :
             'https://www.spareroom.co.uk') + listing.image
          : listing.image
      }));

      results.push({ 
        site: site.name, 
        listings: cleanedListings,
        count: cleanedListings.length
      });

      await page.close();
      console.log(`   ✅ ${site.name}: Found ${cleanedListings.length} listings`);

    } catch (err) {
      console.error(`   ❌ ${site.name} error:`, err.message);
      results.push({ 
        site: site.name, 
        listings: [], 
        error: err.message,
        count: 0
      });
    }
  }

  await browser.close();

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = `${OUTPUT_DIR}/${OUTPUT_FILE}`;
  const outputData = {
    timestamp: new Date().toISOString(),
    query: SEARCH_QUERY,
    totalSites: SITES.length,
    totalListings: results.reduce((sum, r) => sum + (r.count || 0), 0),
    results
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(`\n✅ Scraping complete!`);
  console.log(`📁 Results saved to: ${outputPath}`);
  console.log(`📊 Total listings across all sites: ${outputData.totalListings}`);
})();

