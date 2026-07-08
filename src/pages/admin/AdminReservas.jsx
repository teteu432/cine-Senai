import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './admin.css';

export const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMovie, setSearchMovie] = useState('');
  const { showToast } = useToast();

  useEffect(() => { carregarReservas(); }, []);

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const data = await api.admin.listarReservas();
      setReservas(data || []);
    } catch {
      showToast('Erro ao carregar lista de reservas gerais.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  };

  const formatarHorario = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const formatarPreco = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const filteredReservas = reservas.filter((reserva) =>
    (reserva.sessao?.filme?.titulo || '').toLowerCase().includes(searchMovie.toLowerCase())
  );

  return (
    <div className="container">
      <div className="page-header admin-page-header">
        <div>
          <h2 className="page-title">Todas as Reservas</h2>
          <p className="page-subtitle">Auditoria geral de ingressos vendidos no sistema</p>
        </div>
        <div className="admin-filter-row">
          <input type="text" className="form-control reservas-search"
            placeholder="Pesquisar por filme..." value={searchMovie} onChange={(e) => setSearchMovie(e.target.value)} />
          <button onClick={carregarReservas} className="btn btn-secondary admin-reload-btn">Atualizar</button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Carregando histórico de vendas...</div>
      ) : filteredReservas.length > 0 ? (
        <div className="glass admin-table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Filme</th>
                  <th>Sala</th>
                  <th>Data/Hora Sessão</th>
                  <th>Assentos</th>
                  <th>Valor Pago</th>
                  <th>Status</th>
                  <th>Data da Reserva</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.map((reserva) => {
                  const numSeats = reserva.assentos ? reserva.assentos.length : 0;
                  const totalPaid = numSeats * (reserva.sessao ? reserva.sessao.preco : 0);
                  const isAtiva = reserva.status === 'ATIVA';

                  return (
                    <tr key={reserva.id}>
                      <td className="table-cell-bold">{reserva.sessao?.filme?.titulo || 'Filme Excluído'}</td>
                      <td>{reserva.sessao?.sala?.nome || 'Sala N/A'}</td>
                      <td>
                        <strong>{formatarData(reserva.sessao?.inicio)}</strong> às {formatarHorario(reserva.sessao?.inicio)}
                      </td>
                      <td>{reserva.assentos?.map(a => `${a.fileira}${a.numero}`).join(', ')}</td>
                      <td style={{ color: isAtiva ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                        {formatarPreco(totalPaid)}
                      </td>
                      <td>
                        <span className={`badge ${isAtiva ? 'badge-success' : 'badge-warning'}`}>
                          {reserva.status === 'ATIVA' ? 'Ativa' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="table-cell-muted">{formatarData(reserva.criadoEm)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass admin-empty">
          <h3>Nenhuma reserva encontrada</h3>
          <p>Não há vendas registradas correspondentes aos filtros.</p>
        </div>
      )}
    </div>
  );
};
export default AdminReservas;
