import React, { useState, useEffect } from 'react';

/**
 * Mobile Authentication Enhancements Component
 * Provides mobile-specific authentication features
 */
const MobileAuthEnhancements = ({ onLogin }) => {
  const [supportsBiometric, setSupportsBiometric] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check for biometric authentication support
    checkBiometricSupport();
    
    // Check for PWA install prompt
    window.addEventListener('beforeinstallprompt', handlePWAInstallPrompt);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running as PWA');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePWAInstallPrompt);
    };
  }, []);

  const checkBiometricSupport = async () => {
    if (window.PublicKeyCredential && 
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setSupportsBiometric(available);
      } catch (error) {
        console.log('Biometric authentication not available:', error);
      }
    }
  };

  const handlePWAInstallPrompt = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowPWAInstall(true);
  };

  const handleBiometricLogin = async () => {
    if (!supportsBiometric) return;
    
    try {
      // Implementation for WebAuthn biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Personal Finance App" },
          user: {
            id: new Uint8Array(16),
            name: localStorage.getItem('lastLoginEmail') || 'user@example.com',
            displayName: 'User'
          },
          pubKeyCredParams: [{alg: -7, type: "public-key"}],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });
      
      if (credential) {
        // Process biometric login
        console.log('Biometric authentication successful');
        onLogin && onLogin({ biometric: true });
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowPWAInstall(false);
    }
  };

  const handleRememberMe = (checked) => {
    setRememberMe(checked);
    if (checked) {
      // Set longer session timeout for mobile
      localStorage.setItem('mobileRememberMe', 'true');
      localStorage.setItem('mobileSessionTimeout', Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    } else {
      localStorage.removeItem('mobileRememberMe');
      localStorage.removeItem('mobileSessionTimeout');
    }
  };

  return (
    <div className="mobile-auth-enhancements">
      {/* PWA Install Prompt */}
      {showPWAInstall && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">Install App</h3>
              <p className="text-xs text-blue-600">Add to home screen for better experience</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstallPWA}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
              >
                Install
              </button>
              <button
                onClick={() => setShowPWAInstall(false)}
                className="text-blue-600 px-2 py-1 text-xs hover:text-blue-800"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Login Option */}
      {supportsBiometric && (
        <button
          onClick={handleBiometricLogin}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-2 hover:from-green-600 hover:to-blue-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Login with Biometric
        </button>
      )}

      {/* Remember Me Option */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => handleRememberMe(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
          Keep me signed in for 30 days
        </label>
      </div>

      {/* Mobile-specific session info */}
      <div className="text-xs text-gray-500 text-center">
        {rememberMe && (
          <p>Extended mobile session active</p>
        )}
      </div>
    </div>
  );
};

export default MobileAuthEnhancements;