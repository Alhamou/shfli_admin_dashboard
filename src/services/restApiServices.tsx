import { CountriesInfo, IResultAndPagination } from '@/interfaces';
import { get, post } from '../controllers/requestController';

export function insertItem(payload: object): Promise<object> {
  return post('/items', payload);
}

export function getCuntriesData() {
  return get<CountriesInfo[]>('/users/countries_data');
}

export function getAllItems(queries: string){
  return get<IResultAndPagination>(`/items?${queries}`)
}