import type { OpenAPIV3 } from 'openapi-types'

const bearerAuth: OpenAPIV3.SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT de sesión de Supabase. Incluir como: `Authorization: Bearer <token>`',
}

// ─── Schemas reutilizables ────────────────────────────────────────────────────

const GameObject: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id:               { type: 'string', format: 'uuid' },
    title:            { type: 'string', example: 'Elden Ring' },
    slug:             { type: 'string', example: 'elden-ring' },
    description:      { type: 'string', nullable: true },
    price:            { type: 'number', format: 'float', example: 59.99 },
    cover_url:        { type: 'string', format: 'uri', nullable: true },
    banner_url:       { type: 'string', format: 'uri', nullable: true },
    genre:            { type: 'string', example: 'RPG', nullable: true },
    platform:         { type: 'string', example: 'PC', nullable: true },
    stock:            { type: 'integer', example: 100 },
    discount_percent: { type: 'integer', minimum: 0, maximum: 95, example: 20 },
    trailer_url:      { type: 'string', format: 'uri', nullable: true },
    screenshots:      { type: 'array', items: { type: 'string', format: 'uri' } },
    release_date:     { type: 'string', format: 'date', nullable: true },
    developer:        { type: 'string', nullable: true },
    created_at:       { type: 'string', format: 'date-time' },
  },
}

const GameInput: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['title', 'slug', 'price'],
  properties: {
    title:            { type: 'string', minLength: 1, maxLength: 200, example: 'Elden Ring' },
    slug:             { type: 'string', pattern: '^[a-z0-9-]+$', example: 'elden-ring' },
    description:      { type: 'string', maxLength: 2000 },
    price:            { type: 'number', format: 'float', minimum: 0.01, example: 59.99 },
    cover_url:        { type: 'string', format: 'uri' },
    banner_url:       { type: 'string', format: 'uri' },
    genre:            { type: 'string', maxLength: 100 },
    platform:         { type: 'string', maxLength: 100 },
    stock:            { type: 'integer', minimum: 0, default: 0 },
    discount_percent: { type: 'integer', minimum: 0, maximum: 95, default: 0 },
    trailer_url:      { type: 'string', format: 'uri' },
    screenshots:      { type: 'array', items: { type: 'string', format: 'uri' } },
    release_date:     { type: 'string', format: 'date' },
    developer:        { type: 'string', maxLength: 150 },
  },
}

const SuccessWrapper = (dataSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data:    dataSchema,
  },
})

const ErrorResponse: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        code:    { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'No autenticado' },
      },
    },
  },
}

// ─── Spec ─────────────────────────────────────────────────────────────────────

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title:       'BosStore API',
    version:     '1.0.0',
    description: `REST API del proyecto BosStore — tienda de videojuegos digitales.\n\nBase URL: \`http://localhost:4000/api/v1\`\n\n**Autenticación:** JWT Bearer token obtenido al iniciar sesión con Supabase Auth.`,
    contact: {
      name:  'BosStore Dev',
      email: 'juan.aguirre.s@tecsup.edu.pe',
    },
  },
  servers: [
    { url: 'http://localhost:4000/api/v1', description: 'Desarrollo local' },
  ],
  components: {
    securitySchemes: { bearerAuth },
    schemas: {
      Game:          GameObject,
      GameInput,
      ErrorResponse,
    },
  },
  tags: [
    { name: 'Health',   description: 'Estado del servidor' },
    { name: 'Auth',     description: 'Registro con OTP por email' },
    { name: 'Games',    description: 'Catálogo de videojuegos' },
    { name: 'Orders',   description: 'Órdenes del usuario autenticado' },
    { name: 'Payments', description: 'Checkout con Stripe' },
    { name: 'Uploads',  description: 'Subida de imágenes a Supabase Storage' },
  ],
  paths: {

    // ── Health ───────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags:    ['Health'],
        summary: 'Verificar estado del servidor',
        responses: {
          '200': {
            description: 'Servidor activo',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } },
          },
        },
      },
    },

    // ── Auth ─────────────────────────────────────────────────────────────────
    '/auth/register/request': {
      post: {
        tags:    ['Auth'],
        summary: 'Solicitar código OTP de registro',
        description: 'Envía un código de 6 dígitos al email indicado. También reenvía el código si el email ya tiene uno pendiente.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:     { type: 'string', format: 'email', example: 'usuario@example.com' },
                  password:  { type: 'string', minLength: 6, example: 'MiPassword123' },
                  full_name: { type: 'string', maxLength: 120, example: 'Juan Aguirre' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Código enviado al email', content: { 'application/json': { schema: SuccessWrapper({ type: 'object', properties: { message: { type: 'string', example: 'Código enviado' } } }) } } },
          '400': { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/auth/register/verify': {
      post: {
        tags:    ['Auth'],
        summary: 'Verificar código OTP y crear cuenta',
        description: 'Valida el código de 6 dígitos y crea el usuario en Supabase Auth con rol `cliente`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'usuario@example.com' },
                  code:  { type: 'string', pattern: '^\\d{6}$', example: '482910' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Cuenta creada exitosamente', content: { 'application/json': { schema: SuccessWrapper({ type: 'object', properties: { message: { type: 'string' } } }) } } },
          '400': { description: 'Código inválido o expirado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ── Games ────────────────────────────────────────────────────────────────
    '/games': {
      get: {
        tags:    ['Games'],
        summary: 'Listar catálogo de juegos',
        description: 'Retorna todos los juegos. Acepta búsqueda por texto con el parámetro `q`.',
        parameters: [
          { name: 'q', in: 'query', required: false, schema: { type: 'string' }, description: 'Texto a buscar en título, género o plataforma' },
        ],
        responses: {
          '200': {
            description: 'Lista de juegos',
            content: { 'application/json': { schema: SuccessWrapper({ type: 'array', items: { $ref: '#/components/schemas/Game' } }) } },
          },
        },
      },
      post: {
        tags:     ['Games'],
        summary:  'Crear juego (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GameInput' } } },
        },
        responses: {
          '201': { description: 'Juego creado', content: { 'application/json': { schema: SuccessWrapper({ $ref: '#/components/schemas/Game' }) } } },
          '400': { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '403': { description: 'Requiere rol admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/games/{slug}': {
      get: {
        tags:    ['Games'],
        summary: 'Obtener juego por slug',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'elden-ring' },
        ],
        responses: {
          '200': { description: 'Detalle del juego', content: { 'application/json': { schema: SuccessWrapper({ $ref: '#/components/schemas/Game' }) } } },
          '404': { description: 'Juego no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      patch: {
        tags:     ['Games'],
        summary:  'Actualizar juego (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/GameInput' }], description: 'Todos los campos son opcionales en PATCH' } } },
        },
        responses: {
          '200': { description: 'Juego actualizado', content: { 'application/json': { schema: SuccessWrapper({ $ref: '#/components/schemas/Game' }) } } },
          '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '403': { description: 'Requiere rol admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '404': { description: 'Juego no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      delete: {
        tags:     ['Games'],
        summary:  'Eliminar juego (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Juego eliminado', content: { 'application/json': { schema: SuccessWrapper({ type: 'object', properties: { message: { type: 'string' } } }) } } },
          '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '403': { description: 'Requiere rol admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '404': { description: 'Juego no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ── Orders ───────────────────────────────────────────────────────────────
    '/orders': {
      get: {
        tags:     ['Orders'],
        summary:  'Listar órdenes del usuario',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de órdenes', content: { 'application/json': { schema: SuccessWrapper({ type: 'array', items: { type: 'object' } }) } } },
          '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      post: {
        tags:     ['Orders'],
        summary:  'Crear orden',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '201': { description: 'Orden creada', content: { 'application/json': { schema: SuccessWrapper({ type: 'object' }) } } },
          '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ── Payments ─────────────────────────────────────────────────────────────
    '/payments/checkout': {
      post: {
        tags:     ['Payments'],
        summary:  'Crear sesión de Stripe Checkout',
        security: [{ bearerAuth: [] }],
        description: 'Crea una sesión de Stripe Checkout y devuelve la URL de redirección.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['slug', 'quantity'],
                      properties: {
                        slug:     { type: 'string', example: 'elden-ring' },
                        quantity: { type: 'integer', minimum: 1, example: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'URL de Stripe Checkout',
            content: { 'application/json': { schema: SuccessWrapper({ type: 'object', properties: { url: { type: 'string', format: 'uri' } } }) } },
          },
          '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/payments/confirm': {
      post: {
        tags:     ['Payments'],
        summary:  'Confirmar checkout y registrar orden',
        security: [{ bearerAuth: [] }],
        description: 'Verifica la sesión de Stripe y registra la orden en base de datos. Se llama desde la página de éxito tras volver de Stripe.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['session_id'],
                properties: { session_id: { type: 'string', example: 'cs_test_abc123' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Orden registrada', content: { 'application/json': { schema: SuccessWrapper({ type: 'object' }) } } },
          '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/payments/session/{id}': {
      get: {
        tags:    ['Payments'],
        summary: 'Obtener datos de una sesión de Stripe',
        description: 'Devuelve los datos de una sesión completada. Usado en la página de éxito para mostrar el resumen de compra.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'cs_test_abc123' },
        ],
        responses: {
          '200': { description: 'Datos de la sesión', content: { 'application/json': { schema: SuccessWrapper({ type: 'object' }) } } },
          '404': { description: 'Sesión no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/payments/webhook': {
      post: {
        tags:    ['Payments'],
        summary: 'Webhook de Stripe',
        description: 'Endpoint exclusivo para Stripe. Verifica la firma con `stripe-signature`. **No usar directamente.**',
        parameters: [
          { name: 'stripe-signature', in: 'header', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'string', format: 'binary', description: 'Raw body (Buffer)' } } },
        },
        responses: {
          '200': { description: 'Evento procesado', content: { 'application/json': { schema: { type: 'object', properties: { received: { type: 'boolean' } } } } } },
          '400': { description: 'Firma inválida' },
        },
      },
    },

    // ── Uploads ──────────────────────────────────────────────────────────────
    '/uploads': {
      post: {
        tags:     ['Uploads'],
        summary:  'Subir imagen (admin)',
        security: [{ bearerAuth: [] }],
        description: 'Sube una imagen a Supabase Storage (bucket `game-images`) y devuelve la URL pública. La imagen se envía como base64 en el body JSON.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['file', 'filename'],
                properties: {
                  file:     { type: 'string', description: 'Imagen en base64 (ej: `data:image/png;base64,...`)' },
                  filename: { type: 'string', example: 'cover-elden-ring.jpg' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'URL de la imagen en Storage', content: { 'application/json': { schema: SuccessWrapper({ type: 'object', properties: { url: { type: 'string', format: 'uri' } } }) } } },
          '401': { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '403': { description: 'Requiere rol admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
}
