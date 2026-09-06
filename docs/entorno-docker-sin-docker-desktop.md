# Correr el stack sin Docker Desktop (Colima) + exponer la demo con Cloudflare Tunnel

Guía práctica para levantar Open Plugineta en macOS **sin Docker Desktop** (usando
[Colima](https://github.com/abiquo/colima) como motor Docker, mucho más liviano en RAM) y
exponer la demo local a internet con un túnel de Cloudflare, sin necesidad de cuenta ni dominio
propio.

Para el detalle técnico de *por qué* se armó así (variable `PLUGINETA_PUBLIC_URL`,
`PROXY_BASE_URL` de GeoServer, por qué Cloudflare Tunnel y no ngrok) ver
[`geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md`](../geomvd/PluginetaGeoserverExt/doc/PLUGINETA_EXTENSION.md#exponer-la-demo-afuera).
Este documento es el runbook operativo — los comandos, en orden, con los problemas reales que
aparecieron la primera vez que se corrió esto y cómo se resolvieron.

## Por qué Colima en vez de Docker Desktop

Docker Desktop es una app Electron pesada en RAM incluso ociosa. Colima corre el mismo daemon
Docker (compatible con `docker`/`docker compose` tal cual, cero cambios de comandos) adentro de
una VM Linux minimalista (via [Lima](https://github.com/lima-vm/lima)), con un footprint mucho
menor y sin GUI.

## 1. Instalar y arrancar Colima

```bash
brew install colima docker docker-compose
colima start --cpu 2 --memory 4 --disk 10
```

Los flags de recursos son ajustables — 2 CPU / 4GB RAM / 10GB disco alcanza de sobra para este
stack (Postgres + GeoServer + LDAP + un túnel).

Confirmar que quedó activo como backend de `docker`:

```bash
docker context ls
docker context use colima
docker info
```

## 2. Si venís de desinstalar Docker Desktop: problemas reales que pueden aparecer

Estos tres problemas aparecieron en orden la primera vez que se hizo esta migración en este
proyecto — quedan documentados porque no son obvios de diagnosticar a ciegas.

### 2.1 `no space left on device` al correr `colima start`

Docker Desktop deja un disco virtual enorme en
`~/Library/Containers/com.docker.docker/Data/vms/` — en este caso, **27GB**. Si el disco de la
Mac está casi lleno, ni Colima ni el propio Finder pueden escribir el archivo temporal que
necesitan para arrancar la VM nueva.

Diagnóstico:

```bash
df -h                                                              # mirar Avail en todos los volúmenes
du -sh ~/Library/Containers/com.docker.docker/Data/vms/ 2>/dev/null
```

En macOS moderno (APFS con volumen de sistema sellado + volumen de Datos), `df -h /` puede
mostrar poquísimo espacio libre mientras el volumen real de datos (`/System/Volumes/Data`) tiene
espacio de sobra — no te quedes solo con la primera línea, mirá la tabla completa.

Desinstalación completa de Docker Desktop (además de liberar los 27GB, evita que sus symlinks
rotos interfieran más adelante — ver 2.2 y 2.3):

```bash
# cerrar procesos si estan corriendo
osascript -e 'quit app "Docker"' 2>/dev/null
killall "Docker Desktop" 2>/dev/null
killall com.docker.backend 2>/dev/null

# el disco virtual - normalmente lo mas grande, con diferencia
rm -rf ~/Library/Containers/com.docker.docker

# la app y el resto de sus archivos
rm -rf /Applications/Docker.app
rm -rf ~/Library/"Group Containers"/group.com.docker
rm -rf ~/Library/"Application Support"/"Docker Desktop"
rm -rf ~/Library/"Saved Application State"/com.electron.docker.savedState
rm -rf ~/Library/Logs/"Docker Desktop"
rm -f ~/Library/Preferences/com.docker.docker.plist
rm -f ~/Library/LaunchAgents/com.docker.helper.plist
```

### 2.2 `docker not found, run 'brew install docker' to install`

Docker Desktop traía sus propios binarios `docker`/`docker compose`. Al borrarlo, `colima start`
deja de encontrar el cliente:

```bash
brew install docker docker-compose
```

### 2.3 `brew link docker-compose` → `Permission denied @ apply2files - /usr/local/lib/docker/cli-plugins`

Causa real (no es un problema de permisos genérico, hay que mirarlo con `ls -la` para
confirmarlo): Docker Desktop deja `/usr/local/lib/docker` con dueño `root`, y adentro un symlink
`cli-plugins` que apunta a `/Applications/Docker.app/Contents/Resources/cli-plugins` — que ya no
existe si seguiste el paso 2.1. Homebrew (corriendo como tu usuario) no puede escribir ahí, y aunque
pudiera, el symlink ya está roto.

```bash
sudo rm -rf /usr/local/lib/docker
brew link docker-compose
```

## 3. Levantar el stack (equivalente al "Inicio Rápido" del README, con Colima ya arriba)

```bash
cd code/open-plugineta   # raiz de este repo
docker compose up -d
docker compose ps
```

`plugineta-geoserver` puede tardar hasta un minuto en pasar a `healthy` (su healthcheck tiene
`start_period: 2m`).

## 4. Exponer la demo con Cloudflare Tunnel

No requiere cuenta de Cloudflare — el modo `--url` ("quick tunnel") asigna un subdominio
`*.trycloudflare.com` anónimo y efímero. `cloudflared` corre dentro de un contenedor (imagen
`cloudflare/cloudflared`, se baja sola), no hace falta instalar nada en la Mac.

```bash
docker compose --profile tunnel up -d cloudflared
docker compose logs cloudflared | grep trycloudflare.com
```

Con la URL asignada (ej. `https://random-two-words.trycloudflare.com`):

```bash
# .env
PLUGINETA_PUBLIC_URL=https://random-two-words.trycloudflare.com

docker compose up -d geoserver                              # aplica PROXY_BASE_URL en GeoServer
docker compose --profile publish up plugin-repo-publisher   # hornea el plugin QGIS con esa URL
```

Repositorio de plugin QGIS resultante, instalable desde cualquier máquina con internet
(*Complementos → Administrar e instalar complementos → Configuración → Agregar*):

```
https://random-two-words.trycloudflare.com/geoserver/rest/plugineta/repo/plugins.xml
```

La URL del túnel cambia cada vez que se reinicia `cloudflared` (modo anónimo) — hay que repetir
los dos comandos de arriba (`geoserver` + `plugin-repo-publisher`) con la URL nueva cada vez.

Para apagar el túnel sin tocar el resto del stack:

```bash
docker compose --profile tunnel down
```
