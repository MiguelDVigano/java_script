// ============================================
// EXERCÍCIO: API HTTP - Catálogo de Produtos
// Complete o código nos locais marcados com TODO
// Execute com: node exercicio.js
// Teste com: curl http://localhost:3000
// ============================================

// TODO 1: Importe os módulos http e os
const http = require('http');
const os = require('os');

const PORTA = 3000;

// TODO 2: Crie um array com pelo menos 4 produtos
// Cada produto deve ter: id, nome, preco, categoria
// Exemplo:
// const produtos = [
//   { id: 1, nome: 'Camiseta Node.js', preco: 59.90, categoria: 'Vestuário' },
//   ...
// ];
const produtos = [
  { id: 1, nome: 'Camiseta Node.js', preco: 59.9, categoria: 'Vestuário' },
  { id: 2, nome: 'Caneca JavaScript', preco: 29.9, categoria: 'Acessórios' },
  { id: 3, nome: 'Livro de Backend', preco: 89.9, categoria: 'Livros' },
  { id: 4, nome: 'Mouse Gamer', preco: 149.9, categoria: 'Eletrônicos' }
];

// Função auxiliar para enviar JSON (pode usar diretamente)
function enviarJSON(res, statusCode, dados) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(dados, null, 2));
}

// TODO 3: Crie o servidor com http.createServer
const servidor = http.createServer((req, res) => {
  // TODO 4: Log da requisição no terminal
  // Formato: [HH:MM:SS] MÉTODO /rota
  const hora = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  console.log(`[${hora}] ${req.method} ${req.url}`);

  // TODO 5: Roteamento

  // GET / -> Informações da API (JSON com mensagem e rotas disponíveis)
  if (req.method === 'GET' && req.url === '/') {
    return enviarJSON(res, 200, {
      mensagem: 'API de Catálogo de Produtos',
      rotas: ['GET /', 'GET /api/produtos', 'GET /api/info']
    });
  }

  // GET /api/produtos -> Lista de todos os produtos (com total e array)
  if (req.method === 'GET' && req.url === '/api/produtos') {
    return enviarJSON(res, 200, {
      total: produtos.length,
      produtos
    });
  }

  // GET /api/info -> Informações do servidor com módulo os
  //   Retornar: plataforma, versão do Node, memória total/livre, hostname
  if (req.method === 'GET' && req.url === '/api/info') {
    return enviarJSON(res, 200, {
      plataforma: os.platform(),
      versaoNode: process.version,
      memoriaTotal: os.totalmem(),
      memoriaLivre: os.freemem(),
      hostname: os.hostname()
    });
  }

  // Qualquer outra rota -> Status 404 com JSON de erro
  return enviarJSON(res, 404, {
    erro: 'Rota não encontrada',
    rota: req.url
  });
});

// TODO 6: Inicie o servidor
servidor.listen(PORTA, () => {
  console.log(`API rodando em http://localhost:${PORTA}`);
});
