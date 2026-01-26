# 🎨 Interface Visual - Sistema de Agendamento

## Visualização dos Componentes

### 1. TrainerScheduleManager (Formulário de Adição)

```
┌─────────────────────────────────────────────────────────────┐
│  ✚ Adicionar Horários Disponíveis                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Data *              │ 31/01/2026                           │
│  ─────────────────────────────────────────────────────────  │
│  Hora de Início *    │ 09:00        Hora de Término * │ 10:00 │
│  ─────────────────────────────────────────────────────────  │
│  Observações         │ Treino ao ar livre com equip... │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│                    [ ✚ Adicionar Horário ]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. AvailableLessonsGrid (Grades de Agendamento)

```
┌─────────────────────────────────────────────────────────────┐
│ Horários Disponíveis        [ 7 dias ] [ 14 dias ] [ 30 dias ] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Segunda, 31 de janeiro                                    │
│                                                             │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│ │ 🕐 09:00 - 10:00 │  │ 🕐 10:30 - 11:30 │  │ 🕐 14:00 - 15:00 │ │
│ │                  │  │                  │  │                  │ │
│ │ Disponível       │  │ Disponível       │  │ Disponível       │ │
│ │ Treino ao ar...  │  │ Musculação...    │  │ Personal 1:1...  │ │
│ │                  │  │                  │  │                  │ │
│ │ [ ✓ Agendar ]    │  │ [ ✓ Agendar ]    │  │ [ ✓ Agendar ]    │ │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                             │
│ Terça, 03 de fevereiro                                    │
│                                                             │
│ ┌──────────────────┐  ┌──────────────────┐                 │
│ │ 🕐 16:00 - 17:00 │  │ 🕐 17:30 - 18:30 │                 │
│ │                  │  │                  │                 │
│ │ Disponível       │  │ Disponível       │                 │
│ │ Alongamento...   │  │ Funcional...     │                 │
│ │                  │  │                  │                 │
│ │ [ ✓ Agendar ]    │  │ [ ✓ Agendar ]    │                 │
│ └──────────────────┘  └──────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. ScheduledLessonsManager (Tabela de Aulas)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📅 Aulas Agendadas        [ Todas ] [ Próximas ] [ Passadas ]               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Data       │ Horário        │ Status      │ Aluno            │ Ações      │
│ ────────────┼────────────────┼─────────────┼──────────────────┼────────    │
│ 31/01/2026  │ 🕐 09:00-10:00 │ Disponível  │ Sem aluno        │ 🗑️        │
│ 31/01/2026  │ 🕐 10:30-11:30 │ Agendada    │ 👤 Aluno agendado│ 🗑️        │
│ 03/02/2026  │ 🕐 14:00-15:00 │ Disponível  │ Sem aluno        │ 🗑️        │
│ 03/02/2026  │ 🕐 16:00-17:00 │ Cancelada   │ -                │ 🗑️        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cores e Estilos

### Badges de Status

**Disponível** (Verde)
```
Background: bg-green-50
Text: text-green-700
Border: border-green-200
Label: "Disponível"
```

**Agendada** (Azul)
```
Background: bg-blue-50
Text: text-blue-700
Border: border-blue-200
Label: "Agendada"
```

**Realizada** (Cinza)
```
Background: bg-gray-50
Text: text-gray-700
Border: border-gray-200
Label: "Realizada"
```

**Cancelada** (Vermelho)
```
Background: bg-red-50
Text: text-red-700
Border: border-red-200
Label: "Cancelada"
```

---

## Ícones Utilizados

| Ícone | Quando | De |
|-------|--------|-----|
| 📅 | Datas, calendário | lucide-react: Calendar |
| 🕐 | Horários | lucide-react: Clock |
| ✚ | Adicionar | lucide-react: Plus |
| 🗑️ | Deletar | lucide-react: Trash2 |
| 👤 | Aluno | lucide-react: User |
| ✓ | Confirmar, Agendar | lucide-react: CheckCircle2 |
| ⏳ | Loading | lucide-react: Loader2 |

---

## Layouts Responsivos

### Desktop (> 1024px)

```
Cards em 3 colunas:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Card 1    │ │   Card 2    │ │   Card 3    │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Tablet (640-1024px)

```
Cards em 2 colunas:
┌─────────────────┐ ┌─────────────────┐
│   Card 1        │ │   Card 2        │
└─────────────────┘ └─────────────────┘
┌─────────────────┐
│   Card 3        │
└─────────────────┘
```

### Mobile (< 640px)

```
Cards em 1 coluna:
┌─────────────────────────────────┐
│   Card 1 (Full Width)           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│   Card 2 (Full Width)           │
└─────────────────────────────────┘
```

---

## Animações e Estados

### Loading

```
Antes: [ ✚ Adicionar Horário ]
Durante: [ ⏳ Adicionando... ]
Depois: [ ✚ Adicionar Horário ]
```

### Erro

```
┌─────────────────────────────────┐
│ ❌ Erro ao agendar              │
│ Não foi possível agendar a aula.│
│ Tente novamente.                │
└─────────────────────────────────┘
```

### Sucesso

```
┌─────────────────────────────────┐
│ ✓ Aula agendada com sucesso!    │
│ Você pode visualizar sua aula no │
│ seu perfil                      │
└─────────────────────────────────┘
```

---

## Componentes UI Utilizados

### Card
- Container principal
- Padding e borda
- Sombra sutil

### Badge
- Status indicator
- Cores de acordo com status
- Padding pequeno

### Button
- Variantes: default, outline, ghost, destructive
- Tamanhos: sm, md, lg
- Ícones integrados
- Estados: normal, loading, disabled

### Input
- Tipo text, time, date
- Validação de campo
- Placeholder

### Label
- Texto acima do input
- Associação com campo

### Textarea
- Múltiplas linhas
- Redimensionável

### Table
- Headers
- Rows
- Align automático
- Scroll em mobile

---

## Padrões de Design

### Consistência
- Mesmo spacing em todos os cards
- Mesmas cores para mesmo status
- Tipografia consistente

### Acessibilidade
- Labels associadas aos inputs
- Botões com texto legível
- Contraste suficiente
- Ícones com descrição

### Performance
- Lazy loading de dados
- Paginação por período
- Índices no banco
- Queries otimizadas

### UX
- Feedback imediato (toast)
- Loading states visíveis
- Erros descritivos
- Confirmação para deletar

---

## Exemplo de Layout Completo

```
┌──────────────────────────────────────────────────────────────┐
│ Personal Trainer Profile                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Avatar] João Silva, Trainer                                │
│          ⭐ 4.8 (12 avaliações)                              │
│          📍 São Paulo, SP                                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Sobre                       │ Informações                    │
│ João é um trainer experi... │ R$ 150 / aula                │
│                             │ (11) 99999-9999              │
│ Especialidades:             │                               │
│ Musculação • Crossfit       │ [ Agendar Aula ]             │
│ Funcional • Yoga            │                               │
│                             │                               │
│ Avaliações:                 │                               │
│ ⭐⭐⭐⭐⭐ "Muito bom!"     │                               │
│                             │                               │
├──────────────────────────────────────────────────────────────┤
│ Horários Disponíveis        [ 7 dias ] [ 14 ] [ 30 ]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Segunda, 31 de janeiro                                     │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 🕐 09:00-10:00  │ │ 🕐 10:30-11:30  │ │ 🕐 14:00-15:00  │ │
│ │ Disponível      │ │ Disponível      │ │ Disponível      │ │
│ │ Treino ao ar... │ │ Musculação...   │ │ Personal...     │ │
│ │ [ ✓ Agendar ]   │ │ [ ✓ Agendar ]   │ │ [ ✓ Agendar ]   │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                              │
│ Terça, 03 de fevereiro                                     │
│ ┌─────────────────┐ ┌─────────────────┐                    │
│ │ 🕐 16:00-17:00  │ │ 🕐 17:30-18:30  │                    │
│ │ Disponível      │ │ Disponível      │                    │
│ │ Alongamento...  │ │ Funcional...    │                    │
│ │ [ ✓ Agendar ]   │ │ [ ✓ Agendar ]   │                    │
│ └─────────────────┘ └─────────────────┘                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Customização

### Adicionar mais cores
Atualize em `ScheduledLessonsManager.tsx`:
```typescript
const variants = {
  available: { className: "bg-green-50 text-green-700" },
  // Adicione mais aqui
}
```

### Mudar períodos de filtro
Em `AvailableLessonsGrid.tsx`:
```typescript
{[7, 14, 30].map(...)}  // Mude esses números
```

### Customizar labels
Em qualquer componente, procure por:
```typescript
"Disponível" → mude o texto
"Agendada" → mude o texto
```

---

## Exemplos de Uso

### Para mostrar só horários disponíveis
```tsx
<AvailableLessonsGrid 
  trainerId={trainerId} 
  isOwnProfile={false}
/>
```

### Para trainer gerenciar
```tsx
<TrainerScheduleManager trainerId={trainerId} />
<ScheduledLessonsManager trainerId={trainerId} isOwnProfile={true} />
```

---

**A interface foi desenhada para ser intuitiva, responsiva e profissional!**
