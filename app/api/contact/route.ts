import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { z } from "zod";
import { Resend } from "resend";
import { formatEnquiryType } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
    email: z.string().email(),
    phone: z.string().min(8).max(20),
    enquiryDetails: z.string().min(10).max(2000),
    enquiryType: z
        .enum([
            "general",
            "videography",
            "photography",
            "video_editing",
            "drone",
            "combo",
            "brand_campaign",
            "corporate",
        ])
        .default("general"),
});

export async function POST(req: Request) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success)
        return Response.json(
            { error: parsed.error.flatten() },
            { status: 400 },
        );

    const { email, phone, enquiryDetails, enquiryType } = parsed.data;

    // Format enquiry type for display
    const displayEnquiryType = formatEnquiryType(enquiryType);

    // 1. store lead
    let leadId: string;
    try {
        const rows = await db
            .insert(leads)
            .values({ email, phone, enquiryDetails, enquiryType })
            .returning({ id: leads.id });
        leadId = rows[0].id;
    } catch (e: any) {
        return Response.json(
            { error: "DB error", details: e.message },
            { status: 500 },
        );
    }

    // 2. send mails via Resend (if key present, else skip)
    const apiKey = process.env.RESEND_API_KEY;
    const from =
        process.env.RESEND_FROM || "Stllr Media <onboarding@resend.dev>";
    const adminTo = process.env.RESEND_ADMIN_TO || "stllrmedia@gmail.com";

    let emailStatus: string = "skipped (no RESEND_API_KEY)";
    if (apiKey) {
        try {
            const resend = new Resend(apiKey);
            // Resend returns {data, error} not throw — check both
            const cust = (await resend.emails.send({
                from,
                to: email,
                subject: "We received your enquiry — STLLR Media",
                html: `<p>Hi,</p><p>Thanks for reaching out about <b>${displayEnquiryType}</b>. We've received:</p><blockquote>${enquiryDetails}</blockquote><p>We'll contact you at ${phone} shortly.</p><p>— STLLR Media, weavers of light • stllrmedia@gmail.com</p>`,
            })) as any;
            if (cust.error)
                throw new Error(
                    `customer mail: ${cust.error.message || JSON.stringify(cust.error)}`,
                );

            const admin = (await resend.emails.send({
                from,
                to: adminTo,
                subject: `New lead: ${displayEnquiryType} — ${email}`,
                html: `<p>New lead ${leadId}</p><ul><li>Email: ${email}</li><li>Phone: ${phone}</li><li>Type: ${displayEnquiryType}</li><li>Details: ${enquiryDetails}</li></ul>`,
            })) as any;
            if (admin.error)
                throw new Error(
                    `admin mail: ${admin.error.message || JSON.stringify(admin.error)}`,
                );

            emailStatus = "sent";
        } catch (e: any) {
            emailStatus = `failed: ${e.message}`;
            // don't fail request — lead already stored
        }
    }

    return Response.json({ ok: true, leadId, emailStatus }, { status: 201 });
}

export async function GET() {
    return Response.json({
        status: "ok",
        hint: "POST {email, phone, enquiryDetails, enquiryType}",
    });
}
