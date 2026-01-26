# Guia de Teste - Sistema de Agendamento

## Teste Prático Passo-a-Passo

### Pré-requisitos
- ✅ Migration aplicada ao banco de dados
- ✅ Projeto rodando (`npm run dev` ou `bun run dev`)
- ✅ Duas contas de teste (uma trainer, uma student)

---

## Teste 1: Personal Trainer Adiciona Horários

### Passo 1: Acesse o perfil do trainer

1. Faça login com uma conta de **trainer**
2. Acesse `/trainer/profile`
3. Você deve ver a seção "Adicionar Horários Disponíveis"

### Passo 2: Preencha o formulário

```
Data: 31/01/2026 (próxima segunda-feira)
Hora de Início: 09:00
Hora de Término: 10:00
Observações: Treino ao ar livre com equipamento funcional
```

Clique em "Adicionar Horário"

### Passo 3: Verifique a confirmação

- Você deve receber uma notificação de sucesso
- A mensagem deve dizer "Horário adicionado com sucesso!"

### Passo 4: Veja na tabela

- Role para baixo até "Aulas Agendadas"
- Você deve ver seu novo horário na tabela
- Status deve ser "Disponível" (badge verde)
- Coluna "Aluno" deve mostrar "Sem aluno"

### Passo 5: Adicione mais horários

Adicione pelo menos 3 horários para testar melhor:

```
Horário 2:
Data: 31/01/2026
Hora: 10:30 - 11:30
Observações: Musculação em grupo

Horário 3:
Data: 03/02/2026
Hora: 14:00 - 15:00
Observações: Personal 1:1

Horário 4:
Data: 03/02/2026
Hora: 16:00 - 17:00
Observações: Alongamento e mobilidade
```

---

## Teste 2: Aluno Visualiza Horários Disponíveis

### Passo 1: Copie o ID do trainer

No perfil do trainer, o URL deve ser algo como:
```
/trainer/[ID_TRAINER_AQUI]
```

Copie esse ID.

### Passo 2: Abra em incógnito ou outra conta

- Abra a aplicação em uma **janela incógnita**
- OU faça logout e faça login com uma conta **student**

### Passo 3: Acesse o perfil público do trainer

```
/trainer/[ID_COPIADO]
```

Você deve ver:
- ✅ Informações do trainer (foto, nome, especialidades)
- ✅ Avaliações
- ✅ Preço por aula
- ✅ Seção "Horários Disponíveis"

### Passo 4: Visualize os horários

Na seção "Horários Disponíveis":

- Você deve ver cards com os horários adicionados
- Cards organizados por data
- Cada card mostra:
  - ✅ Dia da semana e data
  - ✅ Horário (início - fim)
  - ✅ Badge "Disponível"
  - ✅ Observações
  - ✅ Botão "Agendar"

### Passo 5: Teste os filtros

- Clique no botão "7 dias" (selecionado por padrão)
- Clique no botão "14 dias" - deve mostrar mais horários
- Clique no botão "30 dias" - deve mostrar ainda mais

---

## Teste 3: Aluno Agenda uma Aula

### Passo 1: Escolha um horário

Na seção "Horários Disponíveis", clique no botão "Agendar" de um horário.

### Passo 2: Confirme o agendamento

- Se não estiver logado, receberá mensagem de erro
- Se estiver logado, clique "Agendar" novamente

### Passo 3: Verifique a confirmação

Você deve receber uma notificação:
```
✓ Aula agendada com sucesso!
Você pode visualizar sua aula no seu perfil
```

### Passo 4: Observe a mudança no card

O card do horário agendado deve **desaparecer** da lista de disponíveis.

### Passo 5: Verifique no banco de dados

Acesse o Supabase Dashboard e execute:

```sql
SELECT * FROM lessons WHERE status = 'scheduled';
```

Você deve ver a aula agendada com:
- ✅ `student_id` preenchido
- ✅ `status` = `'scheduled'`
- ✅ `scheduled_date`, `start_time`, `end_time` corretos

---

## Teste 4: Trainer Visualiza Aulas Agendadas

### Passo 1: Faça login novamente como trainer

Faça logout e acesse `/trainer/profile` com a conta do trainer.

### Passo 2: Role até "Aulas Agendadas"

Você deve ver:
- A aula que você adicionou agora aparece com status "Agendada" (badge azul)
- Coluna "Aluno" mostra "Aluno agendado"
- Apenas esse horário específico mudou de status

### Passo 3: Teste os filtros

- Clique em "Todas" - mostra todos os horários
- Clique em "Próximas" - mostra apenas agendadas
- Clique em "Passadas" - mostra aulas do passado (nenhuma ainda)

### Passo 4: Teste deletar um horário

- Clique no ícone de lixeira em um horário
- Confirme a deleção
- O horário deve desaparecer

---

## Teste 5: Validação de Formulário

### Teste 5.1: Campos obrigatórios

Deixe os campos vazios e tente adicionar:
```
Data: [vazio]
Hora de Início: [vazio]
Hora de Término: [vazio]
```

Deve aparecer erro: "Campos obrigatórios - Preencha todos os campos obrigatórios"

### Teste 5.2: Hora inválida

Preencha com:
```
Data: 01/02/2026
Hora de Início: 15:00
Hora de Término: 14:00 (anterior ao início)
```

Deve aparecer erro: "A hora de início deve ser anterior à hora de término"

### Teste 5.3: Data no passado

Preencha com:
```
Data: 20/01/2026 (data passada)
Hora de Início: 09:00
Hora de Término: 10:00
```

O campo de data não deve permitir seleção de datas passadas (input type="date" com min).

---

## Teste 6: Responsividade

Teste em diferentes tamanhos de tela:

- ✅ **Desktop (1920px)**: Cards em 3 colunas
- ✅ **Tablet (768px)**: Cards em 2 colunas
- ✅ **Mobile (375px)**: Cards em 1 coluna

Redimensione a janela do navegador e verifique se o layout se adapta.

---

## Teste 7: Estados de Loading

### Passo 1: Adicione horário lentamente

Adicione um horário e observe o botão:
- Antes: "Adicionar Horário"
- Durante: "Adicionando..." com ícone girando
- Depois: Volta ao normal

### Passo 2: Cancele antes de terminar

Se clicar múltiplas vezes no botão, apenas uma requisição deve ser feita.

### Passo 3: Agendamento com loading

Ao clicar "Agendar", o botão deve:
- Mostrar ícone girando
- Desabilitar cliques adicionais
- Mostrar texto "Agendando..."

---

## Teste 8: Casos Extremos

### Teste 8.1: Múltiplos agendamentos

1. Trainer cria 10 horários
2. Aluno agenda todos rapidamente
3. Verificar que apenas horários `available` aparecem na lista
4. Verificar que nenhum horário é duplicado

### Teste 8.2: Mesmo horário não pode ser criado duas vezes

Trainer tenta criar:
```
Data: 31/01/2026
Hora: 09:00 - 10:00
```

Depois tenta criar novamente com os mesmos dados.

Deve dar erro (constraint no banco de dados).

### Teste 8.3: Múltiplos trainers

1. Crie contas de 2 trainers
2. Cada um adiciona horários
3. Aluno visualiza perfil de trainer 1 - vê apenas horários de trainer 1
4. Aluno visualiza perfil de trainer 2 - vê apenas horários de trainer 2

---

## Checklist de Testes

- [ ] Trainer consegue adicionar horários
- [ ] Horários aparecem na tabela como "Disponível"
- [ ] Aluno consegue visualizar horários no perfil público
- [ ] Aluno consegue agendar um horário
- [ ] Horário agendado desaparece da lista de disponíveis
- [ ] Trainer vê aula como "Agendada" na tabela
- [ ] Trainer consegue deletar horários
- [ ] Validações de formulário funcionam
- [ ] Layout é responsivo
- [ ] Estados de loading aparecem
- [ ] Filtros funcionam corretamente
- [ ] Dados aparecem corretos no banco

---

## Logs Esperados

Abra o console do navegador (F12) e verifique:

```javascript
// Ao adicionar horário:
// ✅ POST para lessons com sucesso
// ✅ Toast de sucesso

// Ao agendar:
// ✅ UPDATE para lessons com sucesso
// ✅ Toast de sucesso
// ✅ Horário desaparece da lista

// Ao deletar:
// ✅ DELETE para lessons com sucesso
// ✅ Toast de sucesso
```

Não deve haver erros vermelhos no console.

---

## Troubleshooting

### Problema: "Nenhum horário disponível"
- Verifique se o trainer adicionou horários com data futura
- Verifique o filtro de dias (7, 14, 30)
- Confirme que o horário tem status `available` no banco

### Problema: Botão "Agendar" desabilitado
- Verifique se está autenticado
- Tente fazer logout e login novamente
- Verifique o console para erros

### Problema: "Erro ao carregar horários"
- Verifique se a migration foi aplicada
- Confirme que as RLS policies estão corretas
- Verifique a conexão com o banco de dados

### Problema: Hora inválida não é validada
- Atualize a página (F5)
- Limpe o cache do navegador
- Verifique o console para erros JavaScript

---

## Sucesso! 🎉

Se todos os testes passarem, o sistema de agendamento está funcionando corretamente!
