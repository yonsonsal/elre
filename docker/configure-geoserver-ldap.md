# Configurar LDAP en GeoServer

GeoServer está funcionando correctamente con las capas publicadas. Ahora necesitas configurar LDAP manualmente desde la interfaz web.

## 🌐 Acceso a GeoServer

1. Abrir en el navegador: http://localhost:8080/geoserver
2. Login: `admin` / `geoserver`

## 🔐 Configurar Autenticación LDAP

### Paso 1: Instalar extensión LDAP (si es necesario)

La imagen de Kartoza ya incluye soporte LDAP, pero si no aparece:

1. Ir a **Security** → **Authentication**
2. Si no ves opción "LDAP", necesitas instalar la extensión

### Paso 2: Agregar Authentication Provider LDAP

1. Ir a **Security** → **Authentication**
2. Scroll down hasta **Authentication Providers**
3. Click en **Add new**
4. Seleccionar **LDAP**

### Paso 3: Configurar el Provider LDAP

Usa esta configuración:

**Name**: `ldap-plugineta`

**LDAP Server URL**: `ldap://ldap:389/dc=plugineta,dc=local`

**TLS**: ❌ (deshabilitado para desarrollo)

**User DN pattern**: `uid={0},ou=users,dc=plugineta,dc=local`

**User filter**: `uid={0}`

**User format**: `{0}`

**Bind before group search**: ✅ (habilitado)

**User search base**: `ou=users,dc=plugineta,dc=local`

**User search filter**: `(uid={0})`

**Group search base**: `ou=groups,dc=plugineta,dc=local`

**Group search filter**: `(uniqueMember=uid={0},ou=users,dc=plugineta,dc=local)`

**Admin group**: `gis_admins`

**Group admin service**: ✅ (habilitado)

### Paso 4: Configurar Authentication Filter Chain

1. En la misma página de **Security** → **Authentication**
2. En **Filter Chains**, editar la cadena **default**
3. Agregar `ldap-plugineta` antes de `basic`
4. El orden debería ser:
   - `ldap-plugineta`
   - `basic`
   - `anonymous`
5. **Save**

### Paso 5: Configurar Role Service LDAP (Opcional)

1. Ir a **Security** → **Users, Groups and Roles**
2. En **Role Services**, click **Add new**
3. Seleccionar **LDAP**
4. Configurar:
   - **Name**: `ldap-roles`
   - **Server URL**: `ldap://ldap:389/dc=plugineta,dc=local`
   - **Group search base**: `ou=groups,dc=plugineta,dc=local`
   - **Group name**: `cn`
   - **All groups search filter**: `(objectClass=groupOfUniqueNames)`
   - **Group user membership attribute**: `uniqueMember`
5. **Save**

## 👥 Usuarios de Prueba

Una vez configurado, puedes probar con estos usuarios:

| Usuario | Contraseña | Grupo | Permisos |
|---------|-----------|-------|----------|
| `admin_gis` | `admin123` | gis_admins | Administrador completo |
| `editor_gis` | `editor123` | gis_editors | Edición de capas |
| `viewer_gis` | `viewer123` | gis_viewers | Solo lectura |

## ✅ Verificar Configuración

1. Logout de GeoServer
2. Intentar login con `admin_gis` / `admin123`
3. Si funciona, LDAP está correctamente configurado

## 🔍 Troubleshooting

### Error: "Cannot connect to LDAP server"

Verifica que el contenedor LDAP esté corriendo:
```bash
docker-compose ps ldap
```

Verifica conectividad desde GeoServer:
```bash
docker exec plugineta-geoserver ldapsearch -x -H ldap://ldap:389 -b dc=plugineta,dc=local -D "cn=admin,dc=plugineta,dc=local" -w admin_password
```

### Error: "User not found"

Verifica que los usuarios existan en LDAP:
```bash
docker exec plugineta-ldap ldapsearch -x -b "ou=users,dc=plugineta,dc=local"
```

### Error: "Group not found"

Verifica la configuración de grupos:
```bash
docker exec plugineta-ldap ldapsearch -x -b "ou=groups,dc=plugineta,dc=local"
```

## 📚 Referencias

- [GeoServer LDAP Authentication](https://docs.geoserver.org/stable/en/user/security/tutorials/ldap/index.html)
- [Kartoza GeoServer Docker](https://github.com/kartoza/docker-geoserver)
