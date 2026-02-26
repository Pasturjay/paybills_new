"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    purchaseAirtime(network, phone, amount, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.purchaseAirtime(network, phone, amount, ref);
            return this.mapResponse(res);
        });
    }
    purchaseData(network, phone, planCode, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.purchaseData(network, planCode, phone, ref);
            return this.mapResponse(res);
        });
    }
    verifyElectricity(disco, meterNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.validateElectricityMeter(disco, meterNumber, 'PREPAID'); // Defaulting to prepaid for verification
            return {
                success: res.isValid,
                message: res.message,
                data: res.customerName ? { name: res.customerName, address: res.customerAddress } : undefined
            };
        });
    }
    purchaseElectricity(disco, meterNumber, amount, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.purchaseElectricity(disco, meterNumber, amount, ref);
            return Object.assign(Object.assign({}, this.mapResponse(res)), { data: Object.assign({ token: res.token }, res.rawResponse) });
        });
    }
    verifyCable(provider, iuc) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.validateCableSmartcard(provider, iuc);
            return {
                success: res.isValid,
                data: res.customerName ? { name: res.customerName } : undefined
            };
        });
    }
    purchaseCable(provider, iuc, planCode, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.purchaseCable(provider, planCode, iuc, ref);
            return this.mapResponse(res);
        });
    }
    purchaseGiftCard(brandId, amount, quantity, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            return { success: false, message: 'ClubKonnect does not support GiftCards' };
        });
    }
    purchaseGameTopup(gameId, playerId, packageId, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            return { success: false, message: 'ClubKonnect does not support Game Topup' };
        });
    }
    purchaseEducationPin(examType, quantity, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            // Map examType to what ClubKonnect expects (WAEC, JAMB)
            const type = examType.includes('WAEC') ? 'WAEC' : 'JAMB';
            const res = yield this.client.purchaseEducationPIN(type, quantity, ref);
            return Object.assign(Object.assign({}, this.mapResponse(res)), { data: Object.assign({ pin: res.token }, res.rawResponse) });
        });
    }
    purchaseBettingWallet(customerId, amount, providerCode, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.fundBettingWallet(customerId, amount, providerCode, ref);
            return this.mapResponse(res);
        });
    }
    printRechargeCard(network, amount, quantity, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.printRechargeCard(network, amount, quantity, ref);
            return this.mapResponse(res);
        });
    }
}
class MockVTUProvider {
    purchaseAirtime(network, phone, amount, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Processing Airtime: ${network} ${amount} for ${phone} (Ref: ${ref})`);
            yield new Promise(r => setTimeout(r, 1000));
            return { success: true, reference: `VTU-${Date.now()}`, message: 'Airtime successful' };
        });
    }
    purchaseData(network, phone, planCode, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Processing Data: ${network} ${planCode} for ${phone}`);
            yield new Promise(r => setTimeout(r, 1000));
            return { success: true, reference: `DATA-${Date.now()}`, message: 'Data successful' };
        });
    }
    verifyElectricity(disco, meterNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Verifying Meter: ${disco} ${meterNumber}`);
            yield new Promise(r => setTimeout(r, 500));
            if (meterNumber.length < 5)
                return { success: false, message: 'Invalid Meter' };
            return {
                success: true,
                data: { name: "MOCK CUSTOMER", address: "123 Mock Street, Lagos", meterNumber }
            };
        });
    }
    purchaseElectricity(disco, meterNumber, amount, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Vending Electricity: ${disco} ${amount} for ${meterNumber}`);
            yield new Promise(r => setTimeout(r, 1500));
            return { success: true, reference: `ELEC-${Date.now()}`, data: { token: "1234-5678-9012-3456" } };
        });
    }
    verifyCable(provider, iuc) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Verifying TV: ${provider} ${iuc}`);
            yield new Promise(r => setTimeout(r, 500));
            return { success: true, data: { name: "MOCK TV USER", number: iuc, balance: 0 } };
        });
    }
    purchaseCable(provider, iuc, planCode, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Vending TV: ${provider} ${planCode} for ${iuc}`);
            yield new Promise(r => setTimeout(r, 1000));
            return { success: true, reference: `TV-${Date.now()}` };
        });
    }
    purchaseGiftCard(brandId, amount, quantity, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Buying GiftCard: ${brandId} ${amount}x${quantity}`);
            yield new Promise(r => setTimeout(r, 2000));
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
        });
    }
    purchaseGameTopup(gameId, playerId, packageId, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Game Topup: ${gameId} ${packageId} for ${playerId}`);
            yield new Promise(r => setTimeout(r, 1000));
            return { success: true, reference: `GAME-${Date.now()}` };
        });
    }
    purchaseEducationPin(examType, quantity, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[MockVTU] Education Pin: ${examType} x${quantity}`);
            yield new Promise(r => setTimeout(r, 2000));
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
        });
    }
    purchaseBettingWallet(customerId, amount, providerCode, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            return { success: true, reference: `BET-${Date.now()}`, message: 'Betting Wallet Funded' };
        });
    }
    printRechargeCard(network, amount, quantity, ref) {
        return __awaiter(this, void 0, void 0, function* () {
            return { success: true, reference: `EPIN-${Date.now()}`, data: { pins: [] } };
        });
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
