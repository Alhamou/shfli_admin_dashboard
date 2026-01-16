import {
    CountriesInfo,
    ICreatMainItem,
    IMessageThread,
    IResultAndPagination,
    IUser,
    NotificationBody,
    Stat,
} from "@/interfaces";
import { get, post, put } from "../controllers/requestController";

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

export function getChatLogs(uuid: string) {
  return get<IMessageThread>(`/team/messages?uuid=${uuid}`);
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
