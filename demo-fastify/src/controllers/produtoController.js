// ============================================
// CONTROLLER: Camada de orquestração
// Responsabilidade: receber request, chamar model, montar response
// Não contém lógica de dados nem acesso direto ao banco
// ============================================

const model = require('../models/produtoModel');

// GET /api/produtos
const listar = async (request, reply) => {
  const { categoria } = request.query;
  const produtos = model.findAll(categoria);
  return {
    sucesso: true,
    total: produtos.length,
    dados: produtos
  };
};

// GET /api/produtos/:id
const buscar = async (request, reply) => {
  const { id } = request.params;
  const produto = model.findById(Number(id));

  if (!produto) {
    return reply.code(404).send({
      sucesso: false,
      erro: `Produto com ID ${id} não encontrado`
    });
  }

  return { sucesso: true, dados: produto };
};

// POST /api/produtos
const criar = async (request, reply) => {
  const novo = model.create(request.body);
  return reply.code(201).send({
    sucesso: true,
    mensagem: 'Produto criado com sucesso',
    dados: novo
  });
};

// PUT /api/produtos/:id
const atualizar = async (request, reply) => {
  const { id } = request.params;
  const atualizado = model.update(Number(id), request.body);

  if (!atualizado) {
    return reply.code(404).send({
      sucesso: false,
      erro: `Produto com ID ${id} não encontrado`
    });
  }

  return {
    sucesso: true,
    mensagem: 'Produto atualizado com sucesso',
    dados: atualizado
  };
};

// DELETE /api/produtos/:id
const deletar = async (request, reply) => {
  const { id } = request.params;
  const removido = model.remove(Number(id));

  if (!removido) {
    return reply.code(404).send({
      sucesso: false,
      erro: `Produto com ID ${id} não encontrado`
    });
  }

  return reply.code(204).send();
};

// GET /api/produtos/estatisticas
const estatisticas = async (request, reply) => {
  const stats = model.getEstatisticas();
  return { sucesso: true, dados: stats };
};

module.exports = { listar, buscar, criar, atualizar, deletar, estatisticas };
