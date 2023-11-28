import mongoose, {Model, Schema} from 'mongoose';
import { IOrder } from '../interfaces/order';

const orderSchema = new Schema({
    user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    orderItems: [{
        _id: {type: Schema.Types.ObjectId, required: true, ref: 'Product'},
        title: {type: String, required: true},
        quantity: {type: Number, required: true},
        slug: {type: String, required: true},
        image: {type: String, required: true},
        price: {type: Number, required: true},
        weight: {type: Number, required: true},
        productType: {type: Schema.Types.ObjectId, required: true, ref: 'ProductType'},
    }],
    shippingAddress: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        address: {type: String, required: true},
        address2: {type: String},
        zip: {type: String, required: true},
        district: {type: String, required: true},
        canton: {type: String, required: true},
        province: {type: String, required: true},
        country: {type: String, required: true},
        phone: {type: String, required: true},
    },
    numberOfItems: {type: Number, required: true},
    subTotal: {type: Number, required: true},
    tax: {type: Number, required: true},
    shippingFee: {type: Number, required: true},
    total: {type: Number, required: true},
    deliveryType: {
        type: String, 
        enum: {
            values: ['envio','retiro'],
            message: '{VALUE} no es un tipo válido'
        }, 
        default: 'retiro'
    },
    state: {
        type: String, 
        enum: {
            values: ['pendiente','pagada','entregada'],
            message: '{VALUE} no es un tipo válido'
        }, 
        default: 'pendiente'
    },
    paidAt: {type: String },
    transactionId: {type: String },

},{
    timestamps: true
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;