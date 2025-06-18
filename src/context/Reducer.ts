import {IUser} from '../interfaces';
import {Action, State} from '../interfaces/contextTypes';

const initialValues: State = {
  userData: {} as IUser,
};
const mainReducer = (state: State = initialValues, action: Action): State => {
  switch (action.type) {
    case 'GET_USER_DATA':
      return {
        ...state,
        userData: action.dataForUser,
      };

      default:
      return state;
  }
};
export {mainReducer, initialValues};
