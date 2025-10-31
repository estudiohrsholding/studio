'use strict';

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

admin.initializeApp();

/**
 * A 2nd Gen onCall HTTPS Cloud Function to provision a new club and its administrator.
 *
 * This function performs the following actions atomically:
 * 1. Validates that the caller has provided the necessary data (`adminUid`, `clubName`).
 * 2. Creates a new 'clubs' document in Firestore with the club details.
 * 3. Sets custom claims on the calling user's Firebase Auth record,
 *    assigning them the new `clubId` and a `role` of 'admin'.
 *
 * @param request - The data passed to the function, expecting `adminUid` and `clubName`.
 * @returns A promise that resolves with the result of the operation.
 */
export const provisionNewClub = onCall(async (request) => {
  // 1. Input Validation
  const { adminUid, clubName } = request.data;
  if (!adminUid || !clubName) {
    throw new HttpsError(
      'invalid-argument',
      'The function must be called with "adminUid" and "clubName" arguments.'
    );
  }

  // If you are not using anonymous auth, you can also validate the caller's auth context
  if (!request.auth) {
     throw new HttpsError('unauthenticated', 'The function must be called by an authenticated user.');
  }

  // It's a good practice to ensure the UID from the data matches the caller's UID
  if (request.auth.uid !== adminUid) {
      throw new HttpsError('permission-denied', 'You can only provision a club for your own account.');
  }


  const db = admin.firestore();
  const auth = admin.auth();

  try {
    // 2. Atomic Workflow
    // Step A: Create the club document in the 'clubs' collection.
    const clubDocRef = await db.collection('clubs').add({
      name: clubName,
      userAdminId: adminUid,
      dateCreated: FieldValue.serverTimestamp(),
    });

    // Step B: Get the automatically generated ID from the new document.
    const newClubId = clubDocRef.id;

    // Step C (Critical): Set the custom claims on the user's Auth record.
    // This securely associates the user with their club and role.
    await auth.setCustomUserClaims(adminUid, {
      clubId: newClubId,
      role: 'userAdmin', // Using 'userAdmin' to match client-side expectations.
    });

    // 3. Return Success
    console.log(`Successfully provisioned club ${newClubId} for user ${adminUid}`);
    return { status: 'success', clubId: newClubId };

  } catch (error: any) {
    // 4. Error Handling
    console.error('Club provisioning failed:', error);
    // Throw a specific error for the client, but log the detailed one.
    throw new HttpsError(
      'internal',
      'An internal error occurred while provisioning the club.',
      error.message
    );
  }
});
