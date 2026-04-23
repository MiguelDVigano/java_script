const chalk = require("chalk");

const nome = "Miguel D. Viganó";
const ra = 2901432613018;
const disciplina = "Desenvolvimento Web";

console.log(chalk.green("Nome:", nome));
console.log(chalk.yellow("RA:", ra));
console.log(chalk.blue("Disciplina:", disciplina));
console.log(chalk.red.bold("Exercício NPM concluído"));

