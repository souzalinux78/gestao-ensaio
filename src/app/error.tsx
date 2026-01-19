'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para ajudar no debug
    console.error('Erro na aplicação:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Erro</h1>
        <p className="text-gray-700 mb-4">
          Ocorreu um erro na aplicação.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
            <strong>Detalhes (apenas em desenvolvimento):</strong>
            <pre className="mt-2 text-xs overflow-auto">
              {error.message}
            </pre>
          </div>
        )}
        <button
          onClick={reset}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}
