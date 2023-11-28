import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../database/db';
import { initialData } from '../../database/seed-data';
import Order from '../../models/Order';
import Product from '../../models/Product';
import User from '../../models/User';
import ProductType from '../../models/ProductType';
import Review from '../../models/Review';

//SOLO PARA DESARROLLO

type Data = {
    message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    if(process.env.NODE_ENV === 'production'){
        return res.status(401).json({message: 'No tiene acceso a este servicio'});
    }

    await connectDB();

    await User.deleteMany();
    await ProductType.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    await User.insertMany(initialData.users);

    const productTypes = await ProductType.insertMany(initialData.productTypes);
    
    // await Product.insertMany(initialData.products);    
    const products = initialData.products.map(product => {
        const randomProductType = productTypes[Math.floor(Math.random() * productTypes.length)];
    
        return {
          ...product,
          productType: randomProductType._id,
        };
    });
    await Product.insertMany(products);

    await disconnectDB();

    res.status(200).json({ message: 'Proceso realizado correctamente' })
}