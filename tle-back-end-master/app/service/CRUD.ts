// 已重构
import { Service } from "egg";

/**
 * CRUD Service
 */
export default class CRUD extends Service {

  // 创建
  public async create<T>(t: T, model: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const { _id, ...others } = t as any;
      model.create({ ...others }, (err: any, res: { _id: { toString: () => string | PromiseLike<string>; }; }) => {
        if (err) reject(err);
        resolve(res._id.toString());
      });
    });
  }

  // 读取
  public async read<T>(t: Partial<T>, model: any): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      model.find({ ...t }, (err: any, res: any[]) => {
        if (err) {
          reject(err);
        }
        resolve(res.map((i: { toObject: () => any; }) => i.toObject()));
      });
    });
  }

  // 更新
  public async update<T>(target: T, obj: any, model?: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // const { _id, ...others } = obj;
      model.updateOne(target, obj, (err: any) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  // 删除
  public async delete(t: any, model: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      model.deleteMany({ _id: t._id }, (err: any) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}
