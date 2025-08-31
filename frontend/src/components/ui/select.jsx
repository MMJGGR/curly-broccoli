import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div ref={selectRef} className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            selectedValue,
            selectContent: children.find(c => c.type === SelectContent)
          });
        }
        if (child.type === SelectContent && isOpen) {
          return React.cloneElement(child, {
            onSelect: handleSelect,
            selectedValue
          });
        }
        return null;
      })}
    </div>
  );
};

export const SelectTrigger = ({ children, onClick, selectedValue, selectContent, className = '', ...props }) => (
  <button
    type="button"
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    onClick={onClick}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (child.type === SelectValue) {
        return React.cloneElement(child, {
          selectedValue,
          children: selectContent ? selectContent.props.children : null
        });
      }
      return child;
    })}
    <ChevronDownIcon />
  </button>
);

export const SelectValue = ({ placeholder, selectedValue, children }) => {
  const findSelectedLabel = (children) => {
    let selectedLabel = placeholder || 'Select...';
    
    const searchChildren = (childrenToSearch) => {
      React.Children.forEach(childrenToSearch, (child) => {
        if (child && child.props && child.props.value === selectedValue) {
          // Extract text content from complex children
          if (typeof child.props.children === 'string') {
            selectedLabel = child.props.children;
          } else if (Array.isArray(child.props.children)) {
            // Get the first text span which should be the main label
            const textChild = child.props.children.find(c => 
              c && typeof c === 'object' && c.props && typeof c.props.children === 'string'
            );
            if (textChild) {
              selectedLabel = textChild.props.children;
            }
          }
        } else if (child && child.props && child.props.children) {
          searchChildren(child.props.children);
        }
      });
    };
    
    searchChildren(children);
    return selectedLabel;
  };

  const displayValue = selectedValue ? findSelectedLabel(children) : (placeholder || 'Select...');
  return <span>{displayValue}</span>;
};

export const SelectContent = ({ children, onSelect, selectedValue, className = '', ...props }) => (
  <div
    className={`absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (child.type === SelectItem) {
        return React.cloneElement(child, {
          onSelect,
          isSelected: child.props.value === selectedValue
        });
      }
      return child;
    })}
  </div>
);

export const SelectItem = ({ children, value, onSelect, isSelected, className = '', ...props }) => (
  <button
    type="button"
    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
      isSelected ? 'bg-blue-50 text-blue-600' : ''
    } ${className}`}
    onClick={() => onSelect && onSelect(value)}
    {...props}
  >
    {children}
  </button>
);

// Simple chevron down icon
const ChevronDownIcon = () => (
  <svg
    className="h-4 w-4 opacity-50"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);