import sinon from "sinon";
import axios from "axios";
import * as carwings from "../src/carwings";

describe("getSession", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    carwings.logger.silent = true;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("session", () => {
    it("sets inputs correctly", () => {
      const session = carwings.getSession("one", "two", "three");
      expect(session.username).toBe("one");
      expect(session.password).toBe("two");
      expect(session.regionCode).toBe("three");
      expect(session.loggedIn).toBe(false);
      expect(session.customSessionId).toBe(null);
    });
  });

  describe("request", () => {
    it("succeeds, returns result", async () => {
      const resolved = new Promise(r =>
        r({
          data: {
            status: 200,
            message: "success",
            baseprm: "SOME_BASE_PRM"
          }
        })
      );
      sandbox.stub(axios, "post").returns(resolved);

      const session = carwings.getSession("name", "pass", "region");
      const result = await session.request("ENDPOINT", {});

      expect(result).not.toBeUndefined();
      expect(result.status).toBe(200);
      expect(result.message).toBe("success");
      expect(result.baseprm).toBe("SOME_BASE_PRM");
    });

    describe("returns undefined when", () => {
      it("request returns INVALID PARAMS", async () => {
        const resolved = new Promise(r =>
          r({
            data: {
              status: 404,
              message: "INVALID PARAMS",
              baseprm: ""
            }
          })
        );
        sandbox.stub(axios, "post").returns(resolved);

        const session = carwings.getSession("name", "pass", "region");
        const result = await session.request("ENDPOINT", {});

        expect(result).toBeUndefined();
      });

      it("request returns HTML", async () => {
        const resolved = new Promise(r =>
          r(`<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//END>
            <html<head>
            <title>503 Service Temporarily Unavailable</title>
            </head><body>
            <h1>Service Temporarily Unavailable>
            <p>The server is temporarily unable to service your
            request due to maintenance downtime or capacity
            problems. Please try again later.</p>
            </body></html>`)
        );
        sandbox.stub(axios, "post").returns(resolved);

        const session = carwings.getSession("name", "pass", "region");
        const result = await session.request("ENDPOINT", {});

        expect(result).toBeUndefined();
      });

      it("request has ErrorMessage", async () => {
        const resolved = new Promise(r =>
          r({
            data: {
              status: 200,
              message: "SOMETHING",
              baseprm: "123456",
              ErrorMessage: "Not Empty"
            }
          })
        );
        sandbox.stub(axios, "post").returns(resolved);

        const session = carwings.getSession("name", "pass", "region");
        const result = await session.request("ENDPOINT", {});

        expect(result).toBeUndefined();
      });
    });
  });
});
