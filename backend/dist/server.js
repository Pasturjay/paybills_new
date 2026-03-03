"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = require("http");
const socket_service_1 = require("./services/socket.service");
const PORT = process.env.PORT || 5000;
const subscription_service_1 = require("./services/subscription.service");
const subService = new subscription_service_1.SubscriptionService();
subService.startCron();
const httpServer = (0, http_1.createServer)(app_1.default);
socket_service_1.socketService.initialize(httpServer);
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
