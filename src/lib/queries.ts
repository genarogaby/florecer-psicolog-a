import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function run<T>(p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  return data as T;
}

export const patientsQ = queryOptions({
  queryKey: ["patients"],
  queryFn: () => run(supabase.from("patients").select("*").order("full_name")),
});

export const appointmentsQ = queryOptions({
  queryKey: ["appointments"],
  queryFn: () => run(supabase.from("appointments").select("*, patients(full_name)").order("start_at")),
});

export const paymentsQ = queryOptions({
  queryKey: ["payments"],
  queryFn: () => run(supabase.from("payments").select("*, patients(full_name)").order("paid_at", { ascending: false })),
});

export const requestsQ = queryOptions({
  queryKey: ["requests"],
  queryFn: () => run(supabase.from("booking_requests").select("*").order("created_at", { ascending: false })),
});

export const notesQ = (patientId: string) =>
  queryOptions({
    queryKey: ["notes", patientId],
    queryFn: () => run(supabase.from("session_notes").select("*").eq("patient_id", patientId).order("created_at", { ascending: false })),
  });

export const profileQ = (id: string) =>
  queryOptions({
    queryKey: ["profile", id],
    queryFn: () => run(supabase.from("profiles").select("*").eq("id", id).maybeSingle()),
  });
