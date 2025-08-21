from enum import Enum
from dataclasses import dataclass
from datetime import date
from typing import Optional


class PeriodType(Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"
    QUARTERLY = "quarterly"
    WEEKLY = "weekly"


@dataclass(frozen=True)
class Period:
    period_type: PeriodType
    start_date: date
    end_date: date
    
    def __post_init__(self):
        if self.end_date < self.start_date:
            raise ValueError("End date must be after start date")
    
    @classmethod
    def monthly(cls, year: int, month: int) -> 'Period':
        """Create a monthly period for the given year and month"""
        from calendar import monthrange
        
        start_date = date(year, month, 1)
        last_day = monthrange(year, month)[1]
        end_date = date(year, month, last_day)
        
        return cls(PeriodType.MONTHLY, start_date, end_date)
    
    @classmethod
    def yearly(cls, year: int) -> 'Period':
        """Create a yearly period for the given year"""
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        
        return cls(PeriodType.YEARLY, start_date, end_date)
    
    def duration_days(self) -> int:
        """Calculate the duration of the period in days"""
        return (self.end_date - self.start_date).days + 1
    
    def contains_date(self, check_date: date) -> bool:
        """Check if a date falls within this period"""
        return self.start_date <= check_date <= self.end_date
    
    def overlaps_with(self, other: 'Period') -> bool:
        """Check if this period overlaps with another period"""
        return not (self.end_date < other.start_date or self.start_date > other.end_date)
    
    def __str__(self) -> str:
        return f"{self.period_type.value}: {self.start_date} to {self.end_date}"