/**
 * Script para injetar timestamp no Service Worker durante o build
 * Isso força atualização automática do PWA quando houver novo deploy
 */

const fs = require('fs');
const path = require('path');

const SW_PATH = path.join(__dirname, '..', 'public', 'sw.js');
const BUILD_TIMESTAMP = Date.now().toString();

console.log('🔄 Injetando versão no Service Worker...');
console.log(`   Timestamp: ${BUILD_TIMESTAMP}`);

try {
  let swContent = fs.readFileSync(SW_PATH, 'utf8');
  
  // Substituir placeholder pelo timestamp real
  swContent = swContent.replace(
    /const BUILD_TIMESTAMP = '{{BUILD_TIMESTAMP}}';/,
    `const BUILD_TIMESTAMP = '${BUILD_TIMESTAMP}';`
  );
  
  // Se não houver placeholder, adicionar timestamp
  if (!swContent.includes(`BUILD_TIMESTAMP = '${BUILD_TIMESTAMP}'`)) {
    // Procurar pela linha do CACHE_NAME e substituir
    swContent = swContent.replace(
      /const CACHE_NAME = .*?;/,
      `const CACHE_NAME = 'gestao-ensaio-${BUILD_TIMESTAMP}';`
    );
    
    // Adicionar BUILD_TIMESTAMP se não existir
    if (!swContent.includes('BUILD_TIMESTAMP')) {
      swContent = swContent.replace(
        /\/\/ Versão atual:.*?\n/,
        `// Versão atual: ${BUILD_TIMESTAMP} - Atualização automática\nconst BUILD_TIMESTAMP = '${BUILD_TIMESTAMP}';\n`
      );
    }
  }
  
  fs.writeFileSync(SW_PATH, swContent, 'utf8');
  console.log('✅ Service Worker atualizado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao atualizar Service Worker:', error);
  process.exit(1);
}
