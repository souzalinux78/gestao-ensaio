import { prisma } from './db';

interface ConfigCache {
  data: {
    id: number;
    webhook: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  timestamp: number;
}

let configCache: ConfigCache | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém configurações com cache
 * Cache válido por 5 minutos
 * @param tenantId ID do tenant (opcional, padrão: 1)
 */
export async function getConfig(tenantId: number | null = 1) {
  const now = Date.now();
  const tenantIdFinal = tenantId || 1; // Fallback para tenant padrão
  
  // Se cache existe e ainda é válido, retornar
  // NOTA: Cache não diferencia por tenant - pode precisar melhorar no futuro
  if (configCache && (now - configCache.timestamp) < CACHE_TTL) {
    return configCache.data;
  }
  
  // Buscar do banco por tenant
  let config = await prisma.configuracoes.findUnique({
    where: { tenantId: tenantIdFinal },
  });
  
  // Se não existe, criar para o tenant
  if (!config) {
    config = await prisma.configuracoes.create({
      data: { 
        webhook: null,
        tenantId: tenantIdFinal, // ISOLAMENTO: associar ao tenant
      },
    });
  }
  
  // Atualizar cache
  configCache = {
    data: config,
    timestamp: now,
  };
  
  return config;
}

/**
 * Limpa o cache de configurações
 * Útil quando configurações são atualizadas
 */
export function clearConfigCache() {
  configCache = null;
}
