# 📱 PWA - Progressive Web App

## ✅ Funcionalidades Implementadas

1. ✅ **Service Worker** - Cache offline e funcionamento sem internet
2. ✅ **Web App Manifest** - Configuração para instalação
3. ✅ **Banner de Instalação** - Popup automático para instalar o app
4. ✅ **Suporte iOS e Android** - Instruções específicas para cada plataforma
5. ✅ **Ícones PWA** - Ícones para instalação na tela inicial

## 🎯 Como Funciona

### Banner de Instalação

O banner aparece automaticamente:
- Após 3 segundos da primeira visita
- Quando o navegador suporta instalação PWA
- Apenas uma vez a cada 7 dias (ou quando o usuário instala)

### Instalação no Android/Chrome

1. O banner aparecerá automaticamente
2. Clique em **"Instalar"**
3. O app será instalado na tela inicial

### Instalação no iOS/Safari

1. O banner mostrará instruções específicas
2. Toque no botão **"Compartilhar"** (ícone de compartilhar)
3. Selecione **"Adicionar à Tela Inicial"**
4. O app será instalado

## 🔧 Configuração

### Ícones

Os ícones devem estar em:
- `/public/icon-192.png` (192x192 pixels)
- `/public/icon-512.png` (512x512 pixels)

Se você tiver os ícones SVG, você pode convertê-los para PNG ou usar um gerador online.

### Service Worker

O Service Worker está em `/public/sw.js` e:
- Cacheia páginas principais para uso offline
- Atualiza automaticamente quando houver nova versão
- Não cacheia requisições de API (mantém dados atualizados)

### Manifest

O manifest está em `/public/manifest.json` e contém:
- Nome do app
- Ícones
- Cores do tema
- Modo de exibição (standalone)

## 📝 Personalização

### Alterar Cores do Banner

Edite `src/components/InstallPrompt.tsx` e altere as classes Tailwind:
- `from-primary to-primary-dark` - Cor de fundo
- `text-accent` - Cor do ícone

### Alterar Tempo até Mostrar Banner

Edite `src/components/InstallPrompt.tsx`:
```typescript
setTimeout(() => {
  setShowBanner(true);
}, 3000); // Altere 3000 para outro valor (em milissegundos)
```

### Alterar Frequência do Banner

Edite `src/components/InstallPrompt.tsx`:
```typescript
const daysSinceDismiss = dismissedDate 
  ? Math.floor((Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24))
  : null;

if (!bannerDismissed || (daysSinceDismiss && daysSinceDismiss > 7)) {
  // Altere 7 para outro número de dias
}
```

## 🧪 Testar

### Chrome DevTools

1. Abra DevTools (F12)
2. Vá para a aba "Application"
3. Verifique:
   - Service Worker está registrado
   - Manifest está carregado
   - Cache está funcionando

### Testar Instalação

1. Abra no celular
2. O banner deve aparecer após 3 segundos
3. Teste instalação
4. Verifique se o app funciona offline

## 🚀 Deploy

Após deploy em produção (HTTPS obrigatório):
1. Service Worker será registrado automaticamente
2. Banner aparecerá para usuários
3. App poderá ser instalado

## 📱 Requisitos

- ✅ HTTPS obrigatório (já configurado)
- ✅ Service Worker registrado
- ✅ Manifest válido
- ✅ Ícones configurados
