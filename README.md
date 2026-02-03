·─ # 🐾 SOS Patitas Ilicitanas - Web Oficial

![SOS Patitas Hero Overlay](https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80) 
*(Captura provisional del estilo visual)*

> **"No compres, adopta un corazón."**

Este proyecto es una iniciativa voluntaria para **SOS Patitas Ilicitanas**, una protectora de animales que necesitaba digitalizar su proceso de adopción y donaciones.

## 🎯 Objetivo
El objetivo principal era crear una plataforma **emocional, rápida y fácil de gestionar** que convirtiera el tráfico de redes sociales (Instagram) en ayuda real (adopciones y donaciones).

## 🛠️ Tecnologías

Este proyecto sigue la filosofía **Jamstack** para garantizar rendimiento, seguridad y coste cero de mantenimiento.

- **Frontend**: HTML5 Semántico + **Tailwind CSS** (Diseño Mobile-First).
- **Lógica**: JavaScript Vanilla (Sin frameworks pesados) para renderizado dinámico.
- **CMS**: **Decap CMS** (antiguo Netlify CMS) pakkklkijuhygklhklhjlkjhlklññlkjkhgkijjikloñññlkij───hjjhghghjgjhgjhlñkñkk...............pñ .mmm.,mra gestión de contenido.
- **Backend**: Git-based (Los datos viven en el repositorio como archivos Markdown).

## 💡 Retos Técnicos

### Gestión de Contenido sin Base de Datos
El mayor reto fue permitir que los voluntarios (sin conocimientos técnicos) pudieran **subir fotos y fichas de animales** sin depender de un servidor tradicional o base de datos.

**Solución**:
Implementé **Decap CMS** conectado directamente al repositorio de GitHub. 
1. El voluntario rellena un formulario visual.
2. El CMS crea un archivo Markdown (`.md`) en la carpeta `content/animals/`.
3. Un script de JavaScript lee estos archivos y genera el catálogo en tiempo real.

### Optimización Mobile-First
Sabíamos que el 90% del tráfico vendría de Instagram. Diseñé la interfaz priorizando:
- **Navegación Táctil**: Menú hamburguesa y botones grandes.
- **Acciones Rápidas**: Botón flotante de WhatsApp y Bizum visible sin scroll.
- **Carga Inmediata**: Sin bloqueos de renderizado.

## 🚀 Cómo empezar (Local)

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/sos-patitas.git
   ```
2. **Servir la web**:
   Puedes usar cualquier servidor estático (Live Server, Python, etc).
   ```bash
   python3 -m http.server 8000
   ```
3. **Probar el CMS**:
   Para simular el backend sin subirlo a la nube:
   ```bash
   npx decap-server
   ```

## ❤️ Autoría

Desarrollado con cariño por **Alicia Ros**.
*Mira el archivo `humans.txt` para más info.*
