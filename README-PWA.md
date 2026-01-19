# Configuração PWA - Gestão de Ensaio

## Ícones PWA

Para completar a configuração PWA, você precisa criar os ícones:

### Opção 1: Usar o gerador HTML
1. Abra `public/icon-generator.html` no navegador
2. Clique em "Gerar Ícones"
3. Baixe os ícones (192x192 e 512x512)
4. Salve como `icon-192.png` e `icon-512.png` na pasta `public/`

### Opção 2: Criar manualmente
Crie dois ícones PNG:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

**Cores sugeridas:**
- Fundo: #1e3a5f (azul escuro)
- Elementos: #d4af37 (dourado)
- Texto: "GE" ou logo do sistema

### Opção 3: Converter SVG para PNG
1. Execute: `node scripts/create-pwa-icons.js` (cria SVGs)
2. Use uma ferramenta online para converter SVG para PNG
3. Salve na pasta `public/`

## Instalação como PWA

### No Chrome/Edge (Desktop):
1. Acesse o site
2. Clique no ícone de instalação na barra de endereços
3. Ou vá em Menu > Instalar aplicativo

### No Android:
1. Acesse o site no Chrome
2. Menu > "Adicionar à tela inicial"
3. O app aparecerá como um ícone na tela inicial

### No iOS (Safari):
1. Acesse o site no Safari
2. Compartilhar > Adicionar à Tela de Início
3. O app aparecerá como um ícone na tela inicial

## Funcionalidades PWA

- ✅ Funciona offline (cache básico)
- ✅ Instalável em dispositivos móveis
- ✅ Interface responsiva
- ✅ Tema personalizado (cores do logo)
- ✅ Service Worker para cache

## Notas

- Os ícones são obrigatórios para a instalação PWA funcionar
- O Service Worker está configurado para cache básico
- Para produção, considere implementar estratégias de cache mais avançadas
