# Orders System — Prueba Técnica Senior Backend

Sistema de gestión de órdenes compuesto por dos microservicios que se comunican vía TCP.

## Stack

- **NestJS** — framework principal
- **PostgreSQL + TypeORM** — persistencia de órdenes
- **MongoDB + Mongoose** — persistencia de logs de auditoría
- **Docker + Docker Compose** — infraestructura local
- **JWT** — autenticación

## Requisitos

- Node.js >= 18
- Docker y Docker Compose

## Levantar el proyecto

### 1. Clonar el repositorio

```bash
git clone 
cd orders-system
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el `.env` con tus valores o deja los valores por defecto para desarrollo local.

### 3. Levantar todo con Docker

```bash
docker-compose up --build
```

Esto levanta los 4 contenedores:
- `orders_service` — puerto 3000
- `audit_service` — puerto 3001
- `orders_postgres` — puerto 5432
- `audit_mongo` — puerto 27017

### Desarrollo local (opcional)

Si prefieres correr los servicios fuera de Docker:

```bash
# Solo bases de datos en Docker
docker-compose up -d postgres mongo

# Servicios en modo watch
npm run start:dev orders
npm run start:dev audit
```

## Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/login | Obtener JWT |

### Orders
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /orders | Crear orden |
| GET | /orders | Listar órdenes con paginación |
| PUT | /orders/:id/status | Actualizar estado |

### Audit
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /audit/:orderId | Historial de cambios de una orden |

## Autenticación

Todos los endpoints de órdenes requieren JWT. Para obtenerlo:

```bash
POST http://localhost:3000/auth/login
Body: { "secret": "<valor de AUTH_SECRET en .env>" }
```

Usa el token retornado en el header:
Authorization Bearer <Token>

## Comunicación entre servicios

Los servicios se comunican vía **TCP Transport de NestJS** en modo fire-and-forget. Cuando una orden cambia de estado, el servicio de órdenes emite un evento `order.status_changed` al servicio de auditoría sin esperar respuesta. Esto garantiza que el servicio de órdenes no depende de la disponibilidad del servicio de auditoría.

## Decisiones de diseño

### Monorepo
Ambos microservicios viven en un monorepo con el CLI nativo de NestJS. Facilita la entrega, el setup local y comparten el mismo `package.json`.

### Separación de responsabilidades (SOLID)
Cada servicio sigue la separación controller → service → repository:
- **Controller** — recibe y valida la request
- **Service** — lógica de negocio (validación de transiciones, stock mínimo)
- **Repository** — operaciones de base de datos

### Validación de transiciones de estado
Las transiciones válidas están definidas en un mapa `VALID_TRANSITIONS` en el enum de estados. Cualquier transición fuera del mapa retorna `400 Bad Request`.

PENDING → CONFIRMED → SHIPPED → DELIVERED
PENDING → CANCELLED
CONFIRMED → CANCELLED

### Autenticación JWT
Se implementó autenticación via JWT sobre API Key porque permite un flujo de login explícito más cercano a un sistema real. El cliente obtiene un token enviando un secret al endpoint `/auth/login` y lo usa como Bearer token en las siguientes peticiones.

### Logs de auditoría inmutables
Los logs en MongoDB nunca se modifican — solo se insertan. El historial completo de cambios de una orden se puede consultar en `GET /audit/:orderId` ordenado cronológicamente.