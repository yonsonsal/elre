from PyQt5.QtWidgets import QProgressDialog, QFileDialog, QDialog, QVBoxLayout, QHBoxLayout, QComboBox, QPushButton,  QLabel, QScrollArea, QWidget
from qgis.core import QgsProject, QgsFeatureRequest, QgsExpression
from qgis.PyQt import QtWidgets

from ...utilidades.funcionesGenericas import FuncionesGenericas

class CheckCircuito:

    @staticmethod
    def cargarOpcionCheckCircuito(nombreCapa):

        nombreAccion =  f"Consultar estado de Circuitos"
        nombreObjetoAccion = f'ChequearCircuito{nombreCapa}'

        FuncionesGenericas.cargarOpcionAccionCapa(
            nombreCapa,
            nombreAccion,
            nombreObjetoAccion,
            lambda: CheckCircuito.check(nombreCapa))

    @staticmethod
    def check(nombreCapa):

        class MiDialogo(QDialog):
            def __init__(self, nombreCapa):
                super().__init__()
                self.nombreCapa = nombreCapa

                self.setWindowTitle("Consulta estado de Circuitos")
                self.setMinimumWidth(300)

                # Crear layout principal
                layout = QVBoxLayout()

                etiqueta = QLabel("Seleccione un circuito:")
                layout.addWidget(etiqueta)

                # Crear combo box
                self.combo = QComboBox()
                layout.addWidget(self.combo)

                # Crear layout para los botones
                botones_layout = QHBoxLayout()

                # Crear botón OK
                self.boton_ok = QPushButton("OK")
                botones_layout.addWidget(self.boton_ok)

                # Crear botón Cancelar
                self.boton_cancelar = QPushButton("Cerrar")
                botones_layout.addWidget(self.boton_cancelar)

                layout.addLayout(botones_layout)

                # Crear widget contenedor para el layout
                widget_contenedor = QWidget()
                widget_contenedor.setLayout(layout)

                # Crear área de scroll y establecer el widget contenedor
                area_scroll = QScrollArea()
                area_scroll.setWidgetResizable(True)
                area_scroll.setWidget(widget_contenedor)

                # Crear layout principal del diálogo y añadir el área de scroll
                layout_principal = QVBoxLayout()
                layout_principal.addWidget(area_scroll)
                self.setLayout(layout_principal)

                # Cargar valores únicos en el combo box
                self.cargar_valores_combo()

                # Conectar los botones a sus métodos
                self.boton_ok.clicked.connect(self.mostrar_valor_seleccionado)
                self.boton_cancelar.clicked.connect(self.cancelar)

            def cargar_valores_combo(self):
                # Obtener la capa
                self.capa = QgsProject.instance().mapLayersByName(self.nombreCapa)[0]

                # Obtener los valores únicos del atributo 'COD_RECORRIDO'
                valores_unicos = set()
                for feature in self.capa.getFeatures():
                    valor = feature['COD_RECORRIDO']
                    valores_unicos.add(valor)

                # Agregar los valores únicos al combo box
                self.combo.addItems(sorted(valores_unicos))

            def mostrar_valor_seleccionado(self):
                # Obtener el valor seleccionado del combo box
                valor_seleccionado = self.combo.currentText()
                print(f"Valor seleccionado: {valor_seleccionado}")

                CheckCircuito.showCheckCircuitos(self.capa, valor_seleccionado)

                #self.accept()  # Cierra el diálogo

            def cancelar(self):
                self.reject()  # Cierra el diálogo sin hacer nada

        # Crear y mostrar el diálogo
        dialogo = MiDialogo(nombreCapa)
        dialogo.exec_()

    @staticmethod
    def checkConsistenciaCircuito(layer, codigoRecorrido):
        print(f"El checkConsistencia layer_ {layer} y recorrido {codigoRecorrido}")
        exp = QgsExpression(f"COD_RECORRIDO = '{codigoRecorrido}' and FECHA_HASTA IS NULL")
        request = QgsFeatureRequest(exp)
        features = layer.getFeatures(request)
        posiciones = [int(feature['POSICION']) for feature in features]

        if len(posiciones) > 0:
            ene = max(posiciones)
            bien = list(range(1, ene + 1))
        else:
            ene = 0
            bien = []


        repetidos = set()
        mal = set()

        for i in posiciones :
            if i in bien:
                bien.remove(i)
            elif i < 1:
                mal.add(i)
            else:
                repetidos.add(i)


        print('Faltan', bien)
        print('Repetidos', repetidos)
        print('Tiene Cero', mal)
        return codigoRecorrido, bien, list(repetidos), list(mal)

    @staticmethod
    def showCheckCircuitosSinOk(layer, recorrido):

        estructura_diseño = []
        #(recorrdio, faltan, repetidos, mal)
        resul_check = CheckCircuito.checkConsistenciaCircuito(layer, recorrido)
        estructura_diseño.append(resul_check)

        mensaje = CheckCircuito.generarMensageConsistenciaCircuito(estructura_diseño)
        if "OK" in mensaje:
            pass
        else:
            QtWidgets.QMessageBox.information(None, "Pluggineta", mensaje, QtWidgets.QMessageBox.Ok)

    @staticmethod
    def showCheckCircuitos(layer, recorrido):

        estructura_diseño = []
        #(recorrdio, faltan, repetidos, mal)
        resul_check = CheckCircuito.checkConsistenciaCircuito(layer, recorrido)
        estructura_diseño.append(resul_check)

        mensaje = CheckCircuito.generarMensageConsistenciaCircuito(estructura_diseño)
        QtWidgets.QMessageBox.information(None, "Pluggineta", mensaje, QtWidgets.QMessageBox.Ok)


    @staticmethod
    def generarMensageConsistenciaCircuito(estructura):
        msj = f"""
        <div style="font-family: Arial, sans-serif; padding: 15px;">
        <h2 style="color: #2980B9; border-bottom: 2px solid #2980B9; padding-bottom: 5px;">Consistencia de Circuitos</h2>"""

        for circuito in estructura:

            elementos_lista = (
                                  f"""
                    <li style="margin-bottom: 15px; padding: 10px; background-color: #ECF0F1; border: 1px solid #BDC3C7; border-radius: 5px;">
                        <b style="color: red;">Faltan:</b> <span style="color: black;">{circuito[1]}</span>
                    </li>
                    """ if len(circuito[1]) > 0 else ""
                              ) + (
                                  f"""
                    <li style="margin-bottom: 15px; padding: 10px; background-color: #ECF0F1; border: 1px solid #BDC3C7; border-radius: 5px;">
                        <b style="color: red;">Repetidos:</b> <span style="color: black;">{circuito[2]}</span>
                    </li>
                    """ if len(circuito[2]) > 0 else ""
                              ) + (
                                  f"""
                    <li style="margin-bottom: 15px; padding: 10px; background-color: #ECF0F1; border: 1px solid #BDC3C7; border-radius: 5px;">
                        <b style="color: red;">Posiciones erroneas:</b> <span style="color: black;">{circuito[3]}</span>
                    </li>
                    """ if len(circuito[3]) > 0 else ""
                              ) + (
                                  f"""
                    <li style="margin-bottom: 15px; padding: 10px; background-color: #ECF0F1; border: 1px solid #BDC3C7; border-radius: 5px; color: green;">
                        <b>OK</b>
                    </li>
                    """ if len(circuito[1]) == 0 and len(circuito[3]) == 0 and len(circuito[2]) == 0 else ""
                              )

            # Texto del mensaje con HTML y la variable usando f-string
            msj =  msj + (
                f"""
                        <p style="margin-top: 15px; ">Las posiciones del circuto <b>{circuito[0]}</b>:</p>
                        <ul style="margin-top: 10px; list-style-type: none; padding: 0;">
                            {elementos_lista}
                        </ul>
                        <br>
                        """
            )
        msj = msj + f"""    
            </div>
            """
        return  msj