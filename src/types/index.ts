export interface BeaconResponse {
  pulse: {
    uri: string;
    version: string;
    cipherSuite: number;
    period: number;
    certificateId: string;
    chainIndex: number;
    pulseIndex: number;
    timeStamp: string;
    localRandomValue: string;
    external: {
      sourceId: string;
      statusCode: number;
      value: string;
    };
    listValues: Array<{
      uri: string;
      type: string;
      value: string;
    }>;
    precommitmentValue: string;
    statusCode: number;
    signatureValue: string;
    outputValue: string;
  };
}

export interface LotteryNumbers {
  numbers649: number[];
  numbersMax: number[];
  timestamp: string;
  outputValue: string;
}

export interface GenerationError {
  message: string;
  type: 'network' | 'api' | 'generation';
} 