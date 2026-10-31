"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register useGSAP with GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * useReveal - Page content on route change
 * Opacity 0 to 1 and 6px rise, 0.2s, power2.out
 */
export function useReveal(targetRef: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
      );
    },
    { scope: targetRef, dependencies: [] }
  );
}

/**
 * useStagger - First 20 table rows after data arrives
 * Opacity 0 to 1, 0.02s stagger, 0.18s per row
 */
export function useStagger(
  scopeRef: React.RefObject<HTMLElement | null>,
  selector: string,
  deps: unknown[] = []
) {
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope || prefersReducedMotion()) return;

      const items = scope.querySelectorAll(selector);
      if (!items.length) return;

      // Limit to first 20 items
      const targetItems = Array.from(items).slice(0, 20);

      gsap.fromTo(
        targetItems,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.18,
          stagger: 0.02,
          ease: "power1.out",
        }
      );
    },
    { scope: scopeRef, dependencies: deps }
  );
}

/**
 * useCountUp - KpiLedger values
 * Number tween from previous value to new value, 0.6s, power1.out
 */
export function useCountUp(
  targetRef: React.RefObject<HTMLElement | null>,
  value: number,
  format?: (n: number) => string
) {
  const prevValue = useRef(0);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = format ? format(value) : String(value);
      prevValue.current = value;
      return;
    }

    const obj = { val: prevValue.current };
    const tween = gsap.to(obj, {
      val: value,
      duration: 0.6,
      ease: "power1.out",
      onUpdate: () => {
        if (el) {
          el.textContent = format ? format(obj.val) : String(Math.round(obj.val));
        }
      },
    });

    prevValue.current = value;
    return () => {
      tween.kill();
    };
  }, [value, format, targetRef]);
}

/**
 * useStepperFill - StateStepper
 * Current step fill scales on X from 0 to 1 when state changes, 0.3s, power2.out
 */
export function useStepperFill(
  targetRef: React.RefObject<HTMLElement | null>,
  index: number
) {
  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.3, ease: "power2.out" }
      );
    },
    { scope: targetRef, dependencies: [index] }
  );
}

/**
 * useDrawer - Drawer slide on X from 100% to 0, 0.25s, power2.out
 */
export function useDrawer(
  targetRef: React.RefObject<HTMLElement | null>,
  open: boolean
) {
  useGSAP(
    () => {
      const el = targetRef.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { x: open ? "0%" : "100%" });
        return;
      }

      if (open) {
        gsap.fromTo(
          el,
          { x: "100%" },
          { x: "0%", duration: 0.25, ease: "power2.out" }
        );
      } else {
        gsap.to(el, { x: "100%", duration: 0.2, ease: "power2.in" });
      }
    },
    { scope: targetRef, dependencies: [open] }
  );
}

/**
 * useDrawSeries - BarSeries
 * Bars scale on Y from 0 to full, 0.03s stagger, 0.4s, power2.out
 */
export function useDrawSeries(
  scopeRef: React.RefObject<SVGSVGElement | null>,
  deps: unknown[] = []
) {
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope || prefersReducedMotion()) return;

      const bars = scope.querySelectorAll(".bar-series-rect");
      if (!bars.length) return;

      gsap.fromTo(
        bars,
        { scaleY: 0, transformOrigin: "bottom center" },
        {
          scaleY: 1,
          duration: 0.4,
          stagger: 0.03,
          ease: "power2.out",
        }
      );
    },
    { scope: scopeRef, dependencies: deps }
  );
}
