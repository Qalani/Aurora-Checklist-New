/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    for (const task of tasks) {
      // TODO: send web push notification to the user
      console.log(`Send reminder for task ${task.id} to user ${task.user_id}`);
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
