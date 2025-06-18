import {get, post, put} from '../controllers/requestController';
import {
  IEditedUserData,
  ILogin,
  IRequestResetPassword,
  ISendOTP,
  ISignup,
  IUser,
  IVerifyOtp,
} from '../interfaces';


export function signup(payload: ISignup) {
    return post<IUser>('/auth/signup', payload);
  }

  export function signupAsGuest() {
    return post<IUser>('/auth/signup_guest', {});
  }

  export function verifyOtp(payload: IVerifyOtp) {
    return post<IUser>('/auth/verify_otp', payload);
  }

  export function sendOtp(payload: ISendOTP) {
    return post<string>('/auth/send_otp', payload);
  }

 export function signin(payload: ILogin) {
    return post<IUser>('/auth/login', payload);
  }

  export function requestPasswordReset(payload: IRequestResetPassword) {
    return put<IUser>('/auth/request_password_reset', payload);
  }

  // User Endpoints.
  export function getUserInfo() {
    return get<IUser>('/users');
  }

  export function putUserData(body: IEditedUserData) {
    return put<IUser>('/users', body);
  }
