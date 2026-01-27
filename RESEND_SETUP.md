# Como Adicionar RESEND_API_KEY no Supabase

## Passo a Passo

### 1. Abrir Supabase Dashboard
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Faça login com sua conta
3. Selecione seu projeto **fit-coach-hub** (ou o nome do seu projeto)

### 2. Ir para Secrets/Environment Variables
1. No painel lateral esquerdo, clique em **Settings** (engrenagem)
2. Procure por **Secrets** ou **Environment Variables**
3. Se não encontrar, vá em **Project Settings** → **Edge Functions**

### 3. Adicionar a Variável
1. Clique em **New Secret** ou **Add Variable**
2. Na tela que abrir:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Cole sua API key do Resend (copie de [https://resend.com/api-tokens](https://resend.com/api-tokens))
3. Clique em **Save** ou **Add**

### 4. Confirmar a Adição
- Você deve ver `RESEND_API_KEY` listada nas variáveis de ambiente
- O Supabase vai reiniciar as edge functions automaticamente

---

## Onde Encontrar a API Key do Resend

1. Acesse [https://resend.com](https://resend.com)
2. Faça login
3. Vá em **API Tokens** ou **Settings** → **API Keys**
4. Procure pelo token que começa com `re_`
5. Copie a chave completa

**Exemplo de API key:**
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Testar se Funcionou

### Teste 1: Verificar se a chave foi adicionada
1. Supabase Dashboard → Settings → Secrets
2. Veja se `RESEND_API_KEY` aparece na lista

### Teste 2: Enviar um email
1. Faça login como **aluno**
2. Vá no perfil de um **personal trainer**
3. Agende uma aula
4. **Verifique o email do personal trainer**
5. O email deve chegar em 1-2 minutos

### Teste 3: Verificar logs
Se o email não chegar:
1. Supabase Dashboard → **Functions**
2. Clique em **send-lesson-email**
3. Vá na aba **Logs** (botão azul no topo)
4. Veja se há mensagens de erro

---

## Resolução de Problemas

| Problema | Solução |
|----------|---------|
| "RESEND_API_KEY not found" | Verifique se adicionou corretamente no Supabase |
| Email não chegou | Verifique spam/lixo do trainer |
| Erro "Invalid API key" | Copie a chave completa (sem espaços) |
| Função não carrega | Aguarde 2-3 minutos após adicionar a variável |

---

## Próximas Configurações (Opcional)

### Usar um domínio personalizado
No código, mude:
```typescript
from: "noreply@mypersonaltrainer.com",
```

Para seu domínio real, depois configure no Resend:
1. Resend Dashboard → **Domains**
2. Adicione seu domínio
3. Configure os registros DNS
4. Use `noreply@seudominio.com` no código

---

## Confirmação de Sucesso

✅ Código pronto (Resend habilitado)
⏳ Aguardando: Adicionar API key no Supabase
📧 Resultado esperado: Emails chegam nos trainers ao agendar
