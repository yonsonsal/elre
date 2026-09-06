-- Crear schema para datos de ejemplo en EPSG:4326 (coordenadas geograficas)
CREATE SCHEMA IF NOT EXISTS example_data_4326;

-- ============================================
-- IMPORTANTE: Proyeccion EPSG:4326 (WGS84, grados)
-- ============================================
-- Este esquema es el segundo dataset de la prueba de concepto de soporte multi-CRS:
-- convive con example_data (EPSG:32721) en la misma instalacion, sin que ninguno de los
-- dos sea "el" CRS de la instalacion (ver plan de soporte multi-CRS por capa).
-- Las coordenadas estan en grados (lon, lat), no en metros.
-- Zona de referencia: Salto Grande (frontera Uruguay/Argentina), caso real del cliente
-- que motivo este soporte.
--   lon: -57.95 a -57.90
--   lat: -31.30 a -31.27

-- Tabla de ejemplo: puntos de interes
CREATE TABLE IF NOT EXISTS example_data_4326.points_of_interest (
    gid SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    the_geom GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_poi_4326_geom ON example_data_4326.points_of_interest USING GIST (the_geom);

-- Tabla de ejemplo: lineas (calles, rutas)
CREATE TABLE IF NOT EXISTS example_data_4326.streets (
    gid SERIAL PRIMARY KEY,
    name VARCHAR(255),
    street_type VARCHAR(50),
    length_m NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    the_geom GEOMETRY(LineString, 4326)
);

CREATE INDEX IF NOT EXISTS idx_streets_4326_geom ON example_data_4326.streets USING GIST (the_geom);

-- Tabla de ejemplo: poligonos (zonas, distritos)
CREATE TABLE IF NOT EXISTS example_data_4326.zones (
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

CREATE INDEX IF NOT EXISTS idx_zones_4326_geom ON example_data_4326.zones USING GIST (the_geom);

-- Insertar datos de ejemplo (coordenadas geograficas - zona de Salto Grande)

INSERT INTO example_data_4326.points_of_interest (name, description, category, created_by, the_geom) VALUES
    ('Represa Salto Grande', 'Central hidroelectrica binacional', 'Infraestructura', 'admin_gis', ST_SetSRID(ST_MakePoint(-57.9333, -31.2833), 4326)),
    ('Puente Internacional', 'Cruce fronterizo Uruguay-Argentina', 'Infraestructura', 'admin_gis', ST_SetSRID(ST_MakePoint(-57.9280, -31.2820), 4326)),
    ('Costanera Norte', 'Paseo costero sobre el embalse', 'Parque', 'editor_gis', ST_SetSRID(ST_MakePoint(-57.9150, -31.2900), 4326)),
    ('Terminal de Salto', 'Terminal de omnibus', 'Transporte', 'admin_gis', ST_SetSRID(ST_MakePoint(-57.9700, -31.2750), 4326)),
    ('Parque Solari', 'Espacio verde urbano', 'Parque', 'editor_gis', ST_SetSRID(ST_MakePoint(-57.9600, -31.2950), 4326));

INSERT INTO example_data_4326.streets (name, street_type, length_m, created_by, the_geom) VALUES
    ('Ruta 3', 'Ruta nacional', 4200.00, 'admin_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(-57.9700, -31.2750), ST_MakePoint(-57.9280, -31.2820)), 4326)),
    ('Av. Costanera', 'Avenida', 1800.00, 'editor_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(-57.9200, -31.2870), ST_MakePoint(-57.9100, -31.2930)), 4326)),
    ('Camino a la Represa', 'Camino', 2600.00, 'admin_gis', ST_SetSRID(ST_MakeLine(ST_MakePoint(-57.9450, -31.2860), ST_MakePoint(-57.9333, -31.2833)), 4326));

INSERT INTO example_data_4326.zones (zone_name, zone_type, area_m2, population, created_by, the_geom) VALUES
    ('Area de Embalse', 'Zona hidrica', 1800000.00, 0, 'admin_gis',
     ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
         ST_MakePoint(-57.9400, -31.2800),
         ST_MakePoint(-57.9250, -31.2800),
         ST_MakePoint(-57.9250, -31.2870),
         ST_MakePoint(-57.9400, -31.2870),
         ST_MakePoint(-57.9400, -31.2800)
     ])), 4326)),
    ('Centro Salto', 'Barrio', 2200000.00, 45000, 'admin_gis',
     ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[
         ST_MakePoint(-57.9680, -31.2780),
         ST_MakePoint(-57.9550, -31.2780),
         ST_MakePoint(-57.9550, -31.2900),
         ST_MakePoint(-57.9680, -31.2900),
         ST_MakePoint(-57.9680, -31.2780)
     ])), 4326));

-- Mismo usuario de GeoServer que ya usa example_data (creado en 01-init-schema.sql)
GRANT USAGE ON SCHEMA example_data_4326 TO geoserver_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA example_data_4326 TO geoserver_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA example_data_4326 TO geoserver_user;

DO $$
BEGIN
    RAISE NOTICE 'Schema example_data_4326 inicializado correctamente (EPSG:4326, zona Salto Grande)';
END $$;
