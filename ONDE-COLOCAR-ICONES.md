# 📁 Onde Colocar Logo, Favicon e Ícones

## 📂 Pasta Principal: `public/`

**Todos os arquivos de imagem devem ir na pasta:**
```
gestao-ensaio/public/
```

## 📋 Arquivos Necessários

### 1. Favicon (Ícone da Aba do Navegador)

**Pasta:** `public/`

**Arquivos:**
- `favicon.ico` (16x16, 32x32, 48x48) - **PRINCIPAL**
- `favicon-16x16.png` (opcional)
- `favicon-32x32.png` (opcional)

**Como usar:**
- Coloque `favicon.ico` em `public/favicon.ico`
- Next.js detecta automaticamente

### 2. Ícones PWA (Para Instalar o App)

**Pasta:** `public/`

**Arquivos obrigatórios:**
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

**Arquivos opcionais (SVG):**
- `icon-192.svg` - Para gerar PNG depois
- `icon-512.svg` - Para gerar PNG depois

**Status atual:** Você já tem os SVG, precisa converter para PNG!

### 3. Logo do Site

**Pasta:** `public/`

**Arquivos:**
- `logo.png` ou `logo.svg`
- Pode ser usado no Header ou outras páginas

**Tamanho recomendado:**
- Altura: 40-60px (para header)
- Largura: proporcional

## 📁 Estrutura Completa da Pasta `public/`

```
gestao-ensaio/
└── public/
    ├── favicon.ico              ← Favicon principal
    ├── favicon-16x16.png        ← Opcional
    ├── favicon-32x32.png        ← Opcional
    ├── icon-192.png             ← PWA 192x192 (OBRIGATÓRIO)
    ├── icon-512.png             ← PWA 512x512 (OBRIGATÓRIO)
    ├── icon-192.svg             ← Já existe (para referência)
    ├── icon-512.svg             ← Já existe (para referência)
    ├── logo.png                 ← Logo do site (opcional)
    └── manifest.json            ← Já configurado
```

## 🔧 Como Adicionar/Atualizar

### Opção 1: Via Computador Local

1. **Copie os arquivos para a pasta:**
   ```
   gestao-ensaio/public/
   ```

2. **Arquivos que você tem na raiz:**
   - `logo.png` → copie para `public/logo.png`
   - `favicons/favicon-16x16.png` → copie para `public/favicon-16x16.png`

3. **Criar favicon.ico:**
   - Use ferramenta online: https://favicon.io/favicon-converter/
   - Ou: https://realfavicongenerator.net/
   - Salve como `public/favicon.ico`

4. **Converter SVG para PNG (PWA):**
   - Abra `public/icon-generator.html` no navegador
   - Ou use: https://cloudconvert.com/svg-to-png
   - Crie `icon-192.png` (192x192) e `icon-512.png` (512x512)
   - Salve em `public/`

### Opção 2: Via Servidor (SSH)

```bash
# Conectar ao servidor
ssh root@seu-servidor

# Ir para pasta public
cd /var/www/gestao-ensaio/public

# Upload via SCP (do seu computador)
# scp logo.png root@seu-servidor:/var/www/gestao-ensaio/public/
# scp favicon.ico root@seu-servidor:/var/www/gestao-ensaio/public/
# scp icon-192.png root@seu-servidor:/var/www/gestao-ensaio/public/
# scp icon-512.png root@seu-servidor:/var/www/gestao-ensaio/public/
```

### Opção 3: Usar o Logo Existente

Você já tem `logo.png` na raiz do projeto. Para usá-lo:

1. **Copie para public:**
   ```bash
   # No seu computador
   cd "C:\Users\eduardosouza\OneDrive\Documentos\Gestão de Ensaio"
   copy logo.png gestao-ensaio\public\logo.png
   ```

2. **Criar ícones PWA a partir do logo:**
   - Abra o logo no editor
   - Redimensione para 192x192 → salve como `icon-192.png`
   - Redimensione para 512x512 → salve como `icon-512.png`
   - Coloque ambos em `public/`

## ✅ Checklist

- [ ] `favicon.ico` em `public/favicon.ico`
- [ ] `icon-192.png` (192x192) em `public/icon-192.png`
- [ ] `icon-512.png` (512x512) em `public/icon-512.png`
- [ ] `logo.png` (opcional) em `public/logo.png`

## 🎨 Tamanhos e Formatos

| Tipo | Tamanho | Formato | Localização | Obrigatório |
|------|---------|---------|-------------|-------------|
| Favicon | 16x16, 32x32 | .ico | `public/favicon.ico` | ✅ Sim |
| PWA Icon | 192x192 | .png | `public/icon-192.png` | ✅ Sim |
| PWA Icon | 512x512 | .png | `public/icon-512.png` | ✅ Sim |
| Logo | Variável | .png/.svg | `public/logo.png` | ❌ Opcional |

## 🔄 Após Adicionar

1. **Local (para testar):**
   ```bash
   npm run dev
   ```

2. **No servidor:**
   ```bash
   # Não precisa rebuild, apenas reiniciar
   pm2 restart gestao-ensaio
   ```

3. **Limpar cache do navegador** para ver mudanças:
   - Chrome: Ctrl+Shift+Del → Limpar cache
   - Ou: Abrir em aba anônima

## 🛠️ Ferramentas Úteis

### Gerar Favicon
- https://favicon.io/favicon-converter/
- https://realfavicongenerator.net/

### Converter SVG para PNG
- https://cloudconvert.com/svg-to-png
- https://www.iloveimg.com/resize-image

### Gerar Ícones PWA
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

## 📝 Nota Importante

O Next.js serve arquivos da pasta `public/` diretamente:
- `public/logo.png` → acessível em `http://site.com/logo.png`
- `public/favicon.ico` → automaticamente usado pelo navegador
- `public/icon-192.png` → usado pelo PWA
