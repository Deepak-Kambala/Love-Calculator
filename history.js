// history.js - Love Calculator History System

/* ============================
   HISTORY MANAGER CLASS
   ============================ */
class HistoryManager {
    constructor() {
        this.storageKey = 'loveCalculatorHistory';
        this.maxHistoryItems = 50;
    }

    getHistory() {
        try {
            const history = localStorage.getItem(this.storageKey);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error reading history:', error);
            return [];
        }
    }

    addToHistory(name1, name2, percentage, mood, description) {
        try {
            const history = this.getHistory();
            const newEntry = {
                id: Date.now(),
                name1,
                name2,
                percentage,
                mood,
                description,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleString()
            };
            history.unshift(newEntry);
            localStorage.setItem(this.storageKey, JSON.stringify(history.slice(0, this.maxHistoryItems)));
            return true;
        } catch (error) {
            console.error('Error adding to history:', error);
            return false;
        }
    }

    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }

    deleteHistoryItem(id) {
        try {
            const history = this.getHistory();
            const filtered = history.filter(item => item.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting history item:', error);
            return false;
        }
    }

    exportAsPDF() {
        const history = this.getHistory();
        if (!history.length) {
            if (typeof showToast === 'function') showToast('No history to export!');
            return;
        }

        let pdfContent = 'LOVE CALCULATOR HISTORY\n\n' + '='.repeat(50) + '\n\n';
        history.forEach((item, i) => {
            pdfContent += `${i + 1}. ${item.name1} ❤️ ${item.name2}\n`;
            pdfContent += `Score: ${item.percentage}%\nMood: ${item.mood}\nDate: ${item.date}\n${item.description}\n`;
            pdfContent += '-'.repeat(50) + '\n\n';
        });

        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `love-calculator-history-${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

/* ============================
   RENDER HISTORY LIST
   ============================ */
function renderHistoryList(historyManager) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const history = historyManager.getHistory();
    if (!history.length) {
        historyList.innerHTML = `
            <div style="text-align:center;padding:2rem;color:var(--muted)">
                <p style="font-size:3rem;margin-bottom:1rem;">📜</p>
                <p>No calculations yet!</p>
                <p style="font-size:0.9rem;margin-top:0.5rem;">Your love compatibility history will appear here.</p>
            </div>
        `;
        return;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}" style="
            background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
            border: 1px solid rgba(255,255,255,0.08);
            border-radius:12px;padding:1rem;margin-bottom:1rem;cursor:pointer;
        ">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;flex:1;">
                    <span style="font-weight:600;color:#fff;">${escapeHtml(item.name1)}</span>
                    <span style="color:var(--accent1);font-size:1.2rem;">❤️</span>
                    <span style="font-weight:600;color:#fff;">${escapeHtml(item.name2)}</span>
                </div>
                <button class="delete-history-item" data-id="${item.id}" title="Delete">🗑️</button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                <div style="background:linear-gradient(90deg,var(--accent1),var(--accent2));padding:0.3rem 0.8rem;border-radius:8px;font-weight:700;font-size:1.1rem;">
                    ${item.percentage}%
                </div>
                <div style="color:var(--muted);font-size:0.85rem;">${item.mood}</div>
            </div>
            <div style="color:var(--muted);font-size:0.9rem;margin-bottom:0.3rem;">${escapeHtml(item.description)}</div>
            <div style="color:rgba(255,255,255,0.4);font-size:0.75rem;">${item.date}</div>
        </div>
    `).join('');

    // Delete buttons
    document.querySelectorAll('.delete-history-item').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (confirm('Delete this entry?')) {
                historyManager.deleteHistoryItem(id);
                renderHistoryList(historyManager);
                if (typeof showToast === 'function') showToast('Entry deleted!');
            }
        });
    });

    // Click to load history item
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', e => {
            if (e.target.classList.contains('delete-history-item')) return;
            const id = parseInt(item.dataset.id);
            const historyItem = history.find(h => h.id === id);
            if (historyItem && typeof window.loadHistoryItem === 'function') {
                window.loadHistoryItem(historyItem);
                closeHistoryPopup();
            }
        });
    });
}

/* ============================
   LOAD HISTORY ITEM INTO MAIN FORM
   ============================ */
function loadHistoryItem(item) {
    const name1El = document.getElementById('name1');
    const name2El = document.getElementById('name2');
    if (name1El && name2El) {
        name1El.value = item.name1;
        name2El.value = item.name2;
    }

    if (typeof window.animateRingTo === 'function') window.animateRingTo(item.percentage);

    const heading = document.getElementById('heading');
    const description = document.getElementById('description');
    if (heading) heading.textContent = `${item.name1} + ${item.name2}`;
    if (description) description.textContent = item.description;

    if (typeof window.getMoodForPercent === 'function' && typeof window.applyMoodTheme === 'function') {
        const mood = window.getMoodForPercent(item.percentage);
        window.applyMoodTheme(mood);
    }

    if (typeof window.getRandomTipForMood === 'function' && typeof window.showLoveOracle === 'function') {
        const mood = window.getMoodForPercent(item.percentage);
        const tip = window.getRandomTipForMood(mood.label.toLowerCase());
        window.showLoveOracle(tip);
    }

    if (typeof window.confettiEnabled !== 'undefined' && window.confettiEnabled && typeof window.triggerCelebration === 'function') {
        window.triggerCelebration(item.percentage);
    }

    if (typeof showToast === 'function') showToast('Loaded from history!');
}

/* ============================
   HISTORY POPUP
   ============================ */
function openHistoryPopup(historyManager) {
    const overlay = document.getElementById('historyPopupOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        renderHistoryList(historyManager);
    }
}
function closeHistoryPopup() {
    const overlay = document.getElementById('historyPopupOverlay');
    if (overlay) overlay.classList.add('hidden');
}

/* ============================
   INITIALIZE HISTORY SYSTEM
   ============================ */
function initializeHistorySystem() {
    const historyManager = new HistoryManager();

    const historyBtn = document.getElementById('historyBtn');
    const openHistoryBtn = document.getElementById('openHistory');
    const closeHistoryPopupBtn = document.getElementById('closeHistoryPopup');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    const historyPopupOverlay = document.getElementById('historyPopupOverlay');

    if (historyBtn) historyBtn.addEventListener('click', () => openHistoryPopup(historyManager));
    if (openHistoryBtn) openHistoryBtn.addEventListener('click', () => openHistoryPopup(historyManager));
    if (closeHistoryPopupBtn) closeHistoryPopupBtn.addEventListener('click', closeHistoryPopup);

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (!window.historyManager) return;
            if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                window.historyManager.clearHistory();
                renderHistoryList(window.historyManager);
                if (typeof showToast === 'function') showToast('History cleared!');
            }
        });
    }

    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', () => {
            historyManager.exportAsPDF();
            if (typeof showToast === 'function') showToast('History exported!');
        });
    }

    if (historyPopupOverlay) {
        historyPopupOverlay.addEventListener('click', e => {
            if (e.target === historyPopupOverlay) closeHistoryPopup();
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && historyPopupOverlay && !historyPopupOverlay.classList.contains('hidden')) {
            closeHistoryPopup();
        }
    });

    injectHistoryStyles();

    window.historyManager = historyManager;
    window.loadHistoryItem = loadHistoryItem;
}

/* ============================
   INJECT DYNAMIC STYLES
   ============================ */
function injectHistoryStyles() {
    if (document.getElementById('history-dynamic-styles')) return;

    const style = document.createElement('style');
    style.id = 'history-dynamic-styles';
    style.textContent = `
        .history-popup-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px; }
        .history-popup { background:linear-gradient(180deg,rgba(20,20,40,0.98),rgba(10,10,20,0.98));border-radius:16px;max-width:700px;width:100%;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.1);}
        .history-popup-header {display:flex;align-items:center;justify-content:space-between;padding:1.5rem;border-bottom:1px solid rgba(255,255,255,0.08);background:linear-gradient(135deg,#ff7a7a 0%,#ff2e63 100%);}
        .history-popup-header h3 {margin:0;font-size:1.5rem;font-weight:700;color:white;}
        .history-popup-content {padding:1.5rem;overflow-y:auto;flex:1;}
        .history-actions {display:flex;gap:1rem;padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.2);}
        .history-actions button {flex:1;padding:0.75rem;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.2s ease;}
    `;
    document.head.appendChild(style);
}

/* ============================
   AUTO-INIT
   ============================ */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHistorySystem);
} else {
    initializeHistorySystem();
}
