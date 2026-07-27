import React from "react";

export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80";

export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_PRODUCT_IMAGE
) => {
  const target = e.currentTarget;
  if (target.src !== fallback) {
    target.onerror = null;
    target.src = fallback;
  }
};
