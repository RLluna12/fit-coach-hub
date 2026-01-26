# Instruções para Aplicar a Migration de Agendamentos

## Opção 1: Usar Supabase CLI (Recomendado)

### 1. Certifique-se que o Supabase CLI está instalado

```bash
# Instalar globalmente (se não tiver)
npm install -g supabase

# Ou use bun
bun install -g supabase
```

### 2. Link ao seu projeto (se não estiver linkado)

```bash
supabase link --project-ref ajfygxhrjqhvgkmgelcp
```

### 3. Apply a migration

```bash
supabase migration up
```

Ou se preferir aplicar apenas a migration de agendamentos:

```bash
supabase db push supabase/migrations/20260126000000_create_lessons_table.sql
```

## Opção 2: Via Supabase Dashboard

### 1. Acesse o SQL Editor

- Vá para https://app.supabase.com
- Selecione seu projeto
- Clique em "SQL Editor" no menu lateral

### 2. Crie uma nova query

- Clique em "New Query"
- Copie o conteúdo do arquivo: `supabase/migrations/20260126000000_create_lessons_table.sql`
- Cole o conteúdo no editor
- Clique em "Run"

## Opção 3: Via pgAdmin ou ferramentas similares

Se você tem acesso direto ao PostgreSQL:

1. Copie o conteúdo da migration
2. Execute no seu cliente SQL
3. Verifique se as tabelas foram criadas

## Verificar se a Migration Foi Aplicada

### Via Supabase Dashboard

1. Vá para "Database" → "Tables"
2. Procure pela tabela `lessons`
3. Verifique se os campos existem:
   - `id`, `trainer_id`, `student_id`
   - `scheduled_date`, `start_time`, `end_time`
   - `status`, `notes`
   - `created_at`, `updated_at`

### Via SQL

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'lessons';

-- Ver estrutura da tabela
\d lessons
```

## Troubleshooting

### Erro: "Table already exists"

A tabela `lessons` já existe no seu banco. Você pode:

1. Deletar e recriar (apenas em development):
   ```sql
   DROP TABLE IF EXISTS public.lessons CASCADE;
   ```

2. Ou ignorar o erro e prosseguir (a tabela já está criada)

### Erro: "Permission denied"

Certifique-se que:
- Você está logado com a conta correta
- Seu usuário tem permissões de criar tabelas
- O token do Supabase está válido

### Erro ao fazer push

Se os tipos de enumeração já existem:

```sql
DROP TYPE IF EXISTS public.lesson_status CASCADE;
```

Então reexecute a migration.

## Próximos Passos

1. ✅ Migration aplicada
2. ✅ Tabela `lessons` criada
3. ✅ RLS (Row Level Security) configurada
4. ✅ Componentes React implementados
5. 📝 Próximo: Atualizar o arquivo de tipos TypeScript (se necessário)

## Atualizar tipos TypeScript

Se você usa tipos gerados automaticamente, regenere-os:

```bash
supabase gen types typescript --project-id ajfygxhrjqhvgkmgelcp > src/integrations/supabase/types.ts
```

Ou use a CLI:

```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Testes

Após aplicar a migration, teste:

1. Acesse `/trainer/profile`
2. Você deve ver a seção "Adicionar Horários Disponíveis"
3. Adicione um horário de teste
4. Visualize o perfil público do trainer
5. Você deve ver a grid de "Horários Disponíveis"
6. Tente agendar uma aula
