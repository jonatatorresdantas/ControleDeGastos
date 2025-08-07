const { createApp } = Vue;

createApp({
    data() {
        return {
            transactions: [],
            description: '',
            amount: '',
            category: '',
            type: 'saida',
            date: new Date().toISOString().split('T')[0],
            categories: [
                'Alimentação', 
                'Transporte', 
                'Moradia', 
                'Saúde', 
                'Educação',
                'Lazer', 
                'Roupas', 
                'Serviços', 
                'Investimentos', 
                'Outros'
            ]
        }
    },
    computed: {
        summary() {
            const entradas = this.transactions
                .filter(t => t.type === 'entrada')
                .reduce((sum, t) => sum + t.amount, 0);

            const saidas = this.transactions
                .filter(t => t.type === 'saida')
                .reduce((sum, t) => sum + t.amount, 0);

            const saldo = entradas - saidas;

            const categoryTotals = this.transactions
                .filter(t => t.type === 'saida')
                .reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                }, {});

            return { entradas, saidas, saldo, categoryTotals };
        }
    },
    methods: {
        addTransaction() {
            if (!this.description || !this.amount || !this.category) return;

            const newTransaction = {
                id: Date.now(),
                description: this.description,
                amount: parseFloat(this.amount),
                category: this.category,
                type: this.type,
                date: this.date
            };

            this.transactions.push(newTransaction);
            this.description = '';
            this.amount = '';
            this.category = '';
        },

        deleteTransaction(id) {
            this.transactions = this.transactions.filter(t => t.id !== id);
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('pt-BR');
        },

        exportToCSV() {
            const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
            const csvData = this.transactions.map(t => [
                t.date,
                t.description,
                t.category,
                t.type === 'entrada' ? 'Entrada' : 'Saída',
                t.amount.toFixed(2)
            ]);

            const csvContent = [headers].concat(csvData)
                .map(row => row.map(cell => '"' + cell + '"').join(','))
                .join('\n');

            this.downloadCSV(csvContent, 'gastos_mensais_' + new Date().toISOString().split('T')[0] + '.csv');
        },

        exportSummaryToCSV() {
            const summaryData = [
                ['Resumo Financeiro', ''],
                ['Total Entradas', this.summary.entradas.toFixed(2)],
                ['Total Saídas', this.summary.saidas.toFixed(2)],
                ['Saldo', this.summary.saldo.toFixed(2)],
                ['', ''],
                ['Gastos por Categoria', '']
            ];

            Object.entries(this.summary.categoryTotals).forEach(([cat, val]) => {
                summaryData.push([cat, val.toFixed(2)]);
            });

            const csvContent = summaryData
                .map(row => row.map(cell => '"' + cell + '"').join(','))
                .join('\n');

            this.downloadCSV(csvContent, 'resumo_financeiro_' + new Date().toISOString().split('T')[0] + '.csv');
        },

        downloadCSV(csvContent, filename) {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }
    },
    mounted() {
        lucide.createIcons();
    },
    updated() {
        lucide.createIcons();
    }
}).mount('#app');