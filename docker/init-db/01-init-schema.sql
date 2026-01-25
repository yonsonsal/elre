-- Crear extensión PostGIS si no existe
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Crear schema para datos de ejemplo
CREATE SCHEMA IF NOT EXISTS example_data;

-- ============================================
-- IMPORTANTE: Proyección EPSG:32721 (UTM 21S)
-- ============================================
-- Este esquema utiliza la proyección UTM zona 21 Sur (EPSG:32721)
-- que es la proyección estándar para Montevideo, Uruguay.
-- Las coordenadas están en metros (X, Y) no en grados (lon, lat).
-- Rango aproximado para Montevideo:
--   X: 560000 - 590000
--   Y: 6130000 - 6160000

-- Tabla de ejemplo: puntos de interés
CREATE TABLE IF NOT EXISTS example_data.points_of_interest (
    gid SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    the_geom GEOMETRY(Point, 32721)
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
    the_geom GEOMETRY(LineString, 32721)
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
    the_geom GEOMETRY(Polygon, 32721)
);

CREATE INDEX IF NOT EXISTS idx_zones_geom ON example_data.zones USING GIST (the_geom);

-- Insertar datos de ejemplo (coordenadas UTM 21S - Montevideo)
-- Referencia: Centro de Montevideo aprox. X=567000, Y=6140000

INSERT INTO example_data.points_of_interest (name, description, category, created_by, the_geom) VALUES
    ('Plaza Independencia', 'Plaza principal de Montevideo', 'Plaza', 'admin_gis', ST_SetSRID(ST_MakePoint(567000, 6140000), 32721)),
    ('Museo Torres García', 'Museo de arte contemporáneo', 'Museo', 'admin_gis', ST_SetSRID(ST_MakePoint(566800, 6140200), 32721)),
    ('Parque Rodó', 'Gran parque urbano', 'Parque', 'editor_gis', ST_SetSRID(ST_MakePoint(566500, 6138500), 32721)),
    ('Hospital de Clínicas', 'Hospital público universitario', 'Salud', 'admin_gis', ST_SetSRID(ST_MakePoint(565800, 6139200), 32721)),
    ('Facultad de Ingeniería', 'Campus universitario', 'Educación', 'editor_gis', ST_SetSRID(ST_MakePoint(566200, 6138800), 32721));

INSERT INTO example_data.streets (name, street_type, length_m, created_by, the_geom) VALUES
    ('Av. 18 de Julio', 'Avenida', 2500.50, 'admin_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(567000, 6140000), ST_MakePoint(564500, 6140000)), 32721)),
    ('Bulevar Artigas', 'Bulevar', 3200.30, 'editor_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(566000, 6141000), ST_MakePoint(566000, 6137800)), 32721)),
    ('Rambla Sur', 'Rambla', 5000.00, 'admin_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(567500, 6139000), ST_MakePoint(565000, 6138000)), 32721));

INSERT INTO example_data.zones (zone_name, zone_type, area_m2, population, created_by, the_geom) VALUES
    ('Centro', 'Barrio', 2500000.00, 50000, 'admin_gis',
     ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
         ST_MakePoint(566500, 6139500),
         ST_MakePoint(567500, 6139500),
         ST_MakePoint(567500, 6140500),
         ST_MakePoint(566500, 6140500),
         ST_MakePoint(566500, 6139500)
     ])), 32721)),
    ('Cordón', 'Barrio', 3000000.00, 75000, 'admin_gis',
     ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
         ST_MakePoint(565500, 6139500),
         ST_MakePoint(566500, 6139500),
         ST_MakePoint(566500, 6140500),
         ST_MakePoint(565500, 6140500),
         ST_MakePoint(565500, 6139500)
     ])), 32721));

-- Crear usuario para GeoServer
CREATE USER geoserver_user WITH PASSWORD 'geoserver_pass';
GRANT USAGE ON SCHEMA example_data TO geoserver_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA example_data TO geoserver_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA example_data TO geoserver_user;

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada correctamente con datos de ejemplo en EPSG:32721';
END $$;
