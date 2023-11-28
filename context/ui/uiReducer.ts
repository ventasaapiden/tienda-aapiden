import { UIState } from "./UIProvider";

type UIActionType = 
| { type: 'UI - Toggle Menu'}
| { type: 'UI - Change Selected Filter', payload: string};

export const uiReducer = (state: UIState, action: UIActionType): UIState => {

    switch (action.type) {
        case 'UI - Toggle Menu':
            return {
                ...state,
                isMenuOpen: !state.isMenuOpen,
            }
        case 'UI - Change Selected Filter':
            return {
                ...state,
                selectedFilter: action.payload,
            }

        default:
            return state;
    }

}