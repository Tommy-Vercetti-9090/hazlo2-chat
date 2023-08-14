import { readFileSync } from "fs";
import { app } from "./appsub.js";
import ServerConfig from "./Config/serverConfig.js";
import socketWrapper from "./Utils/socketConnection.js";
// import redisWrapper from "./Utils/redisConnection.js";
import { InitiateRabbitMQ } from "../../chat-repo/src/RabbitMQ.js";
const SERVER_PORT = ServerConfig.SERVER_PORT;

// Local
import { createServer } from "http";
import { connectDB } from "./DB/index.js";
const httpServer = createServer(app);

// Connect To Database then Connect Server
connectDB()
  .then(async(result) => {
    socketWrapper(httpServer, await InitiateRabbitMQ())
    // Promise.all([socketWrapper(), redisWrapper()]);
    httpServer.listen(SERVER_PORT, async () => {
      console.log("Server listening on port http://localhost:" + SERVER_PORT);
    });
  })
  .catch((err) => {
    console.error("Server Crash due to mongoose not connected", err.message);
  });

// //  Producation
// import { createServer } from "https";
// import { connectDB } from "./DB/index.js";

// var cert = readFileSync(
//   "/home/hazloapi/ssl/certs/hazloapi_thesuitchstaging_com_9ae40_51295_1686182399_6246fe1d312f2b2e8d91247fdfdace43.crt"
// );
// var key = readFileSync(
//   "/home/hazloapi/ssl/keys/9ae40_51295_38591fd510fc480b4f626b95cf487ad0.key"
// );
// var ca = readFileSync("/home/hazloapi/ssl/certs/ca.crt");

// const options = {
//   key,
//   cert,
//   ca,
// };

// const httpsServer = createServer(options, app);
// connectDB()
//   .then((result) => {
//     httpsServer.listen(SERVER_PORT, () => {
//       console.log("Server listening on port https://localhost:" + SERVER_PORT);
//     });
//   })
//   .catch((err) => {
//     console.error("Server Crash due to mongoose not connected", err.message);
//   });

export default httpServer;
