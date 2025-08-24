"""
Setup configuration for the financial planning API package.
Ensures proper module resolution in all environments.
"""
from setuptools import setup, find_packages

setup(
    name="financial-planning-api",
    version="1.0.0",
    description="CFA-compliant financial planning API with clean architecture",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        # Dependencies will be read from requirements.txt
    ],
    package_dir={'': '.'},
    include_package_data=True,
)