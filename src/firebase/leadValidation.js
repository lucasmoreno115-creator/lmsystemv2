import { validateFirestorePayload } from './firebaseValidation.js';

export function validateLeadDocument(leadDocument) {
  validateFirestorePayload(leadDocument);
  return leadDocument;
}
