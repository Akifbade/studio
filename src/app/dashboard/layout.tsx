
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AppUser extends User {
    role?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const view = searchParams.get('view') || 'admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
        } else {
            // Handle case where user exists in Auth but not Firestore
            setUser(firebaseUser);
        }
      } else {
        setUser(null);
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);


  const setView = (newView: 'admin' | 'driver') => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    router.push(`${pathname}?${params.toString()}`);
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        </div>
    );
  }

  if (!user) {
    // This state should ideally not be visible as the useEffect redirects.
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Delivery System</h1>
            <p id="header-subtitle" className="text-gray-500 mt-1">
              {view === 'admin' ? 'Assign, track, and manage all job file deliveries.' : 'View and complete your assigned deliveries.'}
            </p>
        </div>
        <div className="text-sm mt-4 sm:mt-0 text-right">
          <p className="font-medium">Welcome, <span id="user-display-name" className="font-bold text-gray-800">{user.displayName || user.email}</span> (<span id="user-role" className="capitalize text-gray-600">{user.role || 'User'}</span>)</p>
          <div className="flex items-center justify-end gap-4 mt-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setView('driver')} disabled={view === 'driver'}>Driver Dashboard</Button>
            <Button variant="default" size="sm" className="text-xs" onClick={() => setView('admin')} disabled={view === 'admin'}>Admin Panel</Button>
            <Button variant="secondary" size="sm" className="text-xs" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
