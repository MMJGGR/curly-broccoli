// Custom start script with historyApiFallback support
const { spawn } = require('child_process');

// Set environment variables for create-react-app to enable historyApiFallback
process.env.GENERATE_SOURCEMAP = 'false';
process.env.BROWSER = 'none';
process.env.HOST = '0.0.0.0';

// Start react-scripts with proper configuration
const child = spawn('react-scripts', ['start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true'
  }
});

child.on('error', (error) => {
  console.error('Error starting React app:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});