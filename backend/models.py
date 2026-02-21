from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID

class ReportCreate(BaseModel):
    titulo: str
    categoria_id: UUID
    description: Optional[str] = None
    estado_id: Optional[UUID] = None
    geom: Dict[str, Any]  # GeoJSON: {"type": "Point", "coordinates": [lon, lat]}
    foto_url: Optional[str] = None
    usuario_id: UUID

class ReportUpdate(BaseModel):
    titulo: Optional[str] = None
    categoria_id: Optional[UUID] = None
    description: Optional[str] = None
    estado_id: Optional[UUID] = None
    geom: Optional[Dict[str, Any]] = None
    foto_url: Optional[str] = None

class EspecieBase(BaseModel):
    nombre_comun: str
    nombre_cientifico: Optional[str] = None
    tipo: str # 'flora' o 'fauna'
    descripcion: Optional[str] = None
    estado_conservacion: Optional[str] = None

class RegistroBiologicoCreate(BaseModel):
    especie_id: Optional[UUID] = None
    geom: Dict[str, Any]
    abundancia: Optional[int] = 1
    observaciones: Optional[str] = None
    foto_url: Optional[str] = None
