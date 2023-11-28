import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import { IOrder } from '../../../interfaces/order';
import { connectDB, disconnectDB } from '../../../database/db';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import { isValidObjectId } from 'mongoose';
import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import { IUser } from '../../../interfaces/users';
import { currencyFormat } from '../../../utils/currency';
import { capitalize } from '@mui/material';
import User from '../../../models/User';

type Data = 
| { message: string }
| IOrder
| {data: IOrder[], totalItems: Number, totalPages: Number};

// interface SendgridTransportOptions {
//     auth: {
//       api_key: string;
//     };
//   }

// const sendgridOptions: SendgridTransportOptions = {
//     auth: {
//         api_key: process.env.SENDGRID_API_KEY || '', // Asegúrate de manejar el caso en el que SENDGRID_API_KEY esté ausente
//     }
// };
  
// const transporter = nodemailer.createTransport(sendgridTransport(sendgridOptions));
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {

    switch(req.method){
        case 'GET': 
            return getOrders(req, res);
        case 'POST': 
            return createOrder(req, res);
        default:
            return res.status(400).json({message: 'Bad Request'});
    }

}

const getOrders = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    let {userId = '', state = '', page = 1, pageSize = 10} = req.query;

    if(!isValidObjectId(userId)){
        return [];
    }

    let condicion = {};  

    if(state != 'pendiente' && state != 'pagada' && state != 'entregada'){
        condicion = {user: userId};
    }else{
        condicion = {user: userId, state};
    }

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);
  
    if (isNaN(pageNumber) || isNaN(pageSizeNumber)) {
      return res.status(400).json({ message: 'Los parámetros de paginación deben ser números válidos.' });
    }
  
    if (pageNumber <= 0 || pageSizeNumber <= 0) {
      return res.status(400).json({ message: 'Los números de página y tamaño de página deben ser mayores a cero.' });
    }

    try{

        await connectDB();

        const totalItems = await Order.countDocuments(condicion);
        const totalPages = Math.ceil(totalItems / pageSizeNumber);
        const skipItems = (pageNumber - 1) * pageSizeNumber;

        const orders = await Order.find(condicion).sort({createdAt: 'desc'}).skip(skipItems).limit(pageSizeNumber).lean();

        await disconnectDB();

        return res.status(200).json({ data: orders, totalItems, totalPages });

    } catch (error) {
        return res.status(500).json({ message: 'Error cargando órdenes'});
    }

}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const {orderItems, total, deliveryType} = req.body as IOrder;    

    const session: any = await getSession({req});

    if(!session){
        return res.status(401).json({message: 'Debe de estar autenticado para hacer esto'});
    }

    const productsIds = orderItems.map(product => product._id);
    

    try {

        await connectDB();

        const dbProducts = await Product.find({_id: {$in: productsIds}});
        
        const subtotal = orderItems.reduce((prev, current) => { 

            const currentPrice = dbProducts.find(prod => prod.id === current._id)?.price;
            if(!currentPrice){
                throw new Error('Verifique el carrito de nuevo, producto no existe');
            }

            return (currentPrice * current.quantity) + prev
        }, 0);

        const tax = orderItems.reduce((prev, current) => { 

            const currentPrice = dbProducts.find(prod => prod.id === current._id)?.price;
            if(!currentPrice){
                throw new Error('Verifique el carrito de nuevo, producto no existe');
            }

            return ((currentPrice * current.quantity) * (current.productType?.tax!/100)) + prev
        }, 0);

        const shippingFeeFirstKG = Number(process.env.NEXT_PUBLIC_TARIFA_ENVIO_PRIMER_KG || 0);
        const shippingFeeEveryOtherKG = Number(process.env.NEXT_PUBLIC_TARIFA_ENVIO_POR_CADA_KG_ADICIONAL || 0);

        const totalWeight = orderItems.reduce((prev, current) => (current.weight * current.quantity) + prev, 0);
        const shippingFee = ((totalWeight >= 1) ? shippingFeeFirstKG : (shippingFeeFirstKG * totalWeight)) + ((totalWeight >= 1) ? ((totalWeight - 1) * shippingFeeEveryOtherKG) : 0);

        let finalShippingFee = deliveryType === 'envio' ? shippingFee : 0;

        if(session.user.freeShipping){
            finalShippingFee = 0;
        }

        const backendTotal = (subtotal + finalShippingFee) + tax;

        if(total !== backendTotal){
            throw new Error('El total no cuadra con el monto recibido');
        }

        const userId = session.user._id;
        const newOrder = new Order({...req.body, state: 'pendiente', user: userId});
        newOrder.total = Math.round(newOrder.total*100) / 100;
        await newOrder.save();        
        

        const productUpdatePromises = [];
        for (const product of dbProducts) {
            const productToBuy = orderItems.find(prod => prod._id === product.id);
            const quantity = productToBuy?.quantity || 0;
            productUpdatePromises.push(product.update({inStock: product.inStock - quantity}));
        }
        const results = await Promise.all(productUpdatePromises);

        const admins = await User.find({role: 'admin'});
        const emailsAdmins: string[] = admins.map(admin => admin.email);
        const emailPromises = [];
        emailPromises.push(transporter.sendMail(opcionesEmailToClientNewOrder(session.user, newOrder)));
        emailPromises.push(transporter.sendMail(opcionesEmailToAdminsNewOrder(emailsAdmins, newOrder)));
        const results2 = await Promise.all(emailPromises);

        await disconnectDB();
        return res.status(201).json(newOrder);

    } catch (error: any) {
        await disconnectDB();
        //console.log(error);
        res.status(400).json({
            message: error.message || 'Revise logs del servidor'
        })
        
    }
    
}

const opcionesEmailToClientNewOrder = (user: IUser, order:IOrder) => {

    return {
        to: user.email,
        from: process.env.ADMIN_EMAIL_TO_SEND_EMAILS,
        subject: '¡Tu orden ha sido creada!',
        html: `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    /* Estilos CSS para el correo */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #F9B63C;
                        color: #fff;
                        text-align: center;
                        padding: 0px 0;
                    }
                    .content {
                        background-color: #fff;
                        padding: 20px;
                    }
                    h1 {
                        color: #333;
                    }
                    a {
                        color: #007bff; /* Color del enlace */
                        text-decoration: none; /* Quitar subrayado */
                    }
                    a:hover {
                        text-decoration: underline; /* Subrayado al pasar el cursor */
                    }
                    p {
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                    </div>
                    <img src="${process.env.HOST_NAME}/aapiden_logo.jpg" alt="AAPIDEN" width="512" height="253" />
                    <div class="content">
                        <p>Estimado/a ${user.name},</p>
                        <p>Tu orden ha sido creada con éxito. A continuación, encontrarás los detalles de tu orden:</p>
                        <p><strong>ID de orden:</strong> ${order._id}</p>
                        <p><strong>Tipo de entrega:</strong> ${capitalize(order.deliveryType)}</p>
                        <p><strong>Estado de orden:</strong> ${capitalize(order.state)}</p>
                        <p><strong>Total de la orden:</strong> ${currencyFormat(order.total)}</p>
                        <p>El siguiente paso es que realices el pago por SINPE Móvil al ${process.env.NEXT_PUBLIC_TELEFONO_SINPE_PAGOS}.</p>
                        <p>Y luego ingresas el número del comprobante en el detalle de la orden. <a href="${process.env.HOST_NAME}/orders/${order._id}">Para ello puedes hacer clic aquí</a></p>
                        <p>¡Gracias por tu compra!</p>
                    </div>
                </div>
            </body>
        </html>
        `
    };

}

const opcionesEmailToAdminsNewOrder = (emails: string[], order:IOrder) => {

    return {
        to: emails,
        from: process.env.ADMIN_EMAIL_TO_SEND_EMAILS,
        subject: '¡Se ha realizado una nueva orden!',
        html: `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    /* Estilos CSS para el correo */
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #F9B63C;
                        color: #fff;
                        text-align: center;
                        padding: 0px 0;
                    }
                    .content {
                        background-color: #fff;
                        padding: 20px;
                    }
                    h1 {
                        color: #333;
                    }
                    a {
                        color: #007bff; /* Color del enlace */
                        text-decoration: none; /* Quitar subrayado */
                    }
                    a:hover {
                        text-decoration: underline; /* Subrayado al pasar el cursor */
                    }
                    p {
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                    </div>
                    <img src="${process.env.HOST_NAME}/aapiden_logo.jpg" alt="AAPIDEN" width="512" height="253" />
                    <div class="content">
                        <p>Estimado/a Administrador/a,</p>
                        <p>Se ha realizado una nueva orden. A continuación, encontrarás los detalles de la orden:</p>
                        <p><strong>ID de orden:</strong> ${order._id}</p>
                        <p><strong>Tipo de entrega:</strong> ${capitalize(order.deliveryType)}</p>
                        <p><strong>Estado de orden:</strong> ${capitalize(order.state)}</p>
                        <p><strong>Total de la orden:</strong> ${currencyFormat(order.total)}</p>
                        <p><a href="${process.env.HOST_NAME}/admin/orders/${order._id}">Para ver el detalle de la orden puedes hacer clic aquí</a></p>
                    </div>
                </div>
            </body>
        </html>
        `
    };

}