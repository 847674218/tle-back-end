// 已重构
import { Controller } from "egg";
import { OK } from "http-status-codes";
import { extractToken } from "./../utils/Token";
import { ITraceLink } from "./../entity/types";

// const { Gateway } = require('fabric-network');

export default class TraceLinkController extends Controller {
  // 将跟踪链接矩阵存储在数据库中
  public async create() {
    const { ctx } = this;
    const traceLinkMatrix = ctx.request.body;
    const { githubId } = extractToken(ctx, this.config);
    await ctx.service.traceLink.create({ ...traceLinkMatrix, relatedRepoOwnerId: githubId });
    ctx.body = { success: true };
    ctx.status = OK;
  }

  // 请求跟踪链接数据（与文件相关或与需求相关）
  public async query() {
    const { ctx } = this;
    const { repoName, commitSha, file, descriptionName } = ctx.query;
    const { githubId } = extractToken(ctx, this.config);

    let found: ITraceLink[] = [];
    if (file) {
      found = await ctx.service.traceLink.findByFileAndRepoNameAndCommitSHA(
        githubId,
        repoName,
        commitSha,
        file
      );
    } else if (descriptionName) {
      found = await ctx.service.traceLink.findByDescriptionNameAndRepoNameAndCommitSHA(
        githubId,
        repoName,
        commitSha,
        descriptionName
      );
    }
    ctx.body = { success: true, payload: found };
  }

  // 添加一条新的跟踪链接
  public async addTraceLink() {
    const { githubId } = extractToken(this.ctx, this.config);
    const { repoName, commitSha, newTraceLink } = this.ctx.request.body;
    await this.ctx.service.traceLink.addTraceLink(githubId, repoName, commitSha, newTraceLink);
    this.ctx.body = { success: true };
  }

  // 区块链接口
  // public async addTraceLink() {
  //   const { githubId } = extractToken(this.ctx, this.config);
  //   const { repoName, commitSha, newTraceLink } = this.ctx.request.body;
  //   const gateway = new Gateway();
  //   await this.ctx.service.traceLink.addTraceLink(githubId, repoName, commitSha, newTraceLink);
  //   this.ctx.body = { success: true };
  // }

  // 请求需要投票的跟踪链接
  public async getNeedVoteTraceLink() {
    const { repoName, commitSha, userName } = this.ctx.query;
    const { githubId } = extractToken(this.ctx, this.config);
    const traceLinks: ITraceLink[] = await this.service.traceLink.findNeedVoteTraceLink(githubId, repoName, commitSha, userName);
    this.ctx.body = { success: true, payload: traceLinks };
  }

  // 请求仓库对应的跟踪链接
  public async getRepoTraceLink() {
    const { repoName, commitSha } = this.ctx.query;
    const { githubId } = extractToken(this.ctx, this.config);
    const traceLinks: ITraceLink[] = await this.service.traceLink.findRepoTraceLink(githubId, repoName, commitSha);
    this.ctx.body = { success: true, payload: traceLinks };
  }

  // 更新投票结果
  public async updateVoteResult() {
    const { repoName, commitSha, traceLinkId, userName, vote } = this.ctx.query;
    await this.service.traceLink.updateVoteResult(traceLinkId, userName, vote);
    const newTraceLink = await this.service.traceLink.updateTraceLinkState(repoName, commitSha, traceLinkId);
    this.ctx.body = { success: true, payload: newTraceLink };
  }
}