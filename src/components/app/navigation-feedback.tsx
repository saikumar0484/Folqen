"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

function isInternalNavigationAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
  if (!anchor) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href) return false;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  return href.startsWith("/") || href.startsWith(window.location.origin);
}

export function NavigationFeedback() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isInternalNavigationAnchor(event.target)) return;
      setPending(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPending(false), 9000);
    }

    function onSubmit() {
      setPending(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPending(false), 9000);
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const clear = setTimeout(() => setPending(false), 260);
    return () => clearTimeout(clear);
  }, [pathname, pending]);

  useEffect(() => {
    if (!pending) return;
    document.body.style.cursor = "progress";
    return () => {
      document.body.style.cursor = "";
    };
  }, [pending]);

  return (
    <>
      {pending ? <div className="route-progress" /> : null}
      {pending ? (
        <div className="pointer-events-none fixed right-4 top-4 z-[95] hidden items-center gap-2 rounded-xl border border-white/12 bg-[#0b1118]/90 px-3 py-2 text-xs text-muted-foreground shadow-2xl backdrop-blur-xl sm:flex">
          <span className="app-loader">
            <Loader2 className="h-3.5 w-3.5 text-neon" />
          </span>
          Loading
        </div>
      ) : null}
    </>
  );
}
