import { getAuthToken } from '../utils/firebaseAuth.js';
import { API_BASE_URL } from '../utils/config.js';

export const renderCheckout = (container, planName = 'Pro Plan', price = '$49.00') => {
    container.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
                <!-- Summary -->
                <div class="bg-gray-900 p-12 text-white flex flex-col justify-between">
                    <div>
                        <button id="backBtn" class="text-gray-400 hover:text-white transition flex items-center mb-12">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Dashboard
                        </button>
                        <h2 class="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Plan Summary</h2>
                        <div class="flex justify-between items-end">
                            <div>
                                <p class="text-3xl font-black text-white">${planName}</p>
                                <p class="text-gray-400 text-sm mt-1">Billed monthly</p>
                            </div>
                            <p class="text-3xl font-black">${price}</p>
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-800 pt-8 mt-12">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-400">Subtotal</span>
                            <span>${price}</span>
                        </div>
                        <div class="flex justify-between text-sm mb-6">
                            <span class="text-gray-400">Tax</span>
                            <span>$0.00</span>
                        </div>
                        <div class="flex justify-between text-xl font-bold border-t border-gray-800 pt-6">
                            <span>Total due today</span>
                            <span>${price}</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Form -->
                <div class="p-12">
                    <h3 class="text-2xl font-black text-gray-900 mb-8">Pay with card</h3>
                    <form id="checkoutForm" class="space-y-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Email</label>
                            <input type="email" required class="w-full border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 border" placeholder="john@example.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Card Information</label>
                            <div class="relative">
                                <input type="text" id="cardNumber" required class="w-full border-gray-300 rounded-t-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 border border-b-0" placeholder="4242 4242 4242 4242">
                                <div class="grid grid-cols-2">
                                    <input type="text" required class="border-gray-300 rounded-bl-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 border" placeholder="MM / YY">
                                    <input type="text" required class="border-gray-300 rounded-br-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 border border-l-0" placeholder="CVC">
                                </div>
                            </div>
                            <p class="text-[10px] text-orange-600 font-bold mt-2">✨ Stripe TEST MODE: Use 4242... for success</p>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Name on card</label>
                            <input type="text" required class="w-full border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 border" placeholder="John Doe">
                        </div>

                        <button type="submit" id="payBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-lg shadow-xl transition-all transform active:scale-95 flex items-center justify-center">
                            Subscribe
                        </button>
                        
                        <p class="text-center text-xs text-gray-400 mt-4">
                            By subscribing, you authorize AR Food SaaS to charge your card on a monthly basis.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    `;

    bindCheckoutEvents(planName);
};

const bindCheckoutEvents = (planName) => {
    const form = document.getElementById('checkoutForm');
    const payBtn = document.getElementById('payBtn');
    const backBtn = document.getElementById('backBtn');

    backBtn.addEventListener('click', () => {
        window.location.hash = '';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        payBtn.disabled = true;
        payBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;

        // Simulate network delay
        setTimeout(async () => {
            try {
                const token = await getAuthToken();
                const response = await fetch(`${API_BASE_URL}/api/billing/upgrade`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ plan: 'pro' })
                });

                if (response.ok) {
                    payBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                    payBtn.classList.add('bg-green-600');
                    payBtn.innerText = 'Payment Successful! Redirecting...';
                    
                    setTimeout(() => {
                        window.location.hash = '';
                        window.dispatchEvent(new HashChangeEvent('hashchange'));
                    }, 1500);
                } else {
                    throw new Error("Failed to upgrade account");
                }
            } catch (err) {
                console.error(err);
                alert("Payment processing failed. Please try again.");
                payBtn.disabled = false;
                payBtn.innerText = 'Subscribe';
            }
        }, 2000);
    });
};
