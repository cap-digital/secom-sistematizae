"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="card card-pad max-w-md text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-terracotta/10 text-terracotta text-2xl font-black">
          !
        </div>
        <h2 className="text-lg font-bold text-ink">Algo deu errado ao montar esta tela</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Ocorreu um erro inesperado. Você pode tentar recarregar — os dados da
          campanha continuam disponíveis.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-2xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream shadow-sm transition hover:bg-terracotta-deep"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
