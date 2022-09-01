// 已重构
import { Context, Controller } from "egg";
import axios from "axios";
import * as Httpstatus from "http-status-codes";
import { sign } from "jsonwebtoken";
import { extractToken } from "./../utils/Token";
import { IUser } from "./../entity/User";

export default class UserController extends Controller {
  // 管理员注册
  public async registry() {
    const { ctx } = this;
    const { email, password, role } = ctx.request.body;

    // 判断邮箱是否存在
    const isEmailExist = await ctx.service.user.isEmailExist(email);
    if (isEmailExist) {
      ctx.body = { success: false, meta: "用户已存在" }
    } else {
      const success = await ctx.service.user.registry(email, password, role);
      await ctx.service.user.registryOnFabric(email, password);
      ctx.body = success ? { success: true } : { success: false, meta: "注册失败" }
    }

    ctx.status = Httpstatus.OK;
  }

  // 登录
  public async login() {
    const ctx: Context = this.ctx;
    const { email, password, role } = ctx.request.body;

    const isEmailExist = await ctx.service.user.isEmailExist(email);
    const success = await ctx.service.user.logIn(email, password, role);
    const user = await ctx.service.user.findUserByEmail(email);

    if (!isEmailExist || !success) {
      ctx.body = { success: false, meta: "登录失败" };
    } else if (isEmailExist && success && user) {
      // 第一次登录且未绑定的时候没有GitHubID，如果是普通用户也不需要GitHubID。
      // 但是仍旧可以用email和GitHubID来生成token
      const token = sign(
        {
          email: email,
          githubId: user.githubId,
        },
        this.config.passportJwt.secret
      );
      ctx.body = {
        success: true,
        payload: {
          token: token,
          githubId: user.githubId,
          userName: user.userName,
        },
      };
    }
    ctx.status = Httpstatus.OK;
  }

  // 兑换access_token
  public async tradeGitHubAccessCode() {
    const { ctx, config } = this;
    // 获取授权码
    const requestToken = ctx.query.code;
    // ctx.cookies.get是从HTTP请求头里面读取Cookie字段：需要判断用户/邮箱是哪个
    const token = ctx.cookies.get("tle_app_token", { signed: false });
    // 获取GitHubApp的配置信息
    const { clientID, clientSecret } = config.githubApps;

    //兑换access_token
    const tokenResponse = await axios({
      method: "post",
      url:
        "https://github.com/login/oauth/access_token?" +
        `client_id=${clientID}&` +
        `client_secret=${clientSecret}&` +
        `code=${requestToken}`,
      headers: {
        accept: "application/json",
      },
    });
    // 这个accessToken可以通过设置Header的方式在调用Github API的时候使用
    // GitHub颁发给第三方用户的验证令牌
    const accessToken = tokenResponse.data.access_token;

    // 更新token
    if (token) {
      // 由于后端并不知道是前端哪个用户来兑换access_token，因此需要cookie携带token并解析出Email，从而确定是哪个用户
      const { email } = extractToken(ctx, config);
      if (email) {
        const user: IUser | undefined = await ctx.service.user.findUserByEmail(email);
        // 如果用户存在且没有绑定GitHub账号：
        if (user && !user.githubId) {
          const result = await axios({
            method: "get",
            url: `https://api.github.com/user`,
            headers: {
              accept: "application/json",
              Authorization: `token ${accessToken}`,
            },
          });
          // 获取GitHubId并更新
          const githubId = result.data.login;
          if (githubId) {
            await ctx.service.user.update(user, { githubId });
          }
        }
      }
    }
    ctx.body = { success: true, payload: accessToken };
    ctx.status = Httpstatus.OK;
  }

  // 添加一个新的用户
  public async addUser() {
    const { ctx } = this;
    const newUser = ctx.request.body;
    const newUserWithId: IUser = await this.ctx.service.user.addUser(newUser);
    await this.ctx.service.user.addUserOnFabric(newUser);
    this.ctx.body = { success: true, payload: newUserWithId };
    ctx.status = Httpstatus.OK;
  }

  // 请求需要投票的跟踪链接
  public async getAllUserInfo() {
    const user: IUser[] = await this.service.user.findAllUser();
    this.ctx.body = { success: true, payload: user };
  }
}