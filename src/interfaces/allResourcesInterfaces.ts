export interface ILocalizedString {
    ar: string;
    en: string;
}

export interface ICategory {
    id: number;
    name: ILocalizedString;
    deleted_at?: string;
}

export interface ISubcategory {
    id: number;
    name: ILocalizedString;
    category_id: number;
    deleted_at?: string;
}

export interface ICategoryModel {
    id: number;
    subcategory_id: number;
    name: ILocalizedString;
    country?: string;
    logo?: string;
    deleted_at?: string;
}

export interface ICarMaker {
    id: number;
    name: ILocalizedString;
    position?: number;
    year?: string;
    logo_url?: string;
    country?: string;
    flag_url?: string;
    series: any[];
    deleted_at?: string;
}

export interface IMobileMaker {
    id: number;
    model: string;
    brand: string;
    type: string;
    position?: number;
    year?: number;
    link?: string;
    image?: string;
    details: any;
    deleted_at?: string;
}

export interface ICarType {
    id: number;
    name: ILocalizedString;
    deleted_at?: string;
}

export interface IFuelType {
    id: number;
    name: ILocalizedString;
    deleted_at?: string;
}

export interface IJobCategory {
    id: number;
    name: ILocalizedString;
    deleted_at?: string;
}

export interface IJobSubcategory {
    id: number;
    name: ILocalizedString;
    category_jobs_id: number;
    deleted_at?: string;
}
export interface IPagination {
    total: number;
    current_page: number;
    total_pages: number;
    limit_page: number;
    has_more: boolean;
}

export interface IAllResourcesResult<T> {
    result: T;
    pagination: IPagination;
}
