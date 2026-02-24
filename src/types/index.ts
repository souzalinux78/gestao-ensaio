export type TipoUsuario = 'admin' | 'instrutor' | 'encarregado' | 'secretario';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  tipo: TipoUsuario;
  igreja?: string | null;
  aprovado?: boolean;
  tenantId?: number | null; // ID do tenant (multi-tenant)
  accessToken?: string; // JWT token (opcional, presente após login)
}

export interface Instrumento {
  id: number;
  nome: string;
}

export interface Musico {
  id: number;
  nome: string;
  instrutorId: number;
}

export interface EnsaioMusico {
  musicoId: number;
  musico?: Musico;
}

export interface EnsaioInstrumento {
  instrumentoId: number;
  quantidade: number;
  instrumento?: Instrumento;
}

export interface EnsaioFuncoes {
  ancioes: number;
  diaconos: number;
  cooperadorOficio: number;
  cooperadorJovens: number;
  examinadora: number;
  encarregadosLocais: number;
  encarregadosRegionais: number;
  instrutores: number;
}

export interface Ensaio {
  id: number;
  data: Date;
  instrutorId: number;
  atendimento1Nome?: string | null;
  atendimento1Tipo?: string | null;
  atendimento2Nome?: string | null;
  atendimento2Tipo?: string | null;
  instrutor?: {
    id?: number;
    nome: string;
    igreja?: string | null;
  };
  instrumentos: EnsaioInstrumento[];
  musicos?: EnsaioMusico[];
  funcoes?: EnsaioFuncoes;
  totalGeral: number;
  hinosEnsaidos?: string | null;
  regencia?: string | null;
}

export interface Configuracoes {
  id: number;
  webhook: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contato {
  id: number;
  nome: string;
  telefone: string;
  usuarioId: number;
  createdAt: Date;
  updatedAt: Date;
}
