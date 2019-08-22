import winston from "winston";
import config from "./config";
import { sleep } from "../utils";

import { createSession } from "../carwings";

const POLL_RESULT_INTERVAL = 10000;
const POLL_LIMIT = 10;

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
    logger.warn("Get battery status before requesting update");
    const initialStatus = await session.leafRemote.getLatestBatteryStatus();
    const initialTime = initialStatus.timestamp;
    await session.leafRemote.requestUpdate();
    await sleep(1000);

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < POLL_LIMIT; i += 1) {
      logger.warn(
        `${i + 1} of ${POLL_LIMIT}: Check if the battery status has updated`
      );
      const batteryStatus = await session.leafRemote.getLatestBatteryStatus();

      logger.info(
        `Original Timestamp: ${initialTime} ?? Updated Timestamp: ${batteryStatus.timestamp}`
      );
      if (batteryStatus.timestamp > initialTime) {
        logger.warn(
          `Battery Status: ${JSON.stringify(batteryStatus, null, 2)}`
        );
        break;
      }

      logger.warn(
        `No update found, sleeping for ${POLL_RESULT_INTERVAL / 1000} seconds`
      );
      await sleep(POLL_RESULT_INTERVAL);
    }
  });
