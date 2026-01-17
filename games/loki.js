/**
 * Loki's Grin Game Module (Rule Compliance Update)
 * 洛基的獰笑 (遵循嚴格規則版)
 */

class LokiGame {
    constructor(app) {
        this.app = app;
        this.state = {
            phase: 'setup',
            playerHand: [],
            dealerHand: [],
            luckDice: [],
            pot: 0,
            turn: null, // 'player' or 'dealer'
            firstPlayer: null,
            playerBet: 1, // Current round contribution
            dealerBet: 1, // Current round contribution
            lastAction: null // 'bet', 'call', 'check'
        };
    }

    render() {
        return `
            <div data-game-id="loki" class="p-6 relative min-h-full flex flex-col items-center font-sans text-gray-100" style="background-image: url('assets/bg_illithid.png'); background-size: cover; background-position: center;">
                <div class="absolute inset-0 bg-black/80 backdrop-blur-md z-0"></div>
                
                <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-400 mb-2 relative z-10 font-[Cinzel] tracking-widest drop-shadow-md">
                    洛基的獰笑
                </h2>
                <div id="loki-status-text" class="text-gray-400 text-sm h-6 relative z-10 font-mono text-purple-300">等待開局...</div>

                <!-- Game Table -->
                <div class="bg-gray-900/90 border-4 border-gray-700 rounded-3xl p-6 w-full max-w-4xl shadow-2xl relative z-10 mt-4 flex flex-col gap-6">
                    
                    <!-- Top: Dealer -->
                    <div class="flex flex-col items-center">
                         <span class="text-xs text-red-500 font-bold tracking-widest mb-2">荷官 (DEALER)</span>
                         <div class="flex gap-4" id="dealer-hand-visual">
                             ${this.getHiddenHandHTML()}
                         </div>
                         <div id="dealer-bubble" class="mt-2 text-xs text-white bg-gray-700 px-3 py-1 rounded-full opacity-0 transition-opacity">思考中...</div>
                         <div class="text-xs text-gray-500 mt-1">本輪下注: <span id="dealer-bet-display">1</span></div>
                    </div>

                    <!-- Middle: Table & Luck Dice -->
                    <div class="relative py-6 border-y border-white/10 bg-white/5 mx-[-1.5rem] px-6 flex flex-col items-center">
                        <div class="absolute -top-3 px-4 bg-gray-900 text-gray-500 text-xs tracking-widest uppercase">Public Luck Dice (運骰)</div>
                        
                        <div id="luck-dice-container" class="flex gap-4 my-2">
                             <!-- Initial 2 Visible, 2 Hidden -->
                             <div class="w-12 h-12 bg-gray-800/30 border border-dashed border-gray-600 rounded rotate-45"></div>
                             <div class="w-12 h-12 bg-gray-800/30 border border-dashed border-gray-600 rounded rotate-45"></div>
                             <div class="w-12 h-12 bg-gray-800/30 border border-dashed border-gray-600 rounded rotate-45"></div>
                             <div class="w-12 h-12 bg-gray-800/30 border border-dashed border-gray-600 rounded rotate-45"></div>
                        </div>

                        <!-- Pot Display (User requested prominent display) -->
                        <div class="flex flex-col items-center gap-1 mt-4 p-4 bg-black/60 rounded-xl border border-yellow-600/50 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                             <span class="text-xs uppercase text-yellow-500 tracking-widest">Total Pot (底池)</span>
                             <div class="flex items-center gap-2 text-yellow-400">
                                <span id="pot-display" class="text-5xl font-black drop-shadow-md">2</span>
                                <i class="fa-solid fa-leaf text-2xl"></i>
                             </div>
                        </div>
                    </div>
                
                    <!-- Bottom: Player -->
                    <div class="flex flex-col items-center">
                         <div class="text-xs text-gray-500 mb-1">本輪下注: <span id="player-bet-display">1</span></div>
                         <div class="flex gap-4" id="player-hand-visual">
                             <!-- Player Dice -->
                         </div>
                         <span class="text-xs text-blue-400 font-bold tracking-widest mt-2">你 (PLAYER)</span>
                    </div>

                </div>

                <!-- Controls Area -->
                <div class="w-full max-w-2xl mt-6 relative z-20">
                    
                    <!-- Setup Panel -->
                    <div id="setup-panel" class="text-center">
                        <button onclick="window.gameInstance.startSetup()" class="px-12 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full shadow-[0_0_20px_purple] transition-all hover:scale-105">
                            <i class="fa-solid fa-play mr-2"></i>開始對局 (5 Leaf Limit)
                        </button>
                    </div>

                    <!-- Action Panel -->
                    <div id="action-panel" class="hidden flex flex-col gap-4">
                         <!-- Message Box -->
                         <div class="bg-black/50 p-3 rounded text-center border border-gray-600 text-gray-300 min-h-[50px] flex items-center justify-center" id="action-message">
                            等待行動...
                         </div>

                         <!-- Main Actions -->
                         <!-- Rule Logic: 
                              1. RAISE (Bet > Opponent) -> Can Prank -> End Turn
                              2. CALL (Match Opponent) -> NO Prank -> End Round (Showdown)
                              3. FOLD -> Lose
                         -->
                         <div id="turn-buttons" class="grid grid-cols-2 gap-4">
                            <!-- Button texts dynamic based on state -->
                            <button id="btn-raise" onclick="window.gameInstance.playerRaise()" class="py-4 bg-yellow-600 hover:bg-yellow-500 rounded font-bold text-white shadow-lg border border-yellow-400">
                                加注 & 惡作劇 (Raise & Prank) (+1)
                            </button>
                            
                            <button id="btn-call" onclick="window.gameInstance.playerCall()" class="py-4 bg-green-600 hover:bg-green-500 rounded font-bold text-white shadow-lg">
                                跟注 (Call) (No Prank)
                            </button>
                            
                            <button onclick="window.gameInstance.playerFold()" class="col-span-2 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded border border-gray-600 text-sm">
                                棄牌 (Fold) - 損失底池
                            </button>
                         </div>

                         <!-- Prank Select UI (Triggered only after Raise) -->
                         <div id="prank-ui" class="hidden bg-purple-900/90 p-6 rounded-xl border-2 border-purple-400 text-center relative shadow-[0_0_30px_purple]">
                            <h4 class="text-white font-bold mb-2 text-xl">惡作劇時間 (Prank Time)</h4>
                            <p class="text-sm text-purple-200 mb-6 font-bold">因為你選擇了加注，你獲得了欺詐之神的權柄。</p>
                            <p class="text-xs text-gray-300 mb-4">請選擇 0 ~ 3 顆骰子進行重擲 (可選: 己方命骰 / 公開運骰)</p>
                            
                            <div class="flex justify-center gap-4">
                                <button onclick="window.gameInstance.confirmPrank()" class="px-8 py-3 bg-white text-purple-900 rounded font-bold hover:bg-gray-200 shadow-lg">
                                    <i class="fa-solid fa-dice mr-2"></i>執行重擲 (Reroll)
                                </button>
                                <!-- No Cancel here, you committed to Raise. You can choose to reroll 0 dice though. -->
                            </div>
                         </div>

                    </div>

                    <!-- Result Panel -->
                    <div id="result-panel" class="hidden text-center bg-black/90 p-8 rounded-xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] absolute inset-0 flex flex-col justify-center items-center z-50 h-full">
                        <h3 id="result-title" class="text-4xl font-bold text-white mb-2">YOU WIN</h3>
                        <p id="result-detail" class="text-gray-300 mb-8 text-lg">...</p>
                        <button onclick="window.gameInstance.reset()" class="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 shadow-lg text-xl">下一局</button>
                    </div>

                </div>
            </div>
        `;
    }

    setup() {
        window.gameInstance = this;
        this.reset();
    }

    reset() {
        this.state = {
            phase: 'setup',
            playerHand: [],
            dealerHand: [],
            luckDice: [],
            pot: 0,
            turn: null,
            firstPlayer: null,
            playerBet: 1,
            dealerBet: 1,
            lastAction: null
        };

        document.getElementById('setup-panel').classList.remove('hidden');
        document.getElementById('action-panel').classList.add('hidden');
        document.getElementById('result-panel').classList.add('hidden');
        document.getElementById('pot-display').innerText = 0;
        document.getElementById('player-bet-display').innerText = 0;
        document.getElementById('dealer-bet-display').innerText = 0;

        // Reset Visuals
        document.getElementById('dealer-hand-visual').innerHTML = this.getHiddenHandHTML();
        document.getElementById('player-hand-visual').innerHTML = '';
        const lContainer = document.getElementById('luck-dice-container');
        lContainer.innerHTML = `
             <div class="w-12 h-12 bg-gray-800/30 border border-dashed border-gray-600 rounded rotate-45"></div>
             <div class="w-12 h-12 bg-gray-800/30 border border-dashed border-gray-600 rounded rotate-45"></div>
             <div class="w-12 h-12 bg-gray-800/30 border border-dashed border-gray-600 rounded rotate-45"></div>
             <div class="w-12 h-12 bg-gray-800/30 border border-dashed border-gray-600 rounded rotate-45"></div>
        `;

        this.setStatus("準備開始...");
    }

    setStatus(msg) {
        const el = document.getElementById('loki-status-text');
        if (el) el.innerText = msg;
        const msgBox = document.getElementById('action-message');
        if (msgBox) msgBox.innerText = msg;
    }

    getHiddenHandHTML() {
        return `
            <div class="w-14 h-14 bg-red-900/20 border-2 border-red-900 rounded flex items-center justify-center text-red-700 font-bold text-xl"><i class="fa-solid fa-question"></i></div>
            <div class="w-14 h-14 bg-red-900/20 border-2 border-red-900 rounded flex items-center justify-center text-red-700 font-bold text-xl"><i class="fa-solid fa-question"></i></div>
        `;
    }

    async startSetup() {
        if (this.app.gameState.leaves < 5) {
            alert("至少需要 5 刃藤葉");
            return;
        }

        // Ante
        this.app.gameState.leaves -= 1;
        this.state.pot = 2; // 1 Player + 1 Dealer
        this.state.playerBet = 1;
        this.state.dealerBet = 1;

        this.app.updateStatsUI();
        this.updateBoardUI();

        document.getElementById('setup-panel').classList.add('hidden');
        document.getElementById('action-panel').classList.remove('hidden');

        // Roll Dice
        this.state.playerHand = [this.roll(), this.roll()];
        this.state.dealerHand = [this.roll(), this.roll()];
        this.state.luckDice = [this.roll(), this.roll(), this.roll(), this.roll()];

        this.renderDice();

        // Roll Initiative
        this.setStatus("投擲先手骰 (1D4)...");
        await new Promise(r => setTimeout(r, 1000));
        const initRoll = Math.ceil(Math.random() * 4);
        const isPlayerFirst = (initRoll % 2 === 0);
        this.state.firstPlayer = isPlayerFirst ? 'player' : 'dealer';
        this.state.turn = this.state.firstPlayer;

        this.setStatus(`先手骰: ${initRoll} -> ${isPlayerFirst ? "你先攻" : "荷官先攻"}`);
        await new Promise(r => setTimeout(r, 1500));

        this.startTurn();
    }

    // --- Helper for Visible Dice ---
    createDiceHTML(val, src, idx, interactive) {
        const cursor = interactive ? "cursor-pointer hover:scale-110" : "cursor-default";
        // Dealer is Red, Player Blue, Luck Green
        let border = 'border-gray-500';
        if (src === 'player') border = 'border-blue-500';
        if (src === 'dealer') border = 'border-red-500';
        if (src === 'luck') border = 'border-green-500';

        return `
            <div id="dice-${src}-${idx}" class="w-14 h-14 bg-gray-100 text-black border-4 ${border} rounded rotate-45 flex items-center justify-center font-bold text-xl shadow-lg transition-all ${cursor}"
                onclick="window.gameInstance.toggleDiceSelect('${src}', ${idx})">
                <span class="-rotate-45 block">${val}</span>
            </div>
        `;
    }

    renderDice() {
        // Player
        const pContainer = document.getElementById('player-hand-visual');
        pContainer.innerHTML = '';
        this.state.playerHand.forEach((d, i) => pContainer.innerHTML += this.createDiceHTML(d, 'player', i, true));

        // Dealer (Now Visible)
        const dContainer = document.getElementById('dealer-hand-visual');
        dContainer.innerHTML = '';
        this.state.dealerHand.forEach((d, i) => dContainer.innerHTML += this.createDiceHTML(d, 'dealer', i, false));

        // Luck (First 2 Visible, Last 2 Hidden until Showdown)
        const lContainer = document.getElementById('luck-dice-container');
        lContainer.innerHTML = '';
        // Show all 4 if needed? Rule: "荷官將剩餘的 2 顆「運骰」擲入場中". 
        // Initial setup: "荷官擲出 2 顆「運骰」" (visible) + "雙方擲出各自的 2 顆「命骰」" (visible).
        // Wait, rule 152: "A. 荷官擲出 2 顆「運骰」。 B.方擲出各自的 2 顆「命骰」。"
        // Rule 166 (Showdown): "荷官將剩餘的 2 顆「運骰」擲入場中。"
        // So start with 2 visible Luck dice, 2 hidden (or not yet rolled).

        // Render 2 visible
        lContainer.innerHTML += this.createDiceHTML(this.state.luckDice[0], 'luck', 0, true);
        lContainer.innerHTML += this.createDiceHTML(this.state.luckDice[1], 'luck', 1, true);

        // Render 2 placeholders
        lContainer.innerHTML += `<div id="luck-placeholder-2" class="w-14 h-14 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded rotate-45 flex items-center justify-center text-gray-500 text-xs">?</div>`;
        lContainer.innerHTML += `<div id="luck-placeholder-3" class="w-14 h-14 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded rotate-45 flex items-center justify-center text-gray-500 text-xs">?</div>`;
    }

    roll() {
        return Math.floor(Math.random() * 8) + 1;
    }

    updateBoardUI() {
        document.getElementById('pot-display').innerText = this.state.pot;
        document.getElementById('player-bet-display').innerText = this.state.playerBet;
        document.getElementById('dealer-bet-display').innerText = this.state.dealerBet;

        // Update Buttons Labels dynamically
        if (this.state.turn === 'player') {
            const raiseCost = (this.state.dealerBet - this.state.playerBet) + 1; // Match + 1
            const callCost = (this.state.dealerBet - this.state.playerBet);

            const btnRaise = document.getElementById('btn-raise');
            const btnCall = document.getElementById('btn-call');

            btnRaise.innerText = `加注 & 惡作劇 (需 ${raiseCost} 葉)`;
            btnCall.innerText = `跟注 & 結算 (需 ${callCost} 葉)`;

            // Rule: "起手必須加注，跟注是對方加注後才可以選擇的行為"
            // If bets are equal, Call is NOT an option. Must Raise.
            if (this.state.dealerBet === this.state.playerBet) {
                btnCall.disabled = true;
                btnCall.innerText = `跟注 (等待對手加注)`;
                btnCall.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                btnCall.disabled = false;
                btnCall.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    // --- Turn Logic ---

    startTurn() {
        this.updateBoardUI();
        this.state.phase = 'main_round';
        document.getElementById('turn-buttons').classList.remove('hidden');
        document.getElementById('prank-ui').classList.add('hidden');

        if (this.state.turn === 'player') {
            this.setStatus("你的回合：選擇行動");
            this.enableButtons(true);
            // Re-run UI update to enforce disabled state if needed
            this.updateBoardUI();
        } else {
            this.setStatus("荷官思考中...");
            this.enableButtons(false);
            this.runDealerAI();
        }
    }

    enableButtons(enabled) {
        document.querySelectorAll('#turn-buttons button').forEach(b => b.disabled = !enabled);
    }

    // --- Player Actions ---

    playerRaise() {
        const raiseAmount = (this.state.dealerBet - this.state.playerBet) + 1;
        if (this.app.gameState.leaves < raiseAmount) {
            alert("刃藤葉不足！");
            return;
        }

        this.app.gameState.leaves -= raiseAmount;
        this.state.pot += raiseAmount;
        this.state.playerBet += raiseAmount;
        this.app.updateStatsUI();
        this.updateBoardUI();

        this.state.lastAction = 'raise';
        this.enterPrankSelect();
    }

    playerCall() {
        const callAmount = (this.state.dealerBet - this.state.playerBet);
        // Double check logic: If callAmount is 0, this should be disabled by UI anyway unless logic fails
        if (callAmount === 0 && this.state.dealerBet === this.state.playerBet) {
            alert("起手必須加注！");
            return;
        }

        if (this.app.gameState.leaves < callAmount) {
            alert("刃藤葉不足！");
            return;
        }

        this.app.gameState.leaves -= callAmount;
        this.state.pot += callAmount;
        this.state.playerBet += callAmount;
        this.app.updateStatsUI();
        this.updateBoardUI();

        this.state.lastAction = 'call';
        this.setStatus("你選擇了跟注。回合結束，進入揭曉！");
        setTimeout(() => this.showdown(), 1000);
    }

    playerFold() {
        this.endRound(false, "你棄牌了 (Folded)。");
    }

    enterPrankSelect() {
        this.state.phase = 'prank_select';
        document.getElementById('turn-buttons').classList.add('hidden');
        document.getElementById('prank-ui').classList.remove('hidden');
        this.setStatus("【惡作劇時間】請選擇重擲目標...");
    }

    toggleDiceSelect(src, idx) {
        if (this.state.phase !== 'prank_select') return;
        if (src === 'dealer') return;
        if (src === 'luck' && idx > 1) return;

        const el = document.getElementById(`dice-${src}-${idx}`);
        if (!el) return;

        if (el.classList.contains('ring-4')) {
            el.classList.remove('ring-4', 'ring-purple-500', 'bg-purple-200');
        } else {
            const current = document.querySelectorAll('.ring-4').length;
            if (current >= 3) {
                alert("最多選擇 3 顆！");
                return;
            }
            el.classList.add('ring-4', 'ring-purple-500', 'bg-purple-200');
        }
    }

    confirmPrank() {
        const selected = document.querySelectorAll('.ring-purple-500');

        selected.forEach(el => {
            const rawId = el.id.split('-');
            const src = rawId[1];
            const idx = parseInt(rawId[2]);
            const newVal = this.roll();

            if (src === 'player') this.state.playerHand[idx] = newVal;
            if (src === 'luck') this.state.luckDice[idx] = newVal;

            const valSpan = el.querySelector('span');
            valSpan.innerText = newVal;
            el.classList.remove('ring-4', 'ring-purple-500', 'bg-purple-200');

            el.classList.add('animate-spin');
            setTimeout(() => el.classList.remove('animate-spin'), 500);
        });

        // Pass to Opponent
        this.state.turn = 'dealer';
        this.setStatus("惡作劇完成！輪到荷官行動...");
        setTimeout(() => this.startTurn(), 1500);
    }

    // --- Dealer AI ---

    async runDealerAI() {
        await new Promise(r => setTimeout(r, 1500));

        const bubble = document.getElementById('dealer-bubble');
        bubble.style.opacity = 1;

        const dealerNeedsToPay = (this.state.playerBet - this.state.dealerBet);

        // Dealer Logic:
        // 1. If Bets Equal (Start of Round for Dealer): MUST RAISE.
        // 2. If Bets Not Equal (Player Raised): Call (End) OR Raise (Continue).

        if (dealerNeedsToPay === 0) {
            // Must Raise
            this.dealerRaise(0);
            return;
        }

        // Check hand
        const currentScore = this.score5Dice([...this.state.dealerHand, this.state.luckDice[0], this.state.luckDice[1], 1, 1]);
        const strongHand = currentScore.score >= 400;

        if (strongHand) {
            // CALL
            this.state.dealerBet += dealerNeedsToPay;
            this.state.pot += dealerNeedsToPay;
            this.updateBoardUI();

            bubble.innerText = "荷官滿意手牌，選擇跟注 (Call)!";
            this.setStatus("荷官跟注。回合結束。");
            setTimeout(() => this.showdown(), 1500);

        } else {
            // RAISE
            this.dealerRaise(dealerNeedsToPay);
        }
    }

    async dealerRaise(matchCost) {
        const bubble = document.getElementById('dealer-bubble');
        const raiseAmt = matchCost + 1;

        this.state.dealerBet += raiseAmt;
        this.state.pot += raiseAmt;
        this.updateBoardUI();

        bubble.innerText = "荷官加注並惡作劇!";
        this.setStatus("荷官加注！正在進行惡作劇...");

        await new Promise(r => setTimeout(r, 1000));

        // Simple Prank: Reroll index 0
        this.state.dealerHand[0] = this.roll();

        const dielEl = document.getElementById(`dice-dealer-0`);
        if (dielEl) {
            dielEl.classList.add('animate-spin');
            dielEl.querySelector('span').innerText = this.state.dealerHand[0];
            setTimeout(() => dielEl.classList.remove('animate-spin'), 500);
        }

        bubble.innerText = "荷官重擲了命骰...";
        await new Promise(r => setTimeout(r, 1000));

        this.state.turn = 'player';
        this.startTurn();
    }

    // --- Showdown ---

    async showdown() {
        this.state.phase = 'showdown';
        document.getElementById('action-panel').classList.add('hidden');
        this.setStatus("最終階段：命運揭曉 (Rolling Final Luck)");

        // Dealer Hand already visible, no change needed there

        await new Promise(r => setTimeout(r, 500));

        // Reveal last 2 Luck Dice
        const lContainer = document.getElementById('luck-dice-container');
        // We know indices 2 and 3 are the hidden ones
        const ph2 = document.getElementById('luck-placeholder-2');
        const ph3 = document.getElementById('luck-placeholder-3');

        if (ph2) ph2.outerHTML = this.createDiceHTML(this.state.luckDice[2], 'luck', 2, false);
        if (ph3) ph3.outerHTML = this.createDiceHTML(this.state.luckDice[3], 'luck', 3, false);

        // Add highlight to new dice
        const d2 = document.getElementById('dice-luck-2');
        const d3 = document.getElementById('dice-luck-3');
        if (d2) d2.classList.add('animate-bounce', 'border-yellow-400');
        if (d3) d3.classList.add('animate-bounce', 'border-yellow-400');

        // Remove animation after a bit
        setTimeout(() => {
            if (d2) d2.classList.remove('animate-bounce');
            if (d3) d3.classList.remove('animate-bounce');
        }, 1000);

        await new Promise(r => setTimeout(r, 1500));

        this.evaluateWinner();
    }

    evaluateWinner() {
        const pBest = this.getBestHandStr(this.state.playerHand, this.state.luckDice);
        const dBest = this.getBestHandStr(this.state.dealerHand, this.state.luckDice);

        let win = false;
        let tie = false;

        if (pBest.score > dBest.score) win = true;
        else if (pBest.score < dBest.score) win = false;
        else {
            if (pBest.tiebreaker > dBest.tiebreaker) win = true;
            else if (pBest.tiebreaker < dBest.tiebreaker) win = false;
            else tie = true;
        }

        this.endRound(win, `你: ${pBest.name} vs 荷官: ${dBest.name}`, tie);
    }

    endRound(win, msg, tie = false) {
        document.getElementById('result-panel').classList.remove('hidden');
        document.getElementById('result-detail').innerText = msg;

        const title = document.getElementById('result-title');

        if (tie) {
            title.innerText = "平局 (DRAW)";
            title.className = "text-4xl font-bold text-gray-300 mb-2";
            const share = Math.floor(this.state.pot / 2);
            this.app.gameState.leaves += share;
        } else if (win) {
            title.innerText = "勝利 (VICTORY)";
            title.className = "text-4xl font-bold text-fw-neon mb-2 shadow-text";
            this.app.gameState.leaves += this.state.pot;
        } else {
            title.innerText = "敗北 (DEFEAT)";
            title.className = "text-4xl font-bold text-red-500 mb-2";
        }

        this.app.updateStatsUI();
    }

    // --- Scoring Logic ---

    getBestHandStr(hand, luck) {
        const pool = [...hand, ...luck];
        let bestScore = -1;
        let bestName = "";
        let bestTie = 0;

        for (let i = 0; i < 6; i++) {
            const currentHand = pool.filter((_, idx) => idx !== i);
            const scoreObj = this.score5Dice(currentHand);
            if (scoreObj.score > bestScore || (scoreObj.score === bestScore && scoreObj.tiebreaker > bestTie)) {
                bestScore = scoreObj.score;
                bestName = scoreObj.name;
                bestTie = scoreObj.tiebreaker;
            }
        }
        return { score: bestScore, name: bestName, tiebreaker: bestTie };
    }

    score5Dice(dice) {
        dice.sort((a, b) => b - a);
        const counts = {};
        dice.forEach(x => counts[x] = (counts[x] || 0) + 1);
        const vals = Object.values(counts);
        const maxFreq = Math.max(...vals);
        const distinct = Object.keys(counts).length;

        if (maxFreq === 5) return { score: 800, name: "五神降臨", tiebreaker: dice[0] };
        if (maxFreq === 4) return { score: 700, name: "四相劫難", tiebreaker: parseInt(Object.keys(counts).find(k => counts[k] === 4)) };
        if (distinct === 5 && (dice[0] - dice[4] === 4)) return { score: 600, name: "連鎖詭計", tiebreaker: dice[0] };
        if (maxFreq === 3 && distinct === 2) return { score: 500, name: "雙蛇噬尾", tiebreaker: dice[0] };
        if (maxFreq === 3) return { score: 400, name: "三謊言", tiebreaker: parseInt(Object.keys(counts).find(k => counts[k] === 3)) };
        if (maxFreq === 2 && distinct === 3) return { score: 300, name: "雙面", tiebreaker: dice[0] };
        if (maxFreq === 2) return { score: 200, name: "單面", tiebreaker: parseInt(Object.keys(counts).find(k => counts[k] === 2)) };
        return { score: 100, name: "無序 (High Card)", tiebreaker: dice[0] };
    }
}
