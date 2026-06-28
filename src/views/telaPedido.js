// src/views/telaPedido.js

import {
  obterEstoqueDoPatio,
  processarBaixaEstoque,
  supabase,
} from '../services/cubagem.js';
import { formatarDinheiro } from '../utils/formatters.js';

export async function abrirPedidoVenda() {
  const principal = document.getElementById('conteudo-principal');
  if (!principal) return;

  principal.innerHTML = `<div style="padding: 40px; text-align: center; color: #64748b; font-family: Arial, sans-serif;">⏳ A carregar a interface do pedido...</div>`;

  let produtos = [];
  try {
    produtos = await obterEstoqueDoPatio();
  } catch (error) {
    console.error('Erro ao carregar produtos', error);
  }

  // Geração de um número de pedido aleatório para simular o sistema
  const numeroPedidoGerado = Math.floor(Math.random() * 10000).toString();

  principal.innerHTML = `
    <style>
      .bling-container { max-width: 1000px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #333; padding: 20px 30px 50px 30px; background: #fff; }
      .bling-container h2 { font-size: 18px; font-weight: bold; margin-bottom: 25px; color: #333; }
      .bling-row { display: flex; gap: 20px; margin-bottom: 12px; flex-wrap: wrap; }
      .bling-col { display: flex; flex-direction: column; gap: 4px; flex: 1; }
      .bling-col-fixed { display: flex; flex-direction: column; gap: 4px; }
      label { font-size: 12px; font-weight: bold; color: #555; }
      input, select, textarea { padding: 6px 10px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px; outline: none; background: #fff; color: #333; width: 100%; box-sizing: border-box; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
      input:focus, select:focus, textarea:focus { border-color: #66afe9; box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6); }
      input[readonly] { background: #f5f5f5; color: #555; cursor: not-allowed; box-shadow: none; }
      .input-group { display: flex; align-items: stretch; width: 100%; }
      .input-group input { border-radius: 3px; }
      .input-group.prefix input { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: none; }
      .input-group.suffix input { border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: none; }
      .input-group-addon { background: #eee; border: 1px solid #ccc; padding: 6px 10px; color: #555; font-size: 12px; display: flex; align-items: center; justify-content: center; }
      .input-group.prefix .input-group-addon { border-right: none; border-top-left-radius: 3px; border-bottom-left-radius: 3px; }
      .input-group.suffix .input-group-addon { border-left: none; border-top-right-radius: 3px; border-bottom-right-radius: 3px; }
      .input-group-btn { border: 1px solid #ccc; border-left: none; background: #fff; padding: 0 10px; border-radius: 0 3px 3px 0; cursor: pointer; color: #666; }
      .input-group-btn:hover { background: #e6e6e6; }
      .action-links { font-size: 11px; margin-top: 2px; display: flex; gap: 15px; }
      .action-links a { color: #337ab7; text-decoration: none; cursor: pointer; }
      .action-links a:hover { text-decoration: underline; color: #23527c; }
      .hint { font-size: 11px; color: #888; margin-top: 2px; }
      .checkbox-container { display: flex; align-items: center; gap: 8px; margin: 15px 0; }
      .checkbox-container input { width: auto; box-shadow: none; }
      .checkbox-container label { font-weight: normal; font-size: 12px; margin: 0; }
      .section-divider { border-bottom: 2px solid #ddd; margin: 30px 0 20px 0; display: flex; gap: 20px; }
      .section-tab { padding: 8px 5px; font-size: 13px; font-weight: bold; color: #777; cursor: pointer; margin-bottom: -2px; }
      .section-tab.active { color: #333; border-bottom: 2px solid #333; }
      .section-title { font-size: 14px; font-weight: bold; color: #333; margin: 30px 0 15px 0; display: block; }
      table { width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 5px; }
      th { font-size: 11px; color: #666; font-weight: bold; border-bottom: 1px solid #ddd; padding: 8px 5px; }
      td { border-bottom: 1px solid #eee; padding: 5px; vertical-align: top; }
      td input { font-size: 12px; }
      .icon-link { background: none; border: none; color: #337ab7; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; padding: 5px 0; font-weight: normal; }
      .icon-link:hover { text-decoration: underline; }
      .bg-yellow { background-color: #fcf8e3 !important; font-weight: bold; }
      #dados-cliente-panel { background: #fdfdfd; border: 1px solid #eee; padding: 15px; border-radius: 4px; margin-bottom: 15px; display: block; }
      .footer-bar { margin-top: 40px; display: flex; gap: 15px; align-items: center; border-top: 1px solid #eee; padding-top: 20px;}
      .btn-salvar { background: #0054cc; color: white; border: none; padding: 10px 30px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer; transition: 0.2s; }
      .btn-salvar:hover { background: #0044a6; }
      .btn-salvar:disabled { background: #999; cursor: not-allowed; }
      .btn-cancelar { background: none; border: none; color: #333; font-size: 13px; cursor: pointer; }
      .btn-cancelar:hover { text-decoration: underline; }
    </style>

    <div class="bling-container">
      <h2>Pedido de Venda</h2>

      <div class="bling-row">
        <div class="bling-col-fixed" style="width: 120px;">
          <label>Número</label>
          <input type="text" id="numero_pedido" value="${numeroPedidoGerado}" readonly>
        </div>
        <div class="bling-col" style="flex: 2;">
          <label>Cliente</label>
          <div class="input-group suffix">
            <input type="text" id="cliente_nome" placeholder="Pesquise pelas iniciais do nome do cliente...">
            <button class="input-group-btn">🔍</button>
          </div>
        
        </div>
        <div class="bling-col" style="flex: 1;">
          <label>Vendedor</label>
          <input type="text" id="vendedor" placeholder="Nome do vendedor">
        </div>
      </div>

      <div id="dados-cliente-panel">
        <strong style="display:block; margin-bottom:10px; font-size:13px; color:#333;">Dados do Cliente Expandidos</strong>
        <div class="bling-row">
            <div class="bling-col"><label>Tipo de Pessoa</label><select id="cliente_tipo_pessoa"><option>Física</option><option>Jurídica</option></select></div>
            <div class="bling-col"><label>CPF/CNPJ</label><input type="text" id="cliente_cpf_cnpj"></div>
            <div class="bling-col"><label>Contribuinte</label><select><option>Não informado</option></select></div>
            <div class="bling-col"><label>Inscrição Estadual</label><input type="text" id="cliente_ie"></div>
        </div>
        <div class="bling-row">
            <div class="bling-col"><label>RG</label><input type="text" id="cliente_rg"></div>
            <div class="bling-col"><label>CEP</label><input type="text" id="cliente_cep"></div>
            <div class="bling-col">
              <label>UF</label>

              <select id="cliente_uf">
                <option value="">Selecione...</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
              
            </div>
        </div>
        <div class="bling-row">
            
        
          <div class="bling-col" style="flex:2">
              <label>Endereço</label>
              <input type="text" id="cliente_endereco">
          </div>

          <div class="bling-col">
            <label>Número</label>
            <input type="text" id="cliente_numero">
          </div>

          <div class="bling-col">
            <label>Bairro</label>
            <input type="text" id="cliente_bairro">
          </div>

          <div class="bling-col">
            <label>Cidade</label>
            <input type="text" id="cliente_cidade">
         </div>
</div>

        <div class="bling-row">
            <div class="bling-col"><label>Complemento</label><input type="text" id="cliente_complemento"></div>
            <div class="bling-col"><label>Telefone</label><input type="text" id="cliente_telefone"></div>
            <div class="bling-col"><label>Celular</label><input type="text" id="cliente_celular"></div>
            <div class="bling-col"><label>Email</label><input type="email" id="cliente_email"></div>
        </div>
      </div>

      <div class="section-divider">
        <div class="section-tab active">Itens de produtos ou serviços</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 25px;">Nº</th>
            <th>Descrição</th>
            <th style="width: 100px;">Código (SKU)</th>
            <th style="width: 60px;">Qtde</th>
            <th style="width: 50px;">UN</th>
            <th style="width: 80px;">Preço lista</th>
            <th style="width: 60px;">% Desc</th>
            <th style="width: 80px;">Preço un</th>
            <th style="width: 100px;">Preço total</th>
            <th style="width: 40px; text-align: center;">Ações</th>
          </tr>
        </thead>
        <tbody id="tabela-corpo"></tbody>
      </table>

      <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:center;">
        <div style="flex: 1; max-width: 500px;">
            <input type="text" list="lista-madeiras" id="busca-item" placeholder="🛒 Digite o nome ou SKU para inserir na tabela ...." style="border-color:#337ab7;">
            <datalist id="lista-madeiras">
                ${produtos
                  .map(
                    (p) =>
                      `<option value="${p.sku}">${p.nome} - ${p.espessura_mm}x${p.largura_mm}mm</option>`
                  )
                  .join('')}
            </datalist>
        </div>
        <button id="btn-add-item" style="padding: 6px 12px; background: #fff; border: 1px solid #ccc; border-radius: 3px; cursor:pointer; color:#337ab7; font-weight:bold;"> + Adicionar Item</button>
      </div>

      <span class="section-title">Totais</span>
      <div class="bling-row">
        <div class="bling-col"><label>Nº de itens</label><input type="text" id="tot-itens" value="0" readonly></div>
        <div class="bling-col"><label>Soma das qtdes</label><input type="text" id="tot-qtdes" value="0" readonly></div>
        <div class="bling-col"><label>Peso Bruto</label><div class="input-group suffix"><input type="text" id="peso_bruto" value="0"><span class="input-group-addon">kg</span></div></div>
        <div class="bling-col"><label>Peso Líquido</label><div class="input-group suffix"><input type="text" id="peso_liquido" value="0"><span class="input-group-addon">kg</span></div></div>
      </div>
      <div class="bling-row">
        <div class="bling-col"><label>Total produtos</label><div class="input-group prefix"><span class="input-group-addon">R$</span><input type="text" id="tot-produtos" value="0,00" readonly></div></div>
        <div class="bling-col"><label>Total da venda</label><div class="input-group prefix"><span class="input-group-addon bg-yellow">R$</span><input type="text" id="tot-venda" class="bg-yellow" value="0,00" readonly></div></div>
        <div class="bling-col" style="flex: 2;"></div>
      </div>

      <span class="section-title">Detalhes da venda</span>
      <div class="bling-row">
        <div class="bling-col"><label>Data da venda</label><div class="input-group suffix"><input type="date" id="data_venda"></div></div>
        <div class="bling-col"><label>Data prevista de entrega</label><div class="input-group suffix"><input type="date" id="data_prevista_entrega"></div></div>
      </div>
      <div class="bling-row">
        <div class="bling-col"><label>Desconto</label><input type="text" id="desconto" value="0"><span class="hint">(Ex: 3,00 ou 10%)</span></div>
        <div class="bling-col"><label>Frete pago pelo cliente</label><div class="input-group prefix"><span class="input-group-addon">R$</span><input type="text" id="frete_cliente" value="0,00"></div></div>
        <div class="bling-col"><label>Frete pago pela empresa</label><div class="input-group prefix"><span class="input-group-addon">R$</span><input type="text" id="frete_empresa" value="0,00"></div></div>
        <div class="bling-col"><label>Despesas</label><div class="input-group prefix"><span class="input-group-addon">R$</span><input type="text" id="despesas" value="0,00"></div></div>
      </div>

      <div class="section-divider"><div class="section-tab active">Pagamento</div></div>
      <div class="bling-row">
        <div class="bling-col-fixed" style="width: 250px;">
          <label>Forma de recebimento</label>
          <select id="forma_recebimento">
            <option>Selecione</option><option>Dinheiro</option><option>Cartão de crédito</option><option>Boleto</option><option>Pix</option>
          </select>
        </div>
      </div>

      <span class="section-title">Dados adicionais</span>
      <div class="bling-row">
        <div class="bling-col"><label>Observações</label><textarea id="observacoes" rows="3" style="resize:vertical;"></textarea></div>
      </div>
      <div class="bling-row">
        <div class="bling-col"><label>Observações Internas</label><textarea id="observacoes_internas" rows="3" style="resize:vertical;"></textarea></div>
      </div>

      <div class="footer-bar">
        <button class="btn-salvar">salvar</button>
        <button class="btn-cancelar" onclick="document.querySelector('[data-tela=\\'estoque\\']').click()">cancelar</button>
      </div>

    </div>
  `;


//===========================
// BUSCA CEP AUTOMÁTICA
//===========================

const campoCEP = document.getElementById('cliente_cep');

campoCEP.addEventListener("input", () => {

    // Mantém somente números
    let cep = campoCEP.value.replace(/\D/g, "");

    // Limita a 8 dígitos
    cep = cep.substring(0, 8);

    // Coloca o hífen automaticamente
    if (cep.length > 5) {
        cep = cep.replace(/(\d{5})(\d)/, "$1-$2");
    }

    campoCEP.value = cep;

    // Consulta automaticamente
    if (cep.replace(/\D/g, "").length === 8) {
        buscarCEP();
    }

});

async function buscarCEP() {

    const cep = campoCEP.value.replace(/\D/g,'');

    if (cep.length != 8)
        return;

    try {

        campoCEP.disabled = true;

        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        const dados = await resposta.json();

        if (dados.erro) {
            alert("CEP não encontrado.");
            return;
        }

        document.getElementById("cliente_endereco").value = dados.logradouro || "";
        document.getElementById("cliente_bairro").value = dados.bairro || "";
        document.getElementById("cliente_cidade").value = dados.localidade || "";
        document.getElementById("cliente_uf").value = dados.uf || "";
        document.getElementById("cliente_complemento").value = dados.complemento || "";

        document.getElementById("cliente_numero").focus();

    } catch (erro) {

        console.error(erro);
        alert("Erro ao consultar CEP.");

    } finally {

        campoCEP.disabled = false;

    }

}

  // === LÓGICA DA TABELA DE ITENS ===
  const tbody = document.getElementById('tabela-corpo');
  const inputBusca = document.getElementById('busca-item');
  const btnAdd = document.getElementById('btn-add-item');

  let itensPedido = [];
  let contadorId = 1;

  function atualizarTotaisGlobais() {
    let somaItens = itensPedido.length;
    let somaQtdes = 0;
    let somaDinheiro = 0;

    itensPedido.forEach((item) => {
      somaQtdes += item.qtd;
      somaDinheiro += item.qtd * item.preco;
    });

    document.getElementById('tot-itens').value = somaItens;
    document.getElementById('tot-qtdes').value = somaQtdes;

    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(somaDinheiro);
    document.getElementById('tot-produtos').value = valorFormatado;
    document.getElementById('tot-venda').value = valorFormatado;
  }

  function renderizarTabela() {
    tbody.innerHTML = '';
    if (itensPedido.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 20px; color: #999;">Nenhum item adicionado ao pedido.</td></tr>`;
    }

    itensPedido.forEach((item, index) => {
      const precoTotal = item.qtd * item.preco;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:center; padding-top:10px;">${index + 1}</td>
        <td><input type="text" value="${
          item.nome
        }" readonly style="border:none; background:transparent;"></td>
        <td><input type="text" value="${
          item.sku
        }" readonly style="border:none; background:transparent;"></td>
        <td><input type="number" class="input-qtd" data-id="${
          item.id
        }" value="${item.qtd}" min="1"></td>
        <td><input type="text" value="UN" readonly style="border:none; background:transparent; text-align:center;"></td>
        <td><input type="text" value="${new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
        }).format(
          item.preco
        )}" readonly style="border:none; background:transparent;"></td>
        <td><input type="text" value="0"></td>
        <td><input type="text" value="${new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
        }).format(
          item.preco
        )}" readonly style="border:none; background:transparent;"></td>
        <td><input type="text" value="${new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
        }).format(
          precoTotal
        )}" readonly style="border:none; background:transparent; font-weight:bold; color:#333;"></td>
        <td style="text-align: center; padding-top:8px;">
           <button class="btn-remover" data-id="${
             item.id
           }" style="background:none; border:none; cursor:pointer; font-size:16px;" title="Remover">❌</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.input-qtd').forEach((input) => {
      input.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const novaQtd = parseInt(e.target.value) || 1;
        const item = itensPedido.find((i) => i.id === id);
        if (item) {
          item.qtd = novaQtd;
        }
        renderizarTabela();
      });
    });

    document.querySelectorAll('.btn-remover').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(
          e.target.closest('.btn-remover').getAttribute('data-id')
        );
        itensPedido = itensPedido.filter((i) => i.id !== id);
        renderizarTabela();
      });
    });

    atualizarTotaisGlobais();
  }

  btnAdd.addEventListener('click', () => {
    const skuBuscado = inputBusca.value;
    const produtoEncontrado = produtos.find((p) => p.sku === skuBuscado);
    if (produtoEncontrado) {
      itensPedido.push({
        id: contadorId++,
        sku: produtoEncontrado.sku,
        nome: produtoEncontrado.nome,
        preco: produtoEncontrado.preco_venda || 0,
        qtd: 1,
      });
      inputBusca.value = '';
      renderizarTabela();
    } else {
      alert('Produto não encontrado! Selecione um item válido da lista.');
    }
  });

  renderizarTabela();

  // ==========================================
  // FUNÇÃO DE SALVAR E INTERAÇÃO COM O SUPABASE
  // ==========================================

  // Função auxiliar para converter "1.500,00" para 1500.00
  const parseDinheiroParaFloat = (valorString) => {
    if (!valorString) return 0;
    return parseFloat(valorString.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const btnSalvar = document.querySelector('.btn-salvar');
  btnSalvar.addEventListener('click', async () => {
    if (itensPedido.length === 0) {
      alert('Adicione pelo menos um item ao pedido!');
      return;
    }

    try {
      btnSalvar.disabled = true;
      btnSalvar.innerText = 'Processando...';

      // 1. CHAMA A FUNÇÃO DE BAIXA NO ESTOQUE
      await processarBaixaEstoque(itensPedido);

      // 2. COLETA TODOS OS DADOS DA TELA
      const pedidoDados = {
        numero_pedido: document.getElementById('numero_pedido').value,
        cliente_nome: document.getElementById('cliente_nome').value,
        vendedor: document.getElementById('vendedor').value,

        cliente_tipo_pessoa: document.getElementById('cliente_tipo_pessoa')
          .value,
        cliente_cpf_cnpj: document.getElementById('cliente_cpf_cnpj').value,
        cliente_ie: document.getElementById('cliente_ie').value,
        cliente_rg: document.getElementById('cliente_rg').value,
        cliente_data_nascimento:
        cliente_cep: document.getElementById('cliente_cep').value,
        cliente_uf: document.getElementById('cliente_uf').value,
        cliente_cidade: document.getElementById('cliente_cidade').value,
        cliente_endereco: document.getElementById('cliente_endereco').value,
        cliente_numero: document.getElementById('cliente_numero').value,
        cliente_bairro: document.getElementById('cliente_bairro').value,
        cliente_complemento: document.getElementById('cliente_complemento')
          .value,
        cliente_telefone: document.getElementById('cliente_telefone').value,
        cliente_celular: document.getElementById('cliente_celular').value,
        cliente_email: document.getElementById('cliente_email').value,

        itens_json: itensPedido,
        quantidade_itens:
          parseInt(document.getElementById('tot-itens').value) || 0,
        soma_quantidades:
          parseInt(document.getElementById('tot-qtdes').value) || 0,
        peso_bruto:
          parseFloat(document.getElementById('peso_bruto').value) || 0,
        peso_liquido:
          parseFloat(document.getElementById('peso_liquido').value) || 0,

        total_produtos: parseDinheiroParaFloat(
          document.getElementById('tot-produtos').value
        ),
        total_venda: parseDinheiroParaFloat(
          document.getElementById('tot-venda').value
        ),

        data_venda: document.getElementById('data_venda').value || null,
        data_prevista_entrega:
          document.getElementById('data_prevista_entrega').value || null,

        desconto: parseDinheiroParaFloat(
          document.getElementById('desconto').value
        ),
        frete_cliente: parseDinheiroParaFloat(
          document.getElementById('frete_cliente').value
        ),
        frete_empresa: parseDinheiroParaFloat(
          document.getElementById('frete_empresa').value
        ),
        despesas: parseDinheiroParaFloat(
          document.getElementById('despesas').value
        ),

        forma_recebimento: document.getElementById('forma_recebimento').value,
        observacoes: document.getElementById('observacoes').value,
        observacoes_internas: document.getElementById('observacoes_internas')
          .value,
        status_pedido: 'Aberto',
      };

      // 3. SALVA O PEDIDO NA TABELA 'pedidos' DO SUPABASE
      const { error: erroPedido } = await supabase
        .from('pedidos')
        .insert([pedidoDados]);

      if (erroPedido) throw erroPedido;

      alert('✅ Pedido salvo com sucesso e estoque atualizado!');

      // Limpa o pedido após sucesso e recarrega
      itensPedido = [];
      renderizarTabela();
      document.querySelector('[data-tela="estoque"]').click(); // Volta para a tela principal (opcional)
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao processar pedido: ' + err.message);
    } finally {
      btnSalvar.innerText = 'salvar';
      btnSalvar.disabled = false;
    }
  });
}
