import os
import shutil



from PyQt5.QtWidgets import QProgressDialog, QFileDialog
from qgis._core import QgsApplication
from qgis.utils import iface
from qgis.core import QgsProject, QgsFeatureRequest
from qgis.PyQt import QtWidgets

import zipfile
from qgis.PyQt.QtWidgets import QFileDialog
from qgis.core import QgsApplication
from qgis.PyQt.QtWidgets import QMessageBox

from ..servicios.serviciosCapas import ServiciosCapas
from .funcionesGenericas import FuncionesGenericas


class FuncionesExportacion:
    @staticmethod
    def cargarOpcionExportarCSV(workspace, nombreCapa, usuario, atributosCapa):
        dbms = atributosCapa["dbms"]
        datasource = atributosCapa["Origen_datos"]
        tabla = atributosCapa["nombreTabla"]
        pk = atributosCapa["pk"]

        nombreAccion =  f"Exportar a CSV"
        nombreObjetoAccion = f'Exportar{nombreCapa}ACSV'

        FuncionesGenericas.cargarOpcionAccionCapa(
            nombreCapa,
            nombreAccion,
            nombreObjetoAccion,
            lambda: FuncionesExportacion.exportarCapa_CSV(workspace, nombreCapa, tabla, dbms, datasource, usuario, pk))

    @staticmethod
    def exportarCapa_CSV(workspace, nombreCapa, tabla, dbms, datasource, usuario, pk):
        canvas = iface.mapCanvas()  # Get the map canvas in QGIS
        layer = QgsProject.instance().mapLayersByName(nombreCapa)[0]
        qgs = QgsProject.instance()
        isCapaVisible = qgs.layerTreeRoot().findLayer(layer.id()).itemVisibilityChecked()
        if isCapaVisible:
            myobj = {"gids": []}
            if canvas is not None and layer is not None:
                extent = canvas.extent()  # Get the extent of the canvas view
                # Create a feature request using the canvas extent
                request = QgsFeatureRequest().setFilterRect(extent)
                # Start iterating over the features
                listaGids = []
                for feature in layer.getFeatures(request):
                    # Access the attributes of the feature
                    gid = int(feature.attribute(pk))
                    listaGids.append(str(gid))
                myobj = {"gids": listaGids}
            else:
                print("No active layer found.")

            progress_dialog = QProgressDialog("Exportando...", None, 0, 0, iface.mainWindow())
            progress_dialog.setWindowTitle("Exportando...")
            progress_dialog.setRange(0, 0)
            progress_dialog.show()

            response = ServiciosCapas.obtenerDatosParaExportarCSV(dbms, datasource, tabla, usuario, workspace, myobj)

            progress_dialog.close()

            if response.status_code == 200:
                # Show a dialog to save the downloaded file
                file_dialog = QFileDialog()
                file_dialog.setWindowTitle("Exportar Archivo")
                file_dialog.setAcceptMode(QFileDialog.AcceptSave)
                file_dialog.setDefaultSuffix("csv")
                file_dialog.setNameFilters(["CSV Files (*.csv)", "All Files (*.*)"])

                file_path = ""
                if file_dialog.exec_() == QFileDialog.Accepted:
                    file_path = file_dialog.selectedFiles()[0]
                    # Save your downloaded file using the selected file_path

                # Save the file
                if file_path:
                    with open(file_path, 'wb') as f:
                        f.write(response.content)
                    QtWidgets.QMessageBox.information(None, "Exportar a CSV", "Archivo guardado correctamente.")
                else:
                    QtWidgets.QMessageBox.information(None, "Exportar a CSV", "No hay archivo seleccionado.")
            else:
                print("Error:", response.status_code)
        else:
            QtWidgets.QMessageBox.information(None, "Exportar a CSV", "La Capa no esta visible.")

    @staticmethod
    def exportarLogs():

        log_dir = os.path.join(QgsApplication.qgisSettingsDirPath(), "logs")
        zip_path, _ = QFileDialog.getSaveFileName(
            None,
            "Guardar logs comprimidos",
            os.path.expanduser("~/plugineta_logs.zip"),
            "Archivo ZIP (*.zip)"
        )

        if not zip_path:
            return  # Usuario canceló

        if not zip_path.endswith(".zip"):
            zip_path += ".zip"

        try:
            # Crear el archivo ZIP
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                for file_name in os.listdir(log_dir):
                    if file_name.endswith(".log") or ".log." in file_name:
                        file_path = os.path.join(log_dir, file_name)
                        zipf.write(file_path, arcname=file_name)

            # Confirmación
            QMessageBox.information(None, "Exportar Logs", f"Logs exportados a:\n{zip_path}")

        except Exception as e:
            QMessageBox.critical(None, "Error", f"No se pudo exportar los logs:\n{str(e)}")


