import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Sessoes.css';

export const Sessoes = () => {
  const [searchParams] = useSearchParams();
  const filmeIdParam = searchParams.get('filmeId');

  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    carregarSessoes();
  }, [filmeIdParam]);

  const carregarSessoes = async () => {
    if (!filmeIdParam) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.sessoes.listarPorFilme(filmeIdParam);
      setSessoes(data || []);
    } catch (err) {
      showToast('Erro ao carregar sessões.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSessoesOrdenadas = () => {
    return [...sessoes].sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
  };

  const formatarData = (isoString) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
    });
  };

  const formatarHorario = (isoString) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const formatarPreco = (precoValue) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoValue);
  };

  const sessoesOrdenadas = getSessoesOrdenadas();
  const filme = sessoesOrdenadas[0]?.filme;

  if (!filmeIdParam) {
    return (
      <div className="container">
        <div className="glass sessoes-no-film">
          <h3>Nenhum filme selecionado</h3>
          <p>Acesse esta página a partir da listagem de filmes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="sessoes-title">Sessões disponíveis</h2>
          {filme && <p className="sessoes-subtitle">{filme.titulo}</p>}
        </div>
      </div>

      {loading ? (
        <div className="sessoes-loading">Carregando sessões...</div>
      ) : sessoesOrdenadas.length > 0 ? (
        <div className="sessoes-list">
          {sessoesOrdenadas.map((sessao) => (
            <Link key={sessao.id} to={`/reservas/nova/${sessao.id}`} className="sessao-link">
              <div className="glass glass-hover sessao-card">
                <div className="sessao-card-left">
                  <div>
                    <div className="sessao-horario">{formatarHorario(sessao.inicio)}</div>
                    <div className="sessao-data">{formatarData(sessao.inicio)}</div>
                  </div>
                  <div className="sessao-sala">{sessao.sala.nome}</div>
                </div>
                <div className="sessao-preco">{formatarPreco(sessao.preco)}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass sessoes-empty">
          <svg className="sessoes-empty-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h3>Nenhuma sessão disponível</h3>
          <p>Não há sessões cadastradas para este filme.</p>
        </div>
      )}
    </div>
  );
};
export default Sessoes;
