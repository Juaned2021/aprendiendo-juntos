# Documentación Completa de Arquitectura de Software
## Plataforma Escolar - Sistema Web Moderno

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Arquitecto:** Senior Software Architect  
**Tecnologías:** React + ASP.NET Core + Supabase

---

## Índice
1. [Diagrama de Contexto](#1-diagrama-de-contexto)
2. [Diagrama de Contenedores](#2-diagrama-de-contenedores)
3. [Diagrama de Componentes](#3-diagrama-de-componentes)
4. [Diagrama de Código](#4-diagrama-de-código)
5. [Diagrama Modelo E-R](#5-diagrama-modelo-e-r)
6. [Recomendaciones de Arquitectura](#6-recomendaciones-de-arquitectura)
7. [Buenas Prácticas de Seguridad](#7-buenas-prácticas-de-seguridad)
8. [Mejoras Futuras](#8-mejoras-futuras)

---

## 1. Diagrama de Contexto

### Explicación Técnica Completa

El **Diagrama de Contexto** es el diagrama de más alto nivel en la arquitectura de software y muestra el sistema como una caja negra que interactúa con actores externos. Este diagrama representa el límite del sistema y todas las interacciones con el mundo exterior.

**Elementos Principales:**

- **Usuario Final:** Actor principal que interactúa con el sistema a través del frontend. Puede ser administrador, profesor, alumno o padre.
- **Frontend React:** Aplicación web SPA (Single Page Application) que ejecuta en el navegador del cliente. Maneja la interfaz de usuario, validaciones de cliente, routing y estado local.
- **API .NET:** Backend RESTful que implementa la lógica de negocio, autenticación, autorización y orquestación de datos. Actúa como intermediario entre el frontend y la base de datos.
- **Supabase:** Servicio de base de datos PostgreSQL en la nube que proporciona persistencia de datos, autenticación adicional y servicios en tiempo real.
- **Servicios Externos:** Integraciones opcionales como servicios de email, notificaciones push, pagos, etc.

**Flujo de Autenticación JWT:**

1. El usuario ingresa credenciales en el frontend
2. Frontend envía POST /api/auth/login a la API .NET
3. API valida credenciales contra Supabase
4. API genera JWT token (Access Token + Refresh Token)
5. API retorna tokens al frontend
6. Frontend almacena tokens (localStorage/cookies)
7. Frontend incluye Access Token en header Authorization: Bearer {token}
8. API valida token en cada solicitud protegida
9. Cuando expira Access Token, frontend usa Refresh Token para obtener nuevos tokens

### Explicación Sencilla para Estudiantes

Imagina el sistema como un edificio con diferentes departamentos:

- **Usuario:** Es la persona que entra al edificio (alumno, profesor, administrador)
- **Frontend React:** Es la recepción del edificio - donde ves las pantallas, botones y formularios bonitos
- **API .NET:** Es el cerebro del edificio - procesa todas las solicitudes, decide qué hacer y mantiene las reglas
- **Supabase:** Es el archivo del edificio - donde se guarda toda la información de forma permanente

Cuando un usuario quiere hacer algo (como ver sus calificaciones):
1. Pide información en la recepción (Frontend)
2. La recepción llama al cerebro (API)
3. El cerebro busca en el archivo (Supabase)
4. El cerebro devuelve la información a la recepción
5. La recepción muestra la información al usuario

### Objetivo del Diagrama

- **Definir el alcance del sistema:** Qué está incluido y qué está fuera
- **Identificar actores externos:** Quiénes interactúan con el sistema
- **Establecer interfaces:** Cómo se comunican los componentes
- **Documentar flujos principales:** Autenticación, operaciones CRUD
- **Servir como punto de partida:** Para diagramas más detallados

### Qué Representa Cada Componente

| Componente | Responsabilidad | Tecnología |
|------------|-----------------|------------|
| **Usuario** | Iniciar sesiones, navegar, realizar operaciones | Navegador web |
| **Frontend React** | UI/UX, routing cliente, validaciones, estado local | React.js, Axios |
| **API .NET** | Lógica de negocio, autenticación, autorización, orquestación | ASP.NET Core |
| **Supabase** | Persistencia de datos, relaciones, restricciones | PostgreSQL |
| **Servicios Externos** | Email, notificaciones, pagos (opcional) | APIs de terceros |

### Flujo del Sistema

**Flujo de Login:**
```
Usuario → Frontend → API .NET → Supabase → API .NET → Frontend → Usuario
(credenciales) (POST) (validar) (verificar) (generar JWT) (token) (almacenar)
```

**Flujo de Operación CRUD:**
```
Usuario → Frontend → API .NET → Supabase → API .NET → Frontend → Usuario
(solicitud) (HTTP) (procesar) (query) (respuesta) (JSON) (mostrar)
```

**Flujo de Error:**
```
Usuario → Frontend → API .NET → Frontend → Usuario
(solicitud) (HTTP) (error 4xx/5xx) (mensaje error) (alerta)
```

### Buenas Prácticas Aplicadas

- **Separación de responsabilidades:** Cada capa tiene una función única
- **Autenticación stateless:** JWT no requiere estado en servidor
- **HTTPS obligatorio:** Todo el tráfico está encriptado
- **Validación en múltiples capas:** Frontend y Backend validan
- **Tokens con expiración:** Access tokens cortos, refresh tokens largos
- **Principio de mínimo privilegio:** Usuarios solo acceden a lo necesario
- **Logging y monitoreo:** Todas las operaciones se registran

### Código PlantUML Completo

```plantuml
@startuml DiagramaContexto
!theme plain
skinparam backgroundColor #F8F9FA
skinparam componentStyle rectangle
skinparam rectangle {
    BackgroundColor #E3F2FD
    BorderColor #1976D2
    FontColor #0D47A1
}
skinparam actor {
    BackgroundColor #FFF3E0
    BorderColor #F57C00
}

title Diagrama de Contexto - Plataforma Escolar
note right of title
  Vista de alto nivel del sistema
  y sus interacciones externas
end note

actor "Usuario Final" as User <<actor>>
actor "Administrador" as Admin <<actor>>
actor "Profesor" as Teacher <<actor>>
actor "Alumno" as Student <<actor>>

package "Sistema Plataforma Escolar" {
    component "Frontend React" as Frontend {
        [UI Components]
        [State Management]
        [Routing]
        [API Client]
    }
    
    component "API .NET Core" as API {
        [Controllers]
        [Services]
        [Repositories]
        [JWT Middleware]
        [DTOs]
    }
    
    database "Supabase PostgreSQL" as DB {
        [Tablas de Datos]
        [Relaciones]
        [Restricciones]
    }
}

package "Servicios Externos" {
    component "Email Service" as Email
    component "Notification Service" as Notify
    component "Payment Gateway" as Payment
}

' Relaciones de autenticación
User --> Frontend : Interactúa\nNavegador
Frontend --> API : HTTPS\nREST API
API --> DB : PostgreSQL\nEntity Framework

' Relaciones de usuarios específicos
Admin --> Frontend : Gestión\nAdministrativa
Teacher --> Frontend : Gestión\nAcadémica
Student --> Frontend : Consulta\nPersonal

' Relaciones con servicios externos
API --> Email : Envío\nNotificaciones
API --> Notify : Push\nNotifications
API --> Payment : Procesamiento\nPagos

' Notas de flujo
note right of Frontend
  SPA - Single Page Application
  React.js + Axios
  Manejo de JWT tokens
  Routing cliente
end note

note right of API
  ASP.NET Core Web API
  Arquitectura por capas
  Autenticación JWT
  Autorización por roles
  Entity Framework Core
end note

note right of DB
  Supabase PostgreSQL
  Persistencia de datos
  Relaciones y restricciones
  Backup automático
end note

note bottom of User
  Roles:
  - Administrador
  - Profesor
  - Alumno
  - Padre/Tutor
end note

legend right
  |= Color |= Descripción |
  | <back:#E3F2FD> | Frontend React |
  | <back:#FFF3E0> | Actores del sistema |
  | <back:#FFFFFF> | Backend y Base de Datos |
endlegend

@enduml
```

---

## 2. Diagrama de Contenedores

### Explicación Técnica Completa

El **Diagrama de Contenedores** muestra la estructura interna de cada componente principal del sistema, desglosando las capas y módulos que conforman el frontend, backend y base de datos.

**Contenedor Frontend React:**

- **UI Components:** Componentes reutilizables (Button, Input, Card, Modal, Table)
- **Pages/Views:** Páginas principales (Login, Dashboard, Horarios, Calificaciones)
- **Services API:** Cliente HTTP configurado con Axios, interceptores para tokens
- **State Management:** Context API o Redux para estado global (auth, user, theme)
- **Routing:** React Router para navegación SPA (rutas protegidas, públicas)
- **Hooks:** Custom hooks para lógica reutilizable (useAuth, useAPI, useForm)
- **Utils:** Funciones helper (formateo de fechas, validaciones, formateo de moneda)

**Contenedor API .NET:**

- **Controllers:** Endpoints RESTful (AuthController, UserController, HorarioController)
- **Services:** Lógica de negocio (AuthService, UserService, HorarioService)
- **Repositories:** Acceso a datos (UserRepository, HorarioRepository)
- **DTOs:** Data Transfer Objects para validación (LoginDTO, RegisterDTO)
- **Middleware:** Pipeline de solicitud (JWT Authentication, CORS, Logging)
- **DbContext:** Configuración de Entity Framework (AppDbContext)
- **Configuration:** appsettings.json (connection strings, JWT settings)
- **Validators:** FluentValidation para validaciones complejas

**Contenedor Supabase:**

- **PostgreSQL Engine:** Motor de base de datos relacional
- **Tablas:** usuarios, roles, horarios, calificaciones, asignaturas
- **Índices:** Optimización de consultas
- **Triggers:** Automatización de eventos (auditoría, timestamps)
- **Stored Procedures:** Lógica en base de datos (consultas complejas)
- **Views:** Vistas materializadas para reportes
- **Functions:** Funciones SQL personalizadas
- **Security Policies:** Row Level Security (RLS) de Supabase

### Explicación Sencilla para Estudiantes

El diagrama de contenedores es como abrir cada departamento del edificio para ver qué hay dentro:

**Frontend React (La Recepción):**
- **UI Components:** Son como los muebles y decoraciones (botones, cajas de texto)
- **Pages:** Son las diferentes habitaciones (sala de login, sala de dashboard)
- **Services API:** Es el teléfono que llama al cerebro
- **State Management:** Es la memoria de la recepción (recuerda quién está logueado)
- **Routing:** Es el mapa que indica cómo moverse entre habitaciones

**API .NET (El Cerebro):**
- **Controllers:** Son los recepcionistas que reciben las llamadas
- **Services:** Son los expertos que saben cómo resolver problemas
- **Repositories:** Son los archiveros que buscan información
- **DTOs:** Son los formularios que deben llenarse correctamente
- **Middleware:** Son los guardias de seguridad que revisan identificaciones

**Supabase (El Archivo):**
- **Tablas:** Son los archiveros con carpetas organizadas
- **Índices:** Son las etiquetas en las carpetas para encontrar rápido
- **Triggers:** Son alarmas automáticas que avisan cuando algo cambia
- **Views:** Son reportes pre-preparados

### Objetivo del Diagrama

- **Mostrar estructura interna:** Cómo está organizado cada componente
- **Identificar capas:** Separación de responsabilidades dentro de cada contenedor
- **Documentar comunicación:** Cómo se comunican las capas internamente
- **Facilitar mantenimiento:** Entender dónde está cada funcionalidad
- **Guía para desarrolladores:** Mapa para navegar el código

### Qué Representa Cada Contenedor

#### Frontend React
| Capa | Responsabilidad | Tecnologías |
|------|-----------------|-------------|
| **UI Components** | Componentes atómicos reutilizables | React, CSS Modules |
| **Pages/Views** | Páginas completas de la aplicación | React Router |
| **Services API** | Cliente HTTP con interceptores | Axios |
| **State Management** | Estado global de la aplicación | Context API/Redux |
| **Routing** | Navegación SPA y rutas protegidas | React Router v6 |
| **Hooks** | Lógica reutilizable | Custom Hooks |
| **Utils** | Funciones helper | JavaScript/TypeScript |

#### API .NET
| Capa | Responsabilidad | Tecnologías |
|------|-----------------|-------------|
| **Controllers** | Endpoints RESTful y validación básica | ASP.NET Core MVC |
| **Services** | Lógica de negocio y reglas | C# Classes |
| **Repositories** | Acceso a datos con EF Core | Entity Framework Core |
| **DTOs** | Transferencia y validación de datos | C# Records/Classes |
| **Middleware** | Pipeline de HTTP | ASP.NET Core Middleware |
| **DbContext** | Configuración de ORM | EF Core DbContext |
| **Validators** | Validaciones complejas | FluentValidation |

#### Supabase
| Capa | Responsabilidad | Tecnologías |
|------|-----------------|-------------|
| **PostgreSQL** | Motor de base de datos | PostgreSQL 15+ |
| **Tablas** | Almacenamiento estructurado | SQL Tables |
| **Índices** | Optimización de consultas | B-Tree Indexes |
| **Triggers** | Automatización de eventos | PL/pgSQL |
| **Stored Procedures** | Lógica en base de datos | SQL Functions |
| **RLS** | Seguridad a nivel de fila | Supabase RLS |

### Flujo del Sistema

**Flujo de Solicitud HTTP:**
```
Frontend
  ↓ (Axios Interceptor - Agregar Token)
API Middleware (CORS, Logging, Exception Handling)
  ↓ (JWT Authentication - Validar Token)
Controller (Validar DTO, Mapear a Service)
  ↓ (Lógica de Negocio)
Service (Aplicar reglas, llamar Repository)
  ↓ (Query SQL)
Repository (EF Core - Generar SQL)
  ↓ (PostgreSQL)
Supabase (Ejecutar query, retornar datos)
  ↓ (Mapeo a Entidades)
Repository (Retornar entidades)
  ↓ (Transformación a DTOs)
Service (Retornar DTOs)
  ↓ (HTTP Response)
Controller (Retornar IActionResult)
  ↓ (JSON)
Frontend (Recibir respuesta, actualizar estado)
  ↓ (Renderizar UI)
Usuario (Ver resultado)
```

### Buenas Prácticas Aplicadas

- **Arquitectura por capas:** Separación clara de responsabilidades
- **Dependency Injection:** Inyección de dependencias en .NET
- **DTOs:** Separación entre entidades de BD y API
- **Middleware pipeline:** Procesamiento modular de solicitudes
- **Repository Pattern:** Abstracción del acceso a datos
- **Service Layer:** Lógica de negocio separada de controladores
- **Component composition:** React components reutilizables
- **Custom hooks:** Lógica reutilizable en React
- **Row Level Security:** Seguridad en base de datos
- **Connection pooling:** Optimización de conexiones a BD

### Código PlantUML Completo

```plantuml
@startuml DiagramaContenedores
!theme plain
skinparam backgroundColor #F8F9FA
skinparam componentStyle rectangle

title Diagrama de Contenedores - Plataforma Escolar
note right of title
  Estructura interna de cada componente
  principal del sistema
end note

' ==================== FRONTEND REACT ====================
package "Frontend React Application" <<Container>> {
    skinparam rectangle {
        BackgroundColor #E3F2FD
        BorderColor #1976D2
        FontColor #0D47A1
    }
    
    component "UI Components" as UI {
        [Button]
        [Input]
        [Card]
        [Modal]
        [Table]
        [Form]
    }
    
    component "Pages/Views" as Pages {
        [LoginPage]
        [DashboardPage]
        [HorarioPage]
        [CalificacionesPage]
        [PerfilPage]
    }
    
    component "Services API" as APIClient {
        [Axios Instance]
        [Interceptors]
        [Token Manager]
        [Error Handler]
    }
    
    component "State Management" as State {
        [AuthContext]
        [UserContext]
        [ThemeContext]
        [NotificationContext]
    }
    
    component "Routing" as Routing {
        [React Router]
        [Protected Routes]
        [Public Routes]
        [Route Guards]
    }
    
    component "Custom Hooks" as Hooks {
        [useAuth]
        [useAPI]
        [useForm]
        [useLocalStorage]
    }
    
    component "Utils" as Utils {
        [Date Formatters]
        [Validators]
        [Currency Formatters]
        [Constants]
    }
    
    Pages --> UI : Usa
    Pages --> APIClient : Llama
    Pages --> State : Consume
    Pages --> Routing : Navega
    Pages --> Hooks : Utiliza
    Pages --> Utils : Importa
    APIClient --> State : Actualiza
}

' ==================== API .NET ====================
package "API .NET Core" <<Container>> {
    skinparam rectangle {
        BackgroundColor #FFF3E0
        BorderColor #F57C00
        FontColor #E65100
    }
    
    component "Controllers" as Controllers {
        [AuthController]
        [UserController]
        [HorarioController]
        [CalificacionController]
        [AsignaturaController]
    }
    
    component "Services" as Services {
        [AuthService]
        [UserService]
        [HorarioService]
        [CalificacionService]
        [AsignaturaService]
    }
    
    component "Repositories" as Repositories {
        [UserRepository]
        [HorarioRepository]
        [CalificacionRepository]
        [AsignaturaRepository]
    }
    
    component "DTOs" as DTOs {
        [LoginDTO]
        [RegisterDTO]
        [UserDTO]
        [HorarioDTO]
        [CalificacionDTO]
    }
    
    component "Middleware" as Middleware {
        [JWT Authentication]
        [CORS Middleware]
        [Logging Middleware]
        [Exception Handler]
    }
    
    component "DbContext" as DbContext {
        [AppDbContext]
        [Entity Configurations]
        [Migrations]
    }
    
    component "Validators" as Validators {
        [LoginValidator]
        [RegisterValidator]
        [UserValidator]
    }
    
    component "Configuration" as Config {
        [appsettings.json]
        [JWT Settings]
        [Connection Strings]
    }
    
    Controllers --> Services : Inyecta
    Controllers --> DTOs : Valida
    Controllers --> Validators : Usa
    Services --> Repositories : Llama
    Repositories --> DbContext : Accede
    Middleware --> Controllers : Procesa
    Config --> Services : Configura
}

' ==================== SUPABASE ====================
package "Supabase PostgreSQL" <<Container>> {
    skinparam rectangle {
        BackgroundColor #E8F5E9
        BorderColor #388E3C
        FontColor #1B5E20
    }
    
    database "PostgreSQL Engine" as PG {
        [Query Optimizer]
        [Transaction Manager]
        [Connection Pool]
    }
    
    database "Tables" as Tables {
        [usuarios]
        [roles]
        [horarios]
        [calificaciones]
        [asignaturas]
        [categorias]
        [refresh_tokens]
    }
    
    database "Indexes" as Indexes {
        [Primary Keys]
        [Foreign Keys]
        [Unique Indexes]
        [Composite Indexes]
    }
    
    database "Triggers" as Triggers {
        [updated_at]
        [created_at]
        [audit_log]
    }
    
    database "Stored Procedures" as Procedures {
        [sp_get_horario_usuario]
        [sp_get_promedio]
        [sp_get_asistencia]
    }
    
    database "Views" as Views {
        [vw_horario_completo]
        [vw_calificaciones_resumen]
        [vw_estadisticas]
    }
    
    database "Row Level Security" as RLS {
        [User Isolation]
        [Role Based Access]
        [Tenant Isolation]
    }
    
    PG --> Tables : Administra
    Tables --> Indexes : Tiene
    Tables --> Triggers : Dispara
    Procedures --> Tables : Consulta
    Views --> Tables : Proyecta
    RLS --> Tables : Protege
}

' ==================== COMUNICACIÓN ENTRE CONTENEDORES ====================
APIClient --> Controllers : HTTPS/REST
DbContext --> PG : PostgreSQL
Repositories --> Tables : EF Core

' ==================== NOTAS ====================
note right of UI
  Componentes atómicos
  reutilizables con
  estilos consistentes
end note

note right of Controllers
  Endpoints RESTful
  Validación de DTOs
  Retornan IActionResult
end note

note right of Services
  Lógica de negocio
  Reglas del dominio
  Orquestación de repos
end note

note right of Repositories
  Pattern Repository
  Abstracción de EF Core
  CRUD genérico
end note

note right of RLS
  Seguridad a nivel de fila
  Políticas de Supabase
  Aislamiento de datos
end note

legend right
  |= Color |= Contenedor |
  | <back:#E3F2FD> | Frontend React |
  | <back:#FFF3E0> | API .NET Core |
  | <back:#E8F5E9> | Supabase PostgreSQL |
endlegend

@enduml
```

---

## 3. Diagrama de Componentes

### Explicación Técnica Completa

El **Diagrama de Componentes** muestra los componentes de software individuales, sus interfaces, dependencias y relaciones. Este diagrama es más detallado que el de contenedores y muestra cómo se conectan los módulos específicos.

**Componentes Backend .NET:**

- **AuthController:** Expone endpoints para login, registro, logout, refresh token. Valida credenciales, coordina con AuthService, retorna JWT tokens.
- **UserController:** Gestiona operaciones CRUD de usuarios. Valida permisos, coordina con UserService, aplica filtros por rol.
- **HorarioController:** Maneja horarios de clases. Aplica lógica de disponibilidad, valida conflictos, coordina con HorarioService.
- **AuthService:** Lógica de autenticación. Valida contraseñas, genera JWT tokens, maneja refresh tokens, implementa rate limiting.
- **UserService:** Lógica de negocio de usuarios. Aplica reglas de dominio, valida permisos, coordina repositorios.
- **HorarioService:** Lógica de negocio de horarios. Valida conflictos, aplica reglas de disponibilidad, calcula estadísticas.
- **IUserRepository:** Interface para acceso a datos de usuarios. Define contrato CRUD, permite testing con mocks.
- **UserRepository:** Implementación concreta de IUserRepository. Usa Entity Framework Core, mapea entidades.
- **IHorarioRepository:** Interface para acceso a datos de horarios.
- **HorarioRepository:** Implementación concreta de IHorarioRepository.
- **JwtService:** Servicio para generación y validación de tokens JWT. Configura claims, expiración, signing key.
- **PasswordHasher:** Servicio para encriptación de contraseñas. Usa BCrypt o Argon2, implementa salt.
- **AppDbContext:** Contexto de Entity Framework. Configura entidades, relaciones, migrations.
- **DTOs:** LoginDTO, RegisterDTO, UserDTO, HorarioDTO. Validaciones con Data Annotations o FluentValidation.

**Componentes Frontend React:**

- **LoginPage:** Componente de login. Formulario con validación, manejo de errores, integración con AuthContext.
- **DashboardPage:** Página principal. Muestra resumen, widgets, navegación lateral.
- **HorarioModule:** Módulo de horarios. Lista, detalle, creación, edición de horarios.
- **APIClient:** Cliente HTTP configurado con Axios. Interceptors para tokens, manejo de errores.
- **AuthContext:** Contexto de autenticación. Provee estado auth, funciones login/logout, token management.
- **UserContext:** Contexto de usuario. Provee datos del usuario actual, permisos, preferencias.
- **ProtectedRoute:** Componente de ruta protegida. Valida autenticación, redirige si no autenticado.
- **RoleGuard:** Guard de roles. Valida permisos por rol, redirige si no autorizado.

### Explicación Sencilla para Estudiantes

El diagrama de componentes es como ver cada departamento del edificio con sus empleados y cómo trabajan juntos:

**Backend (El Cerebro):**
- **AuthController:** Es el recepcionista de seguridad - verifica identidades
- **UserController:** Es el gestor de personas - maneja información de usuarios
- **HorarioController:** Es el gestor de horarios - organiza las clases
- **AuthService:** Es el experto en seguridad - sabe cómo proteger el sistema
- **UserService:** Es el experto en personas - conoce todas las reglas sobre usuarios
- **HorarioService:** Es el experto en horarios - sabe organizar clases sin conflictos
- **Repositories:** Son los archiveros - saben buscar y guardar información
- **JwtService:** Es el generador de credenciales - crea pases de acceso
- **PasswordHasher:** Es el guardián de secretos - protege contraseñas
- **AppDbContext:** Es el catálogo del archivo - sabe dónde está cada información

**Frontend (La Recepción):**
- **LoginPage:** Es la puerta de entrada - donde te identificas
- **Dashboard:** Es el salón principal - donde ves todo importante
- **HorarioModule:** Es el área de horarios - donde ves tus clases
- **APIClient:** Es el teléfono - llama al cerebro
- **AuthContext:** Es la memoria de seguridad - recuerda quién eres
- **UserContext:** Es la memoria personal - recuerda tus datos
- **ProtectedRoute:** Es el guardia - solo deja pasar a autorizados

### Objetivo del Diagrama

- **Mostrar componentes individuales:** Cada módulo de software
- **Documentar interfaces:** Cómo se comunican los componentes
- **Identificar dependencias:** Qué componentes necesita cada uno
- **Aplicar principios SOLID:** Mostrar separación de responsabilidades
- **Facilitar testing:** Mostrar puntos de inyección de dependencias

### Qué Representa Cada Componente

#### Backend Components
| Componente | Responsabilidad | Principios SOLID |
|------------|-----------------|------------------|
| **AuthController** | Endpoints de autenticación | S (Single Responsibility) |
| **UserController** | Endpoints de usuarios | S (Single Responsibility) |
| **AuthService** | Lógica de autenticación | S, O (Open/Closed) |
| **UserService** | Lógica de usuarios | S, O |
| **IUserRepository** | Contrato de acceso a datos | I (Interface Segregation) |
| **UserRepository** | Implementación de acceso | D (Dependency Inversion) |
| **JwtService** | Generación de tokens | S |
| **PasswordHasher** | Encriptación de contraseñas | S |
| **AppDbContext** | Configuración EF Core | S |

#### Frontend Components
| Componente | Responsabilidad | Patrones |
|------------|-----------------|-----------|
| **LoginPage** | Formulario de login | Container/Presenter |
| **Dashboard** | Vista principal | Composition |
| **HorarioModule** | Gestión de horarios | Module Pattern |
| **APIClient** | Cliente HTTP | Singleton |
| **AuthContext** | Estado de autenticación | Context API |
| **UserContext** | Estado de usuario | Context API |
| **ProtectedRoute** | Ruta protegida | HOC Pattern |

### Dependencias y Comunicación

**Backend Dependency Flow:**
```
Controller (depende de) → Service (depende de) → Repository (depende de) → DbContext
Controller (depende de) → DTOs
Service (depende de) → Interfaces (IRepository)
Service (depende de) → JwtService, PasswordHasher
```

**Frontend Dependency Flow:**
```
Page (depende de) → Context (consume) → APIClient (llama) → API
Page (depende de) → Components (usa)
ProtectedRoute (depende de) → AuthContext (valida)
```

### Responsabilidades

**Controller Layer:**
- Recibir solicitudes HTTP
- Validar DTOs
- Coordinar con Services
- Retornar respuestas HTTP
- Manejar errores HTTP

**Service Layer:**
- Implementar lógica de negocio
- Aplicar reglas del dominio
- Coordinar múltiples repositorios
- Validar permisos
- Transformar datos

**Repository Layer:**
- Acceso a datos
- Ejecutar queries
- Mapear entidades
- Manejar transacciones
- Abstraer EF Core

### Principios SOLID Aplicados

**S - Single Responsibility Principle:**
- Cada componente tiene una única responsabilidad
- Controllers solo manejan HTTP
- Services solo tienen lógica de negocio
- Repositories solo acceden a datos

**O - Open/Closed Principle:**
- Interfaces permiten extender sin modificar
- Services pueden tener nuevas implementaciones
- Repositories pueden ser mockeados para testing

**L - Liskov Substitution Principle:**
- Cualquier implementación de IUserRepository puede sustituirse
- JwtService puede ser reemplazado por otra implementación

**I - Interface Segregation Principle:**
- Interfaces específicas por dominio
- No hay interfaces monolíticas
- Clients solo dependen de métodos que usan

**D - Dependency Inversion Principle:**
- Services dependen de interfaces, no implementaciones
- Controllers inyectan dependencies
- Facilita testing con mocks

### Código PlantUML Completo

```plantuml
@startuml DiagramaComponentes
!theme plain
skinparam backgroundColor #F8F9FA
skinparam componentStyle rectangle

title Diagrama de Componentes - Plataforma Escolar
note right of title
  Componentes individuales,
  interfaces y dependencias
end note

' ==================== BACKEND .NET ====================
package "Backend .NET Core" {
    skinparam rectangle {
        BackgroundColor #FFF3E0
        BorderColor #F57C00
        FontColor #E65100
    }
    
    ' Controllers
    component "AuthController" as AuthCtrl {
        [POST /login]
        [POST /register]
        [POST /logout]
        [POST /refresh-token]
    }
    
    component "UserController" as UserCtrl {
        [GET /users]
        [GET /users/{id}]
        [POST /users]
        [PUT /users/{id}]
        [DELETE /users/{id}]
    }
    
    component "HorarioController" as HorarioCtrl {
        [GET /horarios]
        [GET /horarios/{id}]
        [POST /horarios]
        [PUT /horarios/{id}]
        [DELETE /horarios/{id}]
    }
    
    component "CalificacionController" as CalifCtrl {
        [GET /calificaciones]
        [GET /calificaciones/{id}]
        [POST /calificaciones]
        [PUT /calificaciones/{id}]
    }
    
    ' Services
    component "AuthService" as AuthSvc {
        [ValidateCredentials]
        [GenerateJWT]
        [RefreshToken]
        [RevokeToken]
    }
    
    component "UserService" as UserSvc {
        [GetAllUsers]
        [GetUserById]
        [CreateUser]
        [UpdateUser]
        [DeleteUser]
    }
    
    component "HorarioService" as HorarioSvc {
        [GetAllHorarios]
        [GetHorarioById]
        [CreateHorario]
        [UpdateHorario]
        [ValidateConflicts]
    }
    
    component "CalificacionService" as CalifSvc {
        [GetAllCalificaciones]
        [GetCalificacionById]
        [CreateCalificacion]
        [UpdateCalificacion]
        [CalculatePromedio]
    }
    
    ' Interfaces
    interface "IUserRepository" as IUserRepo {
        +GetAllAsync()
        +GetByIdAsync()
        +AddAsync()
        +UpdateAsync()
        +DeleteAsync()
    }
    
    interface "IHorarioRepository" as IHorarioRepo {
        +GetAllAsync()
        +GetByIdAsync()
        +AddAsync()
        +UpdateAsync()
        +DeleteAsync()
    }
    
    interface "ICalificacionRepository" as ICalifRepo {
        +GetAllAsync()
        +GetByIdAsync()
        +AddAsync()
        +UpdateAsync()
        +DeleteAsync()
    }
    
    ' Implementations
    component "UserRepository" as UserRepo {
        [EF Core Implementation]
        [SQL Queries]
        [Entity Mapping]
    }
    
    component "HorarioRepository" as HorarioRepo {
        [EF Core Implementation]
        [SQL Queries]
        [Entity Mapping]
    }
    
    component "CalificacionRepository" as CalifRepo {
        [EF Core Implementation]
        [SQL Queries]
        [Entity Mapping]
    }
    
    ' Supporting Services
    component "JwtService" as JwtSvc {
        [GenerateToken]
        [ValidateToken]
        [GetClaims]
        [ConfigureOptions]
    }
    
    component "PasswordHasher" as PassHash {
        [HashPassword]
        [VerifyPassword]
        [BCrypt/Argon2]
    }
    
    component "AppDbContext" as DbContext {
        [DbSet<User>]
        [DbSet<Horario>]
        [DbSet<Calificacion>]
        [OnModelCreating]
    }
    
    ' DTOs
    component "DTOs" as DTOs {
        [LoginDTO]
        [RegisterDTO]
        [UserDTO]
        [HorarioDTO]
        [CalificacionDTO]
    }
    
    ' Dependencies
    AuthCtrl ..> AuthSvc : uses
    AuthCtrl ..> DTOs : validates
    UserCtrl ..> UserSvc : uses
    UserCtrl ..> DTOs : validates
    HorarioCtrl ..> HorarioSvc : uses
    HorarioCtrl ..> DTOs : validates
    CalifCtrl ..> CalifSvc : uses
    CalifCtrl ..> DTOs : validates
    
    AuthSvc ..> IUserRepo : depends on
    AuthSvc ..> JwtSvc : uses
    AuthSvc ..> PassHash : uses
    UserSvc ..> IUserRepo : depends on
    HorarioSvc ..> IHorarioRepo : depends on
    CalifSvc ..> ICalifRepo : depends on
    
    UserRepo ..|> IUserRepo : implements
    HorarioRepo ..|> IHorarioRepo : implements
    CalifRepo ..|> ICalifRepo : implements
    
    UserRepo ..> DbContext : uses
    HorarioRepo ..> DbContext : uses
    CalifRepo ..> DbContext : uses
}

' ==================== FRONTEND REACT ====================
package "Frontend React" {
    skinparam rectangle {
        BackgroundColor #E3F2FD
        BorderColor #1976D2
        FontColor #0D47A1
    }
    
    ' Pages
    component "LoginPage" as LoginPg {
        [LoginForm]
        [Validation]
        [Error Handling]
        [Redirect]
    }
    
    component "DashboardPage" as DashPg {
        [Widgets]
        [Charts]
        [Summary Cards]
        [Quick Actions]
    }
    
    component "HorarioModule" as HorarioMod {
        [HorarioList]
        [HorarioDetail]
        [HorarioForm]
        [Conflict Detection]
    }
    
    component "CalificacionModule" as CalifMod {
        [CalificacionList]
        [CalificacionDetail]
        [CalificacionForm]
        [Promedio Calculator]
    }
    
    ' Contexts
    component "AuthContext" as AuthCtx {
        [user state]
        [token state]
        [login()]
        [logout()]
        [refreshToken()]
    }
    
    component "UserContext" as UserCtx {
        [userData state]
        [permissions state]
        [preferences state]
        [updateUser()]
    }
    
    ' API Client
    component "APIClient" as APIClient {
        [axios instance]
        [request interceptor]
        [response interceptor]
        [token manager]
        [error handler]
    }
    
    ' Route Guards
    component "ProtectedRoute" as ProtRoute {
        [check auth]
        [redirect if not auth]
        [render children]
    }
    
    component "RoleGuard" as RoleGuard {
        [check role]
        [redirect if not authorized]
        [render children]
    }
    
    ' UI Components
    component "UI Components" as UIComp {
        [Button]
        [Input]
        [Card]
        [Modal]
        [Table]
        [Form]
    }
    
    ' Dependencies
    LoginPg ..> AuthCtx : uses
    LoginPg ..> APIClient : calls
    LoginPg ..> UIComp : renders
    
    DashPg ..> AuthCtx : uses
    DashPg ..> UserCtx : uses
    DashPg ..> APIClient : calls
    DashPg ..> UIComp : renders
    
    HorarioMod ..> AuthCtx : uses
    HorarioMod ..> APIClient : calls
    HorarioMod ..> UIComp : renders
    
    CalifMod ..> AuthCtx : uses
    CalifMod ..> APIClient : calls
    CalifMod ..> UIComp : renders
    
    ProtRoute ..> AuthCtx : checks
    RoleGuard ..> AuthCtx : checks
    RoleGuard ..> UserCtx : checks
    
    APIClient ..> AuthCtx : gets token
}

' ==================== COMMUNICATION ====================
APIClient --> AuthCtrl : HTTPS
APIClient --> UserCtrl : HTTPS
APIClient --> HorarioCtrl : HTTPS
APIClient --> CalifCtrl : HTTPS

' ==================== NOTES ====================
note right of AuthCtrl
  Endpoints de autenticación
  Valida credenciales
  Retorna JWT tokens
end note

note right of AuthSvc
  Lógica de autenticación
  Genera y valida tokens
  Maneja refresh tokens
end note

note right of IUserRepo
  Interface para acceso a datos
  Permite testing con mocks
  Principio de inversión de dependencias
end note

note right of JwtSvc
  Generación de JWT tokens
  Configuración de claims
  Validación de firma
end note

note right of AuthCtx
  Contexto de autenticación
  Estado global de auth
  Provee funciones login/logout
end note

note right of APIClient
  Cliente HTTP con Axios
  Interceptors para tokens
  Manejo centralizado de errores
end note

legend right
  |= Color |= Tipo |
  | <back:#FFF3E0> | Backend .NET |
  | <back:#E3F2FD> | Frontend React |
  | <back:#FFFFFF> | Interfaces |
endlegend

@enduml
```

---

## 4. Diagrama de Código

### Explicación Técnica Completa

El **Diagrama de Código** (o Diagrama de Clases) muestra las clases concretas, sus métodos, atributos, relaciones, herencia e interfaces. Este es el diagrama más detallado y representa la estructura del código fuente.

**Clases Principales Backend:**

- **User:** Entidad de dominio que representa un usuario. Propiedades: Id, Email, PasswordHash, Nombre, Apellido, RolId, FechaCreacion, UltimoLogin. Métodos: Validate(), UpdateLastLogin().
- **Product:** Entidad que representa un producto (ejemplo genérico). Propiedades: Id, Nombre, Descripcion, Precio, Stock, CategoriaId. Métodos: ValidateStock(), UpdateStock().
- **AuthService:** Servicio de autenticación. Métodos: LoginAsync(LoginDTO), RegisterAsync(RegisterDTO), RefreshTokenAsync(RefreshTokenDTO), LogoutAsync(), ValidateToken(string token).
- **IUserRepository:** Interface para repositorio de usuarios. Métodos: GetAllAsync(), GetByIdAsync(int id), GetByEmailAsync(string email), AddAsync(User user), UpdateAsync(User user), DeleteAsync(int id).
- **JwtService:** Servicio para manejo de JWT. Métodos: GenerateToken(User user), ValidateToken(string token), GetClaimsFromToken(string token), ConfigureJwtOptions(JwtOptions options).
- **LoginDTO:** Data Transfer Object para login. Propiedades: Email, Password. Validaciones: [Required], [EmailAddress].
- **RegisterDTO:** Data Transfer Object para registro. Propiedades: Email, Password, ConfirmPassword, Nombre, Apellido. Validaciones: [Required], [Compare], [MinLength].

**Relaciones:**

- **Inheritance:** User hereda de BaseEntity (Id, CreatedAt, UpdatedAt)
- **Implementation:** UserRepository implementa IUserRepository
- **Association:** AuthService tiene IUserRepository (dependency injection)
- **Composition:** User tiene Rol (un usuario tiene un rol)
- **Aggregation:** Order tiene múltiples OrderItems

### Explicación Sencilla para Estudiantes

El diagrama de código es como ver el plano arquitectónico del edificio con cada habitación, sus muebles y cómo están conectados:

**Clases (Habitaciones):**
- **User:** Es la ficha de una persona - tiene nombre, email, contraseña
- **AuthService:** Es el departamento de seguridad - tiene funciones para login, registro
- **IUserRepository:** Es el contrato del archivero - dice qué debe saber hacer
- **UserRepository:** Es el archivero real - cumple el contrato
- **JwtService:** Es la máquina de credenciales - crea pases de acceso
- **LoginDTO:** Es el formulario de login - tiene campos para email y contraseña

**Relaciones (Conexiones):**
- **Herencia:** User es una especialización de BaseEntity (como "persona" es una especialización de "ser vivo")
- **Implementación:** UserRepository cumple con IUserRepository (como un empleado cumple su contrato de trabajo)
- **Asociación:** AuthService usa UserRepository (como el departamento de seguridad usa el archivero)

### Objetivo del Diagrama

- **Documentar estructura de clases:** Qué clases existen y qué hacen
- **Mostrar métodos y atributos:** Qué tiene cada clase
- **Documentar relaciones:** Cómo se conectan las clases
- **Facilitar comprensión del código:** Mapa del código fuente
- **Guía para implementación:** Referencia para escribir código

### Cómo Funciona el Código

**Flujo de Autenticación:**

1. Usuario envía LoginDTO (email, password) a AuthController.Login()
2. AuthController llama a AuthService.LoginAsync(LoginDTO)
3. AuthService busca usuario con IUserRepository.GetByEmailAsync(email)
4. Si usuario existe, AuthService verifica password con PasswordHasher.VerifyPassword()
5. Si password correcto, AuthService llama a JwtService.GenerateToken(User)
6. JwtService crea token con claims (userId, email, role, expiración)
7. AuthService retorna AuthResponseDTO (accessToken, refreshToken)
8. AuthController retorna 200 OK con tokens

**Flujo CRUD:**

1. Usuario solicita GET /api/users
2. UserController.GetAll() llama a UserService.GetAllAsync()
3. UserService llama a IUserRepository.GetAllAsync()
4. UserRepository ejecuta query SQL con EF Core
5. UserRepository retorna List<User>
6. UserService mapea User a UserDTO
7. UserService retorna List<UserDTO>
8. UserController retorna 200 OK con lista de DTOs

**Patrón Repository:**

- **Interface:** Define contrato sin implementación
- **Implementation:** Implementa el contrato con EF Core
- **Dependency Injection:** Service recibe interface, no implementación
- **Testing:** Puede mockear interface para unit tests

**Dependency Injection:**

- **Constructor Injection:** Services reciben dependencies en constructor
- **Service Collection:** Configurado en Program.cs
- **Scoped Services:** Una instancia por request HTTP
- **Singleton Services:** Una instancia para toda la aplicación

### Código PlantUML Completo

```plantuml
@startuml DiagramaCodigo
!theme plain
skinparam backgroundColor #F8F9FA
skinparam classAttributeIconSize 0
skinparam class {
    BackgroundColor #FFFFFF
    BorderColor #333333
    FontColor #000000
}

title Diagrama de Código - Clases y Relaciones
note right of title
  Estructura detallada de clases,
  métodos, atributos y relaciones
end note

' ==================== BASE ENTITIES ====================
abstract class BaseEntity {
    - int Id
    - DateTime CreatedAt
    - DateTime UpdatedAt
    + IsValid() : bool
}

' ==================== DOMAIN ENTITIES ====================
class User {
    - string Email
    - string PasswordHash
    - string Nombre
    - string Apellido
    - int RolId
    - DateTime? UltimoLogin
    - bool Activo
    + Validate() : bool
    + UpdateLastLogin() : void
    + HasPermission(string permission) : bool
}

class Rol {
    - string Nombre
    - string Descripcion
    - List<Permiso> Permisos
    + AddPermiso(Permiso permiso) : void
    + RemovePermiso(Permiso permiso) : void
    + HasPermission(string permission) : bool
}

class Permiso {
    - string Nombre
    - string Descripcion
    - string Modulo
}

class Horario {
    - string Asignatura
    - DateTime FechaInicio
    - DateTime FechaFin
    - string DiaSemana
    - string Salon
    - int ProfesorId
    + ValidateConflict(Horario other) : bool
    + GetDuration() : TimeSpan
}

class Calificacion {
    - decimal Nota
    - string Periodo
    - int AsignaturaId
    - int AlumnoId
    - string Observaciones
    + IsAprobado() : bool
    + ValidateRange() : bool
}

class Asignatura {
    - string Nombre
    - string Codigo
    - int Creditos
    - string Descripcion
    + GetCreditos() : int
}

' ==================== DTOs ====================
class LoginDTO {
    + string Email
    + string Password
    + Validate() : ValidationResult
}

class RegisterDTO {
    + string Email
    + string Password
    + string ConfirmPassword
    + string Nombre
    + string Apellido
    + Validate() : ValidationResult
}

class UserDTO {
    + int Id
    + string Email
    + string Nombre
    + string Apellido
    + string Rol
    + DateTime CreatedAt
}

class HorarioDTO {
    + int Id
    + string Asignatura
    + DateTime FechaInicio
    + DateTime FechaFin
    + string DiaSemana
    + string Salon
}

class CalificacionDTO {
    + int Id
    + decimal Nota
    + string Periodo
    + string AsignaturaNombre
    + string AlumnoNombre
}

class AuthResponseDTO {
    + string AccessToken
    + string RefreshToken
    + DateTime Expiration
    + UserDTO User
}

' ==================== INTERFACES ====================
interface IUserRepository {
    + GetAllAsync() : Task<List<User>>
    + GetByIdAsync(int id) : Task<User>
    + GetByEmailAsync(string email) : Task<User>
    + AddAsync(User user) : Task<int>
    + UpdateAsync(User user) : Task<bool>
    + DeleteAsync(int id) : Task<bool>
}

interface IRolRepository {
    + GetAllAsync() : Task<List<Rol>>
    + GetByIdAsync(int id) : Task<Rol>
    + GetByNameAsync(string nombre) : Task<Rol>
    + AddAsync(Rol rol) : Task<int>
}

interface IHorarioRepository {
    + GetAllAsync() : Task<List<Horario>>
    + GetByIdAsync(int id) : Task<Horario>
    + GetByProfesorIdAsync(int profesorId) : Task<List<Horario>>
    + AddAsync(Horario horario) : Task<int>
    + UpdateAsync(Horario horario) : Task<bool>
    + DeleteAsync(int id) : Task<bool>
}

interface ICalificacionRepository {
    + GetAllAsync() : Task<List<Calificacion>>
    + GetByIdAsync(int id) : Task<Calificacion>
    + GetByAlumnoIdAsync(int alumnoId) : Task<List<Calificacion>>
    + AddAsync(Calificacion calificacion) : Task<int>
    + UpdateAsync(Calificacion calificacion) : Task<bool>
}

' ==================== REPOSITORIES ====================
class UserRepository {
    - AppDbContext _context
    + UserRepository(AppDbContext context)
    + GetAllAsync() : Task<List<User>>
    + GetByIdAsync(int id) : Task<User>
    + GetByEmailAsync(string email) : Task<User>
    + AddAsync(User user) : Task<int>
    + UpdateAsync(User user) : Task<bool>
    + DeleteAsync(int id) : Task<bool>
}

class RolRepository {
    - AppDbContext _context
    + RolRepository(AppDbContext context)
    + GetAllAsync() : Task<List<Rol>>
    + GetByIdAsync(int id) : Task<Rol>
    + GetByNameAsync(string nombre) : Task<Rol>
    + AddAsync(Rol rol) : Task<int>
}

class HorarioRepository {
    - AppDbContext _context
    + HorarioRepository(AppDbContext context)
    + GetAllAsync() : Task<List<Horario>>
    + GetByIdAsync(int id) : Task<Horario>
    + GetByProfesorIdAsync(int id) : Task<List<Horario>>
    + AddAsync(Horario horario) : Task<int>
    + UpdateAsync(Horario horario) : Task<bool>
    + DeleteAsync(int id) : Task<bool>
}

class CalificacionRepository {
    - AppDbContext _context
    + CalificacionRepository(AppDbContext context)
    + GetAllAsync() : Task<List<Calificacion>>
    + GetByIdAsync(int id) : Task<Calificacion>
    + GetByAlumnoIdAsync(int id) : Task<List<Calificacion>>
    + AddAsync(Calificacion calif) : Task<int>
    + UpdateAsync(Calificacion calif) : Task<bool>
}

' ==================== SERVICES ====================
class AuthService {
    - IUserRepository _userRepo
    - IJwtService _jwtService
    - IPasswordHasher _passwordHasher
    + AuthService(IUserRepository userRepo, IJwtService jwtService, IPasswordHasher hasher)
    + LoginAsync(LoginDTO dto) : Task<AuthResponseDTO>
    + RegisterAsync(RegisterDTO dto) : Task<AuthResponseDTO>
    + RefreshTokenAsync(string refreshToken) : Task<AuthResponseDTO>
    + LogoutAsync(string token) : Task
    - ValidateCredentials(string email, string password) : Task<User>
}

class UserService {
    - IUserRepository _userRepo
    - IRolRepository _rolRepo
    + UserService(IUserRepository userRepo, IRolRepository rolRepo)
    + GetAllAsync() : Task<List<UserDTO>>
    + GetByIdAsync(int id) : Task<UserDTO>
    + CreateAsync(RegisterDTO dto) : Task<UserDTO>
    + UpdateAsync(int id, UserDTO dto) : Task<UserDTO>
    + DeleteAsync(int id) : Task<bool>
    - MapToDTO(User user) : UserDTO
}

class HorarioService {
    - IHorarioRepository _horarioRepo
    + HorarioService(IHorarioRepository horarioRepo)
    + GetAllAsync() : Task<List<HorarioDTO>>
    + GetByIdAsync(int id) : Task<HorarioDTO>
    + CreateAsync(HorarioDTO dto) : Task<HorarioDTO>
    + UpdateAsync(int id, HorarioDTO dto) : Task<HorarioDTO>
    + DeleteAsync(int id) : Task<bool>
    - ValidateConflict(Horario horario) : bool
}

class CalificacionService {
    - ICalificacionRepository _califRepo
    + CalificacionService(ICalificacionRepository califRepo)
    + GetAllAsync() : Task<List<CalificacionDTO>>
    + GetByIdAsync(int id) : Task<CalificacionDTO>
    + GetByAlumnoIdAsync(int alumnoId) : Task<List<CalificacionDTO>>
    + CreateAsync(CalificacionDTO dto) : Task<CalificacionDTO>
    + UpdateAsync(int id, CalificacionDTO dto) : Task<CalificacionDTO>
    + DeleteAsync(int id) : Task<bool>
    - CalculatePromedio(int alumnoId) : Task<decimal>
}

' ==================== SUPPORTING SERVICES ====================
interface IJwtService {
    + GenerateToken(User user) : string
    + ValidateToken(string token) : bool
    + GetClaimsFromToken(string token) : ClaimsPrincipal
}

interface IPasswordHasher {
    + HashPassword(string password) : string
    + VerifyPassword(string password, string hash) : bool
}

class JwtService {
    - JwtOptions _options
    + JwtService(IOptions<JwtOptions> options)
    + GenerateToken(User user) : string
    + ValidateToken(string token) : bool
    + GetClaimsFromToken(string token) : ClaimsPrincipal
    - CreateClaims(User user) : List<Claim>
}

class PasswordHasher {
    + HashPassword(string password) : string
    + VerifyPassword(string password, string hash) : bool
}

' ==================== DB CONTEXT ====================
class AppDbContext {
    - DbContextOptions _options
    + DbSet<User> Users
    + DbSet<Rol> Roles
    + DbSet<Horario> Horarios
    + DbSet<Calificacion> Calificaciones
    + DbSet<Asignatura> Asignaturas
    + AppDbContext(DbContextOptions options)
    + OnModelCreating(ModelBuilder builder) : void
}

' ==================== RELATIONSHIPS ====================
BaseEntity <|-- User
BaseEntity <|-- Rol
BaseEntity <|-- Horario
BaseEntity <|-- Calificacion
BaseEntity <|-- Asignatura

User "1" *-- "1" Rol : tiene
Rol "1" *-- "0..*" Permiso : tiene
Horario "1" --> "1" User : Profesor
Calificacion "1" --> "1" User : Alumno
Calificacion "1" --> "1" Asignatura : pertenece

UserRepository ..|> IUserRepository : implements
RolRepository ..|> IRolRepository : implements
HorarioRepository ..|> IHorarioRepository : implements
CalificacionRepository ..|> ICalificacionRepository : implements

AuthService --> IUserRepository : uses
AuthService --> IJwtService : uses
AuthService --> IPasswordHasher : uses

UserService --> IUserRepository : uses
UserService --> IRolRepository : uses

HorarioService --> IHorarioRepository : uses
CalificacionService --> ICalificacionRepository : uses

JwtService ..|> IJwtService : implements
PasswordHasher ..|> IPasswordHasher : implements

UserRepository --> AppDbContext : uses
RolRepository --> AppDbContext : uses
HorarioRepository --> AppDbContext : uses
CalificacionRepository --> AppDbContext : uses

' ==================== NOTES ====================
note right of User
  Entidad de dominio
  Representa un usuario del sistema
  Incluye datos de autenticación
  y perfil
end note

note right of AuthService
  Servicio de autenticación
  Coordina repositorios y servicios
  Implementa lógica de login/registro
  Maneja tokens JWT
end note

note right of IUserRepository
  Interface para acceso a datos
  Permite testing con mocks
  Principio de inversión de dependencias
end note

note right of JwtService
  Servicio para generación de JWT
  Configura claims y expiración
  Valida firma de tokens
end note

note right of AppDbContext
  Contexto de Entity Framework
  Configura entidades y relaciones
  Maneja migrations
end note

legend right
  |= Color |= Tipo |
  | <back:#FFFFFF> | Entidades de Dominio |
  | <back:#FFFFFF> | DTOs |
  | <back:#FFFFFF> | Interfaces |
  | <back:#FFFFFF> | Repositories |
  | <back:#FFFFFF> | Services |
endlegend

@enduml
```

---

## 5. Diagrama Modelo E-R

### Explicación Técnica Completa

El **Diagrama Entidad-Relación (E-R)** muestra la estructura de la base de datos, las tablas, sus atributos, tipos de datos, claves primarias (PK), claves foráneas (FK) y las relaciones entre entidades.

**Tablas Principales:**

- **usuarios:** Almacena información de usuarios del sistema. PK: id (UUID). FK: rol_id. Índices: email (unique).
- **roles:** Define roles del sistema (Administrador, Profesor, Alumno, Padre). PK: id.
- **permisos:** Define permisos granulares. PK: id. Relación muchos-a-muchos con roles.
- **roles_permisos:** Tabla intermedia para relación muchos-a-muchos entre roles y permisos.
- **horarios:** Almacena horarios de clases. PK: id. FK: profesor_id, asignatura_id, salon_id.
- **asignaturas:** Catálogo de asignaturas/materias. PK: id. FK: categoria_id.
- **categorias:** Clasificación de asignaturas. PK: id.
- **calificaciones:** Registros de calificaciones. PK: id. FK: alumno_id, asignatura_id, periodo_id.
- **periodos:** Periodos académicos. PK: id.
- **refresh_tokens:** Almacena tokens de refresh para JWT. PK: id. FK: usuario_id.
- **auditoria:** Registro de cambios en el sistema. PK: id. FK: usuario_id.

**Tipos de Datos:**

- **UUID:** Para identificadores únicos globales (id)
- **VARCHAR(n):** Para texto de longitud variable
- **TEXT:** Para texto largo (descripciones)
- **TIMESTAMP:** Para fechas y horas (created_at, updated_at)
- **BOOLEAN:** Para valores verdadero/falso
- **DECIMAL(p,s):** Para valores monetarios o calificaciones
- **INTEGER:** Para valores numéricos enteros
- **ENUM:** Para valores predefinidos (estado, tipo)

**Relaciones:**

- **One-to-One:** Un usuario tiene un perfil (opcional)
- **One-to-Many:** Un rol tiene muchos usuarios, un usuario tiene un rol
- **Many-to-One:** Muchas calificaciones pertenecen a un alumno
- **Many-to-Many:** Roles tienen muchos permisos, permisos están en muchos roles

### Explicación Sencilla para Estudiantes

El diagrama E-R es como el plano del archivo del edificio, mostrando cada archivero, sus carpetas y cómo están conectados:

**Tablas (Archiveros):**
- **usuarios:** Archivero con fichas de todas las personas
- **roles:** Archivero con tipos de personas (admin, profesor, alumno)
- **horarios:** Archivero con horarios de clases
- **asignaturas:** Archivero con materias (matemáticas, historia)
- **calificaciones:** Archivero con notas de alumnos
- **refresh_tokens:** Archivero con pases de acceso temporales

**Relaciones (Conexiones entre archiveros):**
- **Un rol tiene muchos usuarios:** Como "profesor" es un rol que tienen muchas personas
- **Un usuario tiene un rol:** Como cada persona tiene un solo tipo
- **Muchas calificaciones de un alumno:** Como un alumno tiene muchas notas
- **Una calificación es de una asignatura:** Como cada nota pertenece a una materia

**Claves (Etiquetas):**
- **PK (Primary Key):** Es como el número único de identificación de cada ficha
- **FK (Foreign Key):** Es como una referencia a otra ficha en otro archivero

### Objetivo del Diagrama

- **Documentar estructura de BD:** Qué tablas existen y qué contienen
- **Mostrar relaciones:** Cómo se conectan las tablas
- **Definir restricciones:** Reglas de integridad referencial
- **Guía para desarrollo:** Referencia para crear migrations
- **Documentación para DBAs:** Guía para administración de BD

### Relación Entre Tablas

**Relación usuarios - roles (Many-to-One):**
- Muchos usuarios pueden tener el mismo rol
- Un usuario tiene exactamente un rol
- FK: usuarios.rol_id → roles.id
- Restricción: ON DELETE RESTRICT (no eliminar rol si tiene usuarios)

**Relación usuarios - horarios (One-to-Many):**
- Un usuario (profesor) puede tener muchos horarios
- Un horario pertenece a un profesor
- FK: horarios.profesor_id → usuarios.id
- Restricción: ON DELETE SET NULL (si se elimina profesor, horario queda sin profesor)

**Relación usuarios - calificaciones (One-to-Many):**
- Un usuario (alumno) puede tener muchas calificaciones
- Una calificación pertenece a un alumno
- FK: calificaciones.alumno_id → usuarios.id
- Restricción: ON DELETE CASCADE (si se elimina alumno, se eliminan sus calificaciones)

**Relación roles - permisos (Many-to-Many):**
- Un rol tiene muchos permisos
- Un permiso está en muchos roles
- Tabla intermedia: roles_permisos
- FKs: roles_permisos.rol_id → roles.id, roles_permisos.permiso_id → permisos.id

### Flujo de Datos

**Flujo de Registro de Usuario:**
```
INSERT INTO usuarios (email, password_hash, nombre, apellido, rol_id)
→ Referencia a roles.id
→ Trigger: created_at = NOW()
→ Trigger: password_hash se encripta automáticamente
```

**Flujo de Creación de Calificación:**
```
INSERT INTO calificaciones (nota, alumno_id, asignatura_id, periodo_id)
→ Referencia a usuarios.id (alumno)
→ Referencia a asignaturas.id
→ Referencia a periodos.id
→ Trigger: created_at = NOW()
→ Trigger: Validar rango de nota (0-10)
```

**Flujo de Refresh Token:**
```
INSERT INTO refresh_tokens (token, usuario_id, expira_en)
→ Referencia a usuarios.id
→ Trigger: created_at = NOW()
→ Trigger: expira_en = NOW() + 7 días
→ Job: Eliminar tokens expirados
```

### Seguridad

**Row Level Security (RLS):**
- **Usuarios:** Solo ven su propia información (excepto admin)
- **Profesores:** Solo ven horarios y calificaciones de sus asignaturas
- **Alumnos:** Solo ven sus propias calificaciones y horarios
- **Padres:** Solo ven información de sus hijos

**Encriptación:**
- **password_hash:** BCrypt con salt automático
- **refresh_tokens:** Encriptados en base de datos
- **Datos sensibles:** Considerar encriptación a nivel de campo

**Auditoría:**
- **Tabla auditoria:** Registra todos los cambios (INSERT, UPDATE, DELETE)
- **Trigger:** Automáticamente registra cambios en tablas críticas
- **Campos:** usuario_id, accion, tabla, registro_id, valor_anterior, valor_nuevo, timestamp

### Integridad Referencial

**Restricciones FK:**
- **ON DELETE CASCADE:** Eliminar en cascada (calificaciones → alumno)
- **ON DELETE RESTRICT:** No permitir eliminación (usuarios → rol)
- **ON DELETE SET NULL:** Establecer null (horarios → profesor)
- **ON UPDATE CASCADE:** Actualizar en cascada (cambios en PK)

**Restricciones UNIQUE:**
- **usuarios.email:** No puede haber emails duplicados
- **refresh_tokens.token:** Tokens únicos
- **asignaturas.codigo:** Códigos de asignatura únicos

**Restricciones CHECK:**
- **calificaciones.nota:** Entre 0 y 10
- **horarios.fecha_fin > fecha_inicio:** Fecha fin posterior a inicio
- **usuarios.email:** Formato válido de email

### Código PlantUML Completo

```plantuml
@startuml DiagramaER
!theme plain
skinparam backgroundColor #F8F9FA
skinparam entity {
    BackgroundColor #FFFFFF
    BorderColor #333333
    FontColor #000000
}

title Diagrama Entidad-Relación - Base de Datos
note right of title
  Estructura de base de datos,
  tablas, relaciones y restricciones
end note

' ==================== TABLA USUARIOS ====================
entity "usuarios" as usuarios {
    *id : UUID <<PK>>
    --
    *email : VARCHAR(255) <<UNIQUE>>
    *password_hash : VARCHAR(255)
    *nombre : VARCHAR(100)
    *apellido : VARCHAR(100)
    *rol_id : INTEGER <<FK>>
    activo : BOOLEAN <<DEFAULT: true>>
    ultimo_login : TIMESTAMP
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
    updated_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA ROLES ====================
entity "roles" as roles {
    *id : INTEGER <<PK>>
    --
    *nombre : VARCHAR(50) <<UNIQUE>>
    descripcion : VARCHAR(255)
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
    updated_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA PERMISOS ====================
entity "permisos" as permisos {
    *id : INTEGER <<PK>>
    --
    *nombre : VARCHAR(100) <<UNIQUE>>
    *modulo : VARCHAR(50)
    descripcion : VARCHAR(255)
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA ROLES_PERMISOS ====================
entity "roles_permisos" as roles_permisos {
    *rol_id : INTEGER <<FK>>
    *permiso_id : INTEGER <<FK>>
    --
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA HORARIOS ====================
entity "horarios" as horarios {
    *id : UUID <<PK>>
    --
    *asignatura : VARCHAR(100)
    *fecha_inicio : TIMESTAMP
    *fecha_fin : TIMESTAMP
    *dia_semana : VARCHAR(20)
    *salon : VARCHAR(50)
    *profesor_id : UUID <<FK>>
    *asignatura_id : INTEGER <<FK>>
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
    updated_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA ASIGNATURAS ====================
entity "asignaturas" as asignaturas {
    *id : INTEGER <<PK>>
    --
    *nombre : VARCHAR(100)
    *codigo : VARCHAR(20) <<UNIQUE>>
    *creditos : INTEGER <<DEFAULT: 0>>
    *categoria_id : INTEGER <<FK>>
    descripcion : TEXT
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
    updated_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA CATEGORIAS ====================
entity "categorias" as categorias {
    *id : INTEGER <<PK>>
    --
    *nombre : VARCHAR(100)
    descripcion : VARCHAR(255)
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA CALIFICACIONES ====================
entity "calificaciones" as calificaciones {
    *id : UUID <<PK>>
    --
    *nota : DECIMAL(5,2) <<CHECK: 0-10>>
    *periodo : VARCHAR(50)
    *alumno_id : UUID <<FK>>
    *asignatura_id : INTEGER <<FK>>
    *periodo_id : INTEGER <<FK>>
    observaciones : TEXT
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
    updated_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA PERIODOS ====================
entity "periodos" as periodos {
    *id : INTEGER <<PK>>
    --
    *nombre : VARCHAR(50) <<UNIQUE>>
    *fecha_inicio : DATE
    *fecha_fin : DATE
    activo : BOOLEAN <<DEFAULT: true>>
    created_at : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA REFRESH_TOKENS ====================
entity "refresh_tokens" as refresh_tokens {
    *id : UUID <<PK>>
    --
    *token : VARCHAR(500) <<UNIQUE>>
    *usuario_id : UUID <<FK>>
    *expira_en : TIMESTAMP
    revocado : BOOLEAN <<DEFAULT: false>>
    creado_en : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== TABLA AUDITORIA ====================
entity "auditoria" as auditoria {
    *id : UUID <<PK>>
    --
    *usuario_id : UUID <<FK>>
    *accion : VARCHAR(20)
    *tabla : VARCHAR(50)
    *registro_id : UUID
    valor_anterior : JSONB
    valor_nuevo : JSONB
    *timestamp : TIMESTAMP <<DEFAULT: NOW()>>
}

' ==================== RELACIONES ====================
usuarios }o--|| roles : "tiene"
roles ||--o{ roles_permisos : "tiene"
permisos ||--o{ roles_permisos : "tiene"
usuarios ||--o{ horarios : "profesor de"
asignaturas ||--o{ horarios : "asignatura de"
categorias ||--o{ asignaturas : "categoría de"
usuarios ||--o{ calificaciones : "alumno de"
asignaturas ||--o{ calificaciones : "asignatura de"
periodos ||--o{ calificaciones : "periodo de"
usuarios ||--o{ refresh_tokens : "tiene"
usuarios ||--o{ auditoria : "realiza"

' ==================== NOTAS ====================
note right of usuarios
  PK: UUID para seguridad
  Email único
  Password encriptado con BCrypt
  Relación con roles
end note

note right of roles_permisos
  Tabla intermedia
  Relación muchos-a-muchos
  entre roles y permisos
end note

note right of calificaciones
  Nota entre 0 y 10
  Relación con alumno y asignatura
  Check constraint en nota
end note

note right of refresh_tokens
  Tokens únicos
  Expiración configurable
  Para refresh de JWT
end note

note right of auditoria
  Registro de todos los cambios
  Trigger automático
  Valores en JSONB
end note

legend right
  |= Símbolo |= Significado |
  | <<PK>> | Primary Key |
  | <<FK>> | Foreign Key |
  | <<UNIQUE>> | Índice único |
  | <<CHECK>> | Restricción check |
  | ||--o{ | One-to-Many |
  | }o--|| | Many-to-One |
  | ||--o{ | Many-to-Many |
endlegend

@enduml
```

---

## 6. Recomendaciones de Arquitectura

### Arquitectura Limpia (Clean Architecture)

**Principios:**
- **Dependency Rule:** Las dependencias solo apuntan hacia adentro
- **Layers:** Domain → Application → Infrastructure → Presentation
- **Entities:** Lógica de negocio del dominio, sin dependencias externas
- **Use Cases:** Lógica de aplicación, orquesta entidades
- **Interface Adapters:** Controllers, Presenters, Gateways
- **Frameworks & Drivers:** EF Core, React, Supabase

**Implementación:**
```
src/
├── Domain/              # Entidades y lógica de negocio
│   ├── Entities/
│   ├── ValueObjects/
│   └── Interfaces/
├── Application/         # Casos de uso y DTOs
│   ├── UseCases/
│   ├── DTOs/
│   └── Interfaces/
├── Infrastructure/      # Implementaciones concretas
│   ├── Data/
│   ├── Services/
│   └── External/
└── Presentation/        # Controllers y UI
    ├── Controllers/
    ├── API/
    └── UI/
```

### Microservicios vs Monolito

**Recomendación Actual:** Monolito Modular
- **Ventajas:** Más simple para empezar, menor complejidad operacional
- **Cuándo considerar microservicios:** Cuando el equipo crezca >10 desarrolladores, cuando haya dominios claramente separados

**Si evoluciona a microservicios:**
- **Servicio de Autenticación:** Manejo de usuarios, roles, permisos
- **Servicio Académico:** Horarios, asignaturas, calificaciones
- **Servicio de Notificaciones:** Email, push, SMS
- **API Gateway:** Enrutamiento, rate limiting, autenticación centralizada

### CQRS (Command Query Responsibility Segregation)

**Aplicación recomendada:**
- **Queries:** Operaciones de lectura optimizadas
- **Commands:** Operaciones de escritura con validaciones
- **Separación:** Diferentes modelos para lectura y escritura

**Implementación:**
```csharp
// Query
public class GetHorarioQuery {
    public int ProfesorId { get; set; }
}

// Command
public class CreateHorarioCommand {
    public string Asignatura { get; set; }
    public DateTime FechaInicio { get; set; }
    // Validaciones específicas de comando
}
```

### Event-Driven Architecture

**Recomendación:** Implementar para eventos críticos
- **Eventos:** UsuarioCreado, CalificacionRegistrada, HorarioActualizado
- **Event Bus:** RabbitMQ, Azure Service Bus, AWS SQS
- **Consumers:** Envío de email, notificaciones, auditoría

**Ejemplo:**
```
UsuarioCreado → Event Bus → 
  → EmailService (enviar bienvenida)
  → AuditService (registrar creación)
  → NotificationService (notificar admin)
```

### Caching Strategy

**Niveles de caché:**
1. **Client-side:** LocalStorage para datos de usuario
2. **API-level:** MemoryCache para datos frecuentes
3. **Database-level:** Supabase cache para queries complejas
4. **CDN:** Para assets estáticos

**Estrategia:**
- **Cache-aside:** API verifica caché antes de BD
- **TTL:** 5 minutos para datos dinámicos, 1 hora para estáticos
- **Invalidation:** Manual al actualizar datos críticos

---

## 7. Buenas Prácticas de Seguridad

### Autenticación y Autorización

**JWT Best Practices:**
- **Access Token:** Expiración corta (15-30 minutos)
- **Refresh Token:** Expiración larga (7-30 días)
- **Algoritmo:** RS256 (asimétrico) en producción
- **Claims:** Mínimo necesario (userId, email, role)
- **Storage:** HttpOnly cookies para refresh tokens

**Password Security:**
- **Hashing:** BCrypt o Argon2 con factor de costo adecuado
- **Salt:** Automático en BCrypt
- **Complexity:** Mínimo 8 caracteres, mayúscula, número, especial
- **Expiration:** Forzar cambio cada 90 días
- **History:** No permitir reuso de últimas 5 contraseñas

### Protección de API

**Rate Limiting:**
- **Endpoints públicos:** 10 requests/minuto por IP
- **Endpoints autenticados:** 100 requests/minuto por usuario
- **Endpoints críticos:** 5 requests/minuto

**Input Validation:**
- **Server-side:** Siempre validar, nunca confiar en cliente
- **DTOs:** Usar FluentValidation o Data Annotations
- **Sanitization:** Limpiar HTML, SQL injection prevention
- **Length limits:** Limitar tamaño de inputs

**CORS Configuration:**
```json
{
  "AllowedOrigins": ["https://tudominio.com"],
  "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "AllowedHeaders": ["Content-Type", "Authorization"],
  "AllowCredentials": true
}
```

### Seguridad en Base de Datos

**Row Level Security (RLS):**
- **Políticas por rol:** Cada rol ve solo sus datos
- **Tenant isolation:** Si es multi-tenant
- **Audit logging:** Registrar accesos

**Encryption:**
- **At rest:** Supabase encripta por defecto
- **In transit:** SSL/TLS obligatorio
- **Field-level:** Considerar para datos sensibles (PII)

**Backups:**
- **Frequency:** Diario incremental, semanal completo
- **Retention:** 30 días
- **Testing:** Restaurar mensualmente para verificar
- **Off-site:** Almacenamiento geográficamente distribuido

### Seguridad en Frontend

**XSS Prevention:**
- **React:** Auto-escapa por defecto
- **dangerouslySetInnerHTML:** Evitar, sanitizar si es necesario
- **CSP:** Content Security Policy headers

**CSRF Protection:**
- **SameSite cookies:** Strict para auth cookies
- **Anti-CSRF tokens:** Para operaciones state-changing
- **Origin verification:** Validar headers

**Sensitive Data:**
- **No almacenar:** Tokens en localStorage (usar HttpOnly cookies)
- **No exponer:** Datos sensibles en console.log
- **Memory leaks:** Limpiar datos sensibles al logout

### Monitoreo y Logging

**Security Events:**
- **Login failures:** Alertar después de 5 intentos
- **Suspicious activity:** IPs desconocidas, horarios inusuales
- **Privilege escalation:** Cambios de rol
- **Data access:** Acceso a datos sensibles

**Logging:**
- **Structured logs:** JSON format
- **Correlation IDs:** Para rastrear requests
- **PII removal:** No loggear datos personales
- **Retention:** 90 días para logs de seguridad

### Compliance

**GDPR (si aplica):**
- **Right to deletion:** Endpoint para eliminar datos
- **Right to export:** Endpoint para exportar datos
- **Consent management:** Registro de consentimientos
- **Data minimization:** Solo recolectar datos necesarios

**SOC 2 (si aplica):**
- **Access controls:** MFA para administradores
- **Change management:** Aprobaciones para cambios
- **Incident response:** Procedimientos documentados
- **Documentation:** Políticas y procedimientos actualizados

---

## 8. Mejoras Futuras

### Corto Plazo (1-3 meses)

**Performance:**
- **Implementar caching:** Redis para datos frecuentes
- **Optimizar queries:** Índices adicionales en BD
- **Lazy loading:** Para listas grandes en frontend
- **Code splitting:** Reducir bundle size de React

**UX/UI:**
- **Loading states:** Skeletons, spinners
- **Error boundaries:** Manejo elegante de errores
- **Offline support:** Service Workers para PWA
- **Dark mode:** Tema oscuro

**Testing:**
- **Unit tests:** Cobertura >80% para services críticos
- **Integration tests:** Para endpoints principales
- **E2E tests:** Playwright o Cypress para flujos críticos
- **Load testing:** K6 para probar escalabilidad

### Medio Plazo (3-6 meses)

**Features:**
- **Notificaciones en tiempo real:** WebSockets o Supabase Realtime
- **Chat/mensajería:** Entre profesores y alumnos
- **File upload:** Para tareas, materiales
- **Video conferencing:** Integración con Jitsi o similar
- **Mobile app:** React Native o PWA mejorada

**Architecture:**
- **Event sourcing:** Para auditoría avanzada
- **CQRS:** Para operaciones complejas
- **Message queue:** Para procesos asíncronos
- **API versioning:** Para evolución backward-compatible

**DevOps:**
- **CI/CD pipeline:** GitHub Actions o GitLab CI
- **Automated testing:** En pipeline de CI/CD
- **Infrastructure as Code:** Terraform o AWS CDK
- **Monitoring:** Prometheus + Grafana

### Largo Plazo (6-12 meses)

**Scalability:**
- **Microservices:** Si el equipo crece significativamente
- **Database sharding:** Para datos masivos
- **CDN global:** Para mejor performance mundial
- **Multi-region:** Para alta disponibilidad

**Advanced Features:**
- **AI/ML:** Recomendaciones de asignaturas, predicción de rendimiento
- **Analytics:** Dashboards avanzados para administración
- **Integraciones:** SIS (Student Information System), LMS
- **Gamification:** Puntos, badges, leaderboards

**Enterprise:**
- **SSO:** Single Sign-On con LDAP/Active Directory
- **Multi-tenant:** Para múltiples instituciones
- **White-label:** Personalización por cliente
- **SLA monitoring:** Contratos de nivel de servicio

### Technical Debt Management

**Prioridades:**
1. **Security:** Siempre prioridad #1
2. **Performance:** Impacta experiencia de usuario
3. **Maintainability:** Facilita desarrollo futuro
4. **Test coverage:** Reduce bugs en producción

**Estrategia:**
- **20% time:** Dedicar tiempo cada sprint a technical debt
- **Refactoring:** Continuo, no en grandes bloques
- **Documentation:** Mantener actualizada
- **Code reviews:** Estrictos para prevenir deuda

---

## Conclusión

Esta documentación de arquitectura proporciona una visión completa del sistema Plataforma Escolar, desde el nivel más alto (contexto) hasta el nivel más detallado (código). Los diagramas PlantUML proporcionados están listos para usar y pueden ser renderizados en cualquier herramienta compatible con PlantUML.

La arquitectura propuesta sigue principios de diseño sólidos, buenas prácticas de seguridad y está preparada para escalar conforme el proyecto crezca. Las recomendaciones de mejoras futuras proporcionan una hoja de ruta clara para la evolución del sistema.

**Próximos pasos recomendados:**
1. Revisar y validar la arquitectura con el equipo
2. Crear el repositorio con la estructura propuesta
3. Implementar los diagramas en la herramienta de documentación
4. Establecer procesos de revisión de arquitectura
5. Documentar decisiones arquitectónicas (ADRs) conforme evolucione el proyecto

---

**Documento generado por:** Senior Software Architect  
**Fecha:** Mayo 2026  
**Versión:** 1.0  
**Estado:** Aprobado para implementación
