"""
Application Layer Exceptions

Business logic exceptions for the application layer following clean architecture.
These exceptions represent violations of business rules and validation failures.
"""

from typing import List, Dict, Any


class ApplicationException(Exception):
    """Base exception for application layer errors"""
    
    def __init__(self, message: str, error_code: str = None, details: Dict[str, Any] = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or {}


class ValidationException(ApplicationException):
    """Raised when input validation fails"""
    
    def __init__(self, message: str, validation_errors: List[str] = None):
        super().__init__(message, "VALIDATION_ERROR")
        self.validation_errors = validation_errors or []


class BusinessRuleViolationException(ApplicationException):
    """Raised when business rules are violated"""
    
    def __init__(self, message: str, error_code: str = "BUSINESS_RULE_VIOLATION", details: Dict[str, Any] = None):
        super().__init__(message, error_code, details)


class ResourceNotFoundException(ApplicationException):
    """Raised when a requested resource is not found"""
    
    def __init__(self, message: str, resource_type: str = None, resource_id: Any = None):
        super().__init__(message, "RESOURCE_NOT_FOUND")
        self.resource_type = resource_type
        self.resource_id = resource_id


class DuplicateResourceException(ApplicationException):
    """Raised when attempting to create a resource that already exists"""
    
    def __init__(self, message: str, resource_type: str = None, conflicting_field: str = None):
        super().__init__(message, "DUPLICATE_RESOURCE")
        self.resource_type = resource_type
        self.conflicting_field = conflicting_field


def raise_validation_error(validation_errors: List[str]) -> None:
    """
    Convenience function to raise validation errors.
    
    Args:
        validation_errors: List of validation error messages
        
    Raises:
        ValidationException: Always raises with the provided errors
    """
    error_message = f"Validation failed: {'; '.join(validation_errors)}"
    raise ValidationException(error_message, validation_errors)