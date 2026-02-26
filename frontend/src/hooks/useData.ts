import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => {
    const token = localStorage.getItem('token');
    return api.get(url, token || '');
};

export function useUser() {
    const { data, error, isLoading, mutate } = useSWR('/user/profile', fetcher);

    return {
        user: data,
        isLoading,
        isError: error,
        mutate
    };
}

export function useWallet() {
    const { data, error, isLoading, mutate } = useSWR('/wallet/balance', fetcher);

    return {
        balance: data?.balance,
        currency: data?.currency,
        isLoading,
        isError: error,
        mutate
    };
}

export function useTransactions() {
    const { data, error, isLoading, mutate } = useSWR('/wallet/transactions', fetcher);

    return {
        transactions: data || [],
        isLoading,
        isError: error,
        mutate
    };
}
