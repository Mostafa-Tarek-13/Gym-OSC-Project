export const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Gym Booking API',
        version: '1.0.0',
        description: 'API for gym class discovery, authentication, and member bookings.',
    },
    servers: [{ url: '/', description: 'Current server' }],
    tags: [
        { name: 'Health', description: 'Service status' },
        { name: 'Authentication', description: 'Member and trainer authentication' },
        { name: 'Classes', description: 'Gym class discovery' },
        { name: 'Bookings', description: 'Member class bookings' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: { message: { type: 'string' } },
                required: ['message'],
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '665f1a2b3c4d5e6f78901234' },
                    fullName: { type: 'string', example: 'Alex Member' },
                    email: { type: 'string', format: 'email', example: 'alex@example.com' },
                    role: { type: 'string', enum: ['member', 'trainer'], example: 'member' },
                },
                required: ['id', 'fullName', 'email', 'role'],
            },
            AuthCredentials: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6, format: 'password' },
                },
                required: ['email', 'password'],
            },
            RegisterRequest: {
                allOf: [
                    { $ref: '#/components/schemas/AuthCredentials' },
                    {
                        type: 'object',
                        properties: {
                            fullName: { type: 'string', example: 'Alex Member' },
                            role: { type: 'string', enum: ['member', 'trainer'], default: 'member' },
                        },
                        required: ['fullName'],
                    },
                ],
            },
            ClassSession: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string', example: 'Morning Yoga' },
                    trainer: { $ref: '#/components/schemas/User' },
                    timeSlot: {
                        type: 'object',
                        properties: {
                            start: { type: 'string', format: 'date-time' },
                            end: { type: 'string', format: 'date-time' },
                        },
                        required: ['start', 'end'],
                    },
                    capacity: { type: 'integer', minimum: 1 },
                    spotsRemaining: { type: 'integer', minimum: 0 },
                },
                required: ['title', 'trainer', 'timeSlot', 'capacity'],
            },
            Booking: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    session: { type: 'string' },
                    member: { type: 'string' },
                    status: { type: 'string', enum: ['booked', 'cancelled'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
                required: ['session', 'member', 'status'],
            },
        },
    },
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Check API health',
                responses: { '200': { description: 'Service is healthy' } },
            },
        },
        '/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a user',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
                },
                responses: {
                    '201': {
                        description: 'User registered',
                        content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } },
                    },
                    '400': { description: 'Invalid input', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    '409': { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/auth/signin': {
            post: {
                tags: ['Authentication'],
                summary: 'Sign in',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthCredentials' } } },
                },
                responses: {
                    '200': {
                        description: 'Authentication token',
                        content: { 'application/json': { schema: { type: 'object', properties: { userId: { type: 'string' }, role: { type: 'string', enum: ['member', 'trainer'] }, token: { type: 'string' } }, required: ['userId', 'role', 'token'] } } },
                    },
                    '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/classes': {
            get: {
                tags: ['Classes'],
                summary: 'Search class sessions',
                parameters: [
                    { name: 'title', in: 'query', schema: { type: 'string' } },
                    { name: 'trainer', in: 'query', schema: { type: 'string' } },
                    { name: 'day', in: 'query', schema: { type: 'string', enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] } },
                    { name: 'startTime', in: 'query', description: 'HH:mm', schema: { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' } },
                    { name: 'endTime', in: 'query', description: 'HH:mm', schema: { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' } },
                    { name: 'minSpots', in: 'query', schema: { type: 'integer', minimum: 0 } },
                    { name: 'maxSpots', in: 'query', schema: { type: 'integer', minimum: 0 } },
                ],
                responses: {
                    '200': { description: 'Matching classes', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, count: { type: 'integer' }, data: { type: 'array', items: { $ref: '#/components/schemas/ClassSession' } } }, required: ['success', 'count', 'data'] } } } },
                    '400': { description: 'Invalid filters', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/bookings': {
            post: {
                tags: ['Bookings'],
                summary: 'Book a class session',
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } } } },
                responses: { '201': { description: 'Booking created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } }, '401': { description: 'Authentication required' }, '403': { description: 'Member role required' }, '400': { description: 'Booking failed' } },
            },
        },
        '/bookings/my-bookings': {
            get: {
                tags: ['Bookings'],
                summary: 'List the authenticated member bookings',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Member bookings', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, count: { type: 'integer' }, data: { type: 'array', items: { $ref: '#/components/schemas/Booking' } } } } } } }, '401': { description: 'Authentication required' }, '403': { description: 'Member role required' } },
            },
        },
        '/bookings/{sessionId}/cancel': {
            patch: {
                tags: ['Bookings'],
                summary: 'Cancel a class booking',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '201': { description: 'Booking cancelled', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } }, '401': { description: 'Authentication required' }, '403': { description: 'Member role required' }, '400': { description: 'Cancellation failed' } },
            },
        },
    },
};
