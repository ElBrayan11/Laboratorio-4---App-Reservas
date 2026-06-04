from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas
from app.auth.auth import require_admin

router = APIRouter(prefix='/api/espacios', tags=['espacios'])


@router.post('/', response_model=schemas.espacio.EspacioOut, dependencies=[Depends(require_admin)])
def create_espacio(espacio: schemas.espacio.EspacioCreate, db: Session = Depends(get_db)):
    return crud.espacios.create_espacio(db, espacio)


@router.get('/', response_model=list[schemas.espacio.EspacioOut])
def list_espacios(db: Session = Depends(get_db)):
    return crud.espacios.list_espacios(db)


@router.get('/{id_espacio}', response_model=schemas.espacio.EspacioOut)
def get_espacio(id_espacio: int, db: Session = Depends(get_db)):
    esp = crud.espacios.get_espacio(db, id_espacio)
    return esp


@router.put('/{id_espacio}', response_model=schemas.espacio.EspacioOut, dependencies=[Depends(require_admin)])
def update_espacio(id_espacio: int, data: schemas.espacio.EspacioCreate, db: Session = Depends(get_db)):
    return crud.espacios.update_espacio(db, id_espacio, data.dict())
