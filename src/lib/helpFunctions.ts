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

export function toQueryString(parserObject: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.keys(parserObject).forEach(key => {
    const value = parserObject[key];

    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

export const updateItemInArray = <T extends { uuid: string }>(
  array: T[],
  updatedItem: T
): T[] => {
  return array.map(item => item.uuid === updatedItem.uuid ? updatedItem : item);
};

export async function playAudioWithWebAudio(url: string): Promise<void> {
    try {
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Fetch the audio file
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Create a source node
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Connect to destination (speakers)
        source.connect(audioContext.destination);
        
        // Start playing
        source.start(0);
        
        console.log('Audio is playing with Web Audio API');
    } catch (error) {
        console.error('Error with Web Audio API:', error);
    }
}

export const isUUIDv4 = (str : string) => {
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(str) || isNaN(parseInt(str));
}