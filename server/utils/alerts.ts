/**
 * Alerts and notification system for HomeFinder AI SaaS
 * Detects new property listings and generates alerts for clients
 */

import { PropertyListing } from '../types.js';

/**
 * TypeScript types for alerts
 */
export interface Alert {
  clientId: string;
  clientName: string;
  newListings: PropertyListing[];
  timestamp: string;
  totalNew: number;
}

export interface AlertsResponse {
  totalAlerts: number;
  totalNewListings: number;
  alerts: Alert[];
}

/**
 * Generate a unique key for a listing to use in comparison
 * Uses ID as primary identifier, falls back to URL + title + price
 */
function getListingKey(listing: PropertyListing): string {
  // Use ID if available (most reliable)
  if (listing.id) {
    return listing.id;
  }
  
  // Fallback to URL (unique per property)
  if (listing.url) {
    return listing.url;
  }
  
  // Last resort: combination of title, price, and location
  return `${listing.title}-${listing.price}-${listing.location}`;
}

/**
 * Compare previous and current listings to find new listings
 * Returns only listings that exist in current but not in previous
 * 
 * @param previous - Previous listings array
 * @param current - Current listings array
 * @returns Array of new listings that weren't in previous results
 */
export function compareListings(
  previous: PropertyListing[],
  current: PropertyListing[]
): PropertyListing[] {
  // Create a Set of keys from previous listings for O(1) lookup
  const previousKeys = new Set<string>();
  for (const listing of previous) {
    previousKeys.add(getListingKey(listing));
  }
  
  // Find listings in current that don't exist in previous
  const newListings: PropertyListing[] = [];
  const seenKeys = new Set<string>();
  
  for (const listing of current) {
    const key = getListingKey(listing);
    
    // Skip if we've already seen this listing in current results (deduplication)
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    
    // If this listing wasn't in previous results, it's new
    if (!previousKeys.has(key)) {
      newListings.push(listing);
    }
  }
  
  return newListings;
}

/**
 * Generate alerts for all clients by comparing previous and current listings
 * 
 * @param previousListings - Previous listings keyed by clientId
 * @param currentListings - Current listings keyed by clientId
 * @param clientNames - Optional map of clientId to clientName for better logging
 * @returns Array of alerts for clients with new listings
 */
export function generateAlerts(
  previousListings: Record<string, PropertyListing[]>,
  currentListings: Record<string, PropertyListing[]>,
  clientNames?: Record<string, string>
): Alert[] {
  console.log('[Alerts] Generating alerts...');
  console.log(`[Alerts] Previous listings for ${Object.keys(previousListings).length} clients`);
  console.log(`[Alerts] Current listings for ${Object.keys(currentListings).length} clients`);
  
  const alerts: Alert[] = [];
  const timestamp = new Date().toISOString();
  
  // Process each client
  for (const clientId in currentListings) {
    const current = currentListings[clientId];
    const previous = previousListings[clientId] || [];
    const clientName = clientNames?.[clientId] || `Client ${clientId}`;
    
    console.log(`[Alerts] Comparing listings for client: ${clientName} (${clientId})`);
    console.log(`[Alerts] - Previous: ${previous.length} listings`);
    console.log(`[Alerts] - Current: ${current.length} listings`);
    
    // Find new listings
    const newListings = compareListings(previous, current);
    
    if (newListings.length > 0) {
      console.log(`[Alerts] ⚠️  NEW LISTINGS DETECTED for ${clientName}: ${newListings.length} new properties`);
      
      // Log sample of new listings
      const sampleListing = newListings[0];
      console.log(`[Alerts] Sample new listing:`, {
        id: sampleListing.id,
        title: sampleListing.title,
        price: sampleListing.price,
        location: sampleListing.location,
        source: sampleListing.source,
        url: sampleListing.url,
      });
      
      // Create alert
      const alert: Alert = {
        clientId,
        clientName,
        newListings,
        timestamp,
        totalNew: newListings.length,
      };
      
      alerts.push(alert);
      
      // Optional: Send notification (email, push, etc.)
      // For now, we'll just log
      sendNotification(alert);
    } else {
      console.log(`[Alerts] No new listings for ${clientName}`);
    }
  }
  
  // Summary
  const totalNewListings = alerts.reduce((sum, alert) => sum + alert.totalNew, 0);
  console.log(`[Alerts] Alert generation complete:`);
  console.log(`[Alerts] - Total alerts: ${alerts.length}`);
  console.log(`[Alerts] - Total new listings: ${totalNewListings}`);
  
  return alerts;
}

/**
 * Send notification for an alert
 * Currently logs to console, but can be extended to send emails, push notifications, etc.
 * 
 * @param alert - Alert to send notification for
 */
function sendNotification(alert: Alert): void {
  console.log(`[Alerts] 📧 NOTIFICATION: ${alert.clientName} has ${alert.totalNew} new property listing(s)`);
  console.log(`[Alerts] Client ID: ${alert.clientId}`);
  console.log(`[Alerts] Timestamp: ${alert.timestamp}`);
  
  // Log all new listings
  for (const listing of alert.newListings) {
    console.log(`[Alerts]   - ${listing.title} | £${listing.price.toLocaleString()} | ${listing.location} | ${listing.source}`);
  }
  
  // TODO: Implement email notification
  // Example: await sendEmail({
  //   to: clientEmail,
  //   subject: `New Properties Found: ${alert.totalNew} new listings`,
  //   body: generateEmailBody(alert)
  // });
  
  // TODO: Implement push notification
  // Example: await sendPushNotification({
  //   userId: agentId,
  //   title: `New Properties for ${alert.clientName}`,
  //   body: `${alert.totalNew} new listings found`,
  //   data: { clientId: alert.clientId }
  // });
}

/**
 * Generate alerts response with summary statistics
 * 
 * @param previousListings - Previous listings keyed by clientId
 * @param currentListings - Current listings keyed by clientId
 * @param clientNames - Optional map of clientId to clientName
 * @returns AlertsResponse with alerts and summary
 */
export function generateAlertsResponse(
  previousListings: Record<string, PropertyListing[]>,
  currentListings: Record<string, PropertyListing[]>,
  clientNames?: Record<string, string>
): AlertsResponse {
  const alerts = generateAlerts(previousListings, currentListings, clientNames);
  const totalNewListings = alerts.reduce((sum, alert) => sum + alert.totalNew, 0);
  
  return {
    totalAlerts: alerts.length,
    totalNewListings,
    alerts,
  };
}

/**
 * Helper function to convert dashboard results to listings map
 * Useful for integrating with dashboard API
 * 
 * @param dashboardResults - Results from dashboard API
 * @returns Record of clientId to PropertyListing[]
 */
export function dashboardResultsToListingsMap(
  dashboardResults: Array<{
    clientId: string;
    listings: PropertyListing[];
  }>
): Record<string, PropertyListing[]> {
  const listingsMap: Record<string, PropertyListing[]> = {};
  
  for (const result of dashboardResults) {
    listingsMap[result.clientId] = result.listings;
  }
  
  return listingsMap;
}

/**
 * Helper function to extract client names from dashboard results
 * Useful for better alert logging
 * 
 * @param dashboardResults - Results from dashboard API
 * @returns Record of clientId to clientName
 */
export function extractClientNames(
  dashboardResults: Array<{
    clientId: string;
    clientName: string;
  }>
): Record<string, string> {
  const clientNames: Record<string, string> = {};
  
  for (const result of dashboardResults) {
    clientNames[result.clientId] = result.clientName;
  }
  
  return clientNames;
}

/**
 * Store previous listings for comparison
 * In a production system, this would be stored in a database
 * For now, this is a helper to manage in-memory storage
 */
class ListingHistory {
  private history: Record<string, PropertyListing[]> = {};
  
  /**
   * Store listings for a client
   */
  set(clientId: string, listings: PropertyListing[]): void {
    this.history[clientId] = listings;
    console.log(`[Alerts] Stored ${listings.length} listings for client: ${clientId}`);
  }
  
  /**
   * Get previous listings for a client
   */
  get(clientId: string): PropertyListing[] {
    return this.history[clientId] || [];
  }
  
  /**
   * Get all previous listings
   */
  getAll(): Record<string, PropertyListing[]> {
    return { ...this.history };
  }
  
  /**
   * Clear history for a client
   */
  clear(clientId: string): void {
    delete this.history[clientId];
    console.log(`[Alerts] Cleared history for client: ${clientId}`);
  }
  
  /**
   * Clear all history
   */
  clearAll(): void {
    this.history = {};
    console.log('[Alerts] Cleared all history');
  }
}

// Export singleton instance for use across the application
export const listingHistory = new ListingHistory();

