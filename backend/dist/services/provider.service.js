"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerService = exports.ProviderService = void 0;
const clubkonnect_provider_1 = require("../providers/clubkonnect.provider");
class ClubKonnectAdapter {
    constructor() {
        this.client = new clubkonnect_provider_1.ClubKonnectProvider();
    }
    mapResponse(res) {
        return {
            success: res.status === 'SUCCESS' || res.status === 'PENDING',
            reference: res.providerReference,
            message: res.message,
            data: res.rawResponse
        };
    }
    async purchaseAirtime(network, phone, amount, ref) {
        const res = await this.client.purchaseAirtime(network, phone, amount, ref);
        return this.mapResponse(res);
    }
    async purchaseData(network, phone, planCode, ref) {
        const res = await this.client.purchaseData(network, planCode, phone, ref);
        return this.mapResponse(res);
    }
    async verifyElectricity(disco, meterNumber) {
        const res = await this.client.validateElectricityMeter(disco, meterNumber, 'PREPAID'); // Defaulting to prepaid for verification
        return {
            success: res.isValid,
            message: res.message,
            data: res.customerName ? { name: res.customerName, address: res.customerAddress } : undefined
        };
    }
    async purchaseElectricity(disco, meterNumber, amount, ref) {
        const res = await this.client.purchaseElectricity(disco, meterNumber, amount, ref);
        return { ...this.mapResponse(res), data: { token: res.token, ...res.rawResponse } };
    }
    async verifyCable(provider, iuc) {
        const res = await this.client.validateCableSmartcard(provider, iuc);
        return {
            success: res.isValid,
            data: res.customerName ? { name: res.customerName } : undefined
        };
    }
    async purchaseCable(provider, iuc, planCode, ref) {
        const res = await this.client.purchaseCable(provider, planCode, iuc, ref);
        return this.mapResponse(res);
    }
    async purchaseGiftCard(brandId, amount, quantity, ref) {
        return { success: false, message: 'ClubKonnect does not support GiftCards' };
    }
    async purchaseGameTopup(gameId, playerId, packageId, ref) {
        return { success: false, message: 'ClubKonnect does not support Game Topup' };
    }
    async purchaseEducationPin(examType, quantity, ref) {
        // Map examType to what ClubKonnect expects (WAEC, JAMB)
        const type = examType.includes('WAEC') ? 'WAEC' : 'JAMB';
        const res = await this.client.purchaseEducationPIN(type, quantity, ref);
        return { ...this.mapResponse(res), data: { pin: res.token, ...res.rawResponse } };
    }
    async purchaseBettingWallet(customerId, amount, providerCode, ref) {
        const res = await this.client.fundBettingWallet(customerId, amount, providerCode, ref);
        return this.mapResponse(res);
    }
    async printRechargeCard(network, amount, quantity, ref) {
        const res = await this.client.printRechargeCard(network, amount, quantity, ref);
        return this.mapResponse(res);
    }
}
class MockVTUProvider {
    async purchaseAirtime(network, phone, amount, ref) {
        console.log(`[MockVTU] Processing Airtime: ${network} ${amount} for ${phone} (Ref: ${ref})`);
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, reference: `VTU-${Date.now()}`, message: 'Airtime successful' };
    }
    async purchaseData(network, phone, planCode, ref) {
        console.log(`[MockVTU] Processing Data: ${network} ${planCode} for ${phone}`);
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, reference: `DATA-${Date.now()}`, message: 'Data successful' };
    }
    async verifyElectricity(disco, meterNumber) {
        console.log(`[MockVTU] Verifying Meter: ${disco} ${meterNumber}`);
        await new Promise(r => setTimeout(r, 500));
        if (meterNumber.length < 5)
            return { success: false, message: 'Invalid Meter' };
        return {
            success: true,
            data: { name: "MOCK CUSTOMER", address: "123 Mock Street, Lagos", meterNumber }
        };
    }
    async purchaseElectricity(disco, meterNumber, amount, ref) {
        console.log(`[MockVTU] Vending Electricity: ${disco} ${amount} for ${meterNumber}`);
        await new Promise(r => setTimeout(r, 1500));
        return { success: true, reference: `ELEC-${Date.now()}`, data: { token: "1234-5678-9012-3456" } };
    }
    async verifyCable(provider, iuc) {
        console.log(`[MockVTU] Verifying TV: ${provider} ${iuc}`);
        await new Promise(r => setTimeout(r, 500));
        return { success: true, data: { name: "MOCK TV USER", number: iuc, balance: 0 } };
    }
    async purchaseCable(provider, iuc, planCode, ref) {
        console.log(`[MockVTU] Vending TV: ${provider} ${planCode} for ${iuc}`);
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, reference: `TV-${Date.now()}` };
    }
    async purchaseGiftCard(brandId, amount, quantity, ref) {
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
    async purchaseGameTopup(gameId, playerId, packageId, ref) {
        console.log(`[MockVTU] Game Topup: ${gameId} ${packageId} for ${playerId}`);
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, reference: `GAME-${Date.now()}` };
    }
    async purchaseEducationPin(examType, quantity, ref) {
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
    async purchaseBettingWallet(customerId, amount, providerCode, ref) {
        return { success: true, reference: `BET-${Date.now()}`, message: 'Betting Wallet Funded' };
    }
    async printRechargeCard(network, amount, quantity, ref) {
        return { success: true, reference: `EPIN-${Date.now()}`, data: { pins: [] } };
    }
}
const reloadly_provider_1 = require("../providers/reloadly.provider");
class ProviderService {
    constructor() {
        this.mockProvider = new MockVTUProvider();
        this.reloadlyProvider = new reloadly_provider_1.ReloadlyProvider();
        this.clubKonnectProvider = new ClubKonnectAdapter();
    }
    getProvider(code = 'DEFAULT') {
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
exports.ProviderService = ProviderService;
exports.providerService = new ProviderService();
