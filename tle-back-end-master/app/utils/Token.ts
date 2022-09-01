// 已重构
import { Context, EggAppConfig } from "egg";
import { verify } from "jsonwebtoken";

// 从token中提取githubId和email
export const extractToken = (ctx: Context, config: EggAppConfig): { githubId: string; email: string } => {
  const token = ctx.cookies.get("tle_app_token", { signed: false });
  try {
    // 该函数用来验证token的合法性（有没有过期），返回值是加密前的对象内容（这里就是Email和GitHubID）
    const res = verify(token, config.passportJwt.secret);
    const { githubId, email } = res;
    return { githubId, email };
  } catch (e) {
    throw new Error("请重新登入");
  }
};