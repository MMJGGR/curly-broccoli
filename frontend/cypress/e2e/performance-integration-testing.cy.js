/**
 * Performance Integration Testing
 * Validates system performance with full integration complexity across all three priority systems
 */

describe('Performance Integration Testing', () => {
  const performanceThresholds = {
    pageLoad: 3000,           // 3 seconds max page load
    apiResponse: 1000,        // 1 second max API response
    analyticsCalculation: 10000, // 10 seconds max for Monte Carlo
    databaseQuery: 500,       // 500ms max for database queries
    memoryUsage: 100,         // 100MB max memory increase
    bundleSize: 5,            // 5MB max bundle size
  };

  beforeEach(() => {
    // Clear performance data
    cy.window().then(win => {
      win.performance.clearMarks();
      win.performance.clearMeasures();
    });
    
    // Setup large test dataset
    cy.exec('cd api && python -c "from tests.performance_test_data import setup_large_dataset; setup_large_dataset()"');
    cy.login('perf.test@example.com', 'password123');
  });

  describe('System Load Performance', () => {
    it('validates initial application load performance', () => {
      // Measure initial page load
      cy.window().then(win => {
        win.performance.mark('app-load-start');
      });

      cy.visit('/timeline');
      
      // Wait for app to fully load
      cy.get('[data-cy="timeline-dashboard"]').should('be.visible');
      cy.get('[data-cy="alignment-score"]').should('exist');

      cy.window().then(win => {
        win.performance.mark('app-load-end');
        win.performance.measure('app-load-time', 'app-load-start', 'app-load-end');
        
        const measure = win.performance.getEntriesByName('app-load-time')[0];
        expect(measure.duration).to.be.lessThan(performanceThresholds.pageLoad);
        
        // Log performance metrics
        cy.log(`App load time: ${measure.duration.toFixed(2)}ms`);
      });

      // Validate bundle size
      cy.window().then(win => {
        if (win.performance.getEntriesByType) {
          const resources = win.performance.getEntriesByType('resource');
          const jsResources = resources.filter(r => r.name.includes('.js'));
          const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
          const sizeMB = totalSize / (1024 * 1024);
          
          expect(sizeMB).to.be.lessThan(performanceThresholds.bundleSize);
          cy.log(`Total JS bundle size: ${sizeMB.toFixed(2)}MB`);
        }
      });
    });

    it('validates navigation performance between integrated systems', () => {
      cy.visit('/timeline');
      
      const routes = [
        { path: '/budget', name: 'Budget System' },
        { path: '/transactions', name: 'Transaction System' },
        { path: '/analytics', name: 'Analytics System' },
        { path: '/timeline', name: 'Timeline System' }
      ];

      routes.forEach((route, index) => {
        cy.window().then(win => {
          win.performance.mark(`nav-${route.name}-start`);
        });

        cy.visit(route.path);
        cy.get('[data-cy="main-content"]').should('be.visible');

        cy.window().then(win => {
          win.performance.mark(`nav-${route.name}-end`);
          win.performance.measure(
            `nav-${route.name}-time`,
            `nav-${route.name}-start`,
            `nav-${route.name}-end`
          );
          
          const measure = win.performance.getEntriesByName(`nav-${route.name}-time`)[0];
          expect(measure.duration).to.be.lessThan(performanceThresholds.pageLoad);
          
          cy.log(`${route.name} navigation time: ${measure.duration.toFixed(2)}ms`);
        });
      });
    });
  });

  describe('API Performance Under Load', () => {
    it('validates transaction API performance with large datasets', () => {
      cy.visit('/transactions');

      // Test transaction list loading
      cy.intercept('GET', '/api/v1/transactions*').as('getTransactions');
      
      cy.reload();
      cy.wait('@getTransactions').then(interception => {
        expect(interception.reply.headers['x-response-time']).to.exist;
        const responseTime = parseInt(interception.reply.headers['x-response-time']);
        expect(responseTime).to.be.lessThan(performanceThresholds.apiResponse);
        
        cy.log(`Transaction API response time: ${responseTime}ms`);
      });

      // Test pagination performance
      const pages = [1, 2, 3, 4, 5];
      pages.forEach(page => {
        cy.intercept('GET', `/api/v1/transactions*offset=${(page - 1) * 50}*`).as(`getPage${page}`);
        
        cy.get(`[data-cy="page-${page}"]`).click();
        cy.wait(`@getPage${page}`).then(interception => {
          const responseTime = parseInt(interception.reply.headers['x-response-time'] || '0');
          expect(responseTime).to.be.lessThan(performanceThresholds.apiResponse);
        });
      });

      // Test search performance
      cy.intercept('GET', '/api/v1/transactions*search=*').as('searchTransactions');
      
      cy.get('[data-cy="search-input"]').type('salary');
      cy.wait('@searchTransactions').then(interception => {
        const responseTime = parseInt(interception.reply.headers['x-response-time'] || '0');
        expect(responseTime).to.be.lessThan(performanceThresholds.apiResponse);
        
        cy.log(`Transaction search response time: ${responseTime}ms`);
      });
    });

    it('validates analytics API performance with complex calculations', () => {
      cy.visit('/analytics');

      // Test Monte Carlo simulation performance
      cy.intercept('POST', '/api/v1/analytics/goals/*/simulate').as('monteCarloSim');
      
      cy.get('[data-cy="goal-analytics-card"]').first().click();
      cy.wait('@monteCarloSim').then(interception => {
        const responseTime = parseInt(interception.reply.headers['x-response-time'] || '0');
        expect(responseTime).to.be.lessThan(performanceThresholds.analyticsCalculation);
        
        cy.log(`Monte Carlo simulation time: ${responseTime}ms`);
      });

      // Test portfolio analysis performance
      cy.intercept('POST', '/api/v1/analytics/portfolio/analyze').as('portfolioAnalysis');
      
      cy.get('[data-cy="portfolio-analysis-btn"]').click();
      cy.wait('@portfolioAnalysis').then(interception => {
        const responseTime = parseInt(interception.reply.headers['x-response-time'] || '0');
        expect(responseTime).to.be.lessThan(performanceThresholds.analyticsCalculation);
        
        cy.log(`Portfolio analysis time: ${responseTime}ms`);
      });

      // Test dashboard insights performance
      cy.intercept('GET', '/api/v1/analytics/dashboard/insights').as('dashboardInsights');
      
      cy.visit('/timeline');
      cy.wait('@dashboardInsights').then(interception => {
        const responseTime = parseInt(interception.reply.headers['x-response-time'] || '0');
        expect(responseTime).to.be.lessThan(performanceThresholds.apiResponse);
        
        cy.log(`Dashboard insights response time: ${responseTime}ms`);
      });
    });

    it('validates concurrent API request performance', () => {
      cy.visit('/timeline');

      // Measure concurrent API calls during timeline load
      const apiCalls = [
        '/api/v1/timeline/*',
        '/api/v1/analytics/dashboard/insights',
        '/api/v1/budget/overview',
        '/api/v1/accounts/',
        '/api/v1/transactions*limit=10'
      ];

      apiCalls.forEach((path, index) => {
        cy.intercept('GET', path).as(`concurrentAPI${index}`);
      });

      cy.reload();

      // Wait for all concurrent calls and measure performance
      Promise.all(apiCalls.map((_, index) => cy.wait(`@concurrentAPI${index}`))).then(interceptions => {
        const responseTimes = interceptions.map(int => 
          parseInt(int.reply.headers['x-response-time'] || '0')
        );
        
        const maxResponseTime = Math.max(...responseTimes);
        const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        
        expect(maxResponseTime).to.be.lessThan(performanceThresholds.apiResponse * 2); // Allow 2x for concurrent
        
        cy.log(`Concurrent API max response time: ${maxResponseTime}ms`);
        cy.log(`Concurrent API avg response time: ${avgResponseTime.toFixed(2)}ms`);
      });
    });
  });

  describe('Frontend Performance Under Load', () => {
    it('validates React component rendering performance', () => {
      cy.visit('/transactions');

      // Test large list rendering performance
      cy.window().then(win => {
        win.performance.mark('list-render-start');
      });

      cy.get('[data-cy="load-all-transactions"]').click();
      cy.get('[data-cy="transaction-list"]').should('have.length.greaterThan', 100);

      cy.window().then(win => {
        win.performance.mark('list-render-end');
        win.performance.measure('list-render-time', 'list-render-start', 'list-render-end');
        
        const measure = win.performance.getEntriesByName('list-render-time')[0];
        expect(measure.duration).to.be.lessThan(2000); // 2 seconds for large list
        
        cy.log(`Large list render time: ${measure.duration.toFixed(2)}ms`);
      });

      // Test scroll performance with large dataset
      cy.window().then(win => {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'scroll-performance') {
              expect(entry.duration).to.be.lessThan(16); // 60fps = 16ms per frame
            }
          });
        });
        observer.observe({ entryTypes: ['measure'] });

        win.performance.mark('scroll-start');
      });

      cy.get('[data-cy="transaction-list"]').scrollTo('bottom', { duration: 1000 });

      cy.window().then(win => {
        win.performance.mark('scroll-end');
        win.performance.measure('scroll-performance', 'scroll-start', 'scroll-end');
      });
    });

    it('validates memory usage during extended usage', () => {
      let initialMemory, currentMemory;

      // Measure initial memory
      cy.window().then(win => {
        if (win.performance.memory) {
          initialMemory = win.performance.memory.usedJSHeapSize / (1024 * 1024); // MB
          cy.log(`Initial memory usage: ${initialMemory.toFixed(2)}MB`);
        }
      });

      // Simulate extended usage across all systems
      const actions = [
        { action: () => cy.visit('/timeline'), name: 'Timeline' },
        { action: () => cy.visit('/budget'), name: 'Budget' },
        { action: () => cy.visit('/transactions'), name: 'Transactions' },
        { action: () => cy.visit('/analytics'), name: 'Analytics' },
        { action: () => cy.get('[data-cy="add-transaction-btn"]').click(), name: 'Add Transaction' },
        { action: () => cy.get('[data-cy="cancel-btn"]').click(), name: 'Cancel' },
        { action: () => cy.visit('/accounts'), name: 'Accounts' },
        { action: () => cy.visit('/profile'), name: 'Profile' }
      ];

      // Perform actions multiple times to stress test memory
      for (let i = 0; i < 3; i++) {
        actions.forEach(({ action, name }) => {
          action();
          cy.wait(500); // Allow for cleanup
        });
      }

      // Measure final memory
      cy.window().then(win => {
        if (win.performance.memory) {
          currentMemory = win.performance.memory.usedJSHeapSize / (1024 * 1024); // MB
          const memoryIncrease = currentMemory - initialMemory;
          
          cy.log(`Final memory usage: ${currentMemory.toFixed(2)}MB`);
          cy.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB`);
          
          expect(memoryIncrease).to.be.lessThan(performanceThresholds.memoryUsage);
        }
      });
    });

    it('validates chart and visualization rendering performance', () => {
      cy.visit('/analytics');

      // Test chart rendering performance
      cy.window().then(win => {
        win.performance.mark('chart-render-start');
      });

      cy.get('[data-cy="analytics-charts"]').should('be.visible');
      cy.get('[data-cy="chart-loaded"]').should('exist');

      cy.window().then(win => {
        win.performance.mark('chart-render-end');
        win.performance.measure('chart-render-time', 'chart-render-start', 'chart-render-end');
        
        const measure = win.performance.getEntriesByName('chart-render-time')[0];
        expect(measure.duration).to.be.lessThan(3000); // 3 seconds for complex charts
        
        cy.log(`Chart rendering time: ${measure.duration.toFixed(2)}ms`);
      });

      // Test interactive chart performance
      cy.get('[data-cy="interactive-chart"]').trigger('mousemove', { clientX: 200, clientY: 200 });
      
      cy.window().then(win => {
        // Measure interaction responsiveness
        const paintEntries = win.performance.getEntriesByType('paint');
        if (paintEntries.length > 0) {
          const lastPaint = paintEntries[paintEntries.length - 1];
          cy.log(`Last paint time: ${lastPaint.startTime.toFixed(2)}ms`);
        }
      });

      // Test timeline visualization performance
      cy.visit('/timeline');
      
      cy.window().then(win => {
        win.performance.mark('timeline-viz-start');
      });

      cy.get('[data-cy="timeline-visualization"]').should('be.visible');

      cy.window().then(win => {
        win.performance.mark('timeline-viz-end');
        win.performance.measure('timeline-viz-time', 'timeline-viz-start', 'timeline-viz-end');
        
        const measure = win.performance.getEntriesByName('timeline-viz-time')[0];
        expect(measure.duration).to.be.lessThan(2000); // 2 seconds for timeline
        
        cy.log(`Timeline visualization time: ${measure.duration.toFixed(2)}ms`);
      });
    });
  });

  describe('Database Performance Under Load', () => {
    it('validates database query performance with large datasets', () => {
      // Test transaction queries
      cy.request({
        method: 'GET',
        url: '/api/v1/transactions?limit=100&offset=0',
        headers: { 'X-Performance-Test': 'true' }
      }).then(response => {
        expect(response.status).to.equal(200);
        expect(response.headers['x-db-query-time']).to.exist;
        
        const queryTime = parseInt(response.headers['x-db-query-time']);
        expect(queryTime).to.be.lessThan(performanceThresholds.databaseQuery);
        
        cy.log(`Transaction query time: ${queryTime}ms`);
      });

      // Test analytics aggregation queries
      cy.request({
        method: 'GET',
        url: '/api/v1/transactions/analytics/spending?period=year',
        headers: { 'X-Performance-Test': 'true' }
      }).then(response => {
        expect(response.status).to.equal(200);
        
        const queryTime = parseInt(response.headers['x-db-query-time'] || '0');
        expect(queryTime).to.be.lessThan(performanceThresholds.databaseQuery * 2); // Allow 2x for aggregations
        
        cy.log(`Analytics aggregation query time: ${queryTime}ms`);
      });

      // Test concurrent database operations
      const concurrentRequests = [
        '/api/v1/transactions?limit=50',
        '/api/v1/accounts/',
        '/api/v1/budget/categories',
        '/api/v1/analytics/dashboard/insights'
      ];

      const startTime = Date.now();
      
      Promise.all(
        concurrentRequests.map(url => 
          cy.request({
            method: 'GET',
            url,
            headers: { 'X-Performance-Test': 'true' }
          })
        )
      ).then(responses => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        responses.forEach((response, index) => {
          expect(response.status).to.equal(200);
        });

        expect(totalTime).to.be.lessThan(performanceThresholds.apiResponse * 2);
        cy.log(`Concurrent database operations time: ${totalTime}ms`);
      });
    });
  });

  describe('Mobile Performance', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('validates mobile performance with network throttling', () => {
      // Simulate slow 3G network
      cy.intercept('**', (req) => {
        req.on('response', (res) => {
          // Add artificial delay to simulate slow network
          res.delay = Math.random() * 1000 + 500; // 500-1500ms delay
        });
      });

      cy.visit('/timeline');

      // Test progressive loading on slow network
      cy.get('[data-cy="loading-skeleton"]').should('be.visible');
      cy.get('[data-cy="timeline-dashboard"]', { timeout: 15000 }).should('be.visible');

      // Test mobile interaction performance on slow network
      cy.get('[data-cy="mobile-nav-budget"]').click();
      cy.get('[data-cy="mobile-budget-overview"]', { timeout: 10000 }).should('be.visible');

      // Test offline capabilities
      cy.window().then(win => {
        win.navigator.onLine = false;
      });

      cy.get('[data-cy="mobile-nav-transactions"]').click();
      cy.get('[data-cy="cached-transactions"]', { timeout: 5000 }).should('be.visible');
    });

    it('validates mobile touch performance and responsiveness', () => {
      cy.visit('/transactions');

      // Test touch response time
      cy.window().then(win => {
        let touchStartTime;
        
        win.addEventListener('touchstart', () => {
          touchStartTime = performance.now();
        });
        
        win.addEventListener('touchend', () => {
          const touchDuration = performance.now() - touchStartTime;
          expect(touchDuration).to.be.lessThan(100); // 100ms max touch response
        });
      });

      // Test scroll performance on mobile
      cy.get('[data-cy="mobile-transaction-list"]').then($list => {
        let scrollStartTime;
        
        $list.on('touchstart', () => {
          scrollStartTime = performance.now();
        });
        
        $list.on('scroll', () => {
          const scrollResponseTime = performance.now() - scrollStartTime;
          expect(scrollResponseTime).to.be.lessThan(16); // 60fps
        });
      });

      cy.get('[data-cy="mobile-transaction-list"]').scrollTo('bottom', { duration: 2000 });
    });
  });

  describe('Performance Monitoring and Alerting', () => {
    it('validates performance monitoring integration', () => {
      cy.visit('/timeline');

      // Check if performance monitoring is active
      cy.window().then(win => {
        // Check for performance observer
        expect(win.PerformanceObserver).to.exist;
        
        // Check if custom performance metrics are being collected
        if (win.__PERFORMANCE_METRICS__) {
          expect(win.__PERFORMANCE_METRICS__.pageLoadTime).to.exist;
          expect(win.__PERFORMANCE_METRICS__.apiResponseTimes).to.exist;
          expect(win.__PERFORMANCE_METRICS__.memoryUsage).to.exist;
        }
      });

      // Test performance metric reporting
      cy.request({
        method: 'GET',
        url: '/api/v1/monitoring/performance',
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200) {
          expect(response.body).to.have.property('metrics');
          expect(response.body.metrics).to.have.property('averageResponseTime');
          expect(response.body.metrics).to.have.property('errorRate');
        }
      });
    });

    it('validates performance regression detection', () => {
      // Establish baseline performance
      const performanceBaseline = {
        pageLoadTime: 2500,
        apiResponseTime: 800,
        memoryUsage: 80,
        renderTime: 1500
      };

      cy.visit('/timeline');
      
      // Measure current performance
      cy.window().then(win => {
        win.performance.mark('baseline-test-start');
      });

      cy.get('[data-cy="timeline-dashboard"]').should('be.visible');
      cy.get('[data-cy="alignment-score"]').should('exist');

      cy.window().then(win => {
        win.performance.mark('baseline-test-end');
        win.performance.measure('baseline-test-time', 'baseline-test-start', 'baseline-test-end');
        
        const measure = win.performance.getEntriesByName('baseline-test-time')[0];
        
        // Check for performance regression (more than 20% slower than baseline)
        const regressionThreshold = performanceBaseline.pageLoadTime * 1.2;
        expect(measure.duration).to.be.lessThan(regressionThreshold);
        
        if (measure.duration > performanceBaseline.pageLoadTime) {
          const degradation = ((measure.duration - performanceBaseline.pageLoadTime) / performanceBaseline.pageLoadTime) * 100;
          cy.log(`Performance degradation detected: ${degradation.toFixed(2)}%`);
        }
      });
    });
  });

  after(() => {
    // Generate performance report
    cy.task('generatePerformanceReport', {
      testSuite: 'Performance Integration Testing',
      timestamp: new Date().toISOString(),
      thresholds: performanceThresholds
    });
  });
});

// Performance test utilities
Cypress.Commands.add('measurePerformance', (markName, callback) => {
  cy.window().then(win => {
    win.performance.mark(`${markName}-start`);
  });
  
  callback();
  
  cy.window().then(win => {
    win.performance.mark(`${markName}-end`);
    win.performance.measure(markName, `${markName}-start`, `${markName}-end`);
    
    const measure = win.performance.getEntriesByName(markName)[0];
    return measure.duration;
  });
});

Cypress.Commands.add('profileMemoryUsage', () => {
  cy.window().then(win => {
    if (win.performance.memory) {
      return {
        used: win.performance.memory.usedJSHeapSize,
        total: win.performance.memory.totalJSHeapSize,
        limit: win.performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  });
});