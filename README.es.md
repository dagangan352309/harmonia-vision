# Harmonia Vision

> **[Read in English](README.md)**

**Configuración personalizada del editor para comodidad visual**

Harmonia Vision es una extensión de VS Code que te ayuda a calibrar la legibilidad del editor y reducir la fatiga visual mediante recomendaciones de configuración ergonómica. Ya sea que tengas miopía, astigmatismo, o simplemente experimentes cansancio ocular después de largas sesiones de programación, esta herramienta proporciona configuraciones personalizadas para mejorar tu comodidad al programar.

## Características

- **Evaluación de Perfil Visual** - Selecciona las condiciones que afectan tu visión (miopía, astigmatismo, fatiga ocular, sensibilidad a la luz, etc.).
- **Entrada de Receta Opcional** - Ingresa tu receta de lentes (Esfera/Cilindro) para recomendaciones más precisas.
- **Recomendaciones Inteligentes** - Obtén configuraciones personalizadas basadas en tu perfil visual.
- **Vista Previa en Vivo** - Compara la configuración original vs. la recomendada lado a lado antes de aplicar.
- **Modelo de Aplicación Segura** - Previsualiza cambios temporalmente, guarda cuando estés satisfecho o revierte instantáneamente.
- **Recordatorios de Descanso** - Sigue la regla 20-20-20 con recordatorios personalizables y cuenta regresiva en la barra de estado.
- **Agnóstico de Tema** - Funciona con cualquier tema de VS Code.
- **Soporte Bilingüe** - Disponible en inglés y español (auto-detectado).

## Instalación

1. Abre VS Code.
2. Ve a Extensiones (Ctrl+Shift+X / Cmd+Shift+X).
3. Busca "Harmonia Vision".
4. Haz clic en Instalar.

O instala desde la línea de comandos:

```bash
code --install-extension AgusRdz.harmonia-vision

```

## Uso

1. Abre la Paleta de Comandos (Ctrl+Shift+P / Cmd+Shift+P).
2. Escribe "Harmonia Vision: Open Calibrator".
3. Selecciona tus condiciones visuales.
4. Opcionalmente ingresa los valores de tu receta.
5. Haz clic en "Generar Recomendaciones".
6. Usa los controles deslizantes para ajustar la configuración.
7. Previsualiza los cambios en la comparación lado a lado.
8. Haz clic en "Vista Previa" para probar en tu editor.
9. Haz clic en "Guardar" para aplicar permanentemente, o "Revertir" para volver atrás.

## Configuraciones del Editor Ajustadas

Harmonia Vision puede ajustar las siguientes configuraciones del editor de VS Code:

| Configuración                | Descripción                   | Rango                        |
| ---------------------------- | ----------------------------- | ---------------------------- |
| `editor.fontSize`            | Tamaño de fuente en píxeles   | 12-32px                      |
| `editor.lineHeight`          | Proporción de altura de línea | Auto a 2.2x                  |
| `editor.letterSpacing`       | Espacio entre letras          | 0-1.5px                      |
| `editor.fontWeight`          | Grosor de fuente              | 300-700                      |
| `editor.cursorWidth`         | Ancho del cursor en píxeles   | 1-5px                        |
| `editor.renderLineHighlight` | Resaltado de línea actual     | Ninguno, Margen, Línea, Todo |

## Recordatorios de Descanso (Regla 20-20-20)

La regla 20-20-20 es una práctica simple para reducir la fatiga ocular: cada 20 minutos, mira algo a 6 metros de distancia durante 20 segundos.

Harmonia Vision incluye recordatorios de descanso integrados para ayudarte a seguir esta regla:

### Características

- **Intervalos Personalizables** - Configura intervalos de trabajo de 15-60 minutos
- **Duración del Descanso** - Configura descansos de 10-60 segundos
- **Cuenta Regresiva en Barra de Estado** - Ve el tiempo restante hasta tu próximo descanso
- **Consejos Aleatorios** - Cada recordatorio incluye un consejo útil para la salud ocular
- **Detección de Inactividad** - El temporizador se pausa automáticamente cuando no estás programando activamente
- **Opción de Posponer** - Retrasa un recordatorio por 5 minutos cuando lo necesites

### Comandos

| Comando                                                         | Descripción                                   |
| --------------------------------------------------------------- | --------------------------------------------- |
| `Harmonia Vision: Activar/Desactivar Recordatorios de Descanso` | Activar o desactivar los recordatorios        |
| `Harmonia Vision: Tomar Descanso Ahora`                         | Activar un descanso inmediato                 |
| `Harmonia Vision: Posponer Descanso`                            | Posponer el recordatorio actual por 5 minutos |

### Configuraciones

Configura en Configuración de VS Code o a través del panel Calibrador:

| Configuración                               | Descripción                                 | Predeterminado |
| ------------------------------------------- | ------------------------------------------- | -------------- |
| `harmoniaVision.pause.enabled`              | Activar recordatorios de descanso           | `false`        |
| `harmoniaVision.pause.workIntervalMinutes`  | Minutos entre descansos (15-60)             | `20`           |
| `harmoniaVision.pause.breakDurationSeconds` | Duración del descanso en segundos (10-60)   | `20`           |
| `harmoniaVision.pause.showStatusBar`        | Mostrar cuenta regresiva en barra de estado | `true`         |
| `harmoniaVision.pause.pauseWhenIdle`        | Pausar temporizador cuando está inactivo    | `true`         |

## Entendiendo los Valores de la Receta

### Esfera (ESF)

La potencia esférica corrige la miopía o hipermetropía:

- **Valores negativos (-)**: Corrigen miopía (ej., -2.00).
- **Valores positivos (+)**: Corrigen hipermetropía (ej., +1.50).

### Cilindro (CIL)

La potencia cilíndrica corrige el astigmatismo:

- Solo presente si tienes astigmatismo.
- Puede ser negativo o positivo dependiendo de la notación usada.
- Se encuentra en tu receta de lentes.

**Nota**: Estos valores son opcionales y solo se usan para proporcionar recomendaciones más precisas. Nunca se almacenan ni se transmiten.

## Aviso Importante

Esta herramienta está diseñada para mejorar la comodidad visual al programar. **NO** es un sustituto del cuidado profesional de la vista. Si experimentas fatiga ocular persistente, dolores de cabeza o problemas de visión, consulta a un optometrista u oftalmólogo.

Los exámenes oculares regulares son esenciales para mantener una buena salud visual, especialmente para quienes pasan largas horas frente a pantallas.

## Opciones del Perfil Visual Explicadas

Cada condición en el Perfil Visual ajusta configuraciones específicas para abordar desafíos visuales comunes:

### Miopía

**Qué hace:**

- Aumenta el tamaño de fuente según la severidad (rango 16-22px).
- Amplía el cursor para facilitar el seguimiento (3px).

**Por qué:** El texto más grande reduce la necesidad de inclinarse hacia la pantalla y disminuye la tensión del músculo ciliar. Si proporcionas el valor de Esfera de tu receta, la recomendación se calibra con mayor precisión.

### Astigmatismo

**Qué hace:**

- Aumenta el espaciado entre letras (0.2-0.6px) para separar caracteres.
- Aumenta la altura de línea para mejor seguimiento.

**Por qué:** El astigmatismo causa que los caracteres se difuminen entre sí, especialmente formas similares como `c/e`, `r/n`, `0/O`. El espaciado adicional reduce la superposición y mejora la legibilidad.

### Fatiga Ocular

**Qué hace:**

- Añade +1px al tamaño de fuente.
- Asegura una altura de línea de al menos 1.6x para código "respirable".

**Por qué:** El espaciado adecuado entre líneas reduce el esfuerzo de escaneo durante largas sesiones de programación y ayuda a que tus ojos descansen entre líneas.

### Visión Doble / Fantasma

**Qué hace:**

- Añade +1px al tamaño de fuente.
- Puede aumentar el grosor de fuente a 500 (medio) en casos severos.
- Amplía el cursor (3px).

**Por qué:** El texto más grande y ligeramente más grueso mejora la definición de bordes cuando percibes imágenes dobles o efectos fantasma.

### Sensibilidad a la Luz (Fotofobia)

**Qué hace:**

- Mantiene el grosor de fuente en 400 (normal), anulando recomendaciones más pesadas.

**Por qué:** Los grosores de fuente más pesados aparecen más brillantes y pueden causar molestias. El grosor normal reduce el brillo percibido. _Para mejores resultados, combina con un tema oscuro._

### Aglomeración Visual

**Qué hace:**

- Aumenta el espaciado entre letras a al menos 0.5px.
- Aumenta la altura de línea para mejor separación.

**Por qué:** Cuando el código denso se siente abrumador o los caracteres parecen "amontonarse", el espaciado adicional crea espacio visual para respirar.

---

**Consejo:** Puedes seleccionar múltiples condiciones. El motor combina sus efectos de manera inteligente (ej., Fotofobia anulará grosores de fuente más pesados incluso si Visión Doble/Fantasma también está seleccionado).

## Preview

![Preview](https://raw.githubusercontent.com/AgusRdz/harmonia-vision/master/images/harmonia-vision.png)

## Privacidad

- No se recopilan, transmiten ni registran datos.
- Los valores de receta son opcionales y solo se usan localmente.
- Todas las configuraciones se almacenan en tu configuración de usuario de VS Code.
- Sin telemetría ni analíticas.

## Requisitos

- VS Code 1.85.0 o superior.

## Contribuciones

¡Las contribuciones son bienvenidas! No dudes en enviar issues o pull requests en [GitHub](https://github.com/AgusRdz/harmonia-vision).

## Licencia

Licencia MIT - ver [LICENSE.txt](https://www.google.com/search?q=LICENSE.txt) para detalles.

## Autor

Creado por [AgusRdz](https://github.com/AgusRdz)

---

**¡Disfruta programando cómodamente!**
