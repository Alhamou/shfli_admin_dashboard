import { useState, useEffect, Fragment } from "react";
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
import { ICategory, ISubcategory, ICategoryModel, ICarMaker, IMobileMaker, ICarType, IFuelType, IJobCategory, IJobSubcategory, IPagination, ILocalizedString } from "@/interfaces/allResourcesInterfaces";

export default function AllResourcesPage() {
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
                const res = await api.getAllResourcesCategories(pages.categories);
                setCategories(res.result);
                setPagination(prev => ({ ...prev, categories: res.pagination }));
            } else if (activeTab === "cars") {
                const [makersRes, typesRes, fuelsRes] = await Promise.all([
                    api.getAllResourcesCarMakers(pages.car_makers),
                    api.getAllResourcesCarTypes(pages.car_types),
                    api.getAllResourcesFuelTypes(pages.fuel_types)
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
                const res = await api.getAllResourcesMobileMakers(pages.mobile_makers);
                setMobileMakers(res.result);
                setPagination(prev => ({ ...prev, mobile_makers: res.pagination }));
            } else if (activeTab === "jobs") {
                const res = await api.getAllResourcesJobCategories(pages.job_categories);
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
            const res = await api.getAllResourcesSubcategories(categoryId, page);
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
            const res = await api.getAllResourcesCategoryModels(subcategoryId, page);
            setCategoryModels(res.result);
            setPagination(prev => ({ ...prev, models: res.pagination }));
            setSelectedSubcategory(subcategoryId);
        } catch (error) {
            toast.error("فشل تحميل الموديلات");
        }
    };

    const fetchJobSubcategories = async (categoryId: number, page: number = 1) => {
        try {
            const res = await api.getAllResourcesJobSubcategories(categoryId, page);
            setJobSubcategories(res.result);
            setPagination(prev => ({ ...prev, job_subcategories: res.pagination }));
            setSelectedJobCategory(categoryId);
        } catch (error) {
            toast.error("فشل تحميل الفئات الفرعية للوظائف");
        }
    };

    // Render helpers
    const renderBilingualName = (name: any, country?: string) => {
        if (!name) return "";
        return (
            <div className="flex flex-1 items-center justify-between min-w-0 gap-4" dir="rtl">
                <div className="flex flex-col items-start text-start">
                    <span className="font-bold text-foreground leading-tight">{name.ar}</span>
                    {country && <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{country}</span>}
                </div>
                <span className="text-xs font-medium text-muted-foreground/60 font-sans whitespace-nowrap" dir="ltr">{name.en}</span>
            </div>
        );
    };

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-primary tracking-tight">إدارة البيانات</h1>
                <p className="text-muted-foreground font-medium">إدارة التصنيفات، الموديلات، الشركات المصنعة، والبيانات العامة للنظام.</p>
            </div>

            <Tabs defaultValue="categories" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 h-14 bg-muted p-1.5 rounded-2xl border border-border shadow-inner">
                    <TabsTrigger value="cars" className="rounded-xl font-bold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">السيارات</TabsTrigger>
                    <TabsTrigger value="mobiles" className="rounded-xl font-bold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">الموبايلات</TabsTrigger>
                    <TabsTrigger value="jobs" className="rounded-xl font-bold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">الوظائف</TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-xl font-bold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">التصنيفات</TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="categories" className="m-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Models - Visual Left */}
                            <Card className="rounded-3xl border-border shadow-xl overflow-hidden" dir="rtl">
                                <CardHeader className="bg-muted/30 border-b border-border">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-black text-foreground">الموديلات</CardTitle>
                                        {selectedSubcategory && <AddDialog type="model" parentId={selectedSubcategory} onRefresh={() => fetchModels(selectedSubcategory)} />}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {!selectedSubcategory ? (
                                        <div className="p-8 text-center text-muted-foreground italic tracking-wide">اختر فئة فرعية لرؤية الموديلات</div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
                                                {categoryModels.map((model) => (
                                                    <div key={model.id} className="p-4 flex justify-between items-center transition-all hover:bg-muted/50 group/item">
                                                        <div className="flex flex-1 items-center gap-3 me-4 overflow-hidden">
                                                            {model.logo && <img src={model.logo} className="w-8 h-8 rounded-lg object-contain bg-card border border-border shadow-sm transition-transform group-hover/item:scale-110" />}
                                                            {renderBilingualName(model.name, model.country)}
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

                            {/* Subcategories - Visual Center */}
                            <Card className="rounded-3xl border-border shadow-xl overflow-hidden" dir="rtl">
                                <CardHeader className="bg-muted/30 border-b border-border">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-black text-foreground">التصنيفات الفرعية</CardTitle>
                                        {selectedCategory && <AddDialog type="subcategory" parentId={selectedCategory} onRefresh={() => fetchSubcategories(selectedCategory)} />}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {!selectedCategory ? (
                                        <div className="p-8 text-center text-muted-foreground italic tracking-wide">اختر تصنيفاً لرؤية الفئات الفرعية</div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
                                                {subcategories.map((sub) => (
                                                    <div
                                                        key={sub.id}
                                                        onClick={() => fetchModels(sub.id)}
                                                        className={`p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-muted/50 ${selectedSubcategory === sub.id ? "bg-primary/10 border-r-4 border-primary" : ""}`}
                                                    >
                                                        <div className="flex-1 me-4 overflow-hidden">
                                                            {renderBilingualName(sub.name)}
                                                        </div>
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

                            {/* Main Categories - Visual Right */}
                            <Card className="rounded-3xl border-border shadow-xl overflow-hidden group" dir="rtl">
                                <CardHeader className="bg-muted/30 border-b border-border">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-black text-foreground">التصنيفات الرئيسية</CardTitle>
                                        <AddDialog type="category" onRefresh={fetchMainData} />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto custom-scrollbar">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() => fetchSubcategories(cat.id)}
                                                className={`p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-muted/50 ${selectedCategory === cat.id ? "bg-primary/10 border-r-4 border-primary" : ""}`}
                                            >
                                                <div className="flex-1 me-4 overflow-hidden">
                                                    {renderBilingualName(cat.name)}
                                                </div>
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
                        </div>
                    </TabsContent>

                    <TabsContent value="jobs" className="m-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Job Subcategories - Visual Left */}
                            <Card className="rounded-3xl border-border shadow-xl overflow-hidden" dir="rtl">
                                <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                    <CardTitle className="text-xl font-black text-foreground">التصنيفات الفرعية للوظائف</CardTitle>
                                    {selectedJobCategory && <AddDialog type="job_subcategory" parentId={selectedJobCategory} onRefresh={() => fetchJobSubcategories(selectedJobCategory)} />}
                                </CardHeader>
                                <CardContent className="p-0">
                                    {!selectedJobCategory ? (
                                        <div className="p-8 text-center text-muted-foreground italic tracking-wide">اختر تصنيف عمل لرؤية الفئات الفرعية</div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
                                                {jobSubcategories.map((sub) => (
                                                    <div key={sub.id} className="p-4 flex justify-between items-center transition-all hover:bg-muted/50">
                                                        <div className="flex-1 me-4 overflow-hidden">
                                                            {renderBilingualName(sub.name)}
                                                        </div>
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

                            {/* Job Categories - Visual Right */}
                            <Card className="rounded-3xl border-border shadow-xl overflow-hidden" dir="rtl">
                                <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                    <CardTitle className="text-xl font-black text-foreground">تصنيفات الوظائف</CardTitle>
                                    <AddDialog type="job_category" onRefresh={fetchMainData} />
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
                                        {jobCategories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() => fetchJobSubcategories(cat.id)}
                                                className={`p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-muted/50 ${selectedJobCategory === cat.id ? "bg-primary/10 border-r-4 border-primary" : ""}`}
                                            >
                                                <div className="flex-1 me-4 overflow-hidden">
                                                    {renderBilingualName(cat.name)}
                                                </div>
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
                        </div>
                    </TabsContent>

                    <TabsContent value="mobiles" className="m-0 focus-visible:outline-none">
                        <Card className="rounded-3xl border-border shadow-xl overflow-hidden" dir="rtl">
                            <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black text-foreground">إدارة الأجهزة المحمولة</CardTitle>
                                    <CardDescription className="text-start text-muted-foreground/70">قائمة بجميع الماركات والموديلات المتاحة</CardDescription>
                                </div>
                                <AddDialog type="mobile_maker" onRefresh={fetchMainData} />
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/20">
                                        <TableRow className="border-border/50">
                                            <TableHead className="font-black text-muted-foreground text-start uppercase text-xs tracking-wider">الموديل</TableHead>
                                            <TableHead className="font-black text-muted-foreground text-start uppercase text-xs tracking-wider">الماركة</TableHead>
                                            <TableHead className="font-black text-muted-foreground text-start uppercase text-xs tracking-wider">النوع</TableHead>
                                            <TableHead className="font-black text-muted-foreground text-start uppercase text-xs tracking-wider">السنة</TableHead>
                                            <TableHead className="font-black text-muted-foreground text-start uppercase text-xs tracking-wider">العمليات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mobileMakers.map((mm) => (
                                            <TableRow key={mm.id} className="border-border/10">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {mm.image && <img src={mm.image} className="w-10 h-10 rounded-xl bg-card border border-border object-contain shadow-sm p-1" />}
                                                        <span className="font-bold text-foreground/90">{mm.model}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-black text-primary">{mm.brand}</TableCell>
                                                <TableCell>
                                                    <span className="bg-muted text-muted-foreground text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter transition-colors hover:bg-muted/80">{mm.type}</span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-medium">{mm.year || "N/A"}</TableCell>
                                                <TableCell className="text-start">
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

                    <TabsContent value="cars" className="m-0 focus-visible:outline-none">
                        <div className="space-y-8">
                            <Card className="rounded-3xl border-border shadow-xl overflow-hidden" dir="rtl">
                                <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black text-foreground">ماركات السيارات</CardTitle>
                                        <CardDescription className="text-start text-muted-foreground/70">إدارة مصنعي السيارات والسلاسل التابعة لهم</CardDescription>
                                    </div>
                                    <AddDialog type="car_maker" onRefresh={fetchMainData} />
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/20">
                                            <TableRow className="hover:bg-transparent border-border/50">
                                                <TableHead className="font-black text-muted-foreground w-[250px] text-start uppercase text-xs tracking-wider">الماركة</TableHead>
                                                <TableHead className="font-black text-muted-foreground text-start uppercase text-xs tracking-wider">الدولة</TableHead>
                                                <TableHead className="font-black text-muted-foreground text-start uppercase text-xs tracking-wider">السلاسل</TableHead>
                                                <TableHead className="font-black text-muted-foreground text-start uppercase text-xs tracking-wider">العمليات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {carMakers.map((maker) => (
                                                <TableRow key={maker.id} className="hover:bg-muted/30 transition-colors border-border/10">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {maker.logo_url && <img src={maker.logo_url} className="w-10 h-10 rounded-xl bg-card border border-border object-contain shadow-sm p-1" />}
                                                            <div className="flex-1 overflow-hidden">
                                                                {renderBilingualName(maker.name)}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {maker.flag_url && <img src={maker.flag_url} className="w-6 h-4 rounded shadow-sm border border-border/30" />}
                                                            <span className="text-sm font-bold text-muted-foreground">{maker.country}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ViewSeriesDialog series={maker.series} makerName={maker.name} makerId={maker.id} onRefresh={fetchMainData} />
                                                    </TableCell>
                                                    <TableCell className="text-start">
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
                                <Card className="rounded-3xl border-border shadow-xl overflow-hidden" dir="rtl">
                                    <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg font-black text-foreground">أنواع المركبات</CardTitle>
                                        <AddDialog type="car_type" onRefresh={fetchMainData} />
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableBody>
                                                {carTypes.map((type) => (
                                                    <TableRow key={type.id} className="border-border/10">
                                                        <TableCell className="overflow-hidden">
                                                            {renderBilingualName(type.name)}
                                                        </TableCell>
                                                        <TableCell className="text-start">
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

                                <Card className="rounded-3xl border-border shadow-xl overflow-hidden" dir="rtl">
                                    <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg font-black text-foreground">أنواع الوقود</CardTitle>
                                        <AddDialog type="fuel_type" onRefresh={fetchMainData} />
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableBody>
                                                {fuelTypes.map((type) => (
                                                    <TableRow key={type.id} className="border-border/10">
                                                        <TableCell className="overflow-hidden">
                                                            {renderBilingualName(type.name)}
                                                        </TableCell>
                                                        <TableCell className="text-start">
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
                </div>
            </Tabs>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.4); }
      `}} />
        </div>
    );
}

function PaginationControls({ pagination, onPageChange }: { pagination: IPagination | null | undefined, onPageChange: (page: number) => void }) {
    if (!pagination || pagination.total_pages <= 1) return null;

    const current = pagination.current_page;
    const total = pagination.total_pages;

    const getPages = () => {
        const pages: (number | string)[] = [];
        const delta = 2; // Number of pages at each side of the current page

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10" dir="rtl">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={current <= 1}
                    onClick={() => onPageChange(current - 1)}
                    className="rounded-lg font-bold text-muted-foreground h-8 hover:bg-card hover:text-foreground hover:shadow-sm"
                >
                    السابق
                </Button>

                <div className="flex items-center gap-1">
                    {getPages().map((page, i) => (
                        <Fragment key={i}>
                            {page === "..." ? (
                                <span className="px-2 text-muted-foreground/50 font-bold">...</span>
                            ) : (
                                <Button
                                    variant={current === page ? "default" : "ghost"}
                                    size="icon"
                                    className={`h-8 w-8 rounded-lg font-bold text-xs transition-all ${current === page
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-muted-foreground/70 hover:bg-card hover:text-primary"
                                        }`}
                                    onClick={() => onPageChange(page as number)}
                                >
                                    {page}
                                </Button>
                            )}
                        </Fragment>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    disabled={!pagination.has_more}
                    onClick={() => onPageChange(current + 1)}
                    className="rounded-lg font-bold text-muted-foreground h-8 hover:bg-card hover:text-foreground hover:shadow-sm"
                >
                    التالي
                </Button>
            </div>
            <span className="text-xs font-black text-muted-foreground/50 uppercase tracking-widest">
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
            if (type === "category") await api.createAllResourcesCategory(formData.name);
            else if (type === "subcategory") await api.createAllResourcesSubcategory(formData.name, parentId!);
            else if (type === "model") await api.createAllResourcesCategoryModel({ ...formData, subcategory_id: parentId! });
            else if (type === "car_maker") await api.createAllResourcesCarMaker(formData);
            else if (type === "mobile_maker") await api.createAllResourcesMobileMaker(formData);
            else if (type === "car_type") await api.createAllResourcesCarType(formData.name);
            else if (type === "fuel_type") await api.createAllResourcesFuelType(formData.name);
            else if (type === "job_category") await api.createAllResourcesJobCategory(formData.name);
            else if (type === "job_subcategory") await api.createAllResourcesJobSubcategory(formData.name, parentId!);

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
                <Button size="icon" className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-90 transition-all">
                    <Plus className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-border shadow-2xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-foreground text-start">إضافة عنصر جديد</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground text-start">أدخل المعلومات المطلوبة أدناه.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {(["category", "subcategory", "car_type", "fuel_type", "job_category", "job_subcategory", "model"].includes(type)) && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الاسم (بالعربية)</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ar: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الاسم (بالإنكليزية)</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} />
                            </div>
                        </div>
                    )}
                    {type === "model" && (
                        <>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الدولة</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">رابط الشعار</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" placeholder="https://..." onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />
                            </div>
                        </>
                    )}
                    {type === "car_maker" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الاسم (عربي / إنكليزي)</Label>
                                <div className="flex gap-2">
                                    <Input className="rounded-xl border-border bg-card/50 focus:bg-card" placeholder="عربي" onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ar: e.target.value } })} />
                                    <Input className="rounded-xl border-border bg-card/50 focus:bg-card" placeholder="EN" onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الدولة</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">السنة</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" type="text" onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">رابط الشعار</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
                            </div>
                        </div>
                    )}
                    {type === "mobile_maker" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الموديل</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الماركة</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">النوع</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" placeholder="phone/tablet" onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">السنة</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" type="number" onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">رابط الصورة</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold text-muted-foreground hover:bg-muted/50">إلغاء</Button>
                    <Button onClick={handleSubmit} className="rounded-xl bg-primary hover:bg-primary/90 font-bold px-8 shadow-md shadow-primary/20">حفظ</Button>
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
            if (type === "category") await api.updateAllResourcesCategory(data.id, formData.name);
            else if (type === "subcategory") await api.updateAllResourcesSubcategory(data.id, formData.name, formData.category_id);
            else if (type === "model") await api.updateAllResourcesCategoryModel(data.id, formData);
            else if (type === "car_maker") await api.updateAllResourcesCarMaker(data.id, formData);
            else if (type === "mobile_maker") await api.updateAllResourcesMobileMaker(data.id, formData);
            else if (type === "car_type") await api.updateAllResourcesCarType(data.id, formData.name);
            else if (type === "fuel_type") await api.updateAllResourcesFuelType(data.id, formData.name);
            else if (type === "job_category") await api.updateAllResourcesJobCategory(data.id, formData.name);
            else if (type === "job_subcategory") await api.updateAllResourcesJobSubcategory(data.id, formData.name, formData.category_jobs_id);

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
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                    <Edit className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-border shadow-2xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-foreground text-start">تعديل العنصر</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground text-start">قم بإجراء التغييرات اللازمة واضغط حفظ.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {formData.name && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الاسم (بالعربية)</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" value={formData.name.ar} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ar: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-foreground/90 text-start">الاسم (بالإنكليزية)</Label>
                                <Input className="rounded-xl border-border bg-card/50 focus:bg-card" value={formData.name.en} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })} />
                            </div>
                        </div>
                    )}
                    {type === "model" && (
                        <>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-start">الدولة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-start">رابط الشعار</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />
                            </div>
                        </>
                    )}
                    {type === "car_maker" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-start">الدولة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-start">السنة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700 text-start">رابط الشعار</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
                            </div>
                        </div>
                    )}
                    {type === "mobile_maker" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-start">الموديل</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-start">الماركة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-start">النوع</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 text-start">السنة</Label>
                                <Input className="rounded-xl border-slate-200" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-slate-700 text-start">رابط الصورة</Label>
                                <Input className="rounded-xl border-slate-200" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold text-muted-foreground hover:bg-muted/50">إلغاء</Button>
                    <Button onClick={handleSubmit} className="rounded-xl bg-primary hover:bg-primary/90 font-bold px-8 shadow-md shadow-primary/20">حفظ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteDialog({ type, id, onRefresh }: { type: string, id: number, onRefresh: () => void }) {
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        try {
            if (type === "category") await api.deleteAllResourcesCategory(id);
            else if (type === "subcategory") await api.deleteAllResourcesSubcategory(id);
            else if (type === "model") await api.deleteAllResourcesCategoryModel(id);
            else if (type === "car_maker") await api.deleteAllResourcesCarMaker(id);
            else if (type === "mobile_maker") await api.deleteAllResourcesMobileMaker(id);
            else if (type === "car_type") await api.deleteAllResourcesCarType(id);
            else if (type === "fuel_type") await api.deleteAllResourcesFuelType(id);
            else if (type === "job_category") await api.deleteAllResourcesJobCategory(id);
            else if (type === "job_subcategory") await api.deleteAllResourcesJobSubcategory(id);

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
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-border shadow-2xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-foreground text-start">تأكيد الحذف</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground/80 text-start">هل أنت متأكد من رغبتك في حذف هذا العنصر؟ سيتم تنفيذ حذف ناعم (Soft Delete).</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold flex-1 text-muted-foreground hover:bg-muted/50">إلغاء</Button>
                    <Button variant="destructive" onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 font-bold flex-1 shadow-md shadow-destructive/20">حذف نهائي</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ViewSeriesDialog({ series, makerName, makerId, onRefresh }: { series: any[], makerName: ILocalizedString, makerId: number, onRefresh: () => void }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newSeries, setNewSeries] = useState({ series: "", year: "", model: "" });

    const handleDeleteSeries = async (idx: number) => {
        try {
            const updatedSeries = series.filter((_, i) => i !== idx);
            await api.updateCarMakerSeries(makerId, updatedSeries);
            toast.success("تم حذف السلسلة بنجاح");
            onRefresh();
        } catch (error) {
            toast.error("فشل حذف السلسلة");
        }
    };

    const handleAddSeries = async () => {
        try {
            const updatedSeries = [...(series || []), newSeries];
            await api.updateCarMakerSeries(makerId, updatedSeries);
            toast.success("تم إضافة السلسلة بنجاح");
            setIsAddOpen(false);
            setNewSeries({ series: "", year: "", model: "" });
            onRefresh();
        } catch (error) {
            toast.error("فشل إضافة السلسلة");
        }
    };

    const renderSeriesName = (item: any) => {
        if (!item) return "---";
        if (typeof item === 'string') return item;
        const identity = item.series || item.model || item.model_name || (item.name && (item.name.ar || item.name.en || item.name));
        if (identity) {
            if (typeof identity === 'string') return identity;
            if (typeof identity === 'object') return identity.ar || identity.en || "موديل غير معروف";
        }
        return "موديل غير معروف";
    };

    const renderSecondaryName = (item: any) => {
        if (!item || typeof item !== 'object') return null;
        const year = item.year || item.model_year;
        const enName = item.name?.en !== item.name?.ar ? item.name?.en : null;
        if (year && enName) return `${enName} (${year})`;
        return year || enName || null;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-8 px-4 rounded-full bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary font-black text-xs transition-all active:scale-95 shadow-sm border">
                    {series?.length || 0} موديل
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-border shadow-2xl overflow-hidden p-0" dir="rtl">
                <DialogHeader className="p-6 bg-muted/30 border-b border-border">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col gap-1">
                            <DialogTitle className="text-2xl font-black text-foreground text-start flex items-center gap-3">
                                سلاسل موديلات <span className="text-primary">{makerName.ar}</span>
                            </DialogTitle>
                            <DialogDescription className="text-start font-medium text-muted-foreground">
                                قائمة بجميع الموديلات والسلاسل التابعة لهذه الماركة.
                            </DialogDescription>
                        </div>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon" className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-md">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl border-border shadow-xl" dir="rtl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black text-start">إضافة سلسلة جديدة</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-start">اسم السلسلة</Label>
                                        <Input value={newSeries.series} onChange={(e) => setNewSeries({ ...newSeries, series: e.target.value })} placeholder="مثال: Series 5" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-start">الموديل</Label>
                                        <Input value={newSeries.model} onChange={(e) => setNewSeries({ ...newSeries, model: e.target.value })} placeholder="مثال: G30" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-start">السنة</Label>
                                        <Input value={newSeries.year} onChange={(e) => setNewSeries({ ...newSeries, year: e.target.value })} placeholder="مثال: 2021" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsAddOpen(false)}>إلغاء</Button>
                                    <Button onClick={handleAddSeries} className="bg-primary hover:bg-primary/90">إضافة</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </DialogHeader>
                <div className="max-h-[450px] overflow-y-auto p-4 custom-scrollbar bg-background">
                    {series && series.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {series.map((item, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group/series flex justify-between items-center">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-foreground text-sm group-hover/series:text-primary transition-colors">
                                            {renderSeriesName(item)}
                                        </span>
                                        {renderSecondaryName(item) && (
                                            <span className="text-[10px] text-muted-foreground/60 font-black font-sans uppercase tracking-tight">
                                                {renderSecondaryName(item)}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteSeries(idx)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover/series:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-3">
                            <span className="text-4xl">🚗</span>
                            لا توجد موديلات مسجلة لهذه الماركة حالياً.
                        </div>
                    )}
                </div>
                <div className="p-6 bg-muted/10 border-t border-border flex justify-end">
                    <DialogTrigger asChild>
                        <Button className="rounded-xl px-10 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">إغلاق</Button>
                    </DialogTrigger>
                </div>
            </DialogContent>
        </Dialog>
    );
}
