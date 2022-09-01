// 已重构
import { IFileTreeNode } from '../entity/types';

// 平整树状结构
export const flatten = (trees: IFileTreeNode[]): IFileTreeNode[] => {
   let res: IFileTreeNode[] = [];
   for (const node of trees) {
      if (node.type === "FILE") {
         res.push({ ...node });
      } else if (node.type === "FOLDER") {
         res.push(...flatten(node.subTrees || []));
      }
   }
   return res;
}