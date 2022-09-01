// 已重构
import { Controller } from "egg";
import { OK } from "http-status-codes";
import { extractToken } from "../utils/Token";
import { IRequirement } from "./../entity/types";

export default class RequirementController extends Controller {
  // 把需求存储在数据库中
  public async create() {
    const { ctx } = this;
    const requirement = ctx.request.body;
    const { githubId } = extractToken(ctx, this.config);
    await ctx.service.requirement.create({ ...requirement, relatedRepoOwnerId: githubId });
    ctx.body = { success: true };
    ctx.status = OK;
  }

  // 请求仓库某次提交对应的需求
  public async query() {
    const { ctx } = this;
    const { repoName, commitSha } = ctx.query;
    const { githubId } = extractToken(ctx, this.config);
    const res: IRequirement | null = await ctx.service.requirement.findByRepoNameAndCommitSHA(githubId, repoName, commitSha);
    ctx.body = { success: true, payload: res };
  }

  // 添加单条需求规约
  public async addDescription() {
    const { requirementId } = this.ctx.params;
    const { githubId } = extractToken(this.ctx, this.config);
    const newDescription = this.ctx.request.body;
    const newRequirement: IRequirement = await this.ctx.service.requirement.addDescription(githubId, requirementId, newDescription);
    this.ctx.body = { success: true, payload: newRequirement };
  }

  // 删除单条需求规约（返回更新后的需求）
  public async deleteDescription() {
    const { githubId } = extractToken(this.ctx, this.config);
    const { requirementId, description } = this.ctx.request.body;
    await this.ctx.service.requirement.deleteDescription(githubId, requirementId, description);
    const newRequirement: IRequirement | null = await this.ctx.service.requirement.findById(requirementId);
    this.ctx.body = { success: true, payload: newRequirement };
  }
}