// ============================================
// PLUGIN: Utilitários do servidor
// Demonstra: fastify.decorate() e decorateReply()
// Decorators adicionam funcionalidades extras ao servidor,
// request ou reply sem alterar o código original
// ============================================

async function utilPlugin(fastify, options) {

  // DECORATOR NO SERVIDOR: adiciona métodos utilitários à instância
  // Acessível em qualquer handler via this.util (usando function() e não arrow)
  fastify.decorate('util', {
    formatarData: (data) => {
      return new Date(data).toLocaleDateString('pt-BR');
    },
    formatarPreco: (valor) => {
      return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }
  });

  // DECORATOR NO REPLY: adiciona método de resposta de sucesso padronizado
  // Acessível em qualquer handler via reply.sucesso(dados)
  fastify.decorateReply('sucesso', function (dados, statusCode = 200) {
    return this.code(statusCode).send({
      sucesso: true,
      timestamp: new Date().toISOString(),
      dados
    });
  });

  // DECORATOR NO REPLY: resposta de erro padronizada
  fastify.decorateReply('erro', function (mensagem, statusCode = 400) {
    return this.code(statusCode).send({
      sucesso: false,
      timestamp: new Date().toISOString(),
      erro: mensagem
    });
  });

  console.log('Plugin de utilitários registrado!');
}

module.exports = utilPlugin;
