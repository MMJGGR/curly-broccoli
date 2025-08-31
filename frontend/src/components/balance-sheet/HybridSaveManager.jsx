import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Save, Clock, Bookmark, AlertCircle, CheckCircle2, Settings } from '../ui/icons';

/**
 * Hybrid Save Manager Component
 * Implements auto-save functionality with manual "Save as Defaults" option
 * CFA-compliant user experience for financial assumption management
 */
const HybridSaveManager = ({ 
  data, 
  onSave, 
  onSaveAsDefaults, 
  entityType = 'asset', 
  autoSaveDelay = 2000,
  showDefaultsOption = true,
  className = '' 
}) => {
  // State management
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, pending, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [defaultsSaveStatus, setDefaultsSaveStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!data || !hasUnsavedChanges) return;

    try {
      setAutoSaveStatus('saving');
      setError(null);
      
      await onSave(data, { autoSave: true });
      
      setAutoSaveStatus('saved');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      // Reset to idle after showing success
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
      
    } catch (err) {
      console.error('Auto-save failed:', err);
      setAutoSaveStatus('error');
      setError(err.message || 'Auto-save failed');
    }
  }, [data, hasUnsavedChanges, onSave]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges || autoSaveStatus === 'saving') return;

    setAutoSaveStatus('pending');
    
    const autoSaveTimer = setTimeout(() => {
      performAutoSave();
    }, autoSaveDelay);

    return () => clearTimeout(autoSaveTimer);
  }, [data, hasUnsavedChanges, performAutoSave, autoSaveDelay, autoSaveStatus]);

  // Monitor data changes
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [data]);

  // Manual save as defaults
  const handleSaveAsDefaults = useCallback(async () => {
    if (!data) return;

    try {
      setDefaultsSaveStatus('saving');
      setError(null);
      
      await onSaveAsDefaults(data);
      
      setDefaultsSaveStatus('saved');
      setTimeout(() => setDefaultsSaveStatus('idle'), 2000);
      
    } catch (err) {
      console.error('Save as defaults failed:', err);
      setDefaultsSaveStatus('error');
      setError(err.message || 'Save as defaults failed');
    }
  }, [data, onSaveAsDefaults]);

  // Force manual save (bypass auto-save delay)
  const handleManualSave = useCallback(async () => {
    if (!data) return;

    try {
      setAutoSaveStatus('saving');
      setError(null);
      
      await onSave(data, { manualSave: true });
      
      setAutoSaveStatus('saved');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      setTimeout(() => setAutoSaveStatus('idle'), 1500);
      
    } catch (err) {
      console.error('Manual save failed:', err);
      setAutoSaveStatus('error');
      setError(err.message || 'Manual save failed');
    }
  }, [data, onSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboardSave = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        if (showDefaultsOption) {
          handleSaveAsDefaults();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardSave);
    return () => document.removeEventListener('keydown', handleKeyboardSave);
  }, [showDefaultsOption, handleManualSave, handleSaveAsDefaults]);

  // Status indicators
  const getAutoSaveIndicator = () => {
    switch (autoSaveStatus) {
      case 'pending':
        return (
          <div className="flex items-center space-x-1 text-yellow-600">
            <Clock className="h-3 w-3 animate-pulse" />
            <span className="text-xs">Auto-saving...</span>
          </div>
        );
      case 'saving':
        return (
          <div className="flex items-center space-x-1 text-blue-600">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-xs">Auto-saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs">Save failed</span>
          </div>
        );
      default:
        return hasUnsavedChanges ? (
          <div className="flex items-center space-x-1 text-gray-500">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-xs">Unsaved changes</span>
          </div>
        ) : null;
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diffMs = now - lastSaved;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className={`hybrid-save-manager ${className}`}>
      {/* Auto-save status bar */}
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 border border-gray-200 rounded-t-lg">
        <div className="flex items-center space-x-3">
          {getAutoSaveIndicator()}
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Last saved: {formatLastSaved()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
            Auto-save enabled
          </Badge>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="px-3 py-2 bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between p-3 bg-white border-l border-r border-b border-gray-200 rounded-b-lg">
        <div className="flex items-center space-x-3">
          {/* Manual save button */}
          <Button
            onClick={handleManualSave}
            disabled={autoSaveStatus === 'saving' || !hasUnsavedChanges}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            title="Save now (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
            <span>Save Now</span>
          </Button>

          {/* Save as defaults button */}
          {showDefaultsOption && (
            <Button
              onClick={handleSaveAsDefaults}
              disabled={defaultsSaveStatus === 'saving' || !data}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              title="Save as my defaults (Ctrl+Shift+S)"
            >
              <Bookmark className="h-4 w-4" />
              <span>
                {defaultsSaveStatus === 'saving' ? 'Saving Defaults...' : 
                 defaultsSaveStatus === 'saved' ? '✓ Saved as Defaults' : 
                 'Save as My Defaults'}
              </span>
            </Button>
          )}
        </div>

        {/* Settings/configuration hint */}
        <div className="flex items-center space-x-2 text-gray-500">
          <Settings className="h-3 w-3" />
          <span className="text-xs">Auto-save every {autoSaveDelay / 1000}s</span>
        </div>
      </div>

      {/* CFA Compliance note */}
      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        <strong>CFA Note:</strong> Auto-save ensures data integrity while manual defaults allow for personalized assumption sets following CFA Institute portfolio management standards.
      </div>
    </div>
  );
};

export default HybridSaveManager;