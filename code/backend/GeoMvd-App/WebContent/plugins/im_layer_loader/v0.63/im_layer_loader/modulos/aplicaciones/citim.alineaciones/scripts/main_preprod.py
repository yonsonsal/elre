import os
import requests
import json
import psycopg2
from psycopg2 import sql
from time import sleep
import re

# Configuración de Alfresco
alfresco_url_crear_nodo = "https://nube-preprod.imm.gub.uy/alfresco/api/-default-/public/alfresco/versions/1/nodes/093efbeb-20c9-4105-9072-74eb5f075f09/children"
alfresco_url_shared_link = "https://nube-preprod.imm.gub.uy/alfresco/api/-default-/public/alfresco/versions/1/shared-links"
alfresco_username = "im9000002"
alfresco_password = "im9000002"

# Directorio local
directorio_local = "./Archivos/PlanosCodigos/CODIGOS"

# Configuración de la conexión a la base de datos
host = 'pdb01desav.imm.gub.uy'
port = '5432'
database = 'nucleo'
user = 'desar'
password = 'desar'

# Construir la cadena de conexión
connection_string = f"host={host} port={port} dbname={database} user={user} password={password}"


def actualizar_link_tabla_proyectos(link, proyecto):

	try:
	    # Establecer la conexión con la base de datos
	    connection = psycopg2.connect(connection_string)

	    # Crear un cursor
	    cursor = connection.cursor()

	    # Ejecutar la actualización
	    cursor.execute("UPDATE citim_proyectos SET link = '"+link+"' WHERE cod_proyecto = '"+proyecto+"'")

	    # Confirmar la transacción
	    connection.commit()

	    print("Actualización exitosa.")

	except Exception as e:
	    print(f"Error: {e}")

	finally:
	    # Cerrar el cursor y la conexión
	    if cursor:
	        cursor.close()
	    if connection:
	        connection.close()

def subir_archivo_a_alfresco(archivo_local, nombre_archivo):   

    # Configuración de las credenciales
    auth = (alfresco_username, alfresco_password)

    # Subir el archivo a Alfresco
    with open(archivo_local, 'rb') as file:
        files = {'filedata': file}
        nodo_data = {"overwrite": "true"}
        response = requests.post(alfresco_url_crear_nodo, auth=auth, data=nodo_data, files=files)

    if response.status_code == 201:
        print(f"Archivo {archivo_local} subido con éxito a Alfresco.")
        data = response.json()
        response.close()        
        nodo_id = data["entry"]["id"]
        print("Id:", nodo_id)
        
        # Datos JSON que deseas enviar en el cuerpo de la solicitud
        datos_json = {
    	    "nodeId": f"{nodo_id}"
        }

	# Convertir los datos JSON a formato de cadena
        datos_json_str = json.dumps(datos_json)

	# Cabeceras para la solicitud POST
        headers = {
    	    "Content-Type": "application/json"
        }
                
        response_link = requests.post(alfresco_url_shared_link, auth=auth, data=datos_json_str, headers=headers)
        data_link = response_link.json()
        if response_link.status_code == 409:
            shared_id = re.search(r'\[(.+?)\]', data_link["error"]["errorKey"]).group(1)
            actualizar_link_tabla_proyectos("https://nube-preprod.imm.gub.uy/#/preview/s/"+shared_id,nombre_archivo)            
        else:            
            shared_id = data_link["entry"]["id"]
            actualizar_link_tabla_proyectos("https://nube-preprod.imm.gub.uy/#/preview/s/"+shared_id,nombre_archivo)
    else:
        print(f"Error al subir el archivo {archivo_local} a Alfresco. Código de estado: {response.status_code}")

def main():
    # Obtener la lista de archivos en el directorio local
    archivos_locales = [f for f in os.listdir(directorio_local) if os.path.isfile(os.path.join(directorio_local, f))]

    # Subir cada archivo a Alfresco
    for archivo_local in archivos_locales:
        ruta_completa = os.path.join(directorio_local, archivo_local)
        
        # Obtener el nombre del archivo
        nombre_archivo = os.path.basename(ruta_completa).split('.')[0]
        print(f"Nombre del archivo: {nombre_archivo}")
        subir_archivo_a_alfresco(os.path.join(directorio_local, archivo_local), nombre_archivo)

if __name__ == "__main__":
    main()

