export function HoursBadge({hours}:{hours:number[]}){return <span className="rounded bg-cyan/10 px-2 py-1 text-xs text-cyan">{hours.join(', ')}</span>}
