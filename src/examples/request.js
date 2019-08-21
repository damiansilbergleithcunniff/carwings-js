import winston from "winston";
import config from "./config";

import { createSession } from "../carwings";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const session = createSession(config.username, config.password);
session
  .request("InitialApp_v2.php", {
    RegionCode: session.regionCode,
    lg: "en-US"
  })
  .then(result => {
    logger.info(`result: ${JSON.stringify(result)}`);
  });
