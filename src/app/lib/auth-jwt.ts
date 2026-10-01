// src/app/lib/auth-jwt.ts

const JWT_SECRET = process.env.JWT_SECRET || 'maa-gauri-pvt-iti-erp-secure-secret-key-2026-min-entropy';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64urlEncode(str: string): string {
  const bytes = encoder.encode(str);
  let binString = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binString = atob(base64);
  const bytes = new Uint8Array(binString.length);
  for (let i = 0; i < binString.length; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return decoder.decode(bytes);
}

function base64urlDecodeToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binString = atob(base64);
  const bytes = new Uint8Array(binString.length);
  for (let i = 0; i < binString.length; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Sign a JWT using HMAC-SHA256 with Web Crypto API
 */
export async function signJWT(payload: any, expiresInSeconds: number = 86400): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerStr = base64urlEncode(JSON.stringify(header));
  
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const iat = Math.floor(Date.now() / 1000);
  const payloadStr = base64urlEncode(JSON.stringify({ ...payload, exp, iat }));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${headerStr}.${payloadStr}`)
  );

  const signatureBytes = new Uint8Array(signature);
  let signatureBin = "";
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    signatureBin += String.fromCharCode(signatureBytes[i]);
  }
  const signatureStr = btoa(signatureBin).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${headerStr}.${payloadStr}.${signatureStr}`;
}

/**
 * Verify a JWT using strict HMAC-SHA256 signature verification & expiration check
 */
export async function verifyJWT(token: string): Promise<any | null> {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerStr, payloadStr, signatureStr] = parts;

    // Verify header algorithm to prevent algorithm confusion attacks
    const header = JSON.parse(base64urlDecode(headerStr));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      return null;
    }

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64urlDecodeToBytes(signatureStr);
    
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as any,
      encoder.encode(`${headerStr}.${payloadStr}`)
    );

    if (!valid) return null;

    const decodedPayload = JSON.parse(base64urlDecode(payloadStr));
    
    // Check expiry
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < nowInSeconds) {
      return null; // Expired
    }

    // Check issued-at (prevent future tokens)
    if (decodedPayload.iat && decodedPayload.iat > nowInSeconds + 300) {
      return null;
    }

    return decodedPayload;
  } catch (err) {
    return null;
  }
}
