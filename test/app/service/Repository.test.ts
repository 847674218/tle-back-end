import { app } from "egg-mock/bootstrap";
import * as assert from "power-assert";
import { IImportedRepository } from "../../../app/entity/types";
import { importedRepositoryMocks } from "../../../app/mock/ImportedRepository.mock";

describe("test/app/service/Repository.test.ts", () => {
  afterEach(async () => {
    const ctx = app.mockContext();

    // delete all repository
    const repositories: IImportedRepository[] = await ctx.service.cRUD.read(
      {},
      ctx.model.Repository
    );
    console.warn(
      `[afterEach] Going to delete '${repositories.length}' [Repository] document`
    );
    for (const repository of repositories) {
      await ctx.service.repository.delete(repository.ownerId, repository._id);
    }
  });

  it("should delete repository", async () => {
    const ctx = app.mockContext();
    const repository: IImportedRepository = importedRepositoryMocks[0];

    const id = await ctx.service.repository.create(repository);
    assert(typeof id === "string");

    const found = await ctx.service.repository.findById(id);

    assert(found?._id.toString() === id);

    await ctx.service.repository.delete(found.ownerId, found._id);

    const found2 = await ctx.service.repository.findById(id);
    assert(!found2);
  });
});
