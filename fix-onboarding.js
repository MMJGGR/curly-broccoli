/**
 * Quick fix script to replace the broken completeOnboarding function
 * Rolling back the overcomplicated CRUD approach to simple backend completion
 */

const fs = require('fs');

const filePath = 'C:\\Users\\Richard\\curly-broccoli\\frontend\\src\\components\\onboarding\\OnboardingWizard.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Find the start and end of the broken function
const functionStart = fileContent.indexOf('const completeOnboarding = async () => {');
const functionEnd = fileContent.indexOf('  };', functionStart) + 4;

const brokenFunction = fileContent.substring(functionStart, functionEnd);

const fixedFunction = `const completeOnboarding = async () => {
    try {
      console.log('✅ Starting onboarding completion...');
      
      // Simply mark the onboarding as complete in the backend
      // The backend endpoints already handle converting onboarding data to financial entities
      const response = await fetch(\`\${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/onboarding/complete\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('jwt')}\`
        },
        body: JSON.stringify({
          force_complete: true
        })
      });
      
      if (response.ok) {
        console.log('✅ Onboarding marked as complete in backend');
        setIsComplete(true);
        
        // Refresh all financial data to pick up the onboarding-converted data
        if (loadAllFinancialData) {
          console.log('🔄 Refreshing UnifiedFinancialContext data...');
          await loadAllFinancialData();
        }
        
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to complete onboarding:', errorData);
        setError(\`Failed to complete onboarding: \${errorData.detail}\`);
        return { success: false, error: errorData.detail };
      }
      
    } catch (error) {
      console.error('❌ Error during onboarding completion:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }`;

const fixedContent = fileContent.replace(brokenFunction, fixedFunction);

fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log('✅ Fixed the broken completeOnboarding function!');
console.log('🔧 Rolled back from complex CRUD approach to simple backend completion');