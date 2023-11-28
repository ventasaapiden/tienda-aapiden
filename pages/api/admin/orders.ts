import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, disconnectDB } from '../../../database/db';
import Order from '../../../models/Order';
import { IOrder, IOrderState } from '../../../interfaces/order';
import { getToken } from 'next-auth/jwt';
import Product from '../../../models/Product';
import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import { IUser } from '../../../interfaces/users';
import { getSession } from 'next-auth/react';
import User from '../../../models/User';

type Data = 
| {message: string}
| {data: IOrder[], totalItems: Number, totalPages: Number}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    const session: any = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const validRoles = ['admin'];
    if(!session || !validRoles.includes(session.user.role)){
        return res.status(400).json({message: 'No autorizado'});
    }

    switch(req.method){
        case 'GET': 
            return getOrders(req, res);
        case 'PUT': 
            return updateOrderState(req, res);
        case 'DELETE': 
            return deleteOrder(req, res);
        
        default:
            return res.status(400).json({message: 'Bad Request'});
    }

}

const getOrders = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    let {state = '', page = 1, pageSize = 10} = req.query;
    let condicion = {};  
    //console.log(state);

    if(state != 'pendiente' && state != 'pagada' && state != 'entregada'){
        condicion = {};
    }else{
        condicion = {state};
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
        
        const orders = await Order.find(condicion).sort({createdAt: 'desc'}).skip(skipItems).limit(pageSizeNumber).populate('user', 'name email').lean();
        await disconnectDB();

        return res.status(200).json({ data: orders, totalItems, totalPages });
    
    } catch (error) {
        return res.status(500).json({ message: 'Error cargando órdenes'});
    }

}

const updateOrderState = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const {id = '', state = ''} = req.body;

    try {

        await connectDB();
        
        const order = await Order.findById(id);

        if(state === 'pendiente'){
            throw new Error('Solo se puede cambiar el estado de la orden a pagada o entregada');
        }

        if(state === 'pagada' && (!order?.transactionId || order.transactionId === '' || order.state === 'entregada')){
            throw new Error('Solo se puede cambiar el estado de la orden a pagada si tiene comprobante y no ha sido entregada');
        }

        if(state === 'entregada' && (!order?.transactionId || order.transactionId === '' || order.state === 'pendiente')){
            throw new Error('Solo se puede cambiar el estado de la orden a entregada si tiene comprobante y ya fue pagada');
        }
    
        const orderUser = await User.findById(order.user);
        await order?.update({state});
        
        // const session: any = await getSession({req});
        if(state === 'pagada'){
            // await transporter.sendMail(opcionesEmailToClientOrdenPagada(session.user, id));
            await transporter.sendMail(opcionesEmailToClientOrdenPagada(orderUser, id));
        }else if(state === 'entregada'){
            // await transporter.sendMail(opcionesEmailToClientOrdenEntregada(session.user, id));
            await transporter.sendMail(opcionesEmailToClientOrdenEntregada(orderUser, id));
        }

        await disconnectDB();
        return res.status(201).json({message: 'Orden actualizada correctamente'});

    } catch (error: any) {
        await disconnectDB();
        //console.log(error);
        res.status(400).json({
            message: error.message || 'Revise logs del servidor'
        })
        
    }
    
}

const deleteOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    
    const {id = ''} = req.body;

    try {

        await connectDB();
        
        const order = await Order.findById(id);
        

        if(order?.state != 'pendiente'){
            throw new Error('Solo se pueden eliminar órdenes pendientes');
        }

        const productsIds = order.orderItems.map(product => product._id);

        const dbProducts = await Product.find({_id: {$in: productsIds}});

        const productUpdatePromises = [];
        for (const product of dbProducts) {
            const productToUpdate = order.orderItems.find(prod => prod._id.toString() === product.id);
            const quantity = productToUpdate?.quantity || 0;

            productUpdatePromises.push(product.update({inStock: product.inStock + quantity}));
        }
        const results = await Promise.all(productUpdatePromises);

        const orderUser = await User.findById(order.user);
        await order.delete();

        // const session: any = await getSession({req});
        // await transporter.sendMail(opcionesEmailToClientOrdenEliminada(session.user, id));
        await transporter.sendMail(opcionesEmailToClientOrdenEliminada(orderUser, id));

        await disconnectDB();
        return res.status(201).json({message: 'Orden eliminada correctamente'});

    } catch (error: any) {
        await disconnectDB();
        //console.log(error);
        res.status(400).json({
            message: error.message || 'Revise logs del servidor'
        })
        
    }
    
}

const opcionesEmailToClientOrdenPagada = (user: IUser, orderId:string) => {

    return {
        to: user.email,
        from: process.env.ADMIN_EMAIL_TO_SEND_EMAILS,
        subject: '¡El comprobante de tu orden ha sido verificado!',
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
                        <p>Hemos verificado el comprobante de tu orden con ID: ${orderId}.</p>
                        <p>Estado de la orden: pagada.</p>
                        <p>Procederemos con el procesamiento de tu orden.</p>
                        <p>¡Gracias por tu compra!</p>
                    </div>
                </div>
            </body>
        </html>
        `
    };

}

const opcionesEmailToClientOrdenEntregada = (user: IUser, orderId:string) => {

    return {
        to: user.email,
        from: process.env.ADMIN_EMAIL_TO_SEND_EMAILS,
        subject: '¡Tu orden ha sido entregada!',
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
                        <p>Tu orden con ID: ${orderId} ha sido entregada.</p>
                        <p>Esperamos que disfrutes los productos que adquiriste.</p>
                        <p>¡Gracias por tu compra!</p>
                    </div>
                </div>
            </body>
        </html>
        `
    };

}

const opcionesEmailToClientOrdenEliminada = (user: IUser, orderId:string) => {

    return {
        to: user.email,
        from: process.env.ADMIN_EMAIL_TO_SEND_EMAILS,
        subject: 'Tu orden ha sido eliminada',
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
                        <p>Hemos eliminado tu orden con ID: ${orderId} debido a que el pago no fue realizado a tiempo.</p>
                        <p>En caso de que aún desees realizar la compra, debes realizar una nueva orden.</p>
                        <p>¡Gracias por tu comprensión!</p>
                    </div>
                </div>
            </body>
        </html>
        `
    };

}