// Advanced Performance Monitoring Service
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: null,
      apiCalls: [],
      componentRenders: [],
      userInteractions: [],
      memoryUsage: [],
      network: []
    };
    
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      samplingRate: 0.1, // 10% of users
      maxEntries: 1000,
      reportThreshold: 1000, // Report after 1000ms
      apiUrl: '/api/performance'
    };
    
    this.init();
  }

  // Initialize performance monitoring
  init() {
    if (!this.config.enabled || !this.shouldSample()) {
      return;
    }

    // Monitor page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        this.capturePageLoadMetrics();
      });
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      this.observeLongTasks();
      this.observeNetworkRequests();
      this.observeComponentRenders();
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        this.captureMemoryUsage();
      }, 30000); // Every 30 seconds
    }
  }

  // Check if we should sample this user
  shouldSample() {
    return Math.random() < this.config.samplingRate;
  }

  // Capture page load metrics
  capturePageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    this.metrics.pageLoad = {
      url: window.location.href,
      timestamp: Date.now(),
      navigationStart: navigation.startTime,
      loadEventEnd: navigation.loadEventEnd,
      domContentLoaded: navigation.domContentLoadedEventEnd,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      pageLoadTime: navigation.loadEventEnd - navigation.startTime,
      domReadyTime: navigation.domContentLoadedEventEnd - navigation.startTime
    };

    // Report slow page loads
    if (this.metrics.pageLoad.pageLoadTime > this.config.reportThreshold) {
      this.reportPerformanceIssue('slow_page_load', this.metrics.pageLoad);
    }
  }

  // Observe long tasks
  observeLongTasks() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Long task threshold
          this.captureLongTask(entry);
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }

  // Capture long task details
  captureLongTask(entry) {
    const longTask = {
      timestamp: Date.now(),
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution?.map(attr => ({
        name: attr.name,
        entryType: attr.entryType,
        startTime: attr.startTime,
        duration: attr.duration
      })) || []
    };

    this.metrics.userInteractions.push(longTask);

    // Report long tasks
    if (entry.duration > 1000) {
      this.reportPerformanceIssue('long_task', longTask);
    }
  }

  // Observe network requests
  observeNetworkRequests() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
          this.captureNetworkRequest(entry);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }

  // Capture network request details
  captureNetworkRequest(entry) {
    const networkEntry = {
      timestamp: Date.now(),
      name: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      decodedBodySize: entry.decodedBodySize,
      startTime: entry.startTime,
      responseEnd: entry.responseEnd
    };

    this.metrics.network.push(networkEntry);

    // Report slow network requests
    if (entry.duration > 5000) { // 5 seconds threshold
      this.reportPerformanceIssue('slow_network_request', networkEntry);
    }
  }

  // Monitor component renders (for React DevTools or custom implementation)
  observeComponentRenders() {
    // This would typically be integrated with React DevTools
    // For now, we'll create a mock implementation
    this.originalConsoleLog = console.log;
    console.log = (...args) => {
      if (args[0] && args[0].includes('Render time:')) {
        this.captureComponentRender(args[0]);
      }
      this.originalConsoleLog(...args);
    };
  }

  // Capture component render time
  captureComponentRender(renderInfo) {
    const componentRender = {
      timestamp: Date.now(),
      component: renderInfo.component,
      duration: renderInfo.duration,
      props: renderInfo.props
    };

    this.metrics.componentRenders.push(componentRender);
  }

  // Capture memory usage
  captureMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const memoryEntry = {
        timestamp: Date.now(),
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };

      this.metrics.memoryUsage.push(memoryEntry);

      // Report high memory usage
      if (memoryEntry.usagePercentage > 80) {
        this.reportPerformanceIssue('high_memory_usage', memoryEntry);
      }
    }
  }

  // Monitor user interactions
  monitorUserInteractions() {
    // Click monitoring
    document.addEventListener('click', (event) => {
      const interaction = {
        type: 'click',
        timestamp: Date.now(),
        target: event.target.tagName,
        coordinates: { x: event.clientX, y: event.clientY },
        timeToInteraction: performance.now()
      };

      this.metrics.userInteractions.push(interaction);
    });

    // Scroll monitoring
    let scrollTimeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollInteraction = {
          type: 'scroll',
          timestamp: Date.now(),
          scrollPosition: window.scrollY,
          viewportHeight: window.innerHeight
        };

        this.metrics.userInteractions.push(scrollInteraction);
      }, 100);
    });
  }

  // Report performance issues to backend
  async reportPerformanceIssue(issueType, details) {
    try {
      const report = {
        issueType,
        details,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        url: window.location.href
      };

      // Send to backend monitoring endpoint
      await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.error('Failed to report performance issue:', error);
    }
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      summary: this.generateSummary()
    };
  }

  // Generate performance summary
  generateSummary() {
    const summary = {
      pageLoad: this.metrics.pageLoad ? {
        loadTime: this.metrics.pageLoad.pageLoadTime,
        fcp: this.metrics.pageLoad.firstContentfulPaint,
        status: this.metrics.pageLoad.pageLoadTime > 3000 ? 'slow' : 'normal'
      } : null,
      
      apiPerformance: {
        totalCalls: this.metrics.apiCalls.length,
        avgResponseTime: this.calculateAverage(this.metrics.apiCalls.map(call => call.duration)),
        errorRate: this.calculateErrorRate()
      },
      
      userExperience: {
        interactionCount: this.metrics.userInteractions.length,
        longTasks: this.metrics.userInteractions.filter(task => task.duration > 50).length,
        scrollDepth: this.calculateScrollDepth()
      }
    };

    return summary;
  }

  // Utility functions
  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  calculateErrorRate() {
    const failedCalls = this.metrics.apiCalls.filter(call => call.status >= 400).length;
    return this.metrics.apiCalls.length > 0 ? (failedCalls / this.metrics.apiCalls.length) * 100 : 0;
  }

  calculateScrollDepth() {
    const scrollInteractions = this.metrics.userInteractions.filter(interaction => interaction.type === 'scroll');
    if (scrollInteractions.length === 0) return 0;
    
    const maxScroll = Math.max(...scrollInteractions.map(interaction => interaction.scrollPosition));
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    return documentHeight > 0 ? (maxScroll / documentHeight) * 100 : 0;
  }

  // Session management
  getSessionId() {
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      pageLoad: null,
      apiCalls: [],
      componentRenders: [],
      userInteractions: [],
      memoryUsage: [],
      network: []
    };
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      metrics: this.getMetrics(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export for use in application
export default performanceMonitor;

// Utility functions for integration
export const measureAPICall = async (apiCall, url) => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMonitor.metrics.apiCalls.push({
      url,
      startTime,
      endTime,
      duration,
      status: result?.status || 200,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMonitor.metrics.apiCalls.push({
      url,
      startTime,
      endTime,
      duration,
      status: error?.response?.status || 500,
      error: error.message,
      timestamp: Date.now()
    });
    
    throw error;
  }
};

// Performance monitoring HOC
export const withPerformanceMonitoring = (Component) => {
  return function PerformanceMonitoredComponent(props) {
    React.useEffect(() => {
      // Component mount performance
      const mountTime = performance.now();
      
      return () => {
        // Component unmount performance
        const unmountTime = performance.now();
        const duration = unmountTime - mountTime;
        
        performanceMonitor.metrics.componentRenders.push({
          component: Component.name,
          duration,
          mountTime,
          unmountTime,
          timestamp: Date.now()
        });
      };
    }, []);
    
    return <Component {...props} />;
  };
};