from pydantic import BaseModel

class InitialBalanceSheetSnapshot(BaseModel):
    total_assets: float
    total_liabilities: float
    net_worth: float