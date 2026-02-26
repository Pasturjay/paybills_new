export interface ProviderResponse {
    success: boolean;
    reference?: string;
    message?: string;
    data?: any;
}

export interface ProviderInterface {
    purchaseAirtime(network: string, phone: string, amount: number, ref: string): Promise<ProviderResponse>;
    purchaseData(network: string, phone: string, planCode: string, ref: string): Promise<ProviderResponse>;
    verifyElectricity(disco: string, meterNumber: string): Promise<ProviderResponse>;
    purchaseElectricity(disco: string, meterNumber: string, amount: number, ref: string): Promise<ProviderResponse>;
    verifyCable(provider: string, iuc: string): Promise<ProviderResponse>;
    purchaseCable(provider: string, iuc: string, planCode: string, ref: string): Promise<ProviderResponse>;
    purchaseGiftCard(brandId: string, amount: number, quantity: number, ref: string): Promise<ProviderResponse>;
    purchaseGameTopup(gameId: string, playerId: string, packageId: string, ref: string): Promise<ProviderResponse>;
    purchaseEducationPin(examType: string, quantity: number, ref: string): Promise<ProviderResponse>;
    purchaseBettingWallet(customerId: string, amount: number, providerCode: string, ref: string): Promise<ProviderResponse>;
    printRechargeCard(network: string, amount: number, quantity: number, ref: string): Promise<ProviderResponse>;
}

import { ClubKonnectProvider } from '../providers/clubkonnect.provider';

class ClubKonnectAdapter implements ProviderInterface {
    private client: ClubKonnectProvider;

    constructor() {
        this.client = new ClubKonnectProvider();
    }

    private mapResponse(res: any): ProviderResponse {
        return {
            success: res.status === 'SUCCESS' || res.status === 'PENDING',
            reference: res.providerReference,
            message: res.message,
            data: res.rawResponse
        };
    }

    async purchaseAirtime(network: string, phone: string, amount: number, ref: string): Promise<ProviderResponse> {
        const res = await this.client.purchaseAirtime(network, phone, amount, ref);
        return this.mapResponse(res);
    }

    async purchaseData(network: string, phone: string, planCode: string, ref: string): Promise<ProviderResponse> {
        const res = await this.client.purchaseData(network, planCode, phone, ref);
        return this.mapResponse(res);
    }

    async verifyElectricity(disco: string, meterNumber: string): Promise<ProviderResponse> {
        const res = await this.client.validateElectricityMeter(disco, meterNumber, 'PREPAID'); // Defaulting to prepaid for verification
        return {
            success: res.isValid,
            message: res.message,
            data: res.customerName ? { name: res.customerName, address: res.customerAddress } : undefined
        };
    }

    async purchaseElectricity(disco: string, meterNumber: string, amount: number, ref: string): Promise<ProviderResponse> {
        const res = await this.client.purchaseElectricity(disco, meterNumber, amount, ref);
        return { ...this.mapResponse(res), data: { token: res.token, ...res.rawResponse } };
    }

    async verifyCable(provider: string, iuc: string): Promise<ProviderResponse> {
        const res = await this.client.validateCableSmartcard(provider, iuc);
        return {
            success: res.isValid,
            data: res.customerName ? { name: res.customerName } : undefined
        };
    }

    async purchaseCable(provider: string, iuc: string, planCode: string, ref: string): Promise<ProviderResponse> {
        const res = await this.client.purchaseCable(provider, planCode, iuc, ref);
        return this.mapResponse(res);
    }

    async purchaseGiftCard(brandId: string, amount: number, quantity: number, ref: string): Promise<ProviderResponse> {
        return { success: false, message: 'ClubKonnect does not support GiftCards' };
    }

    async purchaseGameTopup(gameId: string, playerId: string, packageId: string, ref: string): Promise<ProviderResponse> {
        return { success: false, message: 'ClubKonnect does not support Game Topup' };
    }

    async purchaseEducationPin(examType: string, quantity: number, ref: string): Promise<ProviderResponse> {
        // Map examType to what ClubKonnect expects (WAEC, JAMB)
        const type = examType.includes('WAEC') ? 'WAEC' : 'JAMB';
        const res = await this.client.purchaseEducationPIN(type as any, quantity, ref);
        return { ...this.mapResponse(res), data: { pin: res.token, ...res.rawResponse } };
    }

    async purchaseBettingWallet(customerId: string, amount: number, providerCode: string, ref: string): Promise<ProviderResponse> {
        const res = await this.client.fundBettingWallet(customerId, amount, providerCode, ref);
        return this.mapResponse(res);
    }

    async printRechargeCard(network: string, amount: number, quantity: number, ref: string): Promise<ProviderResponse> {
        const res = await this.client.printRechargeCard(network, amount, quantity, ref);
        return this.mapResponse(res);
    }
}

class MockVTUProvider implements ProviderInterface {
    async purchaseAirtime(network: string, phone: string, amount: number, ref: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Processing Airtime: ${network} ${amount} for ${phone} (Ref: ${ref})`);
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, reference: `VTU-${Date.now()}`, message: 'Airtime successful' };
    }

    async purchaseData(network: string, phone: string, planCode: string, ref: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Processing Data: ${network} ${planCode} for ${phone}`);
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, reference: `DATA-${Date.now()}`, message: 'Data successful' };
    }

    async verifyElectricity(disco: string, meterNumber: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Verifying Meter: ${disco} ${meterNumber}`);
        await new Promise(r => setTimeout(r, 500));
        if (meterNumber.length < 5) return { success: false, message: 'Invalid Meter' };
        return {
            success: true,
            data: { name: "MOCK CUSTOMER", address: "123 Mock Street, Lagos", meterNumber }
        };
    }

    async purchaseElectricity(disco: string, meterNumber: string, amount: number, ref: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Vending Electricity: ${disco} ${amount} for ${meterNumber}`);
        await new Promise(r => setTimeout(r, 1500));
        return { success: true, reference: `ELEC-${Date.now()}`, data: { token: "1234-5678-9012-3456" } };
    }

    async verifyCable(provider: string, iuc: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Verifying TV: ${provider} ${iuc}`);
        await new Promise(r => setTimeout(r, 500));
        return { success: true, data: { name: "MOCK TV USER", number: iuc, balance: 0 } };
    }

    async purchaseCable(provider: string, iuc: string, planCode: string, ref: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Vending TV: ${provider} ${planCode} for ${iuc}`);
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, reference: `TV-${Date.now()}` };
    }

    async purchaseGiftCard(brandId: string, amount: number, quantity: number, ref: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Buying GiftCard: ${brandId} ${amount}x${quantity}`);
        await new Promise(r => setTimeout(r, 2000));

        const codes = Array(quantity).fill(0).map(() => {
            const prefix = brandId.toUpperCase().slice(0, 4);
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            const random2 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const random3 = Math.random().toString(36).substring(2, 6).toUpperCase();
            return `${prefix}-${random}-${random2}-${random3}`;
        });

        return {
            success: true,
            reference: `GC-${Date.now()}`,
            data: { codes }
        };
    }

    async purchaseGameTopup(gameId: string, playerId: string, packageId: string, ref: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Game Topup: ${gameId} ${packageId} for ${playerId}`);
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, reference: `GAME-${Date.now()}` };
    }

    async purchaseEducationPin(examType: string, quantity: number, ref: string): Promise<ProviderResponse> {
        console.log(`[MockVTU] Education Pin: ${examType} x${quantity}`);
        await new Promise(r => setTimeout(r, 2000));

        // Mock PIN generation
        const pins = Array(quantity).fill(0).map(() => {
            const pin = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
            const serial = `WR${Math.floor(Math.random() * 100000000)}`;
            return { pin, serial };
        });

        return {
            success: true,
            reference: `EDU-${Date.now()}`,
            data: { pins }
        };
    }

    async purchaseBettingWallet(customerId: string, amount: number, providerCode: string, ref: string): Promise<ProviderResponse> {
        return { success: true, reference: `BET-${Date.now()}`, message: 'Betting Wallet Funded' };
    }

    async printRechargeCard(network: string, amount: number, quantity: number, ref: string): Promise<ProviderResponse> {
        return { success: true, reference: `EPIN-${Date.now()}`, data: { pins: [] } };
    }
}

import { ReloadlyProvider } from '../providers/reloadly.provider';

export class ProviderService {
    private readonly mockProvider: MockVTUProvider;
    private readonly reloadlyProvider: ReloadlyProvider;
    private readonly clubKonnectProvider: ClubKonnectAdapter;

    constructor() {
        this.mockProvider = new MockVTUProvider();
        this.reloadlyProvider = new ReloadlyProvider();
        this.clubKonnectProvider = new ClubKonnectAdapter();
    }

    getProvider(code: string = 'DEFAULT'): ProviderInterface {
        if (code === 'RELOADLY' || code === 'GIFTCARD') {
            return this.reloadlyProvider;
        }
        if (code === 'CLUBKONNECT' || code === 'DEFAULT') {
            // For now, replacing Mock with ClubKonnect as default for local utility
            return this.clubKonnectProvider;
            // Or maintain Mock for dev env?
            // return this.mockProvider; 
        }
        return this.mockProvider;
    }
}

export const providerService = new ProviderService();
