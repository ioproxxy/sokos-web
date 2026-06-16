/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { getDistance } from '../../../shared/utils/index.js';

export function useDistanceCalculator(userLat?: number, userLon?: number) {
  const calculateDistance = useCallback((listingLat: number, listingLon: number): string => {
    if (userLat === undefined || userLon === undefined) {
      return '1.2'; // Standard default distance fallback in CBD
    }
    const dist = getDistance(userLat, userLon, listingLat, listingLon);
    return dist.toFixed(1);
  }, [userLat, userLon]);

  return { calculateDistance };
}
