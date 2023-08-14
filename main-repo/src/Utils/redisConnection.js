import Redis from "ioredis";

export default async () => {
  const redis = new Redis("0.0.0.0", 6379);
  redis.on("connect", () => {
    console.log(`Connected to Redis server at Port 6379`);
  });

  return redis;
};
