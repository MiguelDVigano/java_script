// ============================================
// ROUTES: Camada de mapeamento
// Responsabilidade: mapear URL + método HTTP para o controller
// Aqui também ficam os schemas de validação
// ============================================

const controller = require('../controllers/produtoController');

// Schema de validação para criar/atualizar produto
const schemaCriar = {
  body: {
    type: 'object',
    required: ['nome', 'preco', 'categoria'],
    properties: {
      nome: { type: 'string', minLength: 2 },
      preco: { type: 'number', minimum: 0.01 },
      categoria: { type: 'string', minLength: 2 },
      estoque: { type: 'integer', minimum: 0, default: 0 }
    }
  }
};

const schemaAtualizar = {
  body: {
    type: 'object',
    properties: {
      nome: { type: 'string', minLength: 2 },
      preco: { type: 'number', minimum: 0.01 },
      categoria: { type: 'string', minLength: 2 },
      estoque: { type: 'integer', minimum: 0 }
    }
  },
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  }
};

async function produtoRoutes(fastify, options) {
  // GET /api/produtos - Listar todos (com filtro opcional ?categoria=Tecnologia)
  fastify.get('/api/produtos', controller.listar);

  // GET /api/produtos/estatisticas - Estatísticas (ANTES de :id para não conflitar)
  fastify.get('/api/produtos/estatisticas', controller.estatisticas);

  // GET /api/produtos/:id - Buscar por ID
  fastify.get('/api/produtos/:id', controller.buscar);

  // POST /api/produtos - Criar produto (com validação de schema)
  fastify.post('/api/produtos', { schema: schemaCriar }, controller.criar);

  // PUT /api/produtos/:id - Atualizar produto
  fastify.put('/api/produtos/:id', { schema: schemaAtualizar }, controller.atualizar);

  // DELETE /api/produtos/:id - Remover produto
  fastify.delete('/api/produtos/:id', controller.deletar);
}

module.exports = produtoRoutes;
