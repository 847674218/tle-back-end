// 已重构
import * as crypto from "crypto";

// 哈希算法加密（采用md5加密方法）
export const hash = (str: string) => {
   const hash = crypto.createHash('md5');
   hash.update(str);
   let ret = hash.digest('hex');
   return ret;
}