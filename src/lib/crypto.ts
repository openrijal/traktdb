/**
 * Simple AES-GCM encryption wrapper using Web Crypto API.
 * Requires ENCRYPTION_KEY environment variable (32 bytes hex).
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 12 bytes for GCM

function getKeyMaterial(hexKey: string): Promise<CryptoKey> {
    const keyBytes = new Uint8Array(
        hexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    return crypto.subtle.importKey(
        'raw',
        keyBytes,
        ALGORITHM,
        false,
        ['encrypt', 'decrypt']
    );
}

// Helper: Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Helper: Convert Hex String to Uint8Array
function hexToBuffer(hex: string): Uint8Array {
    return new Uint8Array(
        hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
}


export async function encrypt(text: string, envKey: string): Promise<string> {
    const key = await getKeyMaterial(envKey);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        encoder.encode(text)
    );

    // Return format: IV_HEX:CIPHERTEXT_HEX
    return `${bufferToHex(iv)}:${bufferToHex(encrypted)}`;
}

export async function decrypt(ciphertext: string, envKey: string): Promise<string> {
    const [ivHex, dataHex] = ciphertext.split(':');
    if (!ivHex || !dataHex) throw new Error('Invalid ciphertext format');

    const key = await getKeyMaterial(envKey);
    const iv = hexToBuffer(ivHex);
    const data = hexToBuffer(dataHex);

    const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv: iv as any },
        key,
        data as any
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}
