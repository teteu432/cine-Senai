import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './admin.css';

const GENERO_LABELS = {
  ACAO: 'Ação',         COMEDIA: 'Comédia',      DRAMA: 'Drama',
  TERROR: 'Terror',     ROMANCE: 'Romance',       FICCAO_CIENTIFICA: 'Ficção Científica',
  ANIMACAO: 'Animação', DOCUMENTARIO: 'Documentário', SUSPENSE: 'Suspense',
  DORAMA: 'Dorama',     ESPORTE: 'Esporte',       CULT: 'Cult',
  AVENTURA: 'Aventura', MUSICAL: 'Musical',
};

export const AdminFilmes = () => {
  const [filmes, setFilmes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFilme, setEditingFilme] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [posterAtual, setPosterAtual] = useState('');
  const [posterArquivo, setPosterArquivo] = useState(null);
  const [genero, setGenero] = useState('ACAO');
  const [duracaoMinutos, setDuracaoMinutos] = useState(120);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => { carregarFilmes(); }, []);

  const carregarFilmes = async () => {
    setLoading(true);
    try {
      const data = await api.filmes.listar();
      setFilmes(data || []);
    } catch {
      showToast('Erro ao carregar lista de filmes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingFilme(null);
    setTitulo(''); setDescricao(''); setPosterAtual(''); setPosterArquivo(null);
    setGenero('ACAO'); setDuracaoMinutos(120);
    setShowModal(true);
  };

  const openEditModal = (filme) => {
    setEditingFilme(filme);
    setTitulo(filme.titulo || '');
    setDescricao(filme.descricao || '');
    setPosterAtual(filme.urlPoster || '');
    setPosterArquivo(null);
    setGenero(filme.genero || 'ACAO');
    setDuracaoMinutos(filme.duracaoMinutos || 120);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!titulo || !genero || !duracaoMinutos) { showToast('Preencha os campos obrigatórios.', 'error'); return; }
    if (duracaoMinutos < 1) { showToast('A duração deve ser maior que 0 minutos.', 'error'); return; }

    setSaving(true);
    const payload = { titulo, descricao, genero, duracaoMinutos: parseInt(duracaoMinutos, 10) };
    try {
      const filmeSalvo = editingFilme
        ? await api.filmes.atualizar(editingFilme.id, payload)
        : await api.filmes.criar(payload);

      if (posterArquivo) {
        await api.filmes.uploadImagem(filmeSalvo.id, posterArquivo);
      }

      showToast(editingFilme ? 'Filme atualizado com sucesso!' : 'Filme cadastrado com sucesso!', 'success');
      setShowModal(false);
      carregarFilmes();
    } catch (err) {
      showToast(err.message || 'Erro ao salvar o filme.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverPoster = async () => {
    if (!editingFilme) return;
    setSaving(true);
    try {
      await api.filmes.removerImagem(editingFilme.id);
      setPosterAtual('');
      showToast('Pôster removido.', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao remover o pôster.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (filme) => {
    if (!window.confirm(`Deseja remover "${filme.titulo}"? Isso pode excluir sessões associadas.`)) return;
    try {
      await api.filmes.deletar(filme.id);
      showToast('Filme deletado com sucesso!', 'success');
      carregarFilmes();
    } catch (err) {
      showToast(err.message || 'Erro ao deletar o filme.', 'error');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Gerenciar Filmes</h2>
          <p className="page-subtitle">Cadastre novos filmes ou atualize dados do catálogo existente</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Adicionar Filme
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Carregando catálogo de filmes...</div>
      ) : filmes.length > 0 ? (
        <div className="glass admin-table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Pôster</th>
                  <th>Título</th>
                  <th>Gênero</th>
                  <th>Duração</th>
                  <th className="table-cell-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filmes.map((filme) => (
                  <tr key={filme.id}>
                    <td>
                      <div className="admin-film-thumb">
                        {filme.urlPoster && <img src={filme.urlPoster} alt="" />}
                      </div>
                    </td>
                    <td className="table-cell-bold">{filme.titulo}</td>
                    <td>
                      <span className="badge badge-primary">
                        {GENERO_LABELS[filme.genero] || filme.genero}
                      </span>
                    </td>
                    <td>{filme.duracaoMinutos} min</td>
                    <td className="table-cell-right">
                      <div className="table-actions">
                        <button onClick={() => openEditModal(filme)} className="btn btn-secondary admin-btn-sm">Editar</button>
                        <button onClick={() => handleDelete(filme)} className="btn btn-danger admin-btn-sm">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass admin-empty">
          <h3>Nenhum filme cadastrado</h3>
          <p>Cadastre um filme para começar a programar sessões.</p>
          <button onClick={openAddModal} className="btn btn-primary">Adicionar Primeiro Filme</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3 className="modal-title">{editingFilme ? 'Editar Filme' : 'Adicionar Novo Filme'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="modal-titulo">Título *</label>
                <input id="modal-titulo" type="text" className="form-control" placeholder="Ex: Interestelar"
                  value={titulo} onChange={(e) => setTitulo(e.target.value)} required disabled={saving} />
              </div>
              <div className="form-group">
                <label htmlFor="modal-genero">Gênero *</label>
                <select id="modal-genero" className="form-control" value={genero}
                  onChange={(e) => setGenero(e.target.value)} required disabled={saving}>
                  {Object.entries(GENERO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="modal-duracao">Duração (minutos) *</label>
                <input id="modal-duracao" type="number" className="form-control" min="1"
                  value={duracaoMinutos} onChange={(e) => setDuracaoMinutos(e.target.value)} required disabled={saving} />
              </div>
              <div className="form-group">
                <label htmlFor="modal-poster">Pôster</label>
                {posterAtual && (
                  <div className="admin-film-thumb" style={{ marginBottom: '0.5rem' }}>
                    <img src={posterAtual} alt="Pôster atual" />
                  </div>
                )}
                <input id="modal-poster" type="file" accept="image/*" className="form-control"
                  onChange={(e) => setPosterArquivo(e.target.files[0] || null)} disabled={saving} />
                {posterAtual && (
                  <button type="button" onClick={handleRemoverPoster} className="btn btn-danger admin-btn-sm"
                    style={{ marginTop: '0.5rem' }} disabled={saving}>
                    Remover pôster atual
                  </button>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="modal-descricao">Sinopse / Descrição</label>
                <textarea id="modal-descricao" className="form-control" placeholder="Sinopse detalhada do filme..."
                  rows="4" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }} disabled={saving} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Filme'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminFilmes;
