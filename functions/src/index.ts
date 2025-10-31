import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

admin.initializeApp();

const db = admin.firestore();

/**
 * A callable Cloud Function to provision a new club and its administrator.
 *
 * This function performs the following actions atomically:
 * 1.  Validates that the caller is authenticated.
 * 2.  Creates a new 'Club' document in Firestore.
 * 3.  Creates a new 'UserAdmin' document in Firestore.
 * 4.  Sets custom claims on the calling user's Firebase Auth record,
 *     assigning them a 'clubId' and a 'role' of 'userAdmin'.
 *
 * @param data - The data passed to the function, expecting `clubName` and `adminUid`.
 * @param context - The context of the function call, containing auth information.
 * @returns A promise that resolves with the result of the operation.
 */
export const provisionNewClub = functions.https.onCall(async (data, context) => {
  const adminUid = context.auth?.uid;
  const { clubName } = data;

  if (!adminUid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  if (typeof clubName !== 'string' || clubName.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a valid "clubName" string argument.'
    );
  }

  const clubId = uuidv4();

  const clubRef = db.collection('clubs').doc(clubId);
  const userAdminRef = db.collection('userAdmins').doc(adminUid);

  try {
    // Use a batch to ensure atomicity
    const batch = db.batch();

    // 1. Create Club document
    batch.set(clubRef, {
      clubId: clubId,
      name: clubName,
      userAdminId: adminUid,
      dateCreated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Create UserAdmin document
    batch.set(userAdminRef, {
      userAdminId: adminUid,
      email: context.auth?.token.email || '',
      clubIds: [clubId],
    });

    // Commit the batch
    await batch.commit();

    // 3. Set custom claims on the user
    await admin.auth().setCustomUserClaims(adminUid, {
      clubId: clubId,
      role: 'userAdmin',
    });

    return {
      status: 'success',
      message: 'Club provisioned successfully.',
      clubId: clubId,
    };
  } catch (error) {
    console.error('Error provisioning new club:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An internal error occurred while provisioning the club.'
    );
  }
});
