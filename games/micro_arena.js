/**
 * Micro Arena Game Module
 * 微觀競技場
 */

class MicroArenaGame {
    constructor(app) {
        this.app = app;
        this.fighters = [
            { id: 'imp', name: '小惡魔 (Imp)', die: 4, odds: 30, icon: 'fa-dragon text-green-400' }, // Using fa-dragon as generic monster
            { id: 'dwarf', name: '矮人 (Dwarf)', die: 6, odds: 15, icon: 'fa-hammer text-gray-400' },
            { id: 'human', name: '人類 (Human)', die: 8, odds: 10, icon: 'fa-user text-blue-400' },
            { id: 'giant', name: '巨人 (Giant)', die: 10, odds: 5, icon: 'fa-hand-back-fist text-orange-400' },
            { id: 'dragon', name: '龍 (Dragon)', die: 12, odds: 3, icon: 'fa-dragon text-red-500' },
        ];
        this.selectedFighter = null;
        this.betAmount = 0;
        this.isFighting = false;
    }

    render() {
        return `
                <!-- Game Arena Display -->
                <div id="arena-stage" class="w-full h-48 bg-gray-900/50 rounded-2xl border border-gray-700 flex items-end justify-around pb-4 mb-6 relative overflow-hidden shadow-inner">
                    <!-- Fighters injected here -->
                </div>

                <!-- Betting Controls -->
                <div class="w-full grid grid-cols-5 gap-2 mb-6">
                    ${this.fighters.map(f => `
                        <button onclick="window.gameInstance.selectFighter('${f.id}')" id="btn-${f.id}" class="fighter-btn p-2 bg-gray-800 border-2 border-gray-700 rounded-xl hover:bg-gray-700 transition-all flex flex-col items-center gap-1 group">
                             <i class="fa-solid ${f.icon} text-2xl group-hover:scale-110 transition-transform"></i>
                             <div class="text-center">
                                 <div class="font-bold text-xs text-white">${f.name}</div>
                                 <div class="text-[10px] text-yellow-500">1 : ${f.odds}</div>
                                 <div class="text-[10px] text-gray-500">D${f.die}</div>
                             </div>
                        </button>
                    `).join('')}
                </div>

                <!-- Action Bar -->
                <div class="bg-gray-800 p-4 rounded-xl flex flex-col md:flex-row items-center gap-6 border border-gray-700 w-full justify-between relative z-20">
                    <div>
                        <label class="text-xs text-gray-500 block">下注金額</label>
                        <input id="bet-input" type="number" min="1" value="1" class="bg-gray-900 border border-gray-600 rounded text-white px-3 py-1 w-24 text-center">
                    </div>
                    
                    <div class="flex-1 text-center">
                        <span id="selection-display" class="text-gray-400 text-sm">請選擇鬥士...</span>
                    </div>

                    <button onclick="window.gameInstance.fight()" class="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                        <i class="fa-solid fa-gavel mr-2"></i>戰鬥開始 (FIGHT)
                    </button>
                </div>
                
                <div id="arena-message" class="h-12 flex items-center justify-center font-bold text-xl mt-4"></div>
            </div>
        `;
    }

    setup() {
        window.gameInstance = this;
        // Initial render of fighters in the "Arena"
        this.resetArena();
    }

    resetArena() {
        const stage = document.getElementById('arena-stage');
        stage.innerHTML = this.fighters.map(f => `
            <div id="fighter-${f.id}" class="flex flex-col items-center gap-2 transition-all duration-500 transform translate-y-0">
                <div class="text-gray-500 text-xs opacity-0 result-val text-center font-bold mb-1">0</div>
                <i class="fa-solid ${f.icon} text-4xl p-2 rounded-full bg-gray-800 border border-gray-600 shadow-lg relative z-10"></i>
                <div class="w-8 h-1 bg-black/50 rounded-full blur-[2px]"></div>
            </div>
         `).join('') + '<div class="absolute inset-x-0 bottom-0 h-1 bg-gray-700"></div>';
    }

    selectFighter(id) {
        if (this.isFighting) return;
        this.selectedFighter = id;

        document.querySelectorAll('.fighter-btn').forEach(btn => {
            btn.classList.remove('border-red-500', 'bg-red-900/20');
            btn.classList.add('border-gray-700', 'bg-gray-800');
        });

        const btn = document.getElementById(`btn-${id}`);
        btn.classList.remove('border-gray-700', 'bg-gray-800');
        btn.classList.add('border-red-500', 'bg-red-900/20');

        const fighter = this.fighters.find(f => f.id === id);
        document.getElementById('selection-display').innerHTML = `已選擇: <span class="text-white font-bold">${fighter.name}</span> (賠率 1:${fighter.odds})`;
    }

    async fight() {
        if (this.isFighting) return;

        const betInput = document.getElementById('bet-input');
        const amount = parseInt(betInput.value);

        if (!this.selectedFighter) {
            this.showMessage("請先選擇鬥士！", "text-yellow-500");
            return;
        }

        if (isNaN(amount) || amount < 1) {
            this.showMessage("請輸入有效下注金額！", "text-red-500");
            return;
        }

        if (this.app.gameState.leaves < amount) {
            this.showMessage("刃藤葉不足！", "text-red-500");
            return;
        }

        // Deduct bet
        this.app.gameState.leaves -= amount;
        this.app.updateStatsUI();
        this.betAmount = amount;

        this.isFighting = true;
        this.showMessage("戰鬥開始！", "text-red-400 animate-pulse");

        // Animation
        this.resetArena();
        const fightersEls = document.querySelectorAll('#arena-stage > div[id^="fighter-"]');

        // Shake animation + Number shuffle
        fightersEls.forEach(el => el.classList.add('animate-bounce'));

        const startTime = Date.now();
        while (Date.now() - startTime < 1500) {
            this.fighters.forEach(f => {
                const tempRoll = Math.ceil(Math.random() * f.die);
                const el = document.getElementById(`fighter-${f.id}`).querySelector('.result-val');
                el.innerText = tempRoll;
                el.classList.remove('opacity-0');
            });
            await new Promise(r => setTimeout(r, 100));
        }

        // Roll stats
        const results = this.fighters.map(f => {
            return {
                ...f,
                roll: Math.ceil(Math.random() * f.die)
            };
        });

        // GM Override
        const gmPanel = document.querySelectorAll('.gm-input');
        if (this.app.gameState.gmMode && gmPanel[0].value) {
            // Force winner index 1-5? Or force rolls? 
            // Lets implement as: GM inputs 5 numbers for the 5 fighters
            // Not enough inputs. Simple override: Force winner if name matches?
            // Or just ignore for now to keep simple.
        }

        // Display results
        fightersEls.forEach(el => el.classList.remove('animate-bounce'));

        results.forEach(r => {
            const el = document.getElementById(`fighter-${r.id}`);
            const valEl = el.querySelector('.result-val');
            valEl.innerText = r.roll;
            valEl.classList.remove('opacity-0');
            valEl.classList.add('text-2xl', 'text-white', '-translate-y-4');

            // Visual height based on roll?
            // el.style.transform = `translateY(-${r.roll * 5}px)`; 
        });

        // Determine Winner (Highest Roll)
        const maxRoll = Math.max(...results.map(r => r.roll));
        let winners = results.filter(r => r.roll === maxRoll);

        // Tie-breaker: Highest Odds Wins (Rule Update)
        if (winners.length > 1) {
            winners.sort((a, b) => b.odds - a.odds);
            // Winner is now top sorted
            const w = winners[0];
            winners = [w]; // Reduce to single winner
            this.showMessage(`平手判定：賠率較高者勝出! (${w.name})`, "text-yellow-400");
            await new Promise(r => setTimeout(r, 1500));
        }

        const winner = winners[0];

        // Highlight winners
        const el = document.querySelector(`#fighter-${winner.id} i`);
        el.classList.add('text-yellow-400', 'scale-125', 'border-yellow-500', 'shadow-[0_0_20px_gold]');

        // Check if player won
        const playerWon = (winner.id === this.selectedFighter);
        const myFighter = results.find(r => r.id === this.selectedFighter);

        let msg = `最高點數: ${maxRoll} (${winner.name}). `;

        if (playerWon) {
            const profit = this.betAmount * myFighter.odds;
            const totalReturn = this.betAmount + profit;
            this.app.gameState.leaves += totalReturn;
            this.app.updateStatsUI();
            msg += `你贏了！獲得 ${totalReturn} 刃藤！`;
            this.showMessage(msg, "text-fw-neon");
        } else {
            msg += `你輸了... (你的點數: ${myFighter.roll})`;
            this.showMessage(msg, "text-red-500");
        }

        this.isFighting = false;
    }

    showMessage(msg, color) {
        const el = document.getElementById('arena-message');
        el.className = `h-12 flex items-center justify-center font-bold text-xl ${color}`;
        el.innerText = msg;
    }
}
