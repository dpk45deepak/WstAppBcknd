import 'dotenv/config';

const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wstapp',
    JWT_SECRET: process.env.JWT_SECRET || 'wstapp_jwt_secret_dev_key_2026_secure',
    DB_NAME: process.env.DB_NAME || 'wstapp'
};

export default config;