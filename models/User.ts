import mongoose, {Model, Schema} from 'mongoose';
import { IUser } from '../interfaces/users';

const userSchema = new Schema({
    //id: {type: Schema.Types.ObjectId, required: true},

    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone: {type: String, required: true},
    password: {type: String, required: true},
    freeShipping: {type: Boolean, required: true, default: false},
    role: {
        type: String, 
        enum: {
            values: ['admin','client'],
            message: '{VALUE} no es un rol válido',
            default: 'client',
            required: true
        }
    },
},{
    timestamps: true
});



const User: Model<IUser> = mongoose.models.User || mongoose.model('User', userSchema);

export default User;