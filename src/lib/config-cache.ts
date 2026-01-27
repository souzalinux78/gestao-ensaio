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
 */
export async function getConfig() {
  const now = Date.now();
  
  // Se cache existe e ainda é válido, retornar
  if (configCache && (now - configCache.timestamp) < CACHE_TTL) {
    return configCache.data;
  }
  
  // Buscar do banco
  let config = await prisma.configuracoes.findFirst();
  
  // Se não existe, criar
  if (!config) {
    config = await prisma.configuracoes.create({
      data: { webhook: null },
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
