from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID

class ReportCreate(BaseModel):
    titulo: str
    categoria_id: UUID
    notas: Optional[str] = None
    estado: Optional[str] = "pendiente"
    geom: Dict[str, Any]  # GeoJSON: {"type": "Point", "coordinates": [lon, lat]}
    foto_url: Optional[str] = None
    usuario_id: UUID

class ReportUpdate(BaseModel):
    titulo: Optional[str]
    categoria_id: Optional[UUID]
    notas: Optional[str]
    estado: Optional[str]
    geom: Optional[Dict[str, Any]]
    foto_url: Optional[str]
