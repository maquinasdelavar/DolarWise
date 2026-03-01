import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowRightLeft, Activity } from 'lucide-react';
import './App.css';
import { RiveHero } from './RiveHero';
import { RiveLoading } from './RiveLoading';

// Registro dos componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(30); // 30, 90, 365 dias
  const [simValue, setSimValue] = useState(1000); // Valor padrão simulador

  // Busca dados ao carregar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/quotes');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        setError('Não foi possível conectar ao servidor ou ao Banco Central.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Lógica de Cálculo ---

  // Filtra os dados baseados no período selecionado
  const getFilteredData = () => {
    if (data.length === 0) return [];
    return data.slice(-period);
  };

  // Calcula Média Móvel Simples (SMA)
  const calculateSMA = (dataset, days) => {
    if (dataset.length < days) return null;
    const sum = dataset.slice(-days).reduce((acc, curr) => acc + curr.ask, 0);
    return sum / days;
  };

  // Dados atuais e históricos
  const currentQuote = data.length > 0 ? data[data.length - 1] : null;
  const filteredData = getFilteredData();
  
  const sma7 = calculateSMA(data, 7);
  const sma30 = calculateSMA(data, 30);
  
  // Variação Percentual
  const getVariation = (days) => {
    if (data.length < days + 1) return 0;
    const current = data[data.length - 1].ask;
    const past = data[data.length - 1 - days].ask;
    return ((current - past) / past) * 100;
  };

  const var7d = getVariation(7);
  const var30d = getVariation(30);

  // Lógica de Tendência
  const trend = sma7 > sma30 ? 'alta' : 'baixa';
  const recommendation = trend === 'alta' 
    ? { text: "Tendência de Alta", subtext: "Pode ser vantajoso esperar", color: "trend-up", icon: <TrendingUp size={24} /> }
    : { text: "Tendência de Baixa", subtext: "Converter pode reduzir risco", color: "trend-down", icon: <TrendingDown size={24} /> };

  // --- Configuração do Gráfico ---
  const chartData = {
    labels: filteredData.map(d => format(parseISO(d.date), 'dd/MM')),
    datasets: [
      {
        label: 'Valor do Dólar',
        data: filteredData.map(d => d.ask),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { ticks: { callback: (value) => `R$ ${value.toFixed(2)}` } }
    }
  };

  // --- Renderização ---

  if (loading) return <RiveLoading />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <header className="header">
        <div className="logo-area">
          <DollarSign className="logo-icon" size={32} />
          <h1>DollarWise</h1>
        </div>
        <p>Descubra o melhor momento para converter seus dólares em reais.</p>
      </header>

      {/* Animação Hero do Rive */}
      <div style={{ marginBottom: '2rem' }}>
        <RiveHero />
      </div>

      {/* Indicador de Tendência e Recomendação */}
      <div className={`card recommendation-card ${trend}`}>
        <div className="rec-content">
          <div className="rec-icon-wrapper">
            {recommendation.icon}
          </div>
          <div className="rec-text">
            <h2>{recommendation.text === "Tendência de Alta" ? "O Dólar está subindo" : "O Dólar está caindo"}</h2>
            <p>{recommendation.text === "Tendência de Alta" ? "Pode ser bom esperar um pouco mais." : "Talvez seja hora de garantir esse valor."}</p>
          </div>
        </div>
        <div className="rec-stats">
          <div className="stat-item">
            <span>Média (Semana)</span>
            <strong>R$ {sma7?.toFixed(4)}</strong>
          </div>
          <div className="stat-item">
            <span>Média (Mês)</span>
            <strong>R$ {sma30?.toFixed(4)}</strong>
          </div>
        </div>
      </div>

      <div className="grid">
        {/* Card Cotação Atual */}
        <div className="card">
          <div className="card-header"><Activity size={20} /> <h2>Preço Hoje</h2></div>
          <div className="value-highlight">R$ {currentQuote?.ask.toFixed(4)}</div>
          <div className="variations">
            <span className={var7d >= 0 ? 'trend-up' : 'trend-down'}>
              {var7d > 0 ? '▲' : '▼'} {Math.abs(var7d).toFixed(2)}% (7d)
            </span>
            <span className={var30d >= 0 ? 'trend-up' : 'trend-down'}>
              {var30d > 0 ? '▲' : '▼'} {Math.abs(var30d).toFixed(2)}% (30d)
            </span>
          </div>
        </div>

        {/* Simulador */}
        <div className="card">
          <div className="card-header"><ArrowRightLeft size={20} /> <h2>Calculadora</h2></div>
          <div className="input-group">
            <span className="currency-symbol">USD</span>
          <input 
            type="number" 
            value={simValue} 
            onChange={(e) => setSimValue(Number(e.target.value))} 
          />
          </div>
          
          <div className="sim-results">
            <div className="sim-row main-result">
              <small>Você recebe hoje:</small>
              <div className="result-value">
                R$ {(simValue * currentQuote?.bid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="sim-row secondary-result">
              <small>Se fosse na média do mês:</small>
              <div>
                R$ {(simValue * sma30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          
          <div className={`sim-diff ${(simValue * currentQuote?.bid) > (simValue * sma30) ? 'trend-up' : 'trend-down'}`}>
            Diferença: {((simValue * currentQuote?.bid) - (simValue * sma30)) > 0 ? '+' : ''} R$ {((simValue * currentQuote?.bid) - (simValue * sma30)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card">
        <div className="chart-header">
          <div className="card-header"><Calendar size={20} /> <h2>Evolução no Tempo</h2></div>
          <div className="btn-group">
            <button className={period === 30 ? 'active' : ''} onClick={() => setPeriod(30)}>30 Dias</button>
            <button className={period === 90 ? 'active' : ''} onClick={() => setPeriod(90)}>90 Dias</button>
            <button className={period === 365 ? 'active' : ''} onClick={() => setPeriod(365)}>1 Ano</button>
          </div>
        </div>
        <div className="chart-container">
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default App;
