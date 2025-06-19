const config = {
    PORT: process.env.PORT || 8001,
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    DB_NAME: process.env.DB_NAME || ''
}

export default config;