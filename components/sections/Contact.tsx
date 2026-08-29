"use client";

import { useState } from "react";

type EnquiryType =
  | "general"
  | "videography"
  | "photography"
  | "video_editing"
  | "drone"
  | "combo"
  | "brand_campaign"
  | "corporate";

const ENQUIRY_OPTIONS: { value: EnquiryType; label: string }[] = [
  { value: "general", label: "General Enquiry" },
  { value: "videography", label: "Videography" },
  { value: "photography", label: "Photography" },
  { value: "video_editing", label: "Video Editing" },
  { value: "drone", label: "Drone" },
  { value: "combo", label: "Combo" },
  { value: "brand_campaign", label: "Brand Campaign" },
  { value: "corporate", label: "Corporate" },
];

type FieldErrors = Partial<Record<"email" | "phone" | "enquiryDetails" | "enquiryType" | "form", string>>;

export default function Contact() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enquiryType, setEnquiryType] = useState<EnquiryType>("general");
  const [enquiryDetails, setEnquiryDetails] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const charCount = enquiryDetails.length;

  function validateClient(): FieldErrors {
    const next: FieldErrors = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) next.email = "Email is required";
    else if (!emailRe.test(email.trim())) next.email = "Please enter a valid email address";

    const p = phone.trim();
    if (!p) next.phone = "Phone is required";
    else if (p.length < 8 || p.length > 20) next.phone = "Phone must be 8–20 characters";

    const d = enquiryDetails.trim();
    if (!d) next.enquiryDetails = "Please tell us a little about your project";
    else if (d.length < 10) next.enquiryDetails = "At least 10 characters";
    else if (d.length > 2000) next.enquiryDetails = "Maximum 2000 characters";

    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setServerMessage(null);
      setStatus("error");
      return;
    }

    setErrors({});
    setServerMessage(null);
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          enquiryDetails: enquiryDetails.trim(),
          enquiryType,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201 && data?.ok) {
        setStatus("success");
        setServerMessage(null);
        // keep values visible until success is acknowledged; reset after a short delay is handled via UI
        return;
      }

      if (res.status === 400) {
        // flattened zod: { fieldErrors: { email: [msg] }, formErrors: [] } or { error: flattened }
        const errObj = data?.error;
        const next: FieldErrors = {};
        let formMsg: string | null = null;

        if (errObj?.fieldErrors) {
          for (const k of Object.keys(errObj.fieldErrors)) {
            const arr = errObj.fieldErrors[k];
            if (Array.isArray(arr) && arr[0]) {
              const key = k as keyof FieldErrors;
              if (["email", "phone", "enquiryDetails", "enquiryType"].includes(key)) next[key] = arr[0];
              else formMsg = arr[0];
            }
          }
        } else if (errObj?.formErrors?.[0]) {
          formMsg = errObj.formErrors[0];
        } else if (typeof data?.error === "string") {
          formMsg = data.error;
        } else if (data?.error) {
          formMsg = "Please check the highlighted fields";
          // fallback: try to map generic
          if (data.error.email) next.email = Array.isArray(data.error.email) ? data.error.email[0] : String(data.error.email);
          if (data.error.phone) next.phone = Array.isArray(data.error.phone) ? data.error.phone[0] : String(data.error.phone);
          if (data.error.enquiryDetails) next.enquiryDetails = Array.isArray(data.error.enquiryDetails) ? data.error.enquiryDetails[0] : String(data.error.enquiryDetails);
        }

        if (Object.keys(next).length === 0 && !formMsg) formMsg = "Please check your details and try again.";
        setErrors(next);
        setServerMessage(formMsg);
        setStatus("error");
        return;
      }

      // 500 or other
      setStatus("error");
      setServerMessage("Something went wrong. Please try again or contact us directly at stllrmedia@gmail.com.");
    } catch {
      setStatus("error");
      setServerMessage("Something went wrong. Please try again or contact us directly at stllrmedia@gmail.com.");
    }
  }

  function resetForm() {
    setEmail("");
    setPhone("");
    setEnquiryType("general");
    setEnquiryDetails("");
    setErrors({});
    setServerMessage(null);
    setStatus("idle");
  }

  return (
    <section id="contact" aria-label="Contact" className="relative overflow-hidden bg-[#080808]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-[6vw]">
        {/* eyebrow — consistent */}
        <div className="flex items-center gap-4 pb-6 pt-12 sm:gap-5 sm:pb-7 sm:pt-14 lg:pt-16">
          <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.28em] text-[#f0ede8]/30">04</span>
          <span className="hidden h-px w-10 bg-[#f0ede8]/15 sm:block" aria-hidden="true" />
          <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.24em] text-[#f0ede8]/60 uppercase">Contact</span>
        </div>

        <div className="grid grid-cols-1 gap-10 py-10 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:py-16 xl:gap-16">
          {/* LEFT — editorial */}
          <div className="min-w-0">
            <h2
              className="font-[var(--font-bebas-neue)] leading-[0.86] tracking-[-0.02em] text-[#f0ede8]"
              style={{ fontSize: "clamp(2.8rem, 6.2vw, 5.4rem)" }}
            >
              LET’S MAKE
              <br />
              SOMETHING
              <br />
              THAT LASTS.
            </h2>
            <p className="mt-6 max-w-[420px] font-[var(--font-dm-sans)] text-[13.5px] leading-[1.7] text-[#f0ede8]/50 sm:text-[14px]">
              Tell us about the shoot, the brand, the deadline. We read every enquiry and reply within 24 hours.
            </p>

            <div className="mt-10 border-t border-[#1a1a1a] pt-8 sm:mt-12">
              <p className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] text-[#f0ede8]/25 uppercase">Studio</p>
              <p className="mt-3 font-[var(--font-dm-sans)] text-[14px] leading-[1.7] text-[#f0ede8]/70">New Delhi, India</p>
              <a
                href="mailto:stllrmedia@gmail.com"
                className="mt-1 inline-block border-b border-[#e63030]/60 pb-0.5 font-[var(--font-dm-sans)] text-[14px] font-medium text-[#f0ede8] transition-colors hover:border-[#e63030] hover:text-white"
              >
                stllrmedia@gmail.com
              </a>
            </div>

            {/* subtle meta */}
            <p className="mt-8 hidden font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/15 sm:block">
              Concept → Shoot → Grade → Deliver · PAN India
            </p>
          </div>

          {/* RIGHT — form card */}
          <div className="min-w-0">
            <div className="border border-[#1a1a1a] bg-[#0e0e0e]/60 p-5 sm:p-7 lg:p-8">
              {status === "success" ? (
                <div className="flex min-h-[420px] flex-col justify-center py-6" role="status" aria-live="polite">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1f8a4a]/30 bg-[#1f8a4a]/10 text-[#1f8a4a]">
                    <svg viewBox="0 0 16 16" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                      <path d="M3.5 8.2 L7 11.5 L12.5 4.5" />
                    </svg>
                  </div>
                  <h3 className="mt-6 font-[var(--font-bebas-neue)] text-[2rem] leading-none tracking-[0.01em] text-[#f0ede8]">Enquiry sent.</h3>
                  <p className="mt-3 max-w-[420px] font-[var(--font-dm-sans)] text-[14px] leading-[1.7] text-[#f0ede8]/60">
                    We’ll contact you within 24 hours. Check your email — we’ve sent a confirmation to <span className="text-[#f0ede8]">{email}</span>.
                  </p>
                  <p className="mt-2 font-[var(--font-dm-sans)] text-[12px] leading-[1.6] text-[#f0ede8]/35">
                    Didn’t get it? Check spam or write directly to <a href="mailto:stllrmedia@gmail.com" className="underline decoration-[#f0ede8]/20 underline-offset-4 hover:decoration-[#f0ede8]/40">stllrmedia@gmail.com</a>.
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-8 inline-flex w-fit items-center gap-2 border border-[#f0ede8]/15 px-5 py-2.5 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.18em] uppercase text-[#f0ede8]/70 transition-colors hover:border-[#f0ede8]/25 hover:text-[#f0ede8]"
                  >
                    Send another enquiry
                    <svg viewBox="0 0 11 11" width={9} height={9} fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
                      <path d="M2 8.5 L8.5 2 M8.5 2 H3.8 M8.5 2 V6.8" />
                    </svg>
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 sm:gap-6">
                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                    <div className="min-w-0">
                      <label htmlFor="contact-email" className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.16em] text-[#f0ede8]/40 uppercase">
                        Email <span className="text-[#f0ede8]/30">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "contact-email-error" : undefined}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email..."
                        className={[
                          "mt-2 w-full border bg-[#111] px-4 py-3 font-[var(--font-dm-sans)] text-[14px] text-[#f0ede8] placeholder:text-[#f0ede8]/25 outline-none transition-colors",
                          errors.email ? "border-[#e63030]/60 focus:border-[#e63030]" : "border-[#1f1f1f] focus:border-[#f0ede8]/20",
                        ].join(" ")}
                      />
                      <div className="min-h-[18px] pt-1.5">
                        {errors.email && (
                          <p id="contact-email-error" className="font-[var(--font-dm-sans)] text-[11px] leading-none text-[#e63030]" role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="contact-phone" className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.16em] text-[#f0ede8]/40 uppercase">
                        Phone <span className="text-[#f0ede8]/30">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className={[
                          "mt-2 w-full border bg-[#111] px-4 py-3 font-[var(--font-dm-sans)] text-[14px] text-[#f0ede8] placeholder:text-[#f0ede8]/25 outline-none transition-colors",
                          errors.phone ? "border-[#e63030]/60 focus:border-[#e63030]" : "border-[#1f1f1f] focus:border-[#f0ede8]/20",
                        ].join(" ")}
                      />
                      <div className="min-h-[18px] pt-1.5">
                        {errors.phone && (
                          <p id="contact-phone-error" className="font-[var(--font-dm-sans)] text-[11px] leading-none text-[#e63030]" role="alert">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enquiry Type */}
                  <div>
                    <label htmlFor="contact-type" className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.16em] text-[#f0ede8]/40 uppercase">
                      Enquiry Type
                    </label>
                    <div className="relative mt-2">
                      <select
                        id="contact-type"
                        value={enquiryType}
                        onChange={(e) => setEnquiryType(e.target.value as EnquiryType)}
                        className="w-full appearance-none border border-[#1f1f1f] bg-[#111] px-4 py-3 pr-10 font-[var(--font-dm-sans)] text-[14px] text-[#f0ede8] outline-none transition-colors focus:border-[#f0ede8]/20"
                      >
                        {ENQUIRY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value} className="bg-[#111]">
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[#f0ede8]/25" aria-hidden="true">
                        <svg viewBox="0 0 12 12" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.2}>
                          <path d="M2.5 4.5 L6 8 L9.5 4.5" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Enquiry Details */}
                  <div>
                    <label htmlFor="contact-details" className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.16em] text-[#f0ede8]/40 uppercase">
                      Enquiry Details <span className="text-[#f0ede8]/30">*</span>
                    </label>
                    <textarea
                      id="contact-details"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.enquiryDetails}
                      aria-describedby={errors.enquiryDetails ? "contact-details-error" : "contact-details-help"}
                      value={enquiryDetails}
                      onChange={(e) => setEnquiryDetails(e.target.value)}
                      placeholder="Tell us about your project, shoot, event or deadline..."
                      rows={6}
                      maxLength={2000}
                      className={[
                        "mt-2 w-full resize-y border bg-[#111] px-4 py-3 font-[var(--font-dm-sans)] text-[14px] leading-[1.6] text-[#f0ede8] placeholder:text-[#f0ede8]/20 outline-none transition-colors",
                        errors.enquiryDetails ? "border-[#e63030]/60 focus:border-[#e63030]" : "border-[#1f1f1f] focus:border-[#f0ede8]/20",
                      ].join(" ")}
                    />
                    <div className="flex items-start justify-between gap-4 pt-2">
                      <div className="min-h-[18px] flex-1">
                        {errors.enquiryDetails ? (
                          <p id="contact-details-error" className="font-[var(--font-dm-sans)] text-[11px] leading-none text-[#e63030]" role="alert">
                            {errors.enquiryDetails}
                          </p>
                        ) : (
                          <p id="contact-details-help" className="font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/20">
                            {charCount}/2000 — minimum 10 characters
                          </p>
                        )}
                      </div>
                      <span className="hidden font-[var(--font-dm-sans)] text-[11px] tabular-nums text-[#f0ede8]/15 sm:inline" aria-hidden="true">
                        {charCount >= 10 ? "✓" : ""}
                      </span>
                    </div>
                  </div>

                  {/* form-level error */}
                  {serverMessage && status === "error" && (
                    <div className="border border-[#e63030]/20 bg-[#e63030]/10 px-4 py-3" role="alert">
                      <p className="font-[var(--font-dm-sans)] text-[13px] leading-[1.6] text-[#ff8a8a]">{serverMessage}</p>
                    </div>
                  )}
                  {errors.form && (
                    <p className="font-[var(--font-dm-sans)] text-[13px] text-[#e63030]" role="alert">
                      {errors.form}
                    </p>
                  )}

                  {/* submit */}
                  <div className="flex flex-col gap-4 border-t border-[#1a1a1a] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      aria-busy={status === "loading"}
                      className="inline-flex w-full items-center justify-center gap-2 border border-[#f0ede8] bg-transparent px-7 py-3.5 font-[var(--font-dm-sans)] text-[11px] font-medium tracking-[0.18em] uppercase text-[#f0ede8] transition-colors hover:bg-[#f0ede8] hover:text-[#080808] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {status === "loading" ? (
                        <>
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" aria-hidden="true" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Enquiry
                          <svg viewBox="0 0 11 11" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                            <path d="M2 8.5 L8.5 2 M8.5 2 H3.4 M8.5 2 V7.2" />
                          </svg>
                        </>
                      )}
                    </button>
                    <p className="text-center font-[var(--font-dm-sans)] text-[11px] tracking-[0.08em] text-[#f0ede8]/25 sm:text-right">We reply within 24 hours.</p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* consistent bottom spacing — no trailing hairline */}
        <div className="h-12 sm:h-14 lg:h-16" aria-hidden="true" />
      </div>
    </section>
  );
}
