import { Timestamp } from 'firebase/firestore';

interface MemberStatus {
    colorClass: string;
    statusText: string;
}

export function getMemberStatusTag(
    expiresAt: Timestamp | null, 
    isVetoed: boolean
): MemberStatus {
    
    // Priority 1 (Red): Vetoed status overrides everything.
    if (isVetoed) {
        return { colorClass: 'bg-red-600', statusText: 'VETOED' };
    }

    // Priority 2 (Green): If not vetoed and expiration is in the future.
    if (expiresAt && expiresAt.toDate() > new Date()) {
        return { colorClass: 'bg-green-600', statusText: 'ACTIVE' };
    }

    // Priority 3 (Gray): If not vetoed but expired or never had a membership.
    return { colorClass: 'bg-gray-500', statusText: 'EXPIRED' };
}
