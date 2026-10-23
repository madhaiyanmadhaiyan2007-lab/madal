"""
MockMate AI - Authentication Endpoints
Provides signup, login, and protected /me profile endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=schemas.TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account"
)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Creates a new user account:
    - Checks if email is already registered
    - Hashes password using bcrypt
    - Persists user to database
    - Returns JWT access token and user profile
    """
    normalized_email = user_data.email.strip().lower()

    # Check if email is already in use
    existing_user = db.query(models.User).filter(models.User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Hash password and create User record
    hashed_pwd = hash_password(user_data.password)
    new_user = models.User(
        name=user_data.name.strip(),
        email=normalized_email,
        hashed_password=hashed_pwd,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT token with subject = user.id
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.post(
    "/login",
    response_model=schemas.TokenResponse,
    summary="Log in with email and password"
)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates an existing user:
    - Finds user by email
    - Verifies bcrypt hashed password
    - Returns JWT access token and user profile
    """
    normalized_email = credentials.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == normalized_email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get(
    "/me",
    response_model=schemas.UserResponse,
    summary="Get current authenticated user profile"
)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Protected endpoint:
    Returns the profile information of the currently authenticated user.
    Requires Bearer token in Authorization header.
    """
    return current_user
