const fs = require('fs');
const readline = require('readline');

// ============================================================
// 1. Nó da lista encadeada
// Representa uma tarefa com id, descrição e prioridade.
// O ponteiro 'proximo' aponta para o próximo nó da lista.
// ============================================================
class No {
  constructor(id, descricao, prioridade) {
    this.id = id;
    this.descricao = descricao;
    this.prioridade = prioridade; // 'Alta', 'Média', 'Baixa'
    this.proximo = null;          // ponteiro para o próximo nó
  }
}

// ============================================================
// 2. Lista Encadeada Manual
// Gerencia os nós, com inserção no fim, remoção por ID,
// busca por termo na descrição e exibição formatada.
// A estrutura é mantida com referências (simulando ponteiros).
// ============================================================
class ListaEncadeada {
  constructor() {
    this.cabeca = null;   // primeiro nó da lista
    this.proximoId = 1;   // controla o próximo ID a ser gerado
  }

  /**
   * Insere uma nova tarefa no final da lista.
   * @param {string} descricao - Descrição da tarefa.
   * @param {string} prioridade - Prioridade (valores válidos: 'Alta', 'Média', 'Baixa').
   * @returns {No} O nó recém-criado.
   */
  inserir(descricao, prioridade) {
    const novo = new No(this.proximoId++, descricao, prioridade);
    if (!this.cabeca) {
      // Lista vazia: o novo nó será a cabeça.
      this.cabeca = novo;
    } else {
      // Percorre até o último nó.
      let atual = this.cabeca;
      while (atual.proximo) {
        atual = atual.proximo;
      }
      atual.proximo = novo;
    }
    return novo;
  }

  /**
   * Remove a tarefa com o ID especificado.
   * @param {number} id - ID da tarefa a ser removida.
   * @returns {No|null} O nó removido, ou null se não encontrado.
   */
  remover(id) {
    if (!this.cabeca) return null;   // lista vazia

    // Caso especial: remoção da cabeça
    if (this.cabeca.id === id) {
      const removido = this.cabeca;
      this.cabeca = this.cabeca.proximo;
      return removido;
    }

    // Busca o nó anterior ao que será removido
    let anterior = this.cabeca;
    while (anterior.proximo && anterior.proximo.id !== id) {
      anterior = anterior.proximo;
    }

    if (anterior.proximo) {
      const removido = anterior.proximo;
      anterior.proximo = removido.proximo;   // "pula" o nó removido
      return removido;
    }

    return null;   // ID não encontrado
  }

  /**
   * Busca tarefas cuja descrição contenha o termo (case insensitive).
   * @param {string} termo - Termo a ser pesquisado.
   * @returns {No[]} Array com os nós que atendem ao critério.
   */
  buscar(termo) {
    const resultados = [];
    let atual = this.cabeca;
    const termoLower = termo.toLowerCase();

    while (atual) {
      if (atual.descricao.toLowerCase().includes(termoLower)) {
        resultados.push(atual);
      }
      atual = atual.proximo;
    }
    return resultados;
  }

  /**
   * Exibe todas as tarefas no console, formatadas.
   */
  exibir() {
    if (!this.cabeca) {
      console.log('📭 Nenhuma tarefa cadastrada.\n');
      return;
    }

    console.log('\n=== LISTA DE TAREFAS ===');
    let atual = this.cabeca;
    while (atual) {
      console.log(`[${atual.id}] ${atual.descricao} - Prioridade: ${atual.prioridade}`);
      atual = atual.proximo;
    }
    console.log('========================\n');
  }

  /**
   * Converte a lista encadeada em um array de objetos simples,
   * útil para serialização (salvar em JSON).
   * @returns {Object[]} Array com {id, descricao, prioridade}.
   */
  toArray() {
    const arr = [];
    let atual = this.cabeca;
    while (atual) {
      arr.push({
        id: atual.id,
        descricao: atual.descricao,
        prioridade: atual.prioridade
      });
      atual = atual.proximo;
    }
    return arr;
  }

  /**
   * Reconstrói a lista a partir de um array (ex.: após carregar arquivo).
   * @param {Object[]} arr - Array de objetos com {id, descricao, prioridade}.
   */
  fromArray(arr) {
    this.cabeca = null;
    this.proximoId = 1;

    for (const item of arr) {
      const novo = new No(item.id, item.descricao, item.prioridade);

      if (!this.cabeca) {
        this.cabeca = novo;
      } else {
        let atual = this.cabeca;
        while (atual.proximo) {
          atual = atual.proximo;
        }
        atual.proximo = novo;
      }

      // Mantém o próximo ID maior que o maior ID já usado
      if (item.id >= this.proximoId) {
        this.proximoId = item.id + 1;
      }
    }
  }
}

// ============================================================
// 3. Pilha Manual (implementação sem depender de array nativo)
// Utilizamos internamente um array, mas a interface é puramente
// manual (push, pop, peek, isEmpty). Em C++ seria com nós e ponteiros.
// ============================================================
class Pilha {
  constructor() {
    this.itens = [];   // armazenamento interno
  }

  push(elemento) {
    this.itens.push(elemento);
  }

  pop() {
    if (this.isEmpty()) return null;
    return this.itens.pop();
  }

  peek() {
    return this.isEmpty() ? null : this.itens[this.itens.length - 1];
  }

  isEmpty() {
    return this.itens.length === 0;
  }

  size() {
    return this.itens.length;
  }

  limpar() {
    this.itens = [];
  }
}

// ============================================================
// 4. Gerenciador de Tarefas (Sistema Principal)
// Controla a lista de tarefas, pilhas de undo/redo,
// e operações de arquivo.
// ============================================================
class GerenciadorTarefas {
  constructor() {
    this.lista = new ListaEncadeada();
    this.pilhaUndo = new Pilha();   // para desfazer ações
    this.pilhaRedo = new Pilha();   // para refazer ações (diferencial)
    this.arquivoAtual = 'tarefas.json';
  }

  /**
   * Registra uma ação nas pilhas de undo/redo.
   * Ao executar uma nova ação, limpa a pilha de redo (pois a história mudou).
   * @param {string} tipo - Tipo da ação ('REMOVER' ou 'INSERIR').
   * @param {Object} dados - Dados necessários para reverter/reaplicar.
   */
  registrarAcao(tipo, dados) {
    this.pilhaUndo.push({ tipo, dados });
    // Limpa o redo, pois qualquer nova ação invalida o histórico futuro
    this.pilhaRedo.limpar();
  }

  /**
   * Cadastra uma nova tarefa.
   * @param {string} descricao - Descrição da tarefa.
   * @param {string} prioridade - Prioridade (deve ser 'Alta', 'Média' ou 'Baixa').
   * @returns {boolean} true se cadastrada com sucesso.
   */
  cadastrarTarefa(descricao, prioridade) {
    // Validação da prioridade
    const prioridadesValidas = ['Alta', 'Média', 'Baixa', 'alta', 'média', 'baixa'];
    if (!prioridadesValidas.includes(prioridade)) {
      console.log('❌ Prioridade inválida. Use: Alta, Média ou Baixa.');
      return false;
    }

    const novaTarefa = this.lista.inserir(descricao, prioridade);
    // Ação reversa: remover a tarefa recém-criada
    this.registrarAcao('REMOVER', { id: novaTarefa.id });
    console.log(`✅ Tarefa "${descricao}" cadastrada com ID ${novaTarefa.id}.`);
    return true;
  }

  /**
   * Remove uma tarefa pelo ID.
   * @param {number} id - ID da tarefa a remover.
   * @returns {boolean} true se removida com sucesso.
   */
  removerTarefa(id) {
    const removida = this.lista.remover(id);
    if (!removida) {
      console.log(`❌ Tarefa com ID ${id} não encontrada.`);
      return false;
    }

    // Ação reversa: reinserir a mesma tarefa
    this.registrarAcao('INSERIR', {
      id: removida.id,
      descricao: removida.descricao,
      prioridade: removida.prioridade
    });
    console.log(`🗑️ Tarefa "${removida.descricao}" removida.`);
    return true;
  }

  /**
   * Desfaz a última ação (undo).
   * Move a ação desfeita para a pilha de redo, permitindo refazê-la depois.
   */
  desfazer() {
    if (this.pilhaUndo.isEmpty()) {
      console.log('⚠️ Nada para desfazer. Pilha vazia.');
      return;
    }

    const acao = this.pilhaUndo.pop();
    // Antes de executar a reversão, salvamos a ação original na pilha de redo
    // para possibilitar o refazer.
    this._executarReversao(acao);
    this.pilhaRedo.push(acao);
  }

  /**
   * Refaz a última ação desfeita (redo).
   */
  refazer() {
    if (this.pilhaRedo.isEmpty()) {
      console.log('⚠️ Nada para refazer. Pilha de redo vazia.');
      return;
    }

    const acao = this.pilhaRedo.pop();
    // Reaplica a ação original
    this._executarAcaoOriginal(acao);
    // A ação volta para a pilha de undo, pois agora é a última ação realizada
    this.pilhaUndo.push(acao);
  }

  /**
   * Executa a operação reversa de uma ação desfeita (usada pelo undo).
   * @param {Object} acao - Objeto com tipo e dados.
   */
  _executarReversao(acao) {
    if (acao.tipo === 'REMOVER') {
      // Desfazer um cadastro → remover a tarefa criada
      const { id } = acao.dados;
      const removida = this.lista.remover(id);
      if (removida) {
        console.log(`↩️ Desfeito: tarefa "${removida.descricao}" removida (ID ${id}).`);
      } else {
        console.log(`⚠️ Erro ao desfazer: tarefa ID ${id} não encontrada.`);
      }
    } else if (acao.tipo === 'INSERIR') {
      // Desfazer uma remoção → reinserir a tarefa com seu ID original
      const { id, descricao, prioridade } = acao.dados;
      this._inserirComId(id, descricao, prioridade);
      console.log(`↩️ Desfeito: tarefa "${descricao}" restaurada (ID ${id}).`);
    }
  }

  /**
   * Executa a ação original (usada pelo redo).
   * @param {Object} acao - Objeto com tipo e dados.
   */
  _executarAcaoOriginal(acao) {
    if (acao.tipo === 'REMOVER') {
      // Reaplicar um cadastro que foi desfeito → cadastrar novamente
      // ATENÇÃO: não chamamos cadastrarTarefa para não criar novo registro de undo.
      // Apenas inserimos a tarefa com os dados originais.
      // Mas não temos o ID original salvo (no undo REMOVER, salvamos apenas o id).
      // Portanto, precisamos guardar a descrição e prioridade junto no registro de REMOVER.
      // Solução: modificar o registro de REMOVER para incluir os dados da tarefa.
      // Abaixo é feita essa adaptação (ver cadastrarTarefa alterado).
      // Como o código original não fazia isso, vou corrigir a chamada.
      // Vou ajustar o registrarAcao em cadastrarTarefa para incluir os dados completos.
    }
    // Como a explicação ficaria longa, optei por já deixar pronto na versão final.
  }

  /**
   * Insere uma tarefa com um ID específico (usado para restaurar após undo/redo).
   * @param {number} id - ID desejado.
   * @param {string} descricao
   * @param {string} prioridade
   */
  _inserirComId(id, descricao, prioridade) {
    const no = new No(id, descricao, prioridade);

    // Inserção ordenada por ID (não obrigatória, mas mantém coerência)
    if (!this.lista.cabeca || this.lista.cabeca.id > id) {
      no.proximo = this.lista.cabeca;
      this.lista.cabeca = no;
    } else {
      let atual = this.lista.cabeca;
      while (atual.proximo && atual.proximo.id < id) {
        atual = atual.proximo;
      }
      no.proximo = atual.proximo;
      atual.proximo = no;
    }

    // Atualiza o próximo ID, se necessário
    if (id >= this.lista.proximoId) {
      this.lista.proximoId = id + 1;
    }
  }

  /**
   * Busca tarefas que contenham o termo na descrição.
   * @param {string} termo - Palavra-chave para busca.
   */
  buscarTarefas(termo) {
    const resultados = this.lista.buscar(termo);
    if (resultados.length === 0) {
      console.log(`🔍 Nenhuma tarefa encontrada com "${termo}".`);
    } else {
      console.log(`\n🔎 Resultados para "${termo}":`);
      resultados.forEach(t => {
        console.log(`  [${t.id}] ${t.descricao} - ${t.prioridade}`);
      });
    }
    console.log('');
  }

  /**
   * Salva as tarefas atuais em um arquivo JSON.
   */
  salvarArquivo() {
    try {
      const dados = {
        tarefas: this.lista.toArray(),
        proximoId: this.lista.proximoId
      };
      fs.writeFileSync(this.arquivoAtual, JSON.stringify(dados, null, 2), 'utf8');
      console.log(`💾 Dados salvos em "${this.arquivoAtual}".`);
    } catch (erro) {
      console.error('❌ Erro ao salvar arquivo:', erro.message);
    }
  }

  /**
   * Carrega as tarefas de um arquivo JSON.
   * As pilhas de undo/redo são limpas após o carregamento.
   */
  carregarArquivo() {
    try {
      if (!fs.existsSync(this.arquivoAtual)) {
        console.log(`⚠️ Arquivo "${this.arquivoAtual}" não encontrado. Nada carregado.`);
        return;
      }
      const conteudo = fs.readFileSync(this.arquivoAtual, 'utf8');
      const dados = JSON.parse(conteudo);
      this.lista.fromArray(dados.tarefas);
      this.lista.proximoId = dados.proximoId;
      console.log(`📂 Tarefas carregadas de "${this.arquivoAtual}".`);
      // Histórico de desfazer/refazer não faz sentido após carregar
      this.pilhaUndo.limpar();
      this.pilhaRedo.limpar();
    } catch (erro) {
      console.error('❌ Erro ao carregar arquivo:', erro.message);
    }
  }
}

// ============================================================
// 5. Interface de terminal (readline)
// ============================================================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function perguntar(pergunta) {
  return new Promise(resolve => rl.question(pergunta, resolve));
}

// Corrigindo o método cadastrarTarefa para incluir os dados completos no undo
// Isso permite que o redo funcione corretamente.
// Vou sobrescrever a classe após a declaração? Melhor redefinir no local certo.
// Vou reescrever a classe GerenciadorTarefas com as correções e já integrar as chamadas.
// Como o código original já foi definido, farei uma pequena correção inline.

// *** Correção: o método cadastrarTarefa precisa salvar descrição e prioridade no undo
// para o redo poder recriar a tarefa. Modificarei diretamente.

GerenciadorTarefas.prototype.cadastrarTarefa = function(descricao, prioridade) {
  const prioridadesValidas = ['Alta', 'Média', 'Baixa', 'alta', 'média', 'baixa'];
  if (!prioridadesValidas.includes(prioridade)) {
    console.log('❌ Prioridade inválida. Use: Alta, Média ou Baixa.');
    return false;
  }

  const novaTarefa = this.lista.inserir(descricao, prioridade);
  // Salva os dados completos para o undo/redo
  this.registrarAcao('REMOVER', {
    id: novaTarefa.id,
    descricao: novaTarefa.descricao,
    prioridade: novaTarefa.prioridade
  });
  console.log(`✅ Tarefa "${descricao}" cadastrada com ID ${novaTarefa.id}.`);
  return true;
};

// E a execução original do redo deve usar os dados completos.
GerenciadorTarefas.prototype._executarAcaoOriginal = function(acao) {
  if (acao.tipo === 'REMOVER') {
    // Reaplica o cadastro: a ação original é REMOVER (porque a operação inicial foi cadastrar,
    // e sua reversa é remover). Para refazer o cadastro, precisamos dos dados da tarefa.
    const { id, descricao, prioridade } = acao.dados;
    // Mas atenção: o ID já existia. Para refazer, precisamos inserir novamente com o mesmo ID?
    // Sim, pois o undo removeu a tarefa. Então refazer significa recriar a tarefa exatamente como era.
    this._inserirComId(id, descricao, prioridade);
    console.log(`↪️ Refazer: tarefa "${descricao}" cadastrada novamente (ID ${id}).`);
  } else if (acao.tipo === 'INSERIR') {
    // Ação original foi remover, então refazer a remoção
    const { id } = acao.dados; // dados contém id, descricao, prioridade da tarefa removida
    const removida = this.lista.remover(id);
    if (removida) {
      console.log(`↪️ Refazer: tarefa "${removida.descricao}" removida novamente (ID ${id}).`);
    } else {
      console.log(`⚠️ Erro ao refazer remoção: ID ${id} não encontrado.`);
    }
  }
};

// Agora o método _executarReversao também precisa ajustar para usar os dados completos
GerenciadorTarefas.prototype._executarReversao = function(acao) {
  if (acao.tipo === 'REMOVER') {
    // Reverter cadastro → remover a tarefa (usando id)
    const { id } = acao.dados;
    const removida = this.lista.remover(id);
    if (removida) {
      console.log(`↩️ Desfeito: tarefa "${removida.descricao}" removida (ID ${id}).`);
    } else {
      console.log(`⚠️ Erro ao desfazer: tarefa ID ${id} não encontrada.`);
    }
  } else if (acao.tipo === 'INSERIR') {
    // Reverter remoção → reinserir a tarefa
    const { id, descricao, prioridade } = acao.dados;
    this._inserirComId(id, descricao, prioridade);
    console.log(`↩️ Desfeito: tarefa "${descricao}" restaurada (ID ${id}).`);
  }
};

// ============================================================
// 6. Função principal (menu interativo)
// ============================================================
async function main() {
  const sistema = new GerenciadorTarefas();
  console.log('\n📌 SISTEMA DE GERENCIAMENTO DE TAREFAS (com Undo/Redo)');

  let opcao;
  do {
    console.log(`
╔══════════════════════════════════╗
║          MENU PRINCIPAL          ║
╠══════════════════════════════════╣
║ 1. Cadastrar tarefa              ║
║ 2. Remover tarefa                ║
║ 3. Buscar tarefa                 ║
║ 4. Listar todas                  ║
║ 5. Desfazer (Undo)               ║
║ 6. Refazer (Redo)                ║
║ 7. Salvar em arquivo             ║
║ 8. Carregar de arquivo           ║
║ 0. Sair                          ║
╚══════════════════════════════════╝
`);
    opcao = await perguntar('Escolha: ');

    switch (opcao) {
      case '1': {
        const desc = await perguntar('Descrição da tarefa: ');
        if (!desc.trim()) {
          console.log('❌ Descrição não pode ser vazia.');
          break;
        }
        const prioridade = await perguntar('Prioridade (Alta/Média/Baixa): ');
        sistema.cadastrarTarefa(desc, prioridade);
        break;
      }
      case '2': {
        const id = parseInt(await perguntar('ID da tarefa a remover: '));
        if (isNaN(id)) console.log('❌ ID inválido.');
        else sistema.removerTarefa(id);
        break;
      }
      case '3': {
        const termo = await perguntar('Termo para buscar: ');
        sistema.buscarTarefas(termo);
        break;
      }
      case '4':
        sistema.lista.exibir();
        break;
      case '5':
        sistema.desfazer();
        break;
      case '6':
        sistema.refazer();
        break;
      case '7':
        sistema.salvarArquivo();
        break;
      case '8':
        sistema.carregarArquivo();
        break;
      case '0':
        console.log('👋 Encerrando...');
        break;
      default:
        console.log('⚠️ Opção inválida.');
    }
  } while (opcao !== '0');

  rl.close();
}

main().catch(console.error);