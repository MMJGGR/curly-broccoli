# Technical Development Guide

## Overview

This document provides technical standards and architectural guidelines for ongoing development of the personal finance application. It defines patterns, conventions, and implementation approaches that must be followed to maintain code quality and architectural integrity.

## Architecture Principles

### Clean Architecture Compliance

All new code must follow clean architecture principles:

1. **Dependency Inversion**: Inner layers never depend on outer layers
2. **Single Responsibility**: Each class/module has one reason to change
3. **Interface Segregation**: Clients depend only on interfaces they use
4. **Domain Isolation**: Business logic is framework-agnostic

### Layer Responsibilities

#### Domain Layer (`api/app/domain/`)
- **Purpose**: Core business entities and rules
- **Dependencies**: None (pure business logic)
- **Contains**: Entities, Value Objects, Domain Services, Repository Interfaces

```python
# Example: Domain Entity
@dataclass
class Budget:
    user_id: int
    period: Period
    categories: Dict[str, Money]
    
    def calculate_surplus(self, income: Money) -> Money:
        return income - self.calculate_total_expenses()
```

#### Application Layer (`api/app/application/`)
- **Purpose**: Use cases and application orchestration
- **Dependencies**: Domain layer only
- **Contains**: Use Cases, DTOs, Application Service Interfaces

```python
# Example: Use Case
class CreateBudgetCategory:
    def __init__(self, budget_repo: BudgetRepository):
        self._budget_repo = budget_repo
    
    async def execute(self, request: CreateCategoryRequest) -> None:
        # Business logic orchestration
```

#### Infrastructure Layer (`api/app/infrastructure/`)
- **Purpose**: External system implementations
- **Dependencies**: Application and Domain layers
- **Contains**: Repository Implementations, External Service Clients, ORM Models

#### Interface Layer (`api/app/interfaces/`)
- **Purpose**: External communication adapters
- **Dependencies**: Application layer
- **Contains**: HTTP Controllers, CLI Commands, Serializers

## Financial Domain Standards

### CFA-Level Financial Calculations

All financial calculations must meet CFA Institute professional standards and incorporate comprehensive risk management for individuals:

#### Precision Requirements
```python
# REQUIRED: Use Decimal for all monetary values
from decimal import Decimal, ROUND_HALF_UP

class Money:
    def __init__(self, amount: Decimal):
        self.amount = amount.quantize(Decimal('0.01'), ROUND_HALF_UP)
```

#### Human Capital and Economic Balance Sheet

**1. Human Capital Valuation**
```python
@dataclass
class HumanCapital:
    """CFA Level 3: Present value of future earnings capacity"""
    current_age: int
    retirement_age: int
    current_income: Money
    income_growth_rate: Decimal
    discount_rate: Decimal
    mortality_probability: Decimal
    disability_probability: Decimal
    
    def calculate_present_value(self) -> Money:
        """Calculate HC = Σ[P(survival) × Income(t) / (1 + r)^t]"""
        total_pv = Decimal('0')
        for year in range(self.current_age, self.retirement_age + 1):
            survival_prob = (1 - self.mortality_probability) ** (year - self.current_age)
            disability_adj = 1 - self.disability_probability
            future_income = self.current_income.amount * ((1 + self.income_growth_rate) ** (year - self.current_age))
            discount_factor = (1 + self.discount_rate) ** (year - self.current_age)
            
            pv_year = survival_prob * disability_adj * future_income / discount_factor
            total_pv += pv_year
            
        return Money(total_pv)

@dataclass
class EconomicBalanceSheet:
    """CFA Level 3: Holistic view including human and financial capital"""
    human_capital: HumanCapital
    financial_assets: List[Asset]
    liabilities: List[Liability]
    
    def calculate_total_economic_wealth(self) -> Money:
        hc_value = self.human_capital.calculate_present_value()
        fa_value = sum(asset.current_value.amount for asset in self.financial_assets)
        total_liabilities = sum(liability.balance.amount for liability in self.liabilities)
        return Money(hc_value.amount + fa_value - total_liabilities)
```

**2. Risk Management Framework**
```python
class RiskType(Enum):
    EARNINGS_RISK = "earnings_risk"
    PREMATURE_DEATH = "premature_death"
    LONGEVITY_RISK = "longevity_risk"
    PROPERTY_DAMAGE = "property_damage"
    LIABILITY_RISK = "liability_risk"
    HEALTH_CARE = "health_care"

@dataclass
class RiskExposure:
    risk_type: RiskType
    probability: Decimal  # 0.0 to 1.0
    financial_impact: Money
    current_protection: Money  # Insurance coverage
    
    def calculate_net_exposure(self) -> Money:
        """Net exposure after existing protection"""
        return Money(max(Decimal('0'), self.financial_impact.amount - self.current_protection.amount))

class RiskManagementStrategy(Enum):
    RISK_AVOIDANCE = "avoidance"
    RISK_REDUCTION = "reduction" 
    RISK_TRANSFER = "transfer"
    RISK_RETENTION = "retention"
```

**3. Insurance and Annuity Calculations**
```python
@dataclass
class LifeInsurance:
    coverage_amount: Money
    annual_premium: Money
    policy_type: str  # term, whole, universal, variable
    
    def calculate_needs_analysis(self, human_capital: HumanCapital, 
                                dependents_expenses: Money, 
                                existing_assets: Money) -> Money:
        """Calculate required life insurance coverage"""
        income_replacement = human_capital.calculate_present_value()
        total_needs = income_replacement.amount + dependents_expenses.amount
        coverage_needed = total_needs - existing_assets.amount
        return Money(max(Decimal('0'), coverage_needed))

@dataclass
class Annuity:
    principal: Money
    interest_rate: Decimal
    payment_period: int  # years
    annuity_type: str  # immediate, deferred, fixed, variable
    
    def calculate_periodic_payment(self) -> Money:
        """Calculate annuity payment using present value of annuity formula"""
        if self.annuity_type == "immediate":
            # PV = PMT × [(1 - (1 + r)^-n) / r]
            discount_factor = (1 - (1 + self.interest_rate) ** -self.payment_period) / self.interest_rate
            payment = self.principal.amount / discount_factor
            return Money(payment)
        return Money(Decimal('0'))  # Deferred calculation more complex
```

#### Core Financial Entities

**1. Enhanced Asset Management**
```python
@dataclass
class Asset:
    name: str
    asset_type: AssetType  # real_estate, investment, cash, personal, human_capital
    current_value: Money
    purchase_date: Optional[Date]
    last_updated: DateTime
    risk_characteristics: Dict[str, Decimal]  # volatility, correlation, liquidity
    
    def calculate_risk_adjusted_return(self, risk_free_rate: Decimal) -> Decimal:
        """Calculate Sharpe ratio for risk assessment"""
        expected_return = self.risk_characteristics.get('expected_return', Decimal('0'))
        volatility = self.risk_characteristics.get('volatility', Decimal('1'))
        return (expected_return - risk_free_rate) / volatility

@dataclass
class Liability:
    name: str
    liability_type: LiabilityType  # mortgage, loan, credit_card
    balance: Money
    interest_rate: Decimal
    minimum_payment: Money
    payment_schedule: str  # fixed, variable, interest_only
```

**2. Life-Cycle Financial Planning**
```python
@dataclass
class LifeCycleStage(Enum):
    EDUCATION = "education"
    EARLY_CAREER = "early_career"
    CAREER_DEVELOPMENT = "career_development"
    PRE_RETIREMENT = "pre_retirement"
    RETIREMENT = "retirement"

@dataclass
class FinancialGoal:
    name: str
    target_amount: Money
    target_date: Date
    priority: GoalPriority
    goal_type: GoalType  # retirement, emergency, house, education
    life_cycle_stage: LifeCycleStage
    
    def calculate_monthly_savings_required(self, current_assets: Money, 
                                         expected_return: Decimal) -> Money:
        """Calculate required savings using future value of annuity"""
        months_to_goal = (self.target_date.year - datetime.now().year) * 12
        monthly_rate = expected_return / 12
        
        # Adjust target for existing assets growth
        future_value_existing = current_assets.amount * ((1 + expected_return) ** (months_to_goal / 12))
        net_target = self.target_amount.amount - future_value_existing
        
        # Calculate required monthly payment
        if monthly_rate > 0:
            payment = net_target * monthly_rate / (((1 + monthly_rate) ** months_to_goal) - 1)
        else:
            payment = net_target / months_to_goal
            
        return Money(max(Decimal('0'), payment))
```

**3. Advanced Cash Flow Analysis**
```python
@dataclass
class CashFlowProjection:
    period: Period
    income_streams: List[IncomeSource]
    expense_categories: List[ExpenseCategory]
    human_capital: HumanCapital
    life_cycle_stage: LifeCycleStage
    
    def calculate_13_week_forecast(self) -> List[Money]:
        """Short-term liquidity planning with risk adjustments"""
        # Implementation considers earnings volatility and emergency scenarios
        
    def calculate_lifetime_cashflow(self) -> Dict[int, Money]:
        """Calculate expected cashflows through retirement"""
        cashflows = {}
        for age in range(self.human_capital.current_age, self.human_capital.retirement_age + 30):
            if age <= self.human_capital.retirement_age:
                # Working years - include human capital earnings
                expected_income = self._calculate_age_adjusted_income(age)
            else:
                # Retirement years - portfolio and pension income
                expected_income = self._calculate_retirement_income(age)
            
            expected_expenses = self._calculate_age_adjusted_expenses(age)
            net_cashflow = expected_income - expected_expenses
            cashflows[age] = Money(net_cashflow)
            
        return cashflows
```

### Required Financial Metrics

All implementations must calculate these CFA-standard metrics with risk management integration:

1. **Emergency Fund Ratio**: `liquid_assets / monthly_expenses` (Target: 3-6 months)
2. **Debt-to-Income Ratio**: `total_monthly_debt_payments / gross_monthly_income` (Target: <28%)
3. **Savings Rate**: `monthly_savings / gross_monthly_income` (Target: 10-20%)
4. **Human Capital Ratio**: `human_capital_pv / total_economic_wealth`
5. **Asset Allocation Risk Budget**: Portfolio risk distribution aligned with human capital characteristics
6. **Insurance Coverage Adequacy**: `total_coverage / calculated_needs` (Target: 100%+)
7. **Longevity Risk Factor**: Years of retirement funding secured beyond life expectancy
8. **Liquidity Coverage Ratio**: Short-term liquidity adequacy with stress testing

## Database Standards

### Schema Naming Conventions
- Tables: `snake_case` (e.g., `financial_goals`, `user_assets`)
- Foreign Keys: `{table_name}_id` (e.g., `user_id`, `goal_id`)
- Indexes: `idx_{table}_{column(s)}` (e.g., `idx_transactions_user_date`)

### Required Financial Tables
```sql
-- Core financial data structure
CREATE TABLE user_assets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    asset_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    purchase_price DECIMAL(15,2),
    purchase_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    goal_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE NOT NULL,
    priority INTEGER DEFAULT 1,
    goal_type VARCHAR(50) NOT NULL
);
```

### Data Consistency Rules
1. All monetary values use `DECIMAL(15,2)` precision
2. Timestamps always include timezone information
3. Financial data requires audit trails (created_at, updated_at)
4. Foreign key constraints must be enforced

## API Standards

### Endpoint Naming
- RESTful resource naming: `/api/v1/budget/categories`
- Action-based endpoints: `/api/v1/budget/calculate-forecast`
- Versioning required: Always include `/v1/` in path

### Response Formats
```python
# Standard success response
{
    "data": {...},
    "metadata": {
        "timestamp": "2025-01-20T10:30:00Z",
        "version": "1.0"
    }
}

# Standard error response
{
    "error": {
        "code": "INSUFFICIENT_FUNDS",
        "message": "Budget allocation exceeds available income",
        "details": {...}
    }
}
```

### Required Financial Endpoints
```python
# Core financial planning APIs
GET /api/v1/networth/current
GET /api/v1/networth/history
POST /api/v1/goals/create
GET /api/v1/goals/progress
GET /api/v1/cashflow/forecast/{months}
GET /api/v1/portfolio/allocation
GET /api/v1/financial-health/score
```

## Frontend Architecture Standards

### Component Structure
```
src/
├── domain/                 # Business entities (TypeScript)
├── application/           # Use cases and services
├── infrastructure/        # API clients and storage
├── presentation/         # React components
└── main/                 # App bootstrap and DI
```

### React Component Guidelines

**1. Pure Presentation Components**
```jsx
// Components should only handle UI logic
const BudgetOverview = ({ budget, onCategoryUpdate }) => {
    return (
        <div>
            <h2>Budget Overview</h2>
            <p>Surplus: {budget.surplus.format()}</p>
        </div>
    );
};
```

**2. Business Logic in Services**
```typescript
// Business logic belongs in application services
export class BudgetService {
    async calculateBudgetSurplus(userId: string): Promise<Money> {
        const budget = await this.budgetRepository.getByUserId(userId);
        return budget.calculateSurplus();
    }
}
```

### State Management
- Use React Context for UI state only
- Business state managed by application services
- No direct API calls in components

## Testing Standards

### Test Structure
```
tests/
├── unit/
│   ├── domain/           # Domain entity tests
│   ├── application/      # Use case tests  
│   └── infrastructure/   # Repository tests
├── integration/          # Cross-layer tests
└── e2e/                 # End-to-end scenarios
```

### Financial Calculation Tests
```python
def test_emergency_fund_calculation():
    """Test CFA-standard emergency fund ratio calculation"""
    user = create_test_user(monthly_expenses=Money(5000))
    assets = [
        Asset(name="Savings", asset_type=AssetType.CASH, value=Money(30000))
    ]
    
    ratio = calculate_emergency_fund_ratio(user, assets)
    assert ratio == Decimal('6.0')  # 6 months coverage
```

### Required Test Coverage
- Domain entities: 100% test coverage
- Financial calculations: 100% test coverage  
- Use cases: 95% test coverage
- API endpoints: 90% test coverage

## Security Standards

### Financial Data Protection
1. **Encryption**: All sensitive financial data encrypted at rest
2. **Authentication**: Multi-factor authentication for financial operations
3. **Authorization**: Role-based access control (RBAC)
4. **Audit Logging**: Complete audit trail for all financial transactions

### API Security
```python
# Required security headers
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### Data Validation
```python
# Financial data must be validated
class BudgetCategorySchema(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0, decimal_places=2)
    category_type: CategoryType
    
    @validator('amount')
    def validate_amount(cls, v):
        if v > Decimal('1000000'):  # 1M limit
            raise ValueError('Amount exceeds maximum allowed')
        return v
```

## Performance Standards

### Response Time Requirements
- Financial calculations: < 200ms
- Dashboard loading: < 500ms
- Report generation: < 2 seconds
- Data synchronization: < 1 second

### Database Optimization
```sql
-- Required indexes for financial queries
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_budget_categories_user ON budget_categories(user_id);
CREATE INDEX idx_goals_user_target_date ON financial_goals(user_id, target_date);
```

### Caching Strategy
- Financial data: 5-minute cache TTL
- User preferences: 1-hour cache TTL
- Static reference data: 24-hour cache TTL

## Error Handling

### Domain Error Types
```python
class FinancialDomainError(Exception):
    """Base exception for financial domain errors"""
    pass

class InsufficientFundsError(FinancialDomainError):
    """Raised when budget allocation exceeds income"""
    pass

class InvalidGoalDateError(FinancialDomainError):
    """Raised when goal target date is in the past"""
    pass
```

### Error Response Codes
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `422 Unprocessable Entity`: Business rule violation
- `500 Internal Server Error`: System error

## Deployment Standards

### Environment Configuration
```python
# Required environment variables
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
ENCRYPTION_KEY=...
API_BASE_URL=...
FINANCIAL_DATA_RETENTION_DAYS=2555  # 7 years for compliance
```

### Health Checks
```python
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": await check_database_connection(),
        "external_services": await check_external_services(),
        "financial_calculations": await verify_calculation_engine()
    }
```

## Monitoring and Observability

### Required Metrics
- API response times by endpoint
- Financial calculation accuracy
- Database query performance
- User session duration
- Error rates by category

### Logging Standards
```python
# Financial operation logging
logger.info(
    "Budget calculation completed",
    extra={
        "user_id": user_id,
        "calculation_type": "monthly_surplus",
        "execution_time_ms": elapsed_time,
        "result_amount": str(surplus_amount)
    }
)
```

## Compliance Requirements

### Financial Regulations
- **Data Retention**: 7 years for financial records
- **Privacy**: GDPR/CCPA compliance for user data
- **Security**: SOX compliance for financial calculations
- **Audit**: Complete audit trail for all financial operations

### Code Quality Gates
1. **Linting**: Zero lint warnings allowed
2. **Type Checking**: 100% type coverage for financial code
3. **Security Scanning**: No high/critical vulnerabilities
4. **Test Coverage**: Minimum thresholds as specified above

---

## Incremental Development Guidelines

### When to Commit Work

#### Commit Frequency Standards
- **Feature Development**: Commit every 30-60 minutes of productive work
- **Bug Fixes**: Commit immediately after fix verification
- **Refactoring**: Commit each logical refactor step separately
- **Testing**: Commit tests with corresponding implementation changes

#### Commit Triggers - ALWAYS Commit When:
1. **Working Code State**: All existing functionality works
2. **Passing Tests**: Current test suite passes (may be incomplete feature)
3. **Logical Completion**: Single responsibility completed
4. **End of Session**: Before switching context or stopping work
5. **Before Risky Changes**: Before experimental or complex changes

#### Commit Message Standards
```bash
# Format: type(scope): description
feat(budget): add clean architecture domain entities
fix(auth): resolve Unicode encoding in security.py  
refactor(api): extract budget calculation use cases
test(e2e): add comprehensive Cypress test suite
docs(guide): update technical development standards
```

#### Types:
- `feat`: New feature implementation
- `fix`: Bug fix or issue resolution  
- `refactor`: Code restructuring without behavior change
- `test`: Adding or updating tests
- `docs`: Documentation updates
- `perf`: Performance improvements
- `style`: Code formatting/style changes
- `chore`: Build process, dependency updates

### Error Resolution Best Practices

#### Root Cause Analysis Framework
1. **Isolate**: Create minimal reproduction case
2. **Trace**: Follow error from source to manifestation  
3. **Validate**: Verify assumptions with direct testing
4. **Fix**: Address root cause, not symptoms
5. **Prevent**: Add safeguards against recurrence

#### Production-Quality Error Handling

##### ❌ AVOID: Workarounds That Break Production
```python
# BAD: Silencing errors
try:
    result = risky_calculation()
except:
    result = 0  # Hides real issues

# BAD: Quick fixes
if user_input == "weird_edge_case":
    return hardcoded_response  # Not scalable

# BAD: Environment-specific patches  
if os.getenv("DEVELOPMENT"):
    use_mock_data()  # Different behavior per environment
```

##### ✅ PRODUCTION-READY: Robust Error Handling
```python
# GOOD: Explicit error handling
try:
    result = financial_calculation(amount)
except ValueError as e:
    logger.error(f"Invalid amount for calculation: {amount}, error: {e}")
    raise ValidationException(f"Amount must be positive number: {amount}")
except Exception as e:
    logger.error(f"Unexpected error in financial calculation: {e}")
    raise SystemException("Financial calculation unavailable")

# GOOD: Comprehensive validation
def validate_budget_amount(amount: Decimal) -> Decimal:
    if amount < Decimal('0'):
        raise ValueError("Budget amount cannot be negative")
    if amount > Decimal('1000000'):
        raise ValueError("Budget amount exceeds maximum allowed")
    return amount.quantize(Decimal('0.01'))

# GOOD: Graceful degradation
def get_budget_overview(user_id: int) -> BudgetOverview:
    try:
        return full_budget_calculation(user_id)
    except ExternalServiceException:
        logger.warning(f"External service unavailable, using cached data for user {user_id}")
        return cached_budget_overview(user_id)
```

#### Error Prevention Strategies

##### 1. Input Validation
```python
# Validate at boundaries
@dataclass
class CreateBudgetRequest:
    amount: Decimal
    category: str
    
    def __post_init__(self):
        if self.amount <= 0:
            raise ValueError("Amount must be positive")
        if not self.category.strip():
            raise ValueError("Category name required")
```

##### 2. Type Safety
```python
# Use strong typing
from typing import NewType, Optional

UserId = NewType('UserId', int)
Amount = NewType('Amount', Decimal)

def calculate_budget(user_id: UserId, amount: Amount) -> BudgetResult:
    # Type system prevents wrong parameter types
    pass
```

##### 3. Contract Validation
```python
# Pre and post conditions
def transfer_funds(from_account: str, to_account: str, amount: Money) -> None:
    # Preconditions
    assert amount > Money(Decimal('0')), "Transfer amount must be positive"
    assert from_account != to_account, "Cannot transfer to same account"
    
    # Business logic here
    
    # Postcondition validation
    assert get_balance(from_account) >= Money(Decimal('0')), "Account balance cannot go negative"
```

#### Debugging Production Issues

##### Diagnostic Steps
1. **Reproduce Locally**: Create exact conditions that trigger the issue
2. **Check Logs**: Trace the complete request lifecycle  
3. **Verify Data**: Ensure database state matches expectations
4. **Test Boundaries**: Check edge cases and error conditions
5. **Monitor Resources**: Check memory, CPU, database connections

##### Logging Standards
```python
import logging
logger = logging.getLogger(__name__)

# Structured logging for production debugging
logger.info(
    "Budget calculation completed",
    extra={
        "user_id": user_id,
        "calculation_time_ms": elapsed_time,
        "total_categories": len(categories),
        "total_amount": str(total_amount)
    }
)

# Error logging with context
logger.error(
    "Failed to calculate budget overview", 
    extra={
        "user_id": user_id,
        "error_type": type(e).__name__,
        "error_message": str(e),
        "stack_trace": traceback.format_exc()
    }
)
```

#### Preventing Technical Debt

##### Code Quality Checks Before Commit
```bash
# Run full validation suite
npm run validate  # Frontend: lint + format + test
python -m pytest # Backend: test suite
python -m mypy .  # Type checking
```

##### Architecture Validation
- **Dependency Direction**: Inner layers never import from outer layers
- **Single Responsibility**: Each module has one clear purpose  
- **Interface Segregation**: Clean boundaries between layers
- **Business Logic Isolation**: Domain logic is framework-independent

##### Performance Validation
```python
# Performance assertions in tests
def test_budget_calculation_performance():
    start = time.time()
    result = calculate_budget_overview(test_user_id)
    elapsed = time.time() - start
    
    assert elapsed < 2.0, f"Budget calculation too slow: {elapsed:.2f}s"
    assert len(result.categories) > 0, "Budget should have categories"
```

---

## Quick Reference

### New Feature Checklist
- [ ] Domain entities follow DDD patterns
- [ ] Financial calculations use Decimal precision
- [ ] Use cases are framework-agnostic
- [ ] API endpoints follow REST conventions
- [ ] Security validation implemented
- [ ] Comprehensive tests written
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Code Review Checklist
- [ ] Business logic in domain layer
- [ ] No framework dependencies in domain
- [ ] Proper error handling implemented
- [ ] Financial calculations auditable
- [ ] Security considerations addressed
- [ ] Test coverage adequate
- [ ] Performance impact assessed

This guide should be consulted for all development activities and updated as architectural decisions evolve.