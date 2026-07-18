import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const normalizeEnvValue = (value) => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const projectId = normalizeEnvValue(process.env.FIREBASE_PROJECT_ID);
const clientEmail = normalizeEnvValue(process.env.FIREBASE_CLIENT_EMAIL);
const privateKey = normalizeEnvValue(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n");

const canUseFirebaseAdmin = Boolean(projectId && clientEmail && privateKey);

if (canUseFirebaseAdmin && getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const verifyFirebaseIdToken = async (idToken) => {
  if (!canUseFirebaseAdmin) {
    return null;
  }

  const auth = getAuth();
  return auth.verifyIdToken(idToken);
};

export const isFirebaseAdminConfigured = canUseFirebaseAdmin;
