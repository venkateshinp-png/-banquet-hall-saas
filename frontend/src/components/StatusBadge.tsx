interface Props {
  status: string;
}

function getStatusStyles(status: string): string {
  const upper = status.toUpperCase();
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

  // Pending - yellow
  if (upper === 'PENDING') {
    return `${base} bg-amber-100 text-amber-800`;
  }

  // Approved / Confirmed / Success - green
  if (['APPROVED', 'CONFIRMED', 'SUCCESS'].includes(upper)) {
    return `${base} bg-emerald-100 text-emerald-800`;
  }

  // Rejected / Cancelled / Failed - red
  if (['REJECTED', 'CANCELLED', 'FAILED'].includes(upper)) {
    return `${base} bg-red-100 text-red-800`;
  }

  // On Hold / Completed / Refunded - gray/blue
  if (['ON_HOLD', 'COMPLETED', 'REFUNDED'].includes(upper)) {
    return `${base} bg-slate-100 text-slate-700`;
  }

  // Default fallback
  return `${base} bg-slate-100 text-slate-600`;
}

export default function StatusBadge({ status }: Props) {
  return <span className={getStatusStyles(status)}>{status}</span>;
}
