from sqlalchemy import Column, Integer, String
from app.db import Base

class Espacio(Base):
    __tablename__ = 'espacios'

    id_espacio = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ubicacion = Column(String(100))
    capacidad = Column(Integer, nullable=False)
    estado = Column(String(30))
