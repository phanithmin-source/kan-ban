import { useUpstash } from "../../config/redis.js";
import localCache from "./local-cache.js";
import upstashCache from "./upstash-cache.js";

const cache = useUpstash
  ? upstashCache
  : localCache;


export default cache;