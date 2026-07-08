import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './DetalheFilme.css';

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
  DORAMA: 'Dorama (Série)',
  ESPORTE: 'Esporte',
  CULT: 'Cult',
  AVENTURA: 'Aventura',
  MUSICAL: 'Musical',
};

// ============================================================
// Componente: StarRating
// Recebe: value (número de 0 a 5), onChange (função), readonly
// ============================================================
function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn${readonly ? ' star-btn--readonly' : ''}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            color: star <= (hovered || value) ? '#f59e0b' : 'rgba(255,255,255,0.15)',
            transform: !readonly && star <= hovered ? 'scale(1.2)' : 'scale(1)',
          }}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Componente: ReviewCard
// Exibe uma avaliação individual
// ============================================================
function ReviewCard({ review }) {
  const initials = review.usuarioNome
    ? review.usuarioNome
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '??';

  const dataFormatada = review.criadoEm
    ? new Date(review.criadoEm).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="review-card glass">
      <div className="review-card-header">
        {/* Avatar com iniciais */}
        <div className="review-card-avatar">
          {initials}
        </div>

        {/* Nome e data */}
        <div className="review-card-meta">
          <div className="review-card-name">
            {review.usuarioNome || 'Usuário'}
          </div>
          {dataFormatada && (
            <div className="review-card-date">{dataFormatada}</div>
          )}
        </div>

        {/* Estrelas da avaliação */}
        <StarRating value={review.nota} readonly />
      </div>

      {/* Comentário */}
      {review.comentario && (
        <p className="review-card-comment">
          {review.comentario}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Componente Principal: DetalheFilme
// ============================================================
export const DetalheFilme = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [filme, setFilme] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const filmeData = await api.filmes.buscarPorId(id);
      setFilme(filmeData);
    } catch {
      showToast('Conteúdo não encontrado.', 'error');
      navigate('/');
      return;
    }

    try {
      const avaliacoesData = await api.avaliacoes.listar(id);
      setAvaliacoes(Array.isArray(avaliacoesData) ? avaliacoesData : []);
    } catch {
      setAvaliacoes([]);
    }

    setLoading(false);
  };

  const mediaNotas =
    avaliacoes.length > 0
      ? (avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length).toFixed(1)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nota === 0) {
      showToast('Selecione uma nota de 1 a 5 estrelas.', 'error');
      return;
    }
    if (!comentario.trim()) {
      showToast('Escreva um comentário antes de enviar.', 'error');
      return;
    }

    setEnviando(true);
    try {
      await api.avaliacoes.criar(id, { nota, comentario: comentario.trim() });
      showToast('Avaliação publicada com sucesso!', 'success');
      setNota(0);
      setComentario('');
      carregarDados();
    } catch (err) {
      showToast(err.message || 'Erro ao enviar avaliação.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="container detalhe-loading">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!filme) return null;

  const labelNota = ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente!'][nota];

  return (
    <div className="container detalhe-container">
      {/* Voltar */}
      <Link to="/" className="detalhe-back">
        ← Voltar ao catálogo
      </Link>

      {/* Card principal do filme/série */}
      <div className="glass detalhe-card">
        {/* Poster */}
        <div className="detalhe-poster">
          {filme.urlPoster ? (
            <img
              src={filme.urlPoster}
              alt={`Pôster: ${filme.titulo}`}
            />
          ) : (
            <div className="detalhe-poster-fallback">
              <span className="detalhe-poster-emoji">🎬</span>
              <span className="detalhe-poster-filmtitle">{filme.titulo}</span>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="detalhe-info">
          <div>
            <span className="badge badge-primary detalhe-genre-badge">
              {GENERO_LABELS[filme.genero] || filme.genero}
            </span>
            <h1 className="detalhe-title">{filme.titulo}</h1>
            <p className="detalhe-duration">⏱ {filme.duracaoMinutos} minutos</p>
          </div>

          <p className="detalhe-description">
            {filme.descricao || 'Sem descrição disponível.'}
          </p>

          {/* Média de notas */}
          {mediaNotas ? (
            <div className="detalhe-rating-row">
              <StarRating value={Math.round(parseFloat(mediaNotas))} readonly />
              <span className="detalhe-rating-number">{mediaNotas}</span>
              <span className="detalhe-rating-count">
                ({avaliacoes.length} avaliação{avaliacoes.length !== 1 ? 'ões' : ''})
              </span>
            </div>
          ) : (
            <p className="detalhe-no-rating">
              Ainda sem avaliações. Seja o primeiro!
            </p>
          )}

          <Link
            to={`/sessoes?filmeId=${filme.id}`}
            className="btn btn-primary"
          >
            Ver Sessões e Comprar Ingresso
          </Link>
        </div>
      </div>

      {/* Grade: Formulário + Lista de avaliações */}
      <div className="detalhe-grid">
        {/* === Formulário de avaliação === */}
        <section>
          <h2 className="detalhe-section-title">Deixe sua avaliação</h2>

          {user ? (
            <form onSubmit={handleSubmit} className="glass detalhe-form">
              {/* Seleção de nota */}
              <div>
                <label className="detalhe-form-label">Sua nota *</label>
                <StarRating value={nota} onChange={setNota} />
                {nota > 0 && (
                  <span className="detalhe-nota-badge">{labelNota}</span>
                )}
              </div>

              {/* Campo de comentário */}
              <div className="form-group">
                <label htmlFor="comentario">Seu comentário *</label>
                <textarea
                  id="comentario"
                  className="form-control detalhe-textarea"
                  placeholder="O que você achou? Recomendaria para um amigo?"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={4}
                  disabled={enviando}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary detalhe-submit-btn"
                disabled={enviando || nota === 0}
              >
                {enviando ? 'Publicando...' : '✓ Publicar avaliação'}
              </button>
            </form>
          ) : (
            <div className="glass detalhe-login-prompt">
              <p>Faça login para avaliar este conteúdo.</p>
              <Link to="/login" className="btn btn-primary">
                Fazer login
              </Link>
            </div>
          )}
        </section>

        {/* === Lista de avaliações === */}
        <section>
          <h2 className="detalhe-section-title">
            Avaliações{avaliacoes.length > 0 ? ` (${avaliacoes.length})` : ''}
          </h2>

          {avaliacoes.length > 0 ? (
            <div className="detalhe-reviews-list">
              {avaliacoes.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="glass detalhe-empty-state">
              <div className="detalhe-empty-icon">💬</div>
              <p>Nenhuma avaliação ainda.</p>
              <p className="detalhe-empty-hint">
                {user ? 'Seja o primeiro a avaliar!' : 'Faça login e seja o primeiro!'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DetalheFilme;
