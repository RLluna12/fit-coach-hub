# Instruções para Aplicar a Migration de Visualização de Aulas Disponíveis

## Problema Identificado
As políticas (policies) do banco de dados não permitiam que alunos vissem aulas com status "available", porque a policy existente só permite ver aulas onde o usuário é o trainer ou o student (e aulas available ainda não têm student_id).

## Solução
Foi criada uma nova migration que adiciona uma policy permitindo que todos os usuários autenticados vejam aulas disponíveis.

## Como Aplicar

### Opção 1: Banco de Dados Local (com Docker rodando)
```bash
cd "c:\Users\rllun\OneDrive\Área de Trabalho\a\fit-coach-hub"
npx supabase db reset
```

### Opção 2: Banco de Dados em Produção (Supabase Cloud)
```bash
cd "c:\Users\rllun\OneDrive\Área de Trabalho\a\fit-coach-hub"
npx supabase db push
```

### Opção 3: Aplicar Manualmente no Supabase Dashboard
1. Acesse o Supabase Dashboard do seu projeto
2. Vá em SQL Editor
3. Execute o seguinte comando:

```sql
-- Allow all authenticated users to view available lessons
CREATE POLICY "Anyone can view available lessons"
  ON public.lessons FOR SELECT
  USING (status = 'available');
```

## Verificação
Após aplicar a migration, teste:
1. Faça login como Personal Trainer
2. Adicione alguns horários disponíveis
3. Faça logout e login como Aluno
4. Acesse a página "Agendar Aula" (botão no header ou rota `/agendar`)
5. Você deve ver os personal trainers com horários disponíveis
6. Ao agendar uma aula, ela deve desaparecer da lista de horários disponíveis

## Funcionalidades Implementadas
✅ Personal trainer adiciona horários disponíveis no perfil
✅ Alunos conseguem ver todos os horários disponíveis na página `/agendar`
✅ Alunos podem agendar horários
✅ Após agendamento, o horário some da lista de disponíveis (status muda para "scheduled")
✅ Botão "Agendar Aula" no header para alunos logados
