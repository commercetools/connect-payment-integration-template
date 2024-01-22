import * as dotenv from 'dotenv';
dotenv.config();

import { config } from "./config/config";
import { setupFastify } from "./server";

(async () => {
    const server = await setupFastify();
  
    try {
      await server.listen({
        port: config.serverPort,
        host: config.serverHost,
      });
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  })();