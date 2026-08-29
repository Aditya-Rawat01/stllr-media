"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotAdminToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const show = searchParams.get("error") === "not_admin";

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    }, 3500);
    return () => clearTimeout(t);
  }, [show, searchParams, router]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed bottom-6 left-6 z-[60]"
        >
          <div className="pointer-events-auto rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-700 shadow-lg">
            You are not admin - Access Denied
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
