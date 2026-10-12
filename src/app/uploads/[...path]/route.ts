import { NextRequest, NextResponse } from 'next/server';
import { getBackendCandidates } from '../../../lib/api-proxy-candidates';
import fs from 'fs';
import path from 'path';

let cachedBackendUrl: string | null = null;

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

async function proxyUpload(request: NextRequest, targetUrl: string): Promise<Response> {
  const forwardHeaders = new Headers();
  forwardHeaders.set('accept', request.headers.get('accept') || '*/*');

  return fetch(targetUrl, {
    method: 'GET',
    headers: forwardHeaders,
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const filename = resolvedParams.path.join('/');

  if (filename.toLowerCase().includes('receipt')) {
    return NextResponse.json(
      { error: 'Access denied: Payment receipts require authenticated access via transactions API.' },
      { status: 403 }
    );
  }

  // 1. Direct local filesystem check in public/uploads
  const localFilePath = path.join(process.cwd(), 'public', 'uploads', filename);
  if (fs.existsSync(localFilePath)) {
    try {
      const ext = path.extname(filename).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const buffer = fs.readFileSync(localFilePath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (_) {
      // Fall through to network candidates on read error
    }
  }

  const candidates = getBackendCandidates(cachedBackendUrl, process.env.INTERNAL_API_URL);
  if (process.platform === 'win32' && !candidates.includes('http://127.0.0.1:5000')) {
    candidates.push('http://127.0.0.1:5000');
  }

  for (const baseUrl of candidates) {
    // Try primary /uploads/:filename endpoint on server disk
    const targetUrl = `${baseUrl}/uploads/${filename}`;
    try {
      const res = await proxyUpload(request, targetUrl);
      if (res.ok) {
        if (cachedBackendUrl !== baseUrl) {
          cachedBackendUrl = baseUrl;
        }
        const headers = new Headers();
        res.headers.forEach((val, key) => {
          if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
        return new NextResponse(res.body, {
          status: res.status,
          headers,
        });
      }

      // If 404 on /uploads/, fallback to /api/upload/:id or filename on backend
      const fallbackUrl = `${baseUrl}/api/upload/${filename}`;
      const fallbackRes = await proxyUpload(request, fallbackUrl);
      if (fallbackRes.ok) {
        if (cachedBackendUrl !== baseUrl) {
          cachedBackendUrl = baseUrl;
        }
        const headers = new Headers();
        fallbackRes.headers.forEach((val, key) => {
          if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
        return new NextResponse(fallbackRes.body, {
          status: fallbackRes.status,
          headers,
        });
      }
    } catch (_) {
      // Continue to next candidate
    }
  }

  return NextResponse.json({ error: 'Image file not found on server' }, { status: 404 });
}
