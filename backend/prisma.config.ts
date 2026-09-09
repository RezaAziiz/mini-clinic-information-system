import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        schema: 'prisma/schema.prisma',
        seed: 'node prisma/seed.js',
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
