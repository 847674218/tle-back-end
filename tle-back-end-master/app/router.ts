import { Application } from "egg";

export default (app: Application) => {
  const { controller, router } = app;

  const jwt = (app as any).passport.authenticate("jwt", {
    session: false,
    successReturnToOrRedirect: null,
  });

  // ------------------------------------用户------------------------------------
  // 管理员注册
  router.post("/api/auth/registry", controller.user.registry);
  // 登录
  router.post("/api/auth/login", controller.user.login);
  // 请求登录GitHub（兑换token）
  router.get("/api/auth/access_token", controller.user.tradeGitHubAccessCode);
  // 请求所有用户信息
  router.get("/api/auth/userInfo", controller.user.getAllUserInfo);
  // 添加一个新的用户
  router.post("/api/auth/addUser", controller.user.addUser);
  // ------------------------------------仓库------------------------------------
  // 把仓库信息存储在数据库里
  router.post("/api/repository", jwt, controller.repository.create);
  // 删除已导入的仓库（同时删除需求和跟踪链接）
  router.delete("/api/repository/:name", jwt, controller.repository.delete);
  // 请求已导入的仓库列表：仓库数组（包含所有信息）
  router.get("/api/repository", jwt, controller.repository.index);
  // 请求已导入仓库的细节：单个仓库的所有信息
  router.get("/api/repository/id/:id", jwt, controller.repository.show);
  // ------------------------------------需求（新）------------------------------------
  // 把需求存储在数据仓库中
  router.post("/api/requirement", jwt, controller.requirement.create);
  // 请求仓库对应的需求
  router.get("/api/requirement", jwt, controller.requirement.query);
  // 添加单条需求规约
  router.post("/api/requirement/description/:requirementId", jwt, controller.requirement.addDescription);
  // 删除单条需求规约
  router.delete("/api/requirement/description", jwt, controller.requirement.deleteDescription);
  // ------------------------------------跟踪链接------------------------------------
  // 将跟踪链接存储在数据库中
  router.post("/api/tracelink", jwt, controller.traceLink.create);
  // 请求跟踪链接数据（与文件相关或与需求相关）
  router.get("/api/tracelink", jwt, controller.traceLink.query);
  // 添加一条新的跟踪链接：上链
  router.post("/api/tracelink/new", jwt, controller.traceLink.addTraceLink);
  // 请求需要投票的跟踪链接
  router.get("/api/tracelink/needvote", jwt, controller.traceLink.getNeedVoteTraceLink);
  // 请求仓库对应的跟踪链接
  router.get("/api/tracelink/repo", jwt, controller.traceLink.getRepoTraceLink);
  // 更新投票结果
  router.post("/api/tracelink/vote", jwt, controller.traceLink.updateVoteResult);
  // ------------------------------------静态展示------------------------------------
  // 需求的统计：每个需求对应的类的个数
  router.get("/api/statistic/requirement", jwt, controller.statistic.getRequirementStatistic);
  // 类的统计：每个类对应的需求的个数
  router.get("/api/statistic/file", jwt, controller.statistic.getFileStatistic);
  // 请求统计图中需求的数量增长
  router.get("/api/statistic/requirementnumber", jwt, controller.statistic.getRequirementNumberStatistic);
  // 请求统计图中跟踪链接的数量增长
  router.get("/api/statistic/tracelinknumber", jwt, controller.statistic.getTraceLinkNumberStatistic);
};