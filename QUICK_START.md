# ⚡ Guia Rápido - Sistema de Agendamento

## 5 Minutos de Setup

### 1. Aplicar a Migration (2 min)

**Opção Rápida - Supabase CLI:**
```bash
supabase migration up
```

**Ou via Dashboard:**
- Abra https://app.supabase.com
- SQL Editor → New Query
- Copie: `supabase/migrations/20260126000000_create_lessons_table.sql`
- Execute

### 2. Rodar o Projeto (1 min)

```bash
npm run dev
# ou
bun run dev
```

### 3. Testar (2 min)

**Como Trainer:**
1. Acesse `/trainer/profile`
2. Adicione um horário (exemplo: amanhã, 10:00-11:00)
3. Verifique na tabela "Aulas Agendadas"

**Como Aluno:**
1. Copie o ID do trainer da URL
2. Abra em incógnito: `/trainer/{ID}`
3. Veja "Horários Disponíveis"
4. Clique "Agendar"

---

## 📁 Arquivos Principais

### Componentes (use direto!)
```javascript
// No seu componente React:
import { AvailableLessonsGrid } from "@/components/AvailableLessonsGrid"
import { TrainerScheduleManager } from "@/components/TrainerScheduleManager"
import { ScheduledLessonsManager } from "@/components/ScheduledLessonsManager"

// Uso:
<AvailableLessonsGrid 
  trainerId={trainerId} 
  isOwnProfile={false}
/>
```

### Banco de Dados
- Tabela: `lessons`
- Campos: `id`, `trainer_id`, `student_id`, `scheduled_date`, `start_time`, `end_time`, `status`, `notes`

---

## 🎯 O que cada componente faz

| Componente | Local | Função |
|-----------|-------|--------|
| `AvailableLessonsGrid` | `/trainer/{id}` | Mostra horários para alunos |
| `TrainerScheduleManager` | `/trainer/profile` | Trainer adiciona horários |
| `ScheduledLessonsManager` | `/trainer/profile` | Trainer gerencia aulas |

---

## 🔑 Features Principais

✅ Trainer adiciona horários disponíveis
✅ Aluno visualiza e agenda aulas
✅ Filtro de 7/14/30 dias
✅ Status das aulas (disponível, agendada, realizada, cancelada)
✅ Segurança com RLS
✅ Validação de horários
✅ Interface responsiva

---

## 🚨 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Tabela não encontrada | Execute a migration (`supabase migration up`) |
| Componente não carrega | Verifique se o Supabase está conectado |
| Erro ao agendar | Confirme se está autenticado (login) |
| Sem horários disponíveis | Trainer precisa adicionar horários futuros |

---

## 📞 Links Importantes

- 📖 Documentação Completa: [SCHEDULING_FEATURES.md](./SCHEDULING_FEATURES.md)
- 🔧 Aplicar Migration: [APPLY_MIGRATION.md](./APPLY_MIGRATION.md)
- ✅ Testar Sistema: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- 📊 Resumo Técnico: [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)
- 📋 Implementação: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## ✨ Pronto para Usar!

Tudo está integrado. Basta:

1. ✅ Aplicar a migration ao banco
2. ✅ Rodar o projeto
3. ✅ Testar!

**Nenhuma configuração adicional necessária.**

---

## 🎉 Próximos Passos

Após confirmar que tudo funciona:

1. **Melhorias UI**
   - Adicione mais validações
   - Customize cores e estilos
   - Adicione animações

2. **Notificações**
   - Email ao agendar
   - SMS/WhatsApp
   - Lembretes

3. **Relatórios**
   - Dashboard com estatísticas
   - Ganhos mensais
   - Aulas realizadas

4. **Integração**
   - Google Calendar
   - Zoom/Meet para videochamadas
   - Stripe para pagamentos

---

**Dúvidas? Veja a documentação completa em SCHEDULING_FEATURES.md**
