'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { DndContext, closestCenter, closestCorners, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useDropzone } from 'react-dropzone';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import { PropertyImage } from '../../services/property.service';

type Image = PropertyImage;

// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function ImageManager({
  initialImages, 
  onImagesChange, 
  propertyId 
}: { 
  initialImages: Image[]; 
  onImagesChange?: (images: Image[]) => void;
  propertyId?: string;
}) {
  // Sort initial images by order parameter
  const [images, setImages] = useState<Image[]>(() => {
    return [...initialImages].sort((a, b) => (a.order || 0) - (b.order || 0));
  });
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [resizeSettings, setResizeSettings] = useState({
    width: 800,
    height: 600,
    maintainAspect: true,
    quality: 90
  });
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [smartCrop, setSmartCrop] = useState<Crop>({
    unit: 'px',
    width: 0,
    height: 0,
    x: 0,
    y: 0
  });
  const [showSmartCrop, setShowSmartCrop] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const smartCropImageRef = useRef<HTMLImageElement>(null);
  const [activeTab, setActiveTab] = useState<'crop' | 'resize'>('crop');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false); // Flag to prevent parent resets
  const onImagesChangeRef = useRef(onImagesChange);
  const isInitialMount = useRef(true);
  const prevInitialImagesRef = useRef(initialImages);
  const toast = useRef<Toast>(null);

  // Force ready state after component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100); // Small delay to ensure everything is mounted
    
    return () => clearTimeout(timer);
  }, []);

  // Custom event listener for toast notifications from child components
  useEffect(() => {
    const handleShowToast = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { severity, summary, detail, life } = customEvent.detail;
      toast.current?.show({ severity, summary, detail, life });
    };

    window.addEventListener('showToast', handleShowToast);
    return () => {
      window.removeEventListener('showToast', handleShowToast);
    };
  }, []);

  // Update the ref when the callback changes
  useEffect(() => {
    onImagesChangeRef.current = onImagesChange;
  }, [onImagesChange]);

  // Update images when initialImages change (and sort them by order) - but only if they actually changed
  useEffect(() => {
    // Skip update if we're currently dragging to prevent resets
    if (isDraggingImages) {
      return;
    }
    
    // Check if initialImages actually changed by comparing lengths and IDs
    const prevImages = prevInitialImagesRef.current;
    const hasChanged = 
      initialImages.length !== prevImages.length ||
      initialImages.some((img, index) => 
        !prevImages[index] || 
        img.id !== prevImages[index].id || 
        img.order !== prevImages[index].order ||
        img.isFavorite !== prevImages[index].isFavorite
      );

    if (hasChanged) {
      const sortedImages = [...initialImages].sort((a, b) => (a.order || 0) - (b.order || 0));
      setImages(sortedImages);
      prevInitialImagesRef.current = initialImages;
    }
  }, [initialImages.length, initialImages.map(img => `${img.id}-${img.order}-${img.isFavorite}`).join(','), isDraggingImages]);

  // Sync images with parent component when they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Re-enable parent notification
    if (onImagesChangeRef.current) {
      onImagesChangeRef.current(images);
    }
  }, [images]);

  // Drag & Drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0, // No distance requirement - immediate drag
      }
    })
  );
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active?.id) || null);
    setIsDraggingImages(true); // Set flag to prevent parent resets
  };

  const handleDragOver = (_event: unknown) => {
    // Optional: Add any drag over logic here
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null); // Reset active ID
    
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(items, oldIndex, newIndex);
          
          // Update the order property to reflect new positions
          const updatedOrder = newOrder.map((img, index) => ({
            ...img,
            order: index + 1 // Update order to match new position
          }));
          
          // If we have a propertyId, save the new order to the backend
          if (propertyId) {
            saveImageOrder(updatedOrder);
          }
          
          // Reset drag flag after a delay to allow backend save
          setTimeout(() => {
            setIsDraggingImages(false);
          }, 1000);
          
          return updatedOrder;
        } else {
          setIsDraggingImages(false);
          return items;
        }
      });
    } else {
      setIsDraggingImages(false);
    }
  };

  // Function to save image order to backend
  const saveImageOrder = async (orderedImages: Image[]) => {
    try {
      const orderData = orderedImages.map((image, index) => ({
        id: image.id,
        order: index + 1
      }));

      const response = await fetch(`${API_BASE_URL}/v1/properties/${propertyId}/images/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save image order:', response.statusText, errorText);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to save image order: ${response.statusText}`,
          life: 5000
        });
      } else {
        const result = await response.json();
        
        // Update local state with the server response to ensure consistency
        if (Array.isArray(result)) {
          setImages(result.sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      }
    } catch (error) {
      console.error('Error saving image order:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Error saving image order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        life: 5000
      });
    }
  };

  // Image upload handler
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    onDrop: async (files) => {
      if (files.length === 0) return;
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      try {
        const response = await fetch('http://localhost:3000/v1/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const uploadedFiles = await response.json();
        const newImages: Image[] = uploadedFiles.map((file: { url: string }, index: number) => ({
          id: `uploaded-${Date.now()}-${index}`,
          url: file.url,
          isFavorite: false,
          order: images.length + index + 1,
        }));
        
        setImages(prev => [...prev, ...newImages]);
      } catch (error) {
        console.error('Upload error:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Upload Failed',
          detail: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          life: 5000
        });
      }
    }
  });

  // Crop handler
  const handleCropComplete = useCallback(async () => {
    if (!selectedImage || !crop || !crop.width || !crop.height) {
      setSelectedImage(null);
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
      });
      return;
    }
    
    try {
      // Create a canvas to crop the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Create an image element to load the original image
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS for canvas
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = `http://localhost:3000${selectedImage.url.startsWith('/uploads/') ? selectedImage.url : '/uploads/' + selectedImage.url}`;
      });

      // Calculate crop dimensions
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      // Set canvas size to crop dimensions
      let cropX, cropY, cropWidth, cropHeight;
      
      if (crop.unit === '%') {
        cropX = (crop.x / 100) * img.naturalWidth;
        cropY = (crop.y / 100) * img.naturalHeight;
        cropWidth = (crop.width / 100) * img.naturalWidth;
        cropHeight = (crop.height / 100) * img.naturalHeight;
      } else {
        cropX = crop.x * scaleX;
        cropY = crop.y * scaleY;
        cropWidth = crop.width * scaleX;
        cropHeight = crop.height * scaleY;
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the cropped image
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      });

      // Extract original filename from the URL
      const originalUrl = selectedImage.url;
      const fileName = originalUrl.split('/').pop() || `image-${selectedImage.id}.jpg`;
      
      // Create form data for upload - use original filename to replace
      const formData = new FormData();
      formData.append('files', blob, fileName);
      formData.append('replaceExisting', 'true'); // Flag to indicate replacement
      
      // If we have a propertyId, include it in the upload to maintain proper structure
      if (propertyId) {
        formData.append('propertyUUID', propertyId);
      }

      // Upload the cropped image to replace the original
      const response = await fetch('http://localhost:3000/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // For replacement uploads, the image URL stays the same
      // Just update the timestamp to force re-render
      setImages(prev => prev.map(img => 
        img.id === selectedImage.id 
          ? { ...img, url: originalUrl + '?t=' + Date.now() } // Add timestamp to force reload
          : img
      ));

      toast.current?.show({
        severity: 'success',
        summary: 'Crop Complete',
        detail: `Image cropped successfully! Area: ${Math.round(crop.width)}% × ${Math.round(crop.height)}%`,
        life: 4000
      });
      
      setSelectedImage(null);
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
      });
    } catch (error) {
      console.error('Crop error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Crop Error',
        detail: `Error cropping image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        life: 5000
      });
    }
  }, [crop, selectedImage]);

  // Resize handler
  const handleResizeComplete = useCallback(async () => {
    if (!selectedImage) {
      setSelectedImage(null);
      return;
    }
    
    try {
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Create an image element to load the original image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = `http://localhost:3000${selectedImage.url.startsWith('/uploads/') ? selectedImage.url : '/uploads/' + selectedImage.url}`;
      });

      // Calculate new dimensions
      let newWidth = resizeSettings.width;
      let newHeight = resizeSettings.height;

      if (resizeSettings.maintainAspect) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        if (newWidth / newHeight > aspectRatio) {
          newWidth = newHeight * aspectRatio;
        } else {
          newHeight = newWidth / aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = Math.round(newWidth);
      canvas.height = Math.round(newHeight);

      // Draw the resized image - use smart crop if available
      if (showSmartCrop && !resizeSettings.maintainAspect && smartCrop.width > 0) {
        // Apply smart crop first, then resize
        ctx.drawImage(
          img,
          smartCrop.x, smartCrop.y, smartCrop.width, smartCrop.height, // Source crop area
          0, 0, newWidth, newHeight // Destination (full canvas)
        );
      } else {
        // Regular resize
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', resizeSettings.quality / 100);
      });

      // Extract original filename from the URL
      const originalUrl = selectedImage.url;
      const fileName = originalUrl.split('/').pop() || `image-${selectedImage.id}.jpg`;
      
      // Create form data for upload - use original filename to replace
      const formData = new FormData();
      formData.append('files', blob, fileName);
      formData.append('replaceExisting', 'true'); // Flag to indicate replacement
      
      // If we have a propertyId, include it in the upload to maintain proper structure
      if (propertyId) {
        formData.append('propertyUUID', propertyId);
      }

      // Upload the resized image to replace the original
      const response = await fetch('http://localhost:3000/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // For replacement uploads, the image URL stays the same
      // Just update the timestamp to force re-render
      setImages(prev => prev.map(img => 
        img.id === selectedImage.id 
          ? { ...img, url: originalUrl + '?t=' + Date.now() } // Add timestamp to force reload
          : img
      ));

      toast.current?.show({
        severity: 'success',
        summary: 'Resize Complete',
        detail: showSmartCrop && !resizeSettings.maintainAspect 
          ? `Image smart-cropped and resized to ${Math.round(newWidth)}×${Math.round(newHeight)} pixels (Quality: ${resizeSettings.quality}%)`
          : `Image resized to ${Math.round(newWidth)}×${Math.round(newHeight)} pixels (Quality: ${resizeSettings.quality}%)`,
        life: 4000
      });
      
      setSelectedImage(null);
    } catch (error) {
      console.error('Resize error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Resize Error',
        detail: `Error resizing image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        life: 5000
      });
    }
  }, [selectedImage, resizeSettings]);

  // Function to calculate smart crop area for exact resize
  const calculateSmartCrop = useCallback((imgWidth: number, imgHeight: number, targetWidth: number, targetHeight: number) => {
    const targetAspectRatio = targetWidth / targetHeight;
    const imageAspectRatio = imgWidth / imgHeight;
    
    let cropWidth, cropHeight, cropX, cropY;
    
    if (imageAspectRatio > targetAspectRatio) {
      // Image is wider than target - crop width
      cropHeight = imgHeight;
      cropWidth = imgHeight * targetAspectRatio;
      cropX = (imgWidth - cropWidth) / 2;
      cropY = 0;
    } else {
      // Image is taller than target - crop height
      cropWidth = imgWidth;
      cropHeight = imgWidth / targetAspectRatio;
      cropX = 0;
      cropY = (imgHeight - cropHeight) / 2;
    }
    
    return {
      unit: 'px' as const,
      width: cropWidth,
      height: cropHeight,
      x: cropX,
      y: cropY
    };
  }, []);

  // Function to update resize preview canvas
  const updateResizePreview = useCallback(async () => {
    if (!selectedImage || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = `http://localhost:3000${selectedImage.url.startsWith('/uploads/') ? selectedImage.url : '/uploads/' + selectedImage.url}`;
    });

    // Store original dimensions
    setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });

    // Calculate target dimensions considering aspect ratio
    let targetWidth = resizeSettings.width;
    let targetHeight = resizeSettings.height;

    if (resizeSettings.maintainAspect) {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      if (targetWidth / targetHeight > aspectRatio) {
        targetWidth = targetHeight * aspectRatio;
      } else {
        targetHeight = targetWidth / aspectRatio;
      }
    } else {
      // For exact resize (non-maintain aspect), calculate smart crop area
      const smartCropArea = calculateSmartCrop(img.naturalWidth, img.naturalHeight, targetWidth, targetHeight);
      setSmartCrop(smartCropArea);
      setShowSmartCrop(true);
    }

    // Calculate preview size to fit in container (max 400x250)
    const maxPreviewWidth = 400;
    const maxPreviewHeight = 250;
    const previewAspectRatio = targetWidth / targetHeight;
    
    let previewWidth = Math.min(targetWidth, maxPreviewWidth);
    let previewHeight = Math.min(targetHeight, maxPreviewHeight);
    
    if (previewWidth / previewHeight > previewAspectRatio) {
      previewWidth = previewHeight * previewAspectRatio;
    } else {
      previewHeight = previewWidth / previewAspectRatio;
    }

    // Set canvas size to show exact aspect ratio
    canvas.width = Math.round(previewWidth);
    canvas.height = Math.round(previewHeight);
    canvas.style.width = `${Math.round(previewWidth)}px`;
    canvas.style.height = `${Math.round(previewHeight)}px`;

    // Draw the preview
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (showSmartCrop && !resizeSettings.maintainAspect) {
      // Draw the smart crop preview - crop first, then resize
      const scaleX = previewWidth / smartCrop.width;
      const scaleY = previewHeight / smartCrop.height;
      
      ctx.drawImage(
        img,
        smartCrop.x, smartCrop.y, smartCrop.width, smartCrop.height, // Source crop area
        0, 0, canvas.width, canvas.height // Destination (full canvas)
      );
    } else {
      // Regular resize preview
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // Update preview dimensions with actual target dimensions
    setPreviewDimensions({ 
      width: Math.round(targetWidth), 
      height: Math.round(targetHeight) 
    });
  }, [selectedImage, resizeSettings, calculateSmartCrop, showSmartCrop, smartCrop]);

  // Update preview when resize settings change
  useEffect(() => {
    if (selectedImage && activeTab === 'resize') {
      updateResizePreview();
    }
  }, [selectedImage, resizeSettings, activeTab, updateResizePreview]);

  return (
    <div className="image-manager">
      <style dangerouslySetInnerHTML={{
        __html: `
          .react-crop-container .ReactCrop {
            position: relative !important;
            display: inline-block !important;
            cursor: crosshair !important;
            max-width: 100% !important;
          }
          
          .react-crop-container .ReactCrop__crop-selection {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            box-sizing: border-box !important;
            border: 3px solid #007bff !important;
            border-radius: 4px !important;
            box-shadow: inset 0 0 0 999px rgba(0, 0, 0, 0.4) !important;
            outline: rgba(255, 255, 255, 0.8) solid 2px !important;
            background: transparent !important;
            z-index: 1000 !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle {
            position: absolute !important;
            width: 14px !important;
            height: 14px !important;
            background: #007bff !important;
            border: 3px solid white !important;
            border-radius: 50% !important;
            box-sizing: border-box !important;
            cursor: pointer !important;
            z-index: 1001 !important;
            transform: translate(-50%, -50%) !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle:hover {
            background: #0056b3 !important;
            transform: translate(-50%, -50%) scale(1.2) !important;
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.5) !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle--n {
            top: 0% !important;
            left: 50% !important;
            cursor: ns-resize !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle--ne {
            top: 0% !important;
            left: 100% !important;
            cursor: nesw-resize !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle--e {
            top: 50% !important;
            left: 100% !important;
            cursor: ew-resize !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle--se {
            top: 100% !important;
            left: 100% !important;
            cursor: nwse-resize !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle--s {
            top: 100% !important;
            left: 50% !important;
            cursor: ns-resize !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle--sw {
            top: 100% !important;
            left: 0% !important;
            cursor: nesw-resize !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle--w {
            top: 50% !important;
            left: 0% !important;
            cursor: ew-resize !important;
          }
          
          .react-crop-container .ReactCrop__drag-handle--nw {
            top: 0% !important;
            left: 0% !important;
            cursor: nwse-resize !important;
          }
          
          .react-crop-container .ReactCrop__rule-of-thirds-vt::before,
          .react-crop-container .ReactCrop__rule-of-thirds-vt::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 33.333% !important;
            right: 66.666% !important;
            border-left: 1px dashed rgba(255, 255, 255, 0.8) !important;
            border-right: 1px dashed rgba(255, 255, 255, 0.8) !important;
          }
          
          .react-crop-container .ReactCrop__rule-of-thirds-hz::before,
          .react-crop-container .ReactCrop__rule-of-thirds-hz::after {
            content: '' !important;
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            top: 33.333% !important;
            bottom: 66.666% !important;
            border-top: 1px dashed rgba(255, 255, 255, 0.8) !important;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.8) !important;
          }
        `
      }} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[]}
      >
        <SortableContext 
          items={images.map(img => img.id)} 
          strategy={horizontalListSortingStrategy}
          id="image-sortable-context" // Add explicit ID
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {images.map((image, index) => (
              <SortableImage
                key={`${image.id}-${index}`} // Force re-render when order changes
                image={image}
                onSelect={(img) => {
                  setSelectedImage(img);
                  // Reset crop to default when opening a new image
                  setCrop({
                    unit: '%',
                    width: 90,
                    height: 90,
                    x: 5,
                    y: 5
                  });
                  // Reset preview dimensions to trigger fresh calculation
                  setPreviewDimensions({ width: 0, height: 0 });
                  setOriginalDimensions({ width: 0, height: 0 });
                  setShowSmartCrop(false);
                  setSmartCrop({
                    unit: 'px',
                    width: 0,
                    height: 0,
                    x: 0,
                    y: 0
                  });
                }}
                onSetFavorite={async (id) => {
                  const targetImage = images.find(img => img.id === id);
                  if (!targetImage) return;
                  
                  // If we have a propertyId and this is a real image (not just uploaded), use the backend
                  if (propertyId && !id.toString().startsWith('uploaded-')) {
                    try {
                      const response = await fetch(`http://localhost:3000/v1/properties/${propertyId}/images/${id}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ isFavorite: !targetImage.isFavorite }),
                      });

                      if (!response.ok) {
                        console.error('Failed to update favorite status:', response.statusText);
                        toast.current?.show({
                          severity: 'error',
                          summary: 'Error',
                          detail: 'Failed to update favorite status',
                          life: 3000
                        });
                        return;
                      }

                      // Update local state: set this as favorite and remove favorite from all others
                      setImages(images.map(img => ({
                        ...img,
                        isFavorite: img.id === id ? !targetImage.isFavorite : false
                      })));
                    } catch (error) {
                      console.error('Error updating favorite status:', error);
                      toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error updating favorite status',
                        life: 3000
                      });
                    }
                  } else {
                    // For local images or when no propertyId, just update local state
                    setImages(images.map(img => ({
                      ...img,
                      isFavorite: img.id === id ? !targetImage.isFavorite : false
                    })));
                  }
                }}
                onDelete={(id) => {
                  setImages(images.filter(img => img.id !== id));
                }}
                propertyId={propertyId}
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay style={{ zIndex: 99999 }}>
          {activeId ? (
            <div style={{
              position: 'relative',
              border: '2px solid #007bff',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              opacity: 0.8,
              transform: 'rotate(5deg)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}>
              {(() => {
                const draggedImage = images.find(img => img.id === activeId);
                return draggedImage ? (
                  <img 
                    src={`http://localhost:3000${draggedImage.url.startsWith('/uploads/') ? draggedImage.url : '/uploads/' + draggedImage.url}`}
                    alt="Dragging" 
                    style={{ 
                      width: "200px",
                      height: "150px",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                ) : null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Upload Zone */}
      {/* <div {...getRootProps()} style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#fafafa',
        marginBottom: '20px'
      }}>
        <input {...getInputProps()} />
        <p style={{ margin: '0', color: '#666' }}>
          Drag & drop images here, or click to select
        </p>
      </div> */}

      {/* Crop Modal */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '95vw',
            maxHeight: '95vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e1e5e9',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                Edit Image
              </h3>
              
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px'
              }}>
                <button
                  onClick={() => setActiveTab('crop')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: activeTab === 'crop' ? '#007bff' : '#e9ecef',
                    color: activeTab === 'crop' ? 'white' : '#495057',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Crop
                </button>
                <button
                  onClick={() => setActiveTab('resize')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: activeTab === 'resize' ? '#007bff' : '#e9ecef',
                    color: activeTab === 'resize' ? 'white' : '#495057',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Resize
                </button>
              </div>
              
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '14px',
                color: '#6c757d'
              }}>
                {activeTab === 'crop' 
                  ? 'Drag the corners to adjust the crop area, then click Apply to save'
                  : 'Choose a preset size or enter custom dimensions to resize the image'
                }
              </p>
            </div>

            {/* Main Content Area */}
            {activeTab === 'crop' ? (
              /* Crop Area */
              <div style={{
                padding: '24px',
                backgroundColor: '#f8f9fa',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                maxHeight: '600px'
              }}>
                <div style={{
                  maxWidth: '800px',
                  maxHeight: '500px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  overflow: 'visible',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                  }}>
                    <ReactCrop 
                      crop={crop} 
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCrop(c)}
                      aspect={undefined}
                      minWidth={30}
                      minHeight={30}
                      ruleOfThirds={true}
                      className="react-crop-container"
                    >
                      <img 
                        src={`http://localhost:3000${selectedImage.url.startsWith('/uploads/') ? selectedImage.url : '/uploads/' + selectedImage.url}`}
                        alt="Crop preview" 
                        style={{ 
                          maxWidth: '600px',
                          maxHeight: '400px',
                          display: 'block',
                          objectFit: 'contain',
                          border: '1px solid #ddd'
                        }}
                        onLoad={() => {
                          // Force crop initialization after image loads
                          setTimeout(() => {
                            setCrop({
                              unit: '%',
                              width: 80,
                              height: 80,
                              x: 10,
                              y: 10
                            });
                          }, 100);
                        }}
                      />
                    </ReactCrop>
                  </div>
                </div>
              </div>
            ) : (
              /* Resize Area */
              <div style={{
                padding: '24px',
                backgroundColor: '#f8f9fa',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                minHeight: '400px'
              }}>
                {/* Unified Preview with Smart Crop Overlay */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '20px',
                  minHeight: '350px'
                }}>
                  {/* Preview Info */}
                  <div style={{
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#495057'
                  }}>
                    {originalDimensions.width > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Original:</strong> {originalDimensions.width} × {originalDimensions.height} pixels
                      </div>
                    )}
                    <div style={{ 
                      color: '#007bff', 
                      fontWeight: 'bold',
                      fontSize: '15px'
                    }}>
                      <strong>Target:</strong> {previewDimensions.width} × {previewDimensions.height} pixels
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                      Quality: {resizeSettings.quality}% • Mode: {resizeSettings.maintainAspect ? 'Keep aspect ratio' : 'Exact size (with smart crop)'}
                    </div>
                    {showSmartCrop && !resizeSettings.maintainAspect && (
                      <div style={{ fontSize: '12px', color: '#856404', marginTop: '4px', fontWeight: 'bold' }}>
                        🎯 Smart crop active - drag to adjust crop area
                      </div>
                    )}
                  </div>
                  
                  {/* Unified Preview Area */}
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '250px',
                    maxWidth: '500px',
                    width: '100%'
                  }}>
                    {showSmartCrop && !resizeSettings.maintainAspect ? (
                      /* Smart Crop Interactive Preview */
                      <div style={{ position: 'relative' }}>
                        <ReactCrop
                          crop={smartCrop}
                          onChange={(c) => setSmartCrop(c)}
                          onComplete={(c) => setSmartCrop(c)}
                          aspect={resizeSettings.width / resizeSettings.height}
                          minWidth={50}
                          minHeight={50}
                          ruleOfThirds={true}
                          className="react-crop-container"
                        >
                          <img
                            ref={smartCropImageRef}
                            src={`http://localhost:3000${selectedImage.url.startsWith('/uploads/') ? selectedImage.url : '/uploads/' + selectedImage.url}`}
                            alt="Smart crop preview"
                            style={{
                              maxWidth: '450px',
                              maxHeight: '350px',
                              objectFit: 'contain',
                              border: '2px solid #ffc107',
                              borderRadius: '4px'
                            }}
                            onLoad={() => {
                              // Recalculate smart crop when image loads
                              if (originalDimensions.width > 0) {
                                const newSmartCrop = calculateSmartCrop(
                                  originalDimensions.width,
                                  originalDimensions.height,
                                  resizeSettings.width,
                                  resizeSettings.height
                                );
                                setSmartCrop(newSmartCrop);
                              }
                            }}
                          />
                        </ReactCrop>
                        
                        {/* Smart Crop Info Overlay */}
                        <div style={{
                          position: 'absolute',
                          top: '-40px',
                          left: '0',
                          right: '0',
                          textAlign: 'center',
                          backgroundColor: 'rgba(255, 193, 7, 0.9)',
                          color: '#000',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          Crop: {Math.round(smartCrop.width)} × {Math.round(smartCrop.height)} → Resize: {resizeSettings.width} × {resizeSettings.height}
                        </div>
                      </div>
                    ) : (
                      /* Regular Canvas Preview */
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <canvas
                          ref={previewCanvasRef}
                          style={{
                            border: '2px solid #007bff',
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
                            backgroundColor: '#f8f9fa'
                          }}
                        />
                        {originalDimensions.width > 0 && previewDimensions.width > 0 && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#6c757d',
                            textAlign: 'center'
                          }}>
                            {previewDimensions.width > originalDimensions.width || previewDimensions.height > originalDimensions.height ? (
                              <span style={{ color: '#28a745' }}>↗ Enlarging image</span>
                            ) : previewDimensions.width < originalDimensions.width || previewDimensions.height < originalDimensions.height ? (
                              <span style={{ color: '#ffc107' }}>↘ Reducing image</span>
                            ) : (
                              <span style={{ color: '#6c757d' }}>→ Same size</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Resize Controls */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>Resize Options</h4>
                  
                  {/* Preset Sizes */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Preset Sizes:
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { name: 'Small', width: 400, height: 300 },
                        { name: 'Medium', width: 800, height: 600 },
                        { name: 'Large', width: 1200, height: 900 },
                        { name: 'HD', width: 1920, height: 1080 },
                        { name: 'Square SM', width: 400, height: 400 },
                        { name: 'Square LG', width: 800, height: 800 }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setResizeSettings(prev => ({
                              ...prev,
                              width: preset.width,
                              height: preset.height
                            }));
                            setPreviewDimensions({ width: preset.width, height: preset.height });
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: resizeSettings.width === preset.width && resizeSettings.height === preset.height 
                              ? '#007bff' : '#e9ecef',
                            color: resizeSettings.width === preset.width && resizeSettings.height === preset.height 
                              ? 'white' : '#495057',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {preset.name}<br/>
                          <small>{preset.width}×{preset.height}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Dimensions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto 1fr', gap: '12px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={resizeSettings.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 800;
                          setResizeSettings(prev => ({
                            ...prev,
                            width: newWidth
                          }));
                          setPreviewDimensions({ width: newWidth, height: resizeSettings.height });
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={resizeSettings.height}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 600;
                          setResizeSettings(prev => ({
                            ...prev,
                            height: newHeight
                          }));
                          setPreviewDimensions({ width: resizeSettings.width, height: newHeight });
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={resizeSettings.maintainAspect}
                          onChange={(e) => {
                            const maintainAspect = e.target.checked;
                            setResizeSettings(prev => ({
                              ...prev,
                              maintainAspect
                            }));
                            // Show/hide smart crop based on maintain aspect setting
                            setShowSmartCrop(!maintainAspect);
                          }}
                        />
                        Keep aspect ratio
                      </label>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                        Quality (%)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={resizeSettings.quality}
                        onChange={(e) => setResizeSettings(prev => ({
                          ...prev,
                          quality: parseInt(e.target.value)
                        }))}
                        style={{ width: '100%' }}
                      />
                      <span style={{ fontSize: '12px', color: '#6c757d' }}>{resizeSettings.quality}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Bar */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e1e5e9',
              borderBottom: '1px solid #e1e5e9'
            }}>
              <div style={{
                display: 'flex',
                gap: '20px',
                fontSize: '13px',
                color: '#6c757d'
              }}>
                {activeTab === 'crop' ? (
                  <>
                    <span>
                      <strong>Width:</strong> {Math.round(crop.width || 0)}{crop.unit}
                    </span>
                    <span>
                      <strong>Height:</strong> {Math.round(crop.height || 0)}{crop.unit}
                    </span>
                    <span>
                      <strong>X:</strong> {Math.round(crop.x || 0)}{crop.unit}
                    </span>
                    <span>
                      <strong>Y:</strong> {Math.round(crop.y || 0)}{crop.unit}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      <strong>New Size:</strong> {resizeSettings.width}×{resizeSettings.height}px
                    </span>
                    <span>
                      <strong>Aspect Ratio:</strong> {resizeSettings.maintainAspect ? 'Maintained' : 'Custom'}
                    </span>
                    <span>
                      <strong>Quality:</strong> {resizeSettings.quality}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Footer with Actions */}
            <div style={{
              padding: '20px 24px',
              backgroundColor: 'white',
              display: 'flex',
              gap: '12px',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* Preset buttons - only show for crop mode */}
              {activeTab === 'crop' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setCrop({
                      unit: '%',
                      width: 100,
                      height: 100,
                      x: 0,
                      y: 0
                    })}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#e9ecef',
                      color: '#495057',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    title="Select entire image"
                  >
                    Full
                  </button>
                  <button 
                    onClick={() => setCrop({
                      unit: '%',
                      width: 80,
                      height: 80,
                      x: 10,
                      y: 10
                    })}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#e9ecef',
                      color: '#495057',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    title="80% centered crop"
                  >
                    Center
                  </button>
                  <button 
                    onClick={() => setCrop({
                      unit: '%',
                      width: 90,
                      height: 90,
                      x: 5,
                      y: 5
                    })}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: '1px solid #17a2b8',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    title="Reset to default"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Spacer for resize mode */}
              {activeTab === 'resize' && <div></div>}

              {/* Main action buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedImage(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'white',
                    color: '#6c757d',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#adb5bd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={activeTab === 'crop' ? handleCropComplete : handleResizeComplete}
                  disabled={activeTab === 'crop' && (!crop.width || !crop.height)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: (activeTab === 'crop' && (!crop.width || !crop.height)) ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (activeTab === 'crop' && (!crop.width || !crop.height)) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: (activeTab === 'crop' && (!crop.width || !crop.height)) ? 'none' : '0 2px 4px rgba(40, 167, 69, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab === 'resize' || (crop.width && crop.height)) {
                      e.currentTarget.style.backgroundColor = '#218838';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab === 'resize' || (crop.width && crop.height)) {
                      e.currentTarget.style.backgroundColor = '#28a745';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(40, 167, 69, 0.3)';
                    }
                  }}
                >
                  {activeTab === 'crop' ? 'Apply Crop' : 'Apply Resize'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notifications */}
      <Toast ref={toast} />
      
      {/* Confirm dialog for delete operations */}
      <ConfirmDialog />
    </div>
  );
}

function SortableImage({ 
  image, 
  onSelect, 
  onSetFavorite, 
  onDelete, 
  propertyId 
}: {
  image: Image;
  onSelect: (img: Image) => void;
  onSetFavorite: (id: string) => Promise<void> | void;
  onDelete: (id: string) => void;
  propertyId?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: image.id,
    disabled: false, // Explicitly enable
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle star click
  const handleStarClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onSetFavorite(image.id);
  }, [image.id, onSetFavorite]);

  // Handle edit click
  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(image);
  }, [image, onSelect]);

  // Handle delete click
  const handleDeleteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    confirmDialog({
      message: 'Are you sure you want to delete this image?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          // If the image has a backend ID and we have a propertyId, try to delete it from the server
          if (image.id && !image.id.toString().startsWith('uploaded-') && propertyId) {
            const deleteUrl = `http://localhost:3000/v1/properties/${propertyId}/images/${image.id}`;
            
            const response = await fetch(deleteUrl, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Failed to delete image from server:', response.statusText);
              
              // Show user-friendly error message but still continue with local removal
              // Note: Since this is inside SortableImage, we need to access the parent's toast
              // For now, we'll use a less optimal approach but functional
              const event = new CustomEvent('showToast', {
                detail: {
                  severity: 'warn',
                  summary: 'Warning',
                  detail: `Could not delete image from server (${response.status}: ${response.statusText}). The image will be removed from the interface but may still exist on the server.`,
                  life: 5000
                }
              });
              window.dispatchEvent(event);
            } else {
              const event = new CustomEvent('showToast', {
                detail: {
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Image deleted successfully!',
                  life: 3000
                }
              });
              window.dispatchEvent(event);
            }
          }
          
          // Remove from local state regardless of server response
          onDelete(image.id);
        } catch (error) {
          console.error('Error deleting image:', error);
          const event = new CustomEvent('showToast', {
            detail: {
              severity: 'error',
              summary: 'Error',
              detail: `Error deleting image: ${error instanceof Error ? error.message : 'Unknown error'}`,
              life: 5000
            }
          });
          window.dispatchEvent(event);
          // Still remove from local state even if server delete fails
          onDelete(image.id);
        }
      }
    });
  }, [image.id, onDelete, propertyId]);

  return (
    <div 
      ref={setNodeRef} 
      {...attributes}
      {...listeners}
      style={{
        ...style,
        position: 'relative',
        border: `2px solid ${isOver ? '#007bff' : '#e1e1e1'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'all 0.2s ease',
        boxShadow: transform ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onDragStart={(e) => {
        // Prevent native drag
        e.preventDefault();
      }}
    >
      {/* Image content */}
      <div
        style={{
          position: 'relative',
          pointerEvents: 'none', // Prevent image from interfering with drag
        }}
      >
        <img 
          src={`http://localhost:3000${image.url.startsWith('/uploads/') ? image.url : '/uploads/' + image.url}`}
          alt="Property" 
          style={{ 
            width: "100%",
            height: "150px",
            objectFit: "cover",
            display: "block"
          }}
          draggable={false}
        />
      </div>
      
      {/* Control buttons - NOT draggable */}
      <div 
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          gap: '6px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '6px',
          padding: '6px',
          pointerEvents: 'auto', // Re-enable pointer events for buttons
          zIndex: 20, // Higher than drag indicator
        }}
        onMouseDown={(e) => e.stopPropagation()} // Prevent drag on buttons
        onTouchStart={(e) => e.stopPropagation()} // Prevent drag on buttons for touch
        onClick={(e) => e.stopPropagation()} // Prevent container click on buttons
      >
        <button
          type="button"
          onClick={handleStarClick}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag
          onTouchStart={(e) => e.stopPropagation()} // Prevent drag on touch
          style={{
            background: image.isFavorite ? '#ffc107' : 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px 6px',
            color: image.isFavorite ? '#000' : '#333',
            minWidth: '28px',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="Toggle favorite"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = image.isFavorite ? '#ffca2c' : 'rgba(255, 255, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = image.isFavorite ? '#ffc107' : 'rgba(255, 255, 255, 0.8)';
          }}
        >
          {image.isFavorite ? '★' : '☆'}
        </button>
        <button 
          type="button"
          onClick={handleEditClick}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag
          onTouchStart={(e) => e.stopPropagation()} // Prevent drag on touch
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px 6px',
            color: '#333',
            minWidth: '28px',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="Edit image"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.color = '#007bff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.color = '#333';
          }}
        >
          ✎
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag
          onTouchStart={(e) => e.stopPropagation()} // Prevent drag on touch
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px 6px',
            color: '#dc3545',
            minWidth: '28px',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="Delete image"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.color = '#c82333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.color = '#dc3545';
          }}
        >
          🗑️
        </button>
      </div>
      
      {/* Favorite badge */}
      {image.isFavorite && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          backgroundColor: '#ffc107',
          color: '#000',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          FAVORITE
        </div>
      )}
    </div>
  );
}