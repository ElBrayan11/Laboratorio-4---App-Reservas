from sqlalchemy.orm import Session
from app import models, schemas
from fastapi import HTTPException, status
from datetime import datetime, date, time, timedelta

def is_overlap(h1_start, h1_end, h2_start, h2_end):
    return not (h1_end <= h2_start or h2_end <= h1_start)

def check_business_rules(db: Session, user_id: int, reserva: schemas.reserva.ReservaCreate):
    # Rule F: hora inicio < hora fin
    if reserva.hora_inicio >= reserva.hora_fin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="hora_inicio debe ser anterior a hora_fin")

    # Rule D: minimo 24 horas anticipacion
    now = datetime.now()
    reserva_dt = datetime.combine(reserva.fecha, reserva.hora_inicio)
    if reserva_dt - now < timedelta(hours=24):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Las reservas deben hacerse con al menos 24 horas de anticipación")

    # Rule E: horario permitido
    weekday = reserva.fecha.weekday()  # Monday=0
    start_hour = reserva.hora_inicio.hour + reserva.hora_inicio.minute/60
    end_hour = reserva.hora_fin.hour + reserva.hora_fin.minute/60
    if weekday == 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se permiten reservas los domingos")
    if weekday == 5:
        # Saturday 8:00-12:00
        if start_hour < 8 or end_hour > 12:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Horario permitido los sábados: 08:00-12:00")
    else:
        # Mon-Fri 7:00-20:00
        if start_hour < 7 or end_hour > 20:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Horario permitido L-V: 07:00-20:00")

    # Rule G and H and C: espacio estado, capacidad, and no overlap
    espacio = db.query(models.espacio.Espacio).filter(models.espacio.Espacio.id_espacio == reserva.id_espacio).first()
    if not espacio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Espacio no encontrado")
    if espacio.estado in ('inactivo', 'en mantenimiento', 'no disponible'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El espacio no está disponible para reservas")
    if reserva.cantidad_asistentes > espacio.capacidad:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cantidad de asistentes supera la capacidad del espacio")

    # Check overlaps with existing reservas (esperando/aprobada)
    existing = db.query(models.reserva.Reserva).filter(
        models.reserva.Reserva.id_espacio == reserva.id_espacio,
        models.reserva.Reserva.fecha == reserva.fecha,
        models.reserva.Reserva.estado.in_(['esperando', 'aprobada'])
    ).all()
    for ex in existing:
        if is_overlap(reserva.hora_inicio, reserva.hora_fin, ex.hora_inicio, ex.hora_fin):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Conflicto de horario con otra reserva")

    return True

def create_reserva(db: Session, user_id: int, reserva: schemas.reserva.ReservaCreate):
    check_business_rules(db, user_id, reserva)
    db_res = models.reserva.Reserva(id_usuario=user_id, id_espacio=reserva.id_espacio, fecha=reserva.fecha, hora_inicio=reserva.hora_inicio, hora_fin=reserva.hora_fin, cantidad_asistentes=reserva.cantidad_asistentes, estado='esperando')
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return db_res

def list_reservas_by_user(db: Session, user_id: int):
    return db.query(models.reserva.Reserva).filter(models.reserva.Reserva.id_usuario == user_id).all()

def list_all_reservas(db: Session):
    return db.query(models.reserva.Reserva).all()

def get_reserva(db: Session, id_reserva: int):
    return db.query(models.reserva.Reserva).filter(models.reserva.Reserva.id_reserva == id_reserva).first()

def update_reserva_estado(db: Session, id_reserva: int, estado: str):
    res = get_reserva(db, id_reserva)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
    if estado not in ('esperando', 'aprobada', 'rechazada'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado inválido")
    res.estado = estado
    db.add(res)
    db.commit()
    db.refresh(res)
    return res

def cancel_reserva(db: Session, id_reserva: int, user_id: int, is_admin: bool):
    res = get_reserva(db, id_reserva)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
    if res.id_usuario != user_id and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado para cancelar esta reserva")
    res.estado = 'rechazada'
    db.add(res)
    db.commit()
    db.refresh(res)
    return res
