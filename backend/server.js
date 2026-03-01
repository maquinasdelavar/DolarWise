const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { subDays, format } = require('date-fns');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// URL base da API OData do Banco Central (Olinda)
const BCB_API_URL = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)';

/**
 * Rota principal para buscar dados do dólar.
 * Busca dados suficientes para calcular médias móveis (últimos 400 dias para cobrir a visão anual + buffer).
 */
app.get('/api/quotes', async (req, res) => {
    try {
        // Define o intervalo de datas (Hoje até 400 dias atrás para garantir dados para o gráfico de 1 ano)
        const endDate = new Date();
        const startDate = subDays(endDate, 400);

        // Formato exigido pelo BCB: 'MM-DD-YYYY'
        const formattedStart = format(startDate, "MM-dd-yyyy");
        const formattedEnd = format(endDate, "MM-dd-yyyy");

        const url = `${BCB_API_URL}?@dataInicial='${formattedStart}'&@dataFinalCotacao='${formattedEnd}'&$top=1000&$format=json`;

        const response = await axios.get(url);
        
        if (!response.data || !response.data.value) {
            throw new Error('Dados inválidos recebidos do BCB');
        }

        // Processamento dos dados
        // O BCB retorna: cotacaoCompra, cotacaoVenda, dataHoraCotacao
        const quotes = response.data.value.map(item => ({
            date: item.dataHoraCotacao,
            bid: item.cotacaoCompra, // Quanto o banco paga (para o freelancer vender)
            ask: item.cotacaoVenda   // Quanto o banco vende (preço de mercado)
        }));

        // Ordenar por data (mais antigo para mais recente)
        quotes.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({ success: true, data: quotes });

    } catch (error) {
        console.error('Erro ao buscar dados do BCB:', error.message);
        res.status(503).json({ 
            success: false, 
            message: 'Serviço do Banco Central indisponível ou erro de conexão.',
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor DollarWise rodando na porta ${PORT}`);
});
