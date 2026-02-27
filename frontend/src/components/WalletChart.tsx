"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function WalletChart({ transactions }: { transactions: any[] }) {
    // Process transactions into daily balances (simplified trend)
    const data = transactions?.slice(0, 10).reverse().map((tx, i) => ({
        name: new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        value: parseFloat(tx.amount || 0),
    })) || [];

    if (data.length === 0) {
        return (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm italic">
                Insufficient data for trend analysis
            </div>
        );
    }

    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
