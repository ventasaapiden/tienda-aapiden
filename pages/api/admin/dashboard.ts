import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import User from '../../../models/User';
import { getToken } from 'next-auth/jwt';
import ProductType from '../../../models/ProductType';
import Review from '../../../models/Review';

type Data = 
| {
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
| {message: string;}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    const session: any = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const validRoles = ['admin'];
    if(!session || !validRoles.includes(session.user.role)){
        return res.status(400).json({message: 'No autorizado'});
    }

    try{

        await connectDB();

        // const numberOfOrders = await Order.count();
        // const paidOrders = await Order.find({isPaid: true}).count();
        // const numberOfClients = await User.find({role: 'client'}).count();
        // const numberOfProducts = await Product.count();
        // const productsWithNoInventory = await Product.find({inStock: 0}).count();
        // const lowInventory = await Product.find({inStock: {$lte: 10}}).count();

        const [
            numberOfOrders,
            paidOrders,
            deliveredOrders,
            numberOfClients,
            numberOfProductTypes,
            numberOfProducts,
            productsWithNoInventory,
            lowInventory,
            numberOfReviews,
        ] = await Promise.all([
            Order.count(),
            // Order.find({ $or: [ { state: 'pagada'}, { state: 'entregada' } ] }).count(),
            Order.find({ state: 'pagada'}).count(),
            Order.find({ state: 'entregada' }).count(),
            User.find({role: 'client'}).count(),
            ProductType.count(),
            Product.count(),
            Product.find({inStock: 0}).count(),
            Product.find({inStock: {$lte: 10}}).count(),
            Review.count(),
        ])

        const notPaidOrders = numberOfOrders - (paidOrders + deliveredOrders);

        await disconnectDB();

        res.status(200).json({ 
            numberOfOrders,
            paidOrders,
            deliveredOrders,
            notPaidOrders,
            numberOfClients,
            numberOfProductTypes,
            numberOfProducts,
            productsWithNoInventory,
            lowInventory,
            numberOfReviews
        })

    } catch (error) {
        return res.status(500).json({ message: 'Error cargando estadisticas.'});
    }
}