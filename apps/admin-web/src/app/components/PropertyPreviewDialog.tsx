"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Galleria } from 'primereact/galleria';
import { Card } from 'primereact/card';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../utils/currency';
import { Property } from '../../services/property.service';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { googleMapsLoaderOptions } from '../utils/googleMapsLoader';
import { customMapStyles } from '../utils/mapStyles';

interface PropertyPreviewDialogProps {
  visible: boolean;
  property: Property | null;
  onHide: () => void;
  onEdit?: (property: Property) => void;
}

interface PropertyImageData {
  id: string;
  url: string;
  isFavorite: boolean;
  order: number;
}

export const PropertyPreviewDialog: React.FC<PropertyPreviewDialogProps> = ({
  visible,
  property,
  onHide,
  onEdit
}) => {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const tClients = useTranslations('clients');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { isLoaded: mapLoaded } = useJsApiLoader(googleMapsLoaderOptions);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (property && visible) {
      loadPropertyImages();
    }
  }, [property, visible]);

  const loadPropertyImages = async () => {
    if (!property) return;
    
    setLoading(true);
    try {
      // Load property images
      if (property.id) {
        console.log('[PropertyPreview] Loading images for property ID:', property.id);
        const imagesResponse = await fetch(`http://localhost:3000/v1/properties/${property.id}/images`);
        console.log('[PropertyPreview] Response status:', imagesResponse.status);
        
        if (imagesResponse.ok) {
          const imagesData: PropertyImageData[] = await imagesResponse.json();
          console.log('[PropertyPreview] Images data received:', imagesData);
          // Sort images: favorite first, then by order field
          const sortedImages = imagesData.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return a.order - b.order;
          });
          const imageUrls = sortedImages.map((img) => {
            let imageUrl = img.url;
            
            // If URL is already full (starts with http), use as is
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              return imageUrl;
            }
            
            // If URL already starts with /uploads/, use as is
            if (imageUrl.startsWith('/uploads/')) {
              return `http://localhost:3000${imageUrl}`;
            }
            
            // If URL is just the filename, add /uploads/ prefix
            if (!imageUrl.startsWith('/')) {
              return `http://localhost:3000/uploads/${imageUrl}`;
            }
            
            // Otherwise, add /uploads to the path
            return `http://localhost:3000/uploads${imageUrl}`;
          });
          console.log('[PropertyPreview] Constructed image URLs:', imageUrls);
          setImages(imageUrls);
        } else {
          console.error('[PropertyPreview] Failed to load images, status:', imagesResponse.status);
        }
      } else {
        console.warn('[PropertyPreview] Property has no ID');
      }
    } catch (error) {
      console.error('[PropertyPreview] Error loading property images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'available':
      case 'active':
        return 'success';
      case 'reserved':
        return 'warning';
      case 'sold':
      case 'inactive':
        return 'danger';
      case 'rented':
        return 'info';
      default:
        return 'info';
    }
  };

  const getHeatingTranslationKey = (heatingValue: string): string => {
    const heatingMap: Record<string, string> = {
      'Central': 'heatingCentral',
      'Gas central': 'heatingGasCentral',
      'Central heating with solid fuel': 'heatingSolidFuel',
      'Electric central': 'heatingElectricCentral',
      'Floor': 'heatingFloor',
      'Independently on gas': 'heatingGasIndependent',
      'Independent on solid fuel': 'heatingSolidFuelIndependent',
      'Independently on electricity': 'heatingElectricIndependent',
      'Fireplace': 'heatingFireplace',
      'Air conditioner': 'heatingAirConditioner',
      'The rest types': 'heatingOther',
    };
    return heatingMap[heatingValue] || 'heatingOther';
  };

  const getPropertyTypeTranslationKey = (typeValue: string): string => {
    const typeMap: Record<string, string> = {
      'House': 'typeHouse',
      'Apartment': 'typeApartment',
      'ApartmentInHouse': 'typeApartmentInHouse',
      'CommercialSpace': 'typeCommercialSpace',
      'Office': 'typeOffice',
      'Land': 'typeLand',
      'VacationHome': 'typeVacationHome',
      'Duplex': 'typeDuplex',
    };
    return typeMap[typeValue] || typeValue.toLowerCase();
  };

  const getEquipmentTranslationKey = (equipmentValue: string): string => {
    const equipmentMap: Record<string, string> = {
      'Swimming Pool': 'equipSwimmingPool',
      'Gym/Fitness Center': 'equipGym',
      'Balcony': 'equipBalcony',
      'Garden': 'equipGarden',
      'Fireplace': 'equipFireplace',
      'Garage': 'equipGarage',
      'Parking Space': 'equipParkingSpace',
      'Security System': 'equipSecuritySystem',
      'Pet-Friendly Facilities': 'equipPetFriendly',
      'Laundry Room': 'equipLaundryRoom',
      'Storage Room': 'equipStorageRoom',
      'Wheelchair Accessibility': 'equipWheelchairAccess',
      'Walk-in Closet': 'equipWalkInCloset',
      'Spa': 'equipSpa',
      'Playground': 'equipPlayground',
      'Outdoor Kitchen': 'equipOutdoorKitchen',
      'Smart Home Integration': 'equipSmartHome',
      'Home Security Cameras': 'equipSecurityCameras',
      'Video Doorbell': 'equipVideoDoorbell',
      'High-Speed Internet': 'equipHighSpeedInternet',
      'Smart Locks': 'equipSmartLocks',
      'Solar Panels': 'equipSolarPanels',
      'EV Charging Station': 'equipEVCharging',
      'Automated Blinds': 'equipAutomatedBlinds',
      'Voice-Controlled': 'equipVoiceControlled',
      'Whole-Home Audio System': 'equipWholeHomeAudio',
      'Home Theater': 'equipHomeTheater',
      'Wine Cellar': 'equipWineCellar',
      'Backup Generator': 'equipBackupGenerator',
      'Private Dock': 'equipPrivateDock',
      'Panic Room': 'equipPanicRoom',
      'Outdoor Fireplace': 'equipOutdoorFireplace',
      'Jacuzzi': 'equipJacuzzi',
      'Home Office': 'equipHomeOffice',
      "Kids' Playroom": 'equipKidsPlayroom',
      'Gaming Room': 'equipGamingRoom',
      'Wellness/Yoga Room': 'equipWellnessRoom',
    };
    return equipmentMap[equipmentValue] || equipmentValue;
  };

  const itemTemplate = (item: string) => {
    return <img src={item} alt="Property" style={{ width: '100%', display: 'block' }} />;
  };

  const thumbnailTemplate = (item: string) => {
    return <img src={item} alt="Property thumbnail" style={{ width: '80px', height: '60px', objectFit: 'cover' }} />;
  };

  const footer = (
    <div className="flex justify-content-between">
      <Button
        label={tCommon('close')}
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      {onEdit && property && (
        <Button
          label={t('editProperty')}
          icon="pi pi-pencil"
          onClick={() => onEdit(property)}
          className="p-button-primary"
        />
      )}
    </div>
  );

  if (!property) return null;

  const client = property.client;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`${t('propertyDetails')} - ${property.code}`}
      footer={footer}
      style={{ width: '80vw', height: '80vh' }}
      contentStyle={{ overflow: 'auto', padding: '1.5rem' }}
      modal
      dismissableMask
      className="property-preview-dialog"
    >
      <div className="grid">
        {/* Property Basic Information */}
        <div className="col-12 md:col-6">
          <Card title={t('propertyDetails')} className="mb-3">
            <div className="grid">
              <div className="col-12">
                <div className="flex align-items-center mb-3">
                  <strong className="mr-2">{t('status')}:</strong>
                  <Tag 
                    value={property.status === 'active' ? t('available') : t(property.status)} 
                    severity={getStatusSeverity(property.status)}
                  />
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                <p><strong>{t('code')}:</strong> {property.code}</p>
              </div>
              <div className="col-12 md:col-6">
                <p><strong>{t('type')}:</strong> {t(getPropertyTypeTranslationKey(property.propertyType))}</p>
              </div>
              
              <div className="col-12">
                <p><strong>{t('address')}:</strong> {property.address}</p>
              </div>
              
              {property.neighborhood && (
                <div className="col-12">
                  <p>
                    <strong>{t('neighborhood')}:</strong>{' '}
                    <span style={{ 
                      backgroundColor: '#e0f2fe', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {property.neighborhood}
                    </span>
                  </p>
                </div>
              )}
              
              <div className="col-12 md:col-6">
                <p><strong>{t('ownerPrice')}:</strong> {formatCurrency(property.price)}</p>
              </div>
              <div className="col-12 md:col-6">
                <p><strong>{t('salePrice')}:</strong> {formatCurrency(property.salePrice)}</p>
              </div>
              
              <div className="col-12 md:col-6">
                <p><strong>{t('area')}:</strong> {property.area} m²</p>
              </div>
              <div className="col-12 md:col-6">
                <p><strong>{t('floor')}:</strong> {property.floor || 'N/A'}</p>
              </div>
              
              {property.heating && (
                <div className="col-12 md:col-6">
                  <p><strong>{t('heating')}:</strong> {t(getHeatingTranslationKey(property.heating))}</p>
                </div>
              )}
              
              {property.bathrooms && (
                <div className="col-12 md:col-6">
                  <p><strong>{t('bathrooms')}:</strong> {property.bathrooms}</p>
                </div>
              )}
              
              {property.constructionYear && (
                <div className="col-12 md:col-6">
                  <p><strong>{t('constructionYear')}:</strong> {property.constructionYear}</p>
                </div>
              )}
              
              <div className="col-12 md:col-6">
                <p><strong>{t('elevatorAvailable')}:</strong> {property.elevator ? tCommon('yes') : tCommon('no')}</p>
              </div>
              
              {property.description && (
                <div className="col-12">
                  <Divider />
                  <p><strong>{t('description')}:</strong></p>
                  <p>{property.description}</p>
                </div>
              )}
              
              {property.comment && (
                <div className="col-12">
                  <Divider />
                  <p><strong>{t('comment')}:</strong></p>
                  <p className="text-color-secondary">{property.comment}</p>
                </div>
              )}
              
              {property.additionalEquipment && property.additionalEquipment.length > 0 && (
                <div className="col-12">
                  <Divider />
                  <p><strong>{t('additionalEquipment')}:</strong></p>
                  <div className="flex flex-wrap gap-2">
                    {property.additionalEquipment.map((equipment: string, index: number) => (
                      <Tag 
                        key={index} 
                        value={t(getEquipmentTranslationKey(equipment))} 
                        className="mr-2 mb-2"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Property Images Section - Below Property Details */}
          {loading ? (
            <Card title={t('images')} className="mb-3">
              <div className="flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
              </div>
            </Card>
          ) : images.length > 0 ? (
            <Card title={t('images')} className="mb-3">
              <Galleria
                value={images}
                item={itemTemplate}
                thumbnail={thumbnailTemplate}
                numVisible={5}
                circular
                autoPlay
                transitionInterval={3000}
                showItemNavigators
                showThumbnails={images.length > 1}
                style={{ maxWidth: '100%' }}
              />
            </Card>
          ) : (
            <div className="p-3 bg-yellow-50 border-round border-1 border-yellow-200 text-center mb-3">
              <i className="pi pi-info-circle text-yellow-700 mr-2" style={{ fontSize: '1.5rem' }}></i>
              <span className="text-yellow-900 font-medium">{t('images')} - {tCommon('noData')}</span>
            </div>
          )}
        </div>

        {/* Client Information & Location */}
        <div className="col-12 md:col-6">
          {client ? (
            <Card title={tClients('clientDetails')} className="mb-3">
              <div className="grid">
                <div className="col-12">
                  <p><strong>{tClients('name')}:</strong> {client.name}</p>
                </div>
                <div className="col-12">
                  <p><strong>{tClients('email')}:</strong> {client.email}</p>
                </div>
                {client.phone && (
                  <div className="col-12">
                    <p><strong>{tClients('phone')}:</strong> {client.phone}</p>
                  </div>
                )}
                {client.address && (
                  <div className="col-12">
                    <p><strong>{tClients('address')}:</strong> {client.address}</p>
                  </div>
                )}
                <div className="col-12">
                  <p><strong>{tClients('transactionType')}:</strong> {tClients(client.transactionType)}</p>
                </div>
                {client.paymentType && (
                  <div className="col-12">
                    <p><strong>{tClients('paymentType')}:</strong> {tClients(client.paymentType)}</p>
                  </div>
                )}
                {client.moneyAmount !== undefined && (
                  <div className="col-12">
                    <p><strong>{tClients('amount')}:</strong> {formatCurrency(client.moneyAmount)}</p>
                  </div>
                )}
                <div className="col-12">
                  <div className="flex align-items-center">
                    <strong className="mr-2">{tClients('status')}:</strong>
                    <Tag 
                      value={tClients(client.status)} 
                      severity={client.status === 'active' ? 'success' : 'danger'}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card title={tClients('clientDetails')} className="mb-3">
              <p className="text-color-secondary">{tCommon('noData')}</p>
            </Card>
          )}

          {/* Location Map */}
          {property.lat && property.lon && (
            <Card title={t('propertyLocation')} className="mb-3">
              <div style={{ height: '300px', width: '100%', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                {mapLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: property.lat, lng: property.lon }}
                    zoom={17}
                    options={{
                      styles: customMapStyles,
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      gestureHandling: 'greedy',
                    }}
                    onLoad={(map) => {
                      mapRef.current = map;
                      
                      // Create custom marker icon
                      const getMarkerIcon = (propertyType: string) => {
                        const createSVGMarker = (color: string, icon: string) => {
                          const svg = `
                            <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                  <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                                </filter>
                              </defs>
                              <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 33 15 33s15-24.716 15-33C35 6.716 28.284 0 20 0z" 
                                    fill="${color}" filter="url(#shadow)"/>
                              <circle cx="20" cy="15" r="10" fill="white"/>
                              ${icon}
                            </svg>
                          `;
                          return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
                        };

                        const apartmentIcon = `
                          <g transform="translate(14, 9)">
                            <rect x="1" y="1" width="10" height="11" fill="none" stroke="#e91e63" stroke-width="1.2"/>
                            <line x1="1" y1="4" x2="11" y2="4" stroke="#e91e63" stroke-width="1"/>
                            <line x1="1" y1="7" x2="11" y2="7" stroke="#e91e63" stroke-width="1"/>
                            <line x1="1" y1="10" x2="11" y2="10" stroke="#e91e63" stroke-width="1"/>
                            <line x1="6" y1="1" x2="6" y2="12" stroke="#e91e63" stroke-width="1"/>
                            <rect x="4" y="9" width="1.5" height="3" fill="#e91e63"/>
                          </g>
                        `;

                        const houseIcon = `
                          <g transform="translate(13, 9)">
                            <path d="M7 2L1 7v6h12V7z" fill="none" stroke="#2196f3" stroke-width="1.2"/>
                            <rect x="5.5" y="9" width="3" height="4" fill="#2196f3"/>
                            <rect x="3" y="8" width="2" height="2" fill="#2196f3"/>
                            <rect x="9" y="8" width="2" height="2" fill="#2196f3"/>
                          </g>
                        `;

                        const officeIcon = `
                          <g transform="translate(14, 9)">
                            <rect x="1" y="1" width="10" height="11" fill="none" stroke="#4caf50" stroke-width="1.2"/>
                            <rect x="3" y="3" width="2" height="2" fill="#4caf50"/>
                            <rect x="7" y="3" width="2" height="2" fill="#4caf50"/>
                            <rect x="3" y="6" width="2" height="2" fill="#4caf50"/>
                            <rect x="7" y="6" width="2" height="2" fill="#4caf50"/>
                            <rect x="5" y="9" width="2" height="3" fill="#4caf50"/>
                          </g>
                        `;

                        const landIcon = `
                          <g transform="translate(13, 9)">
                            <rect x="1" y="1" width="12" height="11" fill="none" stroke="#795548" stroke-width="1.2"/>
                            <line x1="1" y1="6" x2="13" y2="6" stroke="#795548" stroke-width="1"/>
                            <circle cx="4" cy="3.5" r="1" fill="#795548"/>
                            <circle cx="7" cy="9.5" r="1" fill="#795548"/>
                            <circle cx="10" cy="3.5" r="1" fill="#795548"/>
                          </g>
                        `;

                        const vacationHomeIcon = `
                          <g transform="translate(13, 9)">
                            <path d="M7 2L1 7v6h12V7z" fill="none" stroke="#ff9800" stroke-width="1.2"/>
                            <rect x="5.5" y="9" width="3" height="4" fill="#ff9800"/>
                            <circle cx="7" cy="4.5" r="1.5" fill="#ff9800"/>
                          </g>
                        `;

                        const duplexIcon = `
                          <g transform="translate(14, 9)">
                            <rect x="1" y="1" width="10" height="11" fill="none" stroke="#9c27b0" stroke-width="1.2"/>
                            <line x1="1" y1="6" x2="11" y2="6" stroke="#9c27b0" stroke-width="1.2"/>
                            <rect x="3" y="2.5" width="2" height="2" fill="#9c27b0"/>
                            <rect x="7" y="2.5" width="2" height="2" fill="#9c27b0"/>
                            <rect x="3" y="7.5" width="2" height="2" fill="#9c27b0"/>
                            <rect x="7" y="7.5" width="2" height="2" fill="#9c27b0"/>
                            <rect x="5" y="9" width="2" height="3" fill="#9c27b0"/>
                          </g>
                        `;

                        switch (propertyType) {
                          case 'House':
                            return createSVGMarker('#2196f3', houseIcon);
                          case 'Apartment':
                            return createSVGMarker('#e91e63', apartmentIcon);
                          case 'ApartmentInHouse':
                            return createSVGMarker('#2196f3', houseIcon);
                          case 'Office':
                          case 'CommercialSpace':
                            return createSVGMarker('#4caf50', officeIcon);
                          case 'Land':
                            return createSVGMarker('#795548', landIcon);
                          case 'VacationHome':
                            return createSVGMarker('#ff9800', vacationHomeIcon);
                          case 'Duplex':
                            return createSVGMarker('#9c27b0', duplexIcon);
                          default:
                            return createSVGMarker('#e91e63', apartmentIcon);
                        }
                      };
                      
                      // Create marker
                      if (markerRef.current) {
                        markerRef.current.setMap(null);
                      }
                      
                      markerRef.current = new google.maps.Marker({
                        position: { lat: property.lat!, lng: property.lon! },
                        map: mapRef.current,
                        icon: {
                          url: getMarkerIcon(property.propertyType),
                          scaledSize: new google.maps.Size(40, 48),
                          anchor: new google.maps.Point(20, 48),
                        },
                      });
                    }}
                  >
                  </GoogleMap>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f5f5f5' }}>
                    <span>Loading map...</span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm text-color-secondary">
                <i className="pi pi-map-marker mr-2"></i>
                Lat: {property.lat.toFixed(6)}, Lng: {property.lon.toFixed(6)}
              </div>
            </Card>
          )}
        </div>
      </div>

      <style jsx global>{`
        .property-preview-dialog .p-dialog-content {
          background: #f8f9fa;
        }
        
        .property-preview-dialog .p-card {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .property-preview-dialog .p-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 1rem;
        }
        
        .property-preview-dialog .p-card-content p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        
        .property-preview-dialog .p-galleria {
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </Dialog>
  );
};

export default PropertyPreviewDialog;
