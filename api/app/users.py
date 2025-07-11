from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from .schemas import UserCreate, Token
from .security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post('/register', response_model=Token, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter_by(email=user_in.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=user_in.email, password_hash=hash_password(user_in.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id))
    return Token(access_token=token)

@router.post('/login', response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return Token(access_token=token)
