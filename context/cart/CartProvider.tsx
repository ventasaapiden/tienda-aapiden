import { FC, PropsWithChildren, useReducer, useEffect, useContext } from 'react';
import { ICartProduct } from '../../interfaces/cart';
import { CartContext } from './CartContext';
import { cartReducer } from './cartReducer';
import Cookies from 'js-cookie';
import { IOrder, ShippingAddress } from '../../interfaces/order';
import mainApi from '../../apiFolder/mainApi';
import axios from 'axios';
import { AuthContext } from '../auth/AuthContext';

export interface CartState {
    isLoaded: boolean;
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    tax: number;
    needsShipping: boolean; 
    shippingFee: number;
    total: number;
    shippingAddress?: ShippingAddress;
}

const CART_INITIAL_STATE: CartState = {
    isLoaded: false,
    cart: [],
    numberOfItems: 0,
    subTotal: 0,
    tax: 0,
    needsShipping: false, 
    shippingFee: 0,
    total: 0,
    shippingAddress: undefined,
}

const getAddressFromCookies = ():ShippingAddress => {
    return {
        firstName: Cookies.get('firstName') || '',
        lastName: Cookies.get('lastName') || '',
        address: Cookies.get('address') || '',
        address2: Cookies.get('address2') || '',
        zip: Cookies.get('zip') || '',
        district: Cookies.get('district') || '',
        canton: Cookies.get('canton') || '',
        province: Cookies.get('province') || '',
        country: Cookies.get('country') || '',
        phone: Cookies.get('phone') || '',
    }
}

export const CartProvider: FC<PropsWithChildren> = ({children}) => {

    const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE);
    const {user} = useContext(AuthContext);

    useEffect(() => {

        if(Cookies.get('firstName')){
            dispatch({type: 'Cart - LoadAddress from Cookies', payload: getAddressFromCookies()});
        }

    }, [])

    useEffect(() => {
      
        try {
            const cookieProducts = Cookies.get('cart') ? JSON.parse(Cookies.get('cart')!): [];
            dispatch({type: 'Cart - LoadCart from cookies | storage', payload: cookieProducts});
        } catch (error) {
            dispatch({type: 'Cart - LoadCart from cookies | storage', payload: []});
        }
      
    }, [])
    

    useEffect(() => {
        Cookies.set('cart', JSON.stringify(state.cart));
    }, [state.cart])

    // useEffect(() => {

    //     const orderSummary = {
    //         numberOfItems: state.numberOfItems,
    //         subTotal: state.subTotal,
    //         tax: state.tax,
    //         needsShipping: state.needsShipping,
    //         shippingFee: state.shippingFee,
    //         total: (state.subTotal + state.shippingFee) + state.tax,
    //     }

    //     dispatch({type: 'Cart - Update order summary', payload: orderSummary});

    //     //console.log('Shipping fee updated',state);
        
    // }, [state.shippingFee])

    useEffect(() => {

        // console.log(state.cart);

        const numberOfItems = state.cart.reduce((prev, current) => current.quantity + prev, 0);
        const subTotal = state.cart.reduce((prev, current) => (current.price * current.quantity) + prev, 0);
        const tax = state.cart.reduce((prev, current) => ((current.price * current.quantity) * (current.productType?.tax!/100)) + prev, 0);

        const shippingFee = calculateShippingFee();

        const orderSummary = {
            numberOfItems,
            subTotal,
            tax,
            needsShipping: state.needsShipping,
            shippingFee: state.needsShipping ? shippingFee : 0,
            total: (subTotal + shippingFee) + tax,
        }

        dispatch({type: 'Cart - Update order summary', payload: orderSummary});

        //console.log('Cart Updated', state);
        
    }, [state.cart])

    const calculateShippingFee = ():number => {
        const shippingFeeFirstKG = Number(process.env.NEXT_PUBLIC_TARIFA_ENVIO_PRIMER_KG || 0);
        const shippingFeeEveryOtherKG = Number(process.env.NEXT_PUBLIC_TARIFA_ENVIO_POR_CADA_KG_ADICIONAL || 0);

        const totalWeight = state.cart.reduce((prev, current) => (current.weight * current.quantity) + prev, 0);
        let shippingFee:number = ((totalWeight >= 1) ? shippingFeeFirstKG : (shippingFeeFirstKG * totalWeight)) + ((totalWeight >= 1) ? ((totalWeight - 1) * shippingFeeEveryOtherKG) : 0);        

        // console.log(user);
        
        if(user?.freeShipping){
            shippingFee = 0;
        }

        return shippingFee;
    }

    const updateShippingFee = (needsShipping: boolean) => {
        const shippingFee = calculateShippingFee();

        const orderSummary = {
            numberOfItems: state.numberOfItems,
            subTotal: state.subTotal,
            tax: state.tax,
            needsShipping,
            shippingFee: needsShipping ? shippingFee : 0,
            total: (state.subTotal + (needsShipping ? shippingFee : 0)) + state.tax,
        }

        dispatch({type: 'Cart - Update order summary', payload: orderSummary});

        //console.log('Shipping fee changed radio', state);
    }
    

    const addProductToCart = (product: ICartProduct) => {        
        
        const productInCart = state.cart.some(p => p._id === product._id);

        if(!productInCart) return dispatch({type: 'Cart - Update products in cart', payload: [...state.cart, product]});

        const updatedProducts = state.cart.map(p => {

            if(p._id !== product._id) return p;

            p.quantity += product.quantity;
            return p;
        });

        dispatch({type: 'Cart - Update products in cart', payload: updatedProducts})

    }

    const updateCartQuantity = (product: ICartProduct) => {
        dispatch({type: 'Cart - Change cart quantity', payload: product});
    }

    const removeCartProduct = (product: ICartProduct) => {
        dispatch({type: 'Cart - Remove product in cart', payload: product});
    }

    const updateAddress = (address: ShippingAddress) => {
        Cookies.set('firstName', address.firstName);
        Cookies.set('lastName', address.lastName);
        Cookies.set('address', address.address);
        Cookies.set('address2', address.address2 || '');
        Cookies.set('zip', address.zip);
        Cookies.set('district', address.district);
        Cookies.set('canton', address.canton);
        Cookies.set('province', address.province);
        Cookies.set('country', address.country);
        Cookies.set('phone', address.phone);
        dispatch({type: 'Cart - Update Address', payload: address})
    }

    const createOrder = async (): Promise<{hasError: boolean; message: string;}> => {

        if(!state.shippingAddress){
            throw new Error('No hay dirección');
        }

        const body: IOrder = {
            orderItems: state.cart.map(p => ({
                ...p,
            })),
            shippingAddress: state.shippingAddress,
            numberOfItems: state.numberOfItems,
            subTotal: state.subTotal,
            tax: state.tax,
            deliveryType: state.needsShipping ? 'envio' : 'retiro',
            shippingFee: state.shippingFee,
            total: state.total,
            state: 'pendiente',
        }

        try {
            const {data} = await mainApi.post<IOrder>('/orders', body);

            dispatch({type: 'Cart - Order complete'});
            
            return {
                hasError: false,
                message: data._id!
            }
            

        } catch (error) {
            if(axios.isAxiosError(error)){
                const {message} = error.response?.data as {message : string}
                return {
                    hasError: true,
                    message,
                }
            }

            return {
                hasError: true,
                message: 'Error no controlado, hable con el administrador'
            }
        }
    }

   return (
       <CartContext.Provider value={{
           ...state,
           updateShippingFee,
           addProductToCart,
           updateCartQuantity,
           removeCartProduct,
           updateAddress,
           createOrder
       }}>
           {children}
       </CartContext.Provider>
   )
}