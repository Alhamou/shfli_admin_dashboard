import { CountriesInfo, ICreatMainItem, IResultAndPagination } from '@/interfaces';
import { get, post, put } from '../controllers/requestController';

export function insertItem(payload: object): Promise<object> {
  return post('/items', payload);
}

export function getCuntriesData() {
  return get<CountriesInfo[]>('/users/countries_data');
}

export function getAllItems(queries: string){
  return get<IResultAndPagination>(`/items?${queries}`)
}

export function getItem(uuid: string){
  return get<ICreatMainItem[]>(`/items/details?uuid=${uuid}`);
}

export function updateItem(uuid: string, status_note : string, is_active : string){
  return put<ICreatMainItem>(`/items/${uuid}`, {
    ...(is_active === "active" ? {} : { status_note }),
    is_active,
  });
}

export function getReasons(){
  return get<{items : string[],jobs : string[]}>(`/team/get_reasons`)
}