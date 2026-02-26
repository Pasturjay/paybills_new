import { Request, Response } from 'express';
import { BillingService } from '../services/billing.service';
import { ClubKonnectProvider } from '../providers/clubkonnect.provider';

const billingService = new BillingService();
const provider = new ClubKonnectProvider();

export const getAirtimeProviders = async (req: Request, res: Response) => {
    try {
        const providers = await provider.getAirtimeProviders();
        res.json({ status: 'success', data: providers });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const purchaseAirtime = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { networkId, phoneNumber, amount } = req.body;

        if (!networkId || !phoneNumber || !amount) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const result = await billingService.purchaseAirtime(userId, networkId, phoneNumber, Number(amount));

        if (result.status === 'FAILED') {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error: any) {
        console.error('Purchase Airtime Controller Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};
