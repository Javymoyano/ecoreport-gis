from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import ReportCreate, ReportUpdate
import json
import time

app = FastAPI()

# Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(f"Method: {request.method} Path: {request.url.path} Status: {response.status_code} Duration: {duration:.2f}s")
    return response

# Simplified CORS for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "EcoReport GIS API - v2.2-RLS-TEST"}

@app.get("/reportes")
def get_reportes():
    # Join with categorias and perfiles tables
    response = supabase.table("reportes").select("*, categorias(nombre), perfiles(nombre_completo)").execute()
    return response.data

@app.get("/categorias")
def get_categorias():
    response = supabase.table("categorias").select("*").execute()
    return response.data

@app.post("/reportes")
def create_reporte(report: ReportCreate):
    try:
        # Convert Pydantic model to dict, ensuring UUIDs are handled
        # We use json.loads(report.json()) as a trick to let Pydantic handle the UUID -> string conversion
        data = json.loads(report.json())
        
        print(f"DEBUG: Attempting to insert report: {data.get('titulo')}")
        
        # Insert using supabase
        response = supabase.table("reportes").insert(data).execute()
        
        # Check if insertion was successful
        if hasattr(response, 'data') and response.data:
            print(f"DEBUG: Success! Inserted ID: {response.data[0].get('id')}")
            return response.data
        else:
            error_msg = getattr(response, 'error', 'Unknown error during insertion')
            print(f"DEBUG: Supabase returned no data. Error: {error_msg}")
            return {"error": str(error_msg)}, 500
            
    except Exception as e:
        print(f"DEBUG: Exception in create_reporte: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}, 500


@app.put("/reportes/{report_id}")
def update_reporte(report_id: str, report: ReportUpdate):
    data = report.dict(exclude_unset=True)
    response = supabase.table("reportes").update(data).eq("id", report_id).execute()
    return response.data

@app.delete("/reportes/{report_id}")
def delete_reporte(report_id: str):
    response = supabase.table("reportes").delete().eq("id", report_id).execute()
    return response.data


@app.get("/reportes/{report_id}")
def get_reporte(report_id: str):
    response = supabase.table("reportes").select("*").eq("id", report_id).execute()
    return response.data

