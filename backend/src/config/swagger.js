import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Mini Clinic Information System API',
            version: '1.0.0',
            description: 'REST API for Mini Clinic Information System'
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: process.env.NODE_ENV === 'production'
                    ? 'Production server'
                    : 'Local development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                // Skema standar untuk struktur response API
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operasi berhasil' },
                    }
                },
                // Skema untuk data User
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                // Pagination Meta
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 }
                    }
                },
                // Skema Response Paginated
                PaginatedResponse: {
                    allOf: [
                        { $ref: '#/components/schemas/ApiResponse' },
                        {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        data: { type: 'array', items: {} },
                                        meta: { $ref: '#/components/schemas/PaginationMeta' }
                                    }
                                }
                            }
                        }
                    ]
                },
                // Skema Patient Output
                Patient: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        medicalRecordNumber: { type: 'string' },
                        nik: { type: 'string' },
                        name: { type: 'string' },
                        gender: { type: 'string', enum: ['L', 'P'] },
                        dateOfBirth: { type: 'string', format: 'date-time' },
                        phone: { type: 'string', nullable: true },
                        address: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                // Skema Patient Input
                PatientInput: {
                    type: 'object',
                    required: ['nik', 'name', 'gender', 'dateOfBirth'],
                    properties: {
                        nik: { type: 'string', minLength: 16, maxLength: 16, example: '3201010101010001' },
                        name: { type: 'string', example: 'Budi Santoso' },
                        gender: { type: 'string', enum: ['L', 'P'], example: 'L' },
                        dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
                        phone: { type: 'string', example: '08123456789' },
                        address: { type: 'string', example: 'Jl. Merdeka No. 1' }
                    }
                }
            },
            responses: {
                Unauthorized: {
                    description: 'Tidak terautentikasi (Token tidak valid atau tidak ditemukan)',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiResponse'
                            },
                            example: {
                                success: false,
                                message: 'Token tidak ditemukan',
                                data: null
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validasi input gagal',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiResponse'
                            },
                            example: {
                                success: false,
                                message: 'Validasi gagal',
                                errors: ['email wajib diisi']
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'Authentication and authorization'
            },
            {
                name: 'Patients',
                description: 'Patient management'
            },
            {
                name: 'Registrations',
                description: 'Patient visit registration'
            },
            {
                name: 'Queues',
                description: 'Patient queue management'
            },
            {
                name: 'Medical Records',
                description: 'Medical record management'
            },
            {
                name: 'Prescriptions',
                description: 'Prescription management'
            }
        ]
    },

    apis: ['./src/modules/**/*.route.js']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;