// 已重构
export interface IUser {
   _id: string;
   userName: string;
   email: string;
   password: string;
   role: string;
   organization: string;
   program: string;
   githubId?: string;
   createAt: number;
   lastUpdateAt: number;
}