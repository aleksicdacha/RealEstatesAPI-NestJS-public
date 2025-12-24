import { Dialog } from 'primereact/dialog';
import React, { useRef, useState, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import GoogleMapComponent from './wizard-steps/MapSelector';
import { Galleria } from 'primereact/galleria';
import ImageUploader from './wizard-steps/ImageUploader';
import PropertyForm from './wizard-steps/PropertyForm';
import { ImageManager } from './ImageManager';
import { propertyService } from '@/services/property.service';
import { Property, UpdatePropertyDto } from '@/services/property.service';

interface EditPropertyDialogProps {
  onCloseDialog: () => void;
  propertyData: Property;
  onSuccess?: () => void;
}

interface PropertyImage {
  id: string;
  url: string;
  displayUrl?: string;
  originalUrl?: string;
  isFavorite: boolean;
  order: number;
}

interface PropertyFormData {
  code: string;
  propertyType: string;
  status: string;
  roomStructure?: string;
  price: string | number;
  salePrice: string | number;
  bathrooms: string | number;
  address: string;
  neighborhood?: string;
  heating: string;
  area: string | number;
  constructionYear: string | number | null;
  floor: string | number;
  elevator: boolean;
  description: string;
  comment: string;
  additionalEquipment: string[];
  id: string;
  lat?: number;
  lon?: number;
  images?: PropertyImage[];
}

export default function EditPropertyDialog({ onCloseDialog, propertyData, onSuccess }: EditPropertyDialogProps) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<PropertyFormData>({
    id: propertyData.id,
    code: propertyData.code,
    propertyType: propertyData.propertyType,
    status: propertyData.status,
    roomStructure: propertyData.roomStructure || '',
    price: typeof propertyData.price === 'number' ? propertyData.price : parseFloat(propertyData.price) || '',
    salePrice: typeof propertyData.salePrice === 'number' ? propertyData.salePrice : parseFloat(propertyData.salePrice) || '',
    bathrooms: propertyData.bathrooms || '',
    address: propertyData.address,
    neighborhood: propertyData.neighborhood || '',
    heating: propertyData.heating || '',
    area: propertyData.area || '',
    constructionYear: propertyData.constructionYear || null,
    floor: propertyData.floor || '',
    elevator: propertyData.elevator || false,
    description: propertyData.description || '',
    comment: propertyData.comment || '',
    additionalEquipment: propertyData.additionalEquipment || [],
    lat: propertyData.lat,
    lon: propertyData.lon,
    images: propertyData.images?.map(img => ({
      ...img,
      // Clean URL - remove /uploads/ prefix if it exists, then add the correct base URL
      displayUrl: `http://localhost:3000${img.url.startsWith('/uploads/') ? img.url : '/uploads/' + img.url}`,
      originalUrl: img.url // Keep original for server communication
    })) || []
  });

  const [pictureEdit, setPictureEdit] = useState<boolean>(false);
  const [isLoadingNeighborhood, setIsLoadingNeighborhood] = useState(false);

  const toast = useRef<Toast>(null);
  const imageManagementRef = useRef<HTMLDivElement>(null);

  // Function to scroll to image management section
  const scrollToImageManagement = () => {
    setTimeout(() => {
      imageManagementRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100); // Small delay to ensure the section is rendered
  };

  const saveProperty = async () => {
    try {

      // Validate property ID
      if (!formData.id) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Property ID is missing. Cannot update property.',
        });
        return;
      }

      // Validate required fields
      if (!formData.price || isNaN(parseFloat(String(formData.price)))) {
        toast.current?.show({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Price is required and must be a valid number',
        });
        return;
      }

      // Prepare the update data including images
      // Note: code is immutable and cannot be updated
      const updateData: Partial<UpdatePropertyDto> = {
        description: formData.description || undefined,
        propertyType: formData.propertyType || undefined,
        status: formData.status || undefined,
        roomStructure: formData.roomStructure || undefined,
        price: parseFloat(String(formData.price)),
        salePrice: formData.salePrice ? parseFloat(String(formData.salePrice)) : undefined,
        area: formData.area ? parseFloat(String(formData.area)) : undefined,
        address: formData.address || undefined,
        neighborhood: formData.neighborhood || undefined,
        lat: formData.lat || undefined,
        lon: formData.lon || undefined,
        comment: (formData.comment && formData.comment.length >= 10) ? formData.comment : undefined, // Only send if at least 10 characters
        elevator: formData.elevator,
        additionalEquipment: formData.additionalEquipment || undefined,
        constructionYear: formData.constructionYear ? parseInt(String(formData.constructionYear)) : undefined,
        bathrooms: formData.bathrooms ? parseFloat(String(formData.bathrooms)) : undefined,
        floor: formData.floor ? parseInt(String(formData.floor)) : undefined,
        heating: formData.heating || undefined,
        images: formData.images?.map(img => ({
          id: img.id.startsWith('new-') ? undefined : img.id, // Don't send ID for new images
          url: img.url,
          isFavorite: img.isFavorite,
          order: img.order
        })) || undefined
      };

      // Remove undefined values to avoid sending them to the API
      const cleanedUpdateData: UpdatePropertyDto = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      ) as UpdatePropertyDto;

      await propertyService.updateProperty(formData.id, cleanedUpdateData);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Property updated successfully',
      });

      // Call success callback to refresh table
      onSuccess?.();

      setTimeout(() => {
        onCloseDialog();
      }, 500);

    } catch (error) {
      console.error('Failed to update property:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message || (error as Error)?.message || 'Failed to update property. Please try again.';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
      });
    }
  };

  const handleUploadImages = (imageData: { url: string }[]) => {
    
    // Update the formData with new images
    setFormData(prev => ({
      ...prev,
      images: [
        ...(prev.images || []),
        ...imageData.map((img, index) => ({
          id: `new-${Date.now()}-${index}`,
          url: img.url,
          isFavorite: false,
          order: (prev.images?.length || 0) + index + 1
        }))
      ]
    }));
    
    // Optionally close the picture edit mode after successful upload
    // setPictureEdit(false);
  }

  const handleImagesChange = useCallback((updatedImages: PropertyImage[]) => {
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
  }, []);

  const galeria = () => {
    if (!formData.images || formData.images.length === 0) {
      return <div>No images available</div>;
    }

    // Sort images by order to match ImageManager display order
    const sortedImages = [...formData.images].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Find the index of the favorite image
    const favoriteIndex = sortedImages.findIndex(img => img.isFavorite);
    const initialIndex = favoriteIndex !== -1 ? favoriteIndex : 0;

    return (
      <Galleria
        value={sortedImages}
        activeIndex={initialIndex}
        item={(item) => (
          <img
            src={`http://localhost:3000${item?.url.startsWith('/uploads/') ? item.url : '/uploads/' + item.url}`}
            alt="Uploaded Image"
            style={{ 
              width: '100%', 
              height: '300px',      // Increased height for larger display
              objectFit: 'cover' 
            }}
          />
        )}
        thumbnail={(item) => (
          <img
            src={`http://localhost:3000${item?.url.startsWith('/uploads/') ? item.url : '/uploads/' + item.url}`}
            alt="Uploaded Thumbnail"
            style={{ 
              width: '70px',        // Slightly larger thumbnails
              height: '50px',       // Proportionally larger
              objectFit: 'cover' 
            }}
          />
        )}
        showThumbnails={true}
        showIndicators={false}
        showItemNavigators={true}
        showThumbnailNavigators={false}
        numVisible={4}              // Show fewer thumbnails to fit better
        responsiveOptions={[
          {
            breakpoint: '1024px',
            numVisible: 3
          },
          {
            breakpoint: '768px',
            numVisible: 2
          },
          {
            breakpoint: '560px',
            numVisible: 1
          }
        ]}
        style={{ 
          maxWidth: '100%',
          height: '350px'           // Match the container height
        }}
        className="fixed-height-gallery"
      />
    )
  }

  const propertyDialogFooter = (
    <div>
      <Button label={tCommon('cancel')} icon="pi pi-times" onClick={() => onCloseDialog()} />
      <Button 
        label={isLoadingNeighborhood ? 'Učitavanje oblasti...' : tCommon('save')} 
        icon={isLoadingNeighborhood ? "pi pi-spin pi-spinner" : "pi pi-check"} 
        onClick={saveProperty}
        disabled={isLoadingNeighborhood}
      />
    </div>
  );

  return (
    <Dialog
      visible={true}
      style={{ width: '80%' }}
      header={t('editProperty')}
      modal
      className="p-fluid"
      footer={propertyDialogFooter}
      onHide={() => onCloseDialog()}
    >
      <Toast ref={toast} />

      <PropertyForm initialData={formData} onDataChange={setFormData} />

      {/* Client Information Section */}
      {propertyData.client && (
        <div style={{ 
          marginTop: '10px',
          marginBottom: '10px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="pi pi-user" style={{ fontSize: '18px', color: '#2196f3' }}></i>
            {t('clientInformation') || 'Client Information'}
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <div>
              <strong style={{ color: '#666', fontSize: '13px' }}>{t('name') || 'Name'}:</strong>
              <div style={{ marginTop: '4px', fontSize: '14px' }}>{propertyData.client.name}</div>
            </div>
            {propertyData.client.phone && (
              <div>
                <strong style={{ color: '#666', fontSize: '13px' }}>{t('phone') || 'Phone'}:</strong>
                <div style={{ marginTop: '4px', fontSize: '14px' }}>
                  <a href={`tel:${propertyData.client.phone}`} style={{ color: '#2196f3', textDecoration: 'none' }}>
                    {propertyData.client.phone}
                  </a>
                </div>
              </div>
            )}
            {propertyData.client.email && (
              <div>
                <strong style={{ color: '#666', fontSize: '13px' }}>{t('email') || 'Email'}:</strong>
                <div style={{ marginTop: '4px', fontSize: '14px' }}>
                  <a href={`mailto:${propertyData.client.email}`} style={{ color: '#2196f3', textDecoration: 'none' }}>
                    {propertyData.client.email}
                  </a>
                </div>
              </div>
            )}
            <div>
              <strong style={{ color: '#666', fontSize: '13px' }}>{t('transactionType') || 'Transaction'}:</strong>
              <div style={{ marginTop: '4px', fontSize: '14px' }}>
                {propertyData.client.transactionType === 'seller' && (t('sells') || 'Selling')}
                {propertyData.client.transactionType === 'buyer' && (t('buying') || 'Buying')}
                {propertyData.client.transactionType === 'renter' && (t('renting') || 'Renting')}
                {propertyData.client.transactionType === 'landlord' && (t('rentingOut') || 'Renting Out')}
              </div>
            </div>
            {propertyData.client.moneyAmount && (
              <div>
                <strong style={{ color: '#666', fontSize: '13px' }}>{t('budget') || 'Budget'}:</strong>
                <div style={{ marginTop: '4px', fontSize: '14px' }}>
                  {new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR' }).format(propertyData.client.moneyAmount)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
        <div style={{ 
          flex: '2',       // Takes 2/3 of the width
          minWidth: '0'    // Allow shrinking when needed
        }}>
          <GoogleMapComponent 
            lat={formData.lat} 
            lng={formData.lon} 
            onLocationChange={(lat: number, lng: number, address: string, neighborhood?: string) => {
              console.log('🏠 EditPropertyDialog received neighborhood:', neighborhood);
              setFormData(prev => ({
                ...prev,
                lat: lat,
                lon: lng,
                address: address || prev.address,
                neighborhood: neighborhood || prev.neighborhood
              }));
            }}
            onLoadingChange={(loading) => {
              console.log('📍 EditPropertyDialog loading state changed:', loading);
              setIsLoadingNeighborhood(loading);
            }}
            uuid="edit-dialog" 
          />
        </div>
        {!pictureEdit && (
          <div style={{ 
            flex: '1',       // Takes 1/3 of the width
            flexShrink: 0,   // Prevent shrinking
            paddingTop: '60px'
          }}>
            <div style={{ 
              height: '540px',  // Match map height (500px) + header spacing (40px)
              overflow: 'auto',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '16px',
              paddingBottom: '10px',
              backgroundColor: '#fafafa',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginTop: '-24px'
            }}>
            {formData.images && formData.images.length > 0 ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%'
              }}>
                <h3 style={{ marginTop: '0', marginBottom: '16px' }}>Uploaded Images</h3>
                <div style={{ 
                  flex: '1',
                  marginBottom: '0',
                  minHeight: '440px'  // Adjusted to match new container height
                }}>
                  {galeria()}
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <Button
                    label={t('editImages')}
                    icon="pi pi-pencil"
                    className="p-button-success"
                    onClick={() => {
                      setPictureEdit(true);
                      scrollToImageManagement();
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
              }}>
                <h3 style={{ marginTop: '0', marginBottom: '16px' }}>No Images Uploaded</h3>
                <p style={{ marginBottom: '20px', color: '#666' }}>This property doesn&apos;t have any images yet.</p>
                <Button
                  label={t('uploadImages')}
                  icon="pi pi-camera"
                  className="p-button-primary"
                  onClick={() => {
                    setPictureEdit(true);
                    scrollToImageManagement();
                  }}
                />
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {pictureEdit &&
        (
          <>
            <div ref={imageManagementRef} style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>Image Management</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <h4>Upload New Images</h4>
                <ImageUploader propertyId={formData.id} propertyCode={formData.code} onNext={handleUploadImages} />
              </div>

              {formData.images && formData.images.length > 0 && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <h4>Current Images Preview</h4>
                    <div style={{ 
                      maxWidth: '600px',  // Constrain gallery width
                      margin: '0 auto'    // Center the gallery
                    }}>
                      {galeria()}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px', marginTop: '80px' }}>
                    <h4>Manage Images (Drag to Reorder, Click Controls to Edit)</h4>
                    <ImageManager
                      initialImages={formData.images || []}
                      onImagesChange={handleImagesChange}
                      propertyId={formData.id}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  label={t('done')}
                  icon="pi pi-check"
                  className="p-button-success"
                  onClick={() => setPictureEdit(false)}
                />
                <Button
                  label={tCommon('cancel')}
                  icon="pi pi-times"
                  className="p-button-secondary"
                  onClick={() => setPictureEdit(false)}
                />
              </div>
            </div>
          </>
        )}
    </Dialog>
  );
}