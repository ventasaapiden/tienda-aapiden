export interface DashboardSummaryResponse {
    numberOfOrders: number;
    paidOrders: number; 
    deliveredOrders: number;
    notPaidOrders: number;
    numberOfClients: number; //role client
    numberOfProductTypes: number;
    numberOfProducts: number;
    productsWithNoInventory: number; // 0
    lowInventory: number; // 10 o menos
    numberOfReviews: number;
}
