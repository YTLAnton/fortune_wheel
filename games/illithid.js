/**
 * Illithid's Desire Game Module
 * 靈吸怪的慾望
 */

class IllithidGame {
    constructor(app) {
        this.app = app;
        this.state = {
            phase: 'betting', // betting, player-turn, dealer-turn, result
            playerHand: [],
            dealerHand: [],
            bet: 0
        };
    }

    render() {
        return `
            <div data-game-id="illithid" class="p-6 relative min-h-full flex flex-col items-center font-sans text-gray-100" style="background-image: url('assets/bg_illithid.png'); background-size: cover; background-position: center;">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-md z-0"></div>

                <!-- Dealer Portrait -->
                <div class="relative z-10 w-full max-w-4xl flex items-center gap-6 mb-8 bg-purple-900/20 p-4 rounded-xl border border-purple-500/30 sigil-frame">
                    <img src="assets/portrait_mindflayer.png" class="w-24 h-24 rounded-full border-2 border-purple-500 shadow-[0_0_15px_purple] object-cover">
                    <div class="flex-1">
                        <h2 class="text-3xl font-bold text-purple-400 font-[Cinzel] tracking-wider">靈吸怪的慾望</h2>
                        <p class="text-purple-200/70 italic text-sm">"渴望...計算...20是完美的極限..."</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-purple-300 uppercase tracking-widest">Dealer Status</div>
                        <div id="dealer-status-text" class="text-lg font-bold text-purple-100">Waiting</div>
                    </div>
                </div>

                <div class="flex flex-col items-center gap-8 w-full max-w-4xl relative z-10">
                <!-- Dealer Area -->
                <div class="bg-gray-900 border border-purple-900/50 rounded-xl p-6 w-full max-w-2xl text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-20">
                         <i class="fa-solid fa-skull-crossbones text-6xl text-purple-900"></i>
                    </div>
                    
                    <h3 class="text-xl font-bold text-purple-400 mb-4">荷官 (Dealer)</h3>
                    <div id="dealer-hand" class="flex justify-center gap-4 min-h-[60px]">
                         <!-- Cards/Dice -->
                         <div class="w-12 h-16 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-gray-600">?</div>
                         <div class="w-12 h-16 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-gray-600">?</div>
                    </div>
                    <div id="dealer-score" class="text-sm text-gray-500 mt-2 font-mono">Score: ?</div>
                </div>

                <!-- Player Area -->
                 <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl text-center shadow-lg">
                    <h3 class="text-xl font-bold text-blue-400 mb-4">你 (Player)</h3>
                    <div id="player-hand" class="flex justify-center gap-4 min-h-[60px]">
                         <div class="text-gray-500 py-4">等待下注...</div>
                    </div>
                    <div id="player-score" class="text-lg font-bold text-white mt-2 font-mono">Score: 0</div>
                </div>
                
                <!-- Controls -->
                <div class="w-full max-w-md space-y-4" id="controls-area">
                    <!-- Betting Phase -->
                    <div id="bet-controls" class="flex gap-4 justify-center">
                        <input id="illithid-bet" type="number" min="1" value="5" class="bg-gray-900 border border-gray-600 rounded text-white px-4 py-2 w-24 text-center">
                        <button onclick="window.gameInstance.deal()" class="px-8 py-2 bg-pink-700 hover:bg-pink-600 text-white font-bold rounded shadow-lg uppercase tracking-wider">
                            開始 (DEAL)
                        </button>
                    </div>

                    <!-- Action Phase -->
                    <div id="action-controls" class="hidden flex gap-4 justify-center">
                        <button onclick="window.gameInstance.hit()" class="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg flex items-center">
                            <i class="fa-solid fa-plus mr-2"></i> 加骰 (HIT)
                        </button>
                        <button onclick="window.gameInstance.stand()" class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg flex items-center">
                            <i class="fa-solid fa-hand mr-2"></i> 停手 (STAND)
                        </button>
                    </div>
                </div>

                <div id="illithid-message" class="h-12 flex items-center justify-center font-bold text-xl text-center"></div>
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
            playerHand: [],
            dealerHand: [],
            bet: 0
        };
        this.updateUI();
    }

    updateUI() {
        const betControls = document.getElementById('bet-controls');
        const actionControls = document.getElementById('action-controls');

        // Phase visibility
        if (this.state.phase === 'betting') {
            betControls.classList.remove('hidden');
            actionControls.classList.add('hidden');
        } else if (this.state.phase === 'player-turn') {
            betControls.classList.add('hidden');
            actionControls.classList.remove('hidden');
        } else {
            betControls.classList.add('hidden');
            actionControls.classList.add('hidden');
        }

        // Render Hands
        if (this.state.playerHand.length > 0) {
            this.renderHand('player-hand', this.state.playerHand);
            document.getElementById('player-score').innerText = `Score: ${this.sum(this.state.playerHand)}`;
        } else {
            document.getElementById('player-hand').innerHTML = '<div class="text-gray-500 py-4">等待下注...</div>';
            document.getElementById('player-score').innerText = 'Score: 0';
        }

        if (this.state.dealerHand.length > 0) {
            // Hide Dealer's first card if player turn? Rules say "Dealer keeps results in front".
            // Rule 126: "Dealer rolls 2d10 and keeps results". It implies visible?
            // Usually Blackjack hides one. But rules say "keep results in front". Let's show all for simplicity unless specified hidden.
            // Wait, standard BJ hides. But this is d10 dice game.
            // Let's hide 2nd die during player turn to add suspense, reveals on dealer turn?
            // "荷官擲2D10，並保留這兩顆點數結果在面前" -> usually public.
            // I'll show all.
            this.renderHand('dealer-hand', this.state.dealerHand);
            document.getElementById('dealer-score').innerText = `Score: ${this.sum(this.state.dealerHand)}`;
        } else {
            document.getElementById('dealer-hand').innerHTML = `
                <div class="w-12 h-16 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-gray-600">?</div>
                <div class="w-12 h-16 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-gray-600">?</div>
             `;
            document.getElementById('dealer-score').innerText = 'Score: ?';
        }
    }

    renderHand(containerId, hand) {
        document.getElementById(containerId).innerHTML = hand.map(val => `
            <div class="w-12 h-16 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-black font-bold text-xl shadow">
                ${val}
            </div>
        `).join('');
    }

    sum(hand) {
        return hand.reduce((a, b) => a + b, 0);
    }

    roll() {
        return Math.floor(Math.random() * 10) + 1;
    }

    async animateRoll(containerId, count) {
        const el = document.getElementById(containerId);
        const startTime = Date.now();
        while (Date.now() - startTime < 600) {
            let html = '';
            for (let i = 0; i < count; i++) {
                const rnd = Math.ceil(Math.random() * 10);
                html += `<div class="w-12 h-16 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-black font-bold text-xl shadow">${rnd}</div>`;
            }
            el.innerHTML = html;
            await new Promise(r => setTimeout(r, 60));
        }
    }

    async deal() {
        const betInput = document.getElementById('illithid-bet');
        const amount = parseInt(betInput.value);

        if (isNaN(amount) || amount < 1) {
            this.showMessage("請輸入有效下注金額", "text-red-500");
            return;
        }

        if (this.app.gameState.leaves < amount) {
            this.showMessage("刃藤葉不足！", "text-red-500");
            return;
        }

        this.app.gameState.leaves -= amount;
        this.app.updateStatsUI();
        this.state.bet = amount;

        // Roll Initial Hands (2d10 each) with Animation
        this.showMessage("擲骰中...", "text-blue-300 animate-pulse");
        await this.animateRoll('player-hand', 2);

        this.state.playerHand = [this.roll(), this.roll()];
        this.renderHand('player-hand', this.state.playerHand);
        document.getElementById('player-score').innerText = `Score: ${this.sum(this.state.playerHand)}`;

        // Dealer Initial (Simulated hidden roll or visible?)
        // Rules say dealer keeps results in front.
        await this.animateRoll('dealer-hand', 2);
        this.state.dealerHand = [this.roll(), this.roll()];

        // Check for Perfect Mind (Player 20)
        // Rule 134: "If player has 10+10=20, perfect mind."
        if (this.sum(this.state.playerHand) === 20) {
            this.handlePerfectMind();
            return;
        }

        this.state.phase = 'player-turn';
        this.showMessage("你的回合：加骰或停手？", "text-blue-400");
        this.updateUI();
    }

    async hit() {
        // Temp placeholder for new card
        const currentLen = this.state.playerHand.length;
        // Animation for the new single die? 
        // We need to re-render whole hand usually, but let's append a structural placeholder then animate it?
        // Simpler: Just animate the target container briefly.

        this.showMessage("加骰中...", "text-green-300");
        await this.animateRoll('player-hand', this.state.playerHand.length + 1); // Animate 'n+1' slots

        const val = this.roll();
        this.state.playerHand.push(val);
        this.updateUI();

        const score = this.sum(this.state.playerHand);
        if (score > 20) {
            this.handleBust('player');
        } else if (score === 20) {
            // Auto stand on 20? Player might want to stop anyway.
            this.showMessage("20 點！", "text-green-400");
        }
    }

    stand() {
        this.state.phase = 'dealer-turn';
        this.updateUI();
        this.runDealerTurn();
    }

    async runDealerTurn() {
        this.showMessage("荷官回合...", "text-purple-400");

        while (this.sum(this.state.dealerHand) < 17) {
            await new Promise(r => setTimeout(r, 500));
            // Animate next die
            await this.animateRoll('dealer-hand', this.state.dealerHand.length + 1);

            this.state.dealerHand.push(this.roll());
            this.updateUI();
        }

        const score = this.sum(this.state.dealerHand);
        if (score > 20) {
            this.handleBust('dealer');
        } else {
            this.determineWinner();
        }
    }

    handlePerfectMind() {
        // Rule 134: Win 5x, Full HP, Half HP Temp HP.
        const win = this.state.bet * 5;
        this.app.gameState.leaves += win;
        this.app.gameState.hp = 100; // Full Heal
        this.app.updateStatsUI();

        this.updateUI();
        this.showMessage(`福至心靈！完美 20 點！贏得 ${win} 刃藤並恢復生命！`, "text-fw-gold neon-text");
        this.endRound();
    }

    handleBust(who) {
        if (who === 'player') {
            // Rule 131: Lose bet, Lose HP = ceil(bet/2).
            const hpLoss = Math.ceil(this.state.bet / 2);
            this.app.gameState.hp = Math.max(0, this.app.gameState.hp - hpLoss);
            this.app.updateStatsUI();

            this.showMessage(`爆牌！(>20) 失去賭注與 ${hpLoss}% 生命。`, "text-red-500");
        } else {
            // Dealer Bust
            // Rule 132: Player gets 3x bet.
            const win = this.state.bet * 3;
            this.app.gameState.leaves += win;
            this.app.updateStatsUI();
            this.showMessage(`荷官爆牌！贏得 ${win} 刃藤！`, "text-fw-neon");
        }
        this.endRound();
    }

    determineWinner() {
        const pScore = this.sum(this.state.playerHand);
        const dScore = this.sum(this.state.dealerHand);

        let msg = `你: ${pScore} vs 荷官: ${dScore}. `;

        if (pScore > dScore) {
            // Rule 133: Player wins 3x.
            const win = this.state.bet * 3;
            this.app.gameState.leaves += win;
            this.app.updateStatsUI();
            this.showMessage(msg + `你贏了！獲得 ${win} 刃藤！`, "text-fw-neon");
        } else if (pScore === dScore) {
            // Rule: Tie returns x2 (Net +1)
            const win = this.state.bet * 2;
            this.app.gameState.leaves += win;
            this.app.updateStatsUI();
            this.showMessage(msg + `平手 (心靈同步)！獲得 ${win} 刃藤！`, "text-blue-400");
        } else {
            // Loss
            this.showMessage(msg + "你輸了...", "text-red-500");
        }
        this.endRound();
    }

    endRound() {
        this.state.phase = 'result';
        setTimeout(() => {
            const btnArea = document.getElementById('bet-controls');
            btnArea.classList.remove('hidden');
            btnArea.innerHTML += '<span class="ml-4 text-gray-500 text-xs flex items-center">請重新下注</span>';
        }, 1000);
    }

    showMessage(msg, color) {
        const el = document.getElementById('illithid-message');
        el.className = `h-12 flex items-center justify-center font-bold text-xl text-center ${color}`;
        el.innerText = msg;
    }
}
