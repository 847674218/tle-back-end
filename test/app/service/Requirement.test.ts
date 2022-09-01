import { app } from "egg-mock/bootstrap";
import * as assert from "power-assert";
import {
  IRequirement,
  IRequirementDescription,
  IDescriptionHistory,
} from "../../../app/entity/types";
import { requirementMock } from "../../../app/mock/Requirement.mock";
import { requirementDescriptionMocks } from "../../../app/mock/RequirementDescription";

describe("test/app/service/Requirement.test.ts", () => {
  afterEach(async () => {
    const ctx = app.mockContext();

    // delete all requirement
    const requirements: IRequirement[] = await ctx.service.cRUD.read(
      {},
      ctx.model.Requirement
    );
    console.warn(
      `[afterEach] Going to delete '${requirements.length}' [Requirement] document`
    );
    for (const requirement of requirements) {
      await ctx.service.requirement.delete(
        requirement.relatedRepoOwnerId!,
        requirement._id
      );
    }

    // delete all description history
    const histories: IDescriptionHistory[] = await ctx.service.cRUD.read(
      {},
      ctx.model.DescriptionHistory
    );
    console.warn(
      `[afterEach] Going to delete '${histories.length}' [DescriptionHistory] document`
    );
    for (const history of histories) {
      await ctx.service.cRUD.delete(history, ctx.model.DescriptionHistory);
    }
  });

  it("should add requirement", async () => {
    const ctx = app.mockContext();
    const requirement: IRequirement = requirementMock;

    const id = await ctx.service.requirement.create(requirement);
    assert(typeof id === "string");

    const found = await ctx.service.requirement.findById(id);

    assert(found?._id.toString() === id);
    assert(Array.isArray(found?.descriptions));

    const found2 = await ctx.service.requirement.findByRepoName(
      requirement.relatedRepoOwnerId!,
      requirement.relatedRepoName
    );
    assert(found2?._id.toString() === id);
    assert(Array.isArray(found2?.descriptions));
  });

  it("should delete requirement", async () => {
    const ctx = app.mockContext();
    const requirement: IRequirement = requirementMock;

    const id = await ctx.service.requirement.create(requirement);
    assert(typeof id === "string");

    await ctx.service.requirement.delete(requirement.relatedRepoOwnerId!, id);
  });

  it("should add description", async () => {
    const ctx = app.mockContext();
    const requirement: IRequirement = requirementMock;

    const id = await ctx.service.requirement.create(requirement);
    assert(typeof id === "string");

    const description: IRequirementDescription = requirementDescriptionMocks[0];

    const newRequirement: IRequirement = await ctx.service.requirement.addDescription(
      requirement.relatedRepoOwnerId!,
      id,
      description
    );

    // console.log(newRequirement);
    assert(
      (newRequirement.descriptions.length = requirement.descriptions.length + 1)
    );
  });

  it("should update description", async () => {
    const ctx = app.mockContext();
    const requirement: IRequirement = requirementMock;

    const id = await ctx.service.requirement.create(requirement);
    assert(typeof id === "string");

    const { descriptions } = (await ctx.service.requirement.findById(
      id
    )) as IRequirement;

    let description: IRequirementDescription = descriptions[0];
    description.name = "TESTING UPDATE DESCRIPTION NAME";

    const newRequirement: IRequirement = await ctx.service.requirement.updateDescription(
      requirement.relatedRepoOwnerId!,
      id,
      description
    );

    const found = newRequirement.descriptions.filter(
      (item) => item._id.toString() === description._id.toString()
    )[0];
    assert(found.name === description.name);

    const descriptionHistory: IDescriptionHistory[] = await ctx.service.requirement.getDescriptionHistory(
      requirement.relatedRepoOwnerId!,
      id,
      found._id
    );
    // console.log(descriptionHistory);
    assert(descriptionHistory.length === 1);
    assert(descriptionHistory[0].newDescription.name === description.name);
  });
});
