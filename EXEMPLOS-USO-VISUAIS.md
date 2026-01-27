# 🎨 Exemplos de Uso - Melhorias Visuais

## 📋 Guia Rápido

### 1. Skeleton Loading

**Substituir "Carregando..." por skeleton:**

```tsx
// ANTES
{carregando ? (
  <div className="text-center py-8 text-gray-500">Carregando usuários...</div>
) : (
  <TabelaUsuarios usuarios={usuarios} />
)}

// DEPOIS
import SkeletonTable from '@/components/SkeletonTable';

{carregando ? (
  <SkeletonTable rows={5} columns={4} />
) : (
  <TabelaUsuarios usuarios={usuarios} />
)}
```

**Skeleton para cards:**

```tsx
import SkeletonCard from '@/components/SkeletonCard';

{carregando ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SkeletonCard lines={3} />
    <SkeletonCard lines={3} />
    <SkeletonCard lines={3} />
  </div>
) : (
  <ListaCards items={items} />
)}
```

**Skeleton customizado:**

```tsx
import Skeleton from '@/components/Skeleton';

<div className="space-y-4">
  <Skeleton variant="rectangular" width="100%" height={200} />
  <Skeleton variant="text" lines={3} />
  <Skeleton variant="circular" width={40} height={40} />
</div>
```

---

### 2. Toast Notifications

**Substituir `alert()` por toast:**

```tsx
// ANTES
if (res.ok) {
  alert('Operação realizada com sucesso!');
} else {
  alert('Erro ao processar');
}

// DEPOIS
import { useToast } from '@/hooks/useToast';

function MeuComponente() {
  const { success, error } = useToast();
  
  const handleSalvar = async () => {
    const res = await fetch('/api/endpoint', { ... });
    if (res.ok) {
      success('Operação realizada com sucesso!');
    } else {
      error('Erro ao processar');
    }
  };
  
  return <button onClick={handleSalvar}>Salvar</button>;
}
```

**Todos os tipos:**

```tsx
const { success, error, warning, info } = useToast();

success('Sucesso!');
error('Erro!');
warning('Atenção!');
info('Informação!');
```

---

### 3. Sombras Suaves

**Cards com sombras:**

```tsx
// Sombra suave
<div className="card shadow-soft">
  Conteúdo
</div>

// Sombra média
<div className="card shadow-medium">
  Conteúdo importante
</div>

// Sombra forte
<div className="card shadow-strong">
  Modal ou elemento destacado
</div>

// Efeito glow
<button className="btn btn-primary shadow-glow">
  Ação importante
</button>
```

---

### 4. Bordas Arredondadas

**Elementos com bordas modernas:**

```tsx
// Card padrão (12px)
<div className="rounded-card">Card</div>

// Botão (8px)
<button className="rounded-button">Botão</button>

// Elemento grande (16px)
<div className="rounded-xl">Elemento grande</div>

// Modal (20px)
<div className="rounded-2xl">Modal</div>

// Totalmente arredondado
<button className="rounded-full w-12 h-12">+</button>
```

---

### 5. Animações Leves

**Animações de entrada:**

```tsx
// Entrada da direita (toast)
<div className="animate-slide-in-right">Toast</div>

// Entrada de baixo (modal)
<div className="animate-slide-in-up">Modal</div>

// Fade in suave
<div className="animate-fade-in">Conteúdo</div>

// Scale in
<div className="animate-scale-in">Elemento</div>
```

**Hover effects:**

```tsx
// Card com hover
<div className="card card-hover">
  Eleva no hover
</div>

// Botão com hover
<button className="btn btn-primary hover-lift">
  Eleva levemente
</button>
```

---

### 6. Aplicar em Componentes Existentes

**Exemplo: Página de Usuários**

```tsx
// Adicionar skeleton
import SkeletonTable from '@/components/SkeletonTable';

{carregando ? (
  <SkeletonTable rows={5} columns={5} />
) : (
  <TabelaUsuarios usuarios={usuariosFiltrados} />
)}

// Substituir alert por toast
import { useToast } from '@/hooks/useToast';

const { success, error } = useToast();

// No lugar de:
// alert('Usuário criado!');

// Usar:
success('Usuário criado!');
```

**Exemplo: Formulário**

```tsx
// Melhorar inputs
<input
  type="text"
  className="input" // Classe padronizada
  placeholder="Digite..."
/>

// Melhorar botões
<button className="btn btn-primary">
  Salvar
</button>
```

---

## 🎯 Checklist de Aplicação

### Fase 1 - Substituições Simples
- [ ] Substituir `alert()` por toast em componentes
- [ ] Adicionar skeleton em páginas de listagem
- [ ] Aplicar classes `.card`, `.input`, `.btn` nos componentes

### Fase 2 - Melhorias Visuais
- [ ] Aplicar sombras suaves em cards
- [ ] Melhorar bordas arredondadas
- [ ] Adicionar animações de entrada

### Fase 3 - Polimento
- [ ] Adicionar hover effects
- [ ] Aplicar glow em elementos importantes
- [ ] Refinar transições

---

## 📊 Comparação Visual

### Antes
- Texto "Carregando..."
- `alert()` nativo
- Sombras genéricas
- Bordas básicas
- Sem animações

### Depois
- Skeleton loading visual
- Toast notifications estilizadas
- Sombras suaves modernas
- Bordas arredondadas consistentes
- Animações leves e suaves

---

## ⚠️ Notas Importantes

- **CSS puro** - Sem bibliotecas externas
- **Performance** - Animações leves (200-300ms)
- **Acessibilidade** - Funciona em todos os navegadores
- **Compatibilidade** - Não quebra código existente
