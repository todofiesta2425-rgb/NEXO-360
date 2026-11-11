import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { storageService } from './storageService';
import { UserRole } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  tenantId: string;
  active: boolean;
  createdAt: string;
  avatarColor?: string;
}

const DEFAULT_TENANT_ID = 'tenant-nexo-central';
const BOOTSTRAP_ADMIN_EMAILS = [
  'todofiesta2425@gmail.com',
  'admin@nexo360.com',
  'roberto@nexo360.com'
];

// Translate Firebase Auth error codes into clear Spanish messages
export function translateAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Ocurrió un error inesperado al procesar la solicitud.';
  const code = (error as { code?: string }).code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'El formato del correo electrónico ingresado no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido desactivada por el administrador.';
    case 'auth/user-not-found':
      return 'No se encontró ningún usuario con ese correo electrónico.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'El correo o la contraseña ingresados son incorrectos. Verifique sus datos.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya se encuentra registrado. Inicie sesión o recupere su contraseña.';
    case 'auth/weak-password':
      return 'La contraseña debe tener un mínimo de 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, espere unos minutos antes de intentar de nuevo.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifique su red a internet e intente nuevamente.';
    case 'auth/operation-not-allowed':
      return 'El proveedor de correo/contraseña no está activo en Firebase. Inicie sesión con Google o contacte al administrador.';
    case 'auth/popup-closed-by-user':
      return 'La ventana emergente de autenticación fue cerrada antes de completar el inicio de sesión.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de autenticación. Por favor permítala para continuar.';
    default:
      return (error as Error).message || 'Error en la autenticación. Verifique sus credenciales.';
  }
}

class AuthService {
  constructor() {
    // Configure session persistence to local storage
    if (typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence).catch(err => {
        console.warn('Error configurando persistencia de sesión:', err);
      });
    }
  }

  /**
   * Determine initial role for new registrations
   */
  public determineRoleForEmail(email: string, requestedRole?: UserRole): UserRole {
    const normalizedEmail = email.toLowerCase().trim();
    if (BOOTSTRAP_ADMIN_EMAILS.includes(normalizedEmail)) {
      return 'propietario';
    }
    if (requestedRole && ['propietario', 'administrador', 'empleado', 'solo_lectura'].includes(requestedRole)) {
      return requestedRole;
    }
    return 'empleado';
  }

  /**
   * Sign in with Email and Password
   */
  public async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const profile = await this.syncUserProfile(credential.user);
    this.syncStorageSession(profile);
    return profile;
  }

  /**
   * Register authorized new user with Email and Password
   */
  public async registerWithEmail(
    name: string,
    email: string,
    pass: string,
    requestedRole?: UserRole
  ): Promise<UserProfile> {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    
    // Update Firebase Auth user profile display name
    await updateProfile(credential.user, { displayName: name.trim() });

    const role = this.determineRoleForEmail(email, requestedRole);
    const colors = ['#101820', '#35D0BA', '#F5A623', '#2563EB', '#7C3AED', '#059669'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newProfile: UserProfile = {
      id: credential.user.uid,
      email: credential.user.email || email.trim(),
      displayName: name.trim() || email.split('@')[0],
      role,
      tenantId: DEFAULT_TENANT_ID,
      active: true,
      createdAt: new Date().toISOString(),
      avatarColor
    };

    // Store in Firestore
    try {
      await setDoc(doc(db, 'users', credential.user.uid), newProfile);
      // Also write to organization subcollection
      await setDoc(doc(db, 'organizations', DEFAULT_TENANT_ID, 'users', credential.user.uid), newProfile);
    } catch (fsErr) {
      console.warn('Advertencia guardando perfil en Firestore (usando respaldo local):', fsErr);
    }

    this.syncStorageSession(newProfile);
    return newProfile;
  }

  /**
   * One-click Google Sign-In
   */
  public async signInWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    const profile = await this.syncUserProfile(credential.user);
    this.syncStorageSession(profile);
    return profile;
  }

  /**
   * Send Password Reset Email
   */
  public async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  }

  /**
   * Sign Out
   */
  public async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  /**
   * Retrieve and sync user profile from Firestore or local fallback
   */
  public async syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
    const email = (user.email || '').toLowerCase().trim();
    const isBootstrap = BOOTSTRAP_ADMIN_EMAILS.includes(email);

    let profile: UserProfile | null = null;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        profile = snap.data() as UserProfile;
        // If user is bootstrap admin, ensure role is propietario
        if (isBootstrap && profile.role !== 'propietario') {
          profile.role = 'propietario';
          await updateDoc(userDocRef, { role: 'propietario' }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('No se pudo leer perfil desde Firestore, usando datos de sesión:', err);
    }

    if (!profile) {
      // Create profile for user
      const role: UserRole = isBootstrap ? 'propietario' : 'empleado';
      profile = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuario NEXO',
        role,
        tenantId: DEFAULT_TENANT_ID,
        active: true,
        createdAt: new Date().toISOString(),
        avatarColor: '#101820'
      };

      try {
        await setDoc(doc(db, 'users', user.uid), profile);
      } catch (err) {
        console.warn('Error al persistir perfil nuevo en Firestore:', err);
      }
    }

    return profile;
  }

  /**
   * Sync active Firebase user with the application's employee registry and storage
   */
  public syncStorageSession(profile: UserProfile): void {
    const existingEmployees = storageService.getEmployees();
    const existing = existingEmployees.find(e => e.id === profile.id || e.email.toLowerCase() === profile.email.toLowerCase());

    if (!existing) {
      // Add as active employee
      storageService.saveEmployee({
        id: profile.id,
        name: profile.displayName,
        email: profile.email,
        role: profile.role,
        active: profile.active,
        avatarColor: profile.avatarColor || '#35D0BA',
        lastActive: 'En este momento'
      });
      storageService.setCurrentEmployee(profile.id);
    } else {
      // Update role & sync
      storageService.saveEmployee({
        ...existing,
        name: profile.displayName,
        role: profile.role,
        active: profile.active
      });
      storageService.setCurrentEmployee(existing.id);
    }
  }

  /**
   * Listen to Firebase auth state changes
   */
  public onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  public getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}

export const authService = new AuthService();
