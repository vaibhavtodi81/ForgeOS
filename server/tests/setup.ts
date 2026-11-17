process.env.NODE_ENV = 'test'
process.env.DATABASE_URL ??= 'postgresql://forgeos_user:forgeos_dev_password@localhost:5432/forgeos_test'
process.env.CORS_ORIGIN ??= 'http://localhost:5173'
