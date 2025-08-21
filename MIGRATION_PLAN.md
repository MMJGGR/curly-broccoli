# Clean Architecture Migration Plan

> **⚠️ TEMPORARY DOCUMENT**: This file will be deleted once migration is complete.

## Migration Overview

Transform current tightly-coupled architecture into clean architecture following SOLID principles. This plan addresses specific issues identified in the architectural assessment.

## Current Architecture Issues

### Critical Problems to Fix
1. **File: `api/app/api/v1/endpoints/budget.py:23-806`**
   - Business logic embedded in HTTP controllers
   - Direct database access bypassing service layer
   - 800+ lines of mixed concerns

2. **File: `frontend/src/contexts/BudgetContext.js:388-463`**
   - Financial calculations in React context
   - Business rules in presentation layer

3. **Dependency Violations**
   - Controllers importing other controllers
   - No dependency injection container
   - Tight coupling between layers

## Phase 1: Domain Layer Foundation (Week 1)

### 1.1 Create Domain Structure
```bash
mkdir -p api/app/domain/{entities,value_objects,repositories,services}
```

### 1.2 Core Value Objects
**Create: `api/app/domain/value_objects/money.py`**
```python
from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = "KES"
    
    def __post_init__(self):
        object.__setattr__(self, 'amount', 
            self.amount.quantize(Decimal('0.01'), ROUND_HALF_UP))
    
    def add(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("Cannot add different currencies")
        return Money(self.amount + other.amount, self.currency)
    
    def subtract(self, other: 'Money') -> 'Money':
        return Money(self.amount - other.amount, self.currency)
```

**Create: `api/app/domain/value_objects/period.py`**
```python
from enum import Enum
from dataclasses import dataclass
from datetime import date

class PeriodType(Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

@dataclass(frozen=True)
class Period:
    period_type: PeriodType
    start_date: date
    end_date: date
```

### 1.3 Domain Entities
**Create: `api/app/domain/entities/budget.py`**
```python
from dataclasses import dataclass
from typing import Dict, List
from ..value_objects.money import Money
from ..value_objects.period import Period

@dataclass
class BudgetCategory:
    name: str
    allocated_amount: Money
    spent_amount: Money = Money(Decimal('0'))
    
    def calculate_variance(self) -> Money:
        return self.allocated_amount.subtract(self.spent_amount)
    
    def calculate_variance_percentage(self) -> Decimal:
        if self.allocated_amount.amount == 0:
            return Decimal('0')
        return (self.calculate_variance().amount / self.allocated_amount.amount) * 100

@dataclass
class Budget:
    user_id: int
    period: Period
    monthly_income: Money
    categories: Dict[str, BudgetCategory]
    goal_allocations: Dict[str, Money]
    
    def calculate_total_expenses(self) -> Money:
        total = Money(Decimal('0'))
        for category in self.categories.values():
            total = total.add(category.allocated_amount)
        return total
    
    def calculate_total_goal_allocations(self) -> Money:
        total = Money(Decimal('0'))
        for allocation in self.goal_allocations.values():
            total = total.add(allocation)
        return total
    
    def calculate_surplus(self) -> Money:
        return self.monthly_income.subtract(
            self.calculate_total_expenses().add(self.calculate_total_goal_allocations())
        )
    
    def is_balanced(self) -> bool:
        return self.calculate_surplus().amount >= 0
```

### 1.4 Repository Interfaces
**Create: `api/app/domain/repositories/budget_repository.py`**
```python
from abc import ABC, abstractmethod
from typing import Optional, List
from ..entities.budget import Budget

class BudgetRepository(ABC):
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> Optional[Budget]:
        pass
    
    @abstractmethod
    async def save(self, budget: Budget) -> None:
        pass
    
    @abstractmethod
    async def get_budget_history(self, user_id: int, months: int) -> List[Budget]:
        pass
```

## Phase 2: Application Layer (Week 2)

### 2.1 Create Application Structure
```bash
mkdir -p api/app/application/{use_cases,dto,interfaces}
```

### 2.2 Data Transfer Objects
**Create: `api/app/application/dto/budget_dto.py`**
```python
from dataclasses import dataclass
from typing import Dict, List
from decimal import Decimal

@dataclass
class BudgetOverviewDto:
    monthly_income: Decimal
    total_expenses: Decimal
    total_goals: Decimal
    surplus: Decimal
    categories: Dict[str, Decimal]
    variance_by_category: Dict[str, Decimal]
    is_balanced: bool

@dataclass
class CreateBudgetCategoryRequest:
    user_id: int
    category_name: str
    allocated_amount: Decimal

@dataclass
class UpdateBudgetCategoryRequest:
    user_id: int
    category_name: str
    new_amount: Decimal
```

### 2.3 Use Cases
**Create: `api/app/application/use_cases/get_budget_overview.py`**
```python
from typing import Optional
from ..dto.budget_dto import BudgetOverviewDto
from ...domain.repositories.budget_repository import BudgetRepository

class GetBudgetOverview:
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, user_id: int) -> Optional[BudgetOverviewDto]:
        budget = await self._budget_repository.get_by_user_id(user_id)
        if not budget:
            return None
        
        return BudgetOverviewDto(
            monthly_income=budget.monthly_income.amount,
            total_expenses=budget.calculate_total_expenses().amount,
            total_goals=budget.calculate_total_goal_allocations().amount,
            surplus=budget.calculate_surplus().amount,
            categories={name: cat.allocated_amount.amount 
                       for name, cat in budget.categories.items()},
            variance_by_category={name: cat.calculate_variance_percentage() 
                                 for name, cat in budget.categories.items()},
            is_balanced=budget.is_balanced()
        )
```

**Create: `api/app/application/use_cases/create_budget_category.py`**
```python
from ..dto.budget_dto import CreateBudgetCategoryRequest
from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.entities.budget import BudgetCategory
from ...domain.value_objects.money import Money
from decimal import Decimal

class CreateBudgetCategory:
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, request: CreateBudgetCategoryRequest) -> None:
        budget = await self._budget_repository.get_by_user_id(request.user_id)
        if not budget:
            raise ValueError(f"Budget not found for user {request.user_id}")
        
        new_category = BudgetCategory(
            name=request.category_name,
            allocated_amount=Money(request.allocated_amount)
        )
        
        budget.categories[request.category_name] = new_category
        await self._budget_repository.save(budget)
```

## Phase 3: Infrastructure Layer (Week 3)

### 3.1 Repository Implementations
**Create: `api/app/infrastructure/repositories/sqlalchemy_budget_repository.py`**
```python
from sqlalchemy.orm import Session
from typing import Optional, List
from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.entities.budget import Budget, BudgetCategory
from ...domain.value_objects.money import Money
from ...domain.value_objects.period import Period, PeriodType
from decimal import Decimal

class SqlAlchemyBudgetRepository(BudgetRepository):
    def __init__(self, session: Session):
        self._session = session
    
    async def get_by_user_id(self, user_id: int) -> Optional[Budget]:
        # Query existing tables and transform to domain entities
        from ...models import User, ExpenseCategory  # Import existing models
        
        user_query = self._session.query(User).filter(User.id == user_id).first()
        if not user_query:
            return None
        
        categories_query = self._session.query(ExpenseCategory).filter(
            ExpenseCategory.user_id == user_id
        ).all()
        
        # Transform ORM to domain entities
        categories = {}
        for cat_orm in categories_query:
            categories[cat_orm.name] = BudgetCategory(
                name=cat_orm.name,
                allocated_amount=Money(cat_orm.monthly_amount or Decimal('0'))
            )
        
        return Budget(
            user_id=user_id,
            period=Period(
                period_type=PeriodType.MONTHLY,
                start_date=user_query.created_at.date(),
                end_date=user_query.created_at.date()
            ),
            monthly_income=Money(user_query.monthly_income or Decimal('0')),
            categories=categories,
            goal_allocations={}  # Will be populated from goals table
        )
    
    async def save(self, budget: Budget) -> None:
        # Update existing tables through ORM
        # This preserves existing data structure during migration
        pass
```

### 3.2 Dependency Injection
**Create: `api/app/infrastructure/dependencies.py`**
```python
from fastapi import Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from .repositories.sqlalchemy_budget_repository import SqlAlchemyBudgetRepository
from ..application.use_cases.get_budget_overview import GetBudgetOverview
from ..application.use_cases.create_budget_category import CreateBudgetCategory

def get_budget_repository(db: Session = Depends(get_db)) -> SqlAlchemyBudgetRepository:
    return SqlAlchemyBudgetRepository(db)

def get_budget_overview_use_case(
    repo: SqlAlchemyBudgetRepository = Depends(get_budget_repository)
) -> GetBudgetOverview:
    return GetBudgetOverview(repo)

def get_create_category_use_case(
    repo: SqlAlchemyBudgetRepository = Depends(get_budget_repository)
) -> CreateBudgetCategory:
    return CreateBudgetCategory(repo)
```

## Phase 4: Interface Layer Refactoring (Week 4)

### 4.1 Clean Controllers
**Refactor: `api/app/api/v1/endpoints/budget.py`**

**BEFORE (Lines 23-50 example):**
```python
@router.get("/overview")
def get_budget_overview(user_id: int, db: Session = Depends(get_db)):
    # 50+ lines of business logic mixed with HTTP handling
    user = db.query(User).filter(User.id == user_id).first()
    categories = db.query(ExpenseCategory).filter(...).all()
    # Complex calculations here
    total_expenses = sum(cat.monthly_amount for cat in categories)
    surplus = user.monthly_income - total_expenses
    # More business logic...
    return {"surplus": surplus, "categories": [...]}
```

**AFTER:**
```python
from ...infrastructure.dependencies import get_budget_overview_use_case
from ...application.use_cases.get_budget_overview import GetBudgetOverview

@router.get("/overview")
async def get_budget_overview(
    user_id: int,
    use_case: GetBudgetOverview = Depends(get_budget_overview_use_case)
):
    result = await use_case.execute(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Budget not found")
    return result
```

### 4.2 Systematic Controller Refactoring

**Step 1: Extract Business Logic (Priority Files)**
1. `budget.py:100-200` - Category creation logic → CreateBudgetCategory use case
2. `budget.py:250-350` - Budget calculation logic → CalculateBudgetMetrics use case  
3. `budget.py:400-500` - Goal allocation logic → ManageGoalAllocation use case

**Step 2: Replace Direct DB Access**
- Remove all `db.query()` calls from controllers
- Replace with use case dependencies
- Maintain existing API contracts

## Phase 5: Frontend Clean Architecture (Week 5-6)

### 5.1 Frontend Domain Layer
**Create: `frontend/src/domain/entities/Budget.ts`**
```typescript
export class Money {
    constructor(
        public readonly amount: number,
        public readonly currency: string = 'KES'
    ) {}
    
    add(other: Money): Money {
        return new Money(this.amount + other.amount, this.currency);
    }
    
    format(): string {
        return `${this.currency} ${this.amount.toLocaleString()}`;
    }
}

export class Budget {
    constructor(
        public readonly monthlyIncome: Money,
        public readonly expenses: Record<string, Money>,
        public readonly goalAllocations: Record<string, Money>
    ) {}
    
    calculateTotalExpenses(): Money {
        return Object.values(this.expenses)
            .reduce((sum, expense) => sum.add(expense), new Money(0));
    }
    
    calculateSurplus(): Money {
        const totalExpenses = this.calculateTotalExpenses();
        const totalGoals = Object.values(this.goalAllocations)
            .reduce((sum, goal) => sum.add(goal), new Money(0));
        return this.monthlyIncome.add(totalExpenses.add(totalGoals));
    }
}
```

### 5.2 Application Services
**Create: `frontend/src/application/services/BudgetService.ts`**
```typescript
import { Budget, Money } from '../../domain/entities/Budget';
import { BudgetRepository } from '../../domain/repositories/BudgetRepository';

export class BudgetService {
    constructor(private budgetRepository: BudgetRepository) {}
    
    async getBudgetOverview(userId: string): Promise<Budget> {
        const budgetData = await this.budgetRepository.getByUserId(userId);
        return new Budget(
            new Money(budgetData.monthlyIncome),
            budgetData.expenses,
            budgetData.goalAllocations
        );
    }
    
    async updateCategory(userId: string, categoryName: string, amount: number): Promise<void> {
        await this.budgetRepository.updateCategory(userId, categoryName, amount);
    }
}
```

### 5.3 Refactor React Components
**Refactor: `frontend/src/contexts/BudgetContext.js`**

**BEFORE (Lines 388-463):**
```javascript
// Complex financial calculations in React context
const calculateSurplus = () => {
    let totalExpenses = 0;
    categories.forEach(cat => totalExpenses += cat.amount);
    return monthlyIncome - totalExpenses;
};
```

**AFTER:**
```javascript
// Clean context with service dependency
const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
    const [budget, setBudget] = useState(null);
    const budgetService = useService(BudgetService); // DI container
    
    const loadBudget = async (userId) => {
        const budgetData = await budgetService.getBudgetOverview(userId);
        setBudget(budgetData);
    };
    
    return (
        <BudgetContext.Provider value={{ budget, loadBudget }}>
            {children}
        </BudgetContext.Provider>
    );
};
```

## Migration Execution Strategy

### Week 1: Foundation
- [ ] Create domain structure and value objects
- [ ] Implement core Budget entity with business logic
- [ ] Define repository interfaces
- [ ] Unit test all domain entities

### Week 2: Application Layer  
- [ ] Create use cases for budget operations
- [ ] Implement DTOs for request/response
- [ ] Unit test all use cases
- [ ] Integration test use cases with mock repositories

### Week 3: Infrastructure
- [ ] Implement repository with existing database
- [ ] Create dependency injection container
- [ ] Integration test with real database
- [ ] Performance test repository operations

### Week 4: Controllers
- [ ] Refactor `budget.py` endpoint by endpoint
- [ ] Replace business logic with use case calls
- [ ] Maintain backward compatibility
- [ ] Test each refactored endpoint

### Week 5-6: Frontend
- [ ] Create frontend domain layer
- [ ] Implement application services
- [ ] Refactor React components to be pure presentation
- [ ] Update state management pattern

## Risk Mitigation

### Backward Compatibility
- Keep existing API contracts unchanged
- Implement feature flags for gradual rollout
- Run old and new implementations in parallel during transition

### Data Migration
- No database schema changes required initially
- Repository layer handles ORM to domain mapping
- Existing data structures preserved

### Testing Strategy
- Unit tests for all domain entities
- Integration tests for use cases
- API contract tests for controllers
- E2E tests for critical user flows

### Rollback Plan
- Each phase can be independently rolled back
- Feature flags allow immediate rollback
- Database remains unchanged during migration

## Success Criteria

### Technical Metrics
- [ ] 100% test coverage for domain layer
- [ ] < 200ms response time for budget endpoints
- [ ] Zero regression in existing functionality
- [ ] Clean architecture compliance verified

### Business Metrics
- [ ] All existing user workflows functional
- [ ] No data loss during migration
- [ ] Performance maintained or improved
- [ ] Ready for CFA feature implementation

## Cleanup Tasks (Post-Migration)

1. Remove old business logic from controllers
2. Delete temporary migration files
3. Update technical documentation
4. Conduct architecture review
5. Plan CFA feature implementation

---

**Note**: This document will be deleted once migration is complete. All ongoing development should follow the patterns established in `TECHNICAL_DEVELOPMENT_GUIDE.md`.