/**
 * AIAssistant.js
 * In a production environment, this would call a real LLM (Gemini, GPT-4).
 * For this 'Skills' demonstration, it implements a sophisticated logic-based 
 * suggestion engine that mimics AI behavior to guide the user.
 */

export const getAIOptimizationTips = (name, description, price) => {
    const tips = [];

    // Name Logic
    if (name.length < 5) {
        tips.push("🍽️ Tip: Descriptive names like 'Golden Crispy Fries' perform better than just 'Fries'.");
    }

    // Pricing Logic (Mocking competitive analysis)
    if (price > 50) {
        tips.push("💰 Premium pricing detected. Ensure your 3D model shows high-quality textures to justify the cost.");
    } else if (price < 5) {
        tips.push("📉 Low price point. Have you considered bundling this with a drink for higher AR engagement?");
    }

    // Description Logic
    if (description.length < 20) {
        tips.push("✍️ Short description. Try adding ingredients or the 'story' behind the dish to increase customer appetite.");
    }

    // AR Engagement Logic
    tips.push("📸 Highlight: Dishes with 'Glistening' textures in 3D tend to get 30% more AR interactions.");

    return tips;
};

export const suggestPrice = (category) => {
    const averagePrices = {
        'Appetizer': 12.99,
        'Main': 24.50,
        'Dessert': 9.99,
        'Drink': 5.50
    };
    return averagePrices[category] || 15.00;
};
