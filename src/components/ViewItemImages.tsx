import { ICreatMainItem } from "@/interfaces";
import { ChevronLeft, ChevronRight, ImageIcon, ZoomIn } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
} from "./ui/dialog";

export const ViewItemImages = ({ item }: { item: ICreatMainItem }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const images = item.images?.length > 0
    ? item.images
    : item.thumbnail
    ? [{ url: item.thumbnail }]
    : [];

  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (item.item_as === "job") {
    return null;
  }

  return (
    <>
      <div className="lg:w-80 xl:w-96 flex-shrink-0">
        {images.length > 0 ? (
          <div className="space-y-3">
            {/* Main Image with Slider */}
            <div className="relative group">
              <div
                className="relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer shadow-lg"
                onClick={() => setShowFullscreen(true)}
              >
                <img
                  src={images[currentIndex]?.url}
                  alt={`${item.title} - ${currentIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-item.png";
                  }}
                />

                {/* Zoom overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Image counter */}
                {hasMultipleImages && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                    {currentIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 dark:bg-black/70 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 dark:bg-black/70 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`
                      flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200
                      ${index === currentIndex
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
                      }
                    `}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-item.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square rounded-xl bg-muted flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
            <span className="text-sm">لا توجد صور متاحة</span>
          </div>
        )}
      </div>

      {/* Fullscreen image dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <div className="relative flex items-center justify-center min-h-[80vh]">
            <img
              src={images[currentIndex]?.url}
              alt={`${item.title} - ${currentIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Thumbnail strip in fullscreen */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm p-2 rounded-xl">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`
                      w-12 h-12 rounded-lg overflow-hidden border-2 transition-all
                      ${index === currentIndex
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
