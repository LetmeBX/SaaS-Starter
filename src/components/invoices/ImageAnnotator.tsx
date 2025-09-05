"use client";

import { useMemo } from "react";

interface Box { key: string; bbox: [number, number, number, number]; color?: string }

export function ImageAnnotator({
  imageUrl,
  boxes,
  activeKey,
}: {
  imageUrl: string;
  boxes: Box[];
  activeKey?: string;
}) {
  const overlayBoxes = useMemo(() => boxes || [], [boxes]);

  return (
    <div className="relative w-full h-[70vh] overflow-hidden border rounded">
      {imageUrl?.endsWith(".pdf") ? (
        <embed src={imageUrl} type="application/pdf" className="w-full h-full" />
      ) : (
        <img src={imageUrl} alt="preview" className="w-full h-full object-contain" />
      )}
      <div className="pointer-events-none absolute inset-0">
        {overlayBoxes.map((b, i) => {
          const [x, y, w, h] = b.bbox;
          const border = b.key === activeKey ? "ring-2 ring-blue-500" : "border";
          return (
            <div
              key={`${b.key}-${i}`}
              className={`absolute ${border} border-blue-400/60 bg-blue-400/10`}
              style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
