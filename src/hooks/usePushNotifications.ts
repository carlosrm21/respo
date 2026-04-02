'use client';

import { useState, useEffect, useCallback } from 'react';

function urlBase64ToUint8Array(base64String: string): Buffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Buffer.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
    const [supported, setSupported] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const ok = 'serviceWorker' in navigator && 'PushManager' in window;
        setSupported(ok);
        if (ok) checkExistingSubscription();
    }, []);

    const checkExistingSubscription = async () => {
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            setSubscribed(!!sub);
        } catch {}
    };

    const subscribe = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Register service worker
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Request notification permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setError('Permiso de notificaciones denegado');
                setLoading(false);
                return false;
            }

            // Get VAPID public key
            const res = await fetch('/api/push/subscribe');
            const { publicKey } = await res.json();

            // Subscribe
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
            });

            // Send subscription to server
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription),
            });

            setSubscribed(true);
            setLoading(false);
            return true;
        } catch (err: any) {
            setError(err?.message || 'Error al suscribirse');
            setLoading(false);
            return false;
        }
    }, []);

    const unsubscribe = useCallback(async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setSubscribed(false);
        } catch {}
        setLoading(false);
    }, []);

    return { supported, subscribed, loading, error, subscribe, unsubscribe };
}

// Helper to send a push notification (called from any component)
export async function sendPushNotification(title: string, body: string) {
    try {
        await fetch('/api/push/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body }),
        });
    } catch (err) {
        console.error('Error sending push notification:', err);
    }
}
