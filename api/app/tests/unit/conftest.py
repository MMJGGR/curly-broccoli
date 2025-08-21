"""
Pytest configuration for unit tests.
Unit tests should not depend on external systems like databases.
"""
import pytest
import sys
from pathlib import Path

# Add the api directory to the Python path for imports
api_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(api_dir))