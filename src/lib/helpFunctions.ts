import storageController from '@/controllers/storageController';
import CryptoJS from 'crypto-js';
import { jwtDecode } from 'jwt-decode';

export const doSignature = ()=>{
  const secret = 'shfli-project-marketplace-6-18';
  const timestamp = Date.now();
  const sha265 = CryptoJS.HmacSHA256(`${timestamp}`, secret).toString();
  return {
    'X-Signature': sha265,
    'X-Timestamp': timestamp.toString(),
  };
};

export function saveTokenInLocalStorage(userToken: string) {
  const pureToken = userToken.split(' ').pop()!;
  storageController.clear();
  storageController.set('token', pureToken);
  storageController.set('objectToken', jwtDecode(userToken));
}

export const cleanPhoneNumber = (phone: string): string => {
  if (phone.startsWith('0')) {
    return phone.slice(1);
  }
  return phone;
};