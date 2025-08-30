"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    const register = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        const registration = await navigator.serviceWorker.register("/notification-sw.js");
        if (Notification.permission !== "granted") {
          await Notification.requestPermission();
        }
        if (Notification.permission !== "granted") return;

        const existing = await registration.pushManager.getSubscription();
        const subscription = existing ||
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string
            ),
          }));

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const sub = subscription.toJSON();
          await supabase.from("push_subscriptions").upsert({
            user_id: user.id,
            endpoint: sub.endpoint,
            p256dh: sub.keys?.p256dh,
            auth: sub.keys?.auth,
          });
        }
      } catch (err) {
        console.error("Service worker registration failed", err);
      }
    };
    register();
  }, []);
  return null;
}

