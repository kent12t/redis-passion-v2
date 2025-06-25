import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

// Configure the S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const personalityType = formData.get('personalityType') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = imageFile.name.split('.').pop() || 'png';
    const fileName = `results/${personalityType || 'unknown'}-${nanoid()}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Cloudflare R2
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: imageFile.type,
      Metadata: {
        'personality-type': personalityType || 'unknown',
        'upload-timestamp': new Date().toISOString(),
      },
    });

    await s3Client.send(uploadCommand);

    // Construct the public URL (adjust based on your R2 public URL configuration)
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      message: 'Image uploaded successfully',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 