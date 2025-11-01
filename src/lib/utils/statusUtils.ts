
// Implements Phase 2, Task 2: Create Derived State Function 'getMemberStatus'
import { Timestamp } from 'firebase/firestore';

interface MemberStatus {
    text: 'activated' | 'EXPIRED';
    color: string;
}

export function getMemberStatus(
    expiresAt: Timestamp | null | undefined
): MemberStatus {
    const now = new Date();

    if (!expiresAt) {
        return { text: 'EXPIRED', color: 'text-gray-400' };
    }

    const expirationDate = expiresAt.toDate();

    if (expirationDate > now) {
        return { text: 'activated', color: 'text-green-500' };
    } else {
        return { text: 'EXPIRED', color: 'text-gray-400' };
    }
}
