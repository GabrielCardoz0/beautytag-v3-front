export function sanitizePassword(value: string): string {
  return value.replace(/[./\\]/g, '');
}

export function formatCPF(value: string): string {
  const c = value.replace(/\D/g, '').slice(0, 11);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0, 3)}.${c.slice(3)}`;
  if (c.length <= 9) return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}`;
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

export function formatCEP(value: string): string {
  const c = value.replace(/\D/g, '').slice(0, 8);
  if (c.length <= 5) return c;
  return `${c.slice(0, 5)}-${c.slice(5)}`;
}

export function formatPhone(value: string): string {
  const c = value.replace(/\D/g, '').slice(0, 11);
  if (c.length <= 2) return c;
  if (c.length <= 7) return `(${c.slice(0, 2)})${c.slice(2)}`;
  return `(${c.slice(0, 2)})${c.slice(2, 7)}-${c.slice(7)}`;
}

export function formatCNPJ(value: string): string {
  const c = value.replace(/\D/g, '').slice(0, 14);
  if (c.length <= 2) return c;
  if (c.length <= 5) return `${c.slice(0, 2)}.${c.slice(2)}`;
  if (c.length <= 8) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5)}`;
  if (c.length <= 12) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8)}`;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}
