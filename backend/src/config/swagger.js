import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DataOps Control Center API',
      version: '0.2.0',
      description: 'API REST para monitoreo y administración de bases de datos — Práctica Final BD II',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Desarrollo local / Docker' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            expiresIn: { type: 'string' },
            user: { type: 'object' },
          },
        },
        ConnectionInput: {
          type: 'object',
          required: ['nombre', 'motor', 'host', 'port', 'database', 'usuario', 'password'],
          properties: {
            nombre: { type: 'string', example: 'Postgres pruebas' },
            motor: { type: 'string', enum: ['ORACLE', 'SQL_SERVER', 'POSTGRESQL'] },
            host: { type: 'string', example: 'localhost' },
            port: { type: 'integer', example: 5433 },
            database: { type: 'string', example: 'testdb' },
            usuario: { type: 'string', example: 'testuser' },
            password: { type: 'string', example: 'testpass' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ERROR'] },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
