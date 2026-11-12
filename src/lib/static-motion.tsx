import React from "react";

const MOTION_ONLY_PROPS = new Set([
  "animate",
  "initial",
  "exit",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileInView",
  "viewport",
  "layout",
  "layoutId",
  "layoutDependency",
  "onAnimationStart",
  "onAnimationComplete",
  "onHoverStart",
  "onHoverEnd",
]);

const motion = new Proxy(
  {},
  {
    get: (_target, element) =>
      React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
        const domProps = Object.fromEntries(
          Object.entries(props).filter(([key]) => key !== "children" && !MOTION_ONLY_PROPS.has(key))
        );
        return React.createElement(element as string, { ...domProps, ref }, props.children);
      }),
  }
) as any;

export { motion };

export function AnimatePresence({ children }: { children: React.ReactNode; [key: string]: unknown }) {
  return <>{children}</>;
}
