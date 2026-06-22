import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="text-center">
        <div className="text-[72px] font-black leading-none text-terracotta">404</div>
        <h2 className="mt-2 text-lg font-bold text-ink">Página não encontrada</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          O endereço acessado não existe no painel SISTEMATIZAÊ.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-2xl bg-forest px-5 py-2.5 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest-mid"
        >
          Voltar à Visão Geral
        </Link>
      </div>
    </div>
  );
}
