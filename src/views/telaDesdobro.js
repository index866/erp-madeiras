// src/views/telaDesdobro.js

import {
  obterEstoqueDoPatio,
  calcularVolumeM3,
  supabase,
} from '../services/cubagem.js';

export async function abrirTelaDesdobro() {
  const principal = document.getElementById('conteudo-principal');
  if (!principal) return;

  principal.innerHTML = `
      <div class="container" style="width: 100%; box-sizing: border-box;">
          <div class="breadcrumb">início — suprimentos — desdobro industrial</div>
          <div class="top-bar" style="margin-bottom: 20px;">
              <h2>Desdobro de Madeira (Transformação)</h2>
              <p style="color:#7f8c8d; margin:5px 0 0 0;">Realize a serragem ou beneficiamento de um lote bruto e dê entrada nas novas peças geradas.</p>
          </div>
          <form id="form-desdobro" style="background: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
              <div style="display: flex; gap: 25px; flex-wrap: wrap; margin-bottom: 20px;">
                  <div style="flex: 1; min-width: 300px; background: #fafafa; padding: 20px; border-radius: 6px; border: 1px solid #edf2f7;">
                      <h3 style="margin-top:0; color:#e74c3c; font-size:1.05em; border-bottom: 1px solid #cbd5e1; padding-bottom:5px;">🪵 1. Origem (O que vai para a Serra)</h3>
                      <div style="display:flex; flex-direction:column; margin-bottom:12px;">
                          <label style="font-weight:600; margin-bottom:5px; font-size:0.9em;">Selecione o Produto Bruto</label>
                          <select id="desdobro-origem" required style="padding:10px; border:1px solid #cbd5e1; border-radius:4px; background:white;"></select>
                      </div>
                      <div style="display:flex; flex-direction:column;">
                          <label style="font-weight:600; margin-bottom:5px; font-size:0.9em;">Quantidade de Peças a Retirar</label>
                          <input type="number" id="desdobro-qtd-origem" placeholder="Ex: 5" required style="padding:10px; border:1px solid #cbd5e1; border-radius:4px;">
                      </div>
                  </div>
                  <div style="flex: 1; min-width: 300px; background: #fafafa; padding: 20px; border-radius: 6px; border: 1px solid #edf2f7;">
                      <h3 style="margin-top:0; color:#2ecc71; font-size:1.05em; border-bottom: 1px solid #cbd5e1; padding-bottom:5px;">📏 2. Destino (O que foi Gerado)</h3>
                      <div style="display:flex; flex-direction:column; margin-bottom:12px;">
                          <label style="font-weight:600; margin-bottom:5px; font-size:0.9em;">Selecione o Produto Gerado</label>
                          <select id="desdobro-destino" required style="padding:10px; border:1px solid #cbd5e1; border-radius:4px; background:white;"></select>
                      </div>
                      <div style="display:flex; flex-direction:column;">
                          <label style="font-weight:600; margin-bottom:5px; font-size:0.9em;">Quantidade de Peças Produzidas</label>
                          <input type="number" id="desdobro-qtd-destino" placeholder="Ex: 20" required style="padding:10px; border:1px solid #cbd5e1; border-radius:4px;">
                      </div>
                  </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #edf2f7; padding-top:15px; flex-wrap:wrap; gap:10px;">
                  <div id="status-desdobro" style="font-weight:600; font-size:0.95em;"></div>
                  <button type="submit" style="background:#2c3e50; color:white; font-weight:600; padding:12px 28px; border:none; border-radius:4px; cursor:pointer;">
                      ⚙️ Confirmar Operação de Desdobro
                  </button>
              </div>
          </form>

          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
              <h4 style="margin: 0 0 10px 0; color: #334155; font-size: 0.95em; text-transform: uppercase; letter-spacing: 0.5px;">🔍 Painel de Auditoria e Filtros</h4>
              <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-end;">
                  <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column;">
                      <label style="font-size: 0.85em; font-weight: 600; color: #475569; margin-bottom: 4px;">Buscar SKU</label>
                      <input type="text" id="auditoria-sku" placeholder="Ex: IPE-" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  </div>
                  <div style="flex: 1; min-width: 140px; display: flex; flex-direction: column;">
                      <label style="font-size: 0.85em; font-weight: 600; color: #475569; margin-bottom: 4px;">Data Inicial</label>
                      <input type="date" id="auditoria-data-inicio" style="padding: 7px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  </div>
                  <div style="flex: 1; min-width: 140px; display: flex; flex-direction: column;">
                      <label style="font-size: 0.85em; font-weight: 600; color: #475569; margin-bottom: 4px;">Data Final</label>
                      <input type="date" id="auditoria-data-fim" style="padding: 7px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  </div>
                  <div style="flex: 1; min-width: 180px; display: flex; flex-direction: column;">
                      <label style="font-size: 0.85em; font-weight: 600; color: #475569; margin-bottom: 4px;">Rendimento</label>
                      <select id="auditoria-rendimento" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                          <option value="todos">Ver Tudo</option>
                          <option value="critico">Rendimento Baixo (< 80%)</option>
                          <option value="excelente">Rendimento Alto (> 95%)</option>
                      </select>
                  </div>
              </div>
          </div>

          <h3 style="color:#2c3e50; margin-bottom:15px; font-weight:600;">📋 Histórico de Desdobros</h3>
          <table>
              <thead>
                  <tr>
                      <th>Data/Hora</th>
                      <th>Produto Origem</th>
                      <th style="text-align:right;">Qtd Saída</th>
                      <th style="text-align:right;">Vol. Saída</th>
                      <th>Produto Destino</th>
                      <th style="text-align:right;">Qtd Entrada</th>
                      <th style="text-align:right;">Vol. Entrada</th>
                      <th style="text-align:right;">Perda (m³)</th>
                      <th style="text-align:right;">Rendimento</th>
                  </tr>
              </thead>
              <tbody id="linhas-historico-desdobro">
                  <tr><td colspan="9" style="text-align:center; color:#7f8c8d; padding:20px;">A procurar histórico...</td></tr>
              </tbody>
          </table>
      </div>
  `;

  const selectOrigem = document.getElementById('desdobro-origem');
  const selectDestino = document.getElementById('desdobro-destino');
  const tabelaHist = document.getElementById('linhas-historico-desdobro');

  const filtroSku = document.getElementById('auditoria-sku');
  const filtroDataInicio = document.getElementById('auditoria-data-inicio');
  const filtroDataFim = document.getElementById('auditoria-data-fim');
  const filtroRendimento = document.getElementById('auditoria-rendimento');

  try {
    const produtos = await obterEstoqueDoPatio();
    selectOrigem.innerHTML =
      '<option value="">-- Selecione a Madeira Bruta --</option>';
    selectDestino.innerHTML =
      '<option value="">-- Selecione o Produto Final --</option>';

    produtos.forEach((p) => {
      const txt = `${p.sku ? p.sku : 'S/K'} - ${p.nome} (${p.espessura_mm}x${
        p.largura_mm
      }mm) [Estoque: ${p.estoque_pecas} pçs]`;
      selectOrigem.innerHTML += `<option value="${p.id}">${txt}</option>`;
      selectDestino.innerHTML += `<option value="${p.id}">${txt}</option>`;
    });

    async function carregarEFiltrarHistorico() {
      try {
        const { data, error } = await supabase
          .from('desdobros')
          .select('*')
          .order('id', { ascending: false });
        if (error) {
          tabelaHist.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red; padding:20px;">❌ Erro de Leitura: ${error.message}</td></tr>`;
          return;
        }
        if (!data || data.length === 0) {
          tabelaHist.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#7f8c8d; padding:20px;">🪵 Nenhum desdobro registado.</td></tr>`;
          return;
        }

        const termosku = filtroSku.value.toLowerCase().trim();
        const dataInicio = filtroDataInicio.value;
        const dataFim = filtroDataFim.value;
        const tipoRendimento = filtroRendimento.value;

        const registrosFiltrados = data.filter((h) => {
          if (
            termosku &&
            !h.sku_origem.toLowerCase().includes(termosku) &&
            !h.sku_destino.toLowerCase().includes(termosku)
          )
            return false;
          const dataRegistro = h.data_hora.split('T')[0];
          if (dataInicio && dataRegistro < dataInicio) return false;
          if (dataFim && dataRegistro > dataFim) return false;
          const rend = Number(h.rendimento_percentual);
          if (tipoRendimento === 'critico' && rend >= 80) return false;
          if (tipoRendimento === 'excelente' && rend < 95) return false;
          return true;
        });

        if (registrosFiltrados.length === 0) {
          tabelaHist.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#e67e22; padding:20px;">🔍 Nenhum registo corresponde aos filtros aplicados.</td></tr>`;
          return;
        }

        tabelaHist.innerHTML = '';
        registrosFiltrados.forEach((h) => {
          const dt = new Date(h.data_hora).toLocaleString('pt-BR');
          const rend = Number(h.rendimento_percentual);
          let estiloRendimento = 'color: #2c3e50; font-weight: 600;';
          let badgeAlerta = '';
          if (rend < 80) {
            estiloRendimento =
              'color: #e74c3c; font-weight: bold; background: #fdf2f2; padding: 4px 8px; border-radius: 4px; border: 1px solid #fde2e2;';
            badgeAlerta = '⚠️ ';
          }

          tabelaHist.innerHTML += `
              <tr>
                  <td style="font-size:0.9em; color:#7f8c8d;">${dt}</td>
                  <td><span style="color:#e74c3c; font-weight:500;">${
                    h.sku_origem
                  }</span><br><small>${h.nome_origem}</small></td>
                  <td style="text-align:right;">-${h.qtd_origem} pçs</td>
                  <td style="text-align:right; font-family:monospace;">${Number(
                    h.volume_origem
                  ).toFixed(4)} m³</td>
                  <td><span style="color:#2ecc71; font-weight:500;">${
                    h.sku_destino
                  }</span><br><small>${h.nome_destino}</small></td>
                  <td style="text-align:right;">+${h.qtd_destino} pçs</td>
                  <td style="text-align:right; font-family:monospace;">${Number(
                    h.volume_destino
                  ).toFixed(4)} m³</td>
                  <td style="text-align:right; color:#e67e22; font-family:monospace;">${Number(
                    h.perda_m3
                  ).toFixed(4)} m³</td>
                  <td style="text-align:right;"><span style="${estiloRendimento}">${badgeAlerta}${rend.toFixed(
            1
          )}%</span></td>
              </tr>
          `;
        });
      } catch (err) {
        tabelaHist.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red; padding:20px;">❌ Erro: ${err.message}</td></tr>`;
      }
    }

    carregarEFiltrarHistorico();
    filtroSku.addEventListener('input', carregarEFiltrarHistorico);
    filtroDataInicio.addEventListener('change', carregarEFiltrarHistorico);
    filtroDataFim.addEventListener('change', carregarEFiltrarHistorico);
    filtroRendimento.addEventListener('change', carregarEFiltrarHistorico);

    document
      .getElementById('form-desdobro')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('status-desdobro');
        const idOrigem = parseInt(selectOrigem.value);
        const idDestino = parseInt(selectDestino.value);
        const qtdOrigemBaixar = parseInt(
          document.getElementById('desdobro-qtd-origem').value
        );
        const qtdDestinoEntrar = parseInt(
          document.getElementById('desdobro-qtd-destino').value
        );

        if (idOrigem === idDestino) {
          alert('❌ Erro: Produtos idênticos.');
          return;
        }
        const prodOrigem = produtos.find((p) => p.id === idOrigem);
        const prodDestino = produtos.find((p) => p.id === idDestino);

        if (prodOrigem.estoque_pecas < qtdOrigemBaixar) {
          alert(
            `❌ Saldo insuficiente! Estoque atual: ${prodOrigem.estoque_pecas} peças.`
          );
          return;
        }

        status.style.color = '#7f8c8d';
        status.textContent = '🔄 A executar alterações no Supabase...';

        const volOrigemTotal = calcularVolumeM3(
          prodOrigem.espessura_mm,
          prodOrigem.largura_mm,
          prodOrigem.comprimento_m,
          qtdOrigemBaixar
        );
        const volDestinoTotal = calcularVolumeM3(
          prodDestino.espessura_mm,
          prodDestino.largura_mm,
          prodDestino.comprimento_m,
          qtdDestinoEntrar
        );
        const perdaM3 = volOrigemTotal - volDestinoTotal;
        const rendimentoPct = (volDestinoTotal / volOrigemTotal) * 100;

        const { error: errOrigem } = await supabase
          .from('produtos')
          .update({ estoque_pecas: prodOrigem.estoque_pecas - qtdOrigemBaixar })
          .eq('id', idOrigem);
        if (errOrigem) {
          alert('❌ Erro na Origem: ' + errOrigem.message);
          return;
        }

        const { error: errDestino } = await supabase
          .from('produtos')
          .update({
            estoque_pecas: prodDestino.estoque_pecas + qtdDestinoEntrar,
          })
          .eq('id', idDestino);
        if (errDestino) {
          alert('❌ Erro no Destino: ' + errDestino.message);
          return;
        }

        const { error: errHist } = await supabase.from('desdobros').insert([
          {
            sku_origem: prodOrigem.sku || `MAD-${prodOrigem.id}00`,
            nome_origem: prodOrigem.nome,
            qtd_origem: qtdOrigemBaixar,
            volume_origem: volOrigemTotal,
            sku_destino: prodDestino.sku || `MAD-${prodDestino.id}00`,
            nome_destino: prodDestino.nome,
            qtd_destino: qtdDestinoEntrar,
            volume_destino: volDestinoTotal,
            perda_m3: perdaM3 < 0 ? 0 : perdaM3,
            rendimento_percentual: rendimentoPct,
          },
        ]);

        if (errHist) {
          alert('❌ Erro no Histórico: ' + errHist.message);
          return;
        }
        alert(`✅ Sucesso Total!`);
        document.getElementById('form-desdobro').reset();
        abrirTelaDesdobro();
      });
  } catch (err) {
    alert('❌ Erro geral: ' + err.message);
  }
}
