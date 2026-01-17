/**
 * Olidammara.js
 * 渥利達馬拉的獎賞 (Olidammara’s Bounty)
 */

class OlidammaraGame {
    constructor(app) {
        this.app = app;
        // Daily Chest Values (Rule 62: Roll 3D20 to determine jackpot)
        this.generateDailyJackpot();
        this.blackChestValue = "傳說中的虛空匕首 (Legendary Void Dagger)";

        this.bets = {}; // Map: 'target' -> amount
        this.isRolling = false;
    }

    generateDailyJackpot() {
        // Roll 3d20
        const d1 = Math.floor(Math.random() * 20) + 1;
        const d2 = Math.floor(Math.random() * 20) + 1;
        const d3 = Math.floor(Math.random() * 20) + 1;

        // Special combos
        if (d1 === 20 && d2 === 20 && d3 === 20) this.redChestValue = 222;
        else if (d1 === 6 && d2 === 15 && d3 === 10) this.redChestValue = 6151;
        else if (d1 === 19 && d2 === 19 && d3 === 19) this.redChestValue = 191919;
        else {
            const rawStr = `${d1}${d2}${d3}`;
            const filtered = rawStr.replace(/0/g, '');
            this.redChestValue = parseInt(filtered) || 111;
        }
        console.log(`Daily Jackpot Generated: ${d1},${d2},${d3} -> ${this.redChestValue}`);
    }

    render() {
        return `
            <div data-game-id="olidammara" class="p-6 relative min-h-full flex flex-col items-center font-sans text-gray-100" style="background-image: url('assets/bg_olidammara.png'); background-size: cover; background-position: center;">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

                <!-- Game Header -->
                <!-- Game Header with Beholder Die Prop -->
                <div class="relative z-0 flex flex-col items-center mb-4 mt-2 pointer-events-none select-none">
                    <div class="relative w-24 h-24 mb-2 animate-float opacity-80">
                        <img src="assets/prop_beholder_die.png" class="w-full h-full object-contain filter drop-shadow-[0_0_10px_purple]">
                    </div>
                    <h2 class="text-3xl font-bold text-yellow-500 font-[Cinzel] tracking-widest drop-shadow-lg">渥利達馬拉的獎賞</h2>
                </div>

                <!-- Jackpot Display -->
                <div class="relative z-10 bg-black/80 border border-yellow-600 px-6 py-2 rounded-lg mb-6 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex flex-col items-center">
                    <span class="text-yellow-500 text-xs font-bold tracking-[0.2em] uppercase">Today's Jackpot (紅寶箱彩金)</span>
                    <span class="text-3xl font-black text-white font-mono tracking-widest" id="jackpot-display">${this.redChestValue}</span>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-6xl relative z-10">
                    
                    <!-- Betting Table -->
                    <div class="col-span-1 lg:col-span-9 bg-green-900/40 p-8 rounded-2xl border-2 border-green-600/50 shadow-[0_0_30px_rgba(0,255,0,0.1)] flex flex-col justify-center">
                        <div class="grid grid-cols-5 gap-4 w-full h-full max-w-4xl mx-auto">
                            <!-- Header Row / Special Bets -->
                            <div onclick="window.gameInstance.placeBet('odd')" class="col-span-2 p-6 bg-gray-800 hover:bg-gray-700 text-center rounded-xl cursor-pointer border-2 border-gray-600 transition-all hover:scale-105 hover:border-white shadow-lg flex flex-col justify-center items-center bet-area group" data-target="odd">
                                <span class="block font-bold text-gray-300 text-2xl group-hover:text-white">單數 (ODD)</span>
                                <span class="text-sm text-yellow-500 font-bold mt-1">1:2</span>
                                <div class="bet-marker text-white font-bold" id="bet-odd"></div>
                            </div>
                            <div class="col-span-1 p-2 bg-black/50 text-center rounded-xl flex items-center justify-center border border-gray-700">
                                <i class="fa-solid fa-gem text-purple-500 text-4xl animate-pulse"></i>
                            </div>
                            <div onclick="window.gameInstance.placeBet('even')" class="col-span-2 p-6 bg-gray-800 hover:bg-gray-700 text-center rounded-xl cursor-pointer border-2 border-gray-600 transition-all hover:scale-105 hover:border-white shadow-lg flex flex-col justify-center items-center bet-area group" data-target="even">
                                <span class="block font-bold text-gray-300 text-2xl group-hover:text-white">雙數 (EVEN)</span>
                                <span class="text-sm text-yellow-500 font-bold mt-1">1:2</span>
                                <div class="bet-marker text-white font-bold" id="bet-even"></div>
                            </div>

                            <!-- Numbers 2-18 -->
                            ${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(n => this.renderNumberBtn(n)).join('')}
                             
                             <div onclick="window.gameInstance.placeBet(1)" class="p-6 bg-gray-900 hover:bg-gray-800 text-center rounded-xl cursor-pointer border-2 border-gray-700 hover:border-white transition-all hover:scale-110 shadow-xl flex flex-col justify-center items-center bet-area group" data-target="1">
                                <span class="block font-black text-gray-400 group-hover:text-white text-3xl">1</span>
                                <span class="text-xs text-gray-500 font-bold mt-1 tracking-widest uppercase">黑寶箱</span>
                                <div class="bet-marker text-white font-bold" id="bet-1"></div>
                            </div>

                             <div onclick="window.gameInstance.placeBet(20)" class="p-6 bg-red-900/60 hover:bg-red-800 text-center rounded-xl cursor-pointer border-2 border-red-700 hover:border-red-400 transition-all hover:scale-110 shadow-[0_0_15px_red] flex flex-col justify-center items-center bet-area group" data-target="20">
                                <span class="block font-black text-red-400 group-hover:text-white text-3xl">20</span>
                                <span class="text-xs text-red-300 font-bold mt-1 tracking-widest uppercase">紅寶箱</span>
                                <div class="bet-marker text-white font-bold" id="bet-20"></div>
                            </div>

                        </div>
                    </div>

                    <!-- Dealer / Controls -->
                    <div class="w-full md:w-64 flex flex-col gap-4">
                        <div class="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30 text-center relative overflow-hidden">
                             <div class="w-24 h-24 rounded-full bg-purple-900 mx-auto mb-2 flex items-center justify-center shadow-[0_0_20px_purple]">
                                <i class="fa-solid fa-eye text-5xl text-purple-300"></i>
                             </div>
                             
                             <div id="dice-result-display" class="text-6xl font-black text-white drop-shadow-[0_0_10px_purple] animate-pulse">?</div>
                        </div>

                        <div class="p-4 bg-gray-800 rounded-lg">
                            <h4 class="font-bold text-gray-400 text-sm mb-2">下注資訊</h4>
                            <div class="flex justify-between text-sm mb-1">
                                <span>總下注:</span>
                                <span id="total-bet" class="text-fw-accent">0</span>
                            </div>
                            <button onclick="window.gameInstance.spin()" class="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow-lg transition-all">
                                <i class="fa-solid fa-dice-d20 mr-2"></i>讓眼魔滾動 (ROLL)
                            </button>
                             <button onclick="window.gameInstance.clearBets()" class="w-full mt-2 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-all">
                                清除下注
                            </button>
                        </div>
                    </div>
                </div>
                </div>
                 <div id="olidammara-message" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center pointer-events-none w-full px-4"></div>
            </div>
        `;
    }

    renderNumberBtn(num) {
        return `
            <div onclick="window.gameInstance.placeBet(${num})" class="p-6 bg-gray-800 hover:bg-gray-700 text-center rounded-xl cursor-pointer border-2 border-gray-600 transition-all hover:scale-110 hover:border-white shadow-lg flex flex-col justify-center items-center bet-area group" data-target="${num}">
                <span class="block font-black text-white text-3xl group-hover:text-yellow-400 transition-colors">${num}</span>
                <span class="text-xs text-gray-500 font-bold mt-1">1:20</span>
                <div class="bet-marker text-white font-bold" id="bet-${num}"></div>
            </div>
        `;
    }

    setup() {
        window.gameInstance = this;
        this.clearBets();
    }

    placeBet(target) {
        if (this.isRolling) return;

        // Custom Logic: Odd/Even rule check
        // Previous limitation removed per user request. 
        // Logic for Chests remains (Rule 79: Chests exclusive)

        // Rule 79: Chests exclusive? "若要押寶箱區，則不可押其他區".
        const isChest = (target == 1 || target == 20);
        const hasChestBet = (this.bets[1] || this.bets[20]);
        const hasOtherBet = Object.keys(this.bets).some(k => k != 1 && k != 20);

        if (isChest && hasOtherBet) {
            this.showMessage("押注寶箱時不可押其他區域！", "text-red-500");
            return;
        }
        if (!isChest && hasChestBet) {
            this.showMessage("已押注寶箱，不可押其他區域！", "text-red-500");
            return;
        }

        // Add Bet
        if (!this.bets[target]) this.bets[target] = 0;

        // Basic cost check
        if (this.app.gameState.leaves < 1) {
            this.showMessage("刃藤葉不足！", "text-red-500");
            return;
        }
        this.app.gameState.leaves -= 1;
        this.app.updateStatsUI();
        this.bets[target] += 1;
        this.updateBetUI();
    }

    updateBetUI() {
        // Clear all markers
        document.querySelectorAll('.bet-marker').forEach(el => {
            el.innerHTML = '';
            el.parentElement.classList.remove('ring-2', 'ring-fw-neon');
        });

        let total = 0;
        for (const [target, amount] of Object.entries(this.bets)) {
            if (amount > 0) {
                total += amount;
                const el = document.getElementById(`bet-${target}`);
                if (el) {
                    el.innerHTML = `<span class="bg-yellow-500 text-black rounded-full w-6 h-6 inline-flex items-center justify-center text-xs shadow-md border border-white">${amount}</span>`;
                    el.parentElement.classList.add('ring-2', 'ring-fw-neon');
                }
            }
        }
        document.getElementById('total-bet').innerText = total;
    }

    clearBets() {
        if (this.isRolling) return;

        // Refund matches logic
        let totalRefund = 0;
        for (const amt of Object.values(this.bets)) totalRefund += amt;
        this.app.gameState.leaves += totalRefund;
        this.app.updateStatsUI();

        this.bets = {};
        this.updateBetUI();
        this.showMessage("");
    }

    async spin() {
        if (this.isRolling) return;
        if (Object.keys(this.bets).length === 0) {
            this.showMessage("請先下注！", "text-red-500");
            return;
        }

        this.isRolling = true;
        this.showMessage("眼魔滾動中...", "text-purple-400");

        try {
            const display = document.getElementById('dice-result-display');
            let roll = 1;

            // Animation
            const startTime = Date.now();
            const interval = setInterval(() => {
                roll = Math.floor(Math.random() * 20) + 1;
                display.innerText = roll;
            }, 80);

            await new Promise(r => setTimeout(r, 2000));
            clearInterval(interval);

            // Final Result
            const gmPanel = document.querySelectorAll('.gm-input');
            if (this.app.gameState.gmMode && gmPanel[0].value) {
                roll = parseInt(gmPanel[0].value);
                gmPanel[0].value = ''; // clear
            } else {
                roll = Math.floor(Math.random() * 20) + 1; // Real final roll
            }

            display.innerText = roll;
            display.classList.add('scale-150');
            setTimeout(() => display.classList.remove('scale-150'), 200);

            await this.resolve(roll);
        } catch (e) {
            console.error(e);
            this.showMessage("發生錯誤", "text-red-500");
        } finally {
            this.isRolling = false;
            // Clear bets after round (Consumed)
            this.bets = {};
            this.updateBetUI();
        }
    }

    async resolve(roll) {
        let totalWin = 0;
        let message = `結果: ${roll}. `;

        // Special Case Logic
        if (roll === 1 || roll === 20) {
            await this.handleChestEvent(roll);
            return; // Chest event handles payoffs separately
        }

        // Standard Logic matches
        if (this.bets[roll]) {
            totalWin += this.bets[roll] * 20;
            message += "中了數字! ";
        }

        if (roll % 2 !== 0 && this.bets['odd']) { // Odd
            totalWin += this.bets['odd'] * 2;
            message += "單數中獎! ";
        }

        if (roll % 2 === 0 && this.bets['even']) { // Even
            totalWin += this.bets['even'] * 2;
            message += "雙數中獎! ";
        }

        if (totalWin > 0) {
            this.app.gameState.leaves += totalWin;
            this.app.updateStatsUI();
            this.showMessage(message + `贏得 ${totalWin} 刃藤!`, "text-fw-neon");
        } else {
            this.showMessage(message + "沒中...", "text-gray-500");
        }
    }

    async handleChestEvent(firstRoll) {
        this.showMessage(`擲出 ${firstRoll}! 觸發寶箱判定! 再擲一次...`, "text-yellow-400 animate-pulse");
        await new Promise(r => setTimeout(r, 1500));

        // Roll Again
        const secondRoll = Math.floor(Math.random() * 20) + 1;
        document.getElementById('dice-result-display').innerText = secondRoll;

        let win = 0;
        let msg = `第二次結果: ${secondRoll}. `;

        if (firstRoll === 20 && secondRoll === 20 && this.bets[20]) {
            msg += ` 開啟紅寶箱! 獲得 ${this.redChestValue}!`;
            win += this.redChestValue;
        } else if (firstRoll === 1 && secondRoll === 1 && this.bets[1]) {
            msg += ` 開啟黑寶箱! 獲得 ${this.blackChestValue}!`;
            alert(`恭喜獲得: ${this.blackChestValue}`);
        } else {
            msg += " 可惜，寶箱未開啟。";
        }

        if (win > 0) {
            this.app.gameState.leaves += win;
            this.app.updateStatsUI();
            this.showMessage(msg, "text-fw-gold");
        } else {
            this.showMessage(msg, "text-gray-400");
        }
    }

    showMessage(msg, color) {
        const el = document.getElementById('olidammara-message');
        if (el) {
            el.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center pointer-events-none w-full px-4 font-black text-4xl drop-shadow-[0_5px_5px_rgba(0,0,0,1)] transition-all duration-300 scale-100 ${color}`;
            el.innerText = msg;

            // Auto fade out logic could be added here if desired, but sticking to existing pattern
            el.classList.remove('scale-0', 'opacity-0');
            el.classList.add('scale-100', 'opacity-100');

            // Simple animation reset
            setTimeout(() => {
                if (el.innerText === "") {
                    el.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center pointer-events-none opacity-0 transition-opacity duration-300";
                }
            }, 3000);
        }
    }
}
