import { db } from "../../config/firebase/config";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import type { OtherResource } from "../../types/other-resource";

const getOtherResourcesCollection = (projectId: string) =>
  collection(db, `projects/${projectId}/otherresources`);

export async function addOtherResource(
  projectId: string,
  resource: Omit<OtherResource, "id">
) {
  const colRef = getOtherResourcesCollection(projectId);
  const docRef = await addDoc(colRef, {
    ...resource,
  });
  return docRef.id;
}

export function listenToOtherResources(
  projectId: string,
  callback: (resources: OtherResource[]) => void
) {
  const colRef = getOtherResourcesCollection(projectId);
  return onSnapshot(colRef, (snapshot) => {
    const resources = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        details: data.details,
        category: data.category,
        quantity: data.quantity,
        pricePerQuantity: data.pricePerQuantity,
        provider: data.provider,
      } as OtherResource;
    });
    callback(resources);
  });
}

export async function deleteOtherResource(projectId: string, id: string) {
  const docRef = doc(db, `projects/${projectId}/otherresources/${id}`);
  await deleteDoc(docRef);
}

export async function updateOtherResource(
  projectId: string,
  resource: OtherResource
) {
  const docRef = doc(db, `projects/${projectId}/otherresources/${resource.id}`);
  await updateDoc(docRef, {
    name: resource.name,
    details: resource.details,
    category: resource.category,
    quantity: resource.quantity,
    pricePerQuantity: resource.pricePerQuantity,
    provider: resource.provider,
  });
}
