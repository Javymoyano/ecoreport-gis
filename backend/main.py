from fastapi import FastAPI, Request, File, UploadFile
from fastapi.staticfiles import StaticFiles
import os
import uuid
import shutil
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from database import supabase
from models import ReportCreate, ReportUpdate, EspecieBase, RegistroBiologicoCreate
import json
import time

app = FastAPI()

# 0. Setup Storage
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(f"Method: {request.method} Path: {request.url.path} Status: {response.status_code} Duration: {duration:.2f}s")
    return response

@app.get("/")
def read_root():
    return {"message": "EcoReport GIS API - Coordenadas Fijas Test"}

@app.get("/reportes")
def get_reportes():
    response = supabase.table("reportes").select("*, categorias(nombre), estados(nombre), perfiles(nombre_completo)").execute()
    return response.data

@app.get("/estados")
def get_estados():
    response = supabase.table("estados").select("*").execute()
    return response.data

@app.get("/categorias")
def get_categorias():
    response = supabase.table("categorias").select("*").execute()
    return response.data

@app.post("/reportes")
def create_reporte(report: ReportCreate):
    try:
        data = json.loads(report.json())
        response = supabase.table("reportes").insert(data).execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}, 500

@app.put("/reportes/{report_id}")
def update_reporte(report_id: str, report: ReportUpdate):
    try:
        data = json.loads(report.json(exclude_unset=True))
        print(f"[DEBUG] Intentando actualizar reporte: {report_id}")
        print(f"[DEBUG] Datos: {data}")
        
        # Ejecutamos la actualización
        response = supabase.table("reportes").update(data).eq("id", report_id).execute()
        
        print(f"[DEBUG] Respuesta Supabase: {response}")
        
        if not response.data or len(response.data) == 0:
            print("[WARNING] No se actualizo ninguna fila. Posible RLS o ID inexistente.")
            return {"error": "No rows updated", "details": "The report might not exist or RLS policies are blocking the update"}, 400
            
        print(f"[SUCCESS] Reporte actualizado: {response.data[0].get('id')}")
        return response.data
    except Exception as e:
        print(f"[ERROR] update_reporte: {str(e)}")
        return {"error": str(e)}, 500

@app.delete("/reportes/{report_id}")
def delete_reporte(report_id: str):
    response = supabase.table("reportes").delete().eq("id", report_id).execute()
    return response.data

@app.get("/reportes/{report_id}")
def get_reporte(report_id: str):
    response = supabase.table("reportes").select("*").eq("id", report_id).execute()
    return response.data

# --- Rutas de Inventario Biológico ---

@app.get("/especies")
def get_especies(tipo: Optional[str] = None):
    query = supabase.table("catalogo_especies").select("*")
    if tipo:
        query = query.eq("tipo", tipo)
    response = query.execute()
    return response.data

@app.post("/especies")
def create_especie(especie: EspecieBase):
    try:
        data = json.loads(especie.json())
        response = supabase.table("catalogo_especies").insert(data).execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/registros-biologicos")
def get_registros(tipo: Optional[str] = None):
    # Traemos el registro junto con el nombre de la especie
    query = supabase.table("registros_biologicos").select("*, catalogo_especies(nombre_comun, tipo)")
    response = query.execute()
    
    # Si se pide un tipo específico, filtramos en Python o podríamos usar rpc/filtros complejos
    if tipo:
        return [r for r in response.data if r.get('catalogo_especies', {}).get('tipo') == tipo]
    
    return response.data

@app.post("/registros-biologicos")
def create_registro(registro: RegistroBiologicoCreate):
    try:
        data = json.loads(registro.json())
        response = supabase.table("registros_biologicos").insert(data).execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}, 500
@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    try:
        file_extension = os.path.splitext(file.filename)[1]
        # Fallback si no tiene extensión
        if not file_extension:
            content_type = file.content_type
            if content_type == "image/png":
                file_extension = ".png"
            elif content_type == "image/gif":
                file_extension = ".gif"
            else:
                file_extension = ".jpg"
                
        new_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Leemos el archivo en memoria para subirlo
        file_content = await file.read()
        
        # Nombre del bucket público en Supabase
        BUCKET_NAME = "fotos"
        
        try:
            # Subir archivo a Supabase Storage
            content_type = file.content_type or "image/jpeg"
            supabase.storage.from_(BUCKET_NAME).upload(
                path=new_filename,
                file=file_content,
                file_options={"content-type": content_type}
            )
            
            # Obtener la URL pública del archivo subido
            file_url = supabase.storage.from_(BUCKET_NAME).get_public_url(new_filename)
            print(f"[SUCCESS] Archivo subido a Supabase Storage bucket '{BUCKET_NAME}': {file_url}")
            return {"url": file_url}
            
        except Exception as storage_err:
            print(f"[WARNING] Fallo al subir a Supabase Storage: {str(storage_err)}")
            print("Ejecutando fallback: guardando archivo localmente en servidor.")
            
            # Guardamos localmente si el bucket no existe o falla
            file_path = os.path.join(UPLOAD_DIR, new_filename)
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
                
            # Obtener el protocolo y host reales considerando proxies (Render, Ngrok, etc.)
            proto = request.headers.get("x-forwarded-proto", request.url.scheme)
            host = request.headers.get("x-forwarded-host", request.url.netloc)
            if not host:
                host = request.headers.get("host", request.url.netloc)
                
            file_url = f"{proto}://{host}/uploads/{new_filename}"
            return {
                "url": file_url,
                "warning": f"Guardado localmente. Asegúrate de crear un bucket público llamado '{BUCKET_NAME}' en Supabase Storage. Error: {str(storage_err)}"
            }
            
    except Exception as e:
        print(f"[ERROR] upload_file: {str(e)}")
        return {"error": str(e)}, 500
