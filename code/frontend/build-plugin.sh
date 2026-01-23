#!/bin/bash
# =============================================================================
# Script para generar el ZIP del plugin Open Plugineta para QGIS
# =============================================================================
# Uso: ./build-plugin.sh
# Genera: dist/im_layer_loader-{version}.zip
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$SCRIPT_DIR/im_layer_loader"
DIST_DIR="$SCRIPT_DIR/dist"

# Obtener version desde metadata.txt
VERSION=$(grep "^version=" "$PLUGIN_DIR/metadata.txt" | cut -d'=' -f2)

if [ -z "$VERSION" ]; then
    echo "Error: No se pudo obtener la version desde metadata.txt"
    exit 1
fi

ZIP_NAME="im_layer_loader-${VERSION}.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"

echo "=========================================="
echo "  Building Open Plugineta v${VERSION}"
echo "=========================================="

# Crear directorio dist si no existe
mkdir -p "$DIST_DIR"

# Eliminar ZIP anterior si existe
if [ -f "$ZIP_PATH" ]; then
    echo "Eliminando ZIP anterior..."
    rm "$ZIP_PATH"
fi

# Crear ZIP excluyendo archivos innecesarios
echo "Creando $ZIP_NAME..."
cd "$SCRIPT_DIR"

zip -r "$ZIP_PATH" im_layer_loader \
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
    -x "*.example"

echo ""
echo "=========================================="
echo "  Plugin generado exitosamente!"
echo "=========================================="
echo ""
echo "Archivo: $ZIP_PATH"
echo "Tamaño:  $(du -h "$ZIP_PATH" | cut -f1)"
echo ""
echo "Para instalar en QGIS:"
echo "  1. Abrir QGIS"
echo "  2. Plugins > Manage and Install Plugins"
echo "  3. Install from ZIP"
echo "  4. Seleccionar: $ZIP_PATH"
echo ""
