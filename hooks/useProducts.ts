import useSWR, { SWRConfiguration } from 'swr'
import { IProduct } from '../interfaces/products';

// const fetcher = (...args: [key: string]) => fetch(...args).then(res => res.json());

interface OrderResponse {
    products: IProduct[];
    totalProducts: number;
    totalPages: number;
}

export const useProducts = (url: string, config: SWRConfiguration = {}) => {

    // const { data, error } = useSWR<IProduct[]>(`/api${url}`, fetcher, config);
    const { data, error, mutate } = useSWR<OrderResponse>(`/api${url}`, config);

    return {
        data,
        isLoading: !error && !data,
        isError: error,
        mutate
    }

}