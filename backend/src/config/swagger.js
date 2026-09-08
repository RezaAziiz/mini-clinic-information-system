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
                url: 'http://localhost:3000',
                description: 'Local development server'
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
                name: 'Doctors',
                description: 'Doctor management'
            },
            {
                name: 'Polyclinics',
                description: 'Polyclinic management'
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