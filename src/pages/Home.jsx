// =====================================================================
// IMPORTAÇÕES
// =====================================================================

// React é a biblioteca principal utilizada para criar interfaces.
// useState -> cria estados.
// useEffect -> executa ações quando o componente é carregado.
import React, { useState, useEffect } from 'react';

// Componente do React Router utilizado para navegação entre páginas
// sem recarregar o navegador.
import { Link } from 'react-router-dom';

// Serviço responsável pelas chamadas à API.
import { api } from '../services/api';

// Hook personalizado responsável por exibir mensagens ao usuário.
import { useToast } from '../context/ToastContext';

// Arquivo de estilos da página Home.
import './Home.css';


// =====================================================================
// OBJETO DE CONVERSÃO DOS GÊNEROS
// =====================================================================

/*
  Os gêneros normalmente vêm da API em formato padronizado.

  Exemplo:
  ACAO
  COMEDIA
  DRAMA

  Este objeto converte esses valores para textos
  mais amigáveis para o usuário.
*/
const GENERO_LABELS = {
  ACAO: 'Ação',
  COMEDIA: 'Comédia',
  DRAMA: 'Drama',
  TERROR: 'Terror',
  ROMANCE: 'Romance',
  FICCAO_CIENTIFICA: 'Ficção Científica',
  ANIMACAO: 'Animação',
  DOCUMENTARIO: 'Documentário',
  SUSPENSE: 'Suspense',
  DORAMA: 'Dorama',
  ESPORTE: 'Esporte',
  CULT: 'Cult',
  AVENTURA: 'Aventura',
  MUSICAL: 'Musical'
};


// =====================================================================
// COMPONENTE HOME
// =====================================================================

export const Home = () => {

  // ===================================================================
  // ESTADOS
  // ===================================================================

  /*
    Armazena a lista de filmes retornada pela API.

    Inicialmente é um array vazio.
  */
  const [filmes, setFilmes] = useState([]);

  /*
    Controla o estado de carregamento da página.

    true  -> carregando
    false -> carregamento finalizado
  */
  const [loading, setLoading] = useState(true);

  /*
    Armazena o texto digitado na caixa de pesquisa.
  */
  const [search, setSearch] = useState('');

  /*
    Armazena o gênero selecionado no filtro.
  */
  const [selectedGenre, setSelectedGenre] = useState('');

  /*
    Índice do filme em destaque
    que está sendo exibido no banner.
  */
  const [activeIndex, setActiveIndex] = useState(0);



  // ===================================================================
  // CONTEXT
  // ===================================================================

  /*
    Obtém a função responsável por exibir
    mensagens de sucesso ou erro.
  */
  const { showToast } = useToast();



  // ===================================================================
  // USE EFFECT
  // ===================================================================

  /*
    Executa apenas uma vez quando o componente
    é carregado na tela.

    Equivale ao "onLoad" da página.
  */
  useEffect(() => {
    carregarFilmes();
  }, []);



  // ===================================================================
  // CARROSSEL DO BANNER (troca automática a cada 6 segundos)
  // ===================================================================

  useEffect(() => {

    /*
      Apenas 5 primeiros filmes participam
      do carrossel do banner.
    */
    const totalDestaques = Math.min(filmes.length, 5);

    /*
      Se houver 1 filme ou nenhum,
      não há necessidade de trocar.
    */
    if (totalDestaques <= 1) {
      return;
    }

    const intervalo = setInterval(() => {
      setActiveIndex((indiceAtual) =>
        (indiceAtual + 1) % totalDestaques
      );
    }, 6000);

    /*
      Limpa o intervalo quando o componente
      é desmontado ou a lista de filmes muda.
    */
    return () => clearInterval(intervalo);
  }, [filmes]);



  // ===================================================================
  // FUNÇÃO RESPONSÁVEL POR BUSCAR OS FILMES
  // ===================================================================

  const carregarFilmes = async () => {

    // Ativa o loading
    setLoading(true);

    try {

      /*
        Faz uma requisição para a API
        buscando todos os filmes.
      */
      const data = await api.filmes.listar();

      /*
        Atualiza o estado filmes.

        Quando um estado muda,
        o React renderiza a tela novamente.
      */
      setFilmes(data || []);

    } catch (err) {

      /*
        Caso ocorra algum erro durante
        a comunicação com a API.
      */
      showToast(
        'Erro ao carregar catálogo de filmes.',
        'error'
      );

    } finally {

      /*
        O finally sempre executa,
        independente de sucesso ou erro.

        Aqui desligamos o loading.
      */
      setLoading(false);
    }
  };



  // ===================================================================
  // FILTRO DOS FILMES
  // ===================================================================

  /*
    filter() percorre todos os filmes
    e retorna apenas aqueles que atendem
    às condições definidas.
  */
  const filteredFilmes = filmes.filter((filme) => {

    /*
      Verifica se o texto pesquisado existe
      no título ou na descrição do filme.

      toLowerCase() é utilizado para evitar
      diferença entre letras maiúsculas e minúsculas.
    */
    const matchesSearch =
      filme.titulo
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      (
        filme.descricao &&
        filme.descricao
          .toLowerCase()
          .includes(search.toLowerCase())
      );

    /*
      Verifica se o gênero corresponde ao filtro.

      Se nenhum gênero estiver selecionado,
      todos os filmes serão exibidos.
    */
    const matchesGenre =
      selectedGenre === ''
      ||
      filme.genero === selectedGenre;

    /*
      O filme será exibido apenas se
      atender os dois critérios.
    */
    return matchesSearch && matchesGenre;
  });



  // ===================================================================
  // FILME EM DESTAQUE
  // ===================================================================

  /*
    Pega os 5 primeiros filmes da lista
    para participar do carrossel do banner.
  */
  const featuredMovies = filmes.slice(0, 5);

  /*
    Filme atualmente exibido no banner,
    de acordo com o activeIndex.
  */
  const featuredMovie = featuredMovies[activeIndex];



  // ===================================================================
  // JSX
  // ===================================================================

  return (

    <div className="container">

      {/* ============================================================
          BANNER PRINCIPAL
      ============================================================ */}

      {
        !loading &&
        featuredMovie && (

          <div
            className="featured-banner"

            /*
              A key muda junto com o filme exibido,
              forçando o React a recriar o elemento
              e disparar a animação de transição.
            */
            key={featuredMovie.id}

            /*
              Define a imagem de fundo do banner.

              Se houver pôster, utiliza a imagem.
              Caso contrário, não aplica fundo.
            */
            style={{
              backgroundImage:
                featuredMovie.urlPoster
                  ? `url(${featuredMovie.urlPoster})`
                  : 'none',
            }}
          >

            <div className="featured-content">

              {/* Etiqueta de destaque */}
              <span className="badge badge-primary featured-badge">
                Em Destaque
              </span>

              {/* Título do filme */}
              <h1 className="featured-title">
                {featuredMovie.titulo}
              </h1>

              {/* Descrição resumida */}
              <p className="featured-desc">

                {
                  featuredMovie.descricao

                    ? (
                      featuredMovie.descricao.substring(0, 180)
                      + '...'
                    )

                    : 'Sem descrição disponível.'
                }

              </p>

              <div className="featured-actions">

                {/* Duração */}
                <span className="featured-meta">
                  <strong>Duração:</strong>
                  {' '}
                  {featuredMovie.duracaoMinutos} min
                </span>

                {/* Gênero */}
                <span className="badge badge-success">
                  {
                    GENERO_LABELS[
                      featuredMovie.genero
                    ] || featuredMovie.genero
                  }
                </span>

                {/* Link para sessões deste filme */}
                <Link
                  to={`/sessoes?filmeId=${featuredMovie.id}`}
                  className="btn btn-primary featured-cta"
                >
                  Ver Sessões
                </Link>

              </div>

            </div>



            {/* ========================================================
                DOTS DE NAVEGAÇÃO DO CARROSSEL
            ======================================================== */}

            {
              featuredMovies.length > 1 && (

                <div className="featured-dots">

                  {
                    featuredMovies.map((filme, index) => (

                      <button
                        key={filme.id}
                        type="button"

                        className={
                          'featured-dot'
                          + (index === activeIndex ? ' featured-dot--active' : '')
                        }

                        aria-label={`Mostrar destaque ${filme.titulo}`}

                        /*
                          Permite que o usuário troque
                          o destaque manualmente.
                        */
                        onClick={() => setActiveIndex(index)}
                      />

                    ))
                  }

                </div>
              )
            }

          </div>
        )
      }



      {/* ============================================================
          CABEÇALHO DO CATÁLOGO
      ============================================================ */}

      <div className="page-header catalog-header">

        <h2 className="catalog-title">
          Nosso Catálogo
        </h2>



        {/* ========================================================
            FILTROS
        ======================================================== */}

        <div className="catalog-filters">

          {/* Campo de pesquisa */}
          <div className="filter-search">

            <input
              type="text"
              className="form-control"

              placeholder="Pesquisar filmes por título ou descrição..."

              value={search}

              /*
                Atualiza o estado sempre
                que o usuário digita.
              */
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>



          {/* Filtro por gênero */}
          <div className="filter-genre">

            <select
              className="form-control"

              value={selectedGenre}

              /*
                Atualiza o gênero selecionado.
              */
              onChange={(e) =>
                setSelectedGenre(e.target.value)
              }
            >

              <option value="">
                Todos os Gêneros
              </option>

              {
                /*
                  Object.entries transforma o objeto
                  em uma lista para podermos percorrê-lo.
                */
                Object.entries(GENERO_LABELS)
                  .map(([value, label]) => (

                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>

                  ))
              }

            </select>

          </div>

        </div>

      </div>



      {/* ============================================================
          RENDERIZAÇÃO CONDICIONAL
      ============================================================ */}

      {
        loading ? (

          // Tela de carregamento

          <div className="home-loading">
            Carregando filmes...
          </div>

        ) : filteredFilmes.length > 0 ? (

          // Lista de filmes

          <div className="movie-grid">

            {
              /*
                map() percorre todos os filmes
                criando um card para cada item.
              */
              filteredFilmes.map((filme) => (

                <div
                  key={filme.id}
                  className="movie-card glass glass-hover"
                >

                  {/* Área do pôster */}
                  <div className="movie-poster-wrapper">

                    {
                      filme.urlPoster ? (

                        <img
                          src={filme.urlPoster}

                          alt={`Pôster do filme ${filme.titulo}`}

                          className="movie-poster"

                          /*
                            Caso a imagem não carregue,
                            esconde a imagem e mostra
                            o fallback.
                          */
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />

                      ) : null
                    }



                    {/* Imagem alternativa */}
                    <div
                      className="movie-poster-fallback"

                      style={{
                        display:
                          filme.urlPoster
                            ? 'none'
                            : 'flex'
                      }}
                    >

                      <svg
                        width="40"
                        height="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 3.75v16.5h16.5V3.75H3.75zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                        />
                      </svg>

                      <span>
                        {filme.titulo}
                      </span>

                    </div>

                  </div>



                  {/* Informações do filme */}
                  <div className="movie-info">

                    <h3 className="movie-title">
                      {filme.titulo}
                    </h3>

                    <span className="badge badge-primary movie-badge">
                      {
                        GENERO_LABELS[filme.genero]
                        || filme.genero
                      }
                    </span>

                    <p className="movie-description">
                      {
                        filme.descricao
                        || 'Sem descrição.'
                      }
                    </p>

                    <div className="movie-meta movie-meta--bottom">

                      <span>
                        {filme.duracaoMinutos} min
                      </span>

                      {/* Link para página de detalhes */}
                      <Link
                        to={`/filmes/${filme.id}`}
                        className="movie-details-link"
                      >
                        Ver detalhes &gt;
                      </Link>

                    </div>

                  </div>

                </div>

              ))
            }

          </div>

        ) : (

          // Estado vazio (nenhum filme encontrado)

          <div className="glass home-empty">

            <svg
              className="home-empty-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>

            <h3 className="home-empty-title">
              Nenhum filme encontrado
            </h3>

            <p className="home-empty-text">
              Tente alterar os termos da busca
              ou selecionar outro gênero.
            </p>

          </div>

        )
      }

    </div>
  );
};

// Exportação padrão do componente
export default Home;