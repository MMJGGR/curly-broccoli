import pytest
from datetime import date
from api.app.domain.value_objects.period import Period, PeriodType


class TestPeriod:
    """Test suite for Period value object"""
    
    def test_period_creation(self):
        """Test Period object creation"""
        start = date(2025, 1, 1)
        end = date(2025, 1, 31)
        period = Period(PeriodType.MONTHLY, start, end)
        
        assert period.period_type == PeriodType.MONTHLY
        assert period.start_date == start
        assert period.end_date == end
    
    def test_period_invalid_dates_fails(self):
        """Test Period creation fails when end date is before start date"""
        start = date(2025, 1, 31)
        end = date(2025, 1, 1)
        
        with pytest.raises(ValueError, match="End date must be after start date"):
            Period(PeriodType.MONTHLY, start, end)
    
    def test_monthly_period_factory(self):
        """Test monthly period factory method"""
        period = Period.monthly(2025, 3)
        
        assert period.period_type == PeriodType.MONTHLY
        assert period.start_date == date(2025, 3, 1)
        assert period.end_date == date(2025, 3, 31)
    
    def test_monthly_period_february(self):
        """Test monthly period for February (leap year handling)"""
        # Non-leap year
        period = Period.monthly(2025, 2)
        assert period.end_date == date(2025, 2, 28)
        
        # Leap year
        period = Period.monthly(2024, 2)
        assert period.end_date == date(2024, 2, 29)
    
    def test_yearly_period_factory(self):
        """Test yearly period factory method"""
        period = Period.yearly(2025)
        
        assert period.period_type == PeriodType.YEARLY
        assert period.start_date == date(2025, 1, 1)
        assert period.end_date == date(2025, 12, 31)
    
    def test_period_duration_days(self):
        """Test period duration calculation"""
        # January (31 days)
        period = Period.monthly(2025, 1)
        assert period.duration_days() == 31
        
        # February (28 days)
        period = Period.monthly(2025, 2)
        assert period.duration_days() == 28
        
        # Full year
        period = Period.yearly(2025)
        assert period.duration_days() == 365
    
    def test_period_contains_date(self):
        """Test if period contains a specific date"""
        period = Period.monthly(2025, 3)
        
        # Dates within period
        assert period.contains_date(date(2025, 3, 1)) is True
        assert period.contains_date(date(2025, 3, 15)) is True
        assert period.contains_date(date(2025, 3, 31)) is True
        
        # Dates outside period
        assert period.contains_date(date(2025, 2, 28)) is False
        assert period.contains_date(date(2025, 4, 1)) is False
    
    def test_period_overlaps_with(self):
        """Test period overlap detection"""
        period1 = Period(PeriodType.MONTHLY, date(2025, 3, 1), date(2025, 3, 31))
        
        # Overlapping periods
        period2 = Period(PeriodType.MONTHLY, date(2025, 3, 15), date(2025, 4, 15))
        assert period1.overlaps_with(period2) is True
        
        # Non-overlapping periods
        period3 = Period(PeriodType.MONTHLY, date(2025, 4, 1), date(2025, 4, 30))
        assert period1.overlaps_with(period3) is False
        
        # Adjacent periods (should not overlap)
        period4 = Period(PeriodType.MONTHLY, date(2025, 2, 1), date(2025, 2, 28))
        assert period1.overlaps_with(period4) is False
    
    def test_period_string_representation(self):
        """Test Period string formatting"""
        period = Period.monthly(2025, 3)
        expected = "monthly: 2025-03-01 to 2025-03-31"
        assert str(period) == expected
    
    def test_period_types(self):
        """Test all period types are available"""
        assert PeriodType.MONTHLY.value == "monthly"
        assert PeriodType.YEARLY.value == "yearly"
        assert PeriodType.QUARTERLY.value == "quarterly"
        assert PeriodType.WEEKLY.value == "weekly"