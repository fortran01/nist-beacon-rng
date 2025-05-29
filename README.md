# NIST Beacon Random Number Generator

A TypeScript library and example application demonstrating how to use NIST's Randomness Beacon service for cryptographically secure random number generation in client-side applications.

## Overview

The NIST Randomness Beacon is a public service that provides cryptographically secure random values at regular intervals. This project demonstrates how to integrate the beacon into web applications for true random number generation, using lottery number generation as a practical example with enterprise-grade cryptographic security.

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
- **Cryptographically Secure**: Uses enterprise-grade CSPRNG algorithms

## Key Features

### 🔐 Cryptographic Security
- Uses NIST's cryptographically secure random beacon
- Full 512-bit entropy preservation (no truncation)
- ChaCha20-based CSPRNG for output generation
- HMAC-SHA256 seed derivation for independence
- Resistant to state recovery attacks

### 🎯 Deterministic Generation
- Same beacon pulse produces identical results
- Reproducible across different systems
- Perfect for applications requiring verifiable randomness

### 🌐 Client-Side Implementation
- Pure browser-based solution using Web Crypto API
- No server-side dependencies
- Real-time beacon data fetching

### 🛡️ Robust Error Handling
- Network timeout management
- API validation and error recovery
- Stack trace preservation for debugging
- Graceful degradation strategies

### 🎨 Modern Architecture
- TypeScript for type safety
- Async/await patterns for crypto operations
- Modular component design
- Comprehensive testing capabilities

## Technical Implementation

### Core Components

#### BeaconService
Handles integration with NIST's Randomness Beacon API:
- Fetches latest beacon pulses
- Validates response integrity and entropy requirements
- Manages network errors and timeouts
- Ensures minimum 64 hex characters (256 bits) of entropy

#### Cryptographically Secure Random Number Generator
Converts beacon hex data into usable random numbers using enterprise-grade algorithms:

**Seed Derivation:**
- **HMAC-SHA256**: Derives independent 256-bit seeds per lottery type
- **Full Entropy**: Uses complete beacon output (512+ bits) instead of truncation
- **Independence**: `HMAC(beacon, '649')` and `HMAC(beacon, 'max')` ensure no correlation

**Random Number Generation:**
- **ChaCha20 CSPRNG**: Industry-standard cryptographically secure algorithm
- **256-bit Internal State**: Proper initialization from derived seed
- **Counter Mode**: Safe for generating long sequences
- **Uniform Distribution**: Converts 32-bit values to [0,1) range

**Number Selection:**
- **Fisher-Yates Shuffle**: Full in-place shuffle eliminates selection bias
- **Cryptographic Source**: Uses CSPRNG output for all randomness
- **Validation**: Ensures outputs meet specified constraints

#### Example Application
Demonstrates practical usage with lottery number generation:
- Async/await patterns for crypto operations
- Real-time beacon data integration
- Interactive user interface with error handling
- Visual feedback and animations

### Algorithm Details

1. **Beacon Data Retrieval**: Fetch latest pulse from NIST API
   ```typescript
   const beacon = await beaconService.fetchLatestBeacon();
   ```

2. **Seed Derivation**: Use HMAC-SHA256 for independent seeds
   ```typescript
   const key = await crypto.subtle.importKey('raw', beaconBytes, 
     { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
   const signature = await crypto.subtle.sign('HMAC', key, purposeBytes);
   ```

3. **CSPRNG Initialization**: ChaCha20-based secure generator
   ```typescript
   const rng = createCSPRNG(derivedSeed); // 256-bit seed → secure output
   ```

4. **Number Selection**: Full Fisher-Yates shuffle
   ```typescript
   for (let i = pool.length - 1; i > 0; i--) {
     const j = Math.floor(rng() * (i + 1));
     [pool[i], pool[j]] = [pool[j], pool[i]];
   }
   ```

5. **Validation**: Ensure outputs meet specified constraints
6. **Display**: Present results with beacon metadata

### Security Architecture

```
NIST Beacon (512+ bits)
    ↓
HMAC-SHA256 Derivation (256 bits per lottery type)
    ↓
ChaCha20 CSPRNG (cryptographically secure)
    ↓
Fisher-Yates Shuffle (unbiased selection)
    ↓
Lottery Numbers (sorted for display)
```

### Cryptographic Guarantees

- **No Bias**: Full Fisher-Yates shuffle ensures uniform distribution
- **Independence**: HMAC derivation prevents correlation between draws
- **Forward Security**: ChaCha20 design prevents state recovery
- **Full Entropy**: Complete beacon value used (no information loss)
- **Deterministic**: Same beacon always produces same results

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- Modern web browser with Web Crypto API support
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

4. Open your browser and navigate to the provided URL (typically `http://localhost:3000` or `http://localhost:3001`)

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

// Generate cryptographically secure random numbers
const numbers649 = await generator.generate649Numbers(beacon.pulse.outputValue);
const numbersMax = await generator.generateLottoMaxNumbers(beacon.pulse.outputValue);
```

## Use Cases

### Suitable Applications
- **Gaming and Lotteries**: Fair, verifiable random number generation
- **Cryptographic Applications**: Seed generation for keys and nonces
- **Scientific Simulations**: Reproducible random sequences
- **Security Audits**: Applications requiring tamper-evident randomness
- **Blockchain Applications**: Deterministic randomness for smart contracts
- **Financial Systems**: High-stakes applications requiring cryptographic security

### Considerations
- **Update Frequency**: New values every 60 seconds
- **Network Dependency**: Requires internet access to NIST servers
- **Deterministic Nature**: Same pulse always produces same results
- **Public Data**: All beacon values are publicly available
- **Browser Support**: Requires Web Crypto API support

## Project Structure

```
nist-beacon-rng/
├── src/
│   ├── services/
│   │   └── BeaconService.ts      # NIST Beacon API integration
│   ├── generators/
│   │   └── LotteryGenerator.ts   # Cryptographically secure RNG
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
- **ChaCha20 CSPRNG**: Industry-standard secure algorithm
- **Full Entropy Preservation**: No information loss from beacon
- **HMAC Seed Derivation**: Cryptographically independent seeds
- **Public Auditability**: All outputs are publicly verifiable
- **Tamper Evidence**: Digital signatures prevent data manipulation
- **Forward Security**: Previous states cannot be recovered

### Limitations
- **Network Dependency**: Requires connection to NIST servers
- **Update Frequency**: Limited to 60-second intervals
- **Public Visibility**: All beacon values are publicly known
- **Deterministic**: Not suitable for applications requiring true unpredictability
- **Browser Requirements**: Needs Web Crypto API support

### Security Audit Notes
- Implemented ChaCha20 with 20 rounds (industry standard)
- HMAC-SHA256 provides cryptographic independence
- Fisher-Yates shuffle eliminates statistical bias
- No seed truncation preserves full beacon entropy
- Async crypto operations prevent blocking

## Browser Compatibility

- Chrome/Edge 60+ (Web Crypto API)
- Firefox 72+ (Web Crypto API)
- Safari 13.1+ (Web Crypto API)
- Modern browsers with ES2020 and Web Crypto API support

## Performance Characteristics

- **Initialization**: ~1-5ms for seed derivation (async)
- **Generation**: ~0.1ms per number after initialization
- **Memory**: ~1KB for CSPRNG state
- **Network**: One HTTPS request per generation cycle

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:

- Additional cryptographic algorithms
- Performance optimizations
- Enhanced security features
- Documentation updates
- Test coverage expansion
- Security audit improvements

## License

MIT License - see LICENSE file for details

## Resources

- [NIST Randomness Beacon Documentation](https://www.nist.gov/programs-projects/nist-randomness-beacon)
- [Beacon API Specification](https://beacon.nist.gov/home)
- [ChaCha20 Specification (RFC 8439)](https://tools.ietf.org/rfc/rfc8439.txt)
- [HMAC Specification (RFC 2104)](https://tools.ietf.org/rfc/rfc2104.txt)
- [Fisher-Yates Shuffle Algorithm](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## Disclaimer

This project demonstrates cryptographically secure random number generation using NIST's Randomness Beacon. While the implementation uses industry-standard algorithms and follows security best practices, users should evaluate the suitability for their specific use cases. The lottery number generation example is for educational and entertainment purposes only and should not be considered as gambling advice. 