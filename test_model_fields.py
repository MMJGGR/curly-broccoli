#!/usr/bin/env python3

# Test script to verify Profile model has advisor fields
import sys
sys.path.append('/app')

from app.models import Profile

# Check if Profile model has advisor fields
profile = Profile()
advisor_fields = ['firm_name', 'license_number', 'professional_email', 'service_model', 'target_client_type', 'minimum_aum']

print("Profile model field check:")
print("=" * 30)

for field in advisor_fields:
    exists = hasattr(profile, field)
    print(f"{field}: {'✅' if exists else '❌'}")

print(f"\nAll Profile attributes:")
all_attrs = [attr for attr in dir(profile) if not attr.startswith('_')]
print(all_attrs)