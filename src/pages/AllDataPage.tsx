import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, ChevronRight, ChevronDown, ImageIcon, Globe } from "lucide-react";
import * as api from "@/services/restApiServices";
import { ICategory, ISubcategory, ICategoryModel, ICarMaker, IMobileMaker, ICarType, IFuelType, IJobCategory, IJobSubcategory, IPagination } from "@/interfaces/allDataInterfaces";

export default function AllDataPage() {
    const [activeTab, setActiveTab] = useState("categories");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Data states
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [subcategories, setSubcategories] = useState<ISubcategory[]>([]);
    const [categoryModels, setCategoryModels] = useState<ICategoryModel[]>([]);
    const [carMakers, setCarMakers] = useState<ICarMaker[]>([]);
    const [mobileMakers, setMobileMakers] = useState<IMobileMaker[]>([]);
    const [carTypes, setCarTypes] = useState<ICarType[]>([]);
    const [fuelTypes, setFuelTypes] = useState<IFuelType[]>([]);
    const [jobCategories, setJobCategories] = useState<IJobCategory[]>([]);
    const [jobSubcategories, setJobSubcategories] = useState<IJobSubcategory[]>([]);

    // Pagination states
    const [pagination, setPagination] = useState<Record<string, IPagination | null>>({
        categories: null,
        subcategories: null,
        models: null,
        car_makers: null,
        mobile_makers: null,
        car_types: null,
        fuel_types: null,
        job_categories: null,
        job_subcategories: null
    });

    const [pages, setPages] = useState<Record<string, number>>({
        categories: 1,
        car_makers: 1,
        mobile_makers: 1,
        car_types: 1,
        fuel_types: 1,
        job_categories: 1
    });

    // Selection states for hierarchy
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
    const [selectedJobCategory, setSelectedJobCategory] = useState<number | null>(null);

    useEffect(() => {
        fetchMainData();
    }, [activeTab, pages]);

    const fetchMainData = async () => {
        setLoading(true);
        try {
            if (activeTab === "categories") {
                const res = await api.getAllDataCategories(pages.categories);
                setCategories(res.result);
                setPagination(prev => ({ ...prev, categories: res.pagination }));
            } else if (activeTab === "cars") {
                const [makersRes, typesRes, fuelsRes] = await Promise.all([
                    api.getAllDataCarMakers(pages.car_makers),
                    api.getAllDataCarTypes(pages.car_types),
                    api.getAllDataFuelTypes(pages.fuel_types)
                ]);
                setCarMakers(makersRes.result);
                setCarTypes(typesRes.result);
                setFuelTypes(fuelsRes.result);
                setPagination(prev => ({
                    ...prev,
                    car_makers: makersRes.pagination,
                    car_types: typesRes.pagination,
                    fuel_types: fuelsRes.pagination
                }));
            } else if (activeTab === "mobiles") {
                const res = await api.getAllDataMobileMakers(pages.mobile_makers);
                setMobileMakers(res.result);
                setPagination(prev => ({ ...prev, mobile_makers: res.pagination }));
            } else if (activeTab === "jobs") {
                const res = await api.getAllDataJobCategories(pages.job_categories);
                setJobCategories(res.result);
                setPagination(prev => ({ ...prev, job_categories: res.pagination }));
            }
        } catch (error) {
            toast.error("فشل تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubcategories = async (categoryId: number, page: number = 1) => {
        try {
            const res = await api.getAllDataSubcategories(categoryId, page);
            setSubcategories(res.result);
            setPagination(prev => ({ ...prev, subcategories: res.pagination }));
            setSelectedCategory(categoryId);
            setSelectedSubcategory(null);
            setCategoryModels([]);
        } catch (error) {
            toast.error("فشل تحميل الفئات الفرعية");
        }
    };

    const fetchModels = async (subcategoryId: number, page: number = 1) => {
        try {
            const res = await api.getAllDataCategoryModels(subcategoryId, page);
            setCategoryModels(res.result);
            setPagination(prev => ({ ...prev, models: res.pagination }));
            setSelectedSubcategory(subcategoryId);
        } catch (error) {
            toast.error("فشل تحميل الموديلات");
        }
    };

    const fetchJobSubcategories = async (categoryId: number, page: number = 1) => {
        try {
            const res = await api.getAllDataJobSubcategories(categoryId, page);
            setJobSubcategories(res.result);
            setPagination(prev => ({ ...prev, job_subcategories: res.pagination }));
            setSelectedJobCategory(categoryId);
        } catch (error) {
            toast.error("فشل تحميل الفئات الفرعية للوظائف");
        }
    };

    // Render helpers
    const renderBilingualName = (name: any) => {
        if (!name) return "";
        return `${name.ar} / ${name.en}`;
    };

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-indigo-900 tracking-tight">إدارة البيانات</h1>
                <p className="text-slate-500 font-medium">إدارة التصنيفات، الموديلات، الشركات المصنعة، والبيانات العامة للنظام.</p>
            </div>

            <Tabs defaultValue="categories" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 h-14 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    <TabsTrigger value="categories" className="rounded-xl font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all">التصنيفات</TabsTrigger>
                    <TabsTrigger value="cars" className="rounded-xl font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all">السيارات</TabsTrigger>
                    <TabsTrigger value="mobiles" className="rounded-xl font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all">الموبايلات</TabsTrigger>
                    <TabsTrigger value="jobs" className="rounded-xl font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all">الوظائف</TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="categories" className="m-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Categories */}
                            <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden group">
                                <CardHeader className="bg-slate-50 border-b border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-black text-slate-800">التصنيفات الرئيسية</CardTitle>
                                        <AddDialog type="category" onRefresh={fetchMainData} />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() => fetchSubcategories(cat.id)}
                                                className={`p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50 ${selectedCategory === cat.id ? "bg-indigo-50/50 border-r-4 border-indigo-600" : ""}`}
                                            >
                                                <span className="font-bold text-slate-700">{renderBilingualName(cat.name)}</span>
                                                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <EditDialog type="category" data={cat} onRefresh={fetchMainData} />
                                                    <DeleteDialog type="category" id={cat.id} onRefresh={fetchMainData} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <PaginationControls
                                        pagination={pagination.categories}
                                        onPageChange={(p) => setPages({ ...pages, categories: p })}
                                    />
                                </CardContent>
                            </Card>

                            {/* Subcategories */}
                            <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-black text-slate-800">التصنيفات الفرعية</CardTitle>
                                        {selectedCategory && <AddDialog type="subcategory" parentId={selectedCategory} onRefresh={() => fetchSubcategories(selectedCategory)} />}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {!selectedCategory ? (
                                        <div className="p-8 text-center text-slate-400 italic">اختر تصنيفاً لرؤية الفئات الفرعية</div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                                                {subcategories.map((sub) => (
                                                    <div
                                                        key={sub.id}
                                                        onClick={() => fetchModels(sub.id)}
                                                        className={`p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50 ${selectedSubcategory === sub.id ? "bg-indigo-50/50 border-r-4 border-indigo-600" : ""}`}
                                                    >
                                                        <span className="font-bold text-slate-700">{renderBilingualName(sub.name)}</span>
                                                        <div className="flex gap-1">
                                                            <EditDialog type="subcategory" data={sub} onRefresh={() => fetchSubcategories(selectedCategory)} />
                                                            <DeleteDialog type="subcategory" id={sub.id} onRefresh={() => fetchSubcategories(selectedCategory)} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <PaginationControls
                                                pagination={pagination.subcategories}
                                                onPageChange={(p) => fetchSubcategories(selectedCategory, p)}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Models */}
                            <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-black text-slate-800">الموديلات</CardTitle>
                                        {selectedSubcategory && <AddDialog type="model" parentId={selectedSubcategory} onRefresh={() => fetchModels(selectedSubcategory)} />}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {!selectedSubcategory ? (
                                        <div className="p-8 text-center text-slate-400 italic">اختر فئة فرعية لرؤية الموديلات</div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                                                {categoryModels.map((model) => (
                                                    <div key={model.id} className="p-4 flex justify-between items-center transition-all hover:bg-slate-50">
                                                        <div className="flex items-center gap-3">
                                                            {model.logo && <img src={model.logo} className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-100" />}
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-700">{renderBilingualName(model.name)}</span>
                                                                {model.country && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{model.country}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <EditDialog type="model" data={model} onRefresh={() => fetchModels(selectedSubcategory)} />
                                                            <DeleteDialog type="model" id={model.id} onRefresh={() => fetchModels(selectedSubcategory)} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <PaginationControls
                                                pagination={pagination.models}
                                                onPageChange={(p) => fetchModels(selectedSubcategory, p)}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="cars" className="m-0 focus-visible:outline-none">
                        <div className="space-y-8">
                            <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black text-slate-800">ماركات السيارات</CardTitle>
                                        <CardDescription>إدارة مصنعي السيارات والسلاسل التابعة لهم</CardDescription>
                                    </div>
                                    <AddDialog type="car_maker" onRefresh={fetchMainData} />
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow>
                                                <TableHead className="font-black text-slate-500 w-[250px]">الماركة</TableHead>
                                                <TableHead className="font-black text-slate-500">الدولة</TableHead>
                                                <TableHead className="font-black text-slate-500">السلاسل</TableHead>
                                                <TableHead className="font-black text-slate-500 text-left">العمليات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {carMakers.map((maker) => (
                                                <TableRow key={maker.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {maker.logo_url && <img src={maker.logo_url} className="w-10 h-10 rounded-xl bg-white border border-slate-100 object-contain shadow-sm" />}
                                                            <span className="font-bold text-slate-700">{renderBilingualName(maker.name)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {maker.flag_url && <img src={maker.flag_url} className="w-6 h-4 rounded shadow-sm" />}
                                                            <span className="text-sm font-medium text-slate-600">{maker.country}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">
                                                            {maker.series?.length || 0} موديل
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-left">
                                                        <div className="flex gap-2 justify-end">
                                                            <EditDialog type="car_maker" data={maker} onRefresh={fetchMainData} />
                                                            <DeleteDialog type="car_maker" id={maker.id} onRefresh={fetchMainData} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <PaginationControls
                                        pagination={pagination.car_makers}
                                        onPageChange={(p) => setPages({ ...pages, car_makers: p })}
                                    />
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
                                    <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg font-black text-slate-800">أنواع المركبات</CardTitle>
                                        <AddDialog type="car_type" onRefresh={fetchMainData} />
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableBody>
                                                {carTypes.map((type) => (
                                                    <TableRow key={type.id}>
                                                        <TableCell className="font-bold text-slate-700">{renderBilingualName(type.name)}</TableCell>
                                                        <TableCell className="text-left">
                                                            <div className="flex gap-2 justify-end">
                                                                <EditDialog type="car_type" data={type} onRefresh={fetchMainData} />
                                                                <DeleteDialog type="car_type" id={type.id} onRefresh={fetchMainData} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <PaginationControls
                                            pagination={pagination.car_types}
                                            onPageChange={(p) => setPages({ ...pages, car_types: p })}
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
                                    <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg font-black text-slate-800">أنواع الوقود</CardTitle>
                                        <AddDialog type="fuel_type" onRefresh={fetchMainData} />
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableBody>
                                                {fuelTypes.map((type) => (
                                                    <TableRow key={type.id}>
                                                        <TableCell className="font-bold text-slate-700">{renderBilingualName(type.name)}</TableCell>
                                                        <TableCell className="text-left">
                                                            <div className="flex gap-2 justify-end">
                                                                <EditDialog type="fuel_type" data={type} onRefresh={fetchMainData} />
                                                                <DeleteDialog type="fuel_type" id={type.id} onRefresh={fetchMainData} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <PaginationControls
                                            pagination={pagination.fuel_types}
                                            onPageChange={(p) => setPages({ ...pages, fuel_types: p })}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="mobiles" className="m-0 focus-visible:outline-none">
                        <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black text-slate-800">إدارة الأجهزة المحمولة</CardTitle>
                                    <CardDescription>قائمة بجميع الماركات والموديلات المتاحة</CardDescription>
                                </div>
                                <AddDialog type="mobile_maker" onRefresh={fetchMainData} />
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-black text-slate-500">الموديل</TableHead>
                                            <TableHead className="font-black text-slate-500">الماركة</TableHead>
                                            <TableHead className="font-black text-slate-500">النوع</TableHead>
                                            <TableHead className="font-black text-slate-500">السنة</TableHead>
                                            <TableHead className="font-black text-slate-500 text-left">العمليات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mobileMakers.map((mm) => (
                                            <TableRow key={mm.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {mm.image && <img src={mm.image} className="w-10 h-10 rounded-xl bg-white border border-slate-100 object-contain shadow-sm" />}
                                                        <span className="font-bold text-slate-700">{mm.model}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-indigo-600">{mm.brand}</TableCell>
                                                <TableCell>
                                                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-bold uppercase">{mm.type}</span>
                                                </TableCell>
                                                <TableCell className="text-slate-500 font-medium">{mm.year || "N/A"}</TableCell>
                                                <TableCell className="text-left">
                                                    <div className="flex gap-2 justify-end">
                                                        <EditDialog type="mobile_maker" data={mm} onRefresh={fetchMainData} />
                                                        <DeleteDialog type="mobile_maker" id={mm.id} onRefresh={fetchMainData} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <PaginationControls
                                    pagination={pagination.mobile_makers}
                                    onPageChange={(p) => setPages({ ...pages, mobile_makers: p })}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="jobs" className="m-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xl font-black text-slate-800">تصنيفات الوظائف</CardTitle>
                                    <AddDialog type="job_category" onRefresh={fetchMainData} />
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                                        {jobCategories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() => fetchJobSubcategories(cat.id)}
                                                className={`p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50 ${selectedJobCategory === cat.id ? "bg-indigo-50/50 border-r-4 border-indigo-600" : ""}`}
                                            >
                                                <span className="font-bold text-slate-700">{renderBilingualName(cat.name)}</span>
                                                <div className="flex gap-1">
                                                    <EditDialog type="job_category" data={cat} onRefresh={fetchMainData} />
                                                    <DeleteDialog type="job_category" id={cat.id} onRefresh={fetchMainData} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <PaginationControls
                                        pagination={pagination.job_categories}
                                        onPageChange={(p) => setPages({ ...pages, job_categories: p })}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xl font-black text-slate-800">التصنيفات الفرعية للوظائف</CardTitle>
                                    {selectedJobCategory && <AddDialog type="job_subcategory" parentId={selectedJobCategory} onRefresh={() => fetchJobSubcategories(selectedJobCategory)} />}
                                </CardHeader>
                                <CardContent className="p-0">
                                    {!selectedJobCategory ? (
                                        <div className="p-8 text-center text-slate-400 italic">اختر تصنيف عمل لرؤية الفئات الفرعية</div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                                                {jobSubcategories.map((sub) => (
                                                    <div key={sub.id} className="p-4 flex justify-between items-center transition-all hover:bg-slate-50">
                                                        <span className="font-bold text-slate-700">{renderBilingualName(sub.name)}</span>
                                                        <div className="flex gap-1">
                                                            <EditDialog type="job_subcategory" data={sub} onRefresh={() => fetchJobSubcategories(selectedJobCategory)} />
                                                            <DeleteDialog type="job_subcategory" id={sub.id} onRefresh={() => fetchJobSubcategories(selectedJobCategory)} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <PaginationControls
                                                pagination={pagination.job_subcategories}
                                                onPageChange={(p) => fetchJobSubcategories(selectedJobCategory, p)}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
        </div>
    );
}

function PaginationControls({ pagination, onPageChange }: { pagination: IPagination | null | undefined, onPageChange: (page: number) => void }) {
    if (!pagination || pagination.total_pages <= 1) return null;

    return (
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.current_page <= 1}
                    onClick={() => onPageChange(pagination.current_page - 1)}
                    className="rounded-lg font-bold text-slate-600 h-8 hover:bg-white hover:shadow-sm"
                >
                    السابق
                </Button>
                <div className="flex items-center gap-1">
                    {[...Array(pagination.total_pages)].map((_, i) => (
                        <Button
                            key={i}
                            variant={pagination.current_page === i + 1 ? "default" : "ghost"}
                            size="icon"
                            className={`h-8 w-8 rounded-lg font-bold text-xs transition-all ${pagination.current_page === i + 1
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                : "text-slate-400 hover:bg-white hover:text-indigo-600"
                                }`}
                            onClick={() => onPageChange(i + 1)}
                        >
                            {i + 1}
                        </Button>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={!pagination.has_more}
                    onClick={() => onPageChange(pagination.current_page + 1)}
                    className="rounded-lg font-bold text-slate-600 h-8 hover:bg-white hover:shadow-sm"
                >
                    التالي
                </Button>
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                إجمالي: {pagination.total}
            </span>
        </div>
    );
}


// Dialog Components (Placeholders for now, will implement logic in next turns)
function AddDialog({ type, parentId, onRefresh }: { type: string, parentId?: number, onRefresh: () => void }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const handleSubmit = async () => {
        try {
            if (type === "category") await api.createAllDataCategory(formData.name);
            else if (type === "subcategory") await api.createAllDataSubcategory(formData.name, parentId!);
            else if (type === "model") await api.createAllDataCategoryModel({ ...formData, subcategory_id: parentId! });
            else if (type === "car_maker") await api.createAllDataCarMaker(formData);
            else if (type === "mobile_maker") await api.createAllDataMobileMaker(formData);
            else if (type === "car_type") await api.createAllDataCarType(formData.name);
            else if (type === "fuel_type") await api.createAllDataFuelType(formData.name);
            else if (type === "job_category") await api.createAllDataJobCategory(formData.name);
            else if (type === "job_subcategory") await api.createAllDataJobSubcategory(formData.name, parentId!);

            toast.success("تمت الإضافة بنجاح");
            setOpen(false);
            onRefresh();
        } catch (error) {
            toast.error("فشل في الإضافة");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-90 transition-all">
                    <Plus className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-slate-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800">إضافة عنصر جديد</DialogTitle>
                    <DialogDescription className="font-medium text-slate-400">أدخل المعلومات المطلوبة أدناه.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {(["category", "subcategory", "car_type", "fuel_type", "job_category", "job_subcategory", "model"].includes(type)) && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الاسم (بالعربية)</Label>
                                <Input className="rounded-xl border-slate-200" onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ar: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الاسم (بالإنكليزية)</Label>
                                <Input className="rounded-xl border-slate-200" onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} />
                            </div>
                        </div>
                    )}
                    {type === "model" && (
                        <>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الدولة</Label>
                                <Input className="rounded-xl border-slate-200" onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">رابط الشعار</Label>
                                <Input className="rounded-xl border-slate-200" placeholder="https://..." onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />
                            </div>
                        </>
                    )}
                    {type === "car_maker" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700">الاسم (عربي / إنكليزي)</Label>
                                <div className="flex gap-2">
                                    <Input className="rounded-xl border-slate-200" placeholder="عربي" onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ar: e.target.value } })} />
                                    <Input className="rounded-xl border-slate-200" placeholder="EN" onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الدولة</Label>
                                <Input className="rounded-xl border-slate-200" onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">السنة</Label>
                                <Input className="rounded-xl border-slate-200" type="text" onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700">رابط الشعار</Label>
                                <Input className="rounded-xl border-slate-200" onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
                            </div>
                        </div>
                    )}
                    {type === "mobile_maker" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الموديل</Label>
                                <Input className="rounded-xl border-slate-200" onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الماركة</Label>
                                <Input className="rounded-xl border-slate-200" onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">النوع</Label>
                                <Input className="rounded-xl border-slate-200" placeholder="phone/tablet" onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">السنة</Label>
                                <Input className="rounded-xl border-slate-200" type="number" onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700">رابط الصورة</Label>
                                <Input className="rounded-xl border-slate-200" onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">إلغاء</Button>
                    <Button onClick={handleSubmit} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold px-8">حفظ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditDialog({ type, data, onRefresh }: { type: string, data: any, onRefresh: () => void }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<any>(data);

    useEffect(() => {
        setFormData(data);
    }, [data, open]);

    const handleSubmit = async () => {
        try {
            if (type === "category") await api.updateAllDataCategory(data.id, formData.name);
            else if (type === "subcategory") await api.updateAllDataSubcategory(data.id, formData.name, formData.category_id);
            else if (type === "model") await api.updateAllDataCategoryModel(data.id, formData);
            else if (type === "car_maker") await api.updateAllDataCarMaker(data.id, formData);
            else if (type === "mobile_maker") await api.updateAllDataMobileMaker(data.id, formData);
            else if (type === "car_type") await api.updateAllDataCarType(data.id, formData.name);
            else if (type === "fuel_type") await api.updateAllDataFuelType(data.id, formData.name);
            else if (type === "job_category") await api.updateAllDataJobCategory(data.id, formData.name);
            else if (type === "job_subcategory") await api.updateAllDataJobSubcategory(data.id, formData.name, formData.category_jobs_id);

            toast.success("تم التعديل بنجاح");
            setOpen(false);
            onRefresh();
        } catch (error) {
            toast.error("فشل في التعديل");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Edit className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-slate-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800">تعديل العنصر</DialogTitle>
                    <DialogDescription className="font-medium text-slate-400">قم بإجراء التغييرات اللازمة واضغط حفظ.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {formData.name && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الاسم (بالعربية)</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.name.ar} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ar: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الاسم (بالإنكليزية)</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.name.en} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} />
                            </div>
                        </div>
                    )}
                    {type === "model" && (
                        <>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الدولة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">رابط الشعار</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />
                            </div>
                        </>
                    )}
                    {type === "car_maker" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الدولة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">السنة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700">رابط الشعار</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
                            </div>
                        </div>
                    )}
                    {type === "mobile_maker" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الموديل</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">الماركة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">النوع</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">السنة</Label>
                                <Input className="rounded-xl border-slate-200" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700">رابط الصورة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">إلغاء</Button>
                    <Button onClick={handleSubmit} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold px-8">حفظ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteDialog({ type, id, onRefresh }: { type: string, id: number, onRefresh: () => void }) {
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        try {
            if (type === "category") await api.deleteAllDataCategory(id);
            else if (type === "subcategory") await api.deleteAllDataSubcategory(id);
            else if (type === "model") await api.deleteAllDataCategoryModel(id);
            else if (type === "car_maker") await api.deleteAllDataCarMaker(id);
            else if (type === "mobile_maker") await api.deleteAllDataMobileMaker(id);
            else if (type === "car_type") await api.deleteAllDataCarType(id);
            else if (type === "fuel_type") await api.deleteAllDataFuelType(id);
            else if (type === "job_category") await api.deleteAllDataJobCategory(id);
            else if (type === "job_subcategory") await api.deleteAllDataJobSubcategory(id);

            toast.success("تم الحذف بنجاح");
            setOpen(false);
            onRefresh();
        } catch (error) {
            toast.error("فشل في الحذف");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-slate-800">تأكيد الحذف</DialogTitle>
                    <DialogDescription className="font-medium text-slate-500">هل أنت متأكد من رغبتك في حذف هذا العنصر؟ سيتم تنفيذ حذف ناعم (Soft Delete).</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold flex-1">إلغاء</Button>
                    <Button variant="destructive" onClick={handleDelete} className="rounded-xl bg-red-600 hover:bg-red-700 font-bold flex-1">حذف نهائي</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
