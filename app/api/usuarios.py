from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas
from app.auth.auth import get_current_user, require_admin

router = APIRouter(prefix='/api/usuarios', tags=['usuarios'])


@router.post('/register', response_model=schemas.usuario.UsuarioOut)
def register_usuario(user: schemas.usuario.UsuarioRegister, db: Session = Depends(get_db)):
    payload = schemas.usuario.UsuarioCreate(
        nombre=user.nombre,
        correo=user.correo,
        password=user.password,
        rol='usuario',
    )
    return crud.usuarios.create_user(db, payload)


@router.post('/', response_model=schemas.usuario.UsuarioOut, dependencies=[Depends(require_admin)])
def create_usuario(user: schemas.usuario.UsuarioCreate, db: Session = Depends(get_db)):
    """Crea un usuario con rol personalizado. Solo administradores."""
    return crud.usuarios.create_user(db, user)


@router.get('/', response_model=list[schemas.usuario.UsuarioOut])
def list_usuarios(db: Session = Depends(get_db), current=Depends(require_admin)):
    return crud.usuarios.list_users(db)
