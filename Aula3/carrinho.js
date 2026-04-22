class Carinho {
    Adicionar(nome, preco) {
        this.nome.push(nome);
        this.preco.push(preco);
        console.log(`Produto ${nome} adicionado com o preço de R$${preco}`);
    }  

    Listar() {
        console.log("Produtos no carrinho:");
        for (let i = 0; i < this.nome.length; i++) {
            console.log(`${this.nome[i]} - R$${this.preco[i]}`);
        }    
    }

    Total() {
        let total = 0;
        for (let i = 0; i < this.preco.length; i++) {
            total += this.preco[i];
        }
        console.log(`Total do carrinho: R$${total}`);
    }
}

const carrinho = new Carinho();
carrinho.nome = [];
carrinho.preco = [];
carrinho.Adicionar("Camiseta", 50);
carrinho.Adicionar("Calça", 100);
carrinho.Listar();
carrinho.Total(); 