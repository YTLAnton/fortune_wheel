/**
 * Fortune's Wheel Game Logic
 * Core State & Navigation
 */

class App {
    constructor() {
        this.gameState = {
            leaves: 100,
            hp: 20,
            currentView: 'dashboard',

            gmMode: false
        };

        this.games = {}; // Cache for game instances
        this.init();
    }

    init() {
        console.log("Fortune's Wheel App Initialized");
        this.setupEventListeners();
        this.updateStatsUI();
    }

    updateHP(amount) {
        this.gameState.hp += amount;
        if (this.gameState.hp < 0) this.gameState.hp = 0;
        // Basic Game Over check (can be expanded)
        if (this.gameState.hp === 0) {
            alert("生命值歸零... 你的意識逐漸模糊... (Game Over)");
            // Optional: Reset or Redirect
        }
        this.updateStatsUI();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gameTarget = e.currentTarget.dataset.game;
                this.navigate(gameTarget);
                // Close mobile nav after selection
                this.closeMobileNav();
            });
        });

        // GM Mode Toggle - Removed per user request
        // document.getElementById('gm-toggle').addEventListener('click', () => {
        //     this.toggleGMMode();
        // });

        document.getElementById('close-gm').addEventListener('click', () => {
            this.toggleGMMode(false);
        });

        // Mobile Menu Toggle
        const menuBtn = document.getElementById('menu-btn');
        const closeNavBtn = document.getElementById('close-nav-btn');
        const navBackdrop = document.getElementById('nav-backdrop');

        menuBtn.addEventListener('click', () => {
            this.toggleMobileNav();
        });

        closeNavBtn.addEventListener('click', () => {
            this.closeMobileNav();
        });

        // Close nav when clicking backdrop
        navBackdrop.addEventListener('click', () => {
            this.closeMobileNav();
        });
    }

    navigate(viewId) {
        console.log(`Navigating to: ${viewId}`);
        this.gameState.currentView = viewId;

        // Update Active Nav State
        document.querySelectorAll('.nav-item').forEach(btn => {
            if (btn.dataset.game === viewId) {
                btn.classList.add('bg-gray-800', 'text-white', 'border-gray-600', 'shadow-sm', 'font-medium');
                btn.classList.remove('text-gray-400', 'border-transparent');

                // Highlight icon
                const iconContainer = btn.querySelector('div');
                if (iconContainer) {
                    iconContainer.classList.remove('bg-gray-700', 'text-gray-400');
                    iconContainer.classList.add('bg-blue-500/20', 'text-blue-400');
                }
            } else {
                btn.classList.remove('bg-gray-800', 'text-white', 'border-gray-600', 'shadow-sm', 'font-medium');
                btn.classList.add('text-gray-400', 'border-transparent');

                // Dim icon
                const iconContainer = btn.querySelector('div');
                if (iconContainer) {
                    iconContainer.classList.add('bg-gray-700', 'text-gray-400');
                    iconContainer.classList.remove('bg-blue-500/20', 'text-blue-400');
                }
            }
        });

        // In a real app, this would dynamically load/render the game module
        // For now, we'll just log it. Future steps will implement the renderers.
        const container = document.getElementById('active-screen');

        if (viewId === 'dashboard') {
            container.innerHTML = this.getDashboardHTML();
        } else if (viewId === 'slots') {
            if (!this.games['slots']) {
                this.games['slots'] = new SlotsGame(this);
            }
            container.innerHTML = this.games['slots'].render();
            this.games['slots'].setup();
        } else if (viewId === 'dead-hand') {
            if (!this.games['dead-hand']) {
                this.games['dead-hand'] = new DeadHandGame(this);
            }
            container.innerHTML = this.games['dead-hand'].render();
            this.games['dead-hand'].setup();
        } else if (viewId === 'olidammara') {
            if (!this.games['olidammara']) {
                this.games['olidammara'] = new OlidammaraGame(this);
            }
            container.innerHTML = this.games['olidammara'].render();
            this.games['olidammara'].setup();
        } else if (viewId === 'micro-arena') {
            if (!this.games['micro-arena']) {
                this.games['micro-arena'] = new MicroArenaGame(this);
            }
            container.innerHTML = this.games['micro-arena'].render();
            this.games['micro-arena'].setup();
        } else if (viewId === 'illithid') {
            if (!this.games['illithid']) {
                this.games['illithid'] = new IllithidGame(this);
            }
            container.innerHTML = this.games['illithid'].render();
            this.games['illithid'].setup();
        } else if (viewId === 'dragon-roar') {
            if (!this.games['dragon-roar']) {
                this.games['dragon-roar'] = new DragonRoarGame(this);
            }
            container.innerHTML = this.games['dragon-roar'].render();
            this.games['dragon-roar'].setup();
        } else if (viewId === 'loki') {
            if (!this.games['loki']) {
                this.games['loki'] = new LokiGame(this);
            }
            container.innerHTML = this.games['loki'].render();
            this.games['loki'].setup();
        } else {
            // Placeholder for games
            container.innerHTML = `
                <div class="text-center animate-pulse">
                    <i class="fa-solid fa-hammer text-6xl text-gray-700 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-400">Construction in Progress</h2>
                    <p class="text-gray-500">The module [${viewId}] is being built...</p>
                </div>
            `;
        }
    }

    toggleMobileNav() {
        const nav = document.getElementById('main-nav');
        const backdrop = document.getElementById('nav-backdrop');

        const isOpen = !nav.classList.contains('-translate-x-full');

        if (isOpen) {
            this.closeMobileNav();
        } else {
            this.openMobileNav();
        }
    }

    openMobileNav() {
        const nav = document.getElementById('main-nav');
        const backdrop = document.getElementById('nav-backdrop');

        nav.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
        // Prevent body scroll when nav is open
        document.body.style.overflow = 'hidden';
    }

    closeMobileNav() {
        const nav = document.getElementById('main-nav');
        const backdrop = document.getElementById('nav-backdrop');

        nav.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
        // Restore body scroll
        document.body.style.overflow = '';
    }

    toggleGMMode(forceState) {
        const panel = document.getElementById('gm-panel');
        if (forceState !== undefined) {
            this.gameState.gmMode = forceState;
        } else {
            this.gameState.gmMode = !this.gameState.gmMode;
        }

        if (this.gameState.gmMode) {
            panel.classList.remove('translate-x-full');
        } else {
            panel.classList.add('translate-x-full');
        }
    }

    updateStatsUI() {
        document.getElementById('leaf-count').innerText = this.gameState.leaves;
        document.getElementById('hp-count').innerText = this.gameState.hp;
    }

    getDashboardHTML() {
        return `
            <div class="relative w-full max-w-2xl mx-auto mb-4 sm:mb-8 group cursor-pointer animate-fade-in">
                <div class="absolute inset-0 bg-fw-neon/20 rounded-xl blur-xl group-hover:bg-fw-neon/40 group-active:bg-fw-neon/40 transition-all duration-500"></div>
                <img src="assets/hero_main.png" alt="Fortune's Wheel Casino" class="relative z-10 w-full rounded-xl shadow-2xl border border-gray-700 group-hover:scale-[1.02] group-active:scale-[1.02] transition-transform duration-700">
            </div>

            <div class="space-y-2 max-w-lg mx-auto mb-4 sm:mb-8">
                <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-widest uppercase drop-shadow-lg" style="font-family: 'Cinzel', serif;">命運之輪</h2>
                <p class="text-fw-neon text-base sm:text-lg tracking-widest font-light border-t border-b border-fw-neon/30 py-2 inline-block">命運眷顧勇者</p>
            </div>
        `;
    }
}

// Global App Instance
window.app = new App();
