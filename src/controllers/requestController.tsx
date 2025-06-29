import { doSignature } from "@/lib/helpFunctions";
import storageController from "./storageController";
import { io, Socket } from "socket.io-client";

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface CustomHeaders {
  [key: string]: string;
}

const apiUrl: string = 'https://team.shfli.com/api/v1';
export async function get<T>(endpoint: string): Promise<T> {
  return doRequest<T>('GET', endpoint);
}

export async function formData(
  endpoint: string,
  FormData: FormData,
  customHeaders?: CustomHeaders,
): Promise<any> {
  return doRequestFormData('POST', endpoint, FormData, customHeaders);
}

export async function post<T>(
  endpoint: string,
  body: any,
  customHeaders?: CustomHeaders,
): Promise<T> {
  return doRequest<T>('POST', endpoint, body, customHeaders);
}

export async function put<T>(
  endpoint: string,
  body: any,
  customHeaders?: CustomHeaders,
): Promise<T> {
  return doRequest<T>('PUT', endpoint, body, customHeaders);
}

export async function Delete<T>(endpoint: string, body: any): Promise<T> {
  return doRequest<T>('DELETE', endpoint, body);
}

export async function doRequestFormData(
  method: RequestMethod,
  endpoint: string,
  body: FormData,
  customHeaders?: CustomHeaders,
): Promise<any> {

  try{

    const res = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: await buildHeaders(customHeaders, true),
      body: body,
    });

    console.log(endpoint, res.status);
    await handleError(endpoint, res);
    const {data} = await res.json();
    return data;

  } catch (error) {
    throw error;
  }
}

export async function doRequest<T>(
  method: RequestMethod,
  endpoint: string,
  body?: object,
  customHeaders?: CustomHeaders,
): Promise<T> {
  try{
    const res = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: await buildHeaders(customHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(endpoint, res.status);

    if (res.status === 204) {return {} as T;}

    await handleError(endpoint, res);

    const {data} = await res.json();
    return data as T;
  } catch (error) {
    throw error;
  }
}

export async function buildHeaders(
  customHeaders?: CustomHeaders,
  isFormData: boolean = false,
): Promise<Record<string, string>> {
  const defaultHeaders: Record<string, string> = {
    Authorization: 'Bearer ' + storageController.get('token'),
    ...(isFormData ? {} : {'Content-Type': 'application/json'}),
    ...(doSignature()),
  };
  return {
    ...defaultHeaders,
    ...customHeaders,
  };
}

export async function handleError(
  endpoint: string,
  res: Response,
): Promise<void> {
  if (!res.ok) {
    const errorText = await res.text();

    // تسجيل الخطأ للمطور
    console.error(`[Fetch Error] ${endpoint} | Status: ${res.status} | Message: ${errorText}`);

    // TODO, Handel Error as Popup
    throw new Error(
      `HTTP error! status: ${res.status}, endpoint: ${endpoint}, message: ${errorText}`,
    );
  }
}

const token = storageController.get("token");

export const socket: Socket = io("wss://team.shfli.com", {
  transports: ["polling"],
  autoConnect: false,
  reconnectionAttempts: 5,
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
  reconnection: false,
});

// Utility function to connect with auth if needed
export const connectSocket = () => {
  if (!token) {
    console.error("No token exists in storage");
    return false;
  }

  // Close any existing connection
  if (socket.connected) socket.disconnect();

  socket.auth = { token };
  socket.connect();
};

// Utility function to disconnect
export const disconnectSocket = () => {
  socket.disconnect();
};