"""
Domain Services Module

Contains business logic that doesn't naturally fit within a single entity
and implements domain-specific operations following clean architecture principles.
"""

from .validation_service import CFAValidationService

__all__ = ['CFAValidationService']