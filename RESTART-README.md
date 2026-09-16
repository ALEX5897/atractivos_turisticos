# Scripts de Reinicio - Sistema Quito Turismo

## 📋 Descripción

Scripts automatizados para reiniciar completamente el sistema Quito Turismo, deteniendo procesos existentes y reiniciando servicios.

## 🚀 Scripts Disponibles

### Windows
- **`restart-system.bat`** - Script básico por lotes
- **`restart-system.ps1`** - Script avanzado de PowerShell

### Linux/Mac
- **`restart-system.sh`** - Script para sistemas Unix

## 🛠️ Uso

### Windows (PowerShell)
```powershell
# Reinicio básico
.\restart-system.ps1

# Reinicio forzando terminación de procesos
.\restart-system.ps1 -Force

# Reinicio sin esperar confirmación
.\restart-system.ps1 -NoWait
```

### Windows (CMD)
```cmd
restart-system.bat
```

### Linux/Mac
```bash
chmod +x restart-system.sh
./restart-system.sh
```

## 🔧 Funcionalidades

### ✅ Automáticas
- **Detección de procesos**: Identifica y detiene procesos de Node.js y Python
- **Verificación de puertos**: Confirma que los puertos 3000 y 5174 estén disponibles
- **Reinicio de servicios**: Inicia backend y frontend automáticamente
- **Monitoreo**: Muestra estado de jobs/procesos

### 🎯 Parámetros (PowerShell)
- **`-Force`**: Fuerza la terminación de procesos que no responden
- **`-NoWait`**: No espera confirmación del usuario al finalizar

## 📊 Puertos Utilizados

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5174`

## ⚠️ Notas Importantes

1. **Backup**: Se recomienda hacer backup de datos importantes antes del reinicio
2. **Dependencias**: Asegúrate de que Node.js y npm estén instalados
3. **Puertos**: Los scripts verifican que los puertos estén libres antes de iniciar
4. **Permisos**: En Linux/Mac, otorga permisos de ejecución al script

## 🔍 Solución de Problemas

### Puertos ocupados
```bash
# Verificar qué proceso usa un puerto
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows
```

### Procesos que no terminan
```powershell
# Windows - ver procesos
Get-Process -Name node,python

# Forzar terminación
Stop-Process -Name node,python -Force
```

## 📝 Logs y Monitoreo

Los scripts muestran información detallada sobre:
- Procesos detenidos
- Puertos verificados
- Servicios iniciados
- IDs de procesos/jobs
- Errores encontrados

## 🆘 Soporte

Si encuentras problemas:
1. Verifica que Node.js esté instalado: `node --version`
2. Confirma que las dependencias estén instaladas: `npm install`
3. Revisa que los puertos estén libres
4. Ejecuta con permisos de administrador/sudo si es necesario