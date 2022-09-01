// 已重构
// 跟踪链接表
export default (app: { mongoose: any; }) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const TraceLinkSchema = new Schema(
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      requirementDescriptionName: { type: String, required: true },
      fullyQualifiedName: { type: String, required: true },
      introducer: { type: String, required: true },
      state: { type: String, required: true },
      confirmor: [{ type: String }],
      rejector: [{ type: String }],
      lastUpdateAt: { type: Number, default: Date.now() },
      createAt: { type: Number, default: Date.now() },
    },
    {
      timestamps: {
        createdAt: "createAt",
        updatedAt: "lastUpdateAt"
      }
    }
  );

  return mongoose.model("TraceLink", TraceLinkSchema, "TraceLink");
};