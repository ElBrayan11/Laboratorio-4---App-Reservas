"""Crea un usuario administrador inicial."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal
from app.crud.usuarios import create_user, get_user_by_email
from app.schemas.usuario import UsuarioCreate

ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@itm.edu.co')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')
ADMIN_NAME = os.getenv('ADMIN_NAME', 'Administrador')


def main():
    db = SessionLocal()
    try:
        if get_user_by_email(db, ADMIN_EMAIL):
            print(f'El usuario {ADMIN_EMAIL} ya existe.')
            return
        create_user(
            db,
            UsuarioCreate(
                nombre=ADMIN_NAME,
                correo=ADMIN_EMAIL,
                password=ADMIN_PASSWORD,
                rol='admin',
            ),
        )
        print(f'Admin creado: {ADMIN_EMAIL} / {ADMIN_PASSWORD}')
    finally:
        db.close()


if __name__ == '__main__':
    main()
