from sqlalchemy.orm import Session
from app import models, schemas
from fastapi import HTTPException, status

def create_espacio(db: Session, espacio: schemas.espacio.EspacioCreate):
    db_esp = models.espacio.Espacio(nombre=espacio.nombre, ubicacion=espacio.ubicacion, capacidad=espacio.capacidad, estado=espacio.estado)
    db.add(db_esp)
    db.commit()
    db.refresh(db_esp)
    return db_esp

def list_espacios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.espacio.Espacio).offset(skip).limit(limit).all()

def get_espacio(db: Session, id_espacio: int):
    return db.query(models.espacio.Espacio).filter(models.espacio.Espacio.id_espacio == id_espacio).first()

def update_espacio(db: Session, id_espacio: int, data: dict):
    esp = get_espacio(db, id_espacio)
    if not esp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Espacio no encontrado")
    for k, v in data.items():
        setattr(esp, k, v)
    db.add(esp)
    db.commit()
    db.refresh(esp)
    return esp
