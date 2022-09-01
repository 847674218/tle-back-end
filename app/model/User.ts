// 已重构
// 用户信息表
import { Schema } from "mongoose";

// const User = {
//   _id,
//   email,
//   password,
//   role,
//   userName,
//   organization,
//   githubId,
//   createAt,
//   lastUpdateAt,
// }

export default (app: { mongoose: any; }) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema: Schema = new Schema(
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, required: true },
      organization: { type: String, default: null },
      program: { type: String, default: null },
      userName: { type: String, default: null },
      githubId: { type: String, default: null },
      createAt: { type: Number, default: Date.now() },
      lastUpdateAt: { type: Number, default: Date.now() },
    },
    {
      // 时间戳
      timestamps: {
        createdAt: "createAt",
        updatedAt: "lastUpdateAt",
      },
    }
  );

  return mongoose.model("User", UserSchema, "User");
}