## Plano de Arquitetura: Buffer de Gravação para Progresso de Aulas
Tecnologias: Next.js (Concentrador / API), Expo (Aplicativo do Aluno), Supabase (Banco de Dados) e Redis (Fila de Gravação).
------------------------------
## 📌 1. Visão Geral da Arquitetura (Write-Behind Cache)
Para evitar que cada clique de "Aula Concluída" faça um insert instantâneo no Supabase (gerando gargalos com milhares de alunos), o Next.js agirá como um concentrador de escrita. O progresso é salvo na hora para o aluno na memória e enviado ao banco em lotes (bulk updates) a cada 10 segundos.

[ EXPO (Aluno) ] 
       │ 
       ▼ (Envia progresso individual)
[ NEXT.JS (API Route / Concentrador) ] ─── (Salva em Cache) ───► [ REDIS (Fila / Queue) ]
       │
       ▼ (Script Cron/Worker Executa a cada 10s e limpa a fila)
[ SUPABASE (Banco de Dados) ] ◄─── (Envia 1 única Query em lote para X alunos)

------------------------------
## ⚙️ 2. Código de Implementação## Passo 1: Criar a Rota que Recebe o Progresso no Next.js
O aplicativo do aluno bate aqui de forma ultra rápida. O dado é jogado para uma fila no Redis.

// app/api/progress/route.tsimport { NextResponse } from 'next/server';import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();
export async function POST(request: Request) {
  try {
    const { userId, lessonId, courseId, completed } = await request.json();

    const payload = { userId, lessonId, courseId, completed, updatedAt: new Date().toISOString() };

    // Adiciona o registro de progresso em uma lista (fila) no Redis
    await redis.rpush('queue:progress', JSON.stringify(payload));

    // Retorna sucesso imediato para o app do aluno não ficar travado esperando o banco
    return NextResponse.json({ success: true, message: 'Progresso enfileirado' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar progresso' }, { status: 500 });
  }
}

## Passo 2: Criar o Concentrador de Lote (Bulk Consumer) no Next.js
Este endpoint processará todas as linhas acumuladas na fila do Redis de uma só vez e fará um único insert no Supabase.

// app/api/progress/process-queue/route.tsimport { NextResponse } from 'next/server';import { Redis } from '@upstash/redis';import { createClient } from '@supabase/supabase-js';
const redis = Redis.fromEnv();const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST() {
  try {
    // 1. Remove e traz todos os itens acumulados na fila do Redis
    const items = await redis.lrange('queue:progress', 0, -1);
    
    if (items.length === 0) {
      return NextResponse.json({ message: 'Nenhum progresso para processar' });
    }

    // Limpa a fila processada do Redis
    await redis.ltrim('queue:progress', items.length, -1);

    // 2. Converte as strings JSON de volta para objetos mapeados
    const progressRecords = items.map((item: string) => JSON.parse(item));

    // Mapeia os dados para o formato exato da sua tabela do Supabase
    const bulkData = progressRecords.map((rec: any) => ({
      user_id: rec.userId,
      lesson_id: rec.lessonId,
      course_id: rec.courseId,
      is_completed: rec.completed,
      updated_at: rec.updatedAt
    }));

    // 3. Executa uma ÚNICA requisição de escrita em lote no Supabase
    const { error } = await supabase
      .from('user_progress')
      .upsert(bulkData, { onConflict: 'user_id,lesson_id' }); // Evita duplicidade

    if (error) throw error;

    return NextResponse.json({ success: true, processedCount: bulkData.length });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao descarregar lote no banco' }, { status: 500 });
  }
}

## Passo 3: Agendar a Automação (Cron Job)
Para acionar o processamento em lote a cada 10 segundos (ou 1 minuto, dependendo do volume), adicione a configuração de Cron no seu arquivo da hospedagem (ex: vercel.json se estiver na Vercel):

{
  "crons": [
    {
      "path": "/api/progress/process-queue",
      "schedule": "* * * * *" 
    }
  ]
}

(Nota: Para intervalos menores de 1 minuto, você também pode usar um serviço externo gratuito de triggers HTTP como o Upstash QStash ou Cron-Job.org apontando para a sua URL a cada 10 segundos).
------------------------------
## 🚀 3. Benefícios do Modelo de Escrita

* Redução Crítica de I/O de Banco: Se 500 alunos concluírem uma aula no mesmo minuto, o Supabase receberá apenas 6 requisições de escrita (1 a cada 10s) em vez de 500 requisições individuais.
* Fim dos Travamentos (UX Fluida): O aplicativo do aluno (Expo) recebe o sinal de sucesso instantaneamente após bater no Next.js/Redis. A interface do app atualiza a barra de progresso imediatamente na tela sem depender da velocidade do banco de dados.


