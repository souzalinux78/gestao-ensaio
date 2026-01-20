# 🚀 Guia de Atualização em Produção

## Problema: Atualizações não aparecem após deploy

Este problema geralmente é causado por:
1. **Service Worker cacheando versão antiga**
2. **Cache do navegador**
3. **Cache do Nginx**
4. **Build não sendo aplicado corretamente**

## ✅ Solução Completa

### Passo 1: Atualizar Service Worker

```bash
cd /var/www/gestao-ensaio

# Atualizar versão do Service Worker
chmod +x scripts/atualizar-service-worker.sh
./scripts/atualizar-service-worker.sh
```

### Passo 2: Deploy Completo

```bash
# Usar o script de deploy completo
chmod +x scripts/deploy-producao-completo.sh
./scripts/deploy-producao-completo.sh
```

### Passo 3: Atualizar Nginx (se necessário)

```bash
# Copiar nova configuração do Nginx
sudo cp nginx-config-corrigido.conf /etc/nginx/sites-available/gestao-ensaio

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### Passo 4: Verificar

1. **Acesse em modo anônimo** (para evitar cache do navegador)
2. **Ou limpe o cache do navegador** (Ctrl+Shift+Delete)
3. **Faça hard refresh** (Ctrl+Shift+R ou Cmd+Shift+R)
4. **Verifique o console do navegador** para logs do Service Worker

## 🔍 Diagnóstico

Se ainda não funcionar, execute:

```bash
./scripts/diagnosticar-build.sh
```

## 📝 Checklist de Deploy

- [ ] Service Worker atualizado (versão incrementada)
- [ ] Build executado com sucesso
- [ ] PM2 reiniciado
- [ ] Nginx recarregado
- [ ] Testado em modo anônimo
- [ ] Hard refresh realizado

## ⚠️ Importante

**SEMPRE** incremente a versão do Service Worker após cada deploy que altera:
- Componentes React
- Estilos CSS
- JavaScript
- HTML

A versão atual está em: `public/sw.js` (linha 2)
