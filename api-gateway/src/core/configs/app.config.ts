import dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  KEEP_ALIVE_TIMEOUT: Number(process.env.KEEP_ALIVE_TIMEOUT),
  HEADERS_TIMEOUT: Number(process.env.HEADERS_TIMEOUT),
  SERVER_TIMEOUT: Number(process.env.SERVER_TIMEOUT),
  SHUT_DOWN_TIMER: Number(process.env.SHUT_DOWN_TIMER),
  SHUTDOWN_RETRIES: Number(process.env.SHUTDOWN_RETRIES),
  SHUTDOWN_RETRY_DELAY: Number(process.env.SHUTDOWN_RETRY_DELAY),
  AUTH_ORIGIN_ROUTE: process.env.AUTH_ORIGIN_ROUTE,
  INVOICE_ORIGIN_ROUTE: process.env.INVOICE_ORIGIN_ROUTE,
  ORDER_ORIGIN_ROUTE: process.env.ORDER_ORIGIN_ROUTE
};
