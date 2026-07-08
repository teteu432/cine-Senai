import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './admin.css';

export const AdminUsuarios = () => {
  const [usuarioId, setUsuarioId] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!usuarioId) { showToast('Por favor, informe o ID do usuário.', 'error'); return; }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(usuarioId.trim())) {
      showToast('O ID informado não está no formato UUID válido.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.admin.promoverUsuario(usuarioId.trim());
      showToast('Usuário promovido a ADMINISTRADOR com sucesso!', 'success');
      setUsuarioId('');
    } catch (err) {
      showToast(err.message || 'Erro ao promover usuário. Verifique se o ID existe.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Gerenciar Permissões</h2>
          <p className="page-subtitle">Promova usuários comuns para o cargo de administrador</p>
        </div>
      </div>

      <div className="usuarios-grid">
        {/* Formulário de promoção */}
        <div className="glass usuarios-promo-card">
          <h3 className="usuarios-card-title">Promover para Admin</h3>
          <p className="usuarios-card-desc">
            Cole o identificador único (UUID) do usuário que deseja promover. O usuário ganhará privilégios
            para criar e excluir salas, filmes, sessões e visualizar relatórios.
          </p>

          <form onSubmit={handlePromote}>
            <div className="form-group">
              <label htmlFor="user-id">ID do Usuário (UUID)</label>
              <input
                id="user-id"
                type="text"
                className="form-control"
                placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary usuarios-submit-btn" disabled={loading}>
              {loading ? 'Processando...' : 'Promover para Admin'}
            </button>
          </form>
        </div>

        {/* Painel informativo */}
        <div className="glass usuarios-info-card">
          <h3 className="usuarios-info-title">Informações de Nível de Acesso</h3>

          <div className="usuarios-role-list">
            <div className="usuarios-role-item">
              <strong className="usuarios-role-name--admin">Cargo ADMIN:</strong>
              <p className="usuarios-role-desc">
                Possui acesso total ao painel administrativo. Pode visualizar relatórios de receitas,
                gerenciar o catálogo de filmes, configurar salas físicas, agendar exibições e promover outros usuários.
              </p>
            </div>
            <div className="usuarios-role-item">
              <strong className="usuarios-role-name--user">Cargo USUARIO:</strong>
              <p className="usuarios-role-desc">
                Nível de acesso padrão ao se registrar no sistema. Permite pesquisar filmes, consultar salas e sessões
                disponíveis, realizar reservas de poltronas livres e cancelar suas próprias compras antes da exibição.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminUsuarios;
