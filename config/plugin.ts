import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },

  cors: {
    enable: true,
    package: 'egg-cors'
  },

  passport: {
    enable: true,
    package: 'egg-passport',
  },

  passportJwt: {
    enable: true,
    package: 'egg-passport-jwt',
  },
};

export default plugin;
