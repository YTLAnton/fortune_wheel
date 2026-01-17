/**
 * Slot Machine Game Module
 */

class SlotsGame {
    constructor(app) {
        this.app = app;
        this.cost = 1; // Standard cost
        this.isSpinning = false;

        this.symbols = {
            1: { icon: '', color: 'text-gray-400', name: '1', value: 1, text: '1' },
            2: { icon: '', color: 'text-white', name: '2', value: 2, text: '2' },
            3: { icon: '', color: 'text-red-500', name: '3', value: 3, text: '3' },
            4: { icon: '', color: 'text-gray-500', name: '4', value: 4, text: '4' },
            5: { icon: '', color: 'text-purple-500', name: '5', value: 5, text: '5' },
            6: { icon: '', color: 'text-yellow-500', name: '6', value: 6, text: '6' }
        };
    }

    render() {
        return `
            <div data-game-id="slots" class="p-4 sm:p-6 relative min-h-full flex flex-col items-center justify-center font-sans text-gray-100" style="background-image: url('assets/bg_slots.png'); background-size: cover; background-position: center;">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
                
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 sm:mb-6 relative z-10 font-[Cinzel] tracking-widest drop-shadow-md">
                    \u7372\u54c1\u8001\u864e\u6a5f
                </h2>
                <p class="text-sm sm:text-base text-gray-400 mt-2 relative z-10">\u6295\u5165 <span class="text-fw-accent font-bold">1 \u5203\u85e4\u8449</span>\uff0c\u8d0f\u53d6\u8c50\u5bcc\u7372\u54c1\uff01</p>
                
                <!-- Slot Machine Display -->
                <div class="bg-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.2)] sm:shadow-[0_0_50px_rgba(234,179,8,0.2)] relative z-10 max-w-full">
                    <!-- Decor Lights -->
                    <div class="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-4">
                        <div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]"></div>
                        <div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500 animate-pulse delay-75 shadow-[0_0_10px_yellow]"></div>
                        <div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 animate-pulse delay-150 shadow-[0_0_10px_green]"></div>
                    </div>

                    <div class="flex gap-2 sm:gap-4 p-3 sm:p-4 bg-black rounded-xl border border-gray-700">
                        <div id="reel-1" class="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-black rounded-lg flex items-center justify-center text-4xl sm:text-5xl md:text-6xl overflow-hidden border-2 border-yellow-700 relative shadow-inner">
                            <i class="fa-solid fa-question text-gray-800 text-2xl sm:text-3xl md:text-4xl"></i>
                            <div class="absolute inset-x-0 top-0 h-6 sm:h-8 bg-gradient-to-b from-black to-transparent opacity-80 pointer-events-none"></div>
                            <div class="absolute inset-x-0 bottom-0 h-6 sm:h-8 bg-gradient-to-t from-black to-transparent opacity-80 pointer-events-none"></div>
                        </div>
                        <div id="reel-2" class="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-black rounded-lg flex items-center justify-center text-4xl sm:text-5xl md:text-6xl overflow-hidden border-2 border-yellow-700 relative shadow-inner">
                            <i class="fa-solid fa-question text-gray-800 text-2xl sm:text-3xl md:text-4xl"></i>
                            <div class="absolute inset-x-0 top-0 h-6 sm:h-8 bg-gradient-to-b from-black to-transparent opacity-80 pointer-events-none"></div>
                            <div class="absolute inset-x-0 bottom-0 h-6 sm:h-8 bg-gradient-to-t from-black to-transparent opacity-80 pointer-events-none"></div>
                        </div>
                        <div id="reel-3" class="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-black rounded-lg flex items-center justify-center text-4xl sm:text-5xl md:text-6xl overflow-hidden border-2 border-yellow-700 relative shadow-inner">
                            <i class="fa-solid fa-question text-gray-800 text-2xl sm:text-3xl md:text-4xl"></i>
                            <div class="absolute inset-x-0 top-0 h-6 sm:h-8 bg-gradient-to-b from-black to-transparent opacity-80 pointer-events-none"></div>
                            <div class="absolute inset-x-0 bottom-0 h-6 sm:h-8 bg-gradient-to-t from-black to-transparent opacity-80 pointer-events-none"></div>
                        </div>
                    </div>

                    <!-- Lever (Hidden on mobile) -->
                    <div class="hidden sm:block absolute top-1/2 -right-12 w-8 h-32 bg-gray-700 rounded-r-lg border-y border-r border-gray-600 flex flex-col justify-between py-2">
                        <div class="w-6 h-6 bg-red-600 rounded-full mx-auto shadow-lg"></div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="space-y-3 sm:space-y-4 text-center relative z-10 mt-4 sm:mt-6">
                    <button id="spin-btn" class="px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 active:from-red-400 active:to-red-600 text-white font-bold text-lg sm:text-xl rounded-full shadow-[0_4px_0_rgb(153,27,27)] sm:shadow-[0_5px_0_rgb(153,27,27)] active:shadow-none active:translate-y-[4px] sm:active:translate-y-[5px] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]">
                        <i class="fa-solid fa-play mr-2"></i> \u62c9\u9738 (SPIN)
                    </button>
                    <div id="result-message" class="min-h-[32px] text-sm sm:text-base md:text-lg font-bold text-fw-neon px-2"></div>
                </div>
                
                 <!-- Game Mode Toggle -->
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 relative z-10 mt-4">
                     <button onclick="window.gameInstance.setMode('normal')" class="text-xs sm:text-sm text-yellow-500 border border-yellow-500/50 px-3 py-2 rounded hover:bg-yellow-500/10 active:bg-yellow-500/10 min-h-[44px]">\u666e\u901a\u5403\u89d2\u5b50\u6a5f (1 Leaf)</button>
                     <button onclick="window.gameInstance.setMode('razorvine')" class="text-xs sm:text-sm text-red-500 border border-red-500/50 px-3 py-2 rounded hover:bg-red-500/10 active:bg-red-500/10 min-h-[44px]">\u5203\u85e4\u8001\u864e\u6a5f (2 Leaf)</button>
                </div>
            </div>
        `;
    }

    setMode(mode) {
        if (mode === 'razorvine') {
            this.cost = 2;
            alert("Switched to Razorvine Mode (Cost: 2 Leaves)");
        } else {
            this.cost = 1;
            alert("Switched to Standard Mode (Cost: 1 Leaf)");
        }
    }

    setup() {
        const btn = document.getElementById('spin-btn');
        if (btn) {
            btn.onclick = () => this.spin();
        }
        window.gameInstance = this;
    }

    async spin() {
        if (this.isSpinning) return;

        if (this.app.gameState.leaves < this.cost) {
            this.showResult("刃藤葉不足！", "text-red-500");
            return;
        }

        this.app.gameState.leaves -= this.cost;
        this.app.updateStatsUI();

        this.isSpinning = true;
        document.getElementById('spin-btn').disabled = true;
        document.getElementById('result-message').innerText = "";

        const reels = [
            document.getElementById('reel-1'),
            document.getElementById('reel-2'),
            document.getElementById('reel-3')
        ];

        let interval = setInterval(() => {
            reels.forEach(reel => {
                const randomSymbol = Math.floor(Math.random() * 6) + 1;
                reel.innerHTML = `<span class="font-mono font-bold ${this.symbols[randomSymbol].color}">${randomSymbol}</span>`;
            });
        }, 80);

        await new Promise(r => setTimeout(r, 1500));
        clearInterval(interval);

        const results = [
            this.rollDie(),
            this.rollDie(),
            this.rollDie()
        ];

        const gmPanel = document.querySelectorAll('.gm-input');
        if (this.app.gameState.gmMode && gmPanel[0].value) {
            results[0] = parseInt(gmPanel[0].value) || results[0];
            results[1] = parseInt(gmPanel[1].value) || results[1];
            results[2] = parseInt(gmPanel[2].value) || results[2];
            gmPanel.forEach(i => i.value = '');
        }

        reels.forEach((reel, index) => {
            const val = results[index];
            reel.innerHTML = `<span class="font-mono font-bold ${this.symbols[val].color} scale-125 transition-transform duration-300">${val}</span>`;
        });

        this.checkWin(results);

        this.isSpinning = false;
        document.getElementById('spin-btn').disabled = false;
    }

    rollDie() {
        return Math.floor(Math.random() * 6) + 1;
    }

    checkWin(results) {
        const counts = {};
        results.forEach(x => counts[x] = (counts[x] || 0) + 1);

        let message = "";
        let color = "text-gray-400";
        let payout = 0;

        if (this.app.gameState.leaves >= 2 && this.cost === 2) {
            // Razorvine Logic
            if (counts[6] === 3) payout = 66666;
            else if (counts[5] === 3) payout = 10000;
            else if (counts[4] === 3) payout = 5000;
            else if (counts[3] === 3) payout = 500;
            else if (counts[2] === 3) payout = 200;
            else if (counts[1] === 3) payout = 100;

            else if (counts[6] === 2) payout = 50;
            else if (counts[5] === 2) payout = 10;
            else if (counts[4] === 2) payout = 5;
            else if (counts[3] === 2) payout = 3;
            else if (counts[2] === 2) payout = 2;
            else if (counts[1] === 2) payout = 1;

            if (payout > 0) {
                if (payout >= 1000) {
                    message = `🔥🔥 刃藤爆發！獲得 ${payout} 刃藤葉！ 🔥🔥`;
                    color = "text-red-500 font-bold neon-text";
                } else {
                    message = `✨ 中獎！獲得 ${payout} 刃藤葉`;
                    color = "text-fw-neon";
                }
                this.app.gameState.leaves += payout;
                this.app.updateStatsUI();
            } else {
                message = "❌ 落空...";
                color = "text-gray-500";
            }
        } else {
            // Standard Logic
            const distinct = Object.keys(counts).length;

            if (distinct === 3) {
                if (counts[2] && counts[4] && counts[6]) {
                    message = "🤖 魔冢時間 (MODRON TIME)！下次免費重擲！";
                    color = "text-blue-400 font-bold";
                } else {
                    message = "❌ 落空... (獨一無二)";
                    color = "text-gray-500";
                }
            }
            else if (distinct === 2) {
                const pairVal = parseInt(Object.keys(counts).find(k => counts[k] === 2));
                payout = pairVal;
                message = `✨ 雙重命中 [${pairVal}]！獲得 ${payout} 刃藤葉`;
                color = "text-fw-neon";
                this.app.gameState.leaves += payout;
                this.app.updateStatsUI();
            }
            else if (distinct === 1) {
                const val = results[0];
                payout = val * 10;
                message = `🎉 頭獎！三個 [${val}]！獲得 ${payout} 刃藤葉！`;
                color = "text-fw-gold neon-text";
                this.app.gameState.leaves += payout;
                this.app.updateStatsUI();
            }
        }

        this.showResult(message, color);
    }

    showResult(msg, colorClass) {
        const el = document.getElementById('result-message');
        el.className = `h-8 text-lg font-bold ${colorClass}`;
        el.innerText = msg;
    }
}
