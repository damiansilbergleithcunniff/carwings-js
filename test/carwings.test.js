import sinon from "sinon";
import axios from "axios";
import * as carwings from "../src/carwings";

describe("getSession", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("sets inputs correctly", () => {
    const session = carwings.getSession("one", "two", "three");
    expect(session.username).toBe("one");
    expect(session.password).toBe("two");
    expect(session.regionCode).toBe("three");
    expect(session.loggedIn).toBe(false);
    expect(session.customSessionId).toBe(null);
  });

  it("request succeeds, returns result", async () => {
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
});
