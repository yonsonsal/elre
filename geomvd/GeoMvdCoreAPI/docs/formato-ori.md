# Formato `.app` / `.ori` / `_md.xml`

Este documento describe el vocabulario completo del formato de configuración que usa `ConfigParser.java` (`geomvd/GeoMvdCoreAPI/src/.../core/ConfigParser.java`) para describir qué capas expone cada aplicación de Plugineta, cómo se editan, y de dónde salen sus datos. Es la fuente de verdad que consume `DFRPublicLayerService` para armar la respuesta de `atributocapaformat`, `codiguerasdata` y `getCalcFields` que el plugin QGIS usa para construir sus formularios.

Se escribió cruzando dos fuentes:
- El código real del parser (`ConfigParser.java`, `Capa.java`, `AtributoCapa.java`, `Child.java`, `DatosCapa.java`) — la gramática *que el sistema efectivamente interpreta hoy*.
- Un corpus de producción real de 26 aplicaciones (dfr, geofact, citim.\*, utap, gep, sav, bicis, sfm, uccriu, etc. — 423 `.ori` + 377 `_md.xml` + 26 `.app`), mucho más rico que el `workspace-demo` genérico del repo open source, que sirvió para encontrar ejemplos reales y detectar vocabulario que existe en los archivos pero que el parser ignora.

**Nota sobre el formato**: es XML por razones históricas (ver [El `.dtd` viejo: una generación anterior del mismo formato](#el-dtd-viejo-una-generación-anterior-del-mismo-formato)). Este documento describe el *vocabulario/semántica*, no defiende XML como el vehículo definitivo — ver [Hacia dónde vamos](#hacia-dónde-vamos) al final.

## Panorama general

Cada aplicación (`dfr`, `utap`, `geofact`, ...) tiene una carpeta de configuración con tres tipos de archivo, leídos por `ConfigParser.leerDatos()`:

- **Un `.app`** (uno por aplicación): lista las capas de la app y sus flags de comportamiento (editable, con qué rol, si permite alta/baja, etc.), y por cada capa apunta a un `.ori` (datos/origen) y un `_md.xml` (metadata de atributos para el formulario).
- **Un `.ori` por capa**: de dónde salen los datos (tabla, base, workspace de GeoServer) y qué atributos tiene, con sus reglas de negocio (tipo, si es editable, cálculo, validación, referencia a otra capa).
- **Un `_md.xml` por capa** (opcional): metadata de presentación para el formulario (label, orden, si se puede buscar, si es de solo lectura, relación maestro-detalle).

`ConfigParser` cruza los tres por nombre de archivo (los atributos `metadata="..."` y `datos="..."` del `<capa>` del `.app` apuntan al `_md.xml` y al `.ori` respectivamente) y arma un objeto `Capa` en memoria por cada una.

## `.app`

```xml
<aplicacion nombre="dfr">
  <capa nombre="zones" metadata="zones_md.xml" datos="zones.ori"
        roleedit="RA_GEOSDFR_EDICION" roleeditparcial="" visible="true"
        editable="true" geomedit="true" alta="true" baja="true"
        autocommit="false" canSplit="true" canDeleteVertex="true"
        canClone="true" canMerge="false" tipo="WFS" estilo="calles.sld"/>
  ...
</aplicacion>
```

| Atributo | Uso real | Notas |
|---|---|---|
| `nombre`, `metadata`, `datos` | Siempre presentes | Enlazan con `_md.xml` y `.ori` |
| `roleedit` | **Rara vez usado** — 1 sola ocurrencia en las 26 apps relevadas (`dfr.app`, `roleedit="RA_GEOSDFR_EDICION"`) | Convención de nombre observada: `RA_GEOS<APP>_<ACCION>`. Recordar (ver plan de migración) que hoy `DFRPublicLayerService`/`RolesUtils.getLayerswithRolesPlugineta` **no aplica este filtro** — es un valor declarado, no necesariamente efectivo en el camino que usa el plugin OSS. |
| `roleeditparcial` | **Cero ocurrencias reales** en el corpus relevado | Existe en el modelo, sin uso observado. |
| `visible`, `editable`, `geomedit`, `alta`, `baja` | Comunes, con default `true` si el atributo falta (`canDeleteVertex`, `canClone`, `canSplit` también default `true`; `autocommit`, `canMerge` default `false`) | Ver `ConfigParser.leerDatos()` líneas ~177-202 para los defaults exactos. |
| `autocommit="true"` | Usado en 3 capas, todas en `dfr.app` (`E_DF_POSICIONES_RECORRIDO`, `E_DF_CAP_CONTENEDORES`, `E_DF_CAP_CIRCUITOS`) | Capas de tránsito/contenedores donde no hay flujo de confirmación manual de edición. |
| `canMerge` | **Cero ocurrencias reales** | Existe en el modelo, sin uso observado. |
| `estilo` | Ver sección [Estilos](#estilos-sld) — dos convenciones distintas conviven. |

## `.ori`

Estructura general de una capa "de verdad" (publicada como WFS en GeoServer):

```xml
<origen_datos>
    <workspace nombre="workspace-demo" tipo="WFS">
        <style strokeColor="#FF6B6B" strokeWidth="2" fillColor="#FF6B6BBA"/>
        <capapublicada nombre="points_of_interest" nombre_mostrar="Points of Interest" tilesOrigin="..."/>
    </workspace>
    <fuente nombre="pluginetaDS" tipo="POSTGIS"/>
    <capa grupo="..."/>
    <tabla nombre="points_of_interest" esquema="example_data" pk="gid" secuencia="..." comboValue="..." comboLabel="..."/>
    <atributo nombre="zoneName" tipo="java.lang.String" nillable="true" consultable="true"
              nombre_mostrar="Zone Name" valorCalculado="..." persistible="true" validador="..."/>
    <atributo_tabla nombre_capa="zoneName" nombre_bd="zone_name"/>
</origen_datos>
```

### `<atributo>` — un campo de la capa

| Atributo | Semántica |
|---|---|
| `nombre` | Nombre lógico del campo (el que usa el resto del `.ori`/`_md.xml` para referenciarlo) |
| `tipo` | Tipo Java del campo (`java.lang.String`, `java.lang.Double`, ...) o un tipo especial de relación — ver [Relaciones entre capas](#relaciones-entre-capas) |
| `nillable` | Si acepta nulo |
| `capa_referenciada` | Nombre de otra `<capa>` que este atributo referencia — la sintaxis exacta depende del `tipo`, ver relaciones |
| `consultable` | Si el atributo entra en búsquedas |
| `nombre_mostrar` | Label para el formulario (puede repetirse/complementar el `label` del `_md.xml`) |
| `valorCalculado` | Fórmula de campo calculado — ver [Campos calculados](#campos-calculados-valorcalculado) |
| `persistible` | Si el valor calculado se guarda en la base o se computa al vuelo |
| `validador` | **Declarado en el modelo pero sin consumidor en el código actual** (no hay ninguna clase tipo `ReflectionValidator`) y **cero ocurrencias reales** en el corpus — vocabulario totalmente inerte hoy. |

`<atributo_tabla nombre_capa="..." nombre_bd="...">` mapea el nombre lógico al nombre real de columna en la base (pueden diferir).

### `<tabla>` y `<fuente>` — vocabulario declarado que el parser NO lee

`ConfigParser.analyzingORI()` solo lee de `<tabla>`: `nombre`, `secuencia`, `pk`, `comboValue`, `comboLabel`. Solo lee de `<fuente>`: `nombre`, `tipo`. Pero el corpus real usa consistentemente estos atributos adicionales, que **hoy se ignoran silenciosamente**:

- `<tabla esquema="...">` — omnipresente (`esquema="public"`, `esquema="ciudadanos"`, etc.). Sin campo equivalente en `Capa.java`. Implica que las queries armadas por `Datahandler`/`DBHelper` dependen del `search_path` de la conexión JDBC, no de un esquema explícito por capa.
- `<fuente esquema="...">` — también aparece a nivel fuente (ej. `nucleoDS` con `esquema="nucleo"`).
- `<fuente proxy="false">` — presente en fuentes Oracle y Postgres del corpus real.
- `<tabla alias="...">`, `<tabla id="...">` — detectados en al menos algunos `.ori` reales.

Nombres de datasource (JNDI) reales observados más allá de los 3 ya conocidos por el plan de migración (`brfDS`, `citimDS`, `brhDS`): también **`nucleoDS`** y **`nucleoDS_internos`** (muy usados en `utap`/`gep`). El corpus confirma datasources tanto `POSTGIS` como `ORACLE` en producción real (ej. `dfr/descripcionRecorrido.ori` usa `<fuente nombre="brfDS" tipo="ORACLE" proxy="false"/>`).

### `<workspace>` / capas sin `<workspace>`

Si el `.ori` tiene `<workspace>`, la capa se publica vía GeoServer (WMS/WFS) — es lo que vimos en `workspace-demo`. `<capapublicada tilesOrigin="...">` está declarado y leído por el código, pero **cero ocurrencias reales** con ese atributo poblado en el corpus relevado.

Si el `.ori` **no** tiene `<workspace>`, el parser cae en una rama alternativa que espera `<origen_datos tipo="..." source="..." url="..." format="..." layer="..." formatToService="...">`. Esta rama existe en el código pero **no aparece ni una vez** en el corpus real — en la práctica, toda capa sin `<workspace>` que se relevó usa simplemente `<fuente>` + `<tabla>` (son las capas-codiguera, ver abajo), nunca esta forma con `url`/`format`. Es código muerto en la práctica actual, aunque sigue siendo parte del contrato que el parser soporta.

## `_md.xml`

```xml
<attributes>
  <attribute name="zoneName" usage="..." presentation="..." label="Zone Name"
             size="20" columns="1" query_capable="true" read_only="false"
             role_edit="..." show="true" with_time="false" no_export_to="csv"/>
  <child layer="e_ep_inspeccion_banios" parent_id_attribute="gid_banio"/>
</attributes>
```

Cada `<attribute>` complementa al `<atributo>` homónimo del `.ori` con metadata de presentación (`itsintheMD=true` marca que el atributo tiene entrada en el `_md.xml`, usado para decidir qué exportar a CSV). `role_edit` existe en el modelo (a nivel de atributo individual, distinto del `roleedit` a nivel de capa del `.app`) pero **tampoco tiene ocurrencias reales** en el corpus relevado.

## Relaciones entre capas

Hay **dos mecanismos distintos**, no uno solo — importante no perderlos al rediseñar el formato:

### 1. N→1: codiguera / lista de valores (`ExternalAttribute`)

Un atributo de tipo que contiene `ExternalAttribute` con `capa_referenciada="NombreLogico"` (nombre plano, sin calificar) apunta a otra `<capa>` que actúa como lista de valores — típicamente sin `<workspace>` (no se publica en GeoServer, es solo una tabla de códigos). `ConfigParser` marca la capa referenciada como `esCodiguera=true`, lo que la hace aparecer en la respuesta de `codiguerasdata` (resuelta con `select * from tabla order by pk`, usando `comboValue`/`comboLabel` de su `<tabla>` para armar el dropdown).

Ejemplo real (`utap/utap_luminarias.ori` → `utap/utap_tipo_lampara.ori`):

```xml
<!-- utap_luminarias.ori: el atributo N -->
<atributo nombre="tipo_lampara" tipo="imm.gis.core.feature.ExternalAttribute"
          capa_referenciada="Tipo Lampara" valorCalculado="python::getTipoLampara()"/>

<!-- utap_tipo_lampara.ori: la capa "1" (codiguera), sin <workspace> -->
<capa nombre="Tipo Lampara">
  <atributo nombre="desc_tipo_lampara" tipo="java.lang.String"/>
  <origen_datos>
    <fuente nombre="nucleoDS" tipo="POSTGIS"/>
    <tabla nombre="utap_tipo_lampara" esquema="public" pk="cod_tipo_lampara"
           comboValue="cod_tipo_lampara" comboLabel="desc_tipo_lampara">
      <atributo_tabla nombre_bd="desc_tipo_lampara" nombre_capa="desc_tipo_lampara"/>
    </tabla>
  </origen_datos>
</capa>
```

`utap_luminarias.ori` es el ejemplo más rico del corpus: tiene más de 10 atributos `ExternalAttribute` de este tipo (marca, modelo, fabricante, tipología, instalador, tipo de control, temperatura de color, color de carcasa...) — un caso real de "una capa con muchas listas de valores".

### 2. 1→N: maestro-detalle real, dos variantes

**(a) `<child>` en `_md.xml`** — modela la relación desde el lado "1" (el padre declara su hijo). 6 ocurrencias reales en todo el corpus, todas en `gep/*` (baños, bebederos, soportes de bicicletas, papeleras, relojes/termómetros) y `sav/palmerasPublicas_md.xml`. Ejemplo (`gep/banios_md.xml`):

```xml
<child layer="e_ep_inspeccion_banios" parent_id_attribute="gid_banio"/>
```

Un baño público tiene N registros de inspección histórica, enlazados por `gid_banio`.

**(b) `FeatureReferenceAttribute` en `.ori`** — modela la relación desde el lado "N" (el hijo apunta a su padre), con sintaxis de `capa_referenciada` **calificada por workspace** (`workspace:capa`, a diferencia del nombre plano que usa `ExternalAttribute`). Encontrado en `utap`:

```xml
<atributo nombre="id_puesta" tipo="imm.gis.core.feature.FeatureReferenceAttribute"
          capa_referenciada="utap:e_utap_puesta"/>
<atributo nombre="id_nodo_controlador" tipo="imm.gis.core.feature.FeatureReferenceAttribute"
          capa_referenciada="utap:e_utap_nodo_controlador" nillable="true"/>
```

Una luminaria (`utap_luminarias`) referencia su poste/puesta y su nodo controlador.

**Punto abierto a validar**: `ConfigParser.analyzingORI()` trata `capa_referenciada` de forma genérica para cualquier `tipo` de atributo — resuelve `value.setCapa(cap)` (deja la capa referenciada accesible), pero **solo** marca `esCodiguera=true` en la capa referenciada cuando el tipo contiene literalmente `ExternalAttribute`. Para `FeatureReferenceAttribute`, la referencia queda resuelta en memoria pero no dispara ningún tratamiento especial adicional (no hay lógica de maestro-detalle activa asociada a este tipo en el código relevado hasta ahora) — a confirmar si esto es intencional (el `<child>` del `_md.xml` es el mecanismo "activo" real para 1→N, y `FeatureReferenceAttribute` es más bien informativo/de solo-lectura) antes de asumir nada al diseñar un formato nuevo.

## Campos calculados (`valorCalculado`)

`ReflectionCalcs.invoke(calc, object, usuario)` (`geomvd/GeoMvdCoreAPI/.../core/fields/ReflectionCalcs.java`) interpreta el string de `valorCalculado` con la sintaxis `<ClaseCompleta>::<metodo>(<nombreCampoJSON>)`:
- Separa por `::` → nombre de clase completo.
- Lo que sigue hasta el primer `(` → nombre de método.
- El contenido entre paréntesis **no es decorativo** — es el nombre del campo dentro del JSON de entrada cuyo valor se pasa como parámetro al método invocado por reflection (firma fija `{String, Usuario}`, ver hallazgo ya conocido del plan de migración de CRS).
- Hace `Class.forName(className)` + `getDeclaredMethod(...)` + `invoke(null, valor, usuario)`.

Dos sintaxis conviven en el corpus real, con implicancias muy distintas:

**(a) `uy.ciemsa.geomvd.<app>.fields.<Clase>::<metodo>(<CAMPO>)`** — ~35 ocurrencias, sobre atributos normales (no codigueras), en `dfr`, `geofact`, `citim`, `etnia`, `geoprep`, `piai`. Ejemplo real: `uy.ciemsa.geomvd.geofact.fields.ZonasFacturacionCalcs::getMetrosVia(THE_GEOM)`.

⚠️ **El paquete raíz del corpus real es `uy.ciemsa.geomvd.*`, pero las clases `*Calcs` de este repo viven en `uy.gub.montevideo.gis.geomvd.*`** (confirmado: `code/backend/.../geofact/fields/ZonasFacturacionCalcs.java` está en `uy.gub.montevideo.gis.geomvd.geofact.fields`). Incluso hay al menos un caso donde también cambió el nombre de clase (corpus: `PosicionesRecorridoCalcs`; repo: `PosicionesRecorridoNUCalcs`). Con `ReflectionCalcs.invoke()` tal como está hoy, un `valorCalculado` copiado tal cual del corpus real fallaría con `ClassNotFoundException` (capturada y logueada por `injectCalcFields`, sin tumbar el endpoint, pero el campo queda sin calcular). **Cualquier `.ori` de producción real que se reutilice contra este repo necesita el namespace corregido.**

**(b) `python::<funcion>()`** — 66 ocurrencias, **todas** sobre atributos `ExternalAttribute` (codigueras). Ejemplo: `python::getMarcaLuminaria()`. No hay ningún soporte de Python/Jython en `GeoMvdCoreAPI` (confirmado: no hay dependencia de Jython en el `pom.xml`) — `Class.forName("python")` fallaría igual que el caso anterior. En la práctica esto es inocuo porque las codigueras se resuelven por el endpoint `codiguerasdata` (`select * from tabla`), que nunca invoca `ReflectionCalcs`/`valorCalculado` — pero si algún día se llamara `getCalcFields` sobre una de estas tablas, fallaría en silencio igual que el caso (a). Es casi con certeza un remanente de un cliente/generación anterior (ver el `.dtd` viejo abajo) que quedó pisado por el mecanismo de codiguera moderno sin limpiarse del dato.

## Estilos (`.sld`)

El atributo `estilo` de `.app`/`.ori` tiene dos convenciones distintas conviviendo, sin patrón claro de cuándo se usa cada una:

- **Nombre de archivo real**: `estilo="calles.sld"`, `estilo="ancapLineas.sld"` — corresponden 1:1 a un archivo `.sld` presente junto al `.ori`.
- **Nombre lógico sin extensión**: `estilo="banios"`, `estilo="bebederos"` — no existe ningún `.sld` con ese nombre en el corpus; el estilo debe estar dado de alta directamente en el catálogo de GeoServer con ese nombre, fuera de estos archivos.

## El `.dtd` viejo: una generación anterior del mismo formato

`sav/xml/tema.dtd` define una gramática con los mismos nombres de elemento raíz que hoy (`tema`, `capa`, `atributo`, `origen_datos`, `tabla`, `atributo_tabla`) pero con vocabulario totalmente distinto: `admite_nulo`/`valor_por_defecto`/`largo`/`es_id_capa`/`es_geometrico` en vez de `nillable`/`capa_referenciada`/`consultable`/`valorCalculado`/`persistible`; credenciales de conexión embebidas directas (`host`/`usuario`/`password`/`base`, sin JNDI) en `<origen_datos>`; `columna_id`/`columna_geom`/`es_lov` en vez de `pk`/`comboValue`/`comboLabel`; y un elemento `<join>` (join SQL explícito) que no existe hoy. **No valida los archivos actuales** — es la explicación arqueológica de por qué el elemento raíz de muchos `.ori` sigue llamándose `<tema>`/`<origen_datos>` con esa forma general, y del origen probable del `python::` como vestigio de un motor de cálculo anterior (posiblemente el viejo GEOMVD con scripting embebido, dado el paquete `imm.gis.core.feature.*` que aparece en los tipos `ExternalAttribute`/`FeatureReferenceAttribute`).

## Resumen: vocabulario declarado vs. vocabulario vivo

| Vocabulario | Estado |
|---|---|
| `nombre`, `tipo`, `capa_referenciada`, `nillable`, `consultable`, `nombre_mostrar`, `persistible`, `valorCalculado` (atributo) | ✅ Vivo — leído y con uso real |
| `pk`, `comboValue`, `comboLabel`, `nombre`/`secuencia` (tabla); `nombre`/`tipo` (fuente) | ✅ Vivo |
| `<child>` (`_md.xml`) | ✅ Vivo — 6 usos reales |
| `FeatureReferenceAttribute` (`.ori`) | ⚠️ Parseado genéricamente, sin tratamiento especial confirmado — validar intención |
| `roleedit` (`.app`) | ⚠️ Vocabulario válido pero no aplicado por `DFRPublicLayerService`/`RolesUtils.getLayerswithRolesPlugineta` (ver plan de migración) |
| `esquema`/`schema` (tabla y fuente), `proxy` (fuente), `alias`/`id` (tabla) | ❌ Presentes en casi todos los `.ori` reales, **no leídos** por `ConfigParser` |
| `<origen_datos url/format/layer/formatToService>` (capas sin `<workspace>`) | ❌ Soportado por código, cero uso real observado |
| `tilesOrigin` | ❌ Soportado por código, cero uso real observado |
| `canMerge`, `roleeditparcial`, `role_edit` (atributo), `validador` | ❌ Existen en el modelo de datos, cero uso real observado, ningún consumidor en el código más allá de guardarlos |
| `valorCalculado` con namespace `uy.ciemsa.geomvd.*` o `python::` | ❌ Sintaxis presente en producción real, pero rota/inerte contra el `ReflectionCalcs` y los paquetes Java actuales de este repo |
| Gramática de `tema.dtd` (`admite_nulo`, `columna_id`, `<join>`, credenciales embebidas, ...) | ❌ Generación anterior, no vigente |

## Hacia dónde vamos

Este documento es una foto del vocabulario *actual*, pensada para no perder capacidades reales al momento de evaluar una eventual migración del formato de configuración (hoy XML) hacia algo más liviano y con más posibilidades de consulta/gestión (YAML, JSON, o directamente un modelo en base de datos con UI de administración). No es una decisión tomada ni un plan — es el inventario de requisitos que cualquier formato futuro debería poder cubrir, incluyendo el vocabulario "vivo" y también una decisión consciente sobre qué hacer con el vocabulario declarado-pero-inerte (¿se elimina, se implementa por fin, o se documenta como explícitamente fuera de alcance?).
