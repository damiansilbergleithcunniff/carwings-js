/*
When logging in, you must specify a geographic 'region' parameter. The only
known values for this are as follows:

    NNA  : USA
    NE   : Europe
    NCI  : Canada
    NMA  : Australia
    NML  : Japan

Information about Nissan on the web (e.g. http://nissannews.com/en-US/nissan/usa/pages/executive-bios)
suggests others (this page suggests NMEX for Mexico, NLAC for Latin America) but
these have not been confirmed.

There are three asynchronous operations in this API, paired with three follow-up
"status check" methods.

    request_update           -> get_status_from_update
    start_climate_control    -> get_start_climate_control_result
    stop_climate_control     -> get_stop_climate_control_result

The asynchronous operations immediately return a 'result key', which
is then supplied as a parameter for the corresponding status check method.

Here's an example response from an asynchronous operation, showing the result key:

    {
        "status":200,
        "userId":"user@domain.com",
        "vin":"1ABCDEFG2HIJKLM3N",
        "resultKey":"12345678901234567890123456789012345678901234567890"
    }

The status check methods return a JSON blob containing a 'responseFlag' property.
If the communications are complete, the response flag value will be the string "1";
otherwise the value will be the string "0". You just gotta poll until you get a
"1" back. Note that the official app seems to poll every 20 seconds.

Example 'no response yet' result from a status check invocation:

    {
        "status":200,
        "responseFlag":"0"
    }

When the responseFlag does come back as "1", there will also be an "operationResult"
property. If there was an error communicating with the vehicle, it seems that
this field will contain the value "ELECTRIC_WAVE_ABNORMAL". Odd.
*/

import axios from "axios";
import querystring from "querystring";
import winston from "winston";

// Setup logging
const logger = winston.createLogger({
  level: "debug",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const BASE_URL = "https://gdcportalgw.its-mo.com/api_v190426_NE/gdc/";
const DEFAULT_REGION_CODE = "NNA";
const INITIAL_APP_STR = "9s5rfKVuMrT03RtzajWNcA";

export const getSession = (
  username,
  password,
  region = DEFAULT_REGION_CODE
) => {
  const session = {
    username,
    password,
    regionCode: region,
    loggedIn: false,
    customSessionId: null
  };

  const request = async (endpoint, inputParams) => {
    const params = inputParams;
    params.initial_app_str = INITIAL_APP_STR;
    params.custom_sessionid = session.customSessionId
      ? session.customSessionId
      : "";

    const url = BASE_URL + endpoint;

    logger.debug(`invoking carwings API: ${url}`);
    logger.debug(`params: ${JSON.stringify(params)}`);

    let res;
    try {
      res = await axios.post(url, querystring.stringify(params));
      logger.debug(`Response config: ${JSON.stringify(res.config, null, 2)}`);
      logger.debug(`Response HTTP Status Code: ${res.status}`);
      logger.debug(`Response HTTP Response Body: ${JSON.stringify(res.data)}`);
    } catch (ex) {
      logger.warn(`HTTP Request Failed`);
      return undefined;
    }

    /*
     * Nissan servers can return html instead of jSOn on occassion, e.g.
     *
     * <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//END>
     * <html<head>
     *    <title>503 Service Temporarily Unavailable</title>
     * </head><body>
     * <h1>Service Temporarily Unavailable>
     * <p>The server is temporarily unable to service your
     * request due to maintenance downtime or capacity
     * problems. Please try again later.</p>
     * </body></html>
     */
    if (!res.data || typeof res.data === "string") {
      logger.error("Invalid JSON returned");
      return undefined;
    }

    if (res.data.message && res.data.message === "INVALID PARAMS") {
      logger.error(`carwings error ${res.data.message}, ${res.data.status}`);
      return undefined;
    }

    if (res.data.ErrorMessage) {
      logger.error(
        `carwings error ${res.data.ErrorCode}, ${res.data.ErrorMessage}`
      );
      return undefined;
    }

    return res.data;
  };

  session.request = request;
  return session;
};
