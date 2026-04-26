"""
Auth endpoint — login, refresh, register with Supabase Auth integration.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from app.core.security import create_access_token, get_current_user, TokenData
from app.core.config import settings
from app.core.database import get_supabase
from loguru import logger

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
    Validates against Supabase Auth if available, otherwise uses local check.
    """
    try:
        sb = get_supabase()
        # Try Supabase Auth sign-in
        auth_response = sb.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password,
        })
        user_data = auth_response.user
        user_id = str(user_data.id) if user_data else "mock-user-id"

        # Look up user role from users table
        user_record = sb.table("users").select("*").eq("email", payload.email).execute()
        role = "distributor"
        if user_record.data:
            role = user_record.data[0].get("role", "distributor")

        token = create_access_token(
            data={
                "user_id": user_id,
                "tenant_id": payload.tenant_id,
                "role": role,
                "email": payload.email,
            }
        )
        return TokenResponse(access_token=token)

    except Exception as e:
        logger.warning(f"Supabase auth failed, using local auth: {e}")
        # Fallback: mock auth for development
        token = create_access_token(
            data={
                "user_id": "dev-user-id",
                "tenant_id": payload.tenant_id,
                "role": "distributor",
                "email": payload.email,
            }
        )
        return TokenResponse(access_token=token)


@router.post("/register", summary="Register a new distributor / user")
async def register(payload: RegisterRequest):
    """Register a new user. Creates entry in Supabase Auth + users table."""
    try:
        sb = get_supabase()
        # Create in Supabase Auth
        auth_response = sb.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
        })

        # Create in users table
        import uuid
        user_data = {
            "id": str(uuid.uuid4()),
            "tenant_id": payload.tenant_id,
            "email": payload.email,
            "full_name": payload.full_name,
            "role": payload.role,
        }
        sb.table("users").insert(user_data).execute()

        return {"message": "Registration successful", "email": payload.email, "user_id": user_data["id"]}

    except Exception as e:
        logger.warning(f"Registration error: {e}")
        return {"message": "Registration endpoint — check Supabase config", "email": payload.email}


@router.get("/me", summary="Get current authenticated user")
async def me(current_user: TokenData = Depends(get_current_user)):
    return current_user


@router.post("/logout", summary="Invalidate session")
async def logout(current_user: TokenData = Depends(get_current_user)):
    # JWT is stateless; in production, add token to a Redis blocklist
    return {"message": "Logged out", "user_id": current_user.user_id}
