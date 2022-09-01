// 已重构
// 仓库信息表

// const Repository = {
//   name, ownerId, language, description, currentBranch, createAt, lastUpdateAt,
//   branches: [{name}],
//   commits: [
//     {
//       message,
//       committer,
//       committedAt,
//       author,
//       parents,
//       stats: { total, additions, deletions},
//       sha,
//       changedFiles: [
//         {
//           sha
//           filename,
//           status,
//           additions,
//           deletions,
//           patch,
//           rawContent,
//         },
//       ],
//       requirement,
//       traceLinkMatrix
//     },
//   ],
//   trees,
//   shaFileContentMap,
// }
export default (app: { mongoose: any; }) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const TreeNodeSchema = new Schema(
    {
      sha: { type: String },
      // 文件名称（不含路径）
      path: { type: String },
      // 文件全名（带路径）
      fullyQualifiedName: { type: String },
      type: { type: String, enum: ["FOLDER", "FILE"] },
    }
  );

  // 循环添加子树
  TreeNodeSchema.add({ subTrees: [TreeNodeSchema] });

  const RepositorySchema = new Schema(
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      name: { type: Schema.Types.String, required: true },
      ownerId: { type: Schema.Types.String },
      currentBranch: { type: Schema.Types.String },
      language: { type: Schema.Types.String },
      description: { type: Schema.Types.String },
      stakeholders: [{ type: String }],
      branches: [
        {
          name: { type: String, required: true },
          commitHeadSha: { type: String },
        },
      ],
      commits: [
        {
          sha: { type: String },
          message: { type: String },
          committer: { id: { type: String } },
          committedAt: { type: Number },
          author: { id: { type: String } },
          stats: {
            total: { type: Number },
            additions: { type: Number },
            deletions: { type: Number },
          },
          parents: { sha: { type: String, }, },
          changedFiles: [
            {
              sha: { type: String },
              // 带路径的文件名
              filename: { type: String },
              // 状态：修改还是添加
              status: { type: String },
              additions: { type: Number },
              deletions: { type: Number },
              // 补丁：带+—标准的文件
              patch: { type: String },
              // 原始文件
              rawContent: { type: String },
            },
          ],
          requirement: {
            type: Schema.Types.ObjectId,
            ref: "Requirement",
          },
          traceLinkMatrix: {
            type: Schema.Types.ObjectId,
            ref: "TraceLinkMatrix",
          }
        },
      ],
      trees: [TreeNodeSchema],
      // SHA值和文件内容的映射：可以通过SHA值返回文件内容
      shaFileContentMap: { type: Schema.Types.Mixed },
      createAt: { type: Number, default: Date.now() },
      lastUpdateAt: { type: Number, default: Date.now() },
    },
    {
      // 时间戳
      timestampes: {
        createdAt: "createAt",
        updatedAt: "lastUpdateAt"
      },
    }
  );

  return mongoose.model("Repository", RepositorySchema, "Repository");
};