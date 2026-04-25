"""
Auth endpoint — login, refresh, register.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from app.core.security import create_access_token, get_current_user, TokenData
from app.core.config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_id: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = settings.JWT_EXPIRE_MINUTES * 60


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    tenant_id: str
    role: str = "distributor"


@router.post("/login", response_model=TokenResponse, summary="User login")
async def login(payload: LoginRequest):
    """
    Authenticate a user (distributor, salesman, retailer) and return a JWT.
    In production this validates against Supabase Auth / PostgreSQL users table.
    """
    # TODO: validate credentials against Supabase Auth / DB
    # Mock response for scaffold
    token = create_access_token(
        data={
            "user_id": "mock-user-id",
            "tenant_id": payload.tenant_id,
            "role": "distributor",
            "email": payload.email,
        }
    )
    return TokenResponse(access_token=token)


@router.post("/register", summary="Register a new distributor / user")
async def register(payload: RegisterRequest):
    """
    Register a new user. Creates entry in Supabase Auth + users table.
    """
    # TODO: integrate with Supabase Auth signUp
    return {"message": "Registration endpoint placeholder", "email": payload.email}


@router.get("/me", summary="Get current authenticated user")
async def me(current_user: TokenData = Depends(get_current_user)):
    return current_user


@router.post("/logout", summary="Invalidate session")
async def logout(current_user: TokenData = Depends(get_current_user)):
    # JWT is stateless; in production, add token to a Redis blocklist
    return {"message": "Logged out", "user_id": current_user.user_id}
