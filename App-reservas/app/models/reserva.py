from sqlalchemy import Column, Integer, Date, Time, String, ForeignKey
from app.db import Base

class Reserva(Base):
    __tablename__ = 'reservas'

    id_reserva = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('usuarios.id_usuario'), nullable=False)
    id_espacio = Column(Integer, ForeignKey('espacios.id_espacio'), nullable=False)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    cantidad_asistentes = Column(Integer, nullable=False)
    estado = Column(String(20), default='esperando')
