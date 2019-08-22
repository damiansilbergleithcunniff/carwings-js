import winston from "winston";
import config from "./config";
import { sleep } from "../utils";

import { createSession } from "../carwings";

const POLL_RESULT_INTERVAL = 10000;
const POLL_LIMIT = 100;

const logger = winston;
winston.configure({
  level: "warn",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const session = createSession(config.username, config.password);
session
  .connect()
  .catch(er => {
    logger.error(`failed: ${er}`);
  })
  .then(async result => {
    logger.info(`result: ${JSON.stringify(result)}`);

    logger.warn("Requesting battery status update...");
    const resultKey = await session.leafRemote.requestUpdate();
    await sleep(1000);

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < POLL_LIMIT; i += 1) {
      logger.warn(
        `${i + 1} of ${POLL_LIMIT}: Checking battery status update result...`
      );
      const batteryStatus = await session.leafRemote.getStatusFromUpdate(
        resultKey
      );
      logger.warn(`Battery Status: ${JSON.stringify(batteryStatus, null, 2)}`);
      logger.warn(`Sleeping for ${POLL_RESULT_INTERVAL / 1000} seconds...`);
      await sleep(POLL_RESULT_INTERVAL);
    }
  });
