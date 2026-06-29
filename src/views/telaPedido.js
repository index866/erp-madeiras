// src/views/telaPedido.js

import { obterEstoqueDoPatio, processarBaixaEstoque, supabase } from '../services/cubagem.js';

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

  const numeroPedidoGerado = Math.floor(Math.random() * 10000).toString();

  principal.innerHTML = `
    <style>
      .bling-container { max-width: 1000px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #333; padding: 20px 30px 50px 30px; background: #fff; }
      .bling-container h2 { font-size: 18px; font-weight: bold; margin-bottom: 25px; color: #333; }
      .bling-row { display: flex; gap: 20px; margin-bottom: 12px; flex-wrap: wrap; }
      .bling-col { display: flex; flex-direction: column; gap: 4px; flex: 1; position: relative; }
      .bling-col-fixed { display: flex; flex-direction: column; gap: 4px; }
      label { font-size: 12px; font-weight: bold; color: #555; }
      input, select, textarea { padding: 6px 10px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px; outline: none; background: #fff; color: #333; width: 100%; box-sizing: border-box; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
      input:focus, select:focus, textarea:focus { border-color: #66afe9; box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6); }
      input[readonly] { background: #f5f5f5; color: #555; cursor: not-allowed; box-shadow: none; }
      .input-group { display: flex; align-items: stretch; width: 100%; }
      .input-group input { border-radius: 3px; }
      .input-group.prefix input { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: none; }
      .input-group.suffix input { border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: none; }
      .input-group-addon { background: #eee; border: 1px solid #ccc; padding: 6px 10px; color: #555; font-size: 12px; display: flex; align-items: center; justify-content: center; white-space: nowrap; }
      .input-group.prefix .input-group-addon { border-right: none; border-top-left-radius: 3px; border-bottom-left-radius: 3px; }
      .input-group.suffix .input-group-addon { border-left: none; border-top-right-radius: 3px; border-bottom-right-radius: 3px; }
      .section-divider { border-bottom: 2px solid #ddd; margin: 30px 0 20px 0; display: flex; gap: 20px; }
      .section-tab { padding: 8px 5px; font-size: 13px; font-weight: bold; color: #777; cursor: pointer; margin-bottom: -2px; }
      .section-tab.active { color: #333; border-bottom: 2px solid #333; }
      .section-title { font-size: 14px; font-weight: bold; color: #333; margin: 30px 0 15px 0; display: block; }
      table { width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 5px; }
      th { font-size: 11px; color: #666; font-weight: bold; border-bottom: 1px solid #ddd; padding: 8px 5px; }
      td { border-bottom: 1px solid #eee; padding: 5px; vertical-align: middle; }
      td input { font-size: 12px; }
      .bg-yellow { background-color: #fcf8e3 !important; font-weight: bold; }
      #dados-cliente-panel { background: #fdfdfd; border: 1px solid #eee; padding: 15px; border-radius: 4px; margin-bottom: 15px; display: block; }
      .footer-bar { margin-top: 40px; display: flex; gap: 15px; align-items: center; border-top: 1px solid #eee; padding-top: 20px;}
      .btn-salvar { background: #0054cc; color: white; border: none; padding: 10px 30px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer; transition: 0.2s; }
      .btn-salvar:hover { background: #0044a6; }
      .btn-salvar:disabled { background: #999; cursor: not-allowed; }
      
      .autocomplete-list { position: absolute; z-index: 1000; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #ccc; border-radius: 0 0 4px 4px; max-height: 250px; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: none; margin-top: 2px; }
      .autocomplete-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; display: flex; flex-direction: column; gap: 4px; }
      .autocomplete-item:hover { background: #f0f9ff; }
      .item-title { font-weight: bold; color: #333; }
      .item-sub { font-size: 11px; color: #666; display: flex; justify-content: space-between; }
      .loader-text { color: #0284c7; font-size: 11px; font-weight: bold; font-style: italic; display: none; }
      .success-text { color: #16a34a; font-size: 11px; font-weight: bold; display: none; }
    
      .erp-container { max-width: 1100px; margin: 20px auto; font-family: 'Segoe UI', sans-serif; background: #f8fafc; padding: 20px; }
      .card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .grid-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px; }
      .field { display: flex; flex-direction: column; gap: 5px; }
      label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
      input, select { padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; width: 100%; box-sizing: border-box; }
      .bottom-section { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
      .resumo-card { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
    </style>
    <div class="card">
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
            <input type="text" id="cliente_nome" placeholder="Pesquise pelo nome do cliente..." autocomplete="off">
            <span class="input-group-addon">🔍</span>
          </div>
          <div id="autocomplete-clientes" class="autocomplete-list"></div>
        </div>
        <div class="bling-col" style="flex: 1;">
          <label>Vendedor</label>
          <input type="text" id="vendedor" placeholder="Nome do vendedor">
        </div>
      </div>
</div>

<div class="card">
      <div id="dados-cliente-panel">
        <strong style="display:block; margin-bottom:10px; font-size:13px; color:#333;">Dados do Cliente Expandidos</strong>
        <div class="bling-row">
            <div class="bling-col"><label>Tipo de Pessoa</label><select id="cliente_tipo_pessoa"><option value="Física">Física</option><option value="Jurídica">Jurídica</option></select></div>
            <div class="bling-col">
              <label style="display:flex; justify-content:space-between;">CPF/CNPJ <span id="status-cnpj" class="loader-text">🔄 Consultando...</span></label>
              <input type="text" id="cliente_cpf_cnpj" placeholder="000.000.000-00">
            </div>
            <div class="bling-col"><label>Contribuinte</label><select><option>Não informado</option></select></div>
            <div class="bling-col"><label>Inscrição Estadual</label><input type="text" id="cliente_ie"></div>
        </div>
        <div class="bling-row">
            <div class="bling-col"><label>RG</label><input type="text" id="cliente_rg"></div>
            <div class="bling-col"><label>Data Nascimento</label><input type="date" id="cliente_data_nascimento"></div>
            <div class="bling-col">
              <label style="display:flex; justify-content:space-between;">CEP <span id="status-cep" class="loader-text">🔄 Consultando...</span><span id="status-cep-ok" class="success-text">✔ Localizado</span></label>
              <input type="text" id="cliente_cep" placeholder="00000-000">
            </div>
            <div class="bling-col">
              <label>UF</label>
              <select id="cliente_uf">
                <option value="">Selecione...</option>
                <option value="AC">Acre</option><option value="AL">Alagoas</option><option value="AP">Amapá</option><option value="AM">Amazonas</option><option value="BA">Bahia</option><option value="CE">Ceará</option><option value="DF">Distrito Federal</option><option value="ES">Espírito Santo</option><option value="GO">Goiás</option><option value="MA">Maranhão</option><option value="MT">Mato Grosso</option><option value="MS">Mato Grosso do Sul</option><option value="MG">Minas Gerais</option><option value="PA">Pará</option><option value="PB">Paraíba</option><option value="PR">Paraná</option><option value="PE">Pernambuco</option><option value="PI">Piauí</option><option value="RJ">Rio de Janeiro</option><option value="RN">Rio Grande do Norte</option><option value="RS">Rio Grande do Sul</option><option value="RO">Rondônia</option><option value="RR">Roraima</option><option value="SC">Santa Catarina</option><option value="SP">São Paulo</option><option value="SE">Sergipe</option><option value="TO">Tocantins</option>
              </select>
            </div>
        </div>
        <div class="bling-row">
          <div class="bling-col" style="flex:2">
              <label>Endereço</label>
              <input type="text" id="cliente_endereco">
          </div>
          <div class="bling-col"><label>Número</label><input type="text" id="cliente_numero"></div>
          <div class="bling-col"><label>Bairro</label><input type="text" id="cliente_bairro"></div>
          <div class="bling-col"><label>Cidade</label><input type="text" id="cliente_cidade"></div>
        </div>

        <div class="bling-row">
            <div class="bling-col"><label>Complemento</label><input type="text" id="cliente_complemento"></div>
            <div class="bling-col"><label>Telefone</label><input type="text" id="cliente_telefone" placeholder="(00) 0000-0000"></div>
            <div class="bling-col"><label>Celular</label><input type="text" id="cliente_celular" placeholder="(00) 00000-0000"></div>
            <div class="bling-col"><label>Email</label><input type="email" id="cliente_email"></div>
        </div>
      </div>
</div>
<div class="card">
      <div class="section-divider">
        <div class="section-tab active">Itens de produtos ou serviços</div>
      </div>


      <div style="margin-bottom: 20px; display:flex; gap:10px; align-items:center; position:relative;">
        <div style="flex: 1; max-width: 500px; position:relative;">
            <input type="text" id="busca-item" placeholder="🛒 Digite o nome ou SKU para inserir na tabela ...." style="border-color:#337ab7;" autocomplete="off">
            <div id="autocomplete-produtos" class="autocomplete-list"></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 25px;">Nº</th>
            <th>Descrição</th>
            <th style="width: 100px;">Código (SKU)</th>
            <th style="width: 70px;">Qtde</th>
            <th style="width: 50px;">UN</th>
            <th style="width: 80px;">Preço un</th>
            <th style="width: 100px;">Preço total</th>
            <th style="width: 40px; text-align: center;">Ações</th>
          </tr>
        </thead>
        <tbody id="tabela-corpo"></tbody>
      </table>
</div>
<div class="card">

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
        <div class="bling-col"><label>Desconto (R$)</label><input type="text" class="recalculo-trigger" id="desconto" value="0,00"></div>
        <div class="bling-col"><label>Frete pago pelo cliente</label><div class="input-group prefix"><span class="input-group-addon">R$</span><input type="text" class="recalculo-trigger" id="frete_cliente" value="0,00"></div></div>
        <div class="bling-col"><label>Frete pago pela empresa</label><div class="input-group prefix"><span class="input-group-addon">R$</span><input type="text" id="frete_empresa" value="0,00"></div></div>
        <div class="bling-col"><label>Despesas</label><div class="input-group prefix"><span class="input-group-addon">R$</span><input type="text" class="recalculo-trigger" id="despesas" value="0,00"></div></div>
      </div>
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

<div class="card">

      <span class="section-title">Dados adicionais</span>
      <div class="bling-row">
        <div class="bling-col"><label>Observações</label><textarea id="observacoes" rows="3" style="resize:vertical;"></textarea></div>
      </div>
      <div class="bling-row">
        <div class="bling-col"><label>Observações Internas</label><textarea id="observacoes_internas" rows="3" style="resize:vertical;"></textarea></div>
      </div>

      <div class="footer-bar">
        <button class="btn-salvar">Salvar Pedido</button>
      </div>

    </div>
</div>
  `;

  // ==========================================
  // 1. MÁSCARAS AUTOMÁTICAS
  // ==========================================
  const aplicarMascara = (input, tipo) => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (tipo === 'cpf_cnpj') {
        if (v.length <= 11) {
          v = v.replace(/(\d{3})(\d)/, "$1.$2");
          v = v.replace(/(\d{3})(\d)/, "$1.$2");
          v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        } else {
          v = v.replace(/^(\d{2})(\d)/, "$1.$2");
          v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
          v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
          v = v.replace(/(\d{4})(\d)/, "$1-$2");
        }
      } else if (tipo === 'cep') {
        v = v.replace(/^(\d{5})(\d)/, "$1-$2");
      } else if (tipo === 'tel') {
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d)(\d{4})$/, "$1-$2");
      }
      e.target.value = v;
    });
  };

  const campoCPFCNPJ = document.getElementById('cliente_cpf_cnpj');
  const campoCEP = document.getElementById('cliente_cep');
  
  aplicarMascara(campoCPFCNPJ, 'cpf_cnpj');
  aplicarMascara(campoCEP, 'cep');
  aplicarMascara(document.getElementById('cliente_telefone'), 'tel');
  aplicarMascara(document.getElementById('cliente_celular'), 'tel');

  // ==========================================
  // 2. BUSCA DE CLIENTE EM TEMPO REAL
  // ==========================================
  const inputCliente = document.getElementById('cliente_nome');
  const listaClientes = document.getElementById('autocomplete-clientes');

  inputCliente.addEventListener('input', async (e) => {
    const val = e.target.value;
    listaClientes.innerHTML = '';
    if (val.length < 2) { listaClientes.style.display = 'none'; return; }

    try {
      const { data: clientesEncontrados } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nome', `%${val}%`)
        .limit(5);

      if (clientesEncontrados && clientesEncontrados.length > 0) {
        clientesEncontrados.forEach(c => {
          const div = document.createElement('div');
          div.className = 'autocomplete-item';
          div.innerHTML = `<div class="item-title">${c.nome}</div><div class="item-sub"><span>${c.cpf_cnpj || ''}</span></div>`;
          div.addEventListener('click', () => {
            inputCliente.value = c.nome;
            campoCPFCNPJ.value = c.cpf_cnpj || '';
            document.getElementById('cliente_rg').value = c.rg || '';
            campoCEP.value = c.cep || '';
            document.getElementById('cliente_uf').value = c.uf || '';
            document.getElementById('cliente_cidade').value = c.cidade || '';
            document.getElementById('cliente_endereco').value = c.endereco || '';
            document.getElementById('cliente_numero').value = c.numero || '';
            document.getElementById('cliente_bairro').value = c.bairro || '';
            document.getElementById('cliente_telefone').value = c.telefone || '';
            document.getElementById('cliente_email').value = c.email || '';
            
            document.getElementById('cliente_tipo_pessoa').value = (c.cpf_cnpj && c.cpf_cnpj.replace(/\D/g, '').length > 11) ? 'Jurídica' : 'Física';
            listaClientes.style.display = 'none';
          });
          listaClientes.appendChild(div);
        });
        listaClientes.style.display = 'block';
      }
    } catch (err) {
      console.log('Erro na busca de clientes:', err);
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target !== inputCliente) listaClientes.style.display = 'none';
    if (e.target !== document.getElementById('busca-item')) document.getElementById('autocomplete-produtos').style.display = 'none';
  });

  // ==========================================
  // 3. CONSULTA CNPJ (BRASIL API)
  // ==========================================
  campoCPFCNPJ.addEventListener('blur', async () => {
    const cnpj = campoCPFCNPJ.value.replace(/\D/g, '');
    if (cnpj.length === 14) {
      const statusCNPJ = document.getElementById('status-cnpj');
      statusCNPJ.style.display = 'inline';
      statusCNPJ.style.color = '#0284c7';
      statusCNPJ.innerText = '🔄 Consultando...';
      
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        const dados = await res.json();
        
        if (dados.razao_social) {
          inputCliente.value = dados.razao_social;
          document.getElementById('cliente_tipo_pessoa').value = 'Jurídica';
          campoCEP.value = dados.cep.replace(/^(\d{5})(\d)/, "$1-$2");
          document.getElementById('cliente_uf').value = dados.uf;
          document.getElementById('cliente_cidade').value = dados.municipio;
          document.getElementById('cliente_bairro').value = dados.bairro;
          document.getElementById('cliente_endereco').value = dados.logradouro;
          document.getElementById('cliente_numero').value = dados.numero;
          document.getElementById('cliente_complemento').value = dados.complemento || '';
          document.getElementById('cliente_telefone').value = dados.ddd_telefone_1 || '';
          
          statusCNPJ.style.color = '#16a34a';
          statusCNPJ.innerText = '✔ CNPJ Localizado';
        }
      } catch (err) {
        statusCNPJ.style.color = '#dc2626';
        statusCNPJ.innerText = '❌ Erro na consulta';
      }
      setTimeout(() => statusCNPJ.style.display = 'none', 3000);
    }
  });

  // ==========================================
  // 7. CONSULTA CEP ELEGANTE (VIA CEP)
  // ==========================================
  campoCEP.addEventListener("input", async () => {
    const cep = campoCEP.value.replace(/\D/g, "");
    if (cep.length === 8) {
      const lblLoading = document.getElementById('status-cep');
      const lblOk = document.getElementById('status-cep-ok');
      
      lblOk.style.display = 'none';
      lblLoading.style.display = 'inline';
      campoCEP.disabled = true;

      try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();
        if (!dados.erro) {
            document.getElementById("cliente_endereco").value = dados.logradouro || "";
            document.getElementById("cliente_bairro").value = dados.bairro || "";
            document.getElementById("cliente_cidade").value = dados.localidade || "";
            document.getElementById("cliente_uf").value = dados.uf || "";
            document.getElementById("cliente_complemento").value = dados.complemento || "";
            
            lblLoading.style.display = 'none';
            lblOk.style.display = 'inline';
            setTimeout(() => lblOk.style.display = 'none', 3000);
            document.getElementById("cliente_numero").focus();
        }
      } catch (erro) {
        console.error(erro);
      } finally {
        lblLoading.style.display = 'none';
        campoCEP.disabled = false;
      }
    }
  });

  // ==========================================
  // 5. BUSCA DE PRODUTO ESTILO BLING
  // ==========================================
  const inputBusca = document.getElementById('busca-item');
  const listaProdutosUI = document.getElementById('autocomplete-produtos');
  const tbody = document.getElementById('tabela-corpo');
  
  let itensPedido = [];
  let contadorId = 1;

  inputBusca.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    listaProdutosUI.innerHTML = '';
    
    if (!val) { listaProdutosUI.style.display = 'none'; return; }

    const filtrados = produtos.filter(p => 
      (p.nome && p.nome.toLowerCase().includes(val)) || 
      (p.sku && p.sku.toLowerCase().includes(val))
    );

    if (filtrados.length > 0) {
      filtrados.forEach(p => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerHTML = `
          <div class="item-title">${p.nome} - ${p.espessura_mm}x${p.largura_mm}mm</div>
          <div class="item-sub">
            <span>SKU: ${p.sku}</span>
            <span style="color:#0284c7; font-weight:bold;">Estoque: ${p.estoque_pecas || 0}</span>
          </div>`;
          
        div.addEventListener('click', () => {
          itensPedido.push({ id: contadorId++, sku: p.sku, nome: p.nome, preco: p.preco_venda || 0, qtd: 1 });
          inputBusca.value = '';
          listaProdutosUI.style.display = 'none';
          renderizarTabela();
          
          setTimeout(() => {
            const inputsQtd = document.querySelectorAll('.input-qtd');
            if (inputsQtd.length > 0) {
              inputsQtd[inputsQtd.length - 1].focus();
              inputsQtd[inputsQtd.length - 1].select();
            }
          }, 50);
        });
        listaProdutosUI.appendChild(div);
      });
      listaProdutosUI.style.display = 'block';
    } else {
      listaProdutosUI.style.display = 'none';
    }
  });

  // ==========================================
  // 6. CÁLCULO AUTOMÁTICO DOS TOTAIS
  // ==========================================
  const parseDinheiroParaFloat = (valorString) => {
    if (!valorString) return 0;
    return parseFloat(valorString.toString().replace(/\./g, '').replace(',', '.')) || 0;
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  function atualizarTotaisGlobais() {
    let somaItens = itensPedido.length;
    let somaQtdes = 0;
    let totalProdutos = 0;

    itensPedido.forEach((item) => {
      somaQtdes += item.qtd;
      totalProdutos += item.qtd * item.preco;
    });

    document.getElementById('tot-itens').value = somaItens;
    document.getElementById('tot-qtdes').value = somaQtdes;
    document.getElementById('tot-produtos').value = formatCurrency(totalProdutos);

    const desconto = parseDinheiroParaFloat(document.getElementById('desconto').value);
    const freteCliente = parseDinheiroParaFloat(document.getElementById('frete_cliente').value);
    const despesas = parseDinheiroParaFloat(document.getElementById('despesas').value);

    const totalVenda = totalProdutos - desconto + freteCliente + despesas;
    document.getElementById('tot-venda').value = formatCurrency(totalVenda > 0 ? totalVenda : 0);
  }

  document.querySelectorAll('.recalculo-trigger').forEach(input => {
    input.addEventListener('input', atualizarTotaisGlobais);
    input.addEventListener('blur', (e) => {
        let val = parseDinheiroParaFloat(e.target.value);
        e.target.value = formatCurrency(val);
        atualizarTotaisGlobais();
    });
  });

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
        <td><input type="text" value="${item.nome}" readonly style="border:none; background:transparent;"></td>
        <td><input type="text" value="${item.sku}" readonly style="border:none; background:transparent;"></td>
        <td><input type="number" class="input-qtd" data-id="${item.id}" value="${item.qtd}" min="1" style="width:60px;"></td>
        <td><input type="text" value="UN" readonly style="border:none; background:transparent; text-align:center;"></td>
        <td><input type="text" value="${formatCurrency(item.preco)}" readonly style="border:none; background:transparent;"></td>
        <td><input type="text" value="${formatCurrency(precoTotal)}" readonly style="border:none; background:transparent; font-weight:bold; color:#333;"></td>
        <td style="text-align: center; padding-top:8px;">
           <button class="btn-remover" data-id="${item.id}" style="background:none; border:none; cursor:pointer; font-size:16px;" title="Remover">❌</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.input-qtd').forEach((input) => {
      input.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const item = itensPedido.find((i) => i.id === id);
        if (item) item.qtd = parseInt(e.target.value) || 1;
        renderizarTabela();
      });
      input.addEventListener('keyup', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const item = itensPedido.find((i) => i.id === id);
        if (item) item.qtd = parseInt(e.target.value) || 1;
        atualizarTotaisGlobais();
        e.target.closest('tr').children[6].innerHTML = `<input type="text" value="${formatCurrency(item.qtd * item.preco)}" readonly style="border:none; background:transparent; font-weight:bold; color:#333;">`;
      });
    });

    document.querySelectorAll('.btn-remover').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.closest('.btn-remover').getAttribute('data-id'));
        itensPedido = itensPedido.filter((i) => i.id !== id);
        renderizarTabela();
      });
    });

    atualizarTotaisGlobais();
  }
  renderizarTabela();

  // ==========================================
  // 4. VALIDAÇÃO DE DOCUMENTOS (CPF/CNPJ)
  // ==========================================
  function validarDocumento(doc) {
    const texto = doc.replace(/\D/g, '');
    if (texto.length !== 11 && texto.length !== 14) return false;
    if (/^(\d)\1+$/.test(texto)) return false;
    return true; // Validação estrutural de tamanho ativa para flexibilidade de desenvolvimento
  }

  // ==========================================
  // SALVAMENTO COMPLETO NO BANCO
  // ==========================================
  const btnSalvar = document.querySelector('.btn-salvar');
  btnSalvar.addEventListener('click', async () => {
    if (itensPedido.length === 0) {
      alert('Adicione pelo menos um item ao pedido!');
      return;
    }

    const docDigitado = campoCPFCNPJ.value;
    if (docDigitado && !validarDocumento(docDigitado)) {
      alert('⚠️ O CPF ou CNPJ digitado possui tamanho inválido. Verifique o campo!');
      return;
    }

    try {
      btnSalvar.disabled = true;
      btnSalvar.innerText = 'Processando...';

      await processarBaixaEstoque(itensPedido);

      const pedidoDados = {
        numero_pedido: document.getElementById('numero_pedido').value,
        cliente_nome: document.getElementById('cliente_nome').value,
        vendedor: document.getElementById('vendedor').value,
        cliente_tipo_pessoa: document.getElementById('cliente_tipo_pessoa').value,
        cliente_cpf_cnpj: campoCPFCNPJ.value,
        cliente_ie: document.getElementById('cliente_ie').value,
        cliente_rg: document.getElementById('cliente_rg').value,
        cliente_cep: campoCEP.value,
        cliente_uf: document.getElementById('cliente_uf').value,
        cliente_cidade: document.getElementById('cliente_cidade').value,
        cliente_endereco: document.getElementById('cliente_endereco').value,
        cliente_numero: document.getElementById('cliente_numero').value,
        cliente_bairro: document.getElementById('cliente_bairro').value,
        cliente_complemento: document.getElementById('cliente_complemento').value,
        cliente_telefone: document.getElementById('cliente_telefone').value,
        cliente_celular: document.getElementById('cliente_celular').value,
        cliente_email: document.getElementById('cliente_email').value,
        itens_json: itensPedido,
        quantidade_itens: parseInt(document.getElementById('tot-itens').value) || 0,
        soma_quantidades: parseInt(document.getElementById('tot-qtdes').value) || 0,
        peso_bruto: parseFloat(document.getElementById('peso_bruto').value) || 0,
        peso_liquido: parseFloat(document.getElementById('peso_liquido').value) || 0,
        total_produtos: parseDinheiroParaFloat(document.getElementById('tot-produtos').value),
        total_venda: parseDinheiroParaFloat(document.getElementById('tot-venda').value),
        data_venda: document.getElementById('data_venda').value || null,
        data_prevista_entrega: document.getElementById('data_prevista_entrega').value || null,
        desconto: parseDinheiroParaFloat(document.getElementById('desconto').value),
        frete_cliente: parseDinheiroParaFloat(document.getElementById('frete_cliente').value),
        frete_empresa: parseDinheiroParaFloat(document.getElementById('frete_empresa').value),
        despesas: parseDinheiroParaFloat(document.getElementById('despesas').value),
        forma_recebimento: document.getElementById('forma_recebimento').value,
        observacoes: document.getElementById('observacoes').value,
        observacoes_internas: document.getElementById('observacoes_internas').value,
        status_pedido: 'Aberto',
      };

      const { error: erroPedido } = await supabase.from('pedidos').insert([pedidoDados]);
      if (erroPedido) throw erroPedido;

      alert('✅ Pedido salvo com sucesso e estoque atualizado!');
      itensPedido = [];
      renderizarTabela();
      document.querySelector('[data-tela="estoque"]').click();
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao processar pedido: ' + err.message);
    } finally {
      btnSalvar.innerText = 'Salvar Pedido';
      btnSalvar.disabled = false;
    }
  });
}