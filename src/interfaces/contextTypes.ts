import { Dispatch, SetStateAction } from 'react';
import {
  IUser,
} from './api';
import {countryCode} from './components/login';

export interface ContextType {
  countryCode: countryCode;
  setCountryCode: Dispatch<SetStateAction<countryCode>>;
  countriesDialCodes : countryCode[]
    dispatch: React.Dispatch<any>;
}
export const contextChildren = {} as ContextType;

export interface State {
  userData: IUser;
}

export type Action =
  | {type: 'GET_USER_DATA'; dataForUser: IUser}
