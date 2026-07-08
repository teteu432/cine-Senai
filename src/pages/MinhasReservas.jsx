import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import './MinhasReservas.css';

export const MinhasReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const data = await api.reservas.listarMinhas();
      setReservas(data || []);
    } catch (err) {
      showToast('Erro ao carregar seu histórico de reservas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (reservaId) => {
    const confirmCancel = window.confirm('Deseja realmente cancelar esta reserva? O assento será liberado.');
    if (!confirmCancel) return;

    try {
      await api.reservas.cancelar(reservaId);
      showToast('Reserva cancelada com sucesso!', 'success');
      carregarReservas();
    } catch (err) {
      showToast(err.message || 'Erro ao cancelar reserva.', 'error');
    }
  };

  const formatarData = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  };

  const formatarHorario = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const formatarPreco = (precoValue) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoValue);
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="reservas-title">Minhas Reservas</h2>
          <p className="reservas-subtitle">Acompanhe seus ingressos e sessões agendadas</p>
        </div>
      </div>

      {loading ? (
        <div className="reservas-loading">Carregando histórico de reservas...</div>
      ) : reservas.length > 0 ? (
        <div className="reservas-list">
          {reservas.map((reserva) => {
            const numSeats = reserva.assentos ? reserva.assentos.length : 0;
            const totalCost = numSeats * (reserva.sessao ? reserva.sessao.preco : 0);
            const isAtiva = reserva.status === 'ATIVA';

            return (
              <div
                key={reserva.id}
                className={`glass reserva-card${isAtiva ? '' : ' reserva-card--cancelada'}`}
              >
                {/* Miniatura do poster */}
                <div className="reserva-thumb">
                  {reserva.sessao?.filme?.urlPoster && (
                    <img src={reserva.sessao.filme.urlPoster} alt="" />
                  )}
                </div>

                {/* Detalhes */}
                <div className="reserva-details">
                  <h3 className="reserva-film-title">{reserva.sessao?.filme?.titulo || 'Filme Excluído'}</h3>
                  <div className="reserva-meta">
                    <span><strong>Sala:</strong> {reserva.sessao?.sala?.nome || 'Sala N/A'}</span>
                    <span><strong>Data:</strong> {formatarData(reserva.sessao?.inicio)}</span>
                    <span><strong>Horário:</strong> {formatarHorario(reserva.sessao?.inicio)}</span>
                    <span>
                      <strong>Assentos ({numSeats}): </strong>
                      {reserva.assentos?.map(a => `${a.fileira}${a.numero}`).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Preço e status */}
                <div className="reserva-pricing">
                  <div className="reserva-valor">
                    <div className="reserva-valor-label">Valor Pago:</div>
                    <div className={`reserva-valor-amount reserva-valor-amount--${isAtiva ? 'ativa' : 'cancelada'}`}>
                      {formatarPreco(totalCost)}
                    </div>
                  </div>

                  <div>
                    <span className={`badge ${isAtiva ? 'badge-success' : 'badge-warning'}`}>
                      {reserva.status === 'ATIVA' ? 'Ativa' : 'Cancelada'}
                    </span>
                  </div>

                  {isAtiva && (
                    <button
                      onClick={() => handleCancelar(reserva.id)}
                      className="btn btn-danger reserva-cancel-btn"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass reservas-empty">
          <svg className="reservas-empty-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h9c.621 0 1.125.504 1.125 1.125V18a1.125 1.125 0 01-1.125 1.125h-9A1.125 1.125 0 015.25 18V7.125C5.25 6.504 5.754 6 6.375 6z" />
          </svg>
          <h3>Nenhuma reserva encontrada</h3>
          <p>Você ainda não comprou ingressos para nenhuma sessão.</p>
          <Link to="/" className="btn btn-primary">Ver Filmes em Cartaz</Link>
        </div>
      )}
    </div>
  );
};
export default MinhasReservas;
