# Funcionalidade de Agendamento de Aulas

## Visão Geral

A plataforma FitCoachHub agora possui um sistema completo de agendamento de aulas, permitindo que:
- **Personal trainers** definam seus horários disponíveis
- **Alunos** visualizem os horários livres e façam agendamentos

## Para Personal Trainers

### Adicionar Horários Disponíveis

Na seção "Adicionar Horários Disponíveis" do seu perfil (`/trainer/profile`):

1. **Selecione a data** - escolha qual data deseja adicionar o horário
2. **Defina a hora de início** - horário que a aula começa
3. **Defina a hora de término** - horário que a aula termina
4. **Adicione observações** (opcional) - descreva o tipo de aula, local, equipamentos, etc.
5. **Clique em "Adicionar Horário"**

Os horários aparecerão na grid de "Horários Disponíveis" para que alunos possam marcar.

### Gerenciar Aulas Agendadas

Na seção "Aulas Agendadas" do seu perfil:

- **Filtrar por status**: Veja todas as aulas, apenas as próximas ou as passadas
- **Informações detalhadas**: Veja data, horário, status e qual aluno agendou
- **Deletar horários**: Remova horários que não deseja mais disponibilizar

**Status das aulas:**
- 🟢 **Disponível**: Horário aberto para agendamentos
- 🔵 **Agendada**: Já possui um aluno confirmado
- ⚪ **Realizada**: Aula já aconteceu
- 🔴 **Cancelada**: Horário foi cancelado

## Para Alunos

### Agendar Aula com um Personal Trainer

Ao visualizar o perfil público de um personal trainer:

1. **Role para a seção "Horários Disponíveis"**
2. **Escolha um período de visualização** (7, 14 ou 30 dias)
3. **Clique no botão "Agendar"** do horário desejado
4. **Confirme o agendamento** - você receberá uma confirmação

Seu agendamento aparecerá na seção "Aulas Agendadas" do seu perfil.

## Banco de Dados

### Tabela `lessons`

```sql
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY,
  trainer_id UUID REFERENCES auth.users(id),      -- Personal trainer
  student_id UUID REFERENCES auth.users(id),      -- Aluno que agendou (null se disponível)
  scheduled_date DATE NOT NULL,                   -- Data da aula
  start_time TIME NOT NULL,                       -- Hora de início
  end_time TIME NOT NULL,                         -- Hora de término
  status lesson_status NOT NULL DEFAULT 'available', -- Status da aula
  notes TEXT,                                     -- Observações adicionais
  created_at TIMESTAMP,                           -- Criado em
  updated_at TIMESTAMP                            -- Atualizado em
);
```

### Status possíveis

- `available` - Horário disponível para agendamento
- `scheduled` - Já possui aluno agendado
- `completed` - Aula foi realizada
- `cancelled` - Horário foi cancelado

## Componentes Utilizados

### `AvailableLessonsGrid`
Exibe os horários disponíveis de um personal trainer com opção de agendamento.

**Props:**
- `trainerId: string` - ID do personal trainer
- `isOwnProfile: boolean` - Se é o próprio perfil do usuário
- `onLessonBooked?: () => void` - Callback ao agendar uma aula

### `TrainerScheduleManager`
Formulário para o personal trainer adicionar novos horários disponíveis.

**Props:**
- `trainerId: string` - ID do personal trainer
- `onLessonAdded?: () => void` - Callback ao adicionar um horário

### `ScheduledLessonsManager`
Tabela que mostra todas as aulas agendadas do personal trainer.

**Props:**
- `trainerId: string` - ID do personal trainer
- `isOwnProfile: boolean` - Se é o próprio perfil do usuário

## Fluxo de Agendamento

```
┌─────────────────────────────────────────────────────────────┐
│ Personal Trainer                                             │
├─────────────────────────────────────────────────────────────┤
│ 1. Adiciona horários no formulário                           │
│ 2. Status = 'available'                                      │
│ 3. Visualiza na tabela de "Aulas Agendadas"                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Base de Dados (Tabela lessons)                              │
├─────────────────────────────────────────────────────────────┤
│ trainer_id, scheduled_date, start_time, end_time, ...       │
│ status = 'available'                                        │
│ student_id = NULL                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Aluno - Perfil Público do Trainer                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Visualiza "Horários Disponíveis"                         │
│ 2. Clica em "Agendar"                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Sistema de Agendamento                                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Valida se horário ainda está disponível                  │
│ 2. Atualiza: student_id = aluno_id                          │
│ 3. Atualiza: status = 'scheduled'                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Sucesso!                                                    │
├─────────────────────────────────────────────────────────────┤
│ ✓ Aluno vê confirmação e receita a aula em seu perfil       │
│ ✓ Trainer vê a aula como "Agendada" na lista               │
└─────────────────────────────────────────────────────────────┘
```

## Regras de Segurança (RLS)

- ✅ Personal trainers podem criar, atualizar e deletar seus próprios horários
- ✅ Alunos podem visualizar apenas horários disponíveis de outros trainers
- ✅ Alunos podem agendar somente horários com status "available"
- ✅ Ao agendar, o status muda automaticamente para "scheduled" e recebe o student_id

## Próximas Melhorias

- [ ] Notificações por email/SMS ao agendar
- [ ] Sistema de cancelamento de aulas agendadas
- [ ] Avaliação da aula após realização
- [ ] Lembretes de aulas agendadas
- [ ] Integração com calendário Google/Outlook
- [ ] Bloqueio automático de horários duplicados
- [ ] Relatório de aulas realizadas e ganhos
