import { BeaconService } from './services/BeaconService.js';
import { LotteryGenerator } from './generators/LotteryGenerator.js';
import { LotteryNumbers, GenerationError } from './types/index.js';

class LotteryApp {
  private beaconService: BeaconService;
  private lotteryGenerator: LotteryGenerator;
  private generateBtn: HTMLButtonElement;
  private loadingIndicator: HTMLElement;
  private errorMessage: HTMLElement;
  private errorText: HTMLElement;

  constructor() {
    this.beaconService = new BeaconService();
    this.lotteryGenerator = new LotteryGenerator();
    
    // Get DOM elements
    this.generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
    this.loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;
    this.errorMessage = document.getElementById('errorMessage') as HTMLElement;
    this.errorText = document.getElementById('errorText') as HTMLElement;

    this.initializeEventListeners();
    
    // Auto-generate on page load
    this.generateNumbers();
  }

  private initializeEventListeners(): void {
    this.generateBtn.addEventListener('click', () => {
      this.generateNumbers();
    });
  }

  async generateNumbers(): Promise<void> {
    try {
      this.showLoading(true);
      this.hideError();
      
      // Fetch beacon data
      const beaconData = await this.beaconService.fetchLatestBeacon();
      
      // Generate lottery numbers (now async)
      const numbers649 = await this.lotteryGenerator.generate649Numbers(beaconData.pulse.outputValue);
      const numbersMax = await this.lotteryGenerator.generateLottoMaxNumbers(beaconData.pulse.outputValue);
      
      // Validate generated numbers
      if (!this.lotteryGenerator.validateNumbers(numbers649, 6, 1, 49)) {
        throw new Error('Generated 6/49 numbers failed validation');
      }
      
      if (!this.lotteryGenerator.validateNumbers(numbersMax, 7, 1, 50)) {
        throw new Error('Generated Lotto Max numbers failed validation');
      }

      const lotteryNumbers: LotteryNumbers = {
        numbers649,
        numbersMax,
        timestamp: beaconData.pulse.timeStamp,
        outputValue: beaconData.pulse.outputValue
      };

      // Display results
      this.displayResults(lotteryNumbers);
      
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoading(false);
    }
  }

  private displayResults(lotteryNumbers: LotteryNumbers): void {
    // Display 6/49 numbers
    this.displayNumberSet('numbers649', lotteryNumbers.numbers649);
    
    // Display Lotto Max numbers
    this.displayNumberSet('numbersMax', lotteryNumbers.numbersMax);
    
    // Display beacon information
    this.displayBeaconInfo(lotteryNumbers.timestamp, lotteryNumbers.outputValue);
  }

  private displayNumberSet(containerId: string, numbers: number[]): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    const numberBalls = container.querySelectorAll('.number-ball');
    
    numbers.forEach((number, index) => {
      if (numberBalls[index]) {
        const ball = numberBalls[index] as HTMLElement;
        
        // Add animation delay for staggered effect
        setTimeout(() => {
          ball.textContent = number.toString();
          ball.style.animation = 'none';
          // Trigger reflow to restart animation
          ball.offsetHeight;
          ball.style.animation = 'fadeIn 0.5s ease';
        }, index * 100);
      }
    });
  }

  private displayBeaconInfo(timestamp: string, outputValue: string): void {
    const timestampElement = document.getElementById('beaconTimestamp');
    const outputElement = document.getElementById('beaconOutput');
    
    if (timestampElement) {
      // Format timestamp for better readability
      const date = new Date(timestamp);
      timestampElement.textContent = date.toLocaleString();
    }
    
    if (outputElement) {
      // Truncate output value for display (show first 32 characters + ellipsis)
      const truncatedOutput = outputValue.length > 32 
        ? `${outputValue.substring(0, 32)}...` 
        : outputValue;
      outputElement.textContent = truncatedOutput;
      outputElement.title = outputValue; // Show full value on hover
    }
  }

  private showLoading(show: boolean): void {
    if (show) {
      this.loadingIndicator.classList.remove('hidden');
      this.generateBtn.disabled = true;
    } else {
      this.loadingIndicator.classList.add('hidden');
      this.generateBtn.disabled = false;
    }
  }

  private hideError(): void {
    this.errorMessage.classList.add('hidden');
  }

  private handleError(error: unknown): void {
    console.error('Lottery generation error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      const errorWithType = error as Error & { errorType?: GenerationError['type'] };
      
      switch (errorWithType.errorType) {
        case 'network':
          errorMessage = `Network Error: ${error.message}`;
          break;
        case 'api':
          errorMessage = `API Error: ${error.message}`;
          break;
        case 'generation':
          errorMessage = `Generation Error: ${error.message}`;
          break;
        default:
          errorMessage = error.message;
      }
    }
    
    this.showError(errorMessage);
  }

  private showError(message: string): void {
    this.errorText.textContent = message;
    this.errorMessage.classList.remove('hidden');
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LotteryApp();
}); 