#!/bin/bash
# =============================================================================
# Publica (o re-publica) el plugin QGIS que sirve el repositorio embebido en
# GeoServer (PluginetaRepoController, server/geoserver/data_dir/plugineta-config/plugin-repo/).
# =============================================================================
# A diferencia de build-plugin.sh (que genera el ZIP versionado para "Install from ZIP"
# manual), este script SIEMPRE escribe con el nombre fijo "im_layer_loader.zip" (ver el
# aviso en repo.properties sobre por que no puede llevar la version en el nombre) y, si
# esta seteada PLUGINETA_PUBLIC_URL, reemplaza el host por defecto (http://localhost:8080)
# por esa URL publica en una copia TEMPORAL antes de empaquetar - el codigo fuente en git
# nunca se modifica.
#
# Uso local (fuera de Docker), desde code/frontend/:
#   PLUGINETA_PUBLIC_URL=https://abcd1234.ngrok-free.app ./publish-plugin-repo.sh
#   ./publish-plugin-repo.sh                                  # sin la var: publica con localhost:8080
#
# Uso via Docker Compose (mismo script, corrido dentro de un contenedor liviano):
#   echo "PLUGINETA_PUBLIC_URL=https://abcd1234.ngrok-free.app" >> .env
#   docker compose --profile publish up plugin-repo-publisher
#
# No hace falta reiniciar GeoServer despues de correr esto: PluginetaRepoController lee
# el zip del disco en cada request, no lo cachea.
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SRC="$SCRIPT_DIR/im_layer_loader"
OUTPUT_DIR="${PLUGIN_REPO_OUTPUT_DIR:-$SCRIPT_DIR/../../server/geoserver/data_dir/plugineta-config/plugin-repo}"
OUTPUT_ZIP="$OUTPUT_DIR/im_layer_loader.zip"

BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT

cp -r "$PLUGIN_SRC" "$BUILD_DIR/im_layer_loader"

if [ -n "$PLUGINETA_PUBLIC_URL" ]; then
    echo "Publicando con host publico: $PLUGINETA_PUBLIC_URL"
    sed -i.bak "s#http://localhost:8080#$PLUGINETA_PUBLIC_URL#g" \
        "$BUILD_DIR/im_layer_loader/modulos/properties/config.local.properties"
    rm -f "$BUILD_DIR/im_layer_loader/modulos/properties/config.local.properties.bak"
else
    echo "PLUGINETA_PUBLIC_URL no seteada - publicando con el default (http://localhost:8080)"
fi

mkdir -p "$OUTPUT_DIR"
rm -f "$OUTPUT_ZIP"

cd "$BUILD_DIR"
zip -r "$OUTPUT_ZIP" im_layer_loader \
    -x "im_layer_loader/__pycache__/*" \
    -x "im_layer_loader/**/__pycache__/*" \
    -x "im_layer_loader/*.pyc" \
    -x "im_layer_loader/**/*.pyc" \
    -x "im_layer_loader/*.pyo" \
    -x "im_layer_loader/**/*.pyo" \
    -x "im_layer_loader/.git/*" \
    -x "im_layer_loader/.gitignore" \
    -x "im_layer_loader/.idea/*" \
    -x "im_layer_loader/.vscode/*" \
    -x "im_layer_loader/*.log" \
    -x "im_layer_loader/**/*.log" \
    -x "im_layer_loader/.DS_Store" \
    -x "im_layer_loader/**/.DS_Store" \
    -x "im_layer_loader/Archivos/*" \
    -x "im_layer_loader/*.db" \
    -x "im_layer_loader/test/*" \
    -x "*.example" \
    > /dev/null

echo "Publicado: $OUTPUT_ZIP"
