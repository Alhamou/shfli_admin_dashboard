import storageController from '@/controllers/storageController';
import CryptoJS from 'crypto-js';
import i18next, { t } from 'i18next';
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
    // First check if we're in Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    try {
        // Create audio context (with Safari prefix fallback)
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Safari requires resuming the audio context on user interaction
        if (isSafari && audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
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
        
        // Fallback to HTML5 Audio if Web Audio fails
        try {
            const audio = new Audio(url);
            audio.play().catch(e => console.error('HTML5 Audio fallback failed:', e));
        } catch (fallbackError) {
            console.error('Both Web Audio and HTML5 Audio failed:', fallbackError);
        }
    }
}

export const isUUIDv4 = (str : string) => {
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(str);
}

export function getPriceDiscount(price: number, discount: number) {
  return Math.round(price * (1 - discount / 100));
}

function checkIfPriceEmpty(price: number | undefined) {
  let formatted;
  switch (price) {
    case null:
    case undefined:
    case 0:
      return t('addAd.$51');
    default:
      formatted = price.toLocaleString('en-US');

      return formatted;
  }
}


export function formatPrice(price: number | undefined, currency: string) {
  let cu = setCurrencyFormat(currency);
  let pr = checkIfPriceEmpty(price);

  if (!price || !currency) {
    if (currency === 'FREE') {
      pr = '';
    } else {
      cu = '';
    }
  }

  return `${pr} ${cu}`;
}

export function setCurrencyFormat(currency: string, isLabel: boolean = false) {
  let formatted: string;
  const lang = i18next.language;

  switch (currency) {
    case 'SY':
      formatted =
        lang === 'ar'
          ? isLabel
            ? 'ليرة سورية'
            : 'ليرة'
          : isLabel
          ? 'Syrian Pound'
          : 'SY';
      break;
    case 'USD':
      formatted = lang === 'ar' ? 'دولار' : 'USD';
      break;
    case 'TRY':
      formatted = lang === 'ar' ? 'تركي' : 'TRY';
      break;
    case 'FREE':
      formatted = t('addAd.gift');
      break;
    case null:
    case 'null':
      formatted = '';
      break;
    default:
      formatted = currency;
  }

  return formatted;
}