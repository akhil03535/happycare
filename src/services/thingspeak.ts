import axios, { AxiosError, AxiosResponse } from 'axios';

// Type definitions
interface ThingSpeakData {
  timestamp: Date;
  temperature: number;
  heartRate: number;
  spo2: number;
  ecgData: number[];
  alcoholLevel: number;
  fallDetection: number;
}

interface HistoricalDataOptions {
  hours?: number;
  results?: number;
  startDate?: Date;
  endDate?: Date;
}

class ThingSpeakService {
  private readonly baseUrl: string = 'https://api.thingspeak.com';
  private readonly updateEndpoint: string = `${this.baseUrl}/update`;
  private lastDataEndpoint: string;
  private historicalDataEndpoint: string;

  constructor(private channelId: string, private apiKey: string) {
    this.validateCredentials();
    this.lastDataEndpoint = `${this.baseUrl}/channels/${this.channelId}/feeds/last.json`;
    this.historicalDataEndpoint = `${this.baseUrl}/channels/${this.channelId}/feeds.json`;
  
    // Verify and format credentials
    this.channelId = this.channelId.trim();
    this.apiKey = this.apiKey.trim();
    
    if (this.channelId.startsWith('channel_')) {
      this.channelId = this.channelId.substring(8);
    }
  }

  /**
   * Gets the most recent data from ThingSpeak with enhanced ECG handling
   */
  public async getLatestData(): Promise<ThingSpeakData> {
    try {
      // Ensure we have valid credentials
      this.validateCredentials();

      const response = await axios.get(this.lastDataEndpoint, {
        params: { 
          api_key: this.apiKey,
          results: 1,
          timezone: 'UTC'
        },
        timeout: 5000,
      });

      if (!response.data) {
        throw new Error('No data received from ThingSpeak');
      }

      const parsedData = this.parseData(response.data);
      
      // Debug logging
      console.log('Raw ECG data:', response.data.field7);
      console.log('Parsed ECG data:', parsedData.ecgData);
      console.log('Parsed data structure:', parsedData);
      
      return parsedData;
    } catch (error) {
      console.error('ThingSpeak API error:', error);
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Enhanced ECG data parser that handles multiple formats
   */
  private parseECGData(value: any): number[] {
    if (!value) return [];
    
    try {
      // Case 1: JSON stringified array
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(Number).filter(n => !isNaN(n));
        }
      }
      
      // Case 2: Comma-separated values
      if (typeof value === 'string') {
        const values = value.split(',');
        return values
          .map(v => parseFloat(v.trim()))
          .filter(n => !isNaN(n));
      }
      
      // Case 3: Already an array
      if (Array.isArray(value)) {
        return value.map(Number).filter(n => !isNaN(n));
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing ECG data:', error, 'Raw value:', value);
      return [];
    }
  }

  private parseData(feed: any): ThingSpeakData {
    return {
      timestamp: new Date(feed.created_at || Date.now()),
      temperature: this.parseNumber(feed.field1, 37.0),
      heartRate: this.parseNumber(feed.field2, 75),
      spo2: this.parseNumber(feed.field3, 98),
      ecgData: this.parseECGData(feed.field7),
      alcoholLevel: this.parseNumber(feed.field5, 0.0),
      fallDetection: this.parseNumber(feed.field6, 0),
    };
  }

  private parseNumber(value: any, defaultValue: number): number {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Updates ECG data to ThingSpeak channel (field7)
   */
  public async updateECGData(ecgValues: number[]): Promise<number> {
    if (!ecgValues || !Array.isArray(ecgValues)) {
      throw new Error('ECG values must be provided as a non-empty array');
    }

    try {
      const params = new URLSearchParams();
      params.append('api_key', this.apiKey);
      params.append('field7', this.formatECGData(ecgValues));

      const response = await axios.post(this.updateEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      });

      this.validateUpdateResponse(response);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private formatECGData(ecgValues: number[]): string {
    // For large ECG datasets, consider downsampling or compression
    if (ecgValues.length > 1000) {
      console.warn('Large ECG dataset detected. Consider downsampling for ThingSpeak.');
    }
    return JSON.stringify(ecgValues);
  }

  /**
   * Gets historical data from ThingSpeak
   */
  public async getHistoricalData(options: HistoricalDataOptions = {}): Promise<ThingSpeakData[]> {
    try {
      const params: Record<string, any> = {
        api_key: this.apiKey,
      };

      if (options.hours) {
        params.minutes = options.hours * 60;
      }
      if (options.results) {
        params.results = Math.min(options.results, 8000);
      }
      if (options.startDate) {
        params.start = options.startDate.toISOString();
      }
      if (options.endDate) {
        params.end = options.endDate.toISOString();
      }

      const response = await axios.get(this.historicalDataEndpoint, {
        params,
        timeout: 10000,
      });

      if (!response.data?.feeds) {
        throw new Error('No historical data received');
      }

      return response.data.feeds.map((feed: any) => this.parseData(feed));
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private validateCredentials(): void {
    if (!this.channelId || !this.apiKey) {
      throw new Error('Both channel ID and API key are required');
    }

    if (typeof this.channelId !== 'string' || typeof this.apiKey !== 'string') {
      throw new Error('Channel ID and API key must be strings');
    }

    // Verify channel ID is numeric
    const channelNumber = parseInt(this.channelId, 10);
    if (isNaN(channelNumber) || channelNumber.toString() !== this.channelId) {
      throw new Error('Channel ID must be a valid number');
    }

    // Verify API key format (typically 16-character alphanumeric)
    if (!/^[A-Z0-9]{16}$/i.test(this.apiKey)) {
      throw new Error('Invalid API key format - should be 16 characters long');
    }
  }

  private validateUpdateResponse(response: AxiosResponse): void {
    if (response.status !== 200) {
      throw new Error(`Update failed with status ${response.status}`);
    }

    if (response.data === 0) {
      throw new Error('ThingSpeak rejected the update (possibly rate limited)');
    }
  }

  private handleError(error: AxiosError): Error {
    // Log the full error for debugging
    console.error('ThingSpeak API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });

    if (error.response) {
      switch (error.response.status) {
        case 400:
          let message = 'Invalid request - ';
          if (!error.config?.params?.api_key) {
            message += 'API key is required';
          } else if (error.config?.url?.includes('feeds/last.json')) {
            message += 'channel may be empty or API key may be invalid';
          } else {
            message += 'please check your parameters';
          }
          return new Error(message);

        case 401:
          return new Error('Unauthorized - please verify your API key');

        case 404:
          return new Error('Channel not found - please verify your channel ID');

        case 429:
          return new Error('Rate limit exceeded - please wait a moment before trying again');

        case 500:
          return new Error('ThingSpeak server error - please try again later');

        default:
          return new Error(`ThingSpeak API error (${error.response.status}): ${error.response.statusText}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout - please check your network connection');
    } else if (error.request) {
      return new Error('Unable to reach ThingSpeak servers - please check your internet connection');
    }

    return error instanceof Error 
      ? new Error(`ThingSpeak error: ${error.message}`) 
      : new Error('An unknown error occurred while accessing ThingSpeak');
  }
}

export { ThingSpeakService, type ThingSpeakData, type HistoricalDataOptions };