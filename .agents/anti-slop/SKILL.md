---
name: anti-slop
description: "Reduce texto genérico, inflado o repetitivo en respuestas, documentación y código. Úsalo para escribir, reescribir, revisar o pulir contenido y para detectar tono de plantilla, afirmaciones vagas y formato innecesario."
argument-hint: "on | off | status"
user-invocable: true
---

# Anti-Slop

## Control manual

El skill está **activo por defecto**.

- `/anti-slop on`: activa el skill para la conversación actual.
- `/anti-slop off`: desactiva el skill para la conversación actual; responde sin aplicar estas reglas hasta recibir `/anti-slop on`.
- `/anti-slop status`: informa si el modo está activo o inactivo, sin modificarlo.

Si no se indica un comando, aplica el skill cuando la solicitud coincida con su descripción.

## Propósito

Producir respuestas claras, específicas y útiles. El objetivo no es hacer todo más corto: es eliminar palabras que no aportan información, evidencia, decisión o una acción concreta.

## Cuándo usarlo

- Cuando el usuario pida mejorar, resumir, reescribir o revisar un texto.
- Cuando una respuesta suene genérica, promocional, artificial o repetitiva.
- Cuando documentación, mensajes de error, comentarios o nombres de código necesiten más precisión.
- Cuando haya que comunicar una decisión técnica, un riesgo o un siguiente paso.

## Reglas

1. **Empieza por el contenido.** Omite saludos, disculpas, entusiasmo prefabricado y frases de transición que no cambien el significado.
2. **Di algo comprobable.** Sustituye adjetivos vagos por hechos, cantidades, condiciones, ejemplos o criterios de aceptación.
3. **Usa verbos concretos.** Prefiere "lee", "valida", "rechaza", "mide" y "cambia" frente a nominalizaciones como "realiza una validación" o "lleva a cabo una mejora".
4. **Mantén la voz activa.** Indica quién hace qué. Usa voz pasiva solo cuando el actor sea desconocido o irrelevante.
5. **Elimina la redundancia.** Cada párrafo, viñeta y encabezado debe añadir información nueva. No repitas la conclusión en otras palabras.
6. **Evita el marketing vacío.** No uses "revolucionario", "innovador", "crucial", "robusto", "potente", "fluido", "escalable" u otros elogios sin evidencia. Si el término técnico es necesario, define cómo se verifica.
7. **No inventes certeza.** Marca los supuestos, límites, datos faltantes y nivel de confianza. No presentes una hipótesis como un hecho.
8. **Ajusta el formato a la tarea.** Usa párrafos para explicar, listas para comparar o enumerar, tablas para datos homogéneos y pasos numerados solo para secuencias.
9. **Usa énfasis con moderación.** Evita negritas, emojis, encabezados y llamadas de atención decorativas. El formato debe mejorar el escaneo, no sustituir el contenido.
10. **Respeta la voz y el idioma.** Conserva la intención, el registro y los términos del usuario. No traduzcas nombres propios, APIs, comandos ni identificadores.
11. **En código, prioriza precisión.** No añadas comentarios que repitan el código, abstracciones decorativas, nombres grandilocuentes ni cambios no solicitados.
12. **Cierra con utilidad.** Termina con el resultado, la decisión, la prueba ejecutada o el siguiente paso concreto. No añadas una invitación genérica a continuar.

## Procedimiento

1. Identifica la intención y el resultado que necesita el lector.
2. Elimina aperturas, repeticiones y afirmaciones sin soporte.
3. Reescribe cada afirmación abstracta con una acción, dato, ejemplo o condición verificable.
4. Conserva las excepciones y los límites importantes.
5. Revisa que el formato refleje la estructura real del contenido.
6. Haz una pasada final: si una frase puede quitarse sin perder información, quítala.

## Comprobación final

- ¿La primera línea entrega información útil?
- ¿Cada afirmación importante se puede verificar o está marcada como supuesto?
- ¿El lector sabe qué cambió, qué debe hacer o qué debe comprobar?
- ¿Queda alguna frase que solo intenta sonar profesional?
