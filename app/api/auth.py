from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db import get_db
from app.auth.auth import authenticate_user, create_access_token, get_current_user
from app import schemas
from datetime import timedelta

router = APIRouter(prefix='/api/auth', tags=['auth'])


@router.post('/token')
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect username or password')
    access_token_expires = timedelta(minutes=60*24)
    access_token = create_access_token(data={"sub": user.correo}, expires_delta=access_token_expires)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "rol": user.rol,
        "nombre": user.nombre,
        "correo": user.correo,
        "id_usuario": user.id_usuario,
    }


@router.get('/me', response_model=schemas.usuario.UsuarioOut)
def read_current_user(current_user=Depends(get_current_user)):
    return current_user
