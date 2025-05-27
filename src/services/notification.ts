import axios from 'axios';

export interface VitalAlert {
  type: 'warning' | 'critical';
  message: string;
  value: number | string;
  unit: string;
  timestamp?: string;
}

export interface ECGAlert {
  prediction: string;
  confidence: number;
  alert?: string;
  trend?: string;
}

class NotificationService {
  private twilioEndpoint = 'http://localhost:5000/api/send-sms';
  private messageCount: { [key: string]: number } = {};
  private readonly MAX_DAILY_MESSAGES = 15; // Keep one message below limit for emergencies
  private lastReset = new Date().toDateString();

  constructor() {
    // Reset message count at midnight
    setInterval(() => {
      const today = new Date().toDateString();
      if (today !== this.lastReset) {
        this.messageCount = {};
        this.lastReset = today;
      }
    }, 60000); // Check every minute
  }

  private async checkMessageLimit(phoneNumber: string): Promise<boolean> {
    // Reset count if it's a new day
    const today = new Date().toDateString();
    if (today !== this.lastReset) {
      this.messageCount = {};
      this.lastReset = today;
    }

    // Initialize count for this number
    this.messageCount[phoneNumber] = this.messageCount[phoneNumber] || 0;

    // Check if we're at the limit
    return this.messageCount[phoneNumber] < this.MAX_DAILY_MESSAGES;
  }

  async sendSMSAlert(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Check if we can send more messages
      if (!await this.checkMessageLimit(phoneNumber)) {
        console.warn(`Daily message limit reached for ${phoneNumber}. Using fallback notification.`);
        return this.sendFallbackNotification(phoneNumber, message);
      }

      const response = await axios.post(this.twilioEndpoint, {
        to: phoneNumber,
        message
      });

      // Update message count based on server response
      if (response.data.remainingMessages !== undefined) {
        this.messageCount[phoneNumber] = this.MAX_DAILY_MESSAGES - response.data.remainingMessages;
      } else {
        this.messageCount[phoneNumber] = (this.messageCount[phoneNumber] || 0) + 1;
      }

      // Store alert if we're getting close to the limit
      if (this.getRemainingMessages(phoneNumber) <= 2) {
        this.storeAlert(phoneNumber, message);
        // Also show an in-app warning about approaching limit
        this.showInAppNotification(`⚠️ SMS limit almost reached. ${this.getRemainingMessages(phoneNumber)} messages remaining today.`);
      }

      return true;
    } catch (error: any) {
      // Handle rate limiting from server
      if (error.response?.status === 429) {
        const retryAfter = error.response.data.retryAfter;
        console.warn(`Twilio daily limit reached. Retry after ${retryAfter}`);
        
        // Update local counter to match server
        this.messageCount[phoneNumber] = this.MAX_DAILY_MESSAGES;
        
        // Show limit reached notification and use fallback
        this.showInAppNotification('⚠️ Daily SMS limit reached. Using alternate notification methods.');
        return this.sendFallbackNotification(phoneNumber, message);
      }

      // Handle other errors
      console.error('Error sending SMS:', error);
      this.showInAppNotification('⚠️ Failed to send SMS notification. Using alternate methods.');
      return this.sendFallbackNotification(phoneNumber, message);
    }
  }

  private async sendFallbackNotification(phoneNumber: string, message: string): Promise<boolean> {
    // Store the alert for later viewing
    this.storeAlert(phoneNumber, message);

    // If we have a service worker, try to send a push notification
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Health Alert', {
          body: message,
          icon: '/health-icon.png',
          tag: 'health-alert',
          requireInteraction: true,
          silent: false
        });
        return true;
      } catch (error) {
        console.error('Push notification failed:', error);
      }
    }

    // Display in-app notification
    this.showInAppNotification(message);
    return false;
  }

  private storeAlert(phoneNumber: string, message: string) {
    try {
      const stored = localStorage.getItem('pendingAlerts') || '{}';
      const alerts = JSON.parse(stored);
      if (!alerts[phoneNumber]) {
        alerts[phoneNumber] = [];
      }
      alerts[phoneNumber].push({
        message,
        timestamp: new Date().toISOString(),
        delivered: false
      });
      localStorage.setItem('pendingAlerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  }

  private showInAppNotification(message: string) {
    // Add to global notification state if available
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('healthAlert', {
        detail: { message, timestamp: new Date().toISOString() }
      }));
    }
  }

  formatVitalAlerts(alerts: VitalAlert[]): string {
    const timestamp = new Date().toLocaleString();
    let message = `🚨 Health Alert (${timestamp}):\n\n`;

    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    const warningAlerts = alerts.filter(a => a.type === 'warning');

    if (criticalAlerts.length > 0) {
      message += "⚠️ CRITICAL ALERTS:\n";
      criticalAlerts.forEach(alert => {
        message += `• ${alert.message}: ${alert.value}${alert.unit}\n`;
      });
      message += '\n';
    }

    if (warningAlerts.length > 0) {
      message += "⚠️ WARNINGS:\n";
      warningAlerts.forEach(alert => {
        message += `• ${alert.message}: ${alert.value}${alert.unit}\n`;
      });
      message += '\n';
    }

    message += "Please take appropriate action immediately.\n";
    return message;
  }

  formatECGAlert(ecgAlert: ECGAlert): string {
    const timestamp = new Date().toLocaleString();
    let message = `🫀 ECG Alert (${timestamp}):\n\n`;

    message += `Prediction: ${ecgAlert.prediction}\n`;
    message += `Confidence: ${(ecgAlert.confidence * 100).toFixed(1)}%\n`;

    if (ecgAlert.trend) {
      message += `Trend: ${ecgAlert.trend}\n`;
    }

    if (ecgAlert.alert) {
      message += `\n⚠️ ${ecgAlert.alert}\n`;
    }

    message += "\nPlease consult healthcare provider if abnormal patterns persist.";
    return message;
  }

  shouldSendAlert(alerts: VitalAlert[]): boolean {
    return alerts.some(alert => 
      alert.type === 'critical' || 
      (alert.type === 'warning' && this.isSignificantWarning(alert))
    );
  }

  private isSignificantWarning(alert: VitalAlert): boolean {
    // Define thresholds for different vital signs
    const thresholds = {
      'High temperature': 38.5, // Celsius
      'Low temperature': 35.0,
      'High heart rate': 120, // BPM
      'Low heart rate': 50,
      'Low oxygen saturation': 92, // %
      'High alcohol level': 0.1, // %
      'High blood pressure': 160, // Systolic
    };

    const value = typeof alert.value === 'string' 
      ? parseFloat(alert.value.split('/')[0]) 
      : alert.value;

    for (const [condition, threshold] of Object.entries(thresholds)) {
      if (alert.message.includes(condition)) {
        if (condition.includes('Low') && value < threshold) return true;
        if (condition.includes('High') && value > threshold) return true;
      }
    }

    return false;
  }

  // Helper method to check remaining messages
  getRemainingMessages(phoneNumber: string): number {
    return Math.max(0, this.MAX_DAILY_MESSAGES - (this.messageCount[phoneNumber] || 0));
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();