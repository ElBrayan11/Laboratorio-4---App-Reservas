from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app import crud, schemas
from app.auth.auth import get_current_user, require_admin

router = APIRouter(prefix='/api/reservas', tags=['reservas'])


class EstadoUpdate(BaseModel):
    estado: str


@router.post('/', response_model=schemas.reserva.ReservaOut)
def create_reserva(reserva: schemas.reserva.ReservaCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.reservas.create_reserva(db, current_user.id_usuario, reserva)


@router.get('/me', response_model=list[schemas.reserva.ReservaOut])
def my_reservas(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.reservas.list_reservas_by_user(db, current_user.id_usuario)


@router.get('/', response_model=list[schemas.reserva.ReservaOut], dependencies=[Depends(require_admin)])
def all_reservas(db: Session = Depends(get_db)):
    return crud.reservas.list_all_reservas(db)


@router.put('/{id_reserva}/estado', response_model=schemas.reserva.ReservaOut, dependencies=[Depends(require_admin)])
def change_estado(id_reserva: int, payload: EstadoUpdate, db: Session = Depends(get_db)):
    return crud.reservas.update_reserva_estado(db, id_reserva, payload.estado)


@router.post('/{id_reserva}/cancel', response_model=schemas.reserva.ReservaOut)
def cancel_reserva(id_reserva: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    is_admin = current_user.rol == 'admin'
    return crud.reservas.cancel_reserva(db, id_reserva, current_user.id_usuario, is_admin)
