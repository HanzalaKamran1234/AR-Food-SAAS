import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request) {
  try {
    const { folder } = await request.json();
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Cloudinary signature parameters. Must match what the client sends.
    const signatureParams = {
      timestamp: timestamp,
      folder: folder || 'ar_food_saas',
    };

    const signature = cloudinary.utils.api_sign_request(
      signatureParams,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({ 
      timestamp, 
      signature, 
      folder: signatureParams.folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Signature Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
