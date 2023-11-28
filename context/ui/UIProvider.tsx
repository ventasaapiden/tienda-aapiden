import { FC, PropsWithChildren, useReducer } from 'react';
import { UIContext } from './UIContext';
import { uiReducer } from './uiReducer';

export interface UIState {
    isMenuOpen: boolean;
    selectedFilter: string;
}

const UI_INITIAL_STATE: UIState = {
    isMenuOpen: false,
    selectedFilter: 'todos'
}

export const UIProvider: FC<PropsWithChildren> = ({children}) => {

    const [state, dispatch] = useReducer(uiReducer, UI_INITIAL_STATE);

    const toggleMenu = () => {
        dispatch({type: 'UI - Toggle Menu'});
    }

    const changeSelectedFilter = (value: string) => {
        dispatch({type: 'UI - Change Selected Filter', payload: value});
    }

   return (
       <UIContext.Provider value={{
           ...state,
           toggleMenu,
           changeSelectedFilter
       }}>
           {children}
       </UIContext.Provider>
   )
}