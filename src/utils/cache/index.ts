import { isProduction } from "../../config/redis.js";

import localCache from "./local-cache.js";
import upstashCache from "./upstash-cache.js";

const cache = isProduction
  ? upstashCache
  : localCache;

export default cache;