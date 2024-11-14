'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  signInWithGoogle,
  signOut,
  onAuthStateChanged
} from "@/src/lib/firebase/auth.js";
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
import { useRouter } from "next/navigation";
import { firebaseConfig } from "@/src/lib/firebase/config";

function useUserSession(initialUser) {
  const [user, setUser] = useState(initialUser)
  const router = useRouter()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const serializedFirebaseConfig = encodeURIComponent(JSON.stringify(firebaseConfig))
      const serviceWorkerUrl = `/auth-service-worker.js?firebaseConfig=${serializedFirebaseConfig}`
      navigator.serviceWorker
        .register(serviceWorkerUrl)
        .then((registration) => {
          console.log('scope is: ', registration.scope)
        })
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    onAuthStateChanged((authUser) => {
      if (user === undefined) return

      if (user?.email === authUser?.email) {
        router.refresh()
      }
    })
  }, [user])

  return user
}

export default function Header({ initialUser }) {

  const user = useUserSession(initialUser);

  const handleSignOut = event => {
    event.preventDefault();
    signOut();
  };

  const handleSignIn = event => {
    event.preventDefault();
    signInWithGoogle();
  };

  return (
    <header>
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>
      {user ? (
        <>
          <div className="profile">
            <p>
              <img className="profileImage" src={user.photoURL || "/profile.svg"} alt={user.email} />
              {user.displayName}
            </p>

            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>

                <li>
                  <a
                    href="#"
                    onClick={addFakeRestaurantsAndReviews}
                  >
                    Add sample restaurants
                  </a>
                </li>

                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="profile"><a href="#" onClick={handleSignIn}>
          <img src="/profile.svg" alt="A placeholder user image" />
          Sign In with Google
        </a></div>
      )}
    </header>
  );
}
