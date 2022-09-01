// 已重构
// 需求规约表
export default (app: { mongoose: any; }) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RequirementDescriptionSchema = new Schema(
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      priority: { type: String },
      participants: { type: String },
      triggeringCondition: { type: String },
      preCondition: { type: String },
      postCondition: { type: String },
      normalProcess: { type: String },
      expansionProcess: { type: String },
      specialNeeds: { type: String },
      createBy: { type: String },
      createAt: { type: Number, default: Date.now() },
      lastUpdateBy: { type: String },
      lastUpdateAt: { type: Number, default: Date.now() },
    },
    {
      timestamps: {
        createdAt: "createAt",
        updatedAt: "lastUpdateAt"
      },
    }
  );

  return mongoose.model("RequirementDescription", RequirementDescriptionSchema, "RequirementDescription");
};