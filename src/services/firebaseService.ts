import { auth, db } from './firebaseConfig';
import { storageService } from './storageService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const currentEmp = storageService.getCurrentEmployee();

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || currentEmp?.id || null,
      email: currentUser?.email || currentEmp?.email || null,
      emailVerified: currentUser?.emailVerified ?? true,
      isAnonymous: currentUser?.isAnonymous ?? false,
      tenantId: currentUser?.tenantId || 'tenant-nexo-central',
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [
        {
          providerId: 'password',
          email: currentEmp?.email || null
        }
      ]
    },
    operationType,
    path
  };

  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function checkFirebaseStatus(): Promise<{
  isAvailable: boolean;
  message: string;
}> {
  if (auth.currentUser) {
    return {
      isAvailable: true,
      message: `Firebase autenticado como ${auth.currentUser.email}. Sincronización en la nube activa.`
    };
  }

  return {
    isAvailable: true,
    message: 'Firebase aprovisionado. Inicie sesión para sincronizar datos en tiempo real.'
  };
}

export { auth, db };
