export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const estoque = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);

  if (retirada <= 0) {
    return false;
  }

  if (retirada > estoque) {
    return false;
  }

  return true;
}