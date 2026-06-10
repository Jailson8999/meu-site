// ============================================
// CONFIGURAÇÃO SUPABASE - Casa das Coxinhas
// ============================================
// 🔐 CREDENCIAIS AUTENTICADAS DO SUPABASE

const SUPABASE_URL = 'https://nhwrnhooneftzkvyrgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5od3JuaG9vbmVmdHprenZ5cmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDIxNzcsImV4cCI6MjA5NjY3ODE3N30.w7obC9OSPBmLAOREkAqemly3uEfeGMHXmF8bpDznfZY';

// Importar e criar cliente Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase Client inicializado com sucesso!');
console.log('🔗 URL:', SUPABASE_URL);
console.log('🔐 Autenticação ativa');

// Função para testar conexão
async function testarConexaoSupabase() {
  try {
    const { data, error } = await supabaseClient
      .from('tabela_de_produtos')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Conexão com Supabase estabelecida!');
    console.log('📦 Produtos carregados:', data.length);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão Supabase:', error.message);
    return false;
  }
}

// Verificar conexão ao iniciar
window.addEventListener('load', async () => {
  const conexaoOK = await testarConexaoSupabase();
  if(conexaoOK) {
    console.log('🚀 Sistema pronto para operação');
  } else {
    console.warn('⚠️ Verifique suas credenciais do Supabase');
  }
});
