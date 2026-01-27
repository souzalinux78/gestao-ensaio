/**
 * Script para gerar chaves VAPID para Push Notifications
 * 
 * Uso: node scripts/gerar-vapid-keys.js
 * 
 * Alternativa: npm install -g web-push && web-push generate-vapid-keys
 */

const crypto = require('crypto');

// VAPID requer chaves EC (Elliptic Curve) P-256
// Gerar par de chaves usando o formato correto para VAPID
function generateVAPIDKeys() {
  // Criar chave privada aleatória de 32 bytes (256 bits)
  const privateKey = crypto.randomBytes(32);
  
  // Criar curva EC P-256
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.setPrivateKey(privateKey);
  
  // Obter chave pública (formato não comprimido: 0x04 + x + y = 65 bytes)
  const publicKey = ecdh.getPublicKey(null, 'uncompressed');
  
  // VAPID usa apenas a parte pública (sem o 0x04 inicial)
  // Mas para compatibilidade, vamos usar o formato completo
  // A chave pública VAPID é o ponto não comprimido completo
  const publicKeyBase64 = publicKey
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const privateKeyBase64 = privateKey
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
  };
}

try {
  const keys = generateVAPIDKeys();
  
  console.log('\n✅ Chaves VAPID geradas com sucesso!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Adicione estas variáveis ao seu arquivo .env ou .env.local:\n');
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
  console.log('VAPID_EMAIL=seu-email@exemplo.com');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  IMPORTANTE:');
  console.log('  • A chave pública (NEXT_PUBLIC_VAPID_PUBLIC_KEY) será exposta no cliente');
  console.log('  • A chave privada (VAPID_PRIVATE_KEY) deve ser mantida em SEGREDO');
  console.log('  • O email (VAPID_EMAIL) é usado para identificação do servidor');
  console.log('  • Após adicionar as variáveis, REINICIE o servidor\n');
  console.log('💡 DICA: Se este método não funcionar, use:');
  console.log('   npm install -g web-push');
  console.log('   web-push generate-vapid-keys\n');
} catch (error) {
  console.error('\n❌ Erro ao gerar chaves VAPID:', error.message);
  console.log('\n💡 Tente usar a biblioteca web-push:');
  console.log('   npm install -g web-push');
  console.log('   web-push generate-vapid-keys\n');
  process.exit(1);
}
