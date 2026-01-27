# Como Configurar o Envio de Email

Quando um aluno agenda uma aula, um email é enviado automaticamente para o personal trainer com os dados do aluno e horário da aula.

## Arquivos Criados/Modificados

1. **Edge Function**: `supabase/functions/send-lesson-email/index.ts`
   - Busca dados do aluno, do personal e da aula
   - Envia email usando o serviço de email do Supabase Auth
   
2. **Componente**: `src/components/AvailableLessonsGrid.tsx`
   - Chamada da edge function após agendamento bem-sucedido
   - Email é enviado de forma assíncrona (não bloqueia o agendamento)

## Pré-requisitos

### 1. Personal Trainer precisa ter email cadastrado
- O email é armazenado na tabela `profiles` (coluna `email`)
- Sem email, o sistema detecta e não tenta enviar (aviso no console)

### 2. Aluno precisa ter email e telefone cadastrados (opcional)
- Email: obtido automaticamente do `auth.users`
- Telefone: obtido da tabela `profiles`

### 3. Configurar variáveis de ambiente do Supabase
No arquivo `.env.local`:
```
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

## Como Testar

1. **Fazer login como personal trainer**
   - Certifique-se de que tem email cadastrado no perfil
   - Adicione horários disponíveis

2. **Fazer login como aluno**
   - Abra o perfil público do personal
   - Clique em "Agendar Aula"
   - Confirme o agendamento

3. **Verificar email**
   - Verifique a caixa de entrada do personal trainer
   - O email deve conter:
     - Nome do aluno
     - Email do aluno
     - Telefone do aluno
     - Data da aula
     - Horário (início e fim)
     - Notas da aula (se houver)

## Implementação da Edge Function

Se preferir usar outro serviço de email (SendGrid, Resend, etc), você pode:

1. Instalar o pacote necessário em `supabase/functions/send-lesson-email/`
2. Modificar a função para chamar a API do seu serviço de email
3. Adicionar as variáveis de ambiente necessárias no Supabase Dashboard

Exemplo com Resend:
```typescript
const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
  },
  body: JSON.stringify({
    from: "noreply@seuapp.com",
    to: trainerProfile.email,
    subject: "Nova aula agendada!",
    html: `...`, // seu HTML
  }),
});
```

## Troubleshooting

- **Email não enviado**: Verifique se o personal trainer tem email cadastrado
- **Função não encontrada**: Reinicie o `supabase functions serve`
- **Erro de autorização**: Verifique as permissões da `SERVICE_ROLE_KEY`
