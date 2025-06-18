import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toQueryString } from '@/lib/helpFunctions';
import { getAllItems } from '@/services/restApiServices';
import { ICreatMainItem } from '@/interfaces';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Eye } from 'lucide-react';

const initialQuery = { page: 1, limit: 25, total: 0 }

export default function DashboardHome() {
  const [items, setItems] = useState<ICreatMainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialQuery);
  const [hasMore, setHasMore] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(async (page: number, limit: number) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const query = toQueryString({ page, limit });
      const response = await getAllItems(query);
      setItems(prev => page === 1 ? response.result : [...prev, ...response.result]);
      setPagination({
        page,
        limit,
        total: response.pagination.total
      });
      setHasMore(response.result.length === limit);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchItems(pagination.page, pagination.limit);
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container || loading || !hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when we're within 200px of the bottom
      if (scrollHeight - (scrollTop + clientHeight) < 200) {
        fetchItems(pagination.page + 1, pagination.limit);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, pagination, fetchItems]);

const getStatusBadge = (status: 'active' | 'pending' | 'blocked') => {
  return (
    <CustomBadge 
      variant={status} 
      size="lg"
      className="whitespace-nowrap"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </CustomBadge>
  );
};

const getItemTypeBadge = (itemAs: 'shop' | 'used' | 'job') => {
  const labels = {
    shop: 'Shop Item',
    used: 'Used Item',
    job: 'Job Offer',
  };
  
  return (
    <CustomBadge 
      variant={itemAs} 
      size="lg"
      className="whitespace-nowrap"
    >
      {labels[itemAs]}
    </CustomBadge>
  );
};

const getItemForBadge = (itemFor: 'sale' | 'rent' | 'trade' | 'service') => {
  const labels = {
    sale: 'For Sale',
    rent: 'For Rent',
    trade: 'For Trade',
    service: 'Service',
  };
  
  return (
    <CustomBadge 
      variant={itemFor} 
      size="lg"
      className="whitespace-nowrap"
    >
      {labels[itemFor]}
    </CustomBadge>
  );
};

  return (
<div className="mx-auto py-8">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold">Items Management</h1>
  </div>
  
  <div className="bg-white rounded-lg shadow p-6">
    <div 
      ref={tableContainerRef}
      className="rounded-md border overflow-auto" 
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${index}`}>
              <TableCell className="flex items-center gap-4">
                {item.item_as === 'job' ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={item.thumbnail || (item.images && item.images[0]?.url)} 
                      alt={item.title}
                    />
                    <AvatarFallback>
                      {item.title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="relative h-40 w-40 flex-shrink-0">
                    <img
                      className="h-full w-full rounded-md object-cover"
                      src={item.thumbnail || (item.images && item.images[0]?.url)}
                      alt={item.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-item.png';
                      }}
                    />
                  </div>
                )}
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className={`text-sm text-muted-foreground ${
                    item.item_as === 'job' ? 'line-clamp-3' : 'line-clamp-2'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {getItemTypeBadge(item.item_as)}
                  {item.item_for && getItemForBadge(item.item_for)}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p>{item.category_name?.en || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.subcategory_name?.en || 'N/A'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {item.price ? (
                  <div className="space-y-1">
                    <p className="font-medium">
                      {item.price.toLocaleString()} {item.currency}
                    </p>
                    {item.discount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Discount: {item.discount}%
                      </p>
                    )}
                  </div>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p>{item.city}</p>
                  <p className="text-sm text-muted-foreground">{item.state}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{item.view_count || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.activated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    User: {item.uuid}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(item.is_active)}
                  {item.account_type && (
    <CustomBadge 
      variant={'unknown'} 
      size="lg"
      className="whitespace-nowrap"
    >
                      {item.account_type}
                    </CustomBadge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <button className="text-sm text-primary hover:underline">
                  View
                </button>
              </TableCell>
            </TableRow>
          ))}
          {loading && (
            <>
              {[...Array(pagination.limit)].map((_, i) => (
                <TableRow key={`loading-${i}`}>
                  <TableCell colSpan={8}>
                    <div className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
      {!hasMore && items.length > 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No more items to load
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No items found
        </div>
      )}
    </div>
  </div>
</div>
  );
}
