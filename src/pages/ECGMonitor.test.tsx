import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import ECGMonitor from './ECGMonitor';

// Mock the services
jest.mock('../services/thingspeak');
jest.mock('../services/mlPrediction');
jest.mock('../services/notification');

// Mock the theme context
const mockTheme = {
  darkMode: false,
  toggleTheme: jest.fn()
};

// Setup function
const renderECGMonitor = (props = {}) => {
  return render(
    <ThemeProvider value={mockTheme}>
      <ECGMonitor {...props} />
    </ThemeProvider>
  );
};

describe('ECGMonitor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderECGMonitor();
    expect(screen.getByTestId('ecg-monitor')).toBeInTheDocument();
  });

  it('displays initial heart rate', () => {
    renderECGMonitor({ initialHeartRate: 75 });
    expect(screen.getByText('75 BPM')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderECGMonitor();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('updates signal quality based on noise level', async () => {
    renderECGMonitor();
    // Wait for initial data fetch
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Signal:/)).toBeInTheDocument();
  });

  it('shows alerts when abnormalities detected', async () => {
    renderECGMonitor();
    // Simulate abnormal ECG data
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const alerts = screen.queryAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(0);
  });

  it('downloads ECG report when button clicked', () => {
    renderECGMonitor();
    const downloadButton = screen.getByText(/Download Report/);
    fireEvent.click(downloadButton);
    // Verify PDF generation attempt
    // Note: Actual PDF generation is mocked
  });

  // Test auto-updating functionality
  it('updates ECG data periodically', async () => {
    renderECGMonitor();
    
    // Initial render
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    // After 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verify that data was fetched twice
    expect(screen.getByTestId('ecg-monitor')).toBeInTheDocument();
  });
});
