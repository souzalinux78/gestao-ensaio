// Script Node.js para gerar ícones PWA usando canvas
// Execute: node scripts/create-pwa-icons.js

const fs = require('fs');
const path = require('path');

// Criar um SVG simples que pode ser convertido para PNG
const createIconSVG = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fundo azul escuro -->
  <rect width="${size}" height="${size}" fill="#1e3a5f"/>
  
  <!-- Círculo dourado -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#d4af37"/>
  
  <!-- Texto GE -->
  <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="#1e3a5f" text-anchor="middle" dominant-baseline="central">GE</text>
</svg>`;
};

// Criar diretório public se não existir
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Gerar SVGs (que podem ser convertidos para PNG manualmente ou com ferramentas)
const sizes = [192, 512];
sizes.forEach(size => {
  const svg = createIconSVG(size);
  const svgPath = path.join(publicDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✅ Criado: icon-${size}.svg`);
});

console.log('\n📝 Próximos passos:');
console.log('1. Abra os arquivos SVG no navegador');
console.log('2. Use uma ferramenta online (como convertio.co) para converter SVG para PNG');
console.log('3. Ou use o arquivo icon-generator.html na pasta public/ para gerar PNGs');
console.log('4. Salve como icon-192.png e icon-512.png na pasta public/');
