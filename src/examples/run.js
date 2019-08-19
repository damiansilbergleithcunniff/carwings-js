import { getSession } from "../carwings";

const session = getSession("user@example.com", "SOMEPASS");
session
  .request("InitialApp_v2.php", {
    RegionCode: session.regionCode,
    lg: "en-US"
  })
  .then(result => {
    console.log(`result: ${JSON.stringify(result)}`);
  });
