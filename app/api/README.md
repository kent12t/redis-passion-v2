# API Documentation

## Upload Image API

This API provides functionality to upload images to Cloudflare R2 storage using Vercel Edge Functions.

### Endpoint

`POST /api/upload-image`

### Features

- **Edge Function**: Runs on Vercel Edge Runtime for optimal performance
- **Cloudflare R2**: Uses AWS S3 compatible API to store images
- **Unique Filenames**: Generates unique filenames using nanoid
- **File Validation**: Validates image file types
- **Metadata**: Stores personality type and upload timestamp

### Setup

1. **Install Dependencies** (already done):
   ```bash
   npm install @aws-sdk/client-s3 nanoid
   ```

2. **Environment Variables**: Add these to your `.env.local` file:
   ```env
   CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
   CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
   CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
   ```

3. **Cloudflare R2 Setup**:
   - Create an R2 bucket in Cloudflare Dashboard
   - Generate API tokens with R2 read/write permissions
   - Set up custom domain for public access (optional)
   - Configure CORS if accessing from different domains

### Request Format

The API expects a `multipart/form-data` request with:

- `image`: Image file (File object)
- `personalityType`: String identifying the personality type

### Response Format

**Success Response (200)**:
```json
{
  "success": true,
  "url": "https://your-domain.com/results/personality-type-abc123.png",
  "fileName": "results/personality-type-abc123.png",
  "message": "Image uploaded successfully"
}
```

**Error Response (400/500)**:
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Usage in Components

The upload functionality is integrated into `ResultPage.tsx`:

1. **Screenshot & Upload**: Camera button captures the canvas and uploads directly to R2
2. **View**: Success message shows with a link to view the uploaded image
3. **Loading State**: Camera button shows pulsing animation while uploading

### File Structure

```
app/
├── api/
│   ├── upload-image/
│   │   └── route.ts           # Edge function for R2 upload
│   └── README.md             # This documentation
├── lib/
│   ├── upload-utils.ts       # Utility functions for image handling
│   └── types.ts             # TypeScript type definitions
└── components/
    └── ResultPage.tsx        # Updated with upload functionality
```

### Error Handling

The API includes comprehensive error handling for:

- Missing or invalid files
- File type validation
- R2 upload failures
- Network connectivity issues
- Invalid environment configuration

### Security Considerations

- Environment variables should be kept secure
- R2 bucket permissions should be properly configured
- Consider implementing rate limiting for production use
- Validate file sizes to prevent abuse

### Cloudflare R2 Configuration

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard > R2 Object Storage
   - Create a new bucket
   - Note the bucket name for your environment variables

2. **Generate API Tokens**:
   - Go to Cloudflare Dashboard > My Profile > API Tokens
   - Create a custom token with R2:Edit permissions
   - Note the Access Key ID and Secret Access Key

3. **Get Account ID**:
   - Found in the right sidebar of your Cloudflare dashboard
   - Use this in your R2 endpoint URL

4. **Custom Domain (Optional)**:
   - Connect a custom domain to your R2 bucket
   - Use this domain for the `CLOUDFLARE_R2_PUBLIC_URL`
   - Ensures consistent public URLs for uploaded images 