class KellyManagerUpgraded {
    constructor() {
        this.currentWeekTickers = [];
        this.previousWeekTickers = [];
        this.buyPositions = [];
        this.sellPositions = [];
        this.currentCalculation = null;

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('currentWeekFile').addEventListener('change', (e) => {
            this.handleCurrentWeekImport(e);
        });

        document.getElementById('previousWeekFile').addEventListener('change', (e) => {
            this.handlePreviousWeekImport(e);
        });

        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAll();
        });

        document.getElementById('calculateKelly').addEventListener('click', () => {
            this.calculateKelly();
        });
    }

    async handleCurrentWeekImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.txt')) {
            this.showStatus('currentWeekStatus', 'Fichier .txt requis', 'error');
            return;
        }

        try {
            const content = await this.readFile(file);
            this.currentWeekTickers = this.parseTickersFromContent(content);

            if (this.currentWeekTickers.length === 0) {
                this.showStatus('currentWeekStatus', 'Aucun ticker', 'error');
                return;
            }

            this.displayTickers('currentWeek', this.currentWeekTickers);
            this.showStatus('currentWeekStatus', `✅ ${this.currentWeekTickers.length} tickers`, 'success');

            // Mise à jour de la valeur uniquement si elle n'a pas été modifiée manuellement
            // (ou on écrase simplement avec le nombre du fichier pour simplifier)
            document.getElementById('totalPositions').value = this.currentWeekTickers.length;

            this.calculateRebalance();

        } catch (error) {
            this.showStatus('currentWeekStatus', 'Erreur lecture', 'error');
        }
    }

    async handlePreviousWeekImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.txt')) {
            this.showStatus('previousWeekStatus', 'Fichier .txt requis', 'error');
            return;
        }

        try {
            const content = await this.readFile(file);
            this.previousWeekTickers = this.parseTickersFromContent(content);

            this.displayTickers('previousWeek', this.previousWeekTickers);

            const statusMsg = this.previousWeekTickers.length === 0 ? 
                '✅ Pas de screening précédent' : 
                `✅ ${this.previousWeekTickers.length} tickers`;
            this.showStatus('previousWeekStatus', statusMsg, 'success');
            this.calculateRebalance();

        } catch (error) {
            this.showStatus('previousWeekStatus', 'Erreur lecture', 'error');
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    parseTickersFromContent(content) {
        const lines = content.split(/\r?\n/);
        const tickers = [];

        lines.forEach(line => {
            const ticker = line.trim().toUpperCase();
            if (ticker && ticker.length > 0 && ticker.length <= 10) {
                if (!tickers.includes(ticker)) {
                    tickers.push(ticker);
                }
            }
        });

        return tickers;
    }

    calculateRebalance() {
        this.buyPositions = this.currentWeekTickers.filter(ticker => 
            !this.previousWeekTickers.includes(ticker)
        );

        this.sellPositions = this.previousWeekTickers.filter(ticker => 
            !this.currentWeekTickers.includes(ticker)
        );

        this.displayRebalanceResults();
    }

    displayTickers(type, tickers) {
        const display = document.getElementById(`${type}Display`);
        const list = document.getElementById(`${type}List`);
        const count = document.getElementById(`${type}Count`);

        if (!display || !list || !count) return;

        count.textContent = `${tickers.length} tickers`;

        list.innerHTML = '';
        tickers.forEach(ticker => {
            const span = document.createElement('span');
            span.className = 'ticker-item';
            span.textContent = ticker;
            list.appendChild(span);
        });

        display.classList.remove('hidden');
    }

    displayRebalanceResults() {
        const buyDisplay = document.getElementById('buyPositionsDisplay');
        const buyList = document.getElementById('buyList');
        const buyCount = document.getElementById('buyCount');

        if (buyDisplay && buyList && buyCount) {
            buyCount.textContent = this.buyPositions.length;

            buyList.innerHTML = '';
            this.buyPositions.forEach(ticker => {
                const span = document.createElement('span');
                span.className = 'ticker-item';
                span.textContent = ticker;
                buyList.appendChild(span);
            });

            if (this.buyPositions.length > 0) {
                buyDisplay.classList.remove('hidden');
            }
        }

        const sellDisplay = document.getElementById('sellPositionsDisplay');
        const sellList = document.getElementById('sellList');
        const sellCount = document.getElementById('sellCount');

        if (sellDisplay && sellList && sellCount) {
            sellCount.textContent = this.sellPositions.length;

            sellList.innerHTML = '';
            this.sellPositions.forEach(ticker => {
                const span = document.createElement('span');
                span.className = 'ticker-item';
                span.textContent = ticker;
                sellList.appendChild(span);
            });

            if (this.sellPositions.length > 0) {
                sellDisplay.classList.remove('hidden');
            }
        }

        const status = document.getElementById('rebalanceStatus');
        if (status) {
            let statusMessage, statusClass;

            if (this.currentWeekTickers.length === 0) {
                statusMessage = 'Importez screening semaine';
                statusClass = 'info';
            } else if (this.buyPositions.length === 0 && this.sellPositions.length === 0) {
                statusMessage = 'Aucun rebalancement nécessaire';
                statusClass = 'info';
            } else {
                statusMessage = `Rebalancement: ${this.buyPositions.length} BUY, ${this.sellPositions.length} SELL`;
                statusClass = 'success';
            }

            status.textContent = statusMessage;
            status.className = `status ${statusClass}`;
            status.classList.remove('hidden');
        }
    }

    showStatus(statusId, message, type) {
        const statusEl = document.getElementById(statusId);
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.classList.remove('hidden');
    }

    calculateKelly() {
        const capitalActuelUsd = parseFloat(document.getElementById('capitalActuel').value);
        const kellyPercentage = parseFloat(document.getElementById('kellyOptimal').value);
        const totalPositions = parseInt(document.getElementById('totalPositions').value);
        const eurUsd = parseFloat(document.getElementById('eurUsd').value);

        if (isNaN(capitalActuelUsd) || capitalActuelUsd <= 0) {
            alert('Capital actuel (USD) invalide');
            return;
        }

        if (isNaN(kellyPercentage) || kellyPercentage < 0 || kellyPercentage > 100) {
            alert('Taux Kelly invalide (doit être entre 0 et 100)');
            return;
        }

        if (isNaN(totalPositions) || totalPositions <= 0) {
            alert('Nombre de positions invalide');
            return;
        }

        if (isNaN(eurUsd) || eurUsd <= 0) {
            alert('Taux EUR/USD invalide');
            return;
        }

        const kellyOptimal = kellyPercentage / 100.0;

        // Calcul avec base USD
        const capitalExposeUSD = capitalActuelUsd * kellyOptimal;
        const capitalExposeEUR = capitalExposeUSD / eurUsd;

        const positionUsd = capitalExposeUSD / totalPositions;
        const positionEur = positionUsd / eurUsd;

        const liquiditesUsd = capitalActuelUsd - capitalExposeUSD;
        const usdNouvellesPositions = this.buyPositions.length * positionUsd;

        this.currentCalculation = {
            capitalActuelUsd,
            totalPositions,
            buyPositions: this.buyPositions.length,
            sellPositions: this.sellPositions.length,
            capitalExposeEUR,
            capitalExposeUSD,
            positionEur,
            positionUsd,
            liquiditesUsd,
            usdNouvellesPositions
        };

        this.displayResults();
    }

    displayResults() {
        if (!this.currentCalculation) return;

        const c = this.currentCalculation;

        document.getElementById('capitalExposeUsd').textContent = this.formatUSD(c.capitalExposeUSD);
        document.getElementById('capitalExposeEur').textContent = this.formatEUR(c.capitalExposeEUR);
        document.getElementById('usdNouvellesPositions').textContent = this.formatUSD(c.usdNouvellesPositions);

        document.getElementById('totalScreeningResult').textContent = c.totalPositions;
        document.getElementById('buyPositionsResult').textContent = c.buyPositions;
        document.getElementById('sellPositionsResult').textContent = c.sellPositions;
        document.getElementById('positionUsdResult').textContent = this.formatUSD(c.positionUsd);
        document.getElementById('positionEurResult').textContent = this.formatEUR(c.positionEur);
        document.getElementById('liquiditesResult').textContent = this.formatUSD(c.liquiditesUsd);

        document.getElementById('results').classList.remove('hidden');
    }

    formatEUR(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    }

    formatUSD(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    }

    clearAll() {
        if (!confirm('Tout effacer ?')) return;

        this.currentWeekTickers = [];
        this.previousWeekTickers = [];
        this.buyPositions = [];
        this.sellPositions = [];
        this.currentCalculation = null;

        document.getElementById('currentWeekFile').value = '';
        document.getElementById('previousWeekFile').value = '';
        document.getElementById('totalPositions').value = '0';

        ['currentWeekDisplay', 'previousWeekDisplay', 'buyPositionsDisplay', 'sellPositionsDisplay'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        ['currentWeekStatus', 'previousWeekStatus', 'rebalanceStatus'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        document.getElementById('results').classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KellyManagerUpgraded();
});
