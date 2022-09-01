// 已重构
import { extractToken } from "../utils/Token";
import { Controller } from "egg";
import { IStatistic } from "../entity/types";

export default class Statistic extends Controller {
  // 需求的统计：每个需求对应的类的个数
  public async getRequirementStatistic() {
    const { githubId } = extractToken(this.ctx, this.config);
    const { repoName, commitSha } = this.ctx.query;
    const statistics: IStatistic[] = await this.service.statistic.getRequirementStatistic(githubId, repoName, commitSha);
    this.ctx.body = { success: true, payload: statistics };
  }

  // 类的统计：每个类对应的需求的个数
  public async getFileStatistic() {
    const { githubId } = extractToken(this.ctx, this.config);
    const { repoName, commitSha } = this.ctx.query;
    const statistics: IStatistic[] = await this.service.statistic.getFileStatistic(githubId, repoName, commitSha);
    this.ctx.body = { success: true, payload: statistics };
  }

  // 请求统计图中需求的数量增长
  public async getRequirementNumberStatistic() {
    const { githubId } = extractToken(this.ctx, this.config);
    const { repoName, commitSha } = this.ctx.query;
    const statistics: number[] = await this.service.statistic.getRequirementNumberStatistic(githubId, repoName, commitSha);
    this.ctx.body = { success: true, payload: statistics };
  }

  // 请求统计图中跟踪链接的数量增长
  public async getTraceLinkNumberStatistic() {
    const { githubId } = extractToken(this.ctx, this.config);
    const { repoName, commitSha } = this.ctx.query;
    const statistics: number[] = await this.service.statistic.getTraceLinkNumberStatistic(githubId, repoName, commitSha);
    this.ctx.body = { success: true, payload: statistics };
  }
}