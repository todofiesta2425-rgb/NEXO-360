import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService, UserProfile, translateAuthError } from '../services/authService';
import { UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isEmployee: boolean;
  isReadOnly: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, role?: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProfile = await authService.syncUserProfile(firebaseUser);
          setProfile(userProfile);
          authService.syncStorageSession(userProfile);
        } catch (err) {
          console.warn('Error al sincronizar perfil en onAuthStateChanged:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const userProfile = await authService.signInWithEmail(email, pass);
      setProfile(userProfile);
    } catch (err) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, requestedRole?: UserRole) => {
    setAuthError(null);
    try {
      const userProfile = await authService.registerWithEmail(name, email, pass, requestedRole);
      setProfile(userProfile);
    } catch (err) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const userProfile = await authService.signInWithGoogle();
      setProfile(userProfile);
    } catch (err) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    try {
      await authService.sendPasswordReset(email);
    } catch (err) {
      const msg = translateAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
  };

  const role: UserRole = profile?.role || 'empleado';
  const isAdmin = role === 'propietario' || role === 'administrador';
  const isEmployee = role === 'empleado';
  const isReadOnly = role === 'solo_lectura';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isEmployee,
        isReadOnly,
        loading,
        signInWithEmail,
        registerWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        signOut,
        authError,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
