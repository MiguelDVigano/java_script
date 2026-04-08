const nome = "Miguel";
const idade = 18;

if(idade < 18) {
    console.log(`${nome} é menor de idade.`);
}else
    if(idade >= 18 && idade < 60) {
        console.log(`${nome} é adulto.`);
    }else {
        console.log(`${nome} é idoso.`);
    }

const numeros = [1, 2, 3, 4, 5];
for(let i = 0 ; i < numeros.length; i++) { // length é o tamanho do array
    if(numeros[i] % 2 === 0) {
        console.log(`${numeros[i]} é par.`);
    }else {
        console.log(`${numeros[i]} é ímpar.`);
    }
}