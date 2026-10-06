"use client";

import { useParams as nextUseParams, usePathname, useRouter } from 'next/navigation';

type NavigateOptions = { replace?: boolean };

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      else if (to === 1) router.forward();
      return;
    }
    if (options?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useLocation() {
  return { pathname: usePathname() };
}

export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>>() {
  return nextUseParams<T>();
}
