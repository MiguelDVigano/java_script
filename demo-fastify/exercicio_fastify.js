// TODO 1: Importe o Fastify e o módulo `os`
const Fastify = require('fastify');
const os = require('os');

const PORTA = 3000;

// TODO 2: Crie um array com pelo menos 4 produtos
// Cada produto deve ter: id, nome, preco, categoria
const produtos = [
  { id: 1, nome: 'Camiseta Fastify', preco: 69.90, categoria: 'Vestuário' },
  { id: 2, nome: 'Boné Fastify', preco: 39.90, categoria: 'Acessórios' },
  { id: 3, nome: 'Caneca Rápida', preco: 25.50, categoria: 'Cozinha' },
  { id: 4, nome: 'Livro Node', preco: 120.00, categoria: 'Livros' }
];

// Função auxiliar (opcional) para formatar resposta de lista
function respostaLista(total, items) {
  return { total, produtos: items };
}

// TODO 3: Crie a instância do Fastify
const fastify = Fastify({ logger: true });

// TODO 4: Registre uma rota GET / que retorna informações básicas da API
// Retornar JSON com: mensagem e rotas disponíveis (array)
fastify.get('/', async (request, reply) => {
  return {
    mensagem: 'API Catálogo Fastify',
    rotas: [
      'GET /api/produtos',
      'GET /api/produtos/:id',
      'POST /api/produtos',
      'GET /api/info'
    ]
  };
});

// Rota extra para /api/info, usando o módulo `os` (importado no TODO 1)
fastify.get('/api/info', async (request, reply) => {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memoriaTotal: os.totalmem(),
    memoriaLivre: os.freemem(),
    uptime: os.uptime()
  };
});

// TODO 5: Registre a rota GET /api/produtos
// Deve retornar status 200 com o objeto da função respostaLista
fastify.get('/api/produtos', async (request, reply) => {
  reply.code(200);
  return respostaLista(produtos.length, produtos);
});

// TODO 6: Registre a rota GET /api/produtos/:id
// Deve extrair o id dos params, procurar o produto e:
// - se encontrado: retornar 200 com o objeto do produto
// - se não: retornar 404 com { erro: 'Produto não encontrado' }
fastify.get('/api/produtos/:id', async (request, reply) => {
  const { id } = request.params;
  const idNum = parseInt(id, 10);
  const produto = produtos.find(p => p.id === idNum);

  if (!produto) {
    reply.code(404);
    return { erro: 'Produto não encontrado' };
  }

  reply.code(200);
  return produto;
});

// TODO 7: Registre a rota POST /api/produtos
// Deve ler o body JSON e adicionar ao array `produtos`
// Regras simples:
// - `nome` obrigatório (string), `preco` obrigatório (number), `categoria` opcional (string)
// - atribuir um novo `id` (maxId + 1)
// - retornar 201 e o produto criado
fastify.post('/api/produtos', async (request, reply) => {
  const { nome, preco, categoria } = request.body;

  // Validações
  if (!nome || typeof nome !== 'string') {
    reply.code(400);
    return { erro: 'Campo "nome" é obrigatório e deve ser uma string.' };
  }
  if (preco === undefined || typeof preco !== 'number') {
    reply.code(400);
    return { erro: 'Campo "preco" é obrigatório e deve ser um número.' };
  }
  if (categoria !== undefined && typeof categoria !== 'string') {
    reply.code(400);
    return { erro: 'Campo "categoria" deve ser uma string, se fornecido.' };
  }

  // Gera novo id
  const maxId = produtos.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const novoProduto = {
    id: maxId + 1,
    nome,
    preco,
    categoria: categoria || 'Sem categoria'  // valor padrão se não informado
  };

  produtos.push(novoProduto);

  reply.code(201);
  return novoProduto;
});

// Inicialização do servidor
const start = async () => {
  try {
    await fastify.listen({ port: PORTA, host: '0.0.0.0' });
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();