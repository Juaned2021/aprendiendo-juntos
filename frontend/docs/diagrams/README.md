# Diagramas PlantUML - Plataforma Escolar

Este directorio contiene los diagramas PlantUML individuales para la documentación de arquitectura del sistema.

## Diagramas Disponibles

1. **01-diagrama-contexto.puml** - Diagrama de Contexto
   - Vista de alto nivel del sistema
   - Actores externos y sus interacciones
   - Flujo general de autenticación

2. **02-diagrama-contenedores.puml** - Diagrama de Contenedores
   - Estructura interna de Frontend React
   - Estructura interna de API .NET Core
   - Estructura interna de Supabase PostgreSQL
   - Comunicación entre contenedores

3. **03-diagrama-componentes.puml** - Diagrama de Componentes
   - Componentes backend (Controllers, Services, Repositories)
   - Componentes frontend (Pages, Contexts, API Client)
   - Interfaces y dependencias
   - Principios SOLID aplicados

4. **04-diagrama-codigo.puml** - Diagrama de Código (Clases)
   - Clases principales del sistema
   - Métodos y atributos
   - Relaciones entre clases
   - Interfaces e implementaciones

5. **05-diagrama-er.puml** - Diagrama Entidad-Relación
   - Estructura de base de datos
   - Tablas, atributos y tipos de datos
   - Relaciones (PK/FK)
   - Restricciones y validaciones

## Cómo Renderizar los Diagramas

### Opción 1: PlantUML Online (Recomendado para vista rápida)
1. Visita [PlantText](https://www.planttext.com/)
2. Copia el contenido del archivo `.puml`
3. Pega en el editor
4. El diagrama se renderiza automáticamente

### Opción 2: Visual Studio Code
1. Instala la extensión "PlantUML" de jebbs
2. Abre cualquier archivo `.puml`
3. Presiona `Alt+D` para previsualizar
4. O usa el comando "PlantUML: Preview Current Diagram"

### Opción 3: IntelliJ IDEA / PyCharm
1. Instala el plugin "PlantUML integration"
2. Abre el archivo `.puml`
3. Haz clic derecho → "Show PlantUML Diagram"

### Opción 4: Línea de comandos
```bash
# Instalar PlantUML (requiere Java)
brew install plantuml  # macOS
choco install plantuml # Windows

# Renderizar a PNG
plantuml 01-diagrama-contexto.puml

# Renderizar a SVG
plantuml -tsvg 01-diagrama-contexto.puml

# Renderizar todos los diagramas
plantuml *.puml
```

### Opción 5: Docker
```bash
docker run --rm -v %cd%:/data plantuml plantuml /data/01-diagrama-contexto.puml
```

## Exportar a Diferentes Formatos

PlantUML soporta múltiples formatos de salida:
- **PNG** - Imagen raster (por defecto)
- **SVG** - Gráfico vectorial (escalable)
- **PDF** - Documento PDF
- **EPS** - Encapsulated PostScript
- **LaTeX** - Código LaTeX

```bash
# Ejemplos
plantuml -tpng 01-diagrama-contexto.puml
plantuml -tsvg 01-diagrama-contexto.puml
plantuml -tpdf 01-diagrama-contexto.puml
```

## Integración con Documentación

### Markdown
```markdown
![Diagrama de Contexto](./diagrams/01-diagrama-contexto.png)
```

### HTML
```html
<img src="./diagrams/01-diagrama-contexto.svg" alt="Diagrama de Contexto">
```

### AsciiDoc
```asciidoc
image::diagrams/01-diagrama-contexto.png[Diagrama de Contexto]
```

## Personalización

Puedes personalizar los diagramas modificando:
- **Colores:** Cambia los códigos hexadecimales en `skinparam`
- **Temas:** Usa `!theme` con diferentes temas (plain, blue, gray, etc.)
- **Estilos:** Modifica `skinparam componentStyle`, `skinparam class`, etc.
- **Layout:** Ajusta la posición de componentes con `left`, `right`, `up`, `down`

## Recursos Útiles

- [Documentación oficial de PlantUML](https://plantuml.com/)
- [PlantUML Language Reference](https://plantuml.com/starting)
- [PlantUML Examples](https://plantuml.com/examples)
- [PlantText Editor Online](https://www.planttext.com/)

## Notas

- Todos los diagramas usan sintaxis moderna de PlantUML
- Los colores están optimizados para impresión y pantalla
- Los diagramas son responsivos y escalables (SVG)
- Se incluyen notas explicativas en cada diagrama
- Los estereotipos UML se usan para claridad

## Soporte

Si encuentras algún problema al renderizar los diagramas:
1. Verifica que tienes Java instalado (para línea de comandos)
2. Asegúrate de usar una versión reciente de PlantUML
3. Verifica la sintaxis en [PlantText](https://www.planttext.com/)
4. Consulta la documentación oficial de PlantUML

---

**Generado:** Mayo 2026  
**Versión:** 1.0  
**Arquitecto:** Senior Software Architect
