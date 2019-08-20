import winston from "winston";
import config from "./config";

import { getSession } from "../carwings";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const session = getSession(config.username, config.password);
session
  .connect()
  .catch(er => {
    logger.error(`failed: ${er}`);
  })
  .then(result => {
    logger.info(`result: ${JSON.stringify(result)}`);
  });
