import { Timestamp } from 'firebase/firestore';

interface MemberStatus {
    colorClass: string;
    statusText: string;
}

export function getMemberStatusTag(
    expiresAt: Timestamp | null, 
    isVetoed: boolean
): MemberStatus {
    
    // Red (Vetoed) - Highest priority
    if (isVetoed) {
        return { colorClass: 'bg-red-600', statusText: 'VETOED' };
    }

    // Gray (Expired/Inactive)
    if (!expiresAt || expiresAt.toDate() < new Date()) {
        return { colorClass: 'bg-gray-500', statusText: 'EXPIRED' };
    }

    // Green (Active)
    return { colorClass: 'bg-green-600', statusText: 'ACTIVE' };
}
