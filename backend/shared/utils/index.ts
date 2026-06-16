/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculate distance between two coordinate nodes using Haversine formula
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

/**
 * Format numbers to standard KES currency representation
 */
export function formatKES(amount: number): string {
  return "KES " + Number(amount).toLocaleString();
}

/**
 * Standardizes dynamic Swahili condition labels for listing details
 */
export function displayCondition(condition: string): string {
  if (!condition) return '';
  const val = condition.replace('_', ' ');
  return val.charAt(0).toUpperCase() + val.slice(1);
}
