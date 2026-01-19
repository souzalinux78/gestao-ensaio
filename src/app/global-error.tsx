'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Erro Crítico</h1>
            <p className="text-gray-700 mb-4">
              Ocorreu um erro crítico na aplicação.
            </p>
            <button
              onClick={reset}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
