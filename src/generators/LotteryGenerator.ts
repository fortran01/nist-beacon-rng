import { GenerationError } from '../types/index.js';

export class LotteryGenerator {
  /**
   * Generate 6/49 lottery numbers (6 unique numbers from 1-49)
   */
  async generate649Numbers(seed: string): Promise<number[]> {
    try {
      const derivedSeed = this.deriveSeed(seed, '649');
      return this.generateUniqueNumbers(derivedSeed, 6, 1, 49);
    } catch (error) {
      throw this.createError('Failed to generate 6/49 numbers', error);
    }
  }

  /**
   * Generate Lotto Max numbers (7 unique numbers from 1-50)
   */
  async generateLottoMaxNumbers(seed: string): Promise<number[]> {
    try {
      // Use HMAC-based derivation for independent seed
      const derivedSeed = this.deriveSeed(seed, 'max');
      return this.generateUniqueNumbers(derivedSeed, 7, 1, 50);
    } catch (error) {
      throw this.createError('Failed to generate Lotto Max numbers', error);
    }
  }

  /**
   * Derive a cryptographically independent seed using HMAC-SHA256
   * This ensures different lottery types get completely independent randomness
   */
  private async deriveSeed(beacon: string, purpose: string): Promise<Uint8Array> {
    // Convert beacon hex string to bytes
    const beaconBytes = this.hexToBytes(beacon);
    
    // Use Web Crypto API's HMAC-SHA256 for seed derivation
    const key = await crypto.subtle.importKey(
      'raw',
      beaconBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const purposeBytes = new TextEncoder().encode(purpose);
    const signature = await crypto.subtle.sign('HMAC', key, purposeBytes);
    
    return new Uint8Array(signature);
  }

  /**
   * Generate a set of unique numbers within a range using Fisher-Yates shuffle
   * Now uses full in-place shuffle with CSPRNG instead of repeated splice
   */
  private async generateUniqueNumbers(seedPromise: Promise<Uint8Array>, count: number, min: number, max: number): Promise<number[]> {
    if (count > (max - min + 1)) {
      throw new Error(`Cannot generate ${count} unique numbers from range ${min}-${max}`);
    }

    const seed = await seedPromise;
    const rng = this.createCSPRNG(seed);

    // Create pool of all possible numbers
    const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);

    // Full in-place Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Take first 'count' elements and sort for consistent display
    return pool.slice(0, count).sort((a, b) => a - b);
  }

  /**
   * Create a cryptographically secure pseudo-random number generator
   * Uses ChaCha20-based CSPRNG for browser compatibility and security
   */
  private createCSPRNG(seed: Uint8Array): () => number {
    // Initialize ChaCha20-like state with seed
    let state = new Uint32Array(16);
    
    // Initialize with seed (first 32 bytes = 8 uint32s)
    for (let i = 0; i < 8 && i * 4 < seed.length; i++) {
      state[i] = (seed[i * 4] | 
                 (seed[i * 4 + 1] << 8) | 
                 (seed[i * 4 + 2] << 16) | 
                 (seed[i * 4 + 3] << 24)) >>> 0;
    }
    
    // Constants for ChaCha20
    state[8] = 0x61707865;   // "expa"
    state[9] = 0x3320646e;   // "nd 3"
    state[10] = 0x79622d32;  // "2-by"
    state[11] = 0x6b206574;  // "te k"
    
    // Counter and nonce
    state[12] = 0;
    state[13] = 0;
    state[14] = 0;
    state[15] = 0;

    let bufferIndex = 16; // Force initial generation
    let buffer = new Uint32Array(16);

    return (): number => {
      if (bufferIndex >= 16) {
        // Generate new block
        this.chachaBlock(state, buffer);
        state[12] = (state[12] + 1) >>> 0; // Increment counter
        if (state[12] === 0) state[13] = (state[13] + 1) >>> 0;
        bufferIndex = 0;
      }
      
      // Convert uint32 to float in [0, 1)
      const value = buffer[bufferIndex++];
      return value / 0x100000000; // 2^32
    };
  }

  /**
   * ChaCha20 quarter round function
   */
  private quarterRound(a: number, b: number, c: number, d: number, state: Uint32Array): void {
    state[a] = (state[a] + state[b]) >>> 0;
    state[d] ^= state[a];
    state[d] = ((state[d] << 16) | (state[d] >>> 16)) >>> 0;
    
    state[c] = (state[c] + state[d]) >>> 0;
    state[b] ^= state[c];
    state[b] = ((state[b] << 12) | (state[b] >>> 20)) >>> 0;
    
    state[a] = (state[a] + state[b]) >>> 0;
    state[d] ^= state[a];
    state[d] = ((state[d] << 8) | (state[d] >>> 24)) >>> 0;
    
    state[c] = (state[c] + state[d]) >>> 0;
    state[b] ^= state[c];
    state[b] = ((state[b] << 7) | (state[b] >>> 25)) >>> 0;
  }

  /**
   * ChaCha20 block function
   */
  private chachaBlock(input: Uint32Array, output: Uint32Array): void {
    // Copy input to working state
    const working = new Uint32Array(input);
    
    // 20 rounds (10 double rounds)
    for (let i = 0; i < 10; i++) {
      // Column rounds
      this.quarterRound(0, 4, 8, 12, working);
      this.quarterRound(1, 5, 9, 13, working);
      this.quarterRound(2, 6, 10, 14, working);
      this.quarterRound(3, 7, 11, 15, working);
      
      // Diagonal rounds
      this.quarterRound(0, 5, 10, 15, working);
      this.quarterRound(1, 6, 11, 12, working);
      this.quarterRound(2, 7, 8, 13, working);
      this.quarterRound(3, 4, 9, 14, working);
    }
    
    // Add input to working state
    for (let i = 0; i < 16; i++) {
      output[i] = (working[i] + input[i]) >>> 0;
    }
  }

  /**
   * Convert hex string to bytes, using full entropy from beacon
   */
  private hexToBytes(hex: string): Uint8Array {
    // Remove any whitespace and ensure even length
    const cleanHex = hex.replace(/\s/g, '');
    if (cleanHex.length % 2 !== 0) {
      throw new Error('Invalid hex string: odd length');
    }

    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = parseInt(cleanHex.substr(i, 2), 16);
      if (isNaN(byte)) {
        throw new Error('Invalid hex character in beacon value');
      }
      bytes[i / 2] = byte;
    }
    
    return bytes;
  }

  /**
   * Validate that the generated numbers meet lottery requirements
   */
  validateNumbers(numbers: number[], expectedCount: number, min: number, max: number): boolean {
    // Check count
    if (numbers.length !== expectedCount) {
      return false;
    }

    // Check uniqueness
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== expectedCount) {
      return false;
    }

    // Check range
    for (const num of numbers) {
      if (num < min || num > max || !Number.isInteger(num)) {
        return false;
      }
    }

    return true;
  }

  private createError(message: string, originalError?: unknown): Error {
    const error = new Error(message) as Error & { errorType: GenerationError['type'] };
    error.errorType = 'generation';
    
    if (originalError instanceof Error) {
      error.message += `: ${originalError.message}`;
      // Preserve original stack trace for debugging
      if (originalError.stack) {
        error.stack = originalError.stack;
      }
    }
    
    return error;
  }
} 