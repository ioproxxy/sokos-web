/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface Props {
  verified: boolean;
  docVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ verified, docVerified = false, size = 'md' }: Props) {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
        <ShieldAlert className="w-3 w-3" />
        Unverified
      </span>
    );
  }

  const badgeClass = docVerified
    ? "inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium"
    : "inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-medium";

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span className={badgeClass}>
      <ShieldCheck className={`${iconSize} text-emerald-500 fill-emerald-50`} />
      {docVerified ? 'ID Verified' : 'Verified Vendor'}
    </span>
  );
}
