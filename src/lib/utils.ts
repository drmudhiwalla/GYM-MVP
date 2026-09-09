// Generate unique screening ID: DMW-YYYYMMDD-XXXX
export function generateScreeningId(): string {
  const now = new Date();
  const date = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DMW-${date}-${random}`;
}
