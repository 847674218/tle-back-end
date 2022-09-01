// 已重构
import { Service } from "egg";
import CRUD from "./CRUD";
import { IUser } from "../entity/User";
import { randomStr } from "../utils/Random";
import { hash } from "../utils/Hash";
// import { buildCCPOrg1, buildCCPOrg2, buildWallet } from "../utils/appUtil";
// import { buildCAClient, enrollAdmin, registerAndEnrollUser } from "../utils/CAUtil";
// import { Wallets } from "fabric-network";
// import FabricCAServices = require("fabric-ca-client");
// import path = require('path');



// const channelName = 'mychannel';
// const chaincodeName = 'basic';


// const org1UserId = 'appUser1';
// const org2UserId = 'appUser2';

// function prettyJSONString(inputString) {
//   return JSON.stringify(JSON.parse(inputString), null, 2);
// }

export default class User extends Service {
  // 设置组织MSP名称：每个组织有自己的MSP
  // const mspOrg1 = 'Org1MSP';
  // const mspOrg2 = 'Org2MSP';

  // 设置钱包路径
  // const walletPath = path.join(__dirname, 'wallet');
  // 设置钱包以保存应用程序用户的凭证：只创建一个
  // const wallet = await buildWallet(Wallets, walletPath);

  // 使用network configuration（也称为connection profile）构建内存中的对象
  // const ccp1 = buildCCPOrg1();
  // const ccp2 = buildCCPOrg2();

  // 基于网络配置中的信息构建fabric ca服务客户端的实例
  // const caClient1 = buildCAClient(FabricCAServices, ccp1, 'ca.org1.example.com');
  // const caClient2 = buildCAClient(FabricCAServices, ccp2, 'ca.org2.example.com');


  private getCRUD(): CRUD {
    return this.ctx.service.cRUD as CRUD;
  }

  private getModel() {
    return this.ctx.model.User;
  }

  // 判断邮箱是否存在
  public async isEmailExist(email: string): Promise<boolean> {
    const found: IUser[] = (await this.getCRUD().read({ email }, this.getModel())) as IUser[];
    return found && found.length > 0;
  }

  // 注册
  public async registry(email: string, password: string, role: string): Promise<boolean> {
    // 将密码和盐值进行哈希加密
    const hashedPassword = hash(password + this.generateSalt(email));
    const user: Partial<IUser> = { email: email, password: hashedPassword, role: role, userName: "admin" };
    await this.getCRUD().create(user, this.getModel());
    return true;
  }

  // 生成盐值
  private async generateSalt(email: string): Promise<string> {
    const SaltTable = this.ctx.model.SaltTable;
    const random = randomStr();
    // 将邮箱和随机字符串进行哈希加密生成盐值
    const salt = hash(email + random);
    await this.getCRUD().create({ email, salt }, SaltTable);
    return salt;
  }

  public async registryOnFabric(email: string, password: string): Promise<void> {
    console.log(email + password);
    // 注册管理员用户并将身份导入到钱包
    // await enrollAdmin(caClient1, wallet, mspOrg1, email, password);
    // await enrollAdmin(caClient2, wallet, mspOrg2, email, password);
  }

  // 登录
  // 判断邮箱、密码和身份是否一致
  public async logIn(email: string, password: string, role: number): Promise<boolean> {
    const hashedPassword = hash(password + this.findSalt(email));
    const roleString = role == 1 ? "user" : "admin";
    try {
      const users: IUser[] = (await this.getCRUD().read({ email }, this.getModel())) as IUser[];
      if (users[0].password === hashedPassword && users[0].role === roleString) {
        return true;
      } else return false;
    } catch (e) {
      return false;
    }
  }

  // 查找邮箱对应盐值
  private async findSalt(email: string): Promise<string> {
    const res: { email: string; salt: string } | undefined = (
      await this.getCRUD().read({ email }, this.ctx.model.SaltTable)
    )[0] as any;

    if (!res) throw new Error("no salt");
    return res.salt;
  }

  // 通过邮箱查找用户信息
  public async findUserByEmail(email: string): Promise<IUser | undefined> {
    const users = (await this.getCRUD().read({ email }, this.getModel())) as IUser[];
    return users[0];
  }

  // 更新信息
  public async update(target: Partial<IUser>, user: Partial<IUser>): Promise<void> {
    await this.getCRUD().update(target, user, this.getModel());
  }

  // 请求所有用户信息
  public async findAllUser(): Promise<IUser[]> {
    return (await this.getCRUD().read({ role: "user" }, this.getModel())) as IUser[];
  }

  // 添加一个新的用户
  public async addUser(newUser: Omit<IUser, "_id">): Promise<IUser> {
    const hashedPassword = hash(newUser.password + this.generateSalt(newUser.email));
    const user: Partial<IUser> = { ...newUser, password: hashedPassword };
    await this.getCRUD().create(user, this.getModel());
    return (await this.getModel().find({ email: newUser.email }, this.getModel()))[0];
  }

  // 在区块链上添加一个新用户
  public async addUserOnFabric(newUser: Omit<IUser, "_id">): Promise<void> {
    console.log(newUser);
    //   const userId = newUser.email;
    //   const organization = newUser.organization;

    //   organization == "suppliers" ?
    //     await registerAndEnrollUser(caClient1, wallet, mspOrg1, userId, 'org1.department1', "847674218@qq.com") :
    //     await registerAndEnrollUser(caClient2, wallet, mspOrg2, userId, 'org2.department1', "847674218@qq.com")
  }
}