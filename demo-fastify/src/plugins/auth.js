// ============================================
// PLUGIN: Autenticação simples por token
// Demonstra: hook preHandler e decorator
// preHandler executa ANTES do handler da rota
// ============================================

const fp = require('fastify-plugin');

async function authPlugin(fastify, options) {
  // DECORATOR: adiciona propriedade 'usuario' ao request
  // Decorators estendem objetos existentes sem modificar o código original
  // É como instalar um acessório novo no carro
  fastify.decorateRequest('usuario', null);

  // HOOK: preHandler - executa antes de cada handler
  // Verifica se o header 'authorization' está presente
  fastify.addHook('preHandler', async (request, reply) => {
    // Rotas públicas: GET (listar e buscar são públicos)
    if (request.method === 'GET') {
      return; // Permite acesso sem token
    }

    const token = request.headers['authorization'];

    // Rotas protegidas: POST, PUT, DELETE precisam de token
    if (!token) {
      return reply.code(401).send({
        sucesso: false,
        erro: 'Token de autenticação não fornecido',
        dica: 'Envie o header: Authorization: Bearer meu-token-secreto'
      });
    }

    // Validação simples do token (em produção, usar JWT)
    if (token !== 'Bearer meu-token-secreto') {
      return reply.code(403).send({
        sucesso: false,
        erro: 'Token inválido'
      });
    }

    // Se o token é válido, decoramos o request com dados do usuário
    request.usuario = { id: 1, nome: 'Admin', role: 'admin' };
  });

  console.log('Plugin de autenticação registrado!');
}

// fp (fastify-plugin) faz o plugin NÃO encapsular
// Assim o hook de auth se propaga para as rotas registradas no mesmo escopo
module.exports = fp(authPlugin);
