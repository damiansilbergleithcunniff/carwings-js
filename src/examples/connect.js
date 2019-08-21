import winston from "winston";
import config from "./config";

import { createSession } from "../carwings";

const logger = winston;
winston.configure({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const session = createSession(config.username, config.password);
session
  .connect()
  .catch(er => {
    logger.error(`failed: ${er}`);
  })
  .then(result => {
    logger.info(`result: ${JSON.stringify(result)}`);
  });
