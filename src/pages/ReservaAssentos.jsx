import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import './ReservaAssentos.css';

export const ReservaAssentos = () => {
  const { sessaoId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sessao, setSessao] = useState(null);
  const [assentos, setAssentos] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [sessaoId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [sessaoData, assentosData] = await Promise.all([
        api.sessoes.buscarPorId(sessaoId),
        api.sessoes.listarAssentos(sessaoId)
      ]);
      setSessao(sessaoData);
      setAssentos(assentosData || []);
    } catch (err) {
      showToast('Erro ao carregar dados da sessão e assentos.', 'error');
      navigate('/sessoes');
    } finally {
      setLoading(false);
    }
  };

  const getGroupedSeats = () => {
    const grouped = {};
    assentos.forEach((assento) => {
      const row = assento.fileira;
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(assento);
    });
    Object.keys(grouped).forEach((row) => {
      grouped[row].sort((a, b) => a.numero - b.numero);
    });
    return Object.keys(grouped).sort().reduce((obj, key) => {
      obj[key] = grouped[key];
      return obj;
    }, {});
  };

  const handleSeatClick = (assento) => {
    if (!assento.disponivel) return;
    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === assento.id);
      return isSelected ? prev.filter((s) => s.id !== assento.id) : [...prev, assento];
    });
  };

  const handleReservar = async () => {
    if (selectedSeats.length === 0) {
      showToast('Por favor, selecione pelo menos um assento.', 'error');
      return;
    }
    setBooking(true);
    try {
      await api.reservas.criar(sessaoId, selectedSeats.map((s) => s.id));
      showToast('Reserva realizada com sucesso! Bom filme.', 'success');
      navigate('/minhas-reservas');
    } catch (err) {
      showToast(err.message || 'Erro ao realizar reserva.', 'error');
    } finally {
      setBooking(false);
    }
  };

  const formatarData = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'UTC' });
  };

  const formatarHorario = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const formatarPreco = (precoValue) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoValue);
  };

  if (loading) {
    return <div className="reserva-page-loading">Carregando mapa de assentos...</div>;
  }

  if (!sessao) {
    return (
      <div className="container reserva-notfound">
        <h2>Sessão não encontrada</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">Voltar ao Início</button>
      </div>
    );
  }

  const groupedSeats = getGroupedSeats();
  const totalPrice = selectedSeats.length * sessao.preco;

  return (
    <div className="container">
      {/* Barra de informações da sessão */}
      <div className="glass sessao-info-bar">
        <div className="sessao-thumb">
          {sessao.filme.urlPoster && (
            <img src={sessao.filme.urlPoster} alt="" />
          )}
        </div>

        <div className="sessao-info">
          <span className="badge badge-primary sessao-genre-badge">{sessao.filme.genero}</span>
          <h2 className="sessao-film-title">{sessao.filme.titulo}</h2>
          <div className="sessao-meta">
            <span><strong>Sala:</strong> {sessao.sala.nome}</span>
            <span><strong>Data:</strong> {formatarData(sessao.inicio)}</span>
            <span><strong>Horário:</strong> {formatarHorario(sessao.inicio)}</span>
            <span><strong>Ingresso:</strong> <span className="sessao-ticket-price">{formatarPreco(sessao.preco)}</span></span>
          </div>
        </div>

        <button onClick={() => navigate(-1)} className="btn btn-secondary sessao-back-btn">
          Voltar
        </button>
      </div>

      <div className="reserva-layout">
        {/* Mapa de assentos */}
        <div className="glass seating-area">
          <h3 className="seating-title">Escolha suas Poltronas</h3>
          <div className="screen">TELA</div>

          <div className="seating-chart-container">
            {Object.entries(groupedSeats).map(([rowLabel, rowSeats]) => (
              <div key={rowLabel} className="seating-row">
                <span className="row-label">{rowLabel}</span>
                {rowSeats.map((assento) => {
                  const isSelected = selectedSeats.some((s) => s.id === assento.id);
                  const seatClass = !assento.disponivel ? 'occupied' : isSelected ? 'selected' : 'available';
                  return (
                    <button
                      key={assento.id}
                      className={`seat ${seatClass}`}
                      onClick={() => handleSeatClick(assento)}
                      disabled={!assento.disponivel}
                      title={`Assento ${assento.fileira}${assento.numero}`}
                    >
                      {assento.numero}
                    </button>
                  );
                })}
                <span className="row-label">{rowLabel}</span>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-seat legend-seat--available"></div>
              <span>Livre</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat legend-seat--selected"></div>
              <span>Selecionado</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat legend-seat--occupied"></div>
              <span>Ocupado</span>
            </div>
          </div>
        </div>

        {/* Resumo do pedido */}
        <div className="glass reserva-summary">
          <h3 className="summary-title">Resumo do Pedido</h3>

          <div className="summary-rows">
            <div className="summary-row">
              <span className="summary-label">Filme:</span>
              <span className="summary-value-title">{sessao.filme.titulo}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Horário:</span>
              <span>{formatarHorario(sessao.inicio)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Preço unitário:</span>
              <span className="summary-value-price">{formatarPreco(sessao.preco)}</span>
            </div>
            <div className="summary-seats-row">
              <span className="summary-label">Poltronas:</span>
              <span className="summary-seats">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span key={s.id} className="badge badge-primary summary-seat-badge">
                      {s.fileira}{s.numero}
                    </span>
                  ))
                ) : (
                  <span className="summary-no-seats">Nenhuma</span>
                )}
              </span>
            </div>
          </div>

          <div className="summary-total">
            <span className="summary-total-label">Valor Total:</span>
            <span className="summary-total-amount">{formatarPreco(totalPrice)}</span>
          </div>

          <button
            onClick={handleReservar}
            className="btn btn-primary summary-book-btn"
            disabled={selectedSeats.length === 0 || booking}
          >
            {booking ? 'Processando...' : `Confirmar ${selectedSeats.length} Ingresso(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReservaAssentos;
