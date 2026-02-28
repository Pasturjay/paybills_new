import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

import { SubscriptionService } from './services/subscription.service';
const subService = new SubscriptionService();
subService.startCron();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
