// 已重构
export const RequirementDescriptionSchema = (Schema: any) => {
  return new Schema({
    name: { type: String },
    traced: { type: Boolean },
    participants: { type: String },
    triggeringCondition: { type: String },
    preCondition: { type: String },
    postCondition: { type: String },
    priority: { type: String },
    normalProcess: { type: String },
    expansionProcess: { type: String },
    specialNeeds: { type: String },
  });
};