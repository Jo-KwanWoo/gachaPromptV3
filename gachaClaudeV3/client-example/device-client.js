const https = require('https');
const os = require('os');

class DeviceRegistrationClient {
  constructor(serverUrl, hardwareId, tenantId) {
    this.serverUrl = serverUrl;
    this.hardwareId = hardwareId;
    this.tenantId = tenantId;
    this.registrationInterval = null;
    this.statusCheckInterval = null;
    this.maxRetryAttempts = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async start() {
    console.log('Starting device registration process...');
    await this.registerDevice();
  }

  async registerDevice() {
    const deviceInfo = {
      hardwareId: this.hardwareId,
      tenantId: this.tenantId,
      ipAddress: this.getLocalIP(),
      systemInfo: {
        os: os.platform(),
        arch: os.arch(),
        mac: this.getMacAddress(),
      },
    };

    try {
      const response = await this.makeRequest('POST', '/api/devices/register', deviceInfo);
      
      if (response.status === 'success') {
        console.log('Registration request submitted successfully');
        this.startStatusPolling();
      } else {
        console.error('Registration failed:', response.message);
        this.scheduleRetry();
      }
    } catch (error) {
      console.error('Registration error:', error.message);
      this.scheduleRetry();
    }
  }

  startStatusPolling() {
    console.log('Starting status polling...');
    
    this.statusCheckInterval = setInterval(async () => {
      try {
        const response = await this.makeRequest(
          'GET', 
          `/api/devices/status/${this.hardwareId}?tenantId=${this.tenantId}`
        );

        if (response.data.deviceId && response.data.sqsQueueUrl) {
          console.log('Device approved! Queue URL:', response.data.sqsQueueUrl);
          this.onApproved(response.data);
          this.stopPolling();
        } else {
          console.log('Still pending approval...');
        }
      } catch (error) {
        console.error('Status check error:', error.message);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Stop polling after 24 hours and retry registration
    setTimeout(() => {
      if (this.statusCheckInterval) {
        console.log('24 hours timeout reached, retrying registration...');
        this.stopPolling();
        this.registerDevice();
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  stopPolling() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  scheduleRetry() {
    setTimeout(() => {
      console.log('Retrying registration...');
      this.registerDevice();
    }, this.retryDelay);
  }

  onApproved(approvalData) {
    console.log('Device successfully approved!');
    console.log('Device ID:', approvalData.deviceId);
    console.log('SQS Queue URL:', approvalData.sqsQueueUrl);
    
    // Store the queue URL for future message consumption
    this.sqsQueueUrl = approvalData.sqsQueueUrl;
    
    // Start your main application logic here
    this.startMainApplication();
  }

  startMainApplication() {
    console.log('Starting main vending machine application...');
    // Implement your vending machine logic here
    // You can now use this.sqsQueueUrl to receive messages from the server
  }

  makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.serverUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData);
            } else {
              reject(new Error(parsedData.message || 'Request failed'));
            }
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          return interface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  getMacAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          return interface.mac;
        }
      }
    }
    return '00:00:00:00:00:00';
  }
}

// Usage example
const client = new DeviceRegistrationClient(
  'https://your-server.com',
  'HW001', // Hardware ID
  'TENANT001' // Tenant ID
);

client.start().catch(console.error);

module.exports = DeviceRegistrationClient;