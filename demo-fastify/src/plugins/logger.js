// ============================================
// PLUGIN: Logger personalizado
// Demonstra: hooks onRequest e onResponse
// Hooks são pontos de interceptação no ciclo de vida
// ============================================

async function loggerPlugin(fastify, options) {
  // HOOK: onRequest - executa ANTES de tudo
  // Equivalente a um middleware de log no Express
  fastify.addHook('onRequest', async (request) => {
    // Armazena o timestamp de início para calcular duração
    request.inicioRequisicao = Date.now();
  });

  // HOOK: onResponse - executa APÓS enviar a resposta
  // Calcula quanto tempo a requisição levou
  fastify.addHook('onResponse', async (request, reply) => {
    const duracao = Date.now() - request.inicioRequisicao;
    const agora = new Date().toLocaleTimeString('pt-BR');
    console.log(
      `[${agora}] ${request.method} ${request.url} -> ${reply.statusCode} (${duracao}ms)`
    );
  });

  console.log('Plugin de logger registrado!');
}

module.exports = loggerPlugin;
