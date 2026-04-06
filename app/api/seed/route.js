import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import FoodItem from "@/models/FoodItem";
import RestaurantProfile from "@/models/RestaurantProfile";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // 1. Find the first restaurant user
    const restaurant = await User.findOne({ role: 'Restaurant' });
    if (!restaurant) {
       return NextResponse.json({ message: "No restaurant user found. Please register first!" }, { status: 404 });
    }

    // 2. Clear existing items to avoid duplicates
    await FoodItem.deleteMany({ restaurantId: restaurant._id });

    // 3. Insert Dummy Data
    const dummyItems = [
      {
        restaurantId: restaurant._id,
        name: "Gourmet Truffle Burger",
        description: "A premium beef patty topped with shaved black truffles, aged cheddar, and caramelized onions on a brioche bun.",
        price: 18.99,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop",
        modelUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/burger.glb", // Using a working sample GLB
        viewCount: 124,
        arInteractions: 45
      },
      {
        restaurantId: restaurant._id,
        name: "Signature Avocado Toast",
        description: "Freshly smashed avocado, poached eggs, and chili flakes on artisan sourdough bread.",
        price: 14.50,
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop",
        modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb", // Placeholder for variety
        viewCount: 89,
        arInteractions: 22
      }
    ];

    await FoodItem.insertMany(dummyItems);

    // 4. Update Profile if it doesn't exist
    await RestaurantProfile.findOneAndUpdate(
      { restaurantId: restaurant._id },
      { 
        name: "The Golden Bistro",
        brandingColor: "#ea580c",
        address: "123 Foodie Lane, San Francisco, CA"
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Dummy data seeded successfully for: " + restaurant.email });
  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
