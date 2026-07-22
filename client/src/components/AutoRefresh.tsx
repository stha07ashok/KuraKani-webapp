"use client";

import { useEffect } from "react";

export default function AutoRefresh() {
  useEffect(() => {
    if (!sessionStorage.getItem("refreshed")) {
      sessionStorage.setItem("refreshed", "1");
      window.location.reload();
    }
  }, []);

  return null;
}
