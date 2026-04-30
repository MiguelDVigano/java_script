// ============================================
// MODEL: Camada de dados e regras de negócio
// Responsabilidade: gerenciar os dados (CRUD)
// Por enquanto usa array em memória
// Futuramente: substituir por banco de dados
// ============================================

let produtos = [
  { id: 1, nome: 'Notebook Dell', preco: 3500.00, categoria: 'Tecnologia', estoque: 15 },
  { id: 2, nome: 'Mouse Logitech', preco: 120.00, categoria: 'Acessórios', estoque: 80 },
  { id: 3, nome: 'Teclado Mecânico', preco: 250.00, categoria: 'Acessórios', estoque: 45 },
  { id: 4, nome: 'Monitor Samsung', preco: 1800.00, categoria: 'Tecnologia', estoque: 20 },
  { id: 5, nome: 'Cadeira Gamer', preco: 1200.00, categoria: 'Móveis', estoque: 10 },
];

let nextId = 6;

// Buscar todos (com filtro opcional por categoria)
const findAll = (categoria) => {
  if (categoria) {
    return produtos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
  }
  return produtos;
};

// Buscar por ID
const findById = (id) => {
  return produtos.find(p => p.id === id);
};

// Criar novo produto
const create = (data) => {
  const novo = { id: nextId++, ...data };
  produtos.push(novo);
  return novo;
};

// Atualizar produto existente
const update = (id, data) => {
  const index = produtos.findIndex(p => p.id === id);
  if (index === -1) return null;
  produtos[index] = { ...produtos[index], ...data };
  return produtos[index];
};

// Remover produto
const remove = (id) => {
  const index = produtos.findIndex(p => p.id === id);
  if (index === -1) return false;
  produtos.splice(index, 1);
  return true;
};

// Estatísticas (exemplo de regra de negócio no model)
const getEstatisticas = () => {
  const total = produtos.length;
  const valorTotal = produtos.reduce((sum, p) => sum + p.preco * p.estoque, 0);
  const categorias = [...new Set(produtos.map(p => p.categoria))];
  const maisBarato = produtos.reduce((min, p) => p.preco < min.preco ? p : min);
  const maisCaro = produtos.reduce((max, p) => p.preco > max.preco ? p : max);
  return { total, valorTotal, categorias, maisBarato, maisCaro };
};

module.exports = { findAll, findById, create, update, remove, getEstatisticas };
