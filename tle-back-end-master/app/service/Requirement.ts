// 已重构
import { Service } from "egg";
import {
  IRequirement,
  IRequirementDescription,
} from "./../entity/types";

export default class RequirementService extends Service {
  // 增删改查
  private getCRUD() {
    return this.ctx.service.cRUD;
  }

  // 获取模板
  private getModel() {
    return this.ctx.model.Requirement;
  }

  // 在数据库里创建需求
  public async create(requirement: Omit<IRequirement, "_id">): Promise<string> {
    const { _id, descriptions, ...others } = requirement as any;
    const descriptionIds: string[] = await this.saveDescriptions(descriptions);

    return this.getCRUD().create({ ...others, descriptions: descriptionIds }, this.getModel());
  }
  // 在数据库里存储需求规约
  public async saveDescriptions(
    descriptions: Omit<IRequirementDescription, "_id">[]
  ): Promise<string[]> {
    return await Promise.all(descriptions.map(this.saveDescription.bind(this)));
  }
  // 存储单条需求规约并返回生成的ID值
  public async saveDescription(
    description: Omit<IRequirementDescription, "_id">
  ): Promise<string> {
    const { ctx } = this;
    return new Promise<string>((resolve, reject) => {
      const { _id, ...others } = description as any;
      ctx.model.RequirementDescription.create(
        others,
        (err: any, saved: IRequirementDescription) => {
          if (err) {
            reject(err);
          } else resolve(saved._id);
        }
      );
    });
  }

  // 通过仓库名称查找到需求（删除仓库同时删除需求时用到）（可能有多个）
  public async findByRepoName(
    ownerId: string,
    repoName: string
  ): Promise<IRequirement[] | null> {
    return (
      await this.find({
        relatedRepoOwnerId: ownerId,
        relatedRepoName: repoName,
      })
    );
  }

  // 查找需求并填充需求规约
  public async find(
    requirement: Partial<IRequirement>
  ): Promise<IRequirement[]> {
    const res: IRequirement[] = (
      // 填充descriptions字段
      await this.getModel().find(requirement).populate("descriptions")
    ).map((item) => item.toObject());
    return res;
  }

  // 删除需求（删除需求并删除所有的需求规约）
  public async delete(ownerId: string, requirementId: string): Promise<void> {
    const requirement: any = await this.ctx.model.Requirement.findById(requirementId);

    if (!requirement) throw new Error("No Requirement Found");
    if (!requirement.relatedRepoOwnerId || requirement.relatedRepoOwnerId !== ownerId) throw new Error("This Only Allow Operated By Owner");

    const { _id, descriptions } = requirement;

    await this.ctx.model.Requirement.deleteOne({ _id });
    // 删除需求规约
    await Promise.all(
      descriptions.map((id: any) =>
        this.ctx.model.RequirementDescription.deleteOne({ _id: id })
      )
    );
  }

  // 通过仓库名称+提交SHA查找需求
  public async findByRepoNameAndCommitSHA(
    ownerId: string,
    repoName: string,
    commitSha: string,
  ): Promise<IRequirement | null> {
    return (
      await this.find({
        relatedRepoOwnerId: ownerId,
        relatedRepoName: repoName,
        relatedCommitSha: commitSha,
      })
    )[0];
  }

  // 添加单条需求规约
  public async addDescription(
    ownerId: string,
    requirementId: string,
    description: Omit<IRequirementDescription, "_id">
  ): Promise<IRequirement> {
    const requirement: IRequirement | null = await this.findById(requirementId);
    if (!requirement) throw new Error("No Requirement Found");

    if (!requirement.relatedRepoOwnerId || requirement.relatedRepoOwnerId !== ownerId)
      throw new Error("This Only Allow Operated By Owner");

    const descriptionId = await this.saveDescription(description);

    await this.getModel().updateOne(
      { _id: requirement._id },
      // @ts-ignore
      { $push: { descriptions: descriptionId } }
    );

    return (await this.findById(requirementId)) as IRequirement;
  }

  // 根据ID查找需求
  public async findById(
    id: string
  ): Promise<IRequirement | null> {
    return (await this.find({ _id: id }))[0];
  }

  // 删除需求规约（单独一条）
  public async deleteDescription(
    ownerId: string,
    requirementId: string,
    description: IRequirementDescription
  ): Promise<void> {
    const { _id } = description;

    const requirement: IRequirement | null = await this.findById(requirementId);

    if (!requirement) throw new Error("No Requirement Found");
    if (requirement.relatedRepoOwnerId && requirement.relatedRepoOwnerId !== ownerId)
      throw new Error("This Only Allow Operated By Owner");

    const descriptionExist: boolean = (requirement.descriptions || []).some((description) => {
      return description._id.toString() === _id.toString();
    });

    if (!descriptionExist) throw new Error("No Related Description Found");

    const found: IRequirementDescription | null = await this.ctx.model.RequirementDescription.findOneAndDelete({ _id });

    if (!found) return;

    await this.getModel().findOneAndUpdate(
      { _id: requirement._id },
      //@ts-ignore
      { $pullAll: { descriptions: [found._id] } }
    );
  }
}