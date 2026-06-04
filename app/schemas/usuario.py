from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioCreate(BaseModel):
    nombre: str
    correo: EmailStr
    password: str
    rol: str


class UsuarioRegister(BaseModel):
    nombre: str
    correo: EmailStr
    password: str


class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    correo: EmailStr
    rol: str

    class Config:
        orm_mode = True
