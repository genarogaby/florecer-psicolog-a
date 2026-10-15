export const money = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export const dateOnly = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(iso));

/** Sum of payments minus price of completed appointments; negative = patient owes. */
export function balance(payments: { amount: number }[], appts: { price: number; status: string }[]) {
  const paid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const charged = appts.filter((a) => a.status === "completada").reduce((s, a) => s + Number(a.price), 0);
  return paid - charged;
}

export function fields<K extends string>(form: HTMLFormElement, keys: K[]): Record<K, string> {
  const fd = new FormData(form);
  return Object.fromEntries(keys.map((k) => [k, String(fd.get(k) ?? "")])) as Record<K, string>;
}
