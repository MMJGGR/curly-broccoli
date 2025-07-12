"""Tests for compute operations."""

from ..operations import add


def test_add():
    assert add(2, 3) == 5
