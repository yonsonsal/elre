-- Crear extensión PostGIS si no existe
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Crear schema para datos de ejemplo
CREATE SCHEMA IF NOT EXISTS example_data;

-- Tabla de ejemplo: puntos de interés
CREATE TABLE IF NOT EXISTS example_data.points_of_interest (
    gid SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    the_geom GEOMETRY(Point, 4326)
);

-- Índice espacial
CREATE INDEX IF NOT EXISTS idx_poi_geom ON example_data.points_of_interest USING GIST (the_geom);

-- Tabla de ejemplo: líneas (calles, rutas)
CREATE TABLE IF NOT EXISTS example_data.streets (
    gid SERIAL PRIMARY KEY,
    name VARCHAR(255),
    street_type VARCHAR(50),
    length_m NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    the_geom GEOMETRY(LineString, 4326)
);

CREATE INDEX IF NOT EXISTS idx_streets_geom ON example_data.streets USING GIST (the_geom);

-- Tabla de ejemplo: polígonos (zonas, distritos)
CREATE TABLE IF NOT EXISTS example_data.zones (
    gid SERIAL PRIMARY KEY,
    zone_name VARCHAR(255),
    zone_type VARCHAR(100),
    area_m2 NUMERIC(15, 2),
    population INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    the_geom GEOMETRY(Polygon, 4326)
);

CREATE INDEX IF NOT EXISTS idx_zones_geom ON example_data.zones USING GIST (the_geom);

-- Insertar datos de ejemplo
INSERT INTO example_data.points_of_interest (name, description, category, created_by, the_geom) VALUES
    ('Plaza Central', 'Plaza principal de la ciudad', 'Plaza', 'admin_gis', ST_SetSRID(ST_MakePoint(-56.1645, -34.9011), 4326)),
    ('Museo de Arte', 'Museo de arte contemporáneo', 'Museo', 'admin_gis', ST_SetSRID(ST_MakePoint(-56.1755, -34.9055), 4326)),
    ('Parque del Este', 'Gran parque urbano', 'Parque', 'editor_gis', ST_SetSRID(ST_MakePoint(-56.1545, -34.8980), 4326)),
    ('Hospital General', 'Hospital público', 'Salud', 'admin_gis', ST_SetSRID(ST_MakePoint(-56.1720, -34.9088), 4326)),
    ('Universidad Nacional', 'Campus principal', 'Educación', 'editor_gis', ST_SetSRID(ST_MakePoint(-56.1680, -34.9000), 4326));

INSERT INTO example_data.streets (name, street_type, length_m, created_by, the_geom) VALUES
    ('Av. Principal', 'Avenida', 2500.50, 'admin_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(-56.1700, -34.9000), ST_MakePoint(-56.1500, -34.9000)), 4326)),
    ('Calle del Comercio', 'Calle', 1200.30, 'editor_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(-56.1650, -34.9020), ST_MakePoint(-56.1650, -34.8950)), 4326)),
    ('Ruta Nacional 1', 'Ruta', 5000.00, 'admin_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(-56.1800, -34.9100), ST_MakePoint(-56.1400, -34.8900)), 4326));

INSERT INTO example_data.zones (zone_name, zone_type, area_m2, population, created_by, the_geom) VALUES
    ('Distrito Centro', 'Distrito', 5000000.00, 50000, 'admin_gis',
     ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
         ST_MakePoint(-56.1700, -34.9000),
         ST_MakePoint(-56.1600, -34.9000),
         ST_MakePoint(-56.1600, -34.9100),
         ST_MakePoint(-56.1700, -34.9100),
         ST_MakePoint(-56.1700, -34.9000)
     ])), 4326)),
    ('Distrito Norte', 'Distrito', 8000000.00, 75000, 'admin_gis',
     ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
         ST_MakePoint(-56.1700, -34.8900),
         ST_MakePoint(-56.1600, -34.8900),
         ST_MakePoint(-56.1600, -34.9000),
         ST_MakePoint(-56.1700, -34.9000),
         ST_MakePoint(-56.1700, -34.8900)
     ])), 4326));

-- Crear usuario para GeoServer
CREATE USER geoserver_user WITH PASSWORD 'geoserver_pass';
GRANT USAGE ON SCHEMA example_data TO geoserver_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA example_data TO geoserver_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA example_data TO geoserver_user;

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada correctamente con datos de ejemplo';
END $$;
