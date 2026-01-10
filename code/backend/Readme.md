# Tránsito y transporte

Link a apliación en ambiente de desarrollo: https://desa-intranet.imm.gub.uy/app/dfr/

Link a aplicación en producción: https://intranet.imm.gub.uy/app/dfr/

## Deploy

### Deploy en Wildfly local
Para hacer deploy en un Wildfly local ([link para descargar](https://imnube.montevideo.gub.uy/share/s/6TaGIkCmS2eyLyUKPX6LEw)), se puede ejecutar [deploy_war.sh](deploy_war.sh), es necesario contar con el proyecto  [geomvd](https://gitlab01prodv.imm.gub.uy/geomvd/geomvd). Se debe ejecutar `./deploy_war.sh -g path_a_repositorio_geomvd -w path_a_wildfly -e l`

### Generar archivos para ambiente de desarrollo
Para hacer deploy en un Wildfly local ([link para descargar](https://imnube.montevideo.gub.uy/share/s/6TaGIkCmS2eyLyUKPX6LEw)), se puede ejecutar [deploy_war.sh](deploy_war.sh), es necesario contar con el proyecto  [geomvd](https://gitlab01prodv.imm.gub.uy/geomvd/geomvd). Se debe ejecutar `./deploy_war.sh -g path_a_repositorio_geomvd -e d`. Luego en la carpeta deploy_dev se encontraran los archivos para el despliegue.

### Generar archivos para ambiente de producción
Para hacer deploy en un Wildfly local ([link para descargar](https://imnube.montevideo.gub.uy/share/s/6TaGIkCmS2eyLyUKPX6LEw)), se puede ejecutar [deploy_war.sh](deploy_war.sh), es necesario contar con el proyecto  [geomvd](https://gitlab01prodv.imm.gub.uy/geomvd/geomvd). Se debe ejecutar `./deploy_war.sh -g path_a_repositorio_geomvd -e p`. Luego en la carpeta deploy_prod se encontraran los archivos para el despliegue.

Al utilizar [deploy_war.sh](deploy_war.sh), se puede configurar para no tener que pasarles las variables de los path a wildfly y geomvd como parámetros, sino usando un archivo de variables, se puede tomar como ejemplo [.vars.deploy_war.example](.vars.deploy_war.example) y crear el archivo [.vars.deploy_war]()

## Docker
La aplicación puede ser ejecutada en un contenedor de Docker. Para esto, debe existir en una carpeta, el proyecto de [geomvd](https://gitlab01prodv.imm.gub.uy/geomvd/geomvd) y este proyecto de dfr. Desde está carpeta se puede hacer el build de la imagen con `docker build -f dfr/Dockerfile -t dfr .` y luego se puede correr la misma `docker run -d -p 8443:8443 --name dfr dfr`.
