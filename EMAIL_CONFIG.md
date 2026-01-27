# Configuração de Email - Resend (Recomendado)

## Opção 1: Usar Resend (Gratuito e Confiável) ✅ RECOMENDADO

### 1. Criar conta Resend
1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta (gratuita)
3. Copie sua API Key

### 2. Configurar no Supabase
1. Acesse seu projeto Supabase
2. Vá em **Settings** → **Edge Functions**
3. Copie o arquivo `index-resend.ts` para `index.ts`:
   ```bash
   cp supabase/functions/send-lesson-email/index-resend.ts supabase/functions/send-lesson-email/index.ts
   ```
4. Adicione a variável de ambiente:
   - Dashboard Supabase → **Settings** → **Edge Functions**
   - Clique em **send-lesson-email**
   - Adicione: `RESEND_API_KEY = seu_api_key_aqui`

### 3. Usar domínio personalizado (Opcional)
No código, mude:
```typescript
from: "noreply@mypersonaltrainer.com",
```
Para seu domínio: `from: "noreply@seudominio.com"`

Depois configure o domínio no Resend dashboard.

---

## Opção 2: Usar Supabase Email (Simples)

Se você quer usar apenas Supabase sem dependências externas:

### Usar a API built-in do Supabase
Modifique o `index.ts` para usar:
```typescript
// Enviar email direto via Supabase (sem serviço externo)
// Isso requer configuração de SMTP no Supabase
```

---

## Opção 3: Modo Desenvolvimento (Atual)

Atualmente, a edge function:
- ✅ Busca os dados corretamente
- ✅ Loga no console (você pode ver no Supabase logs)
- ✅ Não causa erro no agendamento
- ❌ Não envia email real

Para ver os logs:
1. Supabase Dashboard
2. **Functions** → **send-lesson-email**
3. Vá na aba **Logs**

---

## Como Testar

### Teste 1: Sem Email (Desenvolvimento)
1. Aluno agenda uma aula
2. Abra Supabase Dashboard → Functions → Logs
3. Veja os logs com os dados da aula

### Teste 2: Com Resend (Produção)
1. Configure Resend API Key
2. Aluno agenda uma aula
3. Email é enviado para o personal trainer

---

## Troubleshooting

**"RESEND_API_KEY não encontrada"**
- Adicione no Supabase Dashboard → Settings → Edge Functions
- Redeploy a função

**"Email não chegou"**
- Verifique spam/lixo
- Confirme email do trainer no perfil
- Veja os logs da função

**"Erro na função"**
- Abra Supabase Dashboard → Functions → Logs
- Procure por mensagens de erro
