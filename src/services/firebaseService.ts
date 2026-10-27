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
  const currentEmp = storageService.getCurrentEmployee();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentEmp.id,
      email: currentEmp.email,
      emailVerified: true,
      isAnonymous: false,
      tenantId: 'tenant-nexo-central',
      providerInfo: [
        {
          providerId: 'password',
          email: currentEmp.email
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
  const config = storageService.getConfig();
  if (config.demoMode || !config.firebaseConnected) {
    return {
      isAvailable: false,
      message: 'Modo Local / Demostración: Los datos se guardan en el almacenamiento del navegador. Para habilitar sincronización multi-dispositivo en tiempo real, conecte Firebase en la sección de Configuración.'
    };
  }

  return {
    isAvailable: true,
    message: 'Conexión Firebase activa. Las operaciones se replican en Cloud Firestore.'
  };
}
