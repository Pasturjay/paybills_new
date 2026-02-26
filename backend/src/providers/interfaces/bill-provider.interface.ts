export interface NetworkProvider {
    id: string;
    name: string;
}

export interface DataPlan {
    id: string;
    networkId: string;
    name: string;
    price: number;
    validity?: string;
}

export interface BillProvider {
    /**
     * Get the balance of the provider's wallet
     */
    getWalletBalance(): Promise<number>;

    /**
     * Get Airtime providers (MTN, GLO, etc.)
     */
    getAirtimeProviders(): Promise<NetworkProvider[]>;

    /**
     * Purchase Airtime
     * @param networkId Provider network ID
     * @param phonePhoneNumber Recipient phone number
     * @param amount Amount in NGN
     * @param requestId Unique request ID for idempotency/reference
     */
    purchaseAirtime(networkId: string, phoneNumber: string, amount: number, requestId: string): Promise<ProviderTransactionResponse>;

    /**
     * Get Data Plans for a network
     */
    getDataPlans(networkId: string): Promise<DataPlan[]>;

    /**
     * Purchase Data Bundle
     */
    purchaseData(networkId: string, planId: string, phoneNumber: string, requestId: string): Promise<ProviderTransactionResponse>;

    /**
     * Verify Cable TV Smartcard Number
     */
    validateCableSmartcard(providerId: string, smartcardNumber: string): Promise<CustomerValidationResponse>;

    /**
     * Purchase Cable TV Subscription
     */
    purchaseCable(providerId: string, packageId: string, smartcardNumber: string, requestId: string): Promise<ProviderTransactionResponse>;

    /**
     * Verify Electricity Meter
     */
    validateElectricityMeter(providerId: string, meterNumber: string, type: 'PREPAID' | 'POSTPAID'): Promise<CustomerValidationResponse>;

    /**
     * Purchase Electricity Token
     */
    purchaseElectricity(providerId: string, meterNumber: string, amount: number, requestId: string): Promise<ProviderTransactionResponse>;

    /**
     * Query Transaction Status (Reconciliation)
     */
    queryTransactionStatus(requestId: string): Promise<ProviderTransactionResponse>;

    /**
     * Fund Betting Wallet
     */
    fundBettingWallet?(customerId: string, amount: number, providerCode: string, requestId: string): Promise<ProviderTransactionResponse>;

    /**
     * Purchase Education PIN (WAEC, JAMB)
     */
    purchaseEducationPIN?(type: 'WAEC' | 'JAMB', quantity: number, requestId: string): Promise<ProviderTransactionResponse>;

    /**
     * Print Recharge Card (EPIN)
     */
    printRechargeCard?(networkId: string, amount: number, quantity: number, requestId: string): Promise<ProviderTransactionResponse>;
}

export interface ProviderTransactionResponse {
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    providerReference: string;
    token?: string; // For electricity
    message?: string;
    rawResponse?: any;
}

export interface CustomerValidationResponse {
    isValid: boolean;
    customerName?: string;
    customerAddress?: string; // For electricity
    outstandingBalance?: number;
    message?: string;
}
