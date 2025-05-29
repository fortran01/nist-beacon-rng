# NIST Beacon Random Number Generator

A TypeScript library and example application demonstrating how to use NIST's Randomness Beacon service for cryptographically secure random number generation in client-side applications.

## Overview

The NIST Randomness Beacon is a public service that provides cryptographically secure random values at regular intervals. This project demonstrates how to integrate the beacon into web applications for true random number generation, using lottery number generation as a practical example.

## What is NIST Randomness Beacon?

The NIST Randomness Beacon is operated by the National Institute of Standards and Technology (NIST) and provides:

- **Cryptographically Secure Randomness**: 512-bit random values generated every 60 seconds
- **Public Verifiability**: All beacon outputs are digitally signed and publicly auditable
- **Deterministic Results**: Same beacon pulse always produces the same derived values
- **High Entropy**: Each output contains 512 bits of entropy from multiple sources
- **Tamper Evidence**: Cryptographic signatures ensure data integrity

## Example Application: Lottery Number Generator

This repository includes a complete example application that generates lottery numbers using NIST beacon data:

- **OLG 6/49**: 6 unique numbers from 1-49
- **Lotto Max**: 7 unique numbers from 1-50
- **Deterministic**: Same beacon pulse always generates identical numbers
- **Verifiable**: Results can be independently verified using the beacon data

## Key Features

### 🔐 Cryptographic Security
- Uses NIST's cryptographically secure random beacon
- 512-bit entropy per beacon pulse
- Digitally signed and verifiable outputs

### 🎯 Deterministic Generation
- Same beacon pulse produces identical results
- Reproducible across different systems
- Perfect for applications requiring verifiable randomness

### 🌐 Client-Side Implementation
- Pure browser-based solution
- No server-side dependencies
- Real-time beacon data fetching

### 🛡️ Robust Error Handling
- Network timeout management
- API validation and error recovery
- Graceful degradation strategies

### 🎨 Modern Architecture
- TypeScript for type safety
- Modular component design
- Comprehensive testing capabilities

## Technical Implementation

### Core Components

#### BeaconService
Handles integration with NIST's Randomness Beacon API:
- Fetches latest beacon pulses
- Validates response integrity
- Manages network errors and timeouts
- Ensures data quality and format

#### Random Number Generator
Converts beacon hex data into usable random numbers:
- Seeded Linear Congruential Generator (LCG)
- Fisher-Yates shuffle for unique selections
- Configurable ranges and constraints
- Validation of generated outputs

#### Example Application
Demonstrates practical usage with lottery number generation:
- Real-time beacon data integration
- Interactive user interface
- Visual feedback and animations
- Error handling and recovery

### Algorithm Details

1. **Beacon Data Retrieval**: Fetch latest pulse from NIST API
2. **Seed Extraction**: Use beacon's `outputValue` as cryptographic seed
3. **Number Generation**: Apply seeded PRNG with Fisher-Yates shuffle
4. **Validation**: Ensure outputs meet specified constraints
5. **Display**: Present results with beacon metadata

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- Modern web browser with ES2020 support
- Internet connection for beacon API access

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nist-beacon-rng
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Reference

### NIST Randomness Beacon API

- **Endpoint**: `https://beacon.nist.gov/beacon/2.0/pulse/last`
- **Method**: GET
- **Response Format**: JSON
- **Update Frequency**: Every 60 seconds
- **Output Size**: 512 bits (128 hex characters)

### Example Response Structure

```json
{
  "pulse": {
    "outputValue": "AC2C9F31B204B772...",
    "timeStamp": "2024-01-15T12:00:00.000Z",
    "statusCode": 0,
    "signatureValue": "...",
    // ... additional metadata
  }
}
```

### Integration Example

```typescript
import { BeaconService } from './services/BeaconService';
import { LotteryGenerator } from './generators/LotteryGenerator';

const beaconService = new BeaconService();
const generator = new LotteryGenerator();

// Fetch beacon data
const beacon = await beaconService.fetchLatestBeacon();

// Generate random numbers
const randomNumbers = generator.generateUniqueNumbers(
  beacon.pulse.outputValue, 
  6,  // count
  1,  // min
  49  // max
);
```

## Use Cases

### Suitable Applications
- **Gaming and Lotteries**: Fair, verifiable random number generation
- **Cryptographic Applications**: Seed generation for keys and nonces
- **Scientific Simulations**: Reproducible random sequences
- **Auditable Systems**: Applications requiring verifiable randomness
- **Blockchain Applications**: Deterministic randomness for smart contracts

### Considerations
- **Update Frequency**: New values every 60 seconds
- **Network Dependency**: Requires internet access to NIST servers
- **Deterministic Nature**: Same pulse always produces same results
- **Public Data**: All beacon values are publicly available

## Project Structure

```
nist-beacon-rng/
├── src/
│   ├── services/
│   │   └── BeaconService.ts      # NIST Beacon API integration
│   ├── generators/
│   │   └── LotteryGenerator.ts   # Random number generation logic
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── main.ts                   # Example application
├── index.html                    # Example UI
├── style.css                     # Styling for example
└── README.md                     # This file
```

## Security Considerations

### Strengths
- **NIST-Grade Security**: Cryptographically secure random source
- **Public Auditability**: All outputs are publicly verifiable
- **Tamper Evidence**: Digital signatures prevent data manipulation
- **No Local Entropy**: Eliminates concerns about local randomness quality

### Limitations
- **Network Dependency**: Requires connection to NIST servers
- **Update Frequency**: Limited to 60-second intervals
- **Public Visibility**: All beacon values are publicly known
- **Deterministic**: Not suitable for applications requiring true unpredictability

## Browser Compatibility

- Chrome/Edge 80+
- Firefox 72+
- Safari 13.1+
- Modern browsers with ES2020 and Fetch API support

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:

- Additional example applications
- Performance improvements
- Enhanced error handling
- Documentation updates
- Test coverage expansion

## License

MIT License - see LICENSE file for details

## Resources

- [NIST Randomness Beacon Documentation](https://www.nist.gov/programs-projects/nist-randomness-beacon)
- [Beacon API Specification](https://beacon.nist.gov/home)
- [Cryptographic Standards](https://csrc.nist.gov/)

## Disclaimer

This project is for educational and demonstration purposes. While NIST's Randomness Beacon provides cryptographically secure random values, users should evaluate the suitability for their specific use cases. The lottery number generation example is for entertainment purposes only and should not be considered as gambling advice. 