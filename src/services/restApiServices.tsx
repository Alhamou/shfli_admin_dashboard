import {
  CountriesInfo,
  ICreatMainItem,
  IMessageThread,
  IResultAndPagination,
  IResultAndPaginationMessages,
  IUser,
  NotificationBody,
  Stat,
} from "@/interfaces";
import { del, get, post, put } from "../controllers/requestController";

export function insertItem(payload: object): Promise<object> {
  return post("/items", payload);
}

export function getCuntriesData() {
  return get<CountriesInfo[]>("/users/countries_data");
}

export function getAllItems(queries: string) {
  console.log(queries);
  return get<IResultAndPagination>(`/items?${queries}`);
}

export function getItem(uuid: string) {
  return get<ICreatMainItem[]>(`/items/details?uuid=${uuid}`);
}

export function updateItem(
  uuid: string,
  body: ICreatMainItem | Partial<ICreatMainItem>
) {
  return put<ICreatMainItem>(`/items/${uuid}`, {
    ...(body.is_active === "active"
      ? { status_note: null }
      : { status_note: body.status_note }),
    ...body,
  });
}

export function getReasons() {
  return get<{ items: string[]; jobs: string[] }>(`/team/get_reasons`);
}

export function getUserInfo(uuid: string) {
  return get<IUser>(`/team/user?id=${encodeURIComponent(uuid)}`);
}

export function putUserInfo(body: Partial<IUser>) {
  return put<IUser>(`/team/user`, body);
}

export function sendNotAdmin(body: NotificationBody) {
  return post(`/admin/send_not`, body);
}

export function sendNotTeam(body: NotificationBody) {
  return post(`/team/send_not`, body);
}

export function getAllCommercialItems(queries: string) {
  return get<IResultAndPagination>(`/items/commercial?${queries}`);
}

export function getUserStats() {
  return get<Stat[]>(`/team/get_count_users`);
}

export function getJobStats() {
  return get<Stat[]>(`/team/get_count_jobs`);
}

export function getAdStats() {
  return get<Stat[]>(`/team/get_count_items`);
}

export function getSoldStats() {
  return get<Stat[]>(`/team/get_count_sold`);
}

export function getEligibleUsersCount() {
  return get<number>(`/team/get_count_eligible_users`);
}

export function getMessageStats() {
  return get<Stat[]>(`/team/get_count_messages`);
}

export function getVerifiedUsersCount() {
  return get<number>(`/team/get_count_verified_users`);
}

export function verifyEligibleUsers() {
  return post<{ id: number }[]>(`/team/verify_eligible_users`, {});
}

export function sendFirebase(body: { title: string; description: string }) {
  return post<void>(`/admin/send_firebase_all`, body);
}

export function postToFacebook(uuid: string) {
  return post<{ success: boolean; data: null; message: string | null }>(
    `/team/post_to_facebook`,
    { uuid }
  );
}

export function getAllMessages(page: number = 1, limit: number = 20) {
  return get<IResultAndPaginationMessages>(`/team/messages?page=${page}&limit=${limit}`);
}

export function getMessageContent(uuid: string) {
  return get<IMessageThread>(`/team/message_content?uuid=${uuid}`);
}

// All Data Management
import {
  ICategory, ISubcategory, ICategoryModel, ICarMaker, IMobileMaker, ICarType, IFuelType, IJobCategory, IJobSubcategory, IAllDataResult
} from "../interfaces/allDataInterfaces";

// Categories
export const getAllDataCategories = (page: number = 1, limit: number = 20) => get<IAllDataResult<ICategory[]>>(`/all_data/categories?page=${page}&limit=${limit}`);
export const createAllDataCategory = (name: object) => post<ICategory>("/all_data/categories", { name });
export const updateAllDataCategory = (id: number, name: object) => put<ICategory>(`/all_data/categories/${id}`, { name });
export const deleteAllDataCategory = (id: number) => del<void>(`/all_data/categories/${id}`);

// Subcategories
export const getAllDataSubcategories = (categoryId: number, page: number = 1, limit: number = 20) => get<IAllDataResult<ISubcategory[]>>(`/all_data/subcategories?category_id=${categoryId}&page=${page}&limit=${limit}`);
export const createAllDataSubcategory = (name: object, category_id: number) => post<ISubcategory>("/all_data/subcategories", { name, category_id });
export const updateAllDataSubcategory = (id: number, name: object, category_id: number) => put<ISubcategory>(`/all_data/subcategories/${id}`, { name, category_id });
export const deleteAllDataSubcategory = (id: number) => del<void>(`/all_data/subcategories/${id}`);

// Category Models
export const getAllDataCategoryModels = (subcategoryId: number, page: number = 1, limit: number = 20) => get<IAllDataResult<ICategoryModel[]>>(`/all_data/category_models?subcategory_id=${subcategoryId}&page=${page}&limit=${limit}`);
export const createAllDataCategoryModel = (payload: Partial<ICategoryModel>) => post<ICategoryModel>("/all_data/category_models", payload);
export const updateAllDataCategoryModel = (id: number, payload: Partial<ICategoryModel>) => put<ICategoryModel>(`/all_data/category_models/${id}`, payload);
export const deleteAllDataCategoryModel = (id: number) => del<void>(`/all_data/category_models/${id}`);

// Car Makers
export const getAllDataCarMakers = (page: number = 1, limit: number = 20) => get<IAllDataResult<ICarMaker[]>>(`/all_data/car_makers?page=${page}&limit=${limit}`);
export const createAllDataCarMaker = (payload: Partial<ICarMaker>) => post<ICarMaker>("/all_data/car_makers", payload);
export const updateAllDataCarMaker = (id: number, payload: Partial<ICarMaker>) => put<ICarMaker>(`/all_data/car_makers/${id}`, payload);
export const deleteAllDataCarMaker = (id: number) => del<void>(`/all_data/car_makers/${id}`);

// Mobile Makers
export const getAllDataMobileMakers = (page: number = 1, limit: number = 20) => get<IAllDataResult<IMobileMaker[]>>(`/all_data/mobile_makers?page=${page}&limit=${limit}`);
export const createAllDataMobileMaker = (payload: Partial<IMobileMaker>) => post<IMobileMaker>("/all_data/mobile_makers", payload);
export const updateAllDataMobileMaker = (id: number, payload: Partial<IMobileMaker>) => put<IMobileMaker>(`/all_data/mobile_makers/${id}`, payload);
export const deleteAllDataMobileMaker = (id: number) => del<void>(`/all_data/mobile_makers/${id}`);

// Car Types
export const getAllDataCarTypes = (page: number = 1, limit: number = 20) => get<IAllDataResult<ICarType[]>>(`/all_data/car_types?page=${page}&limit=${limit}`);
export const createAllDataCarType = (name: object) => post<ICarType>("/all_data/car_types", { name });
export const updateAllDataCarType = (id: number, name: object) => put<ICarType>(`/all_data/car_types/${id}`, { name });
export const deleteAllDataCarType = (id: number) => del<void>(`/all_data/car_types/${id}`);

// Fuel Types
export const getAllDataFuelTypes = (page: number = 1, limit: number = 20) => get<IAllDataResult<IFuelType[]>>(`/all_data/fuel_types?page=${page}&limit=${limit}`);
export const createAllDataFuelType = (name: object) => post<IFuelType>("/all_data/fuel_types", { name });
export const updateAllDataFuelType = (id: number, name: object) => put<IFuelType>(`/all_data/fuel_types/${id}`, { name });
export const deleteAllDataFuelType = (id: number) => del<void>(`/all_data/fuel_types/${id}`);

// Job Categories
export const getAllDataJobCategories = (page: number = 1, limit: number = 20) => get<IAllDataResult<IJobCategory[]>>(`/all_data/job_categories?page=${page}&limit=${limit}`);
export const createAllDataJobCategory = (name: object) => post<IJobCategory>("/all_data/job_categories", { name });
export const updateAllDataJobCategory = (id: number, name: object) => put<IJobCategory>(`/all_data/job_categories/${id}`, { name });
export const deleteAllDataJobCategory = (id: number) => del<void>(`/all_data/job_categories/${id}`);

// Job Subcategories
export const getAllDataJobSubcategories = (categoryId: number, page: number = 1, limit: number = 20) => get<IAllDataResult<IJobSubcategory[]>>(`/all_data/job_subcategories?category_id=${categoryId}&page=${page}&limit=${limit}`);
export const createAllDataJobSubcategory = (name: object, category_id: number) => post<IJobSubcategory>("/all_data/job_subcategories", { name, category_id });
export const updateAllDataJobSubcategory = (id: number, name: object, category_id: number) => put<IJobSubcategory>(`/all_data/job_subcategories/${id}`, { name, category_id });
export const deleteAllDataJobSubcategory = (id: number) => del<void>(`/all_data/job_subcategories/${id}`);

