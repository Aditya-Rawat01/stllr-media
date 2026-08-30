"use client";

import { useState, useMemo } from "react";
import { formatIST, getDayName } from "@/lib/timezone";
import { formatBookingStatus } from "@/lib/format";

export interface Booking {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    customerName: string;
    status: string;
    serviceName?: string;
    city?: string;
    assignedStaffName?: string | null;
}

interface CalendarProps {
    bookings: Booking[];
}

export default function Calendar({ bookings }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const todayIST = formatIST(new Date());
    const isPastBooking = (bookingDate: string) =>
        formatIST(bookingDate) < todayIST;
    // Group bookings by date
    const bookingsByDate = useMemo(() => {
        const map = new Map<string, Booking[]>();
        bookings.forEach((booking) => {
            const dateStr = formatIST(booking.bookingDate);
            if (!map.has(dateStr)) map.set(dateStr, []);
            map.get(dateStr)!.push(booking);
        });
        return map;
    }, [bookings]);

    // Generate calendar dates for current month only
    const { calendarDates, monthYear, startingDayOfWeek } = useMemo(() => {
        const dates: Date[] = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // First day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();

        // Fill in days of month only (no null placeholders)
        for (let day = 1; day <= lastDay.getDate(); day++) {
            dates.push(new Date(year, month, day));
        }

        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        return {
            calendarDates: dates,
            monthYear: `${monthNames[month]} ${year}`,
            startingDayOfWeek: startingDay,
        };
    }, [currentMonth]);

    const statusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-900/30 text-green-400 border-l-green-500";
            case "pending":
                return "bg-yellow-900/30 text-yellow-300 border-l-yellow-500";
            case "cancelled":
                return "bg-red-900/30 text-red-400 border-l-red-500";
            default:
                return "bg-blue-900/30 text-blue-400 border-l-blue-500";
        }
    };

    const prevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
        );
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
        );
        setSelectedDate(null);
    };

    return (
        <div className="w-full">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={prevMonth}
                    className="h-9 w-9 flex items-center justify-center rounded border border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors text-[#f0ede8]"
                    aria-label="Previous month"
                >
                    <span className="text-lg">‹</span>
                </button>
                <h2 className="text-lg font-semibold text-[#f0ede8] min-w-[200px] text-center">
                    {monthYear}
                </h2>
                <button
                    onClick={nextMonth}
                    className="h-9 w-9 flex items-center justify-center rounded border border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors text-[#f0ede8]"
                    aria-label="Next month"
                >
                    <span className="text-lg">›</span>
                </button>
            </div>

            <div className="mb-4 flex justify-center gap-4 text-[10px] tracking-[0.12em] text-[#888888] uppercase">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" /> Upcoming</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400" /> Past</span>
            </div>

            {/* Desktop Calendar (7 columns with headers) */}
            <div className="hidden md:grid grid-cols-7 gap-1">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                        <div
                            key={day}
                            className="text-center font-semibold text-xs text-[#555555] p-2 mb-2"
                        >
                            {day}
                        </div>
                    ),
                )}

                {/* Calendar cells */}
                {calendarDates.map((date, idx) => {
                    const dateStr = formatIST(date);
                    const daybookings = bookingsByDate.get(dateStr) || [];
                    const isSelected = selectedDate === dateStr;
                    const hasPast = daybookings.some((booking) =>
                        isPastBooking(booking.bookingDate),
                    );
                    const hasUpcoming = daybookings.some(
                        (booking) => !isPastBooking(booking.bookingDate),
                    );

                    // Check if this is today
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isToday = date.getTime() === today.getTime();

                    // For first date, offset it to the correct day of week column
                    const style =
                        idx === 0
                            ? { gridColumn: startingDayOfWeek + 1 }
                            : undefined;

                    return (
                        <div
                            key={idx}
                            style={style}
                            onClick={() =>
                                setSelectedDate(isSelected ? null : dateStr)
                            }
                            className={`
                min-h-28 p-2 border rounded transition-all cursor-pointer
                ${
                    isToday
                        ? "border-[#e63030] bg-[#e63030]/10 hover:bg-[#e63030]/15"
                        : daybookings && daybookings.length > 0
                                                    ? hasUpcoming
                                                            ? "border-blue-400/50 bg-blue-950/30 hover:border-blue-400/80 hover:bg-blue-950/50"
                                                            : hasPast
                                                                ? "border-green-400/50 bg-green-950/30 hover:border-green-400/80 hover:bg-green-950/50"
                                                                : "border-[#1f1f1f] bg-[#111111]"
                          : "border-[#1f1f1f] bg-[#111111] hover:bg-[#1a1a1a]"
                }
                ${isSelected ? "ring-2 ring-[#e63030] border-[#e63030]" : ""}
              `}
                        >
                            <div
                                className={`text-xs sm:text-sm font-bold ${isToday ? "text-[#e63030]" : "text-[#f0ede8]"}`}
                            >
                                {date.getDate()}
                            </div>
                            {daybookings && daybookings.length > 0 && (
                                <div className="flex items-center gap-0.5 flex-wrap mt-1">
                                    {daybookings.slice(0, 3).map((b) => (
                                        <div
                                            key={b.id}
                                            className={`w-2 h-2 rounded-full ${isPastBooking(b.bookingDate) ? "bg-green-400" : "bg-blue-400"}`}
                                            title={`${b.customerName}`}
                                        />
                                    ))}
                                    {daybookings.length > 3 && (
                                        <span className="text-xs font-semibold text-[#e63030]">
                                            +{daybookings.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Calendar (3-4 columns with day labels on each cell) */}
            <div className="md:hidden grid grid-cols-3 sm:grid-cols-4 gap-1">
                {calendarDates.map((date, idx) => {
                    const dateStr = formatIST(date);
                    const daybookings = bookingsByDate.get(dateStr) || [];
                    const isSelected = selectedDate === dateStr;
                    const hasPast = daybookings.some((booking) =>
                        isPastBooking(booking.bookingDate),
                    );
                    const hasUpcoming = daybookings.some(
                        (booking) => !isPastBooking(booking.bookingDate),
                    );

                    // Check if this is today
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isToday = date.getTime() === today.getTime();

                    const dayName = getDayName(dateStr).substring(0, 3);

                    return (
                        <div
                            key={idx}
                            onClick={() =>
                                setSelectedDate(isSelected ? null : dateStr)
                            }
                            className={`
                min-h-20 p-1.5 border rounded transition-all cursor-pointer flex flex-col
                ${
                    isToday
                        ? "border-[#e63030] bg-[#e63030]/10 hover:bg-[#e63030]/15"
                        : daybookings && daybookings.length > 0
                                                    ? hasUpcoming
                                                            ? "border-blue-400/50 bg-blue-950/30 hover:border-blue-400/80 hover:bg-blue-950/50"
                                                            : hasPast
                                                                ? "border-green-400/50 bg-green-950/30 hover:border-green-400/80 hover:bg-green-950/50"
                                                                : "border-[#1f1f1f] bg-[#111111]"
                          : "border-[#1f1f1f] bg-[#111111] hover:bg-[#1a1a1a]"
                }
                ${isSelected ? "ring-2 ring-[#e63030] border-[#e63030]" : ""}
              `}
                        >
                            <div className="text-xs font-medium text-[#888888]">
                                {dayName}
                            </div>
                            <div
                                className={`text-xs font-bold ${isToday ? "text-[#e63030]" : "text-[#f0ede8]"}`}
                            >
                                {date.getDate()}
                            </div>
                            {daybookings && daybookings.length > 0 && (
                                <div className="flex items-center gap-0.5 flex-wrap mt-0.5">
                                    {daybookings.slice(0, 2).map((b) => (
                                        <div
                                            key={b.id}
                                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isPastBooking(b.bookingDate) ? "bg-green-400" : "bg-blue-400"}`}
                                            title={`${b.customerName}`}
                                        />
                                    ))}
                                    {daybookings.length > 2 && (
                                        <span className="text-[10px] font-semibold text-[#e63030]">
                                            +{daybookings.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Booking details for selected date */}
            {selectedDate && bookingsByDate.get(selectedDate) && (
                <div className="mt-6 p-4 rounded border border-[#1f1f1f] bg-[#111111]">
                    <h3 className="font-semibold text-base mb-4 text-[#f0ede8]">
                        {selectedDate} — {getDayName(selectedDate)}
                    </h3>

                    <div className="space-y-3">
                        {bookingsByDate.get(selectedDate)!.map((booking) => (
                            <div
                                key={booking.id}
                                className={`p-3 rounded border-l-4 ${isPastBooking(booking.bookingDate) ? "bg-green-900/30 text-green-300 border-l-green-500" : "bg-blue-900/30 text-blue-300 border-l-blue-500"}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-[#f0ede8]">
                                            {booking.customerName}
                                        </p>
                                        <p className="text-xs text-[#888888]">
                                            {booking.startTime} -{" "}
                                            {booking.endTime}
                                        </p>
                                        {booking.serviceName && (
                                            <p className="text-xs text-[#888888]">
                                                {booking.serviceName}
                                            </p>
                                        )}
                                        {booking.city && (
                                            <p className="text-xs text-[#888888]">
                                                {booking.city}
                                            </p>
                                        )}
                                        {booking.assignedStaffName && (
                                            <p className="mt-1 text-xs text-green-400">
                                                Assigned to: {booking.assignedStaffName}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-[#1a1a1a] border border-[#1f1f1f] rounded text-[#f0ede8]">
                                        {formatBookingStatus(booking.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
