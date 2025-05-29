import { GenerationError } from '../types/index.js';

export class LotteryGenerator {
  /**
   * Generate 6/49 lottery numbers (6 unique numbers from 1-49)
   */
  generate649Numbers(seed: string): number[] {
    try {
      return this.generateUniqueNumbers(seed, 6, 1, 49);
    } catch (error) {
      throw this.createError('Failed to generate 6/49 numbers', error);
    }
  }

  /**
   * Generate Lotto Max numbers (7 unique numbers from 1-50)
   */
  generateLottoMaxNumbers(seed: string): number[] {
    try {
      // Use a different part of the seed for Lotto Max to ensure different results
      const offsetSeed = this.offsetSeed(seed, 32);
      return this.generateUniqueNumbers(offsetSeed, 7, 1, 50);
    } catch (error) {
      throw this.createError('Failed to generate Lotto Max numbers', error);
    }
  }

  /**
   * Generate a set of unique numbers within a range using Fisher-Yates shuffle
   */
  private generateUniqueNumbers(seed: string, count: number, min: number, max: number): number[] {
    if (count > (max - min + 1)) {
      throw new Error(`Cannot generate ${count} unique numbers from range ${min}-${max}`);
    }

    // Create array of all possible numbers
    const numbers: number[] = [];
    for (let i = min; i <= max; i++) {
      numbers.push(i);
    }

    // Create a seeded random number generator
    const rng = this.createSeededRNG(seed);

    // Fisher-Yates shuffle to select unique numbers
    const selected: number[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(rng() * numbers.length);
      selected.push(numbers[randomIndex]);
      numbers.splice(randomIndex, 1);
    }

    // Sort the selected numbers for consistent display
    return selected.sort((a, b) => a - b);
  }

  /**
   * Create a seeded pseudo-random number generator using a simple LCG
   * This ensures deterministic results from the same seed
   */
  private createSeededRNG(seed: string): () => number {
    // Convert hex seed to numeric seed
    let numericSeed = this.hexToNumericSeed(seed);

    // Linear Congruential Generator parameters (from Numerical Recipes)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    return (): number => {
      numericSeed = (a * numericSeed + c) % m;
      return numericSeed / m;
    };
  }

  /**
   * Convert hex string to numeric seed
   */
  private hexToNumericSeed(hex: string): number {
    // Take first 8 hex characters (32 bits) and convert to number
    const hexSubstring = hex.substring(0, 8);
    const seed = parseInt(hexSubstring, 16);
    
    // Ensure we have a valid seed
    if (isNaN(seed)) {
      throw new Error('Invalid hex seed provided');
    }
    
    return seed;
  }

  /**
   * Create an offset version of the seed for generating different number sets
   */
  private offsetSeed(seed: string, offset: number): string {
    if (seed.length < offset * 2) {
      // If seed is too short, repeat it
      const repeatedSeed = seed.repeat(Math.ceil((offset * 2) / seed.length));
      return repeatedSeed.substring(offset, offset + seed.length);
    }
    
    // Use a different part of the seed
    return seed.substring(offset, offset + Math.min(seed.length - offset, 32));
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
    }
    
    return error;
  }
} 