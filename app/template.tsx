import type { ReactNode } from "react";
import { PageEnter } from "@/components/PageEnter/PageEnter";

export default function Template({ children }: { children: ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}
