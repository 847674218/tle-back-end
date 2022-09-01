// 已整理
import { Service } from "egg";
import { IImportedRepository, ITraceLink, ITraceLinkMatrix } from "./../entity/types";

export default class TraceLinkService extends Service {
  // 增删改查
  private getCRUD() {
    return this.ctx.service.cRUD;
  }

  // 获取模板
  private getModel() {
    return this.ctx.model.TraceLinkMatrix;
  }
  private getTraceLinkModel() {
    return this.ctx.model.TraceLink;
  }

  // 将跟踪链接矩阵存储在数据库中
  public async create(matrix: Omit<ITraceLinkMatrix, "_id">): Promise<string> {
    const { _id, links, ...others } = matrix as any;
    const traceLinkIds: string[] = await this.saveTraceLinks(links);

    return await this.getCRUD().create({ ...others, links: traceLinkIds, }, this.getModel());
  }

  public async saveTraceLinks(
    traceLinks: Omit<ITraceLink, "_id">[]
  ): Promise<string[]> {
    return await Promise.all(traceLinks.map(this.saveTraceLink.bind(this))
    );
  }

  // 存储单条跟踪链接
  public async saveTraceLink(
    traceLink: Omit<ITraceLink, "_id">
  ): Promise<string> {
    const { ctx } = this;
    return new Promise<string>(async (resolve, reject) => {
      const { _id, ...others } = traceLink as any;
      ctx.model.TraceLink.create(
        others,
        (err: any, saved: ITraceLink) => {
          if (err) reject(err);
          else resolve(saved._id);
        }
      );
    });
  }

  // 查找文件和需求对应的跟踪链接
  // 通过仓库名称+提交SHA+文件名称查找跟踪链接（返回跟踪链接数组）
  public async findByFileAndRepoNameAndCommitSHA(
    ownerId: string,
    repoName: string,
    commitSha: string,
    filename: string
  ): Promise<ITraceLink[]> {
    const matrix: ITraceLinkMatrix = (
      await this.find({
        relatedRepoOwnerId: ownerId,
        relatedRepoName: repoName,
        relatedCommitSha: commitSha,
      })
    )[0];

    if (!matrix) return [];

    const traceLinks: ITraceLink[] = matrix.links || [];

    const relatedLinks: ITraceLink[] = traceLinks.filter((link) => {
      return (link.fullyQualifiedName == filename && link.state == "passConfirm") ? true : false;
    });

    return relatedLinks;
  }

  // 通过仓库名称+提交SHA+需求名称查找跟踪链接
  public async findByDescriptionNameAndRepoNameAndCommitSHA(
    ownerId: string,
    repoName: string,
    commitSha: string,
    descriptionName: string
  ): Promise<ITraceLink[]> {
    const matrix: ITraceLinkMatrix = (
      await this.find({
        relatedRepoOwnerId: ownerId,
        relatedRepoName: repoName,
        relatedCommitSha: commitSha,
      })
    )[0];

    if (!matrix) return [];

    const traceLinks: ITraceLink[] = (matrix.links || []).filter((link) => {
      return (link.requirementDescriptionName === descriptionName && link.state == "passConfirm") ? true : false;
    });

    return traceLinks;
  }

  // 删除仓库的同时删除所有的跟踪链接
  // 通过仓库名称查找到跟踪矩阵（删除仓库并删除跟踪矩阵时用到）
  public async findByRepoName(
    ownerId: string,
    repoName: string
  ): Promise<ITraceLinkMatrix[] | null> {
    return (
      await this.find({
        relatedRepoName: repoName,
        relatedRepoOwnerId: ownerId,
      })
    )
  }

  // 查找跟踪链接矩阵并填充跟踪链接
  public async find(
    matrix: Partial<ITraceLinkMatrix>
  ): Promise<ITraceLinkMatrix[]> {
    const res: ITraceLinkMatrix[] = (
      // 填充links字段
      await this.getModel().find(matrix).populate("links")
    ).map((item) => item.toObject());
    return res;
  }

  // 删除跟踪矩阵（删除跟踪矩阵以及所有的跟踪链接）
  public async delete(ownerId: string, matrixId: string): Promise<void> {
    const matrix: any = await this.ctx.model.TraceLinkMatrix.findById(matrixId);

    if (!matrix) throw new Error("No Requirement Found");
    if (!matrix.relatedRepoOwnerId || matrix.relatedRepoOwnerId !== ownerId)
      throw new Error("This Only Allow Operated By Owner");

    const { _id, links } = matrix;

    await this.ctx.model.TraceLinkMatrix.deleteOne({ _id });
    await Promise.all(
      links.map((id: any) => this.ctx.model.TraceLink.deleteOne({ _id: id }))
    );
  }

  // 添加一条新的跟踪链接
  public async addTraceLink(
    ownerId: string,
    repoName: string,
    commitSha: string,
    newLink: ITraceLink
  ): Promise<ITraceLink> {
    const matrix: ITraceLinkMatrix = (
      await this.find({
        relatedRepoOwnerId: ownerId,
        relatedRepoName: repoName,
        relatedCommitSha: commitSha,
      })
    )[0] as ITraceLinkMatrix;

    if (!matrix) throw new Error("No Trace Link Matrix Found");

    if (matrix.relatedRepoOwnerId && matrix.relatedRepoOwnerId !== ownerId)
      throw new Error("This Only Allow Operated By Owner");

    const traceLinkId: string = await this.saveTraceLink(newLink);
    await this.getModel().updateOne(
      { _id: matrix._id },
      //@ts-ignore
      { $push: { links: traceLinkId } }
    );

    return await this.ctx.model.TraceLink.findById(traceLinkId);
  }

  // 请求需要投票的跟踪链接
  public async findNeedVoteTraceLink(
    ownerId: string,
    repoName: string,
    commitSha: string,
    userName: string
  ): Promise<ITraceLink[]> {
    const matrix: ITraceLinkMatrix | null = (
      await this.find({
        relatedRepoName: repoName,
        relatedRepoOwnerId: ownerId,
        relatedCommitSha: commitSha,
      })
    )[0] as ITraceLinkMatrix;

    if (!matrix) return [];

    const traceLinks: ITraceLink[] = (matrix.links || []).filter((link) => {
      return ((link.state == "create" || link.state == "delete") && link.confirmor.indexOf(userName) == -1 && link.rejector.indexOf(userName) == -1) ? true : false;
    });

    return traceLinks;
  }

  // 请求仓库对应的跟踪链接
  public async findRepoTraceLink(
    ownerId: string,
    repoName: string,
    commitSha: string,
  ): Promise<ITraceLink[]> {
    const matrix: ITraceLinkMatrix | null = (
      await this.find({
        relatedRepoName: repoName,
        relatedRepoOwnerId: ownerId,
        relatedCommitSha: commitSha,
      })
    )[0] as ITraceLinkMatrix;

    if (!matrix) return [];

    const traceLinks: ITraceLink[] = (matrix.links || []).filter((link) => {
      return ((link.state == "passConfirm" || link.state == "rejectDelete")) ? true : false;
    });

    return traceLinks;
  }

  // 更新投票结果
  public async updateVoteResult(
    traceLinkId: string,
    userName: string,
    vote: string
  ): Promise<void> {
    const found: ITraceLink | null = await this.ctx.model.TraceLink.findById({ _id: traceLinkId });

    if (found) {
      if (vote == "pass") {
        const newConfirmor = found.confirmor.concat(userName);
        await this.updateTraceLink(found, { confirmor: newConfirmor })
      } if (vote == "reject") {
        const newRejector = found.rejector.concat(userName);
        await this.updateTraceLink(found, { confirmor: newRejector })
      }
    }
  }

  // 更新跟踪链接状态
  public async updateTraceLinkState(
    repoName: string,
    commitSha: string,
    traceLinkId: string,
  ): Promise<ITraceLink> {
    const found: ITraceLink | null = await this.ctx.model.TraceLink.findById({ _id: traceLinkId });

    const repository: IImportedRepository | null = await this.ctx.service.repository.findByNameAndSha(repoName, commitSha);
    const stakeholders = repository?.stakeholders || [];

    if (found && found.confirmor.length + found.rejector.length == stakeholders.length) {
      found.confirmor.length == stakeholders.length ?
        (found.state == "create" ? await this.updateTraceLink(found, { state: "passConfirm" }) : await this.updateTraceLink(found, { state: "rejectConfirm" })) :
        (found.state == "delete" ? await this.updateTraceLink(found, { state: "passDelete" }) : await this.updateTraceLink(found, { state: "rejectDelete" }))
    }

    return await this.ctx.model.TraceLink.findById({ _id: traceLinkId });
  }

  // 更新跟踪链接
  public async updateTraceLink(
    target: Partial<ITraceLink>,
    traceLink: Partial<ITraceLink>
  ): Promise<void> {
    await this.getCRUD().update(
      target,
      traceLink,
      this.getTraceLinkModel()
    );
  }
}