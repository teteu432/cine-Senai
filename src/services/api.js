// =====================================================================
// ARQUIVO: src/services/api.js
// =====================================================================

/*
  Este arquivo é o "carteiro" da aplicação.

  Em vez de cada página fazer sua própria chamada HTTP
  de um jeito diferente, centralizamos tudo aqui.

  Vantagem: se o back-end mudar um endpoint,
  só precisamos alterar neste arquivo.
*/


// =====================================================================
// URL BASE
// =====================================================================

/*
  BASE_URL é o endereço inicial de todos os endpoints.

  Está vazio porque o Vite está configurado como intermediário:
  toda requisição que começa com /api é automaticamente
  encaminhada para http://localhost:8080.

  Essa configuração fica em vite.config.js.

  Na semana da integração, só precisamos trocar a URL
  dentro do vite.config.js — este arquivo não muda.
*/
const BASE_URL = '';


// =====================================================================
// FUNÇÃO AUXILIAR: getAuthHeaders
// =====================================================================

/*
  Esta função verifica se o usuário está logado
  e, se estiver, retorna o cabeçalho de autenticação.

  Após o login, salvamos o token JWT no localStorage.
  Em toda requisição que exige autenticação,
  precisamos enviar esse token no cabeçalho.

  O formato padrão é:
  Authorization: Bearer <token>

  O back-end lê esse cabeçalho e sabe quem está fazendo a requisição.
  É como apresentar um crachá de identificação.
*/
const getAuthHeaders = () => {

  /*
    localStorage.getItem('token') busca o token salvo.

    Se o usuário não estiver logado, retorna null.
  */
  const token = localStorage.getItem('token');

  /*
    Operador ternário:

    Se token existir:
      retorna o objeto com o cabeçalho Authorization

    Se token não existir (usuário não logado):
      retorna objeto vazio — sem autenticação
  */
  return token
    ? { 'Authorization': `Bearer ${token}` }
    : {};
};


// =====================================================================
// FUNÇÃO PRINCIPAL: request
// =====================================================================

/*
  Esta é a única função que realmente faz a chamada HTTP.

  Todas as funções abaixo (auth.login, filmes.listar, etc.)
  chamam esta função internamente.

  Parâmetros:
    url     → endereço do endpoint  ex: '/api/filmes'
    options → configurações extras  ex: método, body
*/
const request = async (url, options = {}) => {


  // ===================================================================
  // MONTAGEM DOS CABEÇALHOS
  // ===================================================================

  /*
    Todo pedido HTTP precisa de cabeçalhos (headers).
    São metadados que informam ao servidor como interpretar a requisição.

    Aqui montamos três informações:

    1. Content-Type: application/json
       Avisa ao servidor que estamos enviando dados em formato JSON.

       Exceção: quando o body é um FormData (upload de arquivo),
       NÃO definimos Content-Type. O navegador define sozinho,
       incluindo o "boundary" que o multipart/form-data exige.

    2. ...getAuthHeaders()
       Adiciona o cabeçalho Authorization se o usuário estiver logado.
       O ... (spread) "espalha" as propriedades do objeto retornado.

    3. ...options.headers
       Permite sobrescrever os cabeçalhos acima se necessário.
  */
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...getAuthHeaders(),
    ...options.headers,
  };


  // ===================================================================
  // EXECUÇÃO DA REQUISIÇÃO
  // ===================================================================

  /*
    fetch() é a função nativa do navegador para fazer requisições HTTP.

    await significa: "espere a resposta antes de continuar".

    Sem await, o código continuaria executando antes
    de receber a resposta do servidor.
  */
  const response = await fetch(url, {
    ...options,
    headers,
  });


  // ===================================================================
  // TRATAMENTO DA RESPOSTA
  // ===================================================================

  /*
    Status 401 = não autorizado (token inválido ou ausente).
    Status 403 = proibido (usuário não tem permissão).

    Nesses casos, o token pode ter expirado.
    A solução é limpar o localStorage e forçar um novo login.

    window.dispatchEvent dispara um evento personalizado
    que o AuthContext escuta para atualizar o estado do usuário.
  */
  if (response.status === 401 || response.status === 403) {

    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-change'));
    }
  }


  /*
    response.ok é true quando o status está entre 200 e 299.
    Qualquer outro status (4xx, 5xx) indica um problema.

    Nesse caso, tentamos ler a mensagem de erro que o servidor enviou
    e lançamos um Error para que quem chamou possa tratar.

    .catch(() => ({})) garante que, se o corpo não for JSON,
    não quebramos — apenas usamos um objeto vazio.
  */
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    /*
      O backend devolve a mensagem de erro no campo "mensagem" (em
      português), não "message". Verificamos os dois para não depender
      de uma única convenção.
    */
    throw new Error(
      errorData.mensagem || errorData.message || `Erro na requisição (Status: ${response.status})`
    );
  }


  /*
    Se chegou até aqui, a requisição foi bem-sucedida.

    Operações como DELETE costumam devolver um corpo vazio — às vezes com
    status 204 (sem conteúdo), às vezes com status 200 mas sem nada escrito
    no corpo. response.json() quebra nos dois casos se não houver texto
    nenhum para interpretar como JSON.

    Por isso lemos a resposta como texto primeiro (response.text()) e só
    convertemos para JSON (JSON.parse) se realmente houver conteúdo.
    Corpo vazio vira null — sem erro.
  */
  const texto = await response.text();
  return texto ? JSON.parse(texto) : null;
};


// =====================================================================
// OBJETO PRINCIPAL: api
// =====================================================================

/*
  Exportamos um objeto com todos os endpoints organizados por assunto.

  Cada propriedade é um grupo:
    api.auth      → autenticação (login, cadastro)
    api.filmes    → operações com filmes
    api.salas     → operações com salas
    api.sessoes   → operações com sessões
    api.reservas  → operações com reservas
    api.avaliacoes → avaliações de filmes
    api.admin     → operações administrativas

  Para chamar um endpoint:
    api.filmes.listar()
    api.auth.login(email, senha)
    api.avaliacoes.criar(filmeId, { nota, comentario })
*/
export const api = {


  // ===================================================================
  // AUTENTICAÇÃO
  // ===================================================================

  auth: {

    /*
      Login do usuário.

      Envia email e senha para o servidor.
      Se correto, o servidor devolve um token JWT,
      o nome e o cargo do usuário.

      Método: POST  (estamos enviando dados)
      URL: /api/auth/login
      Body: { email, senha }
    */
    login: (email, senha) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
        /*
          JSON.stringify converte o objeto JavaScript
          { email, senha }
          para o texto JSON:
          '{"email":"joao@email.com","senha":"123456"}'
        */
      }),


    /*
      Cadastro de novo usuário.

      Método: POST
      URL: /api/auth/cadastro
      Body: { nome, email, senha }
    */
    cadastro: (nome, email, senha) =>
      request('/api/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      }),
  },


  // ===================================================================
  // FILMES
  // ===================================================================

  filmes: {

    /*
      Lista todos os filmes disponíveis.

      Método: GET  (buscando dados — sem body)
      URL: /api/filmes
      Retorna: array de filmes
        [ { id, titulo, genero, duracaoMinutos, urlPoster, descricao } ]
    */
    listar: () => request('/api/filmes'),


    /*
      Busca um único filme pelo ID.

      Método: GET
      URL: /api/filmes/3  (se id = 3)
      Retorna: { id, titulo, genero, duracaoMinutos, urlPoster, descricao }
    */
    buscarPorId: (id) => request(`/api/filmes/${id}`),
    /*
      As crases `` permitem inserir variáveis dentro da string.
      ${id} será substituído pelo valor do parâmetro id.
      Exemplo: id = 5  →  '/api/filmes/5'
    */


    /*
      Cria um novo filme (somente admin).

      Método: POST
      URL: /api/filmes
      Body: objeto com os dados do filme
    */
    criar: (filme) => request('/api/filmes', {
      method: 'POST',
      body: JSON.stringify(filme),
    }),


    /*
      Atualiza os dados de um filme (somente admin).

      Método: PUT  (substitui o registro inteiro)
      URL: /api/filmes/3
      Body: objeto com os dados atualizados
    */
    atualizar: (id, filme) => request(`/api/filmes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(filme),
    }),


    /*
      Remove um filme (somente admin).

      Método: DELETE
      URL: /api/filmes/3
      Sem body — o ID na URL já identifica qual remover
    */
    deletar: (id) => request(`/api/filmes/${id}`, {
      method: 'DELETE',
    }),


    /*
      Envia (ou substitui) o pôster de um filme (somente admin).

      O back-end guarda a imagem no S3 e devolve o filme atualizado,
      já com a nova urlPoster.

      Diferente dos outros endpoints, aqui o corpo NÃO é JSON.
      É FormData (multipart/form-data) — formato usado para enviar
      arquivos binários, como imagens. A função request() detecta
      isso e ajusta os cabeçalhos automaticamente.

      Método: POST
      URL: /api/filmes/3/imagem
      Body: FormData com o campo "imagem" (arquivo)
    */
    uploadImagem: (id, arquivo) => {
      const formData = new FormData();
      formData.append('imagem', arquivo);
      return request(`/api/filmes/${id}/imagem`, {
        method: 'POST',
        body: formData,
      });
    },


    /*
      Remove o pôster de um filme (somente admin).

      Método: DELETE
      URL: /api/filmes/3/imagem
    */
    removerImagem: (id) => request(`/api/filmes/${id}/imagem`, {
      method: 'DELETE',
    }),
  },


  // ===================================================================
  // SALAS
  // ===================================================================

  salas: {

    /*
      Lista todas as salas de cinema.

      Método: GET
      URL: /api/salas
    */
    listar: () => request('/api/salas'),


    /*
      Busca uma sala pelo ID.

      Método: GET
      URL: /api/salas/2
    */
    buscarPorId: (id) => request(`/api/salas/${id}`),


    /*
      Cria uma nova sala (somente admin).

      Método: POST
      URL: /api/salas
    */
    criar: (sala) => request('/api/salas', {
      method: 'POST',
      body: JSON.stringify(sala),
    }),


    /*
      Remove uma sala (somente admin).

      Método: DELETE
      URL: /api/salas/2
    */
    deletar: (id) => request(`/api/salas/${id}`, {
      method: 'DELETE',
    }),
  },


  // ===================================================================
  // SESSÕES
  // ===================================================================

  sessoes: {

    /*
      Lista sessões de uma data específica.

      O parâmetro ?data= é uma query string.
      Ela vai junto na URL, não no body.

      Método: GET
      URL: /api/sessoes?data=2026-06-11
    */
    listarPorData: (data) => request(`/api/sessoes?data=${data}`),


    /*
      Lista sessões de um filme específico.

      Método: GET
      URL: /api/sessoes?filmeId=3
    */
    listarPorFilme: (filmeId) => request(`/api/sessoes?filmeId=${filmeId}`),


    /*
      Busca uma sessão pelo ID.

      Método: GET
      URL: /api/sessoes/7
    */
    buscarPorId: (id) => request(`/api/sessoes/${id}`),


    /*
      Lista os assentos de uma sessão.

      Cada assento tem: { id, numero, ocupado }
      ocupado = true significa que já foi reservado por alguém.

      Método: GET
      URL: /api/sessoes/7/assentos
    */
    listarAssentos: (id) => request(`/api/sessoes/${id}/assentos`),


    /*
      Cria uma nova sessão (somente admin).

      Método: POST
      URL: /api/sessoes
    */
    criar: (sessao) => request('/api/sessoes', {
      method: 'POST',
      body: JSON.stringify(sessao),
    }),


    /*
      Remove uma sessão (somente admin).

      Método: DELETE
      URL: /api/sessoes/7
    */
    deletar: (id) => request(`/api/sessoes/${id}`, {
      method: 'DELETE',
    }),
  },


  // ===================================================================
  // RESERVAS
  // ===================================================================

  /*
    Todos os endpoints de reserva exigem autenticação.
    O cabeçalho Authorization é adicionado automaticamente
    pela função getAuthHeaders() dentro de request().
  */

  reservas: {

    /*
      Cria uma nova reserva para o usuário logado.

      sessaoId   → ID da sessão escolhida
      assentoIds → array com os IDs dos assentos selecionados
                   ex: [12, 13, 14]

      Método: POST
      URL: /api/reservas
      Body: { sessaoId, assentoIds }
    */
    criar: (sessaoId, assentoIds) => request('/api/reservas', {
      method: 'POST',
      body: JSON.stringify({ sessaoId, assentoIds }),
    }),


    /*
      Lista as reservas do usuário logado.

      O back-end identifica o usuário pelo token JWT.
      Por isso não precisamos passar nenhum ID.

      Método: GET
      URL: /api/reservas/minhas
    */
    listarMinhas: () => request('/api/reservas/minhas'),


    /*
      Cancela uma reserva pelo ID.

      Método: DELETE
      URL: /api/reservas/9
    */
    cancelar: (id) => request(`/api/reservas/${id}`, {
      method: 'DELETE',
    }),
  },


  // ===================================================================
  // AVALIAÇÕES
  // ===================================================================

  /*
    Avaliações são vinculadas a um filme específico.
    Por isso os endpoints usam /api/filmes/{filmeId}/avaliacoes.

    O POST exige autenticação (usuário precisa estar logado).
    O GET é público (qualquer um pode ver as avaliações).
  */

  avaliacoes: {

    /*
      Lista todas as avaliações de um filme.

      Método: GET
      URL: /api/filmes/3/avaliacoes
      Retorna: [ { id, nota, comentario, usuarioNome, criadoEm } ]
    */
    listar: (filmeId) => request(`/api/filmes/${filmeId}/avaliacoes`),


    /*
      Cria uma nova avaliação para um filme.

      filmeId   → ID do filme sendo avaliado
      avaliacao → objeto com { nota, comentario }
                  nota deve ser um número de 1 a 5

      Método: POST
      URL: /api/filmes/3/avaliacoes
      Body: { nota: 4, comentario: "Ótimo filme!" }
      Retorna: { id, nota, comentario, usuarioNome, criadoEm }
    */
    criar: (filmeId, avaliacao) =>
      request(`/api/filmes/${filmeId}/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify(avaliacao),
      }),
  },


  // ===================================================================
  // ADMIN
  // ===================================================================

  /*
    Endpoints exclusivos para usuários com cargo ADMIN.
    O back-end verifica o cargo no token JWT.
    Se o usuário não for admin, o back-end responde com 403.
  */

  admin: {

    /*
      Lista todas as reservas de todos os usuários.

      Método: GET
      URL: /api/admin/reservas
    */
    listarReservas: () => request('/api/admin/reservas'),


    /*
      Gera relatório geral do sistema.

      Método: GET
      URL: /api/admin/relatorios
    */
    gerarRelatorio: () => request('/api/admin/relatorios'),


    /*
      Promove um usuário comum para ADMIN.

      Método: PATCH  (atualiza apenas um campo — o cargo)
      URL: /api/admin/usuarios/5/promover
    */
    promoverUsuario: (id) => request(`/api/admin/usuarios/${id}/promover`, {
      method: 'PATCH',
    }),
  },
};
