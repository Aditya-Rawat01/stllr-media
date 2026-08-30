"use client";

import { useState } from "react";

export type StaffMember = {
    id: string;
    employeeNumber: string | null;
    name: string;
    role: string;
    workDescription: string | null;
    isActive: boolean;
};

type AssignableLead = {
    id: string;
    email: string;
    enquiryType: string;
    assignedStaffId?: string | null;
    assignedStaffName?: string | null;
};

type AssignableClient = {
    id: string;
    name: string | null;
    service: string | null;
    bookingDate: string;
    assignedStaffId?: string | null;
    assignedStaffName?: string | null;
};

const roles = ["photographer", "videographer", "editor", "drone_operator", "manager"] as const;

function formatProjectDate(iso: string) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
}

export default function StaffManager({
    staff,
    leads,
    clients,
    onChanged,
}: {
    staff: StaffMember[];
    leads: AssignableLead[];
    clients: AssignableClient[];
    onChanged: () => Promise<void>;
}) {
    const [form, setForm] = useState({ employeeNumber: "", name: "", role: "photographer", workDescription: "" });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [draftAssignments, setDraftAssignments] = useState<Record<string, string>>({});

    const createEmployee = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch("/api/admin/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Could not create employee");
            setForm({ employeeNumber: "", name: "", role: "photographer", workDescription: "" });
            setMessage("Employee added");
            await onChanged();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not create employee");
        } finally {
            setSaving(false);
        }
    };

    const setDraftAssignment = async (type: "lead" | "booking", recordId: string, staffId: string) => {
        setDraftAssignments((current) => ({ ...current, [`${type}:${recordId}`]: staffId }));
    };

    const confirmAssignments = async () => {
        const changes = Object.entries(draftAssignments);
        if (changes.length === 0) return;
        setSaving(true);
        setMessage(null);
        try {
            await Promise.all(changes.map(async ([key, staffId]) => {
                const [type, recordId] = key.split(":") as ["lead" | "booking", string];
                const response = await fetch("/api/admin/staff", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ type, recordId, staffId: staffId || null }),
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error || "Could not update assignment");
            }));
            setDraftAssignments({});
            setMessage(`${changes.length} assignment${changes.length === 1 ? "" : "s"} confirmed`);
            await onChanged();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not update assignments");
        } finally {
            setSaving(false);
        }
    };

    const getAssignment = (type: "lead" | "booking", recordId: string, savedId?: string | null) =>
        draftAssignments[`${type}:${recordId}`] ?? savedId ?? "";

    return (
        <section className="border-t border-[#1a1a1a] pt-8 sm:pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                    <h2 className="font-[var(--font-bebas-neue)] text-[1.55rem] tracking-[-0.01em] text-[#f0ede8]">People &amp; assignments</h2>
                    <p className="mt-2 max-w-[620px] font-[var(--font-dm-sans)] text-[12px] leading-[1.6] text-[#f0ede8]/30">
                        Add employees, record what they do, then assign them to a lead or active client project.
                    </p>
                </div>
                <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/25 uppercase">{staff.length} employees</span>
            </div>

            <form onSubmit={createEmployee} className="mt-6 grid gap-3 border border-[#1a1a1a] bg-[#0a0a0a] p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1.4fr_1fr_2fr_auto]">
                <input required value={form.employeeNumber} onChange={(event) => setForm({ ...form, employeeNumber: event.target.value })} placeholder="Employee number" className="border border-[#1f1f1f] bg-[#0e0e0e] px-3 py-2 text-[12px] text-[#f0ede8] outline-none placeholder:text-[#f0ede8]/25 focus:border-[#e63030]/50" />
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" className="border border-[#1f1f1f] bg-[#0e0e0e] px-3 py-2 text-[12px] text-[#f0ede8] outline-none placeholder:text-[#f0ede8]/25 focus:border-[#e63030]/50" />
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="border border-[#1f1f1f] bg-[#0e0e0e] px-3 py-2 text-[12px] text-[#f0ede8] outline-none focus:border-[#e63030]/50">
                    {roles.map((role) => <option key={role} value={role}>{role.replace("_", " ")}</option>)}
                </select>
                <input required value={form.workDescription} onChange={(event) => setForm({ ...form, workDescription: event.target.value })} placeholder="What they do" className="border border-[#1f1f1f] bg-[#0e0e0e] px-3 py-2 text-[12px] text-[#f0ede8] outline-none placeholder:text-[#f0ede8]/25 focus:border-[#e63030]/50" />
                <button disabled={saving} className="border border-[#e63030]/40 bg-[#e63030]/10 px-4 py-2 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.12em] text-[#f0ede8] uppercase transition-colors hover:bg-[#e63030]/20 disabled:opacity-50">{saving ? "Adding..." : "Add employee"}</button>
                {message && <p className="text-[11px] text-[#4ade80] sm:col-span-2 lg:col-span-5">{message}</p>}
            </form>

            {staff.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {staff.map((employee) => (
                        <div key={employee.id} className="border border-[#1a1a1a] bg-[#0e0e0e] p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[13px] font-medium text-[#f0ede8]">{employee.name}</p>
                                    <p className="mt-1 text-[10px] tracking-[0.12em] text-[#e63030] uppercase">{employee.employeeNumber || "No number"}</p>
                                </div>
                                <span className="border border-[#f0ede8]/10 px-2 py-1 text-[10px] text-[#f0ede8]/45 uppercase">{employee.role.replace("_", " ")}</span>
                            </div>
                            <p className="mt-3 text-[11px] leading-[1.5] text-[#f0ede8]/40">{employee.workDescription || "No work description"}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {leads.filter((lead) => getAssignment("lead", lead.id, lead.assignedStaffId) === employee.id).map((lead) => <span key={`lead-${lead.id}`} className="border border-[#e63030]/20 bg-[#e63030]/5 px-2 py-1 text-[10px] text-[#f0ede8]/55">Lead · {lead.email}</span>)}
                                {clients.filter((client) => getAssignment("booking", client.id, client.assignedStaffId) === employee.id).map((client) => <span key={`booking-${client.id}`} className="border border-[#39c16c]/20 bg-[#39c16c]/5 px-2 py-1 text-[10px] text-[#f0ede8]/55">Project · {client.name || "Unnamed"} · {formatProjectDate(client.bookingDate)}</span>)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-[#e63030]/20 bg-[#e63030]/5 px-4 py-3 sm:px-5">
                <div>
                    <p className="text-[10px] font-medium tracking-[0.14em] text-[#e63030] uppercase">Assignment changes</p>
                    <p className="mt-1 text-[11px] text-[#f0ede8]/55">{Object.keys(draftAssignments).length ? `${Object.keys(draftAssignments).length} pending assignment${Object.keys(draftAssignments).length === 1 ? "" : "s"}` : "Choose employees below, then confirm all changes."}</p>
                </div>
                <button type="button" disabled={saving || Object.keys(draftAssignments).length === 0} onClick={confirmAssignments} className="border border-[#e63030]/50 bg-[#e63030] px-4 py-2 text-[10px] font-medium tracking-[0.12em] text-white uppercase transition-colors hover:bg-[#c92525] disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Confirming..." : "Confirm assignments"}</button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <AssignmentList title="Assign leads" empty="No leads to assign" items={leads.map((lead) => ({ id: lead.id, label: lead.email, detail: lead.enquiryType, staffId: getAssignment("lead", lead.id, lead.assignedStaffId) }))} staff={staff} onAssign={(recordId, staffId) => setDraftAssignment("lead", recordId, staffId)} />
                <AssignmentList title="Assign active projects" empty="No active projects to assign" items={[...clients].sort((firstClient, secondClient) => new Date(firstClient.bookingDate).getTime() - new Date(secondClient.bookingDate).getTime()).map((client) => ({ id: client.id, label: client.name || "Unnamed client", detail: `${client.service || "Project"} · ${formatProjectDate(client.bookingDate)}`, staffId: getAssignment("booking", client.id, client.assignedStaffId) }))} staff={staff} onAssign={(recordId, staffId) => setDraftAssignment("booking", recordId, staffId)} scrollable />
            </div>
        </section>
    );
}

function AssignmentList({
    title,
    empty,
    items,
    staff,
    onAssign,
    scrollable = false,
}: {
    title: string;
    empty: string;
    items: { id: string; label: string; detail: string; staffId?: string | null }[];
    staff: StaffMember[];
    onAssign: (recordId: string, staffId: string) => Promise<void>;
    scrollable?: boolean;
}) {
    return (
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4 sm:p-5">
            <h3 className="text-[10px] tracking-[0.14em] text-[#f0ede8]/35 uppercase">{title}</h3>
            {items.length === 0 ? <p className="mt-4 text-[12px] text-[#f0ede8]/25">{empty}</p> : (
                <div className={["mt-3 space-y-2", scrollable ? "max-h-[360px] overflow-y-auto pr-1" : ""].join(" ")}>
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 border border-[#1f1f1f] bg-[#0e0e0e] px-3 py-2">
                            <div className="min-w-0">
                                <p className="truncate text-[12px] text-[#f0ede8]/70">{item.label}</p>
                                <p className="mt-0.5 text-[10px] tracking-[0.08em] text-[#f0ede8]/25 uppercase">{item.detail}</p>
                            </div>
                            <select value={item.staffId || ""} disabled={staff.length === 0} onChange={(event) => onAssign(item.id, event.target.value)} className="max-w-[46%] border border-[#1f1f1f] bg-[#111111] px-2 py-1.5 text-[10px] text-[#f0ede8]/65 outline-none">
                                <option value="">Unassigned</option>
                                {staff.filter((employee) => employee.isActive).map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeNumber || "—"} · {employee.name}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
