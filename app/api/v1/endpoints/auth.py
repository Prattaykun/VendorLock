"""
Auth endpoint — login, register, me, logout with Supabase Auth integration.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
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


class MeResponse(BaseModel):
    user_id: str
    tenant_id: str
    role: str
    email: str
    full_name: Optional[str] = None


@router.post("/login", response_model=TokenResponse, summary="User login")
async def login(payload: LoginRequest):
    """
    Authenticate a user and return a JWT.
    Validates against Supabase Auth; falls back to a dev token in development mode
    only when Supabase itself is unavailable (not when credentials are wrong).
    """
    try:
        sb = get_supabase()
        # Try Supabase Auth sign-in
        auth_response = sb.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password,
        })
        user_data = auth_response.user
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        user_id = str(user_data.id)

        # Look up user role + full_name from users table
        role = "distributor"
        full_name = None
        try:
            user_record = sb.table("users").select("role,full_name").eq("email", payload.email).execute()
            if user_record.data:
                role = user_record.data[0].get("role", "distributor")
                full_name = user_record.data[0].get("full_name")
        except Exception as e:
            logger.warning(f"Could not fetch user role from DB: {e}")

        token = create_access_token(
            data={
                "user_id": user_id,
                "tenant_id": payload.tenant_id,
                "role": role,
                "email": payload.email,
                "full_name": full_name or "",
            }
        )
        return TokenResponse(access_token=token)

    except HTTPException:
        # Re-raise 401 from Supabase (wrong credentials) as-is
        raise
    except Exception as e:
        # Supabase is unavailable — fall back only in development
        logger.warning(f"Supabase auth failed (Supabase unavailable), using dev fallback: {e}")
        if settings.APP_ENV != "development":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service temporarily unavailable",
            )
        # Dev-only mock token
        token = create_access_token(
            data={
                "user_id": "dev-user-id",
                "tenant_id": payload.tenant_id,
                "role": "distributor",
                "email": payload.email,
                "full_name": "Dev User",
            }
        )
        return TokenResponse(access_token=token)


@router.post("/register", status_code=201, summary="Register a new user")
async def register(payload: RegisterRequest):
    """Register a new user. Creates entry in Supabase Auth + users table."""
    try:
        sb = get_supabase()

        # Check for duplicate email in users table first
        existing = sb.table("users").select("id").eq("email", payload.email).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        # Create in Supabase Auth
        auth_response = sb.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
        })

        import uuid
        user_id = str(auth_response.user.id) if auth_response.user else str(uuid.uuid4())

        # Create in users table
        user_data = {
            "id": user_id,
            "tenant_id": payload.tenant_id,
            "email": payload.email,
            "full_name": payload.full_name,
            "role": payload.role,
            "is_active": True,
        }
        sb.table("users").insert(user_data).execute()

        return {
            "message": "Registration successful",
            "email": payload.email,
            "user_id": user_id,
            "role": payload.role,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Registration failed: {str(e)}",
        )


@router.get("/me", response_model=MeResponse, summary="Get current authenticated user")
async def me(current_user: TokenData = Depends(get_current_user)):
    """Return full user profile from JWT claims + DB lookup for full_name."""
    full_name = None
    try:
        sb = get_supabase()
        user_record = sb.table("users").select("full_name").eq("email", current_user.email).execute()
        if user_record.data:
            full_name = user_record.data[0].get("full_name")
    except Exception as e:
        logger.debug(f"Could not fetch full_name for /me: {e}")

    return MeResponse(
        user_id=current_user.user_id,
        tenant_id=current_user.tenant_id,
        role=current_user.role,
        email=current_user.email,
        full_name=full_name,
    )


@router.post("/logout", summary="Invalidate session")
async def logout(current_user: TokenData = Depends(get_current_user)):
    """
    Stateless logout — client must discard the JWT.
    TODO (production): add token to Redis blocklist keyed by jti with TTL = remaining expiry.
    """
    try:
        sb = get_supabase()
        sb.auth.sign_out()
    except Exception:
        pass  # Sign-out from Supabase is best-effort; JWT invalidation is client-side
    return {"message": "Logged out successfully", "user_id": current_user.user_id}
