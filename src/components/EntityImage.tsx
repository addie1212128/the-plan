import { useEffect, useState } from "react";
import clsx from "clsx";

/** Turn a Blob into a live object URL, revoked on change/unmount. */
export function useObjectUrl(blob?: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

/** Presentational image for an entity portrait/cover. Renders nothing without a blob. */
export function EntityImage({
  blob,
  alt,
  className,
}: {
  blob?: Blob | null;
  alt: string;
  className?: string;
}) {
  const url = useObjectUrl(blob);
  if (!url) return null;
  return <img src={url} alt={alt} className={clsx("object-cover", className)} loading="lazy" />;
}
