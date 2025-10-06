from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ....auth import get_current_user
from ....models import User, AssetCategory, AssetType
from ....database import get_db

router = APIRouter(prefix="/asset-reference", tags=["asset-reference-v1"])


def _seed_defaults(db: Session):
    """Seed default Kenya-focused categories/types if tables are empty."""
    if db.query(AssetCategory).count() > 0:
        return

    categories = [
        {"code": "cash", "name": "Cash & Equivalents"},
        {"code": "investment_account", "name": "Investment Account"},
        {"code": "real_estate", "name": "Real Estate"},
        {"code": "vehicle", "name": "Vehicle"},
        {"code": "business", "name": "Business"},
        {"code": "collectibles", "name": "Collectibles"},
    ]
    code_map = {}
    for c in categories:
        ac = AssetCategory(code=c["code"], name=c["name"], kenya_specific=True, cfa_compliant=True)
        db.add(ac)
        db.flush()
        code_map[c["code"]] = ac.id

    types = [
        # cash
        {"category": "cash", "code": "savings_account", "name": "Savings Account", "is_liquid": True, "risk_level": "low"},
        {"category": "cash", "code": "money_market_fund", "name": "Money Market Fund", "is_liquid": True, "risk_level": "low"},
        # investment account
        {"category": "investment_account", "code": "equity_fund", "name": "Equity Fund", "is_liquid": True, "risk_level": "moderate"},
        {"category": "investment_account", "code": "bond_fund", "name": "Bond Fund", "is_liquid": True, "risk_level": "low"},
        # real estate
        {"category": "real_estate", "code": "residential_property", "name": "Residential Property", "is_liquid": False, "risk_level": "moderate"},
        {"category": "real_estate", "code": "rental_property", "name": "Rental Property", "is_liquid": False, "risk_level": "moderate"},
        # vehicle
        {"category": "vehicle", "code": "car", "name": "Car", "is_liquid": False, "risk_level": "moderate", "is_appreciating": False},
        # business
        {"category": "business", "code": "private_business", "name": "Private Business", "is_liquid": False, "risk_level": "high"},
        # collectibles
        {"category": "collectibles", "code": "art", "name": "Art", "is_liquid": False, "risk_level": "high"},
    ]
    for t in types:
        at = AssetType(
            category_id=code_map[t["category"]],
            code=t["code"],
            name=t["name"],
            is_liquid=bool(t.get("is_liquid", False)),
            risk_level=t.get("risk_level", "moderate"),
            is_appreciating=bool(t.get("is_appreciating", True)),
            minimum_investment=t.get("minimum_investment")
        )
        db.add(at)
    db.commit()


@router.get("/asset-categories")
def list_asset_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _seed_defaults(db)
    cats = db.query(AssetCategory).order_by(AssetCategory.name.asc()).all()
    return {
        "categories": [
            {"id": c.id, "code": c.code, "name": c.name, "kenya_specific": c.kenya_specific, "cfa_compliant": c.cfa_compliant}
            for c in cats
        ]
    }


@router.get("/asset-types/{category_id}")
def list_asset_types(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _seed_defaults(db)
    types = db.query(AssetType).filter(AssetType.category_id == category_id).order_by(AssetType.name.asc()).all()
    if types is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return {
        "types": [
            {
                "id": t.id,
                "code": t.code,
                "label": t.name,
                "is_liquid": t.is_liquid,
                "risk_level": t.risk_level,
                "is_appreciating": t.is_appreciating,
                "minimum_investment": float(t.minimum_investment) if t.minimum_investment is not None else None,
            }
            for t in types
        ]
    }

