// 已重构
import { IFileTreeNode } from "../entity/types";

export const flatten = (nodes: IFileTreeNode[]): IFileTreeNode[] => {
  const res: IFileTreeNode[] = [];
  const traverse = (node: IFileTreeNode) => {
    if (node.type === "FILE") {
      res.push({ ...node });
    } else if (node.type === "FOLDER") {
      (node.subTrees || []).map(traverse);
    }
  };

  (nodes || []).map(traverse);

  return res;
};
