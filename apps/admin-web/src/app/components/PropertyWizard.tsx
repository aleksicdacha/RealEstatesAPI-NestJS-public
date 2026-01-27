import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useTranslations } from 'next-intl';
import PropertyForm, { PropertyFormRef } from './wizard-steps/PropertyForm';
import ClientForm, { ClientFormRef } from './wizard-steps/ClientForm';
import ImageUploader from './wizard-steps/ImageUploader';
import MapSelector from './wizard-steps/MapSelector';
import { clientService, Client } from '@/services/client.service';
import { apiClient } from '@/lib/api-client';

interface PropertyFormData {
  code: string;
  propertyType: string;
  status: string;
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
  roomStructure?: string;
  contractNumber?: string;
  cadastralParcel?: string;
  cadastralMunicipality?: string;
  orientation?: string;
  youtubeUrl?: string;
  specialOffer?: string | number;
}

interface ClientFormData {
  name: string;
  email: string;
  status: string;
  transactionType: string;
  paymentType: string;
  address: string;
  phone: string;
  moneyAmount: string | number;
  comment: string;
  ownerJmbg?: string;
  ownerBirthplace?: string;
  ownerIdCardNumber?: string;
  ownerIdCardIssuePlace?: string;
  representative?: {
    name: string;
    address: string;
    phone: string;
    jmbg: string;
    birthplace: string;
    idCardNumber: string;
    idCardIssuePlace: string;
  };
}

interface PropertyWizardProps {
  onCompleted?: () => void;
}

const PropertyWizard = ({ onCompleted }: PropertyWizardProps) => {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const [activeIndex, setActiveIndex] = useState(0);
  const [propertyUUID, setPropertyUUID] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNeighborhood, setIsLoadingNeighborhood] = useState(false);
  const propertyFormRef = useRef<PropertyFormRef>(null);
  const clientFormRef = useRef<ClientFormRef>(null);
  const toast = useRef<Toast>(null);
  const [images, setImages] = useState<Array<{ url: string; isFavorite?: boolean; order?: number }>>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Pre-load clients for better UX
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // Validation states for each step
  const [isPropertyFormValid, setIsPropertyFormValid] = useState(false);
  const [isClientFormValid, setIsClientFormValid] = useState(false);
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [areImagesUploaded, setAreImagesUploaded] = useState(false);
  
  const [propertyData, setPropertyData] = useState<PropertyFormData>({
    code: '',
    propertyType: '',
    status: 'active',
    price: '' as string | number,
    salePrice: '' as string | number,
    bathrooms: '' as string | number,
    address: '',
    heating: '',
    area: '' as string | number,
    constructionYear: '' as string | number | null,
    floor: '' as string | number,
    elevator: false,
    description: '',
    comment: '',
    additionalEquipment: [],
    id: '' as string,
    roomStructure: '',
    contractNumber: '',
    cadastralParcel: '',
    cadastralMunicipality: '',
    orientation: '',
    youtubeUrl: '',
    specialOffer: '',
  });

  const [clientData, setClientData] = useState<ClientFormData>({
    name: '',
    email: '',
    status: 'active',
    transactionType: 'seller',
    paymentType: 'cash',
    address: '',
    phone: '',
    moneyAmount: '',
    comment: '',
    ownerJmbg: '',
    ownerBirthplace: '',
    ownerIdCardNumber: '',
    ownerIdCardIssuePlace: '',
    representative: undefined,
  });

  const steps = [
    { label: t('propertyDetails') },
    { label: t('clientDetails') },
    { label: t('setLocation') },
    { label: t('uploadImages') },
  ];

  // Eager load clients on component mount for better UX
  useEffect(() => {
    const loadClients = async () => {
      setLoadingClients(true);
      try {
        // Use backend filter to get only clients without property
        const clients = await clientService.getAvailableClients();
        setAvailableClients(clients);
      } catch (error) {
        console.error('Failed to pre-load clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };
    
    loadClients();
  }, []);

  // Validation functions for each step
  const validatePropertyForm = () => {
    const requiredFields: (keyof PropertyFormData)[] = ['code', 'propertyType', 'price', 'area', 'address'];
    const isValid = requiredFields.every(field => {
      const value = propertyData[field];
      return value && value.toString().trim() !== '';
    });
    setIsPropertyFormValid(isValid);
    return isValid;
  };

  const validateClientForm = () => {
    const requiredFields: (keyof ClientFormData)[] = ['name', 'email', 'address'];
    const isValid = requiredFields.every(field => {
      const value = clientData[field];
      return value && value.toString().trim() !== '';
    });
    setIsClientFormValid(isValid);
    return isValid;
  };

  const validateLocation = () => {
    const isValid = location !== null && location.lat !== undefined && location.lng !== undefined;
    setIsLocationValid(isValid);
    return isValid;
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (activeIndex) {
      case 0: return isPropertyFormValid;
      case 1: return isClientFormValid;
      case 2: return isLocationValid;
      case 3: return true; // Images are optional
      default: return false;
    }
  };

  // Validate forms when data changes
  useEffect(() => {
    validatePropertyForm();
  }, [propertyData]);

  useEffect(() => {
    validateClientForm();
  }, [clientData]);

  useEffect(() => {
    validateLocation();
  }, [location]);

  // Memoized callbacks to prevent infinite re-renders
  const handlePropertyDataChange = useCallback((data: PropertyFormData) => {
    setPropertyData(data);
  }, []);

  const handleClientDataChange = useCallback((data: ClientFormData) => {
    setClientData(data);
  }, []);

  const moveToNextStep = () => {
    if (activeIndex === 0) {
      // Trigger form validation/submission for PropertyForm
      const result = propertyFormRef.current?.validateAndGetData();
      if (!result?.isValid) return; // Block navigation if invalid
    }
    if (activeIndex === 1) {
      // Trigger form validation/submission for PropertyForm
      const isValid = clientFormRef.current?.submitForm();
      if (!isValid) return; // Block navigation if invalid
    }
    setActiveIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate required data before submission
      if (!propertyUUID) {
        throw new Error('Property UUID is missing. Please go back to the first step.');
      }

      if (!propertyData.code) {
        throw new Error('Property code is missing. Please fill in the property form.');
      }

      if (!areImagesUploaded) {
        throw new Error('Please upload at least one image before finishing.');
      }

      const propertyPayload = {
        "id": propertyUUID,
        "code": propertyData.code,
        "propertyType": propertyData.propertyType,
        "status": propertyData.status,
        "price": +propertyData.price,
        "salePrice": propertyData.salePrice ? +propertyData.salePrice : null,
        "bathrooms": propertyData.bathrooms ? propertyData.bathrooms : null,
        "address":propertyData.address,
        "neighborhood": propertyData.neighborhood ? propertyData.neighborhood : null,
        "lat": location?.lat ? location.lat : null,
        "lon": location?.lng ? location.lng : null,
        "heating": propertyData.heating ? propertyData.heating : null,
        "area": propertyData.area ? propertyData.area : null,
        "constructionYear": propertyData.constructionYear ? propertyData.constructionYear : null,
        "floor": propertyData.floor ? propertyData.floor : null,
        "elevator": propertyData.elevator,
        "description": propertyData.description ? propertyData.description : null,
        "comment": propertyData.comment ? propertyData.comment : null,
        "additionalEquipment": propertyData.additionalEquipment ? propertyData.additionalEquipment : [],
        "roomStructure": propertyData.roomStructure ? propertyData.roomStructure : null,
        "contractNumber": propertyData.contractNumber ? propertyData.contractNumber : null,
        "cadastralParcel": propertyData.cadastralParcel ? propertyData.cadastralParcel : null,
        "cadastralMunicipality": propertyData.cadastralMunicipality ? propertyData.cadastralMunicipality : null,
        "orientation": propertyData.orientation ? propertyData.orientation : null,
        "youtubeUrl": propertyData.youtubeUrl ? propertyData.youtubeUrl : null,
        "specialOffer": propertyData.specialOffer ? +propertyData.specialOffer : null,
      };

      const clientPayload = {
        "name": clientData.name,
        "email": clientData.email,
        "status": clientData.status,
        "transactionType": clientData.transactionType,
        "paymentType": clientData.paymentType,
        "address": clientData.address,
        "phone": clientData.phone,
        "moneyAmount": +clientData.moneyAmount,
        "comment": clientData.comment ? clientData.comment : null,
        "property": propertyUUID,
        "ownerJmbg": clientData.ownerJmbg || null,
        "ownerBirthplace": clientData.ownerBirthplace || null,
        "ownerIdCardNumber": clientData.ownerIdCardNumber || null,
        "ownerIdCardIssuePlace": clientData.ownerIdCardIssuePlace || null,
        "representative": clientData.representative || null,
      };





      // Step 1: Save Property
      try {
        await apiClient.post('/properties', propertyPayload);

        // Step 2: Save Client
        await apiClient.post('/clients', clientPayload);

        // Step 3: Associate uploaded images with the property
        if (images && images.length > 0) {
          // Format images properly with url, isFavorite, and order
          const formattedImages = images.map((img, index) => ({
            url: img.url,
            isFavorite: index === 0, // First image is favorite
            order: index + 1 // Order starts from 1
          }));

          const imagesPayload = { images: formattedImages };

          try {
            await apiClient.put(`/properties/${propertyUUID}`, imagesPayload);
          } catch (imageError) {
            console.warn('Failed to associate images with property, but property was created successfully', imageError);
          }
        }
      } catch (apiError: unknown) {
        // Handle API errors from property or client creation
        const errorMessage = apiError instanceof Error ? apiError.message : 'Failed to create property or client';
        throw new Error(errorMessage);
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Property created successfully!',
        life: 3000
      });
      
      // Close the dialog/wizard immediately
      if (onCompleted) {
        onCompleted();
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Failed to create property',
        life: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <Steps model={steps}
             activeIndex={activeIndex}
             onSelect={(e) => setActiveIndex(e.index)}
      />
      <div className="p-mt-4">
        {activeIndex === 0 && (
          <PropertyForm
            ref={propertyFormRef} // Attach ref
            initialData={propertyData}
            onNext={(data: PropertyFormData) => {
              setPropertyData(data);
              setActiveIndex(0);
            }}
            onDataChange={handlePropertyDataChange}
            onUUIDGenerated={setPropertyUUID}
          />
        )}
        {activeIndex === 1 && (
          <ClientForm
            ref={clientFormRef} // Attach ref
            initialData={clientData}
            uuid={propertyUUID}
            availableClients={availableClients}
            loadingClients={loadingClients}
            onNext={(data: ClientFormData) => {
              setClientData(data);
              setActiveIndex(1);
            }}
            onDataChange={handleClientDataChange}
            onBack={() => setActiveIndex(0)}
          />
        )}
        {activeIndex === 2 && (
          <MapSelector
            uuid={propertyUUID}
            onLocationChange={(lat: number, lng: number, address: string, neighborhood?: string) => {
              console.log('🏠 PropertyWizard: Received location change');
              console.log('  - lat:', lat);
              console.log('  - lng:', lng);
              console.log('  - address:', address);
              console.log('  - neighborhood:', neighborhood);
              
              setLocation({ lat, lng });
              setPropertyData(prev => {
                const updated = { 
                  ...prev, 
                  address,
                  neighborhood 
                };
                console.log('🏠 PropertyWizard: Updated propertyData:', updated);
                return updated;
              });
              validateLocation();
            }}
            onLoadingChange={(loading: boolean) => {
              console.log('🏠 PropertyWizard: Loading state changed:', loading);
              setIsLoadingNeighborhood(loading);
            }}
            lat={location?.lat}
            lng={location?.lng}
          />
        )}
        {activeIndex === 3 && (
          <ImageUploader
            propertyId={propertyUUID}
            propertyCode={propertyData.code}
            onNext={(imageData: { url: string }[]) => {
              setImages(imageData);
              setAreImagesUploaded(imageData && imageData.length > 0);
            }}
          />
        )}
      </div>
      <div className="p-mt-4 pt-4 pl-3">
        {activeIndex > 0 && (
          <Button
            label={tCommon('back')}
            icon="pi pi-arrow-left"
            className="p-button-secondary half-width-btn"
            onClick={handleBack}
          />
        )}
        {activeIndex < steps.length - 1 && (
          <Button
            label={isLoadingNeighborhood ? 'Učitavanje oblasti...' : tCommon('next')}
            icon={isLoadingNeighborhood ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
            className={activeIndex === 0 ? 'p-button-primary' : 'p-button-primary ml-2 half-width-btn'}
            onClick={moveToNextStep}
            disabled={!isCurrentStepValid() || isLoadingNeighborhood}
          />
        )}
        {activeIndex === steps.length - 1 && (
          <Button
            label={isSubmitting ? tCommon('creating') : tCommon('finish')}
            icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
            className="p-button-success ml-2 half-width-btn"
            onClick={handleFinish}
            disabled={!areImagesUploaded || isSubmitting}
            loading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default PropertyWizard;