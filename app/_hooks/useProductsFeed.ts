"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Product } from "../data/mockData";

type Options = {
  endpoint: string;
  fallbackProducts?: Product[];
  pollingMs?: number;
};

export function useProductsFeed({ endpoint, fallbackProducts, pollingMs = 60000 }: Options) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const productsRef = useRef(products);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const refresh = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error("load_failed");

      const json = (await res.json().catch(() => null)) as null | { products?: Product[] };
      const nextProducts = Array.isArray(json?.products) ? json.products : [];

      if (!mountedRef.current) return;
      setProducts(nextProducts);
      setError(null);
    } catch {
      if (!mountedRef.current) return;
      if (fallbackProducts) {
        setProducts(fallbackProducts);
        setError(`โหลดข้อมูลจาก ${endpoint} ไม่สำเร็จ แสดงข้อมูลสำรองแทน`);
      } else if (!productsRef.current.length) {
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  }, [endpoint, fallbackProducts]);

  useEffect(() => {
    mountedRef.current = true;
    const initialLoad = window.setTimeout(() => {
      void refresh(false);
    }, 0);

    const onFocus = () => void refresh(true);
    window.addEventListener("focus", onFocus);

    const interval = window.setInterval(() => {
      void refresh(true);
    }, pollingMs);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(initialLoad);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(interval);
    };
  }, [pollingMs, refresh]);

  return { products, loading, error, refresh };
}
