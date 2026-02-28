export const SUCCESS_MESSAGES = [
    "Packet delivered! Your friend's wallet just gained +100 XP. 🚀",
    "Transaction confirmed. The bits have shifted in your favor. 💾",
    "Money beamed successfully! No packet loss detected. 🛰️",
    "Database updated. Your generosity has been recorded in the holy ledger. 📜",
    "Gift delivered. Your friend's balance just got a significant upgrade. 🛠️",
    "Success! You've successfully performed a manual wealth redistribution. 💸",
    "Ping successful! Recipient's wallet is now 'Higher' than it was before. 📶",
    "Commit successful. Your friendship has been successfully merged into the master branch. 🌿"
];

export const FAILURE_MESSAGES = [
    "404: Funds Not Found. Did you spend them on RGB lighting? 🌈",
    "Stack Overflow! Your generosity exceeded your current capacity. 📉",
    "Access Denied. The bank vault is currently feeling a bit protective. 🏰",
    "Connection Timed Out. Even the money is taking a coffee break. ☕",
    "Transaction Aborted. We encountered an unexpected glitch in the matrix. 🕶️",
    "Kernel Panic! Too much digital love, not enough digital dough. 🍞",
    "Segmentation Fault. Your wallet is currently pointing to a null pointer. 📍",
    "Conflict detected. Your desire to gift is at odds with your current balance. ⚔️"
];

export const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
};
