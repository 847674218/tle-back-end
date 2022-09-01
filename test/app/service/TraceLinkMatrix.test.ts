import { app } from "egg-mock/bootstrap";
import {
  ITraceLinkMatrix,
  IRequirementDescription,
} from "../../../app/entity/types";
import { traceLinkMatrixMocks } from "../../../app/mock/TraceLinkMatrix.mock";
const assert = require("power-assert");

describe("test/app/service/TraceLinkMatrix.test.ts", () => {
  afterEach(async () => {
    const ctx = app.mockContext();

    const matrixs: ITraceLinkMatrix[] = await ctx.service.cRUD.read(
      {},
      ctx.model.TraceLinkMatrix
    );
    console.warn(
      `[afterEach] Going to delete '${matrixs.length}' [TraceLinkMatrix] document`
    );
    for (const matrix of matrixs) {
      await ctx.service.traceLink.delete(matrix.relatedRepoOwnerId, matrix._id);
    }

    // delete requirement description
    const descriptions: IRequirementDescription[] = await ctx.service.cRUD.read(
      {},
      ctx.model.RequirementDescription
    );
    for (const description of descriptions) {
      await ctx.service.cRUD.delete(
        { _id: description._id },
        ctx.model.RequirementDescription
      );
    }
  });

  it("should add trace link matrix", async () => {
    const ctx = app.mockContext();
    const matrix: ITraceLinkMatrix = traceLinkMatrixMocks;
    const id = await ctx.service.traceLink.create(matrix);
    assert(typeof id === "string");

    const found: ITraceLinkMatrix | null = await ctx.service.traceLink.findById(
      id
    );
    assert(!!found);
    assert(found?._id.toString() === id);
    assert(found?.relatedRepoName === matrix.relatedRepoName);
  });

  it("should find by repo name", async () => {
    const ctx = app.mockContext();
    const matrix: ITraceLinkMatrix = traceLinkMatrixMocks;
    const id = await ctx.service.traceLink.create(matrix);
    assert(typeof id === "string");

    const found: ITraceLinkMatrix | null = await ctx.service.traceLink.findByRepoName(
      matrix.relatedRepoOwnerId,
      matrix.relatedRepoName
    );
    assert(!!found);
    assert(found?._id.toString() === id);
    assert(found?.relatedRepoName === matrix.relatedRepoName);
  });

  it("should delete trace link", async () => {
    const ctx = app.mockContext();
    const matrix: ITraceLinkMatrix = traceLinkMatrixMocks;
    const id = await ctx.service.traceLink.create(matrix);
    assert(typeof id === "string");

    const found: ITraceLinkMatrix | null = await ctx.service.traceLink.findByRepoName(
      matrix.relatedRepoOwnerId,
      matrix.relatedRepoName
    );
    assert(!!found);
    assert(found?._id.toString() === id);
    assert(found?.relatedRepoName === matrix.relatedRepoName);

    await ctx.service.traceLink.deleteTraceLink(
      matrix.relatedRepoOwnerId,
      //@ts-ignore
      found._id,
      //@ts-ignore
      found.links[0]
    );

    const found2: ITraceLinkMatrix | null = await ctx.service.traceLink.findByRepoName(
      matrix.relatedRepoOwnerId,
      matrix.relatedRepoName
    );
    assert(!!found2);
    assert(found2?._id.toString() === id);
    assert(found2?.relatedRepoName === matrix.relatedRepoName);
    //@ts-ignore
    assert(found2.links.length + 1 === found.links.length);
  });
});
