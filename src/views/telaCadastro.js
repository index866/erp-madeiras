// src/views/telaCadastro.js

import { cadastrarNovaMadeira } from '../services/cubagem.js';
import { abrirControleEstoques } from './telaEstoque.js'; // Importamos para poder voltar à tela principal após salvar

export function abrirCadastroMadeira(produtoParaEditar = null) {
  const principal = document.getElementById('conteudo-principal');
  if (!principal) return;
  const modoEdicao = produtoParaEditar !== null;

  principal.innerHTML = `
      <div class="container" style="width: 100%; box-sizing: border-box;">
          <div class="breadcrumb">início — suprimentos — ${
            modoEdicao ? 'editar madeira' : 'cadastrar madeira'
          }</div>
          <div class="top-bar" style="margin-bottom: 20px;">
              <h2>${
                modoEdicao ? 'Editar Cadastro de Madeira' : 'Cadastrar Madeira'
              }</h2>
          </div>
          <form id="form-cadastro" style="background: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; width: 100%; box-sizing: border-box;">
              <div style="margin-bottom: 25px;">
                  <h3 style="font-size: 1.1em; color: #2c3e50; margin-bottom: 15px; font-weight: 600; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">1. Identificação do Lote</h3>
                  <div style="display: flex; gap: 15px; width: 100%; flex-wrap: wrap;">
                      <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Código Único (SKU)</label>
                          <input type="text" id="sku" value="${
                            modoEdicao ? produtoParaEditar.sku || '' : ''
                          }" placeholder="Ex: ANG-VIG-50X150" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace;">
                      </div>
                      <div style="flex: 2; min-width: 250px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Nome do Produto / Madeira</label>
                          <input type="text" id="nome" value="${
                            modoEdicao ? produtoParaEditar.nome || '' : ''
                          }" placeholder="Ex: Angelim Vermelho" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                      </div>
                      <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Tipo / Categoria</label>
                          <select id="tipo" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: white; height: 41px;">
                              <option value="Viga" ${
                                modoEdicao && produtoParaEditar.tipo === 'Viga'
                                  ? 'selected'
                                  : ''
                              }>Viga</option>
                              <option value="Tábua" ${
                                modoEdicao && produtoParaEditar.tipo === 'Tábua'
                                  ? 'selected'
                                  : ''
                              }>Tábua</option>
                              <option value="Sarrafo" ${
                                modoEdicao &&
                                produtoParaEditar.tipo === 'Sarrafo'
                                  ? 'selected'
                                  : ''
                              }>Sarrafo</option>
                              <option value="Prancha" ${
                                modoEdicao &&
                                produtoParaEditar.tipo === 'Prancha'
                                  ? 'selected'
                                  : ''
                              }>Prancha</option>
                          </select>
                      </div>
                  </div>
              </div>
              <div style="margin-bottom: 25px;">
                  <h3 style="font-size: 1.1em; color: #2c3e50; margin-bottom: 15px; font-weight: 600; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">2. Dimensões Técnicas e Quantidade</h3>
                  <div style="display: flex; gap: 15px; width: 100%; flex-wrap: wrap;">
                      <div style="flex: 1; min-width: 110px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Espessura (mm)</label>
                          <input type="number" id="espessura_mm" value="${
                            modoEdicao ? produtoParaEditar.espessura_mm : ''
                          }" placeholder="Ex: 50" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                      </div>
                      <div style="flex: 1; min-width: 110px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Largura (mm)</label>
                          <input type="number" id="largura_mm" value="${
                            modoEdicao ? produtoParaEditar.largura_mm : ''
                          }" placeholder="Ex: 150" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                      </div>
                      <div style="flex: 1; min-width: 110px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Comprimento (m)</label>
                          <input type="number" step="0.01" id="comprimento_m" value="${
                            modoEdicao ? produtoParaEditar.comprimento_m : ''
                          }" placeholder="Ex: 4.50" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                      </div>
                      <div style="flex: 1; min-width: 130px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Qtd. Inicial (Peças)</label>
                          <input type="number" id="estoque_pecas" value="${
                            modoEdicao ? produtoParaEditar.estoque_pecas : ''
                          }" placeholder="Ex: 150" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                      </div>
                  </div>
              </div>
              <div style="margin-bottom: 30px;">
                  <h3 style="font-size: 1.1em; color: #2c3e50; margin-bottom: 15px; font-weight: 600; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">3. Precificação</h3>
                  <div style="display: flex; gap: 15px; width: 100%; flex-wrap: wrap;">
                      <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Preço de Custo por M³ (R$)</label>
                          <input type="number" step="0.01" id="preco_custo" value="${
                            modoEdicao
                              ? produtoParaEditar.preco_custo || ''
                              : ''
                          }" placeholder="Ex: 1500.00" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                      </div>
                      <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column;">
                          <label style="font-weight: 600; color: #4a5568; margin-bottom: 6px;">Preço de Venda por M³ (R$)</label>
                          <input type="number" step="0.01" id="preco_venda" value="${
                            modoEdicao
                              ? produtoParaEditar.preco_venda || ''
                              : ''
                          }" placeholder="Ex: 3200.00" required style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                      </div>
                  </div>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #edf2f7; padding-top: 15px; flex-wrap: wrap; gap: 10px;">
                  <div id="mensagem-status" style="font-weight: 500;"></div>
                  <div style="display: flex; gap: 10px;">
                      ${
                        modoEdicao
                          ? `<button type="button" id="btn-cancelar-edicao" style="background: #e2e8f0; color: #4a5568; border: none; padding: 10px 24px; font-weight: 600; border-radius: 4px; cursor: pointer;">Cancelar</button>`
                          : ''
                      }
                      <button type="submit" style="background: #2c3e50; color: white; border: none; padding: 10px 24px; font-weight: 600; border-radius: 4px; cursor: pointer;">
                          ${
                            modoEdicao
                              ? '💾 Atualizar Registro'
                              : 'Salvar no Banco de Dados'
                          }
                      </button>
                  </div>
              </div>
          </form>
      </div>
  `;

  if (modoEdicao) {
    document
      .getElementById('btn-cancelar-edicao')
      .addEventListener('click', () => abrirControleEstoques());
  }

  document
    .getElementById('form-cadastro')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('mensagem-status');
      status.style.color = '#7f8c8d';
      status.textContent = 'Enviando dados para o Supabase...';

      const dadosMadeira = {
        sku: document.getElementById('sku').value,
        nome: document.getElementById('nome').value,
        tipo: document.getElementById('tipo').value,
        estoque_pecas: parseInt(document.getElementById('estoque_pecas').value),
        espessura_mm: parseFloat(document.getElementById('espessura_mm').value),
        largura_mm: parseFloat(document.getElementById('largura_mm').value),
        comprimento_m: parseFloat(
          document.getElementById('comprimento_m').value
        ),
        preco_custo: parseFloat(document.getElementById('preco_custo').value),
        preco_venda: parseFloat(document.getElementById('preco_venda').value),
      };

      if (modoEdicao) dadosMadeira.id = produtoParaEditar.id;

      try {
        await cadastrarNovaMadeira(dadosMadeira);
        status.style.color = '#2ecc71';
        status.textContent = '✅ Salvo com sucesso!';
        setTimeout(() => abrirControleEstoques(), 1200);
      } catch (err) {
        status.style.color = '#e74c3c';
        status.textContent = `❌ Erro ao salvar: ${err.message}`;
      }
    });
}
