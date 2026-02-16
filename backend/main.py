from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import Reportcreate, ReportUpdate
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "EcoReport GIS API"}

@app.get("/reportes")
def get_reportes():
    # Join with categorias and perfiles tables
    response = supabase.table("reportes").select("*, categorias(nombre), perfiles(nombre_completo)").execute()
    return response.data

@app.post("/reportes")
def create_reporte(report: Reportcreate):
    data = report.dict()
    # Convert lat/lon to PostGIS geometry if needed, or let Supabase handle it if passed as GeoJSON
    # Assuming frontend sends { "type": "Point", "coordinates": [lon, lat] }
    
    # If using supabase-py, we can pass the dict directly if column matches
    response = supabase.table("reportes").insert(data).execute()
    return response.data

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

