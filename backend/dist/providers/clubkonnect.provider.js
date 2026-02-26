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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubKonnectProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const clubkonnect_config_1 = require("../config/clubkonnect.config");
class ClubKonnectProvider {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: clubkonnect_config_1.clubKonnectConfig.BASE_URL,
            timeout: 30000, // 30s timeout
        });
        // Interceptor to attach API Key to every request if needed (usually query param for ClubKonnect)
        this.client.interceptors.request.use((config) => {
            // ClubKonnect mostly uses query params: ?UserID=xxx&APIKey=xxx
            // We'll append these in the individual methods or use a common helper if consistent
            return config;
        });
    }
    getCredentials() {
        return `UserID=${clubkonnect_config_1.clubKonnectConfig.USER_ID}&APIKey=${clubkonnect_config_1.clubKonnectConfig.API_KEY}`;
    }
    getWalletBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`?${this.getCredentials()}&Action=WalletBalance`);
                // Parse response based on ClubKonnect format (assuming JSON or specific text)
                // Example response: { balance: "5000.00" } depending on API
                const balance = parseFloat(response.data.balance || response.data.message || '0');
                return isNaN(balance) ? 0 : balance;
            }
            catch (error) {
                console.error('ClubKonnect Balance Error:', error);
                throw new Error('Failed to fetch provider balance');
            }
        });
    }
    getAirtimeProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            // ClubKonnect usually has static IDs (01=MTN, 02=GLO, etc.), might not have an API to list them dynamically
            return [
                { id: '01', name: 'MTN' },
                { id: '02', name: 'GLO' },
                { id: '03', name: '9MOBILE' },
                { id: '04', name: 'AIRTEL' }
            ];
        });
    }
    purchaseAirtime(networkId, phoneNumber, amount, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Format: /?UserID=xxx&APIKey=xxx&MobileNetwork=01&Amount=100&MobileNumber=0803...&RequestID=xxx&CallBackURL=xxx
                const url = `?${this.getCredentials()}&MobileNetwork=${networkId}&Amount=${amount}&MobileNumber=${phoneNumber}&RequestID=${requestId}&CallBackURL=`;
                const response = yield this.client.get(url);
                // Analyze response
                // Success might look like: { status: "ORDER_RECEIVED", ... } or "100"
                const status = response.data.status || response.data.statuscode;
                if (status === '100' || status === 'ORDER_RECEIVED') {
                    return {
                        status: 'PENDING', // ClubKonnect often returns pending initially
                        providerReference: response.data.orderid || response.data.requestID || requestId,
                        rawResponse: response.data
                    };
                }
                return {
                    status: 'FAILED',
                    providerReference: requestId,
                    message: response.data.message || 'Provider rejected transaction',
                    rawResponse: response.data
                };
            }
            catch (error) {
                // Handle network errors specifically
                return {
                    status: 'PENDING', // Assume pending on network error for safety
                    providerReference: requestId,
                    message: 'Network Error - flagged for reconciliation',
                    rawResponse: error.message
                };
            }
        });
    }
    getDataPlans(networkId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`?${this.getCredentials()}&Action=GetDataBundle&MobileNetwork=${networkId}`);
                // Assuming response.data.PLAN is an array of plans
                // Structure map based on assumed API response
                return (response.data.PLAN || []).map((p) => ({
                    id: p.id,
                    networkId,
                    name: p.name,
                    price: parseFloat(p.price),
                    validity: p.validity
                }));
            }
            catch (error) {
                console.error('Error fetching data plans:', error);
                return [];
            }
        });
    }
    purchaseData(networkId, planId, phoneNumber, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `?${this.getCredentials()}&Action=BuyDataBundle&MobileNetwork=${networkId}&DataPlan=${planId}&MobileNumber=${phoneNumber}&RequestID=${requestId}`;
                const response = yield this.client.get(url);
                const status = response.data.status || response.data.statuscode;
                if (status === '100' || status === 'ORDER_RECEIVED') {
                    return {
                        status: 'PENDING',
                        providerReference: response.data.orderid || requestId,
                        rawResponse: response.data
                    };
                }
                return {
                    status: 'FAILED',
                    providerReference: requestId,
                    message: response.data.message || 'Failed',
                    rawResponse: response.data
                };
            }
            catch (error) {
                return {
                    status: 'PENDING',
                    providerReference: requestId,
                    message: 'Network Error',
                    rawResponse: error.message
                };
            }
        });
    }
    validateCableSmartcard(providerId, smartcardNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `?${this.getCredentials()}&Action=VerifyCableTV&CableTV=${providerId}&SmartCardNo=${smartcardNumber}`;
                const response = yield this.client.get(url);
                // Check if name is returned
                if (response.data.name && response.data.name !== 'INVALID') {
                    return { isValid: true, customerName: response.data.name };
                }
                return { isValid: false, message: 'Invalid Smartcard Number' };
            }
            catch (error) {
                return { isValid: false, message: 'Validation Failed' };
            }
        });
    }
    purchaseCable(providerId, packageId, smartcardNumber, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `?${this.getCredentials()}&Action=BuyCableTV&CableTV=${providerId}&Package=${packageId}&SmartCardNo=${smartcardNumber}&RequestID=${requestId}`;
                const response = yield this.client.get(url);
                const status = response.data.status || response.data.statuscode;
                if (status === '100' || status === 'ORDER_RECEIVED') {
                    return {
                        status: 'PENDING',
                        providerReference: response.data.orderid || requestId,
                        rawResponse: response.data
                    };
                }
                return {
                    status: 'FAILED',
                    providerReference: requestId,
                    message: response.data.message || 'Failed',
                    rawResponse: response.data
                };
            }
            catch (error) {
                return {
                    status: 'PENDING',
                    providerReference: requestId,
                    message: 'Network Error',
                    rawResponse: error.message
                };
            }
        });
    }
    validateElectricityMeter(providerId, meterNumber, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const meterType = type === 'PREPAID' ? '01' : '02'; // ClubKonnect mapping usually assumed
                const url = `?${this.getCredentials()}&Action=VerifyElectricity&Disco=${providerId}&MeterNo=${meterNumber}&MeterType=${meterType}`;
                const response = yield this.client.get(url);
                if (response.data.name && response.data.name !== 'INVALID') {
                    return { isValid: true, customerName: response.data.name, customerAddress: response.data.address };
                }
                return { isValid: false, message: 'Invalid Meter Number' };
            }
            catch (error) {
                return { isValid: false, message: 'Validation Failed' };
            }
        });
    }
    purchaseElectricity(providerId, meterNumber, amount, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // We need to know the meter type here, defaulting to '01' (Prepaid) if not passed in context, 
                // but ideally this method signature should include it or we infer it. 
                // For now assuming we pass '01' or rely on previous validation context.
                // Let's assume passed ID includes type or we default. 
                // Standardizing: let's assume '01' for now or update interface to pass type.
                const meterType = '01';
                const url = `?${this.getCredentials()}&Action=PayElectricity&Disco=${providerId}&MeterNo=${meterNumber}&Amount=${amount}&MeterType=${meterType}&RequestID=${requestId}`;
                const response = yield this.client.get(url);
                const status = response.data.status || response.data.statuscode;
                if (status === '100' || status === 'ORDER_RECEIVED') {
                    return {
                        status: 'PENDING', // Verify if token is immediate or async
                        providerReference: response.data.orderid || requestId,
                        token: response.data.token, // If present
                        rawResponse: response.data
                    };
                }
                return {
                    status: 'FAILED',
                    providerReference: requestId,
                    message: response.data.message || 'Failed',
                    rawResponse: response.data
                };
            }
            catch (error) {
                return {
                    status: 'PENDING',
                    providerReference: requestId,
                    message: 'Network Error',
                    rawResponse: error.message
                };
            }
        });
    }
    queryTransactionStatus(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Action=QueryTransaction&RequestID={requestId}
                const url = `?${this.getCredentials()}&Action=QueryTransaction&RequestID=${requestId}`;
                const response = yield this.client.get(url);
                // Analyze response structure for status
                // ClubKonnect specific status mapping needed here
                const statusStr = response.data.status || response.data.statuscode;
                let status = 'PENDING';
                if (statusStr === '200' || statusStr === 'ORDER_COMPLETED')
                    status = 'SUCCESS';
                else if (statusStr === 'FAILED' || statusStr === 'ORDER_CANCELLED')
                    status = 'FAILED';
                return {
                    status,
                    providerReference: response.data.orderid || requestId,
                    message: response.data.message,
                    rawResponse: response.data
                };
            }
            catch (error) {
                return {
                    status: 'PENDING',
                    providerReference: requestId,
                    message: 'Network Error',
                    rawResponse: error.message
                };
            }
        });
    }
    fundBettingWallet(customerId, amount, providerCode, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `?${this.getCredentials()}&Action=FundBettingWallet&CustomerId=${customerId}&Amount=${amount}&BettingCompany=${providerCode}&RequestID=${requestId}`;
                const response = yield this.client.get(url);
                const status = response.data.status || response.data.statuscode;
                if (status === '100' || status === 'ORDER_RECEIVED') {
                    return {
                        status: 'PENDING',
                        providerReference: response.data.orderid || requestId,
                        rawResponse: response.data
                    };
                }
                return {
                    status: 'FAILED',
                    providerReference: requestId,
                    message: response.data.message || 'Failed',
                    rawResponse: response.data
                };
            }
            catch (error) {
                return {
                    status: 'PENDING',
                    providerReference: requestId,
                    message: 'Network Error',
                    rawResponse: error.message
                };
            }
        });
    }
    purchaseEducationPIN(type, quantity, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Mapping type to ClubKonnect Action params
                let action = '';
                switch (type) {
                    case 'WAEC':
                        action = 'WAECResultChecker';
                        break;
                    case 'JAMB':
                        action = 'JAMB';
                        break;
                    case 'NECO':
                        action = 'NECOResultChecker';
                        break;
                    case 'NABTEB':
                        action = 'NABTEBResultChecker';
                        break;
                    default: throw new Error('Invalid Education Type');
                }
                // Note: JAMB usually requires Profile ID. Assumed simple PIN purchase here.
                const url = `?${this.getCredentials()}&Action=${action}&Quantity=${quantity}&RequestID=${requestId}`;
                const response = yield this.client.get(url);
                const status = response.data.status || response.data.statuscode;
                if (status === '100' || status === 'ORDER_RECEIVED') {
                    return {
                        status: 'PENDING',
                        providerReference: response.data.orderid || requestId,
                        token: response.data.pin || response.data.serial, // Assuming PIN is returned here
                        rawResponse: response.data
                    };
                }
                return {
                    status: 'FAILED',
                    providerReference: requestId,
                    message: response.data.message || 'Failed',
                    rawResponse: response.data
                };
            }
            catch (error) {
                return {
                    status: 'PENDING',
                    providerReference: requestId,
                    message: 'Network Error',
                    rawResponse: error.message
                };
            }
        });
    }
    printRechargeCard(networkId, amount, quantity, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `?${this.getCredentials()}&Action=PrintRechargeCard&MobileNetwork=${networkId}&Value=${amount}&Quantity=${quantity}&RequestID=${requestId}`;
                const response = yield this.client.get(url);
                const status = response.data.status || response.data.statuscode;
                if (status === '100' || status === 'ORDER_RECEIVED') {
                    return {
                        status: 'PENDING',
                        providerReference: response.data.orderid || requestId,
                        token: JSON.stringify(response.data.pins), // Return all pins as stringified data
                        rawResponse: response.data
                    };
                }
                return {
                    status: 'FAILED',
                    providerReference: requestId,
                    message: response.data.message || 'Failed',
                    rawResponse: response.data
                };
            }
            catch (error) {
                return {
                    status: 'PENDING',
                    providerReference: requestId,
                    message: 'Network Error',
                    rawResponse: error.message
                };
            }
        });
    }
}
exports.ClubKonnectProvider = ClubKonnectProvider;
