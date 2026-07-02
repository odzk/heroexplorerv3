import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { HttpError } from '../middleware/error';

// ============================================================================
// AWS S3 image storage (SDK v3, lazy-initialized from env).
// Replaces the legacy `Customization.uploadFile` (aws-sdk v2 + hardcoded IAM
// creds). Used to store white-label logos.
// ============================================================================

let s3: S3Client | null = null;

function getS3(): S3Client {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new HttpError(501, 'S3 storage is not configured (AWS credentials missing)');
  }
  if (!s3) {
    s3 = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
}

const DATA_URI = /^data:(.+?);base64,(.*)$/s;

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a base64 (optionally data-URI) image to S3 and return its public URL.
 * Accepts either a full `data:image/png;base64,....` URI or a raw base64 string
 * (in which case `contentType` should be supplied).
 */
export async function uploadBase64Image(params: {
  data: string;
  fileName: string;
  contentType?: string;
}): Promise<UploadResult> {
  let contentType = params.contentType ?? 'application/octet-stream';
  let base64 = params.data;

  const match = DATA_URI.exec(params.data);
  if (match) {
    contentType = match[1];
    base64 = match[2];
  }

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) throw new HttpError(400, 'Invalid or empty image data');
  if (buffer.length > 5 * 1024 * 1024) throw new HttpError(413, 'Image exceeds 5MB limit');

  const key = `${env.AWS_S3_PREFIX}/${params.fileName}`;

  await getS3().send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return {
    key,
    url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
  };
}

export const isStorageEnabled = (): boolean =>
  Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);
