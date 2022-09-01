// 已重构
import { Controller } from "egg";
import { OK } from "http-status-codes";
import { extractToken } from "../utils/Token";
import { IImportedRepository } from "./../entity/types";

export default class RepositoryController extends Controller {
  // 把仓库信息存储在数据库里
  public async create() {
    const { ctx } = this;
    const repository: IImportedRepository = ctx.request.body;
    await ctx.service.repository.create(repository);
    ctx.body = { success: true };
    ctx.status = OK;
  }

  // 请求已导入的仓库列表：仓库数组（包含所有信息）
  public async index() {
    const { ctx } = this;
    const { githubId } = extractToken(ctx, this.config);
    const repositoris: IImportedRepository[] = await ctx.service.repository.findByOwnerId(githubId);
    ctx.body = { success: true, payload: repositoris };
    ctx.status = OK;
  }

  // 删除已导入的仓库
  public async delete() {
    const { ctx } = this;
    const { githubId } = extractToken(ctx, this.config);
    const { name } = ctx.params;
    await ctx.service.repository.delete(githubId, name);
    ctx.body = { success: true };
    ctx.status = OK;
  }

  // 请求已导入仓库的细节：单个仓库的所有信息
  public async show() {
    const { ctx } = this;
    const { id } = ctx.params;
    const repository: IImportedRepository = await ctx.service.repository.findById(id);
    ctx.body = { success: true, payload: repository };
    ctx.status = OK;
  }
}