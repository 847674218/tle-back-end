// 已重构
// 跟踪矩阵表
export default (app: { mongoose: any; }) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const TraceLinkMatrixSchema = new Schema(
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      relatedRepoName: { type: Schema.Types.String, required: true, },
      relatedRepoOwnerId: { type: Schema.Types.String, required: true },
      relatedCommitSha: { type: Schema.Types.String, required: true },
      links: [
        {
          type: Schema.Types.ObjectId,
          ref: "TraceLink"
        }],
      createAt: { type: Number, default: Date.now() },
      lastUpdateAt: { type: Number, default: Date.now() },
    },
    {
      timestamps: {
        createdAt: "createAt",
        updatedAt: "lastUpdateAt"
      },
    }
  );

  return mongoose.model("TraceLinkMatrix", TraceLinkMatrixSchema, "TraceLinkMatrix");
};