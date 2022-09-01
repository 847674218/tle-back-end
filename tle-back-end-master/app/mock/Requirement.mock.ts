import { IRequirement } from "../entity/types";
import { requirementDescriptionMocks } from "./RequirementDescription";

const fromIndex = Math.round(
  Math.random() * requirementDescriptionMocks.length
);

export const requirementMock: IRequirement = {
  _id: "jkladjf",
  relatedRepoName: "RELATED REPO NAME",
  relatedRepoOwnerId: "RELATED REPO OWNER ID",
  relatedCommitSha: "d87ae5047cbc2a8ad5a7f800e0a8a1c802a6819a",
  descriptions: requirementDescriptionMocks.slice(fromIndex, fromIndex + 10),
};
