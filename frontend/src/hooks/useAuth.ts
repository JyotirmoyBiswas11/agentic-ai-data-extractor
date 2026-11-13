import { useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';
import type { UserProfile } from '../types';

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Listen to Firestore profile updates (pmtool database)
      const userDocRef = doc(db, 'users', currentUser.uid);
      const unsubscribeDoc = onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          } else {
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: null,
              plan: 'free',
            });
          }
          setLoading(false);
        },
        (error) => {
          console.warn('[useAuth] Profile snapshot error:', error);
          setLoading(false);
        }
      );

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, [setUser, setProfile, setLoading]);

  const login = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
    reset();
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
