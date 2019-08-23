import winston from "winston";
import config from "./config";
import { sleep } from "../utils";

import { createSession } from "../carwings";

const POLL_RESULT_INTERVAL = 10000;

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
  .then(async () => {
    // STOP
    const stopResultKey = await session.leafRemote.stopClimateControl();

    let climateResultStop = await session.leafRemote.getStopClimateControlRequest(
      stopResultKey
    );
    /* eslint-disable no-await-in-loop */
    while (!climateResultStop) {
      logger.warn(
        `Climate stop result not ready yet.  Sleeping: ${POLL_RESULT_INTERVAL /
          1000} seconds`
      );
      await sleep(POLL_RESULT_INTERVAL);
      climateResultStop = await session.leafRemote.getStopClimateControlRequest(
        stopResultKey
      );
    }
    logger.warn("Climate Stop Succeeded!!!");
  });
