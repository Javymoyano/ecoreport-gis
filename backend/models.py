from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID

class ReportCreate(BaseModel):
    titulo: str
    categoria_id: UUID
    description: Optional[str] = None
    estado: Optional[str] = "pendiente"
    geom: Dict[str, Any]  # GeoJSON: {"type": "Point", "coordinates": [lon, lat]}
    foto_url: Optional[str] = None
    usuario_id: UUID

class ReportUpdate(BaseModel):
    titulo: Optional[str] = None
    categoria_id: Optional[UUID] = None
    description: Optional[str] = None
    estado: Optional[str] = None
    geom: Optional[Dict[str, Any]] = None
    foto_url: Optional[str] = None
