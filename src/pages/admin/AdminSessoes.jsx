import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './admin.css';

export const AdminSessoes = () => {
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTodayString());
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filmes, setFilmes] = useState([]);
  const [salas, setSalas] = useState([]);
  const [filmeId, setFilmeId] = useState('');
  const [salaId, setSalaId] = useState('');
  const [inicioStr, setInicioStr] = useState('');
  const [preco, setPreco] = useState('');
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => { carregarSessoes(); }, [date]);

  const carregarSessoes = async () => {
    setLoading(true);
    try {
      const data = await api.sessoes.listarPorData(date);
      setSessoes(data || []);
    } catch {
      showToast('Erro ao carregar sessões.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    setFilmeId(''); setSalaId(''); setInicioStr(''); setPreco('');
    try {
      const [moviesList, roomsList] = await Promise.all([api.filmes.listar(), api.salas.listar()]);
      setFilmes(moviesList || []);
      setSalas(roomsList || []);
      if (moviesList?.length) setFilmeId(moviesList[0].id);
      if (roomsList?.length) setSalaId(roomsList[0].id);
      setShowModal(true);
    } catch {
      showToast('Erro ao carregar salas ou filmes.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!filmeId || !salaId || !inicioStr || !preco) { showToast('Preencha todos os campos.', 'error'); return; }
    const priceNum = parseFloat(preco);
    if (isNaN(priceNum) || priceNum <= 0) { showToast('O preço deve ser maior que zero.', 'error'); return; }

    setSaving(true);
    try {
      const selectedFilme = filmes.find(f => f.id === filmeId);
      if (!selectedFilme) throw new Error('Filme inválido');

      const startDate = new Date(inicioStr);
      const endDate = new Date(startDate.getTime() + selectedFilme.duracaoMinutos * 60 * 1000);
      const fmt = (d) => { const off = d.getTimezoneOffset(); return new Date(d.getTime() - off * 60 * 1000).toISOString().split('.')[0]; };

      await api.sessoes.criar({ filmeId, salaId, inicio: fmt(startDate), fim: fmt(endDate), preco: priceNum });
      showToast('Sessão agendada com sucesso!', 'success');
      setShowModal(false);
      carregarSessoes();
    } catch (err) {
      showToast(err.message || 'Erro ao agendar sessão (verifique conflitos de horário).', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sessao) => {
    if (!window.confirm(`Remover sessão das ${formatarHorario(sessao.inicio)} de "${sessao.filme.titulo}"?`)) return;
    try {
      await api.sessoes.deletar(sessao.id);
      showToast('Sessão deletada com sucesso!', 'success');
      carregarSessoes();
    } catch (err) {
      showToast(err.message || 'Erro ao excluir a sessão.', 'error');
    }
  };

  const formatarHorario = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const formatarPreco = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="container">
      <div className="page-header admin-page-header">
        <div>
          <h2 className="page-title">Gerenciar Programação</h2>
          <p className="page-subtitle">Programe sessões de filmes nas salas de cinema</p>
        </div>
        <div className="admin-filter-row">
          <input type="date" className="form-control admin-date-input" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={openAddModal} className="btn btn-primary">Agendar Sessão</button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Carregando sessões agendadas...</div>
      ) : sessoes.length > 0 ? (
        <div className="glass admin-table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Filme</th>
                  <th>Sala</th>
                  <th>Horário Início</th>
                  <th>Horário Fim</th>
                  <th>Preço Ingresso</th>
                  <th className="table-cell-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sessoes.map((sessao) => (
                  <tr key={sessao.id}>
                    <td className="table-cell-bold">{sessao.filme.titulo}</td>
                    <td>{sessao.sala.nome}</td>
                    <td className="table-cell-primary">{formatarHorario(sessao.inicio)}</td>
                    <td>{formatarHorario(sessao.fim)}</td>
                    <td className="table-cell-gold">{formatarPreco(sessao.preco)}</td>
                    <td className="table-cell-right">
                      <button onClick={() => handleDelete(sessao)} className="btn btn-danger admin-btn-sm">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass admin-empty">
          <h3>Nenhuma sessão para este dia</h3>
          <p>Agende sessões para esta data clicando no botão acima.</p>
          <button onClick={openAddModal} className="btn btn-primary">Criar Primeira Sessão</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3 className="modal-title">Agendar Sessão de Cinema</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="modal-filme">Filme *</label>
                <select id="modal-filme" className="form-control" value={filmeId}
                  onChange={(e) => setFilmeId(e.target.value)} required disabled={saving}>
                  {filmes.map(f => (
                    <option key={f.id} value={f.id}>{f.titulo} ({f.duracaoMinutos} min)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="modal-sala">Sala de Exibição *</label>
                <select id="modal-sala" className="form-control" value={salaId}
                  onChange={(e) => setSalaId(e.target.value)} required disabled={saving}>
                  {salas.map(s => (
                    <option key={s.id} value={s.id}>{s.nome} ({s.totalAssentos} assentos)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="modal-inicio">Horário de Início *</label>
                <input id="modal-inicio" type="datetime-local" className="form-control"
                  value={inicioStr} onChange={(e) => setInicioStr(e.target.value)} required disabled={saving} />
              </div>
              <div className="form-group">
                <label htmlFor="modal-preco">Preço do Ingresso (R$) *</label>
                <input id="modal-preco" type="number" step="0.01" min="0.05" className="form-control"
                  placeholder="Ex: 24.90" value={preco} onChange={(e) => setPreco(e.target.value)} required disabled={saving} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Agendando...' : 'Salvar Sessão'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSessoes;
