import { EggAppConfig, PowerPartial } from "egg";

export default () => {
  const config: PowerPartial<EggAppConfig> = {};

  // database for testing
  config.mongoose = {
    url: "mongodb://localhost:27017/tle_test",
    options: {},
  };

  return config;
};
