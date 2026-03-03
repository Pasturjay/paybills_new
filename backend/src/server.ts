import app from './app';
import { createServer } from 'http';
import { socketService } from './services/socket.service';

const PORT = process.env.PORT || 5000;

import { SubscriptionService } from './services/subscription.service';
const subService = new SubscriptionService();
subService.startCron();

const httpServer = createServer(app);
socketService.initialize(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
