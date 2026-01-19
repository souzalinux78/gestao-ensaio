// Script para gerar ícones PWA a partir dos SVG existentes
// Execute: node scripts/gerar-icones-pwa.js

const fs = require('fs');
const path = require('path');

console.log('📱 Gerador de Ícones PWA');
console.log('=======================\n');

const publicDir = path.join(__dirname, '..', 'public');
const icon192Svg = path.join(publicDir, 'icon-192.svg');
const icon512Svg = path.join(publicDir, 'icon-512.svg');

console.log('ℹ️  Para gerar os ícones PNG, você precisa:');
console.log('   1. Abrir icon-192.svg e icon-512.svg no navegador');
console.log('   2. Fazer screenshot ou exportar como PNG');
console.log('   3. Salvar como icon-192.png e icon-512.png na pasta public/\n');

console.log('   Ou use uma ferramenta online:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.pwabuilder.com/imageGenerator\n');

console.log('   Os ícones devem ser:');
console.log('   - icon-192.png: 192x192 pixels');
console.log('   - icon-512.png: 512x512 pixels\n');

// Verificar se SVG existem
if (fs.existsSync(icon192Svg)) {
  console.log('✅ icon-192.svg encontrado');
} else {
  console.log('⚠️  icon-192.svg não encontrado');
}

if (fs.existsSync(icon512Svg)) {
  console.log('✅ icon-512.svg encontrado');
} else {
  console.log('⚠️  icon-512.svg não encontrado');
}

// Verificar se PNG existem
const icon192Png = path.join(publicDir, 'icon-192.png');
const icon512Png = path.join(publicDir, 'icon-512.png');

if (fs.existsSync(icon192Png)) {
  console.log('\n✅ icon-192.png encontrado');
} else {
  console.log('\n❌ icon-192.png não encontrado - PRECISA CRIAR');
}

if (fs.existsSync(icon512Png)) {
  console.log('✅ icon-512.png encontrado');
} else {
  console.log('❌ icon-512.png não encontrado - PRECISA CRIAR');
}

console.log('\n📝 Instruções:');
console.log('   1. Use os SVG existentes ou crie novos');
console.log('   2. Exporte como PNG nas resoluções corretas');
console.log('   3. Salve em: ' + publicDir);
console.log('   4. O PWA funcionará automaticamente!');
