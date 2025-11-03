import dotenv from 'dotenv'

dotenv.config()


export const DB_CONFIG = {
  ENGINE: "mongo", // can be switched to "mysql" or "postgres" later
  MYSQL: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  MONGO: {
    uri: process.env.MONGO_URI
  },
  POSTGRES: {
    host: "localhost",
    user: "postgres",
    password: "yourpassword",
    database: "manage_bucket",
  },
};

