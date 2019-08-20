import winston from "winston";

import { getSession } from "../carwings";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const session = getSession("user@example.com", "SOMEPASS");
session
  .request("InitialApp_v2.php", {
    RegionCode: session.regionCode,
    lg: "en-US"
  })
  .then(result => {
    logger.info(`result: ${JSON.stringify(result)}`);
  });
