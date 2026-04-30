// ============================================
// SERVER.JS - Bootstrap do projeto
// Responsabilidade: criar instância, registrar plugins/rotas, iniciar
// Este arquivo deve ser ENXUTO (só configuração)
// ============================================

require('dotenv').config();

const fastify = require('fastify')({
  logger: false // Desabilitamos o logger padrão pois temos nosso plugin
});

// ---- PLUGINS GLOBAIS ----
// Registrados aqui, afetam TODAS as rotas
fastify.register(require('@fastify/cors'), { origin: '*' });
fastify.register(require('../src/plugins/logger'));
fastify.register(require('../src/plugins/util'));

// ---- ROTAS COM AUTENTICAÇÃO ----
// O plugin de auth é registrado JUNTO com as rotas de produto
// Graças ao encapsulamento, o auth só afeta as rotas dentro deste register
fastify.register(async function rotasProtegidas(instance) {
  await instance.register(require('../src/plugins/auth'));
  await instance.register(require('../src/routes/produtoRoutes'));
});

// ---- ROTA RAIZ (fora do escopo de auth) ----
fastify.get('/', async () => {
  return {
    api: 'Demo Fastify - Produtos',
    versao: '1.0.0',
    rotas: {
      'GET  /':                          'Esta mensagem',
      'GET  /api/produtos':              'Listar todos os produtos',
      'GET  /api/produtos?categoria=X':  'Filtrar por categoria',
      'GET  /api/produtos/estatisticas': 'Estatísticas dos produtos',
      'GET  /api/produtos/:id':          'Buscar produto por ID',
      'POST /api/produtos':              'Criar produto (requer token)',
      'PUT  /api/produtos/:id':          'Atualizar produto (requer token)',
      'DELETE /api/produtos/:id':        'Remover produto (requer token)',
    },
    autenticacao: {
      rotas_publicas: 'GET (listar e buscar)',
      rotas_protegidas: 'POST, PUT, DELETE',
      como_autenticar: 'Header: Authorization: Bearer meu-token-secreto'
    }
  };
});

// ---- TRATAMENTO DE ERROS CENTRALIZADO ----
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;

  // Log do erro
  console.error(`[ERRO] ${request.method} ${request.url}: ${error.message}`);

  reply.code(statusCode).send({
    sucesso: false,
    erro: error.message || 'Erro interno do servidor',
    statusCode,
    // Em desenvolvimento, mostrar detalhes extras
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ---- INICIAR SERVIDOR ----
const PORT = process.env.PORT || 3000;

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('==========================================');
  console.log('  Demo Fastify - Produtos API');
  console.log('==========================================');
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('==========================================');
  console.log('');
  console.log('Rotas públicas (sem token):');
  console.log('  GET  /');
  console.log('  GET  /api/produtos');
  console.log('  GET  /api/produtos/:id');
  console.log('  GET  /api/produtos/estatisticas');
  console.log('  GET  /api/produtos?categoria=Tecnologia');
  console.log('');
  console.log('Rotas protegidas (com token):');
  console.log('  POST   /api/produtos');
  console.log('  PUT    /api/produtos/:id');
  console.log('  DELETE /api/produtos/:id');
  console.log('');
  console.log('Token: Authorization: Bearer meu-token-secreto');
  console.log('');
  console.log('Requisições:');
  console.log('------------------------------------------');
});
