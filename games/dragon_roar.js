/**
 * Dragon Roar Dice Game Module
 * 龍吼骰
 */

class DragonRoarGame {
    constructor(app) {
        this.app = app;
        this.state = {
            phase: 'betting', // betting, attack (come-out), hunt (point)
            point: null, // The "Scale" (Reverse Scale) point
            bet: 0,
            betType: 'slayer', // 'slayer' (Pass) or 'curse' (Don't Pass)
            history: []
        };
    }

    render() {
        return `
            <div data-game-id="dragon-roar" class="p-6 relative min-h-full flex flex-col items-center font-sans text-gray-100" style="background-image: url('assets/bg_dragon_table.png'); background-size: cover; background-position: center;">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-md z-0"></div>
                
                <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mb-6 relative z-10 font-[Cinzel] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    龍吼骰
                </h2>
                <p class="text-gray-400 text-sm relative z-10">屠龍者的盛宴：擊碎逆鱗，或是被龍焰吞噬。</p>

                <!-- Game Status Display -->
                <div class="w-full bg-gray-900 border-2 border-orange-900/50 rounded-xl p-8 text-center relative overflow-hidden z-20">
                    <!-- Background Effect -->
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    
                    <div id="dragon-status" class="relative z-30">
                        <div class="text-gray-500 text-lg uppercase tracking-widest mb-2" id="phase-label">準備階段</div>
                        
                        <div class="flex items-center justify-center gap-6 my-4">
                             <div id="die-1" class="w-16 h-16 bg-red-800 rounded-lg flex items-center justify-center text-4xl text-white shadow-lg border border-red-600">
                                <i class="fa-solid fa-dice-one"></i>
                             </div>
                             <div id="die-2" class="w-16 h-16 bg-red-800 rounded-lg flex items-center justify-center text-4xl text-white shadow-lg border border-red-600">
                                <i class="fa-solid fa-dice-one"></i>
                             </div>
                        </div>

                        <div id="point-indicator" class="hidden mt-4 bg-black/50 p-2 rounded border border-orange-500/50">
                             <span class="text-orange-300 text-sm block font-bold uppercase tracking-wider">目前的逆鱗點 (POINT)</span>
                             <span id="point-val" class="text-5xl font-black text-white drop-shadow-[0_0_15px_red]">8</span>
                             <div class="text-xs text-gray-400 mt-1">再次擲出此點數即勝利 (7 則落敗)</div>
                        </div>
                    </div>
                </div>

                <!-- Action / Betting Controls -->
                <div class="w-full max-w-lg bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl relative z-30 mt-6">
                    
                    <!-- Betting Phase -->
                    <div id="bet-area" class="space-y-4">
                        <div class="flex justify-between items-center text-sm text-gray-400 mb-2">
                            <span>下注金額:</span>
                            <input id="dragon-bet" type="number" min="1" value="10" class="bg-gray-900 border border-gray-600 rounded text-white px-3 py-1 w-24 text-center">
                        </div>
                        
                        <div class="grid grid-cols-1 gap-4">
                            <button onclick="window.gameInstance.placeBet('slayer')" class="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded shadow-lg uppercase tracking-wider relative overflow-hidden group">
                                <span class="relative z-10"><i class="fa-solid fa-shield-halved mr-2"></i>支持屠龍者 (Bet on Slayer)</span>
                                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                            </button>
                            
                            <!-- Curse Option revealed -->
                            <button id="curse-btn" onclick="window.gameInstance.placeBet('curse')" class="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 border border-purple-900 text-purple-400 font-bold rounded shadow-lg uppercase tracking-wider hover:text-purple-300">
                                <i class="fa-solid fa-dragon mr-2"></i>詛咒屠龍者 (Bet on Dragon)
                            </button>
                        </div>
                    </div>

                    <!-- Rolling Phase -->
                    <div id="roll-area" class="hidden text-center">
                         <div class="text-white font-bold text-lg mb-4">
                            已下注: <span id="current-bet-display" class="text-yellow-400">0</span> 
                            <span id="bet-type-display" class="text-xs px-2 py-1 rounded bg-gray-700 ml-2"></span>
                         </div>
                         <button onclick="window.gameInstance.roll()" class="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-[0_5px_0_rgb(153,27,27)] active:shadow-none active:translate-y-[5px] transition-all text-xl">
                            <i class="fa-solid fa-dice mr-2"></i>擲骰 (ROLL)
                         </button>
                    </div>

                </div>
                
                <div id="dragon-message" class="h-16 flex items-center justify-center font-bold text-xl text-center px-4 relative z-40 mt-4"></div>
            </div>
        `;
    }

    setup() {
        window.gameInstance = this;
        this.reset();
    }

    reset() {
        this.state = {
            phase: 'betting',
            point: null,
            bet: 0,
            betType: 'slayer'
        };
        this.updateUI();
        this.showMessage("");
    }

    toggleCurse() {
        // Simple toggle for now. In full RPG this might require a check.
        const btn = document.getElementById('curse-btn');
        btn.classList.toggle('hidden');
    }

    updateUI() {
        const betArea = document.getElementById('bet-area');
        const rollArea = document.getElementById('roll-area');
        const phaseLabel = document.getElementById('phase-label');
        const pointIndicator = document.getElementById('point-indicator');
        const pointVal = document.getElementById('point-val');

        if (this.state.phase === 'betting') {
            betArea.classList.remove('hidden');
            rollArea.classList.add('hidden');
            phaseLabel.innerText = "準備階段 (Preparation)";
            pointIndicator.classList.add('hidden');
        } else {
            betArea.classList.add('hidden');
            rollArea.classList.remove('hidden');
            document.getElementById('current-bet-display').innerText = this.state.bet;

            const betTypeParams = this.state.betType === 'slayer'
                ? { text: "屠龍者", color: "text-orange-400" }
                : { text: "惡龍 (詛咒)", color: "text-purple-400" };
            const typeDisplay = document.getElementById('bet-type-display');
            typeDisplay.innerText = betTypeParams.text;
            typeDisplay.className = `text-xs px-2 py-1 rounded bg-gray-700 ml-2 ${betTypeParams.color}`;

            if (this.state.phase === 'attack') {
                phaseLabel.innerText = "第一階段：出擊 (ATTACK)";
                phaseLabel.className = "text-orange-500 text-lg uppercase tracking-widest mb-2 font-bold animate-pulse";
            } else if (this.state.phase === 'hunt') {
                phaseLabel.innerText = "第二階段：狩獵 (HUNT)";
                phaseLabel.className = "text-red-500 text-lg uppercase tracking-widest mb-2 font-bold animate-pulse";
                pointIndicator.classList.remove('hidden');
                pointVal.innerText = this.state.point;
            }
        }
    }

    placeBet(type) {
        const input = document.getElementById('dragon-bet');
        const amount = parseInt(input.value);

        if (isNaN(amount) || amount < 1) {
            this.showMessage("請輸入有效金額！", "text-red-500");
            return;
        }
        if (this.app.gameState.leaves < amount) {
            this.showMessage("刃藤葉不足！", "text-red-500");
            return;
        }

        this.app.gameState.leaves -= amount;
        this.app.updateStatsUI();

        this.state.bet = amount;
        this.state.betType = type;
        this.state.phase = 'attack';
        this.updateUI();
        this.showMessage("下注完成！擲骰發起攻擊！", "text-gray-300");
    }

    async roll() {
        // Animation
        const diceConfig = [
            document.getElementById('die-1'),
            document.getElementById('die-2')
        ];

        let d1, d2;

        // Spin animation
        for (let i = 0; i < 10; i++) {
            d1 = Math.ceil(Math.random() * 6);
            d2 = Math.ceil(Math.random() * 6);
            diceConfig[0].innerHTML = `<i class="fa-solid fa-dice-${['one', 'two', 'three', 'four', 'five', 'six'][d1 - 1]}"></i>`;
            diceConfig[1].innerHTML = `<i class="fa-solid fa-dice-${['one', 'two', 'three', 'four', 'five', 'six'][d2 - 1]}"></i>`;
            await new Promise(r => setTimeout(r, 50 + i * 10));
        }

        const total = d1 + d2;

        // GM Override
        const gmPanel = document.querySelectorAll('.gm-input');
        if (this.app.gameState.gmMode && gmPanel[0].value) {
            // Not easily mapping single inputs to 2 dice without logic, assume Total?
            // Or inputs d1, d2.
            if (gmPanel[0].value) d1 = parseInt(gmPanel[0].value);
            if (gmPanel[1].value) d2 = parseInt(gmPanel[1].value);
            gmPanel[0].value = '';
            gmPanel[1].value = '';
        }

        // Update Final Visual
        diceConfig[0].innerHTML = `<i class="fa-solid fa-dice-${['one', 'two', 'three', 'four', 'five', 'six'][d1 - 1]}"></i>`;
        diceConfig[1].innerHTML = `<i class="fa-solid fa-dice-${['one', 'two', 'three', 'four', 'five', 'six'][d2 - 1]}"></i>`;

        this.resolve(d1 + d2);
    }

    resolve(roll) {
        if (this.state.phase === 'attack') { // Come-Out Roll
            // 7, 11 -> Win (Slayer)
            if (roll === 7 || roll === 11) {
                this.handleWin(true, "屠龍一擊 (Critical Hit)!");
            }
            // 2, 3, 12 -> Lose (Slayer Miss)
            else if (roll === 2 || roll === 3 || roll === 12) {
                this.handleWin(false, "手滑失誤 (Miss)!");
            }
            // Point
            else { // 4, 5, 6, 8, 9, 10
                this.state.point = roll;
                this.state.phase = 'hunt';
                this.updateUI();
                this.showMessage(`射中逆鱗！點數為 ${roll}。進入狩獵階段！`, "text-yellow-400");
            }
        }
        else if (this.state.phase === 'hunt') {
            // Hit Point -> Win
            if (roll === this.state.point) {
                this.handleWin(true, "屠龍成功 (Slaid the Dragon)!");
            }
            // 7 -> Lose (Seven Out)
            else if (roll === 7) {
                this.handleWin(false, "狂怒之焰 (Dragon's Breath)!");
            }
            // Else -> Continue
            else {
                this.showMessage(`擲出 ${roll}。繼續狩獵...目標: ${this.state.point}`, "text-gray-400");
            }
        }
    }

    handleWin(slayerWon, reason) {
        let playerWins = false;

        if (this.state.betType === 'slayer') {
            playerWins = slayerWon;
        } else {
            // Player is Curse (Dragon)
            playerWins = !slayerWon;
        }

        let msg = `${reason} `;
        if (playerWins) {
            // Payout 1:3 per user request
            // Interpreting as: Get back bet + 3x Bet profit? Or Total payout is 3x Bet? 
            // "1:3" usually means pays 3 to 1. 
            // So if bet 10, win 30 profit = 40 return.
            const winAmount = this.state.bet + (this.state.bet * 3);
            this.app.gameState.leaves += winAmount;
            this.app.updateStatsUI();
            msg += `你贏了！獲得 ${winAmount} 刃藤！`;
            this.showMessage(msg, "text-fw-neon");
        } else {
            msg += "你輸了...";
            this.showMessage(msg, "text-red-500");

            // HP Loss Logic
            // Phase 1 (Attack): 1D4. Phase 2 (Hunt): 2D6 (Rule 144/148).
            let damage = 0;
            let damageText = "";

            if (this.state.phase === 'attack') {
                damage = Math.ceil(Math.random() * 4); // 1d4
                damageText = "1D4";
            } else {
                damage = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6); // 2d6
                damageText = "2D6";
            }

            this.app.gameState.hp = Math.max(0, this.app.gameState.hp - damage);
            this.app.updateStatsUI();
            msg += ` (-${damage} HP [${damageText}])`;
        }

        // Reset
        this.state.phase = 'betting';
        setTimeout(() => this.reset(), 3000);
    }

    showMessage(msg, color) {
        // Create or get the overlay container
        let overlay = document.getElementById('dragon-message-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dragon-message-overlay';
            overlay.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] text-center pointer-events-none w-full pointer-events-none';
            // Append to body or game container to ensure it's on top of everything
            // Since game is rendered inside a container, appending to that container is safest if we can find it, 
            // but fixed positioning works relative to viewport usually.
            // Let's rely on Fixed positioning.
            document.body.appendChild(overlay);
        }

        // We also need to update the existing in-layout element if we want to keep it, 
        // but the request is to fix visibility. Let's make a new overlay element or repurpose the existing one if possible.
        // Actually, the existing one is inside the relative container. Let's redirect logic to use a new fixed overlay.

        // Remove old timeout if exists
        if (this._msgTimeout) clearTimeout(this._msgTimeout);

        const content = document.createElement('div');
        content.className = `inline-block px-8 py-4 rounded-xl bg-black/90 border-2 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md text-2xl font-bold ${color} animate-bounce`;
        content.innerText = msg;

        overlay.innerHTML = '';
        overlay.appendChild(content);

        // Auto hide after some time or keep it? 
        // Some messages are persistent like "Betting Phase". 
        // But showMessage is used for events.
        // Let's keep it for 3 seconds unless overwritten.

        this._msgTimeout = setTimeout(() => {
            overlay.innerHTML = '';
        }, 3000);
    }
}
