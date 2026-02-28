import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function seedSoftware() {
    console.log('Starting Software Migration...');
    let count = 0;

    // Seed Initial Featured Products
    for (const p of productsList) {
        await prisma.softwareProduct.create({
            data: {
                name: p.name,
                description: `Genuine ${p.name} license key. Instant delivery via email/dashboard.`,
                category: p.cat,
                brand: p.brand,
                price: p.price,
                originalPrice: p.orig,
                platform: ["Windows"],
                licenseType: "Retail",
                image: `/images/software/${p.cat.toLowerCase()}.png`,
                rating: 4.5 + Math.random() * 0.5,
                sales: Math.floor(Math.random() * 5000) + 100,
                bestSeller: Math.random() > 0.8,
                stock: -1 // Unlimited API keys
            }
        });
        count++;
    }

    // Generate 490 additional random products
    for (let i = count; i < 500; i++) {
        const catKeys = Object.keys(brands);
        const cat = catKeys[Math.floor(Math.random() * catKeys.length)];
        const brandList = brands[cat as keyof typeof brands];
        const brand = brandList[Math.floor(Math.random() * brandList.length)];
        const platform = Math.random() > 0.5 ? ["Windows"] : ["Windows", "Mac"];

        await prisma.softwareProduct.create({
            data: {
                name: `${brand} ${cat === "OS" ? "License" : cat + " Tool"} ${2023 + Math.floor(i / 100)}`,
                description: "Official license key with full support updates.",
                category: cat,
                brand: brand,
                price: Math.floor(Math.random() * 50000) + 5000,
                originalPrice: Math.floor(Math.random() * 100000) + 60000,
                platform: platform,
                licenseType: Math.random() > 0.7 ? "Lifetime" : "1 Year",
                image: `/images/software/${cat.toLowerCase()}.png`, // Safe fallback
                rating: 4.0 + Math.random(),
                sales: Math.floor(Math.random() * 1000),
                bestSeller: Math.random() > 0.9,
                stock: -1
            }
        });
        count++;
        if (count % 100 === 0) console.log(`Seeded ${count} items...`);
    }

    console.log(`Successfully migrated ${count} Software Products!`);
}

seedSoftware()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
