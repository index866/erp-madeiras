// src/views/telaEstoque.js

import {
  obterEstoqueDoPatio,
  calcularVolumeM3,
  supabase,
} from '../services/cubagem.js';
import { formatarDinheiro } from '../utils/formatters.js';

export async function abrirControleEstoques() {
  const principal = document.getElementById('conteudo-principal');
  if (!principal) return;

  principal.innerHTML = `
      <div class="container" style="width: 100%; box-sizing: border-box; font-family: 'Inter', sans-serif;">
          <div class="breadcrumb">início — suprimentos — controle de estoques</div>
          <div class="top-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 15px;">
              <h2 style="margin: 0; color: #0f172a; font-weight: 700; letter-spacing: -0.5px;">Controle de Estoques</h2>
              <div style="position: relative; display: flex; align-items: center; min-width: 320px;">
                  <span style="position: absolute; left: 14px; color: #94a3b8; font-size: 1em;">🔍</span>
                  <input type="text" id="campo-pesquisa" placeholder="Buscar por SKU ou Nome..." style="width: 100%; padding: 10px 12px 10px 40px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9em; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.02); outline: none; transition: border-color 0.2s;">
              </div>
          </div>

          <div style="display: flex; gap: 24px; margin-bottom: 28px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 260px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03); display: flex; flex-direction: column; justify-content: center;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                      <span style="font-size: 0.8em; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">Volume Global em Pátio</span>
                  </div>
                  <div style="display: flex; align-items: baseline; gap: 6px;">
                      <span id="geral-total-m3" style="font-size: 1.8em; font-weight: 700; color: #0f172a; font-family: 'JetBrains Mono', monospace; letter-spacing: -1px;">0.0000</span>
                      <span style="color: #475569; font-size: 1em; font-weight: 600; font-family: 'JetBrains Mono', monospace;">m³</span>
                  </div>
              </div>
              <div style="flex: 1; min-width: 260px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03); display: flex; flex-direction: column; justify-content: center;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                      <span style="font-size: 0.8em; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">Capital Imobilizado (Custo)</span>
                  </div>
                  <div style="display: flex; align-items: baseline; gap: 4px;">
                      <span id="geral-total-dinheiro" style="font-size: 1.8em; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">R$ 0,00</span>
                  </div>
              </div>
          </div>

          <div class="tabs-container" style="margin-bottom: 20px;">
              <div class="tab-item active">todos</div>
              <div class="tab-item">vigas</div>
              <div class="tab-item">tábuas</div>
              <div class="tab-item">sarrafos</div>
          </div>

          <div style="background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                      <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                          <th style="padding: 14px; text-align: left; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Código (SKU)</th>
                          <th style="padding: 14px; text-align: left; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Produto / Madeira</th>
                          <th style="padding: 14px; text-align: left; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600; width: 90px;">Tipo</th>
                          <th style="padding: 14px; text-align: left; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Dimensões (E x L x C)</th>
                          <th style="padding: 14px; text-align: right; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Estoque Físico</th>
                          <th style="padding: 14px; text-align: right; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Disponível (m³)</th>
                          <th style="padding: 14px; text-align: right; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Custo (m³)</th>
                          <th style="padding: 14px; text-align: right; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Venda (Duplo)</th>
                          <th style="padding: 14px; text-align: right; color: #64748b; font-size: 0.85em; text-transform: uppercase; font-weight: 600;">Total em Custo</th>
                      </tr>
                  </thead>
                  <tbody id="linhas-patio">
                      <tr><td colspan="9" style="text-align: center; color: #7f8c8d; padding: 30px;">Lendo dados do pátio via Supabase...</td></tr>
                  </tbody>
              </table>
          </div>
      </div>

      <div id="modal-extrato" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;">
          <div style="background: white; width: 100%; max-width: 850px; max-height: 90vh; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0;">
              <div style="padding: 20px 24px; background: #0f172a; color: white; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                      <h3 id="modal-txt-nome" style="margin: 0; font-size: 1.25em; font-weight: 600; letter-spacing: -0.3px;">Extrato de Movimentação</h3>
                      <div style="display: flex; gap: 15px; margin-top: 4px; font-size: 0.85em; color: #94a3b8;">
                          <span id="modal-txt-sku" style="font-family: monospace; background: #1e293b; padding: 2px 6px; border-radius: 4px;"></span>
                          <span id="modal-txt-dimensões"></span>
                      </div>
                  </div>
                  <button id="fechar-modal-extrato" style="background: #1e293b; border: none; color: #94a3b8; font-size: 1.2em; cursor: pointer; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">&times;</button>
              </div>

              <div style="display: flex; gap: 16px; padding: 16px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <div style="flex: 1; background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                      <span style="font-size: 0.75em; text-transform: uppercase; color: #64748b; font-weight: 600; display:block; margin-bottom:2px;">Saldo Físico Atual</span>
                      <strong id="card-saldo-pecas" style="font-size: 1.3em; color: #0f172a;">--</strong> <small style="color: #64748b;">peças</small>
                  </div>
                  <div style="flex: 1; background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                      <span style="font-size: 0.75em; text-transform: uppercase; color: #64748b; font-weight: 600; display:block; margin-bottom:2px;">Volume em Pátio</span>
                      <strong id="card-saldo-m3" style="font-size: 1.3em; color: #0f172a; font-family: monospace;">--</strong> <small style="color: #64748b;">m³</small>
                  </div>
              </div>

              <div style="padding: 24px; overflow-y: auto; flex: 1; background: #ffffff;">
                  <div id="timeline-container" style="position: relative; border-left: 2px solid #e2e8f0; margin-left: 20px; padding-left: 24px; display: flex; flex-direction: column; gap: 24px;">
                  </div>
              </div>
          </div>
      </div>
  `;

  const tabela = document.getElementById('linhas-patio');
  const inputPesquisa = document.getElementById('campo-pesquisa');
  const txtGeralM3 = document.getElementById('geral-total-m3');
  const txtGeralDinheiro = document.getElementById('geral-total-dinheiro');
  const modal = document.getElementById('modal-extrato');
  const fecharModalBtn = document.getElementById('fechar-modal-extrato');
  fecharModalBtn.addEventListener(
    'click',
    () => (modal.style.display = 'none')
  );

  try {
    const produtos = await obterEstoqueDoPatio();

    function calcularEAplicarResumoGeral(listaFiltrada) {
      let somaM3 = 0;
      let iMobiliadoCusto = 0;
      listaFiltrada.forEach((prod) => {
        const volM3 = calcularVolumeM3(
          prod.espessura_mm,
          prod.largura_mm,
          prod.comprimento_m,
          prod.estoque_pecas
        );
        const precoCustoM3 = prod.preco_custo ? Number(prod.preco_custo) : 0;
        somaM3 += volM3;
        iMobiliadoCusto += volM3 * precoCustoM3;
      });
      txtGeralM3.textContent = somaM3.toFixed(4);
      txtGeralDinheiro.textContent = formatarDinheiro(iMobiliadoCusto);
    }

    async function mostrarExtratoProduto(prod) {
      const skuValido = prod.sku ? prod.sku : `MAD-${prod.id}00`;
      const volTotalM3 = calcularVolumeM3(
        prod.espessura_mm,
        prod.largura_mm,
        prod.comprimento_m,
        prod.estoque_pecas
      );

      document.getElementById('modal-txt-nome').textContent = prod.nome;
      document.getElementById('modal-txt-sku').textContent = skuValido;
      document.getElementById(
        'modal-txt-dimensões'
      ).textContent = `📏 ${prod.espessura_mm}x${prod.largura_mm}mm × ${prod.comprimento_m}m`;
      document.getElementById('card-saldo-pecas').textContent =
        prod.estoque_pecas;
      document.getElementById('card-saldo-m3').textContent =
        volTotalM3.toFixed(4);

      const timeline = document.getElementById('timeline-container');
      timeline.innerHTML = `<div style="color:#64748b; font-size:0.95em;">🔄 Rastreando histórico...</div>`;
      modal.style.display = 'flex';

      try {
        const { data: historicos, error } = await supabase
          .from('desdobros')
          .select('*')
          .or(`sku_origem.eq.${skuValido},sku_destino.eq.${skuValido}`)
          .order('id', { ascending: false });

        if (error) throw error;
        let htmlTimeline = '';

        if (historicos && historicos.length > 0) {
          historicos.forEach((h) => {
            const dt = new Date(h.data_hora).toLocaleString('pt-BR');
            const ehRecebimento = h.sku_origem === 'FORNECEDOR';
            const ehOrigem = !ehRecebimento && h.sku_origem === skuValido;

            let corBadgeBg,
              corBadgeTxt,
              corBordaDot,
              tituloOperacao,
              sinalMoeda,
              detalheTexto;
            let volumeFormatado, pecasFormatadas;

            if (ehRecebimento) {
              corBadgeBg = '#eff6ff';
              corBadgeTxt = '#1d4ed8';
              corBordaDot = '#3b82f6';
              tituloOperacao = '🚚 ENTRADA DE LOTE (REPOSIÇÃO)';
              sinalMoeda = '+';
              volumeFormatado = Number(h.volume_destino).toFixed(4);
              pecasFormatadas = h.qtd_destino;
              detalheTexto = `Recebimento de lote via fornecedor. Adicionadas <strong style="color:#1d4ed8;">${h.qtd_destino} pçs</strong> ao saldo do pátio.`;
            } else if (ehOrigem) {
              corBadgeBg = '#fef2f2';
              corBadgeTxt = '#991b1b';
              corBordaDot = '#ef4444';
              tituloOperacao = '📉 SAÍDA PARA CORTE (DESDOBRO)';
              sinalMoeda = '-';
              volumeFormatado = Number(h.volume_origem).toFixed(4);
              pecasFormatadas = h.qtd_origem;
              detalheTexto = `Lote enviado para desdobro na serra. Convertido em: <strong style="color:#0f172a;">${h.qtd_destino} pçs</strong> de <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.9em;">${h.sku_destino}</span>.`;
            } else {
              corBadgeBg = '#f0fdf4';
              corBadgeTxt = '#166534';
              corBordaDot = '#22c55e';
              tituloOperacao = '📈 ENTRADA DE PRODUÇÃO (SERRA)';
              sinalMoeda = '+';
              volumeFormatado = Number(h.volume_destino).toFixed(4);
              pecasFormatadas = h.qtd_destino;
              detalheTexto = `Peças geradas a partir da madeira bruta: <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.9em;">${
                h.sku_origem
              }</span> com rendimento de <strong style="color:#166534;">${Number(
                h.rendimento_percentual
              ).toFixed(1)}%</strong>.`;
            }

            htmlTimeline += `
                  <div style="position: relative;">
                      <div style="position: absolute; left: -31px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: white; border: 3px solid ${corBordaDot}; box-shadow: 0 0 0 4px white;"></div>
                      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                              <div>
                                  <span style="display: inline-block; background: ${corBadgeBg}; color: ${corBadgeTxt}; font-size: 0.75em; font-weight: 700; padding: 4px 8px; border-radius: 4px; margin-bottom: 4px;">${tituloOperacao}</span>
                                  <div style="font-size: 0.85em; color: #64748b;">${dt}</div>
                              </div>
                              <div style="text-align: right;">
                                  <span style="font-size: 1.1em; font-weight: 700; color: ${corBadgeTxt}; display: block;">${sinalMoeda}${pecasFormatadas} pçs</span>
                                  <span style="font-family: monospace; font-size: 0.9em; color: #475569; display: block;">${sinalMoeda}${volumeFormatado} m³</span>
                              </div>
                          </div>
                          <p style="margin: 0; font-size: 0.9em; color: #475569; line-height: 1.5;">${detalheTexto}</p>
                      </div>
                  </div>
              `;
          });
        }

        htmlTimeline += `
              <div style="position: relative;">
                  <div style="position: absolute; left: -31px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: white; border: 3px solid #38bdf8; box-shadow: 0 0 0 4px white;"></div>
                  <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px;">
                      <span style="background: #sky-100; color: #0369a1; font-size: 0.75em; font-weight: 700; padding: 2px 6px; border-radius: 4px;">📦 IMPLANTAÇÃO DE REGISTRO</span>
                      <p style="margin: 6px 0 0 0; font-size: 0.85em; color: #0369a1; line-height: 1.4;">Produto inserido no inventário inicial do pátio.</p>
                  </div>
              </div>
          `;
        timeline.innerHTML = htmlTimeline;
      } catch (err) {
        timeline.innerHTML = `<div style="color:red; padding:10px;">❌ Erro: ${err.message}</div>`;
      }
    }

    function renderizarTabela(listaProdutos) {
      tabela.innerHTML = '';
      calcularEAplicarResumoGeral(listaProdutos);

      if (!listaProdutos || listaProdutos.length === 0) {
        tabela.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 40px; color: #7f8c8d;">🪵 Nenhum produto encontrado.</td></tr>`;
        return;
      }

      listaProdutos.forEach((prod) => {
        const volumeTotalM3 = calcularVolumeM3(
          prod.espessura_mm,
          prod.largura_mm,
          prod.comprimento_m,
          prod.estoque_pecas
        );
        const volumeUnitarioM3 = calcularVolumeM3(
          prod.espessura_mm,
          prod.largura_mm,
          prod.comprimento_m,
          1
        );
        const skuValido = prod.sku ? prod.sku : `MAD-${prod.id}00`;
        const precoCustoM3 = prod.preco_custo ? Number(prod.preco_custo) : 0;
        const precoVendaM3 = prod.preco_venda ? Number(prod.preco_venda) : 0;
        const precoVendaPeca = precoVendaM3 * volumeUnitarioM3;
        const valorTotalCustoEstoque = volumeTotalM3 * precoCustoM3;

        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.style.borderBottom = '1px solid #f1f5f9';

        tr.innerHTML = `
            <td style="padding: 14px; color: #475569; font-weight: 600; font-family: monospace; font-size: 0.95em;">${skuValido}</td>
            <td style="padding: 14px; color: #0f172a;"><strong>${
              prod.nome || 'Sem Nome'
            }</strong></td>
            <td style="padding: 14px;"><span class="badge" style="background:#f1f5f9; color:#475569; font-weight:600; padding:4px 8px; border-radius:4px; font-size:0.85em;">${
              prod.tipo || 'Bruta'
            }</span></td>
            <td style="padding: 14px; font-size: 0.95em; color: #475569;">${
              prod.espessura_mm
            }x${prod.largura_mm}mm × ${prod.comprimento_m}m</td>
            <td style="padding: 14px; text-align: right; font-weight: 600; color: #0f172a;">${
              prod.estoque_pecas
            } <span style="font-weight:400; color:#64748b; font-size:0.9em;">pçs</span></td>
            <td style="padding: 14px; text-align: right; color: #0f172a; font-weight: 600; font-family: 'JetBrains Mono', monospace;">${volumeTotalM3.toFixed(
              4
            )} m³</td>
            <td style="padding: 14px; text-align: right; color: #475569; font-weight:600;">${formatarDinheiro(
              precoCustoM3
            )}</td>
            <td style="padding: 14px; text-align: right; line-height: 1.4;">
                <span style="color: #10b981; font-weight: 600; display: block;">${formatarDinheiro(
                  precoVendaM3
                )} <small style="font-weight:400; color:#64748b; font-size:0.8em;">/m³</small></span>
                <span style="color: #64748b; font-size: 0.8em; display: block;">${formatarDinheiro(
                  precoVendaPeca
                )} <small style="font-size:0.9em;">/pç</small></span>
            </td>
            <td style="padding: 14px; text-align: right; color: #0f172a; font-size: 1em;">
                <strong>${formatarDinheiro(valorTotalCustoEstoque)}</strong>
            </td>
        `;
        tr.addEventListener(
          'mouseenter',
          () => (tr.style.backgroundColor = '#f8fafc')
        );
        tr.addEventListener(
          'mouseleave',
          () => (tr.style.backgroundColor = 'transparent')
        );
        tr.addEventListener('click', () => mostrarExtratoProduto(prod));
        tabela.appendChild(tr);
      });
    }

    renderizarTabela(produtos);

    inputPesquisa.addEventListener('input', (e) => {
      const termoBusca = e.target.value.toLowerCase().trim();
      if (termoBusca === '') {
        renderizarTabela(produtos);
        return;
      }
      const filtrados = produtos.filter((prod) => {
        return (
          (prod.sku || '').toLowerCase().includes(termoBusca) ||
          (prod.nome || '').toLowerCase().includes(termoBusca)
        );
      });
      renderizarTabela(filtrados);
    });
  } catch (err) {
    tabela.innerHTML = `<tr><td colspan="9" style="text-align:center; color: red; padding: 30px;">❌ Erro: ${err.message}</td></tr>`;
  }
}
