import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './admin.css';

export const AdminSalas = () => {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [nome, setNome] = useState('');
  const [fileiras, setFileiras] = useState(5);
  const [assentosPorFileira, setAssentosPorFileira] = useState(6);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => { carregarSalas(); }, []);

  const carregarSalas = async () => {
    setLoading(true);
    try {
      const data = await api.salas.listar();
      setSalas(data || []);
    } catch {
      showToast('Erro ao carregar lista de salas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setNome(''); setFileiras(5); setAssentosPorFileira(8);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nome || !fileiras || !assentosPorFileira) { showToast('Preencha todos os campos.', 'error'); return; }
    if (fileiras < 1 || assentosPorFileira < 1) { showToast('A sala deve ter pelo menos 1 fileira e 1 assento.', 'error'); return; }
    if (fileiras > 26) { showToast('Máximo de 26 fileiras (A-Z).', 'error'); return; }

    setSaving(true);
    try {
      await api.salas.criar({
        nome,
        fileiras: parseInt(fileiras, 10),
        assentosPorFileira: parseInt(assentosPorFileira, 10),
        totalAssentos: fileiras * assentosPorFileira,
      });
      showToast('Sala criada com sucesso!', 'success');
      setShowModal(false);
      carregarSalas();
    } catch (err) {
      showToast(err.message || 'Erro ao criar a sala.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sala) => {
    if (!window.confirm(`Deseja excluir "${sala.nome}"? Isso remove todos os assentos e sessões.`)) return;
    try {
      await api.salas.deletar(sala.id);
      showToast('Sala excluída com sucesso!', 'success');
      carregarSalas();
    } catch (err) {
      showToast(err.message || 'Erro ao excluir a sala.', 'error');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Gerenciar Salas</h2>
          <p className="page-subtitle">Cadastre as salas físicas e configure a malha de poltronas</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Criar Sala
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Carregando salas de cinema...</div>
      ) : salas.length > 0 ? (
        <div className="glass admin-table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nome da Sala</th>
                  <th>Capacidade Total</th>
                  <th className="table-cell-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id}>
                    <td className="table-cell-bold">{sala.nome}</td>
                    <td>
                      <span className="badge badge-success" style={{ fontWeight: 'bold' }}>
                        {sala.totalAssentos} assentos
                      </span>
                    </td>
                    <td className="table-cell-right">
                      <button onClick={() => handleDelete(sala)} className="btn btn-danger admin-btn-sm">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass admin-empty">
          <h3>Nenhuma sala cadastrada</h3>
          <p>Configure a primeira sala para poder alocar sessões.</p>
          <button onClick={openAddModal} className="btn btn-primary">Criar Primeira Sala</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3 className="modal-title">Cadastrar Nova Sala</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="modal-nome">Nome da Sala *</label>
                <input id="modal-nome" type="text" className="form-control" placeholder="Ex: Sala 01 IMAX"
                  value={nome} onChange={(e) => setNome(e.target.value)} required disabled={saving} />
              </div>

              <div className="form-2col">
                <div className="form-group">
                  <label htmlFor="modal-fileiras">Fileiras *</label>
                  <input id="modal-fileiras" type="number" className="form-control" min="1" max="26"
                    value={fileiras} onChange={(e) => setFileiras(e.target.value)} required disabled={saving} />
                  <small className="form-hint">
                    Linhas de A até {String.fromCharCode(64 + Math.min(26, Math.max(1, fileiras)))}
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="modal-assentos">Poltronas por Fileira *</label>
                  <input id="modal-assentos" type="number" className="form-control" min="1"
                    value={assentosPorFileira} onChange={(e) => setAssentosPorFileira(e.target.value)} required disabled={saving} />
                </div>
              </div>

              <div className="capacity-preview">
                <span className="capacity-label">Capacidade calculada:</span>
                <span className="capacity-value">{fileiras * assentosPorFileira} assentos</span>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={saving}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Criando...' : 'Salvar Sala'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSalas;
