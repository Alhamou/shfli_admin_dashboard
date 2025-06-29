import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { ICreatMainItem } from '@/interfaces';
import { getItem, updateItem, getReasons } from '@/services/restApiServices';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ItemDetailViewProps {
  uuid: string;
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void; // Optional callback when status changes
  onItemUpdate: (updatedItem: ICreatMainItem) => void;
}

export function ItemDetailView({
  uuid,
  open,
  onClose,
  onStatusChange,
  onItemUpdate,
}: ItemDetailViewProps) {
  const [item, setItem] = useState<ICreatMainItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [blockReasons, setBlockReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  const fetchItem = async (uuid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItem(uuid);
      setItem(data[0]);
      return data[0];
    } catch (err) {
      setError("Failed to load item details");
      toast.error("Could not fetch item details");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockReasons = async () => {
    setLoading(true);
    try {
      const response = await getReasons();
      setBlockReasons(item?.item_as === "job" ? response.jobs : response.items);
    } catch (err) {
      toast.error("Could not fetch block reasons");
    } finally {
      setLoading(false);
    }
  };

  console.log(item);

  const handleStatusToggle = async (newStatus: "active" | "blocked") => {
    if (!item) return;

    setUpdatingStatus(true);
    try {
      let description = item.description;

      if (newStatus === "blocked") {
        description = `${
          selectedReason === "Other" ? customReason : selectedReason
        }`;
      }

      await updateItem(item.uuid, description, newStatus);
      toast.success(
        `Item has been ${newStatus === "active" ? "enabled" : "disabled"}`
      );

      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (err) {
      toast.error("Failed to update item status");
    } finally {
      setUpdatingStatus(false);
      setShowReasonInput(false);
      setSelectedReason("");
      setCustomReason("");
    }
  };

  const handleBlockAction = () => {
    if (item?.is_active === "active") {
      setShowReasonInput(true);
    } else {
      handleStatusToggle("active");
    }
  };

  useEffect(() => {
    if (open) {
      fetchItem(uuid);
      fetchBlockReasons();
      setShowReasonInput(false);
      setSelectedReason("");
      setCustomReason("");
    } else {
      setItem(null);
    }
  }, [open, uuid]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Item Details</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {error}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                fetchItem(uuid);
              }}
            >
              Retry
            </Button>
          </div>
        ) : item ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Images (20%) */}
            <div className="lg:col-span-3">
              <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
                {item.images?.length > 0 ? (
                  item.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={image.url}
                        alt={`${item.title} - ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-item.png";
                        }}
                      />
                    </div>
                  ))
                ) : item.thumbnail ? (
                  <div className="relative aspect-square">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-item.png";
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 aspect-square rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No Images</span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column - Details (65%) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{item.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{item.item_as}</Badge>
                  {item.item_for && (
                    <Badge variant="secondary">{item.item_for}</Badge>
                  )}
                  <Badge
                    variant={
                      item.is_active === "active" ? "default" : "destructive"
                    }
                  >
                    {item.is_active}
                  </Badge>
                  {item.delivery_available && (
                    <Badge variant="secondary">Delivery Available</Badge>
                  )}
                  {item.installment && (
                    <Badge variant="secondary">Installment</Badge>
                  )}
                  {item.obo && <Badge variant="secondary">OBO</Badge>}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="whitespace-pre-line">{item.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Location</h3>
                  <p>
                    {item.city}, {item.state}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.address}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">whatsapp Contact</h3>
                  <p>{item.contact_whatsapp || "N/A"}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Stats</h3>
                  <div className="flex items-center gap-2">
                    <span>Views: {item.view_count || 0}</span>
                    <span>Favorites: {item.favorite_at ? 1 : 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(item.activated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Job-specific details */}
              {item.item_as === "job" ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Job Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Remote Job</p>
                      <p>
                        {item.need
                          ? "Employee looking for a job"
                          : "Company looking for an employee"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Remote Job</p>
                      <p>{item.remote_job ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Company name</p>
                      <p>{item.company_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Company website</p>
                      <p>{item.company_website || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Company phone</p>
                      <p>{item.contact_phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Company email</p>
                      <p>{item.contact_email || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-job item details */
                <div className="space-y-4">
                  <h3 className="font-semibold">Item Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile-specific details */}
                    {(item.item_as === "shop" || item.item_as === "used") &&
                      item.storage_capacity && (
                        <>
                          <div>
                            <p className="text-sm font-medium">Storage</p>
                            <p>{item.storage_capacity}GB</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">RAM</p>
                            <p>{item.ram}GB</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Operating System
                            </p>
                            <p>{item.operating_system || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Screen Size</p>
                            <p>{item.screen_size}"</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Battery</p>
                            <p>{item.battery_capacity}mAh</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Camera</p>
                            <p>{item.camera_resolution || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Color</p>
                            <p>{item.color || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Condition</p>
                            <p>{item.condition || "N/A"}</p>
                          </div>
                        </>
                      )}

                    {/* Car-specific details */}
                    {item.item_as === "used" && item.mileage && (
                      <>
                        <div>
                          <p className="text-sm font-medium">Mileage</p>
                          <p>{item.mileage} km</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Transmission</p>
                          <p>{item.transmission_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Year</p>
                          <p>{item.year || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Fuel Type</p>
                          <p>{item.fuel_type_id || "N/A"}</p>
                        </div>
                      </>
                    )}

                    {/* Property-specific details */}
                    {item.item_as === "used" && item.area && (
                      <>
                        <div>
                          <p className="text-sm font-medium">Area</p>
                          <p>{item.area} sq.ft</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Bedrooms</p>
                          <p>{item.bedrooms || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Bathrooms</p>
                          <p>{item.bathrooms || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Floor</p>
                          <p>{item.floor || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Year Built</p>
                          <p>{item.year_built || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Furnished</p>
                          <p>{item.is_furnished ? "Yes" : "No"}</p>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <h3 className="font-semibold">Price</h3>
                      <p>
                        {item.price
                          ? `${item.price.toLocaleString()} ${item.currency}`
                          : "N/A"}
                        {item.discount > 0 && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({item.discount}% off)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* General item details */}
                    <div>
                      <p className="text-sm font-medium">Reserved</p>
                      <p>{item.reserved ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Discount End Date</p>
                      <p>
                        {item.date_end_discount
                          ? new Date(
                              item.date_end_discount
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showReasonInput && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium">Select a reason for blocking</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start whitespace-normal text-left h-auto min-h-[40px] py-2"
                      >
                        {selectedReason || "Select a reason..."}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {blockReasons.map((reason) => (
                        <DropdownMenuItem
                          key={reason}
                          onClick={() => setSelectedReason(reason)}
                        >
                          {reason}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() => setSelectedReason("Other")}
                      >
                        Other
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {selectedReason === "Other" && (
                    <Textarea
                      placeholder="Please specify the reason..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReasonInput(false);
                        setSelectedReason("");
                        setCustomReason("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleStatusToggle("blocked")}
                      disabled={
                        !selectedReason ||
                        (selectedReason === "Other" && !customReason) ||
                        updatingStatus
                      }
                    >
                      Confirm Block
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions (15%) */}
            <div className="lg:col-span-1 space-y-2">
              <Button variant="outline" className="w-full">
                Edit
              </Button>
              <Button variant="outline" className="w-full">
                Message
              </Button>
              <Button variant="outline" className="w-full">
                Share
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={updatingStatus}
              >
                Report
              </Button>
            </div>

            {/* Bottom Status Bar */}
            <div className="col-span-full border-t pt-4 mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge
                  variant={
                    item.is_active === "active" ? "default" : "destructive"
                  }
                >
                  {item.is_active}
                </Badge>
                <span>{item.status_note}</span>
              </div>
              <Button
                onClick={handleBlockAction}
                variant={
                  item.is_active === "active" ? "destructive" : "default"
                }
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {item.is_active === "active" ? "Block Ad" : "Unblock Ad"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}