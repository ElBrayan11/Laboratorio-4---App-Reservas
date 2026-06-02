from sqlalchemy.orm import Session
from app import models, schemas
from passlib.context import CryptContext
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, correo: str):
    return db.query(models.usuario.Usuario).filter(models.usuario.Usuario.correo == correo).first()

def create_user(db: Session, user: schemas.usuario.UsuarioCreate):
    if get_user_by_email(db, user.correo):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Correo ya registrado")
    hashed = pwd_context.hash(user.password)
    db_user = models.usuario.Usuario(nombre=user.nombre, correo=user.correo, password=hashed, rol=user.rol)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def list_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.usuario.Usuario).offset(skip).limit(limit).all()
