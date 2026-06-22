"use client";

import { useState } from "react";

/** Extrai o ID do arquivo de uma URL pública do Google Drive. */
export function driveFileId(url: string): string | null {
  const m = url.match(/\/d\/([^/]+)/) ?? url.match(/[?&]id=([^&]+)/);
  return m ? m[1] : null;
}

/**
 * Player de vídeo de um link público do Google Drive.
 * O arquivo é transmitido pelo nosso próprio proxy (/api/drive-video),
 * tornando-o same-origin: reproduz em um <video> nativo, com controles
 * de play/pause e barra de progresso, sem loop e sem nenhuma UI do Drive.
 */
export function DriveVideo({
  url,
  className = "",
}: {
  url: string;
  className?: string;
}) {
  const id = driveFileId(url);
  const [failed, setFailed] = useState(false);

  if (!id) {
    return (
      <div className={`grid place-items-center bg-cream-deep text-[10px] text-ink-soft ${className}`}>
        sem vídeo
      </div>
    );
  }

  const src = `/api/drive-video?id=${id}`;
  const poster = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;

  return (
    <div className={`overflow-hidden bg-black ${className}`}>
      {failed ? (
        <div className="grid h-full w-full place-items-center px-4 text-center text-xs font-semibold text-cream">
          Não foi possível reproduzir o vídeo
        </div>
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={src}
          poster={poster}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          preload="metadata"
          playsInline
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
}
