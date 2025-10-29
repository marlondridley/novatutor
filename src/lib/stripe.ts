
'use server';

import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

// IMPORTANT: Replace with your actual Stripe Price ID for the $12.99/month plan with a 10-day trial.
const STRIPE_PRICE_ID = 'price_1SCYwwGxHdRwEkVK4k4b6Iw0'; 

export async function createCheckoutSession(userId: string): Promise<string | null> {
    const checkoutSessionRef = doc(db, 'customers', userId, 'checkout_sessions', STRIPE_PRICE_ID);
    
    await setDoc(checkoutSessionRef, {
        price: STRIPE_PRICE_ID,
        success_url: `${window.location.origin}/dashboard`,
        cancel_url: `${window.location.origin}/pricing`,
        trial_period_days: 10,
        allow_promotion_codes: true,
    });

    return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(checkoutSessionRef, (snap) => {
            const { error, url } = snap.data() || {};
            if (error) {
                unsubscribe();
                reject(new Error(`An error occurred: ${error.message}`));
            }
            if (url) {
                unsubscribe();
                resolve(url);
            }
        }, reject);
    });
}

export async function createCustomerPortalSession(userId: string): Promise<string | null> {
    const portalSessionRef = doc(db, 'customers', userId, 'portals', 'return');

    await setDoc(portalSessionRef, {
        return_url: `${window.location.origin}/dashboard`,
    });

    return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(portalSessionRef, (snap) => {
            const { error, url } = snap.data() || {};
            if (error) {
                unsubscribe();
                reject(new Error(`An error occurred: ${error.message}`));
            }
            if (url) {
                unsubscribe();
                resolve(url);
            }
        }, reject);
    });
}
