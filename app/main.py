from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base, SessionLocal
from app.api import auth, usuarios, espacios, reservas
import os

def create_tables():
    Base.metadata.create_all(bind=engine)

def seed_admin():
    from app.crud.usuarios import create_user, get_user_by_email
    from app.schemas.usuario import UsuarioCreate
    db = SessionLocal()
    try:
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@itm.edu.co')
        if not get_user_by_email(db, admin_email):
            create_user(db, UsuarioCreate(
                nombre=os.getenv('ADMIN_NAME', 'Administrador'),
                correo=admin_email,
                password=os.getenv('ADMIN_PASSWORD', 'admin123'),
                rol='admin',
            ))
    finally:
        db.close()

CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',') if os.getenv('CORS_ORIGINS') else [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:80',
    'http://localhost',
]

app = FastAPI(title='App Reservas - Backend', docs_url='/docs', redoc_url='/redoc')

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(espacios.router)
app.include_router(reservas.router)


@app.on_event('startup')
def on_startup():
    create_tables()
    seed_admin()
