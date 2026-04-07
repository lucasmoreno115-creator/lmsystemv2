import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { validateLeadDocument } from './leadValidation.js';

export async function saveLead(db, leadDocument) {
  const validLead = validateLeadDocument(leadDocument);
  return addDoc(collection(db, 'lm_leads'), {
    ...validLead,
    createdAt: serverTimestamp()
  });
}
