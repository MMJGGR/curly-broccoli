"""
Dependency injection configuration for clean architecture.
Provides FastAPI dependencies for use cases and repositories.
"""
from fastapi import Depends
from sqlalchemy.orm import Session

# Import existing database configuration
from ..core.database import get_db

# Import infrastructure implementations
from .repositories.sqlalchemy_budget_repository import SqlAlchemyBudgetRepository

# Import use cases
from ..application.use_cases.get_budget_overview import GetBudgetOverview
from ..application.use_cases.create_budget_category import CreateBudgetCategory
from ..application.use_cases.update_budget_category import UpdateBudgetCategory, UpdateCategorySpending
from ..application.use_cases.create_budget import CreateBudget
from ..application.use_cases.get_budget_history import GetBudgetHistory


# Repository Dependencies
def get_budget_repository(db: Session = Depends(get_db)) -> SqlAlchemyBudgetRepository:
    """Provide SqlAlchemy budget repository implementation"""
    return SqlAlchemyBudgetRepository(db)


# Use Case Dependencies
def get_budget_overview_use_case(
    repo: SqlAlchemyBudgetRepository = Depends(get_budget_repository)
) -> GetBudgetOverview:
    """Provide GetBudgetOverview use case with repository dependency"""
    return GetBudgetOverview(repo)


def get_create_budget_category_use_case(
    repo: SqlAlchemyBudgetRepository = Depends(get_budget_repository)
) -> CreateBudgetCategory:
    """Provide CreateBudgetCategory use case with repository dependency"""
    return CreateBudgetCategory(repo)


def get_update_budget_category_use_case(
    repo: SqlAlchemyBudgetRepository = Depends(get_budget_repository)
) -> UpdateBudgetCategory:
    """Provide UpdateBudgetCategory use case with repository dependency"""
    return UpdateBudgetCategory(repo)


def get_update_category_spending_use_case(
    repo: SqlAlchemyBudgetRepository = Depends(get_budget_repository)
) -> UpdateCategorySpending:
    """Provide UpdateCategorySpending use case with repository dependency"""
    return UpdateCategorySpending(repo)


def get_create_budget_use_case(
    repo: SqlAlchemyBudgetRepository = Depends(get_budget_repository)
) -> CreateBudget:
    """Provide CreateBudget use case with repository dependency"""
    return CreateBudget(repo)


def get_budget_history_use_case(
    repo: SqlAlchemyBudgetRepository = Depends(get_budget_repository)
) -> GetBudgetHistory:
    """Provide GetBudgetHistory use case with repository dependency"""
    return GetBudgetHistory(repo)