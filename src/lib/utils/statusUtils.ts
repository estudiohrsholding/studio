// src/lib/utils/statusUtils.ts
import { Timestamp } from 'firebase/firestore';

interface MemberStatus {
    text: string; // Cambiado de 'activated' | 'EXPIRED' a string
    color: string;
}

export function getMemberStatus(
    expiresAt: Timestamp | null | undefined
): MemberStatus {
    const now = new Date();

    if (!expiresAt) {
        // Estado EXPIRED: fondo gris, texto blanco
        return { text: 'EXPIRED', color: 'bg-gray-500 text-gray-50' };
    }

    const expirationDate = expiresAt.toDate();

    if (expirationDate > now) {
        // Estado ACTIVATED: fondo verde, texto blanco
        return { text: 'activated', color: 'bg-green-700 text-green-50' };
    } else {
        // Estado EXPIRED (fecha pasada): fondo gris, texto blanco
        return { text: 'EXPIRED', color: 'bg-gray-500 text-gray-50' };
    }
}
 