export const renderLandingPage = (container) => {
    container.innerHTML = `
        <div class="min-h-screen bg-white">
            <!-- Navigation -->
            <nav class="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-20 items-center">
                        <div class="flex items-center">
                            <span class="text-2xl font-black text-gradient">AR Food SaaS</span>
                        </div>
                        <div class="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-600">
                            <a href="#features" class="hover:text-orange-600 transition">Features</a>
                            <a href="#pricing" class="hover:text-orange-600 transition">Pricing</a>
                            <button id="navLoginBtn" class="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-black transition shadow-lg">Login</button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="relative pt-20 pb-32 overflow-hidden">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                        <div class="text-center lg:text-left space-y-8">
                            <h1 class="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
                                Bring Your Menu to <span class="text-gradient">Life</span> with AR.
                            </h1>
                            <p class="text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0">
                                Give your customers the future of dining. Let them view your dishes in 3D, right on their table, before they even order. Increase sales by 30% with Augmented Reality.
                            </p>
                            <div class="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <button id="heroGetStartedBtn" class="bg-orange-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-orange-700 transition shadow-2xl transform hover:-translate-y-1">
                                    Start Free Trial
                                </button>
                                <button class="bg-white border-2 border-gray-100 text-gray-900 px-10 py-4 rounded-full font-black text-lg hover:bg-gray-50 transition">
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                        <div class="mt-16 lg:mt-0 relative">
                            <div class="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition duration-700">
                                <img src="/ar_burger_hero_1775471541351.png" alt="AR Food Preview" class="w-full object-cover h-[500px]">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div class="absolute bottom-8 left-8 text-white">
                                    <div class="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-2">
                                        <div class="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                                        <span class="text-xs font-bold uppercase">Live AR Preview</span>
                                    </div>
                                    <p class="text-2xl font-bold">Gourmet Truffle Burger</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section id="features" class="py-24 bg-gray-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-black text-gray-900 mb-4">Everything You Need to Scale</h2>
                        <p class="text-gray-500 max-w-2xl mx-auto">Our all-in-one SaaS platform handles the 3D, the QR codes, and the analytics so you can focus on the food.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                            <div class="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            </div>
                            <h3 class="text-xl font-bold mb-4">Instant QR Menus</h3>
                            <p class="text-gray-500">Generate beauty-branded QR codes for every dish. No app download required for customers.</p>
                        </div>
                        <div class="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                            <div class="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h3 class="text-xl font-bold mb-4">Deep Analytics</h3>
                            <p class="text-gray-500">Track which dishes are viewed most in AR. Optimize your menu based on real interaction data.</p>
                        </div>
                        <div class="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                            <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 class="text-xl font-bold mb-4">AI Assistant</h3>
                            <p class="text-gray-500">Get AI-driven tips on pricing and menu descriptions to maximize your restaurant's revenue.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Pricing Section -->
            <section id="pricing" class="py-24">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 class="text-4xl font-black text-gray-900 mb-16">Simple, Honest Pricing</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <!-- Free Plan -->
                        <div class="bg-white p-12 rounded-3xl border border-gray-100 shadow-lg relative h-full flex flex-col">
                            <h3 class="text-2xl font-bold mb-4">Free Trial</h3>
                            <div class="mb-8">
                                <span class="text-5xl font-black">$0</span>
                                <span class="text-gray-400">/mo</span>
                            </div>
                            <ul class="space-y-4 mb-12 text-left flex-grow">
                                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Up to 5 AR Food Items</li>
                                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Basic Analytics</li>
                                <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Standard QR Codes</li>
                                <li class="flex items-center opacity-40"><span class="text-gray-300 mr-2">✗</span> Custom Branding</li>
                            </ul>
                            <button class="register-trigger w-full bg-gray-100 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-200 transition">Get Started</button>
                        </div>

                        <!-- Pro Plan -->
                        <div class="bg-gray-900 p-12 rounded-3xl shadow-2xl relative h-full flex flex-col transform md:scale-105 z-10 border-4 border-orange-500">
                            <div class="absolute top-0 right-8 transform -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Most Popular</div>
                            <h3 class="text-2xl font-bold mb-4 text-white">Pro Plan</h3>
                            <div class="mb-8">
                                <span class="text-5xl font-black text-white">$49</span>
                                <span class="text-gray-400">/mo</span>
                            </div>
                            <ul class="space-y-4 mb-12 text-left text-gray-300 flex-grow">
                                <li class="flex items-center"><span class="text-orange-500 mr-2">★</span> Unlimited AR Items</li>
                                <li class="flex items-center"><span class="text-orange-500 mr-2">★</span> Advanced View Tracking</li>
                                <li class="flex items-center"><span class="text-orange-500 mr-2">★</span> Professional Dashboard</li>
                                <li class="flex items-center font-bold text-white"><span class="text-orange-500 mr-2">★</span> Custom Brand Colors</li>
                            </ul>
                            <button class="register-trigger w-full bg-orange-600 text-white py-4 rounded-xl font-black hover:bg-orange-700 transition shadow-lg">Start Pro Trial</button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="bg-gray-900 py-12 text-center border-t border-gray-800">
                <p class="text-gray-500 text-sm italic">"Don't just sell food. Sell an experience."</p>
                <p class="text-gray-600 text-xs mt-4">© 2026 AR Food SaaS. All rights reserved.</p>
            </footer>
        </div>
    `;

    bindLandingEvents();
};

const bindLandingEvents = () => {
    const loginBtn = document.getElementById('navLoginBtn');
    const heroBtn = document.getElementById('heroGetStartedBtn');
    const regTriggers = document.querySelectorAll('.register-trigger');

    const goToAuth = (mode = 'login') => {
        // Redraw auth with specific mode? For now just renderAuth
        // Assuming your main.js handles state
        window.location.hash = mode;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
    };

    loginBtn?.addEventListener('click', () => goToAuth('login'));
    heroBtn?.addEventListener('click', () => goToAuth('register'));
    regTriggers.forEach(btn => btn.addEventListener('click', () => goToAuth('register')));
};
