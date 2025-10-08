from compute.budget import (
    sum_monthly_income,
    sum_monthly_expenses,
    compute_net_cash_flow,
    compute_budget_summary,
)


def test_sum_monthly_income_and_expenses():
    incomes = [
        {"monthly_amount": 50000},
        {"amount": 20000},
    ]
    expenses = [
        {"monthly_equivalent": 30000},
        {"amount": 5000},
    ]

    assert sum_monthly_income(incomes) == 70000
    assert sum_monthly_expenses(expenses) == 35000


def test_compute_net_cash_flow_positive():
    incomes = [{"monthly_amount": 80000}]
    expenses = [{"monthly_equivalent": 50000}]
    assert compute_net_cash_flow(incomes, expenses) == 30000


def test_compute_net_cash_flow_negative():
    incomes = [{"monthly_amount": 40000}]
    expenses = [{"monthly_equivalent": 55000}]
    assert compute_net_cash_flow(incomes, expenses) == -15000


def test_compute_budget_summary():
    incomes = [{"monthly_amount": 60000}]
    expenses = [{"monthly_equivalent": 45000}]
    summary = compute_budget_summary(incomes, expenses)

    assert summary["total_budgeted"] == 60000
    assert summary["total_spent"] == 45000
    assert summary["remaining_budget"] == 15000
    assert round(summary["budget_utilization"], 2) == 75.00

