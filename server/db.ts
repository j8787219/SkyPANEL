import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;

// Patch for ErrorEvent message property TypeError
const originalErrorEventConstructor = global.ErrorEvent;
if (originalErrorEventConstructor) {
  global.ErrorEvent = function(type, eventInit) {
    const event = new originalErrorEventConstructor(type, eventInit);
    // Make message property writable to avoid TypeError
    Object.defineProperty(event, 'message', {
      writable: true,
      configurable: true,
      value: eventInit?.message || ''
    });
    return event;
  };
  global.ErrorEvent.prototype = originalErrorEventConstructor.prototype;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database? you can get a free one from neon.tech",
  );
}

// Create a connection pool with better error handling and retry logic
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduced max connections for better stability
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // Increased timeout for better reliability
});

// Add comprehensive error handling for the connection pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client:', err.message);

  // Don't attempt to release if client is undefined
  if (client) {
    try {
      client.release(true);
    } catch (releaseError) {
      console.error('Error releasing client:', releaseError);
    }
  }
});

// Add connection event logging
pool.on('connect', (client) => {
  console.log('Database client connected');
});

pool.on('remove', (client) => {
  console.log('Database client removed from pool');
});

// Export the database instance with the configured pool
export const db = drizzle({ client: pool, schema });
