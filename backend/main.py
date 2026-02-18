from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import ReportCreate, ReportUpdate
import json
import time

app = FastAPI()

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
    response = supabase.table("reportes").select("*, categorias(nombre), perfiles(nombre_completo)").execute()
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
