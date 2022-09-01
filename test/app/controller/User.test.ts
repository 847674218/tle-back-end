import { app } from "egg-mock/bootstrap";
import * as assert from "power-assert";
import { IUser } from "./../../../app/entity/User";

describe("test/app/controller/User.test.ts", () => {
  afterEach(async () => {
    const ctx = app.mockContext();
    const users: IUser[] = await ctx.service.cRUD.read({}, ctx.model.User);
    for (const user of users) {
      await ctx.service.cRUD.delete(user, ctx.model.User);
    }

    const salt: any = await ctx.service.cRUD.read({}, ctx.model.SaltTable);
    for (const i of salt) {
      await ctx.service.cRUD.delete(i, ctx.model.SaltTable);
    }
  });

  it("should log in and registry", async () => {
    const user = { email: "jkljiojo@gmail.com", password: "jlksjkdaklfjaosd" };
    const registryRes = await app
      .httpRequest()
      .post("/api/auth/registry")
      .send(user);
    assert(registryRes.body.success);

    const logInRes = await app.httpRequest().post("/api/auth/login").send(user);
    assert(logInRes.body.success);
    assert(typeof logInRes.body.payload.token === "string");
  });
});
