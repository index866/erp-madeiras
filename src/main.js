// src/main.js

// 1. Importações de todas as telas (Módulos isolados)
import { abrirControleEstoques } from './views/telaEstoque.js';
import { abrirCadastroMadeira } from './views/telaCadastro.js';
import { abrirTelaDesdobro } from './views/telaDesdobro.js';
import { abrirEntradaEstoque } from './views/telaRecebimento.js';
import { abrirPedidoVenda } from './views/telaPedido.js';

// Função global para o menu (o 'window.' garante que o HTML a encontre)
window.toggleSubmenu = function (idSubmenu, botaoPai) {
  const submenu = document.getElementById(idSubmenu);
  submenu.classList.toggle('oculto');
  botaoPai.classList.toggle('fechado');
};

// 2. Roteador: Escuta os cliques no Menu
function inicializar() {
  // Tela que abre por padrão
  abrirControleEstoques();

  const botoesMenu = document.querySelectorAll('button[data-tela]');

  botoesMenu.forEach((btn) => {
    btn.addEventListener('click', () => {
      botoesMenu.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const tela = btn.getAttribute('data-tela');

      // Chama o ecrã correspondente ao botão clicado
      if (tela === 'estoque') {
        abrirControleEstoques();
      } else if (tela === 'cadastro') {
        abrirCadastroMadeira();
      } else if (tela === 'desdobro') {
        abrirTelaDesdobro();
      } else if (tela === 'recebimento' || tela === 'entrada') {
        abrirEntradaEstoque();
      } else if (
        tela === 'pedido-venda' ||
        tela === 'venda' ||
        tela === 'pedido'
      ) {
        abrirPedidoVenda();
      }
    });
  });
}

// 3. Dispara quando o site terminar de carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}
