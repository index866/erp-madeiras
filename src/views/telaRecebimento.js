// src/views/telaRecebimento.js

import {
  obterEstoqueDoPatio,
  cadastrarNovaMadeira,
  calcularVolumeM3,
  supabase,
} from '../services/cubagem.js';
import { abrirControleEstoques } from './telaEstoque.js';

export async function abrirEntradaEstoque() {
  const principal = document.getElementById('conteudo-principal');
  if (!principal) return;

  principal.innerHTML = `<div style="padding: 50px; text-align: center; color: #64748b;">⏳ A carregar sistema de recebimento...</div>`;

  let estoqueAtual = [];
  try {
    estoqueAtual = await obterEstoqueDoPatio();
  } catch (erro) {
    principal.innerHTML = `<div style="padding: 50px; color: red; text-align: center;">❌ Erro ao conectar com a base de dados.</div>`;
    return;
  }

  if (!estoqueAtual || estoqueAtual.length === 0) {
    principal.innerHTML = `
      <div class="container" style="padding: 20px;">
          <div class="breadcrumb" style="color: #64748b;">início — suprimentos — recebimento de lotes</div>
          <div style="padding: 50px 20px; text-align: center; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; margin-top: 20px;">
              <h3 style="color: #475569; margin-bottom: 10px;">⚠️ Nenhuma madeira cadastrada no sistema.</h3>
              <p style="color: #64748b; font-size: 0.95em;">Vá a <b>"Catálogo de Produtos"</b> primeiro para cadastrar as madeiras.</p>
          </div>
      </div>
    `;
    return;
  }

  let opcoesMadeiras =
    '<option value="">-- Selecione com qual produto interno isto corresponde --</option>';
  estoqueAtual.forEach((item) => {
    const id = item.id || '';
    const sku = item.sku || 'Sem SKU';
    const nome = item.nome || 'Sem Nome';
    opcoesMadeiras += `<option value="${id}">${sku} - ${nome}</option>`;
  });

  principal.innerHTML = `
      <div class="container" style="width: 100%; box-sizing: border-box; padding: 20px; font-family: 'Inter', sans-serif;">
          <div class="breadcrumb" style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">início — suprimentos — recebimento (via xml)</div>
          <div class="top-bar" style="margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0;">🚚 Recebimento de Lotes</h2>
          </div>

          <div style="background: #f0f9ff; border: 2px dashed #38bdf8; border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 25px;">
              <h3 style="color: #0369a1; margin-bottom: 10px; font-size: 1.1em;">📄 Importar Fatura (XML)</h3>
              <input type="file" id="input-xml" accept=".xml" style="display: none;">
              <label for="input-xml" style="background: #0ea5e9; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-block;">
                  📂 Escolher Ficheiro XML
              </label>
              <div id="status-xml" style="margin-top: 15px; font-weight: 500; font-size: 0.9em; color: #0369a1;"></div>
          </div>

          <form id="form-entrada" style="background: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; display: none;">
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                  <span style="font-size: 0.8em; text-transform: uppercase; color: #64748b; font-weight: 700;">Produto lido na Fatura:</span>
                  <div id="xml-produto-nome" style="font-size: 1.1em; color: #0f172a; font-weight: 600; margin-top: 5px;">A aguardar...</div>
              </div>

              <div style="display: flex; gap: 15px; width: 100%; flex-wrap: wrap; margin-bottom: 25px;">
                  <div style="flex: 2; min-width: 250px; display: flex; flex-direction: column;">
                      <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Vincular ao Produto do Sistema</label>
                      <select id="ent-selecao" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                          ${opcoesMadeiras}
                      </select>
                  </div>
                  <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column;">
                      <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Qtd. (Peças)</label>
                      <input type="number" id="ent-qtd-nova" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                  </div>
                  <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column;">
                      <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Custo Unit. (R$)</label>
                      <input type="number" step="0.01" id="ent-custo-xml" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f1f5f9;">
                  </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #edf2f7; padding-top: 15px;">
                  <div id="mensagem-entrada" style="font-weight: 500;"></div>
                  <button type="submit" style="background: #2c3e50; color: white; border: none; padding: 10px 24px; font-weight: 600; border-radius: 4px; cursor: pointer;">
                      📥 Confirmar Recebimento
                  </button>
              </div>
          </form>
      </div>
  `;

  document.getElementById('input-xml').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const statusXml = document.getElementById('status-xml');
    statusXml.textContent = '⏳ A ler ficheiro XML...';

    const reader = new FileReader();
    reader.onload = function (evento) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(evento.target.result, 'text/xml');
        const dets = xmlDoc.getElementsByTagName('det');

        if (dets.length === 0) {
          statusXml.textContent =
            '❌ Nenhuma tag <det> (produto) encontrada. NF-e inválida.';
          statusXml.style.color = '#ef4444';
          return;
        }

        const primeiroProduto = dets[0].getElementsByTagName('prod')[0];
        const nomeXml =
          primeiroProduto.getElementsByTagName('xProd')[0]?.textContent ||
          'Produto Sem Nome';
        const qtdXml = parseFloat(
          primeiroProduto.getElementsByTagName('qCom')[0]?.textContent || 0
        );
        const valorXml = parseFloat(
          primeiroProduto.getElementsByTagName('vUnCom')[0]?.textContent || 0
        );

        document.getElementById('form-entrada').style.display = 'block';
        document.getElementById('xml-produto-nome').textContent = nomeXml;
        document.getElementById('ent-qtd-nova').value = qtdXml;
        document.getElementById('ent-custo-xml').value = valorXml;

        statusXml.textContent = '✅ XML lido com sucesso!';
        statusXml.style.color = '#16a34a';
      } catch (erro) {
        statusXml.textContent = '❌ Falha ao interpretar ficheiro XML.';
        statusXml.style.color = '#ef4444';
      }
    };
    reader.readAsText(file);
  });

  document
    .getElementById('form-entrada')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('mensagem-entrada');
      const idSelecionado = document.getElementById('ent-selecao').value;
      const itemSelecionado = estoqueAtual.find((m) => m.id == idSelecionado);
      const qtdNovaRecebida = parseInt(
        document.getElementById('ent-qtd-nova').value
      );

      if (!itemSelecionado) return;
      status.style.color = '#7f8c8d';
      status.textContent = '🔄 A guardar na base de dados...';

      const dadosAtualizados = {
        ...itemSelecionado,
        estoque_pecas:
          parseInt(itemSelecionado.estoque_pecas || 0) + qtdNovaRecebida,
      };

      try {
        await cadastrarNovaMadeira(dadosAtualizados);
        const volRecebido = calcularVolumeM3(
          itemSelecionado.espessura_mm,
          itemSelecionado.largura_mm,
          itemSelecionado.comprimento_m,
          qtdNovaRecebida
        );

        await supabase.from('desdobros').insert([
          {
            sku_origem: 'FORNECEDOR',
            nome_origem: 'Entrada via XML NF-e',
            qtd_origem: 0,
            volume_origem: 0,
            sku_destino: itemSelecionado.sku || `MAD-${itemSelecionado.id}00`,
            nome_destino: itemSelecionado.nome,
            qtd_destino: qtdNovaRecebida,
            volume_destino: volRecebido,
            perda_m3: 0,
            rendimento_percentual: 100,
          },
        ]);

        status.style.color = '#2ecc71';
        status.textContent = `✅ ${qtdNovaRecebida} peças adicionadas!`;
        setTimeout(() => abrirControleEstoques(), 1500);
      } catch (err) {
        status.style.color = '#e74c3c';
        status.textContent = `❌ Erro: ${err.message}`;
      }
    });
}
