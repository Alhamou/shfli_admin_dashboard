import React, {
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import {createContext} from 'react';
import {ReactNode} from 'react';
import {initialValues, mainReducer} from './Reducer';
import {
  Action,
  contextChildren,
  ContextType,
  State,
} from '../interfaces/contextTypes';
import {countryCode} from '../interfaces';
import storageController from '../controllers/storageController';
import {
  getCuntriesData,
} from '../services/restApiServices';

export const COUNTRIES: countryCode[] = [
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: "🇮🇶" },
  { code: "SY", name: "Syria", dialCode: "+963", flag: "🇸🇾" },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴" },
  { code: "LB", name: "Lebanon", dialCode: "+961", flag: "🇱🇧" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
];
const context = createContext<ContextType>(contextChildren);

const Provider: React.FC<{children: ReactNode}> = ({children}) => {
  const [, dispatch] = useReducer<
    (state: State | undefined, action: Action) => State
  >(mainReducer, initialValues);
  const [countryCode, setCountryCode] = useState<countryCode>({
    name: 'Syria',
    code: 'SY',
    dialCode: '+963',
    flag: '🇸🇾',
  });
  const [countriesDialCodes,setcountriesDialCodes] = useState<countryCode[]>([]);

  const userToken = storageController.has('token');

  useEffect(() => {
    // getCuntriesData().then(res => {
      // setcountriesDialCodes(res);
    // });
    setcountriesDialCodes(COUNTRIES)
  }, [userToken]);

  return (
    <context.Provider
      value={{
        countryCode,
        setCountryCode,
        countriesDialCodes,
        dispatch,
      }}>
      {children}
    </context.Provider>
  );
};

export default React.memo(Provider);
export const useProvider = () => {
  return useContext(context);
};
