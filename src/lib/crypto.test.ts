
import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from './crypto';

// 32 bytes hex key
const TEST_KEY = '39d2d54d0b060773607f848873038945a337ffece1227ae51a1ca764b64fe4c1';

describe('Crypto Utilities', () => {

    // We rely on Web Crypto API which is available in Node 19+ and modern browsers.
    // Vitest with happy-dom/jsdom or native node should support it if on recent Node.

    it('should encrypt and decrypt a string correctly', async () => {
        const text = 'Hello World';
        const encrypted = await encrypt(text, TEST_KEY);

        expect(encrypted).not.toBe(text);
        expect(encrypted).toContain(':'); // IV:Cipher split

        const decrypted = await decrypt(encrypted, TEST_KEY);
        expect(decrypted).toBe(text);
    });

    it('should fail to decrypt with wrong key', async () => {
        const text = 'Secret Data';
        const encrypted = await encrypt(text, TEST_KEY);

        // Different key
        const wrongKey = '00'.repeat(32);

        await expect(decrypt(encrypted, wrongKey)).rejects.toThrow();
    });

    it('should fail to decrypt malformed ciphertext', async () => {
        await expect(decrypt('invalidformat', TEST_KEY)).rejects.toThrow('Invalid ciphertext format');
    });
});
