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

// All Resources Management
import {
  ICategory, ISubcategory, ICategoryModel, ICarMaker, IMobileMaker, ICarType, IFuelType, IJobCategory, IJobSubcategory, IAllResourcesResult
} from "../interfaces/allResourcesInterfaces";

// Categories
export const getAllResourcesCategories = (page: number = 1, limit: number = 20) => get<IAllResourcesResult<ICategory[]>>(`/all_resources/categories?page=${page}&limit=${limit}`);
export const createAllResourcesCategory = (name: object) => post<ICategory>("/all_resources/categories", { name });
export const updateAllResourcesCategory = (id: number, name: object) => put<ICategory>(`/all_resources/categories/${id}`, { name });
export const deleteAllResourcesCategory = (id: number) => del<void>(`/all_resources/categories/${id}`);

// Subcategories
export const getAllResourcesSubcategories = (categoryId: number, page: number = 1, limit: number = 20) => get<IAllResourcesResult<ISubcategory[]>>(`/all_resources/subcategories?category_id=${categoryId}&page=${page}&limit=${limit}`);
export const createAllResourcesSubcategory = (name: object, category_id: number) => post<ISubcategory>("/all_resources/subcategories", { name, category_id });
export const updateAllResourcesSubcategory = (id: number, name: object, category_id: number) => put<ISubcategory>(`/all_resources/subcategories/${id}`, { name, category_id });
export const deleteAllResourcesSubcategory = (id: number) => del<void>(`/all_resources/subcategories/${id}`);

// Category Models
export const getAllResourcesCategoryModels = (subcategoryId: number, page: number = 1, limit: number = 20) => get<IAllResourcesResult<ICategoryModel[]>>(`/all_resources/category_models?subcategory_id=${subcategoryId}&page=${page}&limit=${limit}`);
export const createAllResourcesCategoryModel = (payload: Partial<ICategoryModel>) => post<ICategoryModel>("/all_resources/category_models", payload);
export const updateAllResourcesCategoryModel = (id: number, payload: Partial<ICategoryModel>) => put<ICategoryModel>(`/all_resources/category_models/${id}`, payload);
export const deleteAllResourcesCategoryModel = (id: number) => del<void>(`/all_resources/category_models/${id}`);

// Car Makers
export const getAllResourcesCarMakers = (page: number = 1, limit: number = 20) => get<IAllResourcesResult<ICarMaker[]>>(`/all_resources/car_makers?page=${page}&limit=${limit}`);
export const createAllResourcesCarMaker = (payload: Partial<ICarMaker>) => post<ICarMaker>("/all_resources/car_makers", payload);
export const updateAllResourcesCarMaker = (id: number, payload: Partial<ICarMaker>) => put<ICarMaker>(`/all_resources/car_makers/${id}`, payload);
export const deleteAllResourcesCarMaker = (id: number) => del<void>(`/all_resources/car_makers/${id}`);
export const updateCarMakerSeries = (id: number, series: any[]) => put<ICarMaker>(`/all_resources/car_makers/${id}/series`, { series });

// Mobile Makers
export const getAllResourcesMobileMakers = (page: number = 1, limit: number = 20) => get<IAllResourcesResult<IMobileMaker[]>>(`/all_resources/mobile_makers?page=${page}&limit=${limit}`);
export const createAllResourcesMobileMaker = (payload: Partial<IMobileMaker>) => post<IMobileMaker>("/all_resources/mobile_makers", payload);
export const updateAllResourcesMobileMaker = (id: number, payload: Partial<IMobileMaker>) => put<IMobileMaker>(`/all_resources/mobile_makers/${id}`, payload);
export const deleteAllResourcesMobileMaker = (id: number) => del<void>(`/all_resources/mobile_makers/${id}`);

// Car Types
export const getAllResourcesCarTypes = (page: number = 1, limit: number = 20) => get<IAllResourcesResult<ICarType[]>>(`/all_resources/car_types?page=${page}&limit=${limit}`);
export const createAllResourcesCarType = (name: object) => post<ICarType>("/all_resources/car_types", { name });
export const updateAllResourcesCarType = (id: number, name: object) => put<ICarType>(`/all_resources/car_types/${id}`, { name });
export const deleteAllResourcesCarType = (id: number) => del<void>(`/all_resources/car_types/${id}`);

// Fuel Types
export const getAllResourcesFuelTypes = (page: number = 1, limit: number = 20) => get<IAllResourcesResult<IFuelType[]>>(`/all_resources/fuel_types?page=${page}&limit=${limit}`);
export const createAllResourcesFuelType = (name: object) => post<IFuelType>("/all_resources/fuel_types", { name });
export const updateAllResourcesFuelType = (id: number, name: object) => put<IFuelType>(`/all_resources/fuel_types/${id}`, { name });
export const deleteAllResourcesFuelType = (id: number) => del<void>(`/all_resources/fuel_types/${id}`);

// Job Categories
export const getAllResourcesJobCategories = (page: number = 1, limit: number = 20) => get<IAllResourcesResult<IJobCategory[]>>(`/all_resources/job_categories?page=${page}&limit=${limit}`);
export const createAllResourcesJobCategory = (name: object) => post<IJobCategory>("/all_resources/job_categories", { name });
export const updateAllResourcesJobCategory = (id: number, name: object) => put<IJobCategory>(`/all_resources/job_categories/${id}`, { name });
export const deleteAllResourcesJobCategory = (id: number) => del<void>(`/all_resources/job_categories/${id}`);

// Job Subcategories
export const getAllResourcesJobSubcategories = (categoryId: number, page: number = 1, limit: number = 20) => get<IAllResourcesResult<IJobSubcategory[]>>(`/all_resources/job_subcategories?category_id=${categoryId}&page=${page}&limit=${limit}`);
export const createAllResourcesJobSubcategory = (name: object, category_id: number) => post<IJobSubcategory>("/all_resources/job_subcategories", { name, category_id });
export const updateAllResourcesJobSubcategory = (id: number, name: object, category_id: number) => put<IJobSubcategory>(`/all_resources/job_subcategories/${id}`, { name, category_id });
export const deleteAllResourcesJobSubcategory = (id: number) => del<void>(`/all_resources/job_subcategories/${id}`);

