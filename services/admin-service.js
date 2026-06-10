// ============================================
// SERVIÇO ADMIN - Supabase Integration
// ============================================

class AdminService {

  // FORNECEDORES
  static async registrarFornecedor(nome, insumo, contato) {
    try {
      const { data, error } = await supabaseClient
        .from('fornecedores_master_table')
        .insert([{ nome, insumo, contato }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao registrar fornecedor:', error);
      return null;
    }
  }

  static async obterFornecedores() {
    try {
      const { data, error } = await supabaseClient
        .from('fornecedores_master_table')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao obter fornecedores:', error);
      return [];
    }
  }

  // COMPRAS
  static async registrarCompra(item, valor, fornecedorId = null) {
    try {
      const { data, error } = await supabaseClient
        .from('compras_records_table')
        .insert([{
          item,
          valor,
          fornecedor_id: fornecedorId
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao registrar compra:', error);
      return null;
    }
  }

  static async obterCompras() {
    try {
      const { data, error } = await supabaseClient
        .from('compras_records_table')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao obter compras:', error);
      return [];
    }
  }

  static async calcularTotalCompras() {
    try {
      const { data, error } = await supabaseClient
        .from('compras_records_table')
        .select('valor');
      
      if (error) throw error;
      
      const total = data.reduce((sum, compra) => sum + (compra.valor || 0), 0);
      return total;
    } catch (error) {
      console.error('Erro ao calcular total compras:', error);
      return 0;
    }
  }

  // RELATÓRIOS
  static async gerarRelatorioVendas(filtro = 'tudo') {
    try {
      let query = supabaseClient
        .from('pedidos_de_vendas')
        .select('*');

      if (filtro === 'hoje') {
        const hoje = new Date().toISOString().split('T')[0];
        query = query
          .gte('created_at', `${hoje}T00:00:00`)
          .lte('created_at', `${hoje}T23:59:59`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return [];
    }
  }

  // ANÁLISE IA
  static async analisarDadosVendas() {
    try {
      const vendas = await VendasService.obterTodasVendas();
      const faturamento = await VendasService.calcularFaturamentoTotal();
      const ticketMedio = await VendasService.obterTicketMedio();

      let recomendacao = '';
      if (faturamento === 0) {
        recomendacao = '🤖 IA: Aguardando dados de vendas reais para traçar uma estratégia.';
      } else if (faturamento > 0 && faturamento < 150) {
        recomendacao = '🤖 Insight IA: Movimento inicial detectado. Sugiro criar um cupom de 15% OFF em Combos Festivos para alavancar o ticket médio.';
      } else {
        recomendacao = '🤖 Insight IA: Excelente faturamento! Recomendo disparar promoção casada: compre 1 Cento de Salgados e ganhe 1 Suco de Laranja.';
      }

      return {
        faturamento,
        ticketMedio,
        totalPedidos: vendas.length,
        recomendacao
      };
    } catch (error) {
      console.error('Erro na análise IA:', error);
      return null;
    }
  }

  // ALERTAS AUTOMÁTICOS
  static async verificarAlertas() {
    try {
      const produtos = await ProdutosService.carregarTodosProdutos();
      const alertas = [];

      produtos.forEach(p => {
        if (p.estoque <= 0) {
          alertas.push({
            tipo: 'CRÍTICO',
            mensagem: `${p.titulo} ESGOTADO!`
          });
        } else if (p.estoque <= 5) {
          alertas.push({
            tipo: 'BAIXO',
            mensagem: `${p.titulo} (${p.estoque} un) - estoque baixo`
          });
        }
      });

      return alertas;
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
      return [];
    }
  }

  // DASHBOARD MÉTRICAS
  static async obterMetricasDashboard() {
    try {
      const faturamento = await VendasService.calcularFaturamentoTotal();
      const ticketMedio = await VendasService.obterTicketMedio();
      const totalCompras = await this.calcularTotalCompras();
      const vendas = await VendasService.obterTodasVendas();
      const alertas = await this.verificarAlertas();

      return {
        faturamento,
        ticketMedio,
        totalCompras,
        totalPedidos: vendas.length,
        alertas,
        lucroLiquido: faturamento - totalCompras
      };
    } catch (error) {
      console.error('Erro ao obter métricas:', error);
      return null;
    }
  }
}
