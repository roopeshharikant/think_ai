/** Shared presentational helpers reused across Forum components. */

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#8b5cf6"];

export function getAvatarColor(seed) {
    let hash = 0;
    const source = String(seed || "?");
    for (let i = 0; i < source.length; i += 1) {
        hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function getInitials(name) {
    const parts = String(name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

/** Relative time like "3h ago" / "2d ago" / a date for older items. */
export function timeAgo(isoDate) {
    const then = new Date(isoDate).getTime();
    if (Number.isNaN(then)) return "";
    const seconds = Math.max(Math.floor((Date.now() - then) / 1000), 0);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(then).toLocaleDateString();
}
