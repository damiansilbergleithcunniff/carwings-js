import winston from "winston";
import config from "./config";
import { sleep } from "../utils";

import { createSession } from "../carwings";

const POLL_RESULT_INTERVAL = 10000;

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
  .then(async () => {
    // START
    logger.warn("Requesting climate control start");
    const resultKey = await session.leafRemote.startClimateControl();

    logger.warn("Checking climate start result");
    let climateResult = await session.leafRemote.getStartClimateControlRequest(
      resultKey
    );
    /* eslint-disable no-await-in-loop */
    while (!climateResult) {
      logger.warn(
        `Climate start result not ready yet.  Sleeping: ${POLL_RESULT_INTERVAL /
          1000} seconds`
      );
      await sleep(POLL_RESULT_INTERVAL);
      logger.warn("Re-Checking climate start result");
      climateResult = await session.leafRemote.getStartClimateControlRequest(
        resultKey
      );
    }
    logger.warn("Climate Start Succeeded!!!");

    // STOP
    logger.warn("Requesting climate control stop");
    const stopResultKey = await session.leafRemote.stopClimateControl();

    logger.warn("Checking climate stop result");
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
      logger.warn("Re-Checking climate stop result");
      climateResultStop = await session.leafRemote.getStopClimateControlRequest(
        stopResultKey
      );
    }
    logger.warn("Climate Stop Succeeded!!!");
  });
