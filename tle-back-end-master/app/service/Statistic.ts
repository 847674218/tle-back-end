// 已重构
import {
  IFileTreeNode,
  IImportedRepository,
  IRequirement,
  IRequirementDescription,
  IStatistic,
  ITraceLink,
} from "./../entity/types";
import { Service } from "egg";

export default class Statistic extends Service {
  // 需求的统计：每个需求对应的类的个数
  public async getRequirementStatistic(ownerId: string, repoName: string, commitSha: string) {
    const descriptions: IRequirementDescription[] =
      (await this.ctx.service.requirement.findByRepoNameAndCommitSHA(ownerId, repoName, commitSha) || {}).descriptions || [];

    const traceLinks: ITraceLink[] =
      await this.ctx.service.traceLink.findRepoTraceLink(ownerId, repoName, commitSha) || [];

    const statistics: {
      description: IRequirementDescription;
      value: number;
    }[] = descriptions.map((description) => ({ description, value: 0 }));

    for (const link of traceLinks) {
      for (const item of statistics) {
        if (link.requirementDescriptionName === item.description.name) {
          item.value++;
        }
      }
    }

    return statistics.map((item) => ({
      label: item.description.name,
      value: item.value,
    }));
  }

  // 类的统计：每个类对应的需求的个数
  public async getFileStatistic(ownerId: string, repoName: string, commitSha: string) {
    const repository: IImportedRepository | null = await this.ctx.service.repository.findByNameAndSha(repoName, commitSha);

    const filenames: string[] = [];

    const traverse = (node: IFileTreeNode) => {
      if (node.type === "FILE") {
        const fileName = node.fullyQualifiedName;
        if (fileName.search(".java") != -1) {
          filenames.push(fileName.slice(fileName.lastIndexOf('/') + 1));
        }
      } else if (node.type === "FOLDER") {
        (node.subTrees || []).map(traverse);
      }
    };

    const trees = repository ? repository.trees : [];
    trees.map(traverse);

    const traceLinks: ITraceLink[] =
      await this.ctx.service.traceLink.findRepoTraceLink(ownerId, repoName, commitSha) || [];

    const statistics: IStatistic[] = filenames.map((name) => ({ label: name, value: 0, }));

    traceLinks.map((link) => {
      for (const item of statistics) {
        if (item.label === link.fullyQualifiedName) {
          item.value++;
        }
      }
    });

    return statistics;
  }

  // 请求统计图中需求的数量增长
  public async getRequirementNumberStatistic(ownerId: string, repoName: string, commitSha: string) {
    const repository: IImportedRepository | null = await this.ctx.service.repository.findByNameAndSha(repoName, commitSha);

    let commitShas: string[] = [];
    let requirementNumber: number[] = [];

    if (repository) {
      for (const commit of repository.commits) {
        commitShas.push(commit.sha);
      }

      for (const commitSha of commitShas) {
        const requirement: IRequirement | null = await this.ctx.service.requirement.findByRepoNameAndCommitSHA(ownerId, repoName, commitSha);
        if (requirement) {
          requirementNumber.push(requirement.descriptions.length);
        }
      }
    }
    requirementNumber.push(0);

    return requirementNumber;
  }

  // 请求统计图中跟踪链接的数量增长
  public async getTraceLinkNumberStatistic(ownerId: string, repoName: string, commitSha: string) {
    const repository: IImportedRepository | null = await this.ctx.service.repository.findByNameAndSha(repoName, commitSha);

    let commitShas: string[] = [];
    let traceLinkNumber: number[] = [];

    if (repository) {
      for (const commit of repository.commits) {
        commitShas.push(commit.sha);
      }

      for (const commitSha of commitShas) {
        const traceLinks: ITraceLink[] = await this.ctx.service.traceLink.findRepoTraceLink(ownerId, repoName, commitSha);

        const res: ITraceLink[] = traceLinks.filter((link) => {
          return ((link.state == "passConfirm" || link.state == "rejectDelete")) ? true : false;
        });

        traceLinkNumber.push(res.length);
      }
    }

    traceLinkNumber.push(0);

    return traceLinkNumber;
  }
}