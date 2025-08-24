"""
Domain Event Base Classes - Following Clean Architecture
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict
from datetime import datetime


class DomainEvent(ABC):
    """Base domain event class"""
    
    def __init__(self):
        import uuid
        self.event_id = str(uuid.uuid4())
        self.occurred_at = datetime.utcnow()


class DomainEventPublisher:
    """Simple domain event publisher"""
    
    def __init__(self):
        self._handlers = {}
    
    async def publish(self, event: DomainEvent):
        """Publish domain event - simplified implementation"""
        # In a real implementation, this would dispatch to event handlers
        # For now, just log the event
        print(f"Domain event published: {event.__class__.__name__} - {event.event_id}")


# Global event publisher instance
domain_event_publisher = DomainEventPublisher()