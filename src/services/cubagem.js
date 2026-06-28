import { createClient } from '@supabase/supabase-js';

// 1. CREDENCIAIS DO SEU PROJETO
const SUPABASE_URL = 'https://eagergsdttranysiiwex.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ovhw9dMSxHTt873aUBGUnA_qrezo4tK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. MOTOR MATEMÁTICO DE CUBAGEM
export function calcularVolumeM3(espessura, largura, comprimento, quantidade) {
  return (espessura * largura * comprimento * quantidade) / 1000000;
}

// 3. FUNÇÃO QUE BUSCA O ESTOQUE ATUALIZADO DO BANCO
export async function obterEstoqueDoPatio() {
  const { data: produtos, error } = await supabase
    .from('produtos')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('❌ Erro no motor ao buscar estoque:', error.message);
    throw error;
  }
  return produtos;
}

// 4. NOVA FUNÇÃO PARA SALVAR A MADEIRA COM OS NOVOS CAMPOS
export async function cadastrarNovaMadeira(dadosMadeira) {
  const { data, error } = await supabase
    .from('produtos')
    .upsert([dadosMadeira]);

  if (error) {
    console.error('❌ Erro ao cadastrar no banco:', error.message);
    throw error;
  }
  return data;
}

// src/services/cubagem.js (adicione esta exportação)

export async function processarBaixaEstoque(itens) {
  for (const item of itens) {
    // .trim() remove espaços acidentais antes ou depois do SKU
    const skuFormatado = item.sku.trim();

    const { data: produto, error: fetchError } = await supabase
      .from('produtos')
      .select('id, estoque_pecas')
      .eq('sku', skuFormatado) // Busca usando o SKU limpo
      .single();

    if (fetchError || !produto) {
      console.error('Erro ao buscar SKU:', skuFormatado);
      throw new Error(
        `Produto ${item.sku} não encontrado na tabela de produtos.`
      );
    }

    const novoEstoque = produto.estoque_pecas - item.qtd;
    if (novoEstoque < 0)
      throw new Error(`Estoque insuficiente para ${item.sku}.`);

    const { error: updateError } = await supabase
      .from('produtos')
      .update({ estoque_pecas: novoEstoque })
      .eq('id', produto.id);

    if (updateError) throw updateError;
  }
}
