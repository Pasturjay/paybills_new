
export interface SoftwareProduct {
    id: string;
    name: string;
    description: string;
    category: "OS" | "Productivity" | "Security" | "Creative" | "Developer" | "VPN" | "Gaming";
    brand: string;
    price: number;
    originalPrice: number;
    platform: ("Windows" | "Mac" | "Linux" | "Android" | "iOS")[];
    licenseType: "Lifetime" | "1 Year" | "Subscription" | "Retail" | "OEM";
    image: string;
    rating: number;
    sales: number;
    bestSeller?: boolean;
}

const brands = {
    OS: ["Microsoft", "Red Hat", "Ubuntu"],
    Productivity: ["Microsoft", "Adobe", "Corel", "Wondershare", "Foxit", "Nitro"],
    Security: ["Kaspersky", "Norton", "McAfee", "Bitdefender", "ESET", "Avast", "Malwarebytes"],
    Creative: ["Adobe", "Corel", "Canva", "Autodesk", "Maxon"],
    Developer: ["JetBrains", "GitHub", "Docker", "Navicat", "Sublime"],
    VPN: ["NordVPN", "ExpressVPN", "Surfshark", "CyberGhost"],
    Gaming: ["Steam", "Xbox", "PlayStation", "EA", "Ubisoft"]
};

const productsList = [
    { name: "Windows 11 Pro", cat: "OS", brand: "Microsoft", price: 15000, orig: 45000 },
    { name: "Windows 10 Pro", cat: "OS", brand: "Microsoft", price: 12000, orig: 35000 },
    { name: "Office 2021 Pro Plus", cat: "Productivity", brand: "Microsoft", price: 25000, orig: 85000 },
    { name: "Microsoft 365 Personal", cat: "Productivity", brand: "Microsoft", price: 18000, orig: 22000 },
    { name: "Kaspersky Total Security", cat: "Security", brand: "Kaspersky", price: 8000, orig: 15000 },
    { name: "Norton 360 Deluxe", cat: "Security", brand: "Norton", price: 10000, orig: 25000 },
    { name: "Adobe Creative Cloud", cat: "Creative", brand: "Adobe", price: 45000, orig: 60000 },
    { name: "CorelDRAW Graphics Suite", cat: "Creative", brand: "Corel", price: 55000, orig: 150000 },
    { name: "IntelliJ IDEA Ultimate", cat: "Developer", brand: "JetBrains", price: 85000, orig: 100000 },
    { name: "NordVPN 1 Year", cat: "VPN", brand: "NordVPN", price: 15000, orig: 35000 },
];

export function generateSoftwareProducts(count: number = 500): SoftwareProduct[] {
    const products: SoftwareProduct[] = [];

    // Add seeded products first
    productsList.forEach((p, i) => {
        products.push({
            id: `soft-${i}`,
            name: p.name,
            description: `Genuine ${p.name} license key. Instant delivery via email/dashboard.`,
            category: p.cat as any,
            brand: p.brand,
            price: p.price,
            originalPrice: p.orig,
            platform: ["Windows"],
            licenseType: "Retail",
            image: `/images/software/${p.cat.toLowerCase()}.png`,
            rating: 4.5 + Math.random() * 0.5,
            sales: Math.floor(Math.random() * 5000) + 100,
            bestSeller: Math.random() > 0.8
        });
    });

    // Generate remaining
    for (let i = products.length; i < count; i++) {
        const catKeys = Object.keys(brands);
        const cat = catKeys[Math.floor(Math.random() * catKeys.length)] as any;
        const brandList = brands[cat as keyof typeof brands];
        const brand = brandList[Math.floor(Math.random() * brandList.length)];
        const platform: any[] = Math.random() > 0.5 ? ["Windows"] : ["Windows", "Mac"];

        products.push({
            id: `soft-${i}`,
            name: `${brand} ${cat === "OS" ? "License" : cat + " Tool"} ${2023 + Math.floor(i / 100)}`,
            description: "Official license key with full support updates.",
            category: cat,
            brand: brand,
            price: Math.floor(Math.random() * 50000) + 5000,
            originalPrice: Math.floor(Math.random() * 100000) + 60000,
            platform,
            licenseType: Math.random() > 0.7 ? "Lifetime" : "1 Year",
            image: "",
            rating: 4.0 + Math.random(),
            sales: Math.floor(Math.random() * 1000),
            bestSeller: Math.random() > 0.9
        });
    }

    return products;
}
