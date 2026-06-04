from pydantic import BaseModel

class EspacioCreate(BaseModel):
    nombre: str
    ubicacion: str | None = None
    capacidad: int
    estado: str = 'activo'

class EspacioOut(BaseModel):
    id_espacio: int
    nombre: str
    ubicacion: str | None
    capacidad: int
    estado: str

    class Config:
        orm_mode = True
