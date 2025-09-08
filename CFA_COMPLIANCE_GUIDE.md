# CFA Institute Standards Compliance Guide

## 1. Introduction

This guide ensures the personal finance application adheres to CFA Institute standards for financial analysis, portfolio management, and client advisory services. All financial calculations, recommendations, and methodologies must align with CFA Institute best practices and ethical standards.

## 2. Financial Calculation Standards

### 2.1 Net Worth Calculation
**Standard**: Present comprehensive financial position using fair value principles

**Requirements**:
- **Assets**: Must be valued at fair market value or reasonable approximation
- **Real Estate**: Use recent appraisal or comparable market analysis
- **Investment Securities**: Use current market prices where available
- **Personal Property**: Use depreciated replacement cost
- **Liabilities**: Present value of all outstanding obligations
- **Separation**: Distinguish between liquid and illiquid assets

**Implementation**:
```sql
-- Net Worth Calculation Query
SELECT 
  SUM(CASE WHEN asset_type IN ('cash', 'savings', 'checking') THEN current_value ELSE 0 END) as liquid_assets,
  SUM(CASE WHEN asset_type NOT IN ('cash', 'savings', 'checking') THEN current_value ELSE 0 END) as illiquid_assets,
  SUM(current_value) as total_assets,
  (SELECT SUM(outstanding_balance) FROM liabilities WHERE user_id = ?) as total_liabilities,
  (SUM(current_value) - (SELECT COALESCE(SUM(outstanding_balance), 0) FROM liabilities WHERE user_id = ?)) as net_worth
FROM assets 
WHERE user_id = ?
```

### 2.2 Cash Flow Analysis
**Standard**: Distinguish between operating, investing, and financing cash flows

**Categories**:
- **Operating Cash Flows**: Salary, business income, regular expenses
- **Investing Cash Flows**: Asset purchases/sales, investment returns
- **Financing Cash Flows**: Loan proceeds, debt payments

**Requirements**:
- Monthly cash flow projections with 12-month horizon
- Present value calculations for irregular cash flows
- Tax implications included where material

### 2.3 Return Calculations
**Standard**: Time-weighted and money-weighted return methodologies

**Kenya Market Assumptions** (CFA Institute regional guidelines):
- **Government Securities**: 12-15% annual (Treasury Bills/Bonds)
- **Equity Market (NSE)**: 8-12% long-term average
- **Real Estate**: 6-10% appreciation + rental yield
- **Inflation Assumption**: 5-7% annual
- **Risk-free Rate**: 91-day Treasury Bill rate

## 3. Risk Assessment Standards

### 3.1 Asset Risk Classification
**Standard**: Systematic risk assessment following portfolio theory principles

**Risk Categories**:

| Risk Level | Asset Types | Expected Return (Kenya) | Standard Deviation |
|------------|-------------|------------------------|-------------------|
| **Low** | Government securities, MMF, Cash | 12-15% | 2-5% |
| **Moderate** | Diversified equity funds, REITs, Corporate bonds | 10-18% | 8-15% |
| **High** | Individual stocks, Forex, Commodities | 15-25% | 20-35% |

**Implementation Requirements**:
```javascript
// Risk Classification Logic
const classifyAssetRisk = (assetType, diversificationLevel) => {
  const riskMatrix = {
    'government_securities': 'low',
    'money_market_funds': 'low',
    'savings_accounts': 'low',
    'corporate_bonds': 'moderate',
    'equity_funds': diversificationLevel > 20 ? 'moderate' : 'high',
    'real_estate': 'moderate',
    'individual_stocks': 'high',
    'commodities': 'high'
  };
  return riskMatrix[assetType] || 'high';
};
```

### 3.2 Portfolio Diversification Requirements
**Standard**: Modern Portfolio Theory diversification principles

**Mandatory Guidelines**:
- **Maximum Single Asset Exposure**: 10% (except primary residence)
- **Minimum Liquid Assets**: 60% for working professionals
- **Emergency Fund**: 3-6 months expenses in liquid investments only
- **Geographic Diversification**: Maximum 70% domestic assets for Kenya residents
- **Sector Diversification**: No more than 25% in single sector

**Age-Based Asset Allocation** (CFA Institute lifecycle model):
```javascript
// Age-Appropriate Allocation
const calculateTargetAllocation = (age, riskTolerance) => {
  const baseEquityPercent = Math.max(10, 110 - age); // Rule of 110
  const riskAdjustment = {
    'conservative': -20,
    'moderate': 0,
    'aggressive': +15
  }[riskTolerance];
  
  return {
    equities: Math.min(90, baseEquityPercent + riskAdjustment),
    bonds: Math.max(5, 30 - (riskAdjustment / 2)),
    alternatives: Math.max(5, 10 + (riskAdjustment / 4))
  };
};
```

## 4. Financial Planning Standards

### 4.1 Goal Setting Framework
**Standard**: SMART goals with present value analysis

**Requirements**:
- **Specific**: Clear definition and target amount
- **Measurable**: Quantifiable progress tracking
- **Achievable**: Realistic given current financial situation
- **Relevant**: Aligned with life stage and priorities
- **Time-bound**: Clear timeline with milestones

**Present Value Calculations**:
```javascript
// Goal Funding Calculation
const calculateMonthlyContribution = (goalAmount, yearsToGoal, expectedReturn) => {
  const monthlyRate = expectedReturn / 12;
  const totalMonths = yearsToGoal * 12;
  
  // PMT calculation for future value annuity
  const monthlyContribution = goalAmount * monthlyRate / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  return monthlyContribution;
};
```

### 4.2 Emergency Fund Guidelines
**Standard**: Liquidity buffer following CFA Institute recommendations

**Requirements**:
- **Amount**: 3-6 months of essential expenses
- **Liquidity**: 100% liquid investments (savings, MMF, short-term deposits)
- **Separate Account**: Not part of investment portfolio
- **Accessibility**: Available within 24-48 hours

### 4.3 Investment Capacity Analysis
**Standard**: Systematic surplus/deficit analysis

**Methodology**:
1. Calculate net monthly cash flow
2. Subtract emergency fund contributions
3. Subtract committed savings (goals)
4. Remaining amount available for discretionary investment

```javascript
// Investment Capacity Calculation
const calculateInvestmentCapacity = (monthlyIncome, monthlyExpenses, emergencyFundProgress, goalCommitments) => {
  const netCashFlow = monthlyIncome - monthlyExpenses;
  const emergencyFundGap = Math.max(0, emergencyFundTarget - emergencyFundProgress);
  const emergencyFundContribution = Math.min(netCashFlow * 0.2, emergencyFundGap / 12);
  
  const availableForInvestment = netCashFlow - emergencyFundContribution - goalCommitments;
  
  return {
    netCashFlow,
    emergencyFundContribution,
    goalCommitments,
    availableForInvestment,
    investmentCapacityRatio: availableForInvestment / monthlyIncome
  };
};
```

## 5. Regulatory Compliance (Kenya)

### 5.1 Investment Advisory Standards
**Authority**: Capital Markets Authority (CMA) Kenya

**Requirements**:
- Investment recommendations must include risk disclosures
- No guarantee of returns or performance
- Suitability assessment required before recommendations
- Clear distinction between education and advice

### 5.2 Data Protection Standards
**Authority**: Data Protection Act 2019

**Requirements**:
- Explicit consent for financial data processing
- Right to data portability for users
- Secure storage of financial information
- Regular data protection audits

## 6. Implementation Validation

### 6.1 Calculation Validation Process
**Frequency**: Every calculation module deployment

**Validation Steps**:
1. Unit tests for all financial formulas
2. Cross-check with CFA Institute standard formulas
3. Peer review by CFA charterholder
4. Regulatory compliance review

### 6.2 Performance Standards
**Benchmarks**: Kenya market indices and peer comparison

**Monitoring**:
- Portfolio performance vs NSE 20 Share Index
- Risk-adjusted returns (Sharpe ratio)
- Maximum drawdown analysis
- Correlation analysis with market indices

### 6.3 Audit Requirements
**Schedule**: Quarterly compliance reviews

**Scope**:
- Financial calculation accuracy
- Risk classification consistency  
- Portfolio allocation guidelines adherence
- Regulatory compliance status

## 7. Documentation Standards

### 7.1 Client Communication
**Standard**: Clear, jargon-free explanations of financial concepts

**Requirements**:
- Risk warnings prominently displayed
- Expected return ranges, not point estimates
- Historical performance context
- Regular portfolio review reminders

### 7.2 Methodology Documentation
**Standard**: Full transparency of calculation methods

**Requirements**:
- Source of return assumptions clearly stated
- Risk model methodology explained
- Regular updates to reflect market changes
- Version control for all financial models

---

## Appendix A: Kenya-Specific Considerations

### A.1 Tax Implications
- **Withholding Tax**: 15% on dividends for residents
- **Capital Gains**: No capital gains tax on securities
- **Interest Income**: Subject to withholding tax
- **Real Estate**: Stamp duty and capital gains considerations

### A.2 Local Investment Options
- **Nairobi Securities Exchange (NSE)**: Local equity market
- **M-Akiba**: Retail government bonds via mobile
- **Unit Trusts**: Local mutual fund industry
- **SACCOs**: Cooperative investment opportunities

---

**Document Version**: 1.0  
**Effective Date**: 2025-09-06  
**Next Review**: 2025-12-06  
**Approved By**: CFA Compliance Officer  
**Implementation Status**: Ready for development team integration