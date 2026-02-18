from database import supabase
import uuid

# User ID from previous SQL query
USER_ID = "d794da38-a394-4036-8495-cbaf3d594c97"

def get_category_id(name):
    try:
        resp = supabase.table("categorias").select("id").eq("nombre", name).execute()
        if resp.data and len(resp.data) > 0:
            return resp.data[0]['id']
        else:
            print(f"Warning: Category '{name}' not found.")
            return None
    except Exception as e:
        print(f"Error fetching category '{name}': {e}")
        return None

def populate():
    print("Starting population script...")
    
    # 1. Fetch category IDs
    cat_incendio = get_category_id("Incendio")
    cat_basura = get_category_id("Basura")
    cat_trampa = get_category_id("Trampa")
    cat_tala = get_category_id("Tala de árboles")
    cat_evento = get_category_id("Evento")

    data = [
        {
            "titulo": "Fuego en ladera este",
            "categoria_id": cat_incendio,
            "description": "Pequeño foco visible cerca del arroyo.",
            "estado": "pendiente",
            "geom": {"type": "Point", "coordinates": [-64.442, -31.675]},
            "usuario_id": USER_ID,
            "foto_url": "https://placehold.co/600x400?text=Fuego"
        },
        {
            "titulo": "Trampa de lazo",
            "categoria_id": cat_trampa,
            "description": "Encontrada en sendero bajo.",
            "estado": "pendiente",
            "geom": {"type": "Point", "coordinates": [-64.445, -31.680]},
            "usuario_id": USER_ID,
            "foto_url": "https://placehold.co/600x400?text=Trampa"
        },
        {
            "titulo": "Evento de limpieza",
            "categoria_id": cat_evento,
            "description": "Voluntarios trabajando en el mirador.",
            "estado": "aprobado",
            "geom": {"type": "Point", "coordinates": [-64.435, -31.670]},
            "usuario_id": USER_ID,
            "foto_url": "https://placehold.co/600x400?text=Evento"
        },
        {
            "titulo": "Tala ilegal observada",
            "categoria_id": cat_tala,
            "description": "Posible extracción de madera nativa.",
            "estado": "pendiente",
            "geom": {"type": "Point", "coordinates": [-64.440, -31.672]},
            "usuario_id": USER_ID
        }
    ]

    for item in data:
        if not item.get("categoria_id"):
            print(f"Skipping '{item['titulo']}' because category ID is missing.")
            continue
            
        print(f"Attempting to insert: {item['titulo']}")
        try:
            response = supabase.table("reportes").insert(item).execute()
            print(f"Success: Inserted '{item['titulo']}'")
        except Exception as e:
            print(f"❌ Error inserting '{item['titulo']}':")
            print(e)

if __name__ == "__main__":
    populate()
