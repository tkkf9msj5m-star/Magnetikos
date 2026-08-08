class KellyManagerFast {
    constructor() {
        this.currentWeekTickers = [];
        this.previousWeekTickers = [];
        this.buyPositions = [];
        this.sellPositions = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
    }

    bindEvents() {
        document.getElementById('processCurrentBtn').addEventListener('click', () => this.processCurrentText());
        document.getElementById('processPrevBtn').addEventListener('click', () => this.processPreviousText());
        document.getElementById('calculateKelly').addEventListener('click', () => this.calculateKelly());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('shiftWeeksBtn').addEventListener('click', () => this.shiftWeeks());
    }

    // Charger les listes de la mémoire de l'iPad
    loadFromStorage() {
        const savedCurrent = localStorage.getItem('kelly_current_week');
        const savedPrev = localStorage.getItem('kelly_prev_week');
        
        if (savedCurrent) {
            document.getElementById('currentWeekText').value = savedCurrent;
            this.processCurrentText(false); // Parse sans forcer l'alerte
        }
        if (savedPrev) {
            document.getElementById('previousWeekText').value = savedPrev;
            this.processPreviousText(false);
        }
    }

    // Basculer la semaine : l'actuelle devient l'ancienne
    shiftWeeks() {
        if (!confirm("Attention : Les tickers actuels vont basculer dans 'Semaine Dernière' et la case actuelle sera vidée. Confirmer ?")) return;
        
        const currentText = document.getElementById('currentWeekText').value;
        document.getElementById('previousWeekText').value = currentText;
        document.getElementById('currentWeekText').value = "";
        
        this.processPreviousText();
        this.processCurrentText();
        this.saveToStorage();
    }

    saveToStorage() {
        localStorage.setItem('kelly_current_week', document.getElementById('currentWeekText').value);
        localStorage.setItem('kelly_prev_week', document.getElementById('previousWeekText').value);
    }

    parseText(text) {
        // Accepte les sauts de lignes, virgules, ou espaces comme séparateurs
        if (!text.trim()) return [];
        return [...new Set(text.toUpperCase().split(/[\n,\s]+/).filter(t => t.trim().length > 0))];
    }

    processCurrentText(showAlert = true) {
        const text = document.getElementById('currentWeekText').value;
        this.currentWeekTickers = this.parseText(text);
        
        document.getElementById('currentCount').textContent = this.currentWeekTickers.length;
        document.getElementById('totalPositions').value = this.currentWeekTickers.length;
        
        if (showAlert) this.showStatus('currentWeekStatus', `✅ ${this.currentWeekTickers.length} lus`, 'success');
        
        this.saveToStorage();
        this.calculateRebalance();
    }

    processPreviousText(showAlert = true) {
        const text = document.getElementById('previousWeekText').value;
        this.previousWeekTickers = this.parseText(text);
        
        document.getElementById('prevCount').textContent = this.previousWeekTickers.length;
        
        if (showAlert) this.showStatus('previousWeekStatus', `✅ ${this.previousWeekTickers.length} lus`, 'success');
        
        this.saveToStorage();
        this.calculateRebalance();
    }

    calculateRebalance() {
        this.buyPositions = this.currentWeekTickers.filter(t => !this.previousWeekTickers.includes(t));
        this.sellPositions = this.previousWeekTickers.filter(t => !this.currentWeekTickers.includes(t));
        
        this.displayRebalanceResults();
    }

    displayRebalanceResults() {
        document.getElementById('buyCount').textContent = this.buyPositions.length;
        document.getElementById('sellCount').textContent = this.sellPositions.length;
        
        const buyList = document.getElementById('buyList');
        const sellList = document.getElementById('sellList');
        buyList.innerHTML = '';
        sellList.innerHTML = '';
        
        this.buyPositions.forEach(t => buyList.innerHTML += `<span class="ticker-item">${t}</span>`);
        this.sellPositions.forEach(t => sellList.innerHTML += `<span class="ticker-item">${t}</span>`);
        
        document.getElementById('buyPositionsDisplay').classList.remove('hidden');
        document.getElementById('sellPositionsDisplay').classList.remove('hidden');
        
        const status = document.getElementById('rebalanceStatus');
        status.textContent = `Achat: ${this.buyPositions.length} | Vente: ${this.sellPositions.length}`;
        status.className = 'status success';
        status.classList.remove('hidden');
    }

    calculateKelly() {
        const capital = parseFloat(document.getElementById('capitalActuel').value);
        const kelly = parseFloat(document.getElementById('kellyOptimal').value) / 100;
        const positions = parseInt(document.getElementById('totalPositions').value);
        
        if (isNaN(capital) || isNaN(kelly) || positions <= 0) {
            alert("Vérifiez les paramètres. Le nombre de positions doit être supérieur à 0 (Validez la liste).");
            return;
        }

        const capitalActions = capital * kelly;
        const targetPerPosition = capitalActions / positions;
        const liquidites = capital - capitalActions;

        document.getElementById('capitalExposeUsd').textContent = `$${Math.round(capitalActions).toLocaleString('en-US')}`;
        document.getElementById('positionUsdResult').textContent = `$${Math.round(targetPerPosition).toLocaleString('en-US')}`;
        document.getElementById('liquiditesResult').textContent = `$${Math.round(liquidites).toLocaleString('en-US')}`;
        
        document.getElementById('results').classList.remove('hidden');
    }

    showStatus(id, msg, type) {
        const el = document.getElementById(id);
        el.textContent = msg;
        el.className = `status ${type}`;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 3000);
    }

    clearAll() {
        if (!confirm('Tout effacer ? (La sauvegarde sera perdue)')) return;
        document.getElementById('currentWeekText').value = '';
        document.getElementById('previousWeekText').value = '';
        this.processCurrentText(false);
        this.processPreviousText(false);
        document.getElementById('results').classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => new KellyManagerFast());
