import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './admin.css';

export const AdminDashboard = () => {
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const carregarRelatorio = async () => {
    setLoading(true);
    try {
      const data = await api.admin.gerarRelatorio();
      setRelatorio(data);
    } catch (err) {
      showToast('Erro ao carregar relatórios administrativos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatarPreco = (precoValue) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoValue || 0);
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Painel Administrativo</h2>
          <p className="page-subtitle">Métricas do sistema, relatórios de vendas e gerenciamento</p>
        </div>
        <button onClick={carregarRelatorio} className="btn btn-secondary admin-reload-btn">
          Atualizar Relatório
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Carregando dados estatísticos...</div>
      ) : relatorio ? (
        <>
          {/* Cards de métricas */}
          <div className="stats-grid">
            <div className="glass stat-card stat-card--primary">
              <span className="stat-label">Total de Reservas</span>
              <div className="stat-value">{relatorio.totalReservas}</div>
            </div>
            <div className="glass stat-card stat-card--success">
              <span className="stat-label">Receita Acumulada</span>
              <div className="stat-value">{formatarPreco(relatorio.totalReceita)}</div>
            </div>
            <div className="glass stat-card stat-card--secondary">
              <span className="stat-label">Filmes Cadastrados</span>
              <div className="stat-value">{relatorio.filmes?.length || 0}</div>
            </div>
          </div>

          {/* Tabela de vendas por filme */}
          <div className="glass admin-sales-card">
            <h3 className="admin-sales-title">Reservas por Filme</h3>
            {relatorio.filmes && relatorio.filmes.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nome do Filme</th>
                      <th className="table-cell-right">Total de Ingressos Reservados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.filmes.map((filmeStat, index) => (
                      <tr key={index}>
                        <td className="table-cell-bold">{filmeStat.nomeFilme}</td>
                        <td className="table-cell-right table-cell-primary">{filmeStat.totalReservas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-no-data">Não há vendas ou reservas registradas.</p>
            )}
          </div>

          {/* Atalhos de navegação */}
          <div className="admin-shortcuts">
            <Link to="/admin/filmes" className="admin-shortcut-link">
              <div className="glass glass-hover admin-shortcut-card">
                <h4 className="admin-shortcut-title" style={{ color: 'var(--primary)' }}>Gerenciar Filmes</h4>
                <p className="admin-shortcut-desc">Cadastre, edite e remova filmes do catálogo geral.</p>
              </div>
            </Link>
            <Link to="/admin/salas" className="admin-shortcut-link">
              <div className="glass glass-hover admin-shortcut-card">
                <h4 className="admin-shortcut-title" style={{ color: 'var(--secondary)' }}>Gerenciar Salas</h4>
                <p className="admin-shortcut-desc">Configure novas salas de cinema e seus assentos.</p>
              </div>
            </Link>
            <Link to="/admin/sessoes" className="admin-shortcut-link">
              <div className="glass glass-hover admin-shortcut-card">
                <h4 className="admin-shortcut-title" style={{ color: '#f59e0b' }}>Gerenciar Sessões</h4>
                <p className="admin-shortcut-desc">Agende filmes em salas com horários e preços.</p>
              </div>
            </Link>
            <Link to="/admin/reservas" className="admin-shortcut-link">
              <div className="glass glass-hover admin-shortcut-card">
                <h4 className="admin-shortcut-title" style={{ color: 'var(--success)' }}>Todas as Reservas</h4>
                <p className="admin-shortcut-desc">Veja todas as compras e controle cancelamentos gerais.</p>
              </div>
            </Link>
          </div>
        </>
      ) : (
        <div className="admin-no-stats">Sem dados estatísticos.</div>
      )}
    </div>
  );
};
export default AdminDashboard;
