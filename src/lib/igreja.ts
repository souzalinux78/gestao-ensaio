function limparParte(valor?: string | null): string {
  return (valor || '').replace(/\s+/g, ' ').trim();
}

function limparUF(valor?: string | null): string {
  return limparParte(valor).toUpperCase();
}

export type IgrejaCampos = {
  localidade: string;
  cidade: string;
  uf: string;
};

export function normalizarIgreja(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function parseIgreja(igreja?: string | null): IgrejaCampos {
  const texto = limparParte(igreja);
  if (!texto) {
    return { localidade: '', cidade: '', uf: '' };
  }

  const partesTraco = texto
    .split('-')
    .map((parte) => limparParte(parte))
    .filter(Boolean);

  if (partesTraco.length >= 3) {
    const uf = limparUF(partesTraco[partesTraco.length - 1]);
    if (/^[A-Z]{2}$/.test(uf)) {
      return {
        localidade: partesTraco[0],
        cidade: partesTraco.slice(1, -1).join(' - '),
        uf,
      };
    }

    return {
      localidade: partesTraco[0],
      cidade: partesTraco.slice(1).join(' - '),
      uf: '',
    };
  }

  if (partesTraco.length === 2) {
    return {
      localidade: partesTraco[0],
      cidade: partesTraco[1],
      uf: '',
    };
  }

  const partesVirgula = texto
    .split(',')
    .map((parte) => limparParte(parte))
    .filter(Boolean);

  if (partesVirgula.length >= 2) {
    const uf = limparUF(partesVirgula[partesVirgula.length - 1]);
    if (/^[A-Z]{2}$/.test(uf)) {
      return {
        localidade: partesVirgula[0],
        cidade: partesVirgula.slice(1, -1).join(' - '),
        uf,
      };
    }

    return {
      localidade: partesVirgula[0],
      cidade: partesVirgula.slice(1).join(' - '),
      uf: '',
    };
  }

  return {
    localidade: texto,
    cidade: '',
    uf: '',
  };
}

export function construirIgreja(localidade?: string | null, cidade?: string | null, uf?: string | null): string | null {
  const loc = limparParte(localidade);
  const cid = limparParte(cidade);
  const estado = limparUF(uf);
  const partes = [loc, cid, estado].filter(Boolean);
  return partes.length > 0 ? partes.join(' - ') : null;
}

export function ufEhValida(uf?: string | null): boolean {
  const estado = limparUF(uf);
  return estado === '' || /^[A-Z]{2}$/.test(estado);
}
