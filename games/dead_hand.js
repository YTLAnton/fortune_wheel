/**
 * Dead Hand's Dice Game Module
 * 賭命骨骰
 */

class DeadHandGame {
    constructor(app) {
        this.app = app;
        this.minBet = 1; // Assuming cost is handled by betting logic if any, but rules say 'no cost' to enter, just win/loss? 
        // Re-reading rules: 
        // 1. NPC decide dice count.
        // 2. Player rolls 2d4 to see how many dice they CAN roll? No, "Player rolls 2d4 to decide how many dice to roll" is for NPCs?
        // Wait, Rule 60: "每位賭客投擲2D4決定要擲幾顆骰子" (Every gambler rolls 2d4 to decide how many dice).
        // Rule 61: "每位玩家由其 PL 選擇任意數量的 d6 骰...放入骰盅". Player chooses ANY number.
        // Rule 63: "只要出現任意一顆「1」點，就算落敗".
        // Rule 64: "點數總和最高者獲勝".

        this.gameState = {
            phase: 'setup', // setup, rolling, result
            npcs: [],
            playerDiceCount: 1, // Default
            results: null
        };
    }

    render() {
        return `
            <div class="flex flex-col items-center justify-center min-h-full space-y-6 animate-fade-in w-full max-w-4xl mx-auto">
                <div class="text-center space-y-2">
                    <h2 class="text-4xl font-bold text-gray-100 font-serif tracking-widest">
                        <i class="fa-solid fa-skull-crossbones mr-3 text-gray-500"></i>賭命骨骰 (Dead Hand's Dice)
                    </h2>
                    <p class="text-gray-400">星界海盜的賭局：求生還是貪婪？(出現 1 即淘汰)</p>
                </div>

                <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Player Area -->
                    <div class="md:col-span-1 bg-gray-800/80 p-6 rounded-2xl border border-blue-500/30 relative">
                        <h3 class="text-xl font-bold text-blue-400 mb-4"><i class="fa-solid fa-user mr-2"></i>你 (Player)</h3>
                        
                        <div id="player-controls" class="space-y-4">
                            <div class="text-center">
                                <label class="block text-sm text-gray-400 mb-2">選擇骰子數量 (D6)</label>
                                <div class="flex items-center justify-center gap-4">
                                    <button onclick="window.gameInstance.adjustDice(-1)" class="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white">-</button>
                                    <span id="dice-count-display" class="text-3xl font-bold text-white font-mono">1</span>
                                    <button onclick="window.gameInstance.adjustDice(1)" class="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white">+</button>
                                </div>
                            </div>
                            
                            <button id="roll-btn" onclick="window.gameInstance.play()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transition-all">
                                <i class="fa-solid fa-dice mr-2"></i>擲骰 (ROLL)
                            </button>
                        </div>

                        <div id="player-result" class="hidden mt-4 text-center">
                            <div class="flex flex-wrap justify-center gap-2 mb-2" id="player-dice-visuals">
                                <!-- Dice rendered here -->
                            </div>
                            <div id="player-score" class="font-bold text-lg"></div>
                        </div>
                    </div>

                    <!-- Table/NPC Area -->
                    <div class="md:col-span-1 bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
                        <h3 class="text-xl font-bold text-gray-400 mb-4"><i class="fa-solid fa-users mr-2"></i>賭桌 (The Table)</h3>
                        <div id="npc-container" class="grid grid-cols-2 gap-4">
                            <div class="text-center py-8 text-gray-500">等待玩家擲骰...</div>
                        </div>
                    </div>
                </div>

                <!-- Result Overlay -->
                <div id="game-result-overlay" class="hidden w-full p-4 bg-gray-800 border border-gray-600 rounded-xl text-center">
                    <h3 id="final-verdict" class="text-2xl font-bold mb-2"></h3>
                    <button onclick="window.gameInstance.reset()" class="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">再玩一次</button>
                </div>
            </div>
        `;
    }

    setup() {
        window.gameInstance = this;
        this.reset();
    }

    reset() {
        this.gameState.playerDiceCount = 1;
        this.gameState.npcs = this.generateNPCs();
        this.gameState.phase = 'setup';

        // Reset UI
        document.getElementById('player-controls').classList.remove('hidden');
        document.getElementById('player-result').classList.add('hidden');
        document.getElementById('dice-count-display').innerText = 1;
        document.getElementById('game-result-overlay').classList.add('hidden');

        // Render NPCs waiting
        this.renderNPCs(false);
    }

    generateNPCs() {
        // Rule 57: 1d4 gamblers
        const count = Math.ceil(Math.random() * 4);
        const npcs = [];
        const names = ["Goblin", "Tiefling", "Dwarf", "Elf", "Orc"];

        for (let i = 0; i < count; i++) {
            // Rule 60: NPC rolls 2d4 to decide dice count
            const diceCount = Math.ceil(Math.random() * 4) + Math.ceil(Math.random() * 4);
            npcs.push({
                name: names[i % names.length] + " #" + (i + 1),
                diceCount: diceCount,
                rolls: [],
                status: 'waiting' // waiting, active, elim, winner
            });
        }
        return npcs;
    }

    adjustDice(delta) {
        let newCount = this.gameState.playerDiceCount + delta;
        if (newCount < 1) newCount = 1;
        if (newCount > 10) newCount = 10; // Cap at 10 for sanity
        this.gameState.playerDiceCount = newCount;
        document.getElementById('dice-count-display').innerText = newCount;
    }

    async play() {
        // Player Input
        const pCount = this.gameState.playerDiceCount;

        // Disable controls
        document.getElementById('player-controls').classList.add('hidden');
        document.getElementById('player-result').classList.remove('hidden');

        // Roll Player Dice
        const pRolls = [];
        for (let i = 0; i < pCount; i++) pRolls.push(Math.ceil(Math.random() * 6));

        // Render Player Dice (Rolling placeholder)
        const pRollHelpers = Array(pCount).fill(0).map(() => document.getElementById('player-dice-visuals')); // Just identifiers

        // Animation Loop (1s)
        const animDuration = 1000;
        const startTime = Date.now();

        while (Date.now() - startTime < animDuration) {
            const tempRolls = [];
            for (let i = 0; i < pCount; i++) tempRolls.push(Math.ceil(Math.random() * 6));
            this.renderDice('#player-dice-visuals', tempRolls);
            await new Promise(r => setTimeout(r, 80));
        }

        // Render Player Dice Final
        this.renderDice('#player-dice-visuals', pRolls);

        // Roll NPCs
        this.gameState.npcs.forEach(npc => {
            npc.rolls = [];
            for (let i = 0; i < npc.diceCount; i++) npc.rolls.push(Math.ceil(Math.random() * 6));
        });

        // Show NPCs revealed
        this.renderNPCs(true);

        // Evaluate
        this.evaluate(pRolls);
    }

    renderDice(containerSelector, rolls) {
        const el = document.querySelector(containerSelector);
        el.innerHTML = rolls.map(r => {
            const color = r === 1 ? 'text-red-500 animate-pulse' : 'text-white';
            const fa = ['dice-one', 'dice-two', 'dice-three', 'dice-four', 'dice-five', 'dice-six'][r - 1];
            return `<i class="fa-solid fa-${fa} text-3xl ${color}"></i>`;
        }).join('');
    }

    renderNPCs(revealed) {
        const container = document.getElementById('npc-container');
        if (!revealed) {
            container.innerHTML = this.gameState.npcs.map(npc => `
                <div class="bg-gray-800 p-3 rounded border border-gray-700 opacity-50">
                    <div class="font-bold text-sm text-gray-400">${npc.name}</div>
                    <div class="text-xs text-gray-500">準備擲 ${npc.diceCount} 顆骰子...</div>
                </div>
            `).join('');
            return;
        }

        container.innerHTML = this.gameState.npcs.map(npc => {
            const hasOne = npc.rolls.includes(1);
            const sum = npc.rolls.reduce((a, b) => a + b, 0);
            const statusClass = hasOne ? 'border-red-500/50 bg-red-900/20' : 'border-green-500/50 bg-green-900/20';
            const statusText = hasOne ? '淘汰 (BUST)' : `總分: ${sum}`;

            const diceHtml = npc.rolls.map(r => {
                const color = r === 1 ? 'text-red-500' : 'text-gray-300';
                const fa = ['dice-one', 'dice-two', 'dice-three', 'dice-four', 'dice-five', 'dice-six'][r - 1];
                return `<i class="fa-solid fa-${fa} ${color}"></i>`;
            }).join(' ');

            return `
                <div class="p-3 rounded border ${statusClass} transition-all">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-sm text-gray-200">${npc.name}</span>
                        <span class="text-xs font-bold ${hasOne ? 'text-red-400' : 'text-green-400'}">${statusText}</span>
                    </div>
                    <div class="text-lg tracking-widest">${diceHtml}</div>
                </div>
            `;
        }).join('');
    }

    evaluate(playerRolls) {
        const playerHasOne = playerRolls.includes(1);
        const playerSum = playerRolls.reduce((a, b) => a + b, 0);

        let pResultText = "";
        let pResultClass = "";

        if (playerHasOne) {
            pResultText = "失敗 - 擲出 1 點";
            pResultClass = "text-red-500";
        } else {
            pResultText = `總分: ${playerSum}`;
            pResultClass = "text-green-400";
        }
        document.getElementById('player-score').innerHTML = `<span class="${pResultClass}">${pResultText}</span>`;

        // Calculate Winner
        const validParticipants = [];

        // Player
        if (!playerHasOne) validParticipants.push({ name: 'Player', sum: playerSum, rolls: playerRolls, isPlayer: true });

        // NPCs
        this.gameState.npcs.forEach(n => {
            if (!n.rolls.includes(1)) {
                const sum = n.rolls.reduce((a, b) => a + b, 0);
                validParticipants.push({ name: n.name, sum: sum, rolls: n.rolls, isPlayer: false });
            }
        });

        // Determine Highest
        validParticipants.sort((a, b) => {
            if (b.sum !== a.sum) return b.sum - a.sum;
            // Tiebreaker: Most 6s (Rule 64)
            const count6a = a.rolls.filter(r => r === 6).length;
            const count6b = b.rolls.filter(r => r === 6).length;
            return count6b - count6a;
        });

        const overlay = document.getElementById('game-result-overlay');
        const verdict = document.getElementById('final-verdict');
        overlay.classList.remove('hidden');

        if (validParticipants.length === 0) {
            // Rule 65: All fail, Dealer wins
            verdict.innerText = "全員自爆 (BUST)！荷官獲勝！";
            verdict.className = "text-2xl font-bold mb-2 text-red-500 animate-pulse";
        } else {
            const winner = validParticipants[0];
            if (winner.isPlayer) {
                // Determine Win Amount (Pot) - Simplification: Win 10x coins (Advanced) or Standard Pot?
                // Text says "Win Pot". Let's assume pot = # of participants * bet? 
                // Or simply a reward. Implementation simplified to fixed reward for now.
                const reward = (this.gameState.npcs.length + 1) * 2; // Simple math
                verdict.innerText = `恭喜！你以 ${winner.sum} 點獲勝！贏得 ${reward} 刃藤！`;
                verdict.className = "text-2xl font-bold mb-2 text-fw-gold";
                this.app.gameState.leaves += reward;
                this.app.updateStatsUI();
            } else {
                verdict.innerText = `${winner.name} 以 ${winner.sum} 點獲勝。`;
                verdict.className = "text-2xl font-bold mb-2 text-gray-400";
            }
        }
    }
}
