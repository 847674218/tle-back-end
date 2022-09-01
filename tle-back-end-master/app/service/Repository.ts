// 已重构
import { Service } from "egg";
import CRUD from "./CRUD";
import {
  IImportedRepository,
  IRequirement,
  ITraceLinkMatrix
} from "./../entity/types";

// 删除仓库的操作
type DeleteRepositoryOptions = {
  deleteRequirement?: boolean;
  deleteTraceLinkMatrix?: boolean;
};

// 默认删除仓库的操作同时删除需求和跟踪矩阵
const defaultDeleteRepositoryOptions: DeleteRepositoryOptions = {
  deleteRequirement: true,
  deleteTraceLinkMatrix: true,
};

export default class RepositoryService extends Service {
  // 增删改查
  private getCRUD(): CRUD {
    return this.ctx.service.cRUD;
  }

  // 获取模板
  private getModel() {
    return this.ctx.model.Repository;
  }

  // 把仓库信息存储在数据库里
  public async create(repo: Omit<IImportedRepository, "_id">): Promise<string> {
    try {
      return await this.getCRUD().create(repo, this.getModel());
    } catch (e) {
      throw e;
    }
  }

  // 请求已导入的仓库列表
  public async findByOwnerId(ownerId: string): Promise<IImportedRepository[]> {
    const repos: IImportedRepository[] = (await this.getModel().find({
      ownerId,
    })) as IImportedRepository[];
    return repos;
  }

  // 删除已导入的仓库（同时删除需求和跟踪矩阵）
  public async delete(
    ownerId: string,
    repoName: string,
    options: Partial<DeleteRepositoryOptions> = defaultDeleteRepositoryOptions
  ): Promise<void> {
    const repo: IImportedRepository[] | undefined = await this.findByName(repoName);

    // 查找并删除仓库
    if (!repo) throw new Error("No Repository Found");
    await this.ctx.model.Repository.deleteMany({ name: repoName });

    // 默认同时删除需求和相关跟踪链接
    const { deleteRequirement, deleteTraceLinkMatrix } = options;
    // 删除仓库的同时对应删除需求
    if (deleteRequirement) {
      const requirements: IRequirement[] | null = await this.ctx.service.requirement.findByRepoName(
        ownerId,
        repoName
      );
      if (requirements)
        for (const requirement of requirements) {
          await this.ctx.service.requirement.delete(ownerId, requirement._id);
        }
    }
    // 删除仓库的同时对应删除跟踪链接矩阵
    if (deleteTraceLinkMatrix) {
      const traceLinkMatrixs: ITraceLinkMatrix[] | null = await this.ctx.service.traceLink.findByRepoName(
        ownerId,
        repoName
      );
      if (traceLinkMatrixs)
        for (const traceLinkMatrix of traceLinkMatrixs) {
          await this.ctx.service.traceLink.delete(ownerId, traceLinkMatrix._id);
        }
    }
  }

  // 通过仓库名称查找仓库（多个仓库）
  public async findByName(name: string): Promise<IImportedRepository[]> {
    try {
      const repos: IImportedRepository[] = (await this.getModel().find({
        name
      })) as IImportedRepository[];
      return repos;
    } catch (e) {
      throw e;
    }
  }

  // 数据统计用
  // 通过仓库名称和SHA查找到仓库（单个仓库）
  public async findByNameAndSha(repoName: string, repoSha: string): Promise<IImportedRepository | null> {
    const repos: IImportedRepository[] = (await this.getModel().find({
      name: repoName,
    })) as IImportedRepository[];

    for (const repo of repos) {
      if (repo.branches[0].commitHeadSha == repoSha) {
        return repo;
      }
    }

    return null;
  }

  // 通过仓库ID查找到仓库（单个仓库）
  public async findById(id: string): Promise<IImportedRepository> {
    try {
      const res = (await this.getModel().find({ _id: id }))[0];
      return res;
    } catch (e) {
      throw e;
    }
  }
}