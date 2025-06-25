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
    // Check required environment variables
    const requiredEnvVars = [
      'CLOUDFLARE_R2_ENDPOINT',
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      'CLOUDFLARE_R2_BUCKET_NAME'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars);
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: `Missing environment variables: ${missingEnvVars.join(', ')}`
        },
        { status: 500 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const personalityType = formData.get('personalityType') as string;

    console.log('Received upload request:', {
      fileName: imageFile?.name,
      fileSize: imageFile?.size,
      fileType: imageFile?.type,
      personalityType
    });

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

    // Generate unique filename with cleaned personality type
    const fileExtension = imageFile.name.split('.').pop() || 'png';
    const cleanPersonalityType = (personalityType || 'unknown')
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')     // Remove any non-alphanumeric characters except hyphens
      .replace(/-+/g, '-')            // Replace multiple consecutive hyphens with single hyphen
      .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
    
    const fileName = `results/${cleanPersonalityType}-${nanoid()}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Cloudflare R2
    console.log('Uploading to R2:', {
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      fileName,
      fileSize: buffer.length,
      contentType: imageFile.type
    });

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

    const uploadResult = await s3Client.send(uploadCommand);
    console.log('Upload successful:', uploadResult);

    // Construct the public URL - handle both custom domain and default R2 URLs
    let publicUrl;
    if (process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      // Use custom domain or provided public URL
      publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
    } else {
      // Fallback: use bucket name with account ID (may need public access enabled)
      const accountId = process.env.CLOUDFLARE_R2_ENDPOINT?.split('//')[1]?.split('.')[0];
      publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${process.env.CLOUDFLARE_R2_BUCKET_NAME}/${fileName}`;
    }

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