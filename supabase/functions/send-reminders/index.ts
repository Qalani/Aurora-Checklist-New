/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.9";

type ReminderTask = {
  id: string;
  user_id: string;
  title: string;
  reminder_time: string;
};

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date().toISOString();
  const { data: tasks } = await supabase
    .from<ReminderTask>("tasks")
    .select("id, user_id, title, reminder_time")
    .lte("reminder_time", now)
    .eq("reminder_sent", false);

  if (tasks) {
    webpush.setVapidDetails(
      Deno.env.get("WEB_PUSH_CONTACT") || "mailto:example@example.com",
      Deno.env.get("WEB_PUSH_PUBLIC_KEY")!,
      Deno.env.get("WEB_PUSH_PRIVATE_KEY")!
    );

    for (const task of tasks) {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", task.user_id);

      if (subs) {
        for (const sub of subs) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              JSON.stringify({ title: "Task Reminder", body: task.title })
            );
          } catch (err) {
            // Remove invalid subscriptions
            if ((err as { statusCode?: number }).statusCode === 410) {
              await supabase
                .from("push_subscriptions")
                .delete()
                .eq("endpoint", sub.endpoint);
            }
            console.error(err);
          }
        }
      }
    }

    await supabase
      .from("tasks")
      .update({ reminder_sent: true })
      .in(
        "id",
        tasks.map((t) => t.id)
      );
  }

  return new Response(
    JSON.stringify({ sent: tasks?.length ?? 0 }),
    { headers: { "Content-Type": "application/json" } }
  );
});
