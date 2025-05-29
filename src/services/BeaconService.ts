import { BeaconResponse, GenerationError } from '../types/index.js';

export class BeaconService {
  private static readonly BEACON_URL = 'https://beacon.nist.gov/beacon/2.0/pulse/last';
  private static readonly TIMEOUT_MS = 10000; // 10 seconds

  async fetchLatestBeacon(): Promise<BeaconResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), BeaconService.TIMEOUT_MS);

      const response = await fetch(BeaconService.BEACON_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as BeaconResponse;
      
      // Validate the response structure
      this.validateBeaconResponse(data);
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createError('Request timeout - NIST Beacon service is not responding', 'network');
        }
        if (error.message.includes('Failed to fetch')) {
          throw this.createError('Network error - Unable to connect to NIST Beacon service', 'network');
        }
        throw this.createError(`API Error: ${error.message}`, 'api');
      }
      throw this.createError('Unknown error occurred while fetching beacon data', 'api');
    }
  }

  private validateBeaconResponse(data: any): asserts data is BeaconResponse {
    if (!data || typeof data !== 'object') {
      throw this.createError('Invalid response format from NIST Beacon', 'api');
    }

    if (!data.pulse || typeof data.pulse !== 'object') {
      throw this.createError('Missing pulse data in beacon response', 'api');
    }

    const { pulse } = data;

    if (!pulse.outputValue || typeof pulse.outputValue !== 'string') {
      throw this.createError('Missing or invalid outputValue in beacon response', 'api');
    }

    if (!pulse.timeStamp || typeof pulse.timeStamp !== 'string') {
      throw this.createError('Missing or invalid timeStamp in beacon response', 'api');
    }

    // Validate outputValue is a valid hex string
    if (!/^[0-9A-Fa-f]+$/.test(pulse.outputValue)) {
      throw this.createError('Invalid hex format in outputValue', 'api');
    }

    // Ensure outputValue has sufficient entropy (at least 64 hex characters = 256 bits)
    if (pulse.outputValue.length < 64) {
      throw this.createError('Insufficient entropy in outputValue', 'api');
    }
  }

  private createError(message: string, type: GenerationError['type']): Error {
    const error = new Error(message) as Error & { errorType: GenerationError['type'] };
    error.errorType = type;
    return error;
  }
} 