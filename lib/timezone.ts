/**
 * Convert UTC date string to IST (Asia/Kolkata) display format
 */
export function toIST(isoString: string | Date): Date {
    const date =
        typeof isoString === "string" ? new Date(isoString) : isoString;
    // Create a formatter for IST timezone
    const istFormatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const parts = istFormatter.formatToParts(date);
    const istDate = new Date(
        parseInt(parts.find((p) => p.type === "year")?.value || "2000"),
        parseInt(parts.find((p) => p.type === "month")?.value || "1") - 1,
        parseInt(parts.find((p) => p.type === "day")?.value || "1"),
    );

    return istDate;
}

/**
 * Format date to IST string (YYYY-MM-DD)
 */
export function formatIST(isoString: string | Date): string {
    const date =
        typeof isoString === "string" ? new Date(isoString) : isoString;
    const istFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
    });
    return istFormatter.format(date);
}

/**
 * Get day of week name (IST)
 */
export function getDayName(isoString: string | Date): string {
    const date =
        typeof isoString === "string" ? new Date(isoString) : isoString;
    const dayFormatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
    });
    return dayFormatter.format(date);
}
