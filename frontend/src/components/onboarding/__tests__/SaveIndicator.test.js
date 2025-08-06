/**
 * SaveIndicator Unit Tests
 * Tests the save status indicator component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import SaveIndicator from '../SaveIndicator';

describe('SaveIndicator', () => {
  describe('Component Rendering', () => {
    it('should render saving state with spinner', () => {
      render(<SaveIndicator stepNumber={1} status="saving" />);
      
      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
      
      // Should have spinning animation
      const spinner = screen.getByRole('img', { hidden: true }); // SVG spinner
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should render saved state with checkmark', () => {
      render(<SaveIndicator stepNumber={1} status="saved" />);
      
      expect(screen.getByText(/saved$/i)).toBeInTheDocument();
      
      // Should have checkmark icon (not spinner)
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).not.toHaveClass('animate-spin');
    });

    it('should render error state with error icon', () => {
      render(<SaveIndicator stepNumber={1} status="error" />);
      
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      
      // Should have error styling
      const errorDiv = screen.getByText(/error/i).closest('div');
      expect(errorDiv).toHaveClass('text-red-600');
    });

    it('should render nothing for unknown status', () => {
      const { container } = render(<SaveIndicator stepNumber={1} status="unknown" />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should render nothing for idle status', () => {
      const { container } = render(<SaveIndicator stepNumber={1} status="idle" />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Visual Styling', () => {
    it('should apply correct color for saving state', () => {
      render(<SaveIndicator stepNumber={1} status="saving" />);
      
      const savingDiv = screen.getByText(/saving\.\.\./i).closest('div');
      expect(savingDiv).toHaveClass('text-blue-600');
    });

    it('should apply correct color for saved state', () => {
      render(<SaveIndicator stepNumber={1} status="saved" />);
      
      const savedDiv = screen.getByText(/saved$/i).closest('div');
      expect(savedDiv).toHaveClass('text-green-600');
    });

    it('should apply correct color for error state', () => {
      render(<SaveIndicator stepNumber={1} status="error" />);
      
      const errorDiv = screen.getByText(/error/i).closest('div');
      expect(errorDiv).toHaveClass('text-red-600');
    });

    it('should have consistent layout styling', () => {
      render(<SaveIndicator stepNumber={1} status="saved" />);
      
      const container = screen.getByText(/saved$/i).closest('div');
      expect(container).toHaveClass('flex', 'items-center', 'text-sm');
    });
  });

  describe('Icon Rendering', () => {
    it('should render spinner icon for saving state', () => {
      render(<SaveIndicator stepNumber={1} status="saving" />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toHaveClass('animate-spin', 'w-4', 'h-4', 'mr-1');
      
      // Check for spinner-specific elements
      const circle = spinner.querySelector('circle');
      const path = spinner.querySelector('path');
      expect(circle).toBeInTheDocument();
      expect(path).toBeInTheDocument();
    });

    it('should render checkmark icon for saved state', () => {
      render(<SaveIndicator stepNumber={1} status="saved" />);
      
      const checkmark = screen.getByRole('img', { hidden: true });
      expect(checkmark).toHaveClass('w-4', 'h-4', 'mr-1');
      expect(checkmark).not.toHaveClass('animate-spin');
      
      // Check for checkmark path
      const path = checkmark.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('fillRule', 'evenodd');
    });

    it('should render error icon for error state', () => {
      render(<SaveIndicator stepNumber={1} status="error" />);
      
      const errorIcon = screen.getByRole('img', { hidden: true });
      expect(errorIcon).toHaveClass('w-4', 'h-4', 'mr-1');
      
      // Check for error icon path
      const path = errorIcon.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('fillRule', 'evenodd');
    });
  });

  describe('Component Props', () => {
    it('should accept stepNumber prop without affecting rendering', () => {
      render(<SaveIndicator stepNumber={3} status="saved" />);
      
      expect(screen.getByText(/saved$/i)).toBeInTheDocument();
    });

    it('should work with different step numbers', () => {
      const { rerender } = render(<SaveIndicator stepNumber={1} status="saving" />);
      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
      
      rerender(<SaveIndicator stepNumber={5} status="saved" />);
      expect(screen.getByText(/saved$/i)).toBeInTheDocument();
    });
  });

  describe('Status Transitions', () => {
    it('should handle status changes correctly', () => {
      const { rerender } = render(<SaveIndicator stepNumber={1} status="idle" />);
      
      // Initially nothing
      expect(screen.queryByText(/saving|saved|error/i)).not.toBeInTheDocument();
      
      // Change to saving
      rerender(<SaveIndicator stepNumber={1} status="saving" />);
      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
      
      // Change to saved
      rerender(<SaveIndicator stepNumber={1} status="saved" />);
      expect(screen.getByText(/saved$/i)).toBeInTheDocument();
      expect(screen.queryByText(/saving\.\.\./i)).not.toBeInTheDocument();
      
      // Change to error
      rerender(<SaveIndicator stepNumber={1} status="error" />);
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.queryByText(/saved$/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should provide meaningful text for screen readers', () => {
      render(<SaveIndicator stepNumber={1} status="saving" />);
      
      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
    });

    it('should have proper icon accessibility', () => {
      render(<SaveIndicator stepNumber={1} status="saved" />);
      
      // SVG should be marked as decorative (hidden from screen readers)
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
    });

    it('should be keyboard accessible when part of larger components', () => {
      render(<SaveIndicator stepNumber={1} status="saved" />);
      
      const container = screen.getByText(/saved$/i).closest('div');
      expect(container).not.toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Animation Behavior', () => {
    it('should have spinning animation only for saving state', () => {
      const { rerender } = render(<SaveIndicator stepNumber={1} status="saving" />);
      
      let icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('animate-spin');
      
      rerender(<SaveIndicator stepNumber={1} status="saved" />);
      icon = screen.getByRole('img', { hidden: true });
      expect(icon).not.toHaveClass('animate-spin');
      
      rerender(<SaveIndicator stepNumber={1} status="error" />);
      icon = screen.getByRole('img', { hidden: true });
      expect(icon).not.toHaveClass('animate-spin');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null status gracefully', () => {
      const { container } = render(<SaveIndicator stepNumber={1} status={null} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should handle undefined status gracefully', () => {
      const { container } = render(<SaveIndicator stepNumber={1} status={undefined} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should handle missing stepNumber prop', () => {
      render(<SaveIndicator status="saved" />);
      
      expect(screen.getByText(/saved$/i)).toBeInTheDocument();
    });

    it('should handle empty string status', () => {
      const { container } = render(<SaveIndicator stepNumber={1} status="" />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Component Structure', () => {
    it('should render with proper semantic structure', () => {
      render(<SaveIndicator stepNumber={1} status="saved" />);
      
      const container = screen.getByText(/saved$/i).closest('div');
      expect(container).toHaveClass('flex', 'items-center');
      
      // Should have icon and text as siblings
      const icon = container.querySelector('svg');
      const text = container.querySelector('div');
      expect(icon).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });

    it('should maintain consistent spacing between icon and text', () => {
      render(<SaveIndicator stepNumber={1} status="saving" />);
      
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('mr-1');
    });
  });

  describe('Visual Feedback', () => {
    it('should provide distinct visual feedback for each state', () => {
      const { rerender } = render(<SaveIndicator stepNumber={1} status="saving" />);
      
      // Saving: blue + spinner
      let container = screen.getByText(/saving\.\.\./i).closest('div');
      expect(container).toHaveClass('text-blue-600');
      expect(screen.getByRole('img', { hidden: true })).toHaveClass('animate-spin');
      
      // Saved: green + checkmark
      rerender(<SaveIndicator stepNumber={1} status="saved" />);
      container = screen.getByText(/saved$/i).closest('div');
      expect(container).toHaveClass('text-green-600');
      expect(screen.getByRole('img', { hidden: true })).not.toHaveClass('animate-spin');
      
      // Error: red + error icon
      rerender(<SaveIndicator stepNumber={1} status="error" />);
      container = screen.getByText(/error/i).closest('div');
      expect(container).toHaveClass('text-red-600');
    });
  });
});