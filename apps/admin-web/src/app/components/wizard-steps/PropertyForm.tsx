import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Messages } from 'primereact/messages';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { useTranslations } from 'next-intl';
import { getPropertyTypeOptions } from '../../[locale]/mappings/property-type-options';
import { getStatusOptions } from '../../[locale]/mappings/status-options';
import { getHeatingOptions } from '../../[locale]/mappings/heating-options';
import { getFeaturesOptions } from '../../[locale]/mappings/additional-equipment-options';
import { v4 as uuidv4 } from 'uuid';

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
}

interface PropertyFormErrors {
  code: string;
  propertyType: string;
  status: string;
  price: string;
  salePrice: string;
  area: string;
}

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onNext?: (data: PropertyFormData) => void;
  onDataChange?: (data: PropertyFormData) => void;
  onUUIDGenerated?: (uuid: string) => void;
}

export interface PropertyFormRef {
  validateAndGetData: () => { isValid: boolean; data: PropertyFormData };
}

const PropertyForm = forwardRef<PropertyFormRef, PropertyFormProps>(({ initialData, onNext, onDataChange, onUUIDGenerated }, ref) => {
  const t = useTranslations('properties');

  // Generate translated options
  const propertyTypeOptions = React.useMemo(() => getPropertyTypeOptions(t), [t]);
  const statusOptions = React.useMemo(() => getStatusOptions(t), [t]);
  const heatingOptions = React.useMemo(() => getHeatingOptions(t), [t]);
  const featuresOptions = React.useMemo(() => getFeaturesOptions(t), [t]);

  const [formData, setFormData] = useState({
    code: '',
    propertyType: '',
    status: 'active',
    roomStructure: '',
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
    id: '',
    ...initialData, // Spread initialData to pre-fill the form
  });

  const [formErrors, setFormErrors] = useState({
    code: '',
    propertyType: '',
    status: '',
    price: '',
    salePrice: '',
    area: '',
  });

  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);
  const isInitialMount = useRef(true);

  // Generate UUID on component mount only if no ID exists (for new properties)
  useEffect(() => {
    if (!formData.id) {
      const generatedUUID = uuidv4();
      onUUIDGenerated && onUUIDGenerated(generatedUUID);
      setFormData(prev => ({ ...prev, id: generatedUUID }));
    }
  }, [onUUIDGenerated, formData.id]);

  // Call onDataChange whenever formData changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip the first call on mount
    }
    onDataChange?.(formData);
  }, [formData]); // Remove onDataChange from dependencies

  const validateField = (name: string, value: string | number | string[] | undefined): string => {
    switch (name) {
      case 'code':
        return typeof value === 'string' && value.trim() === '' ? t('errorCodeRequired') : '';
      case 'propertyType':
        return !value || value === '' ? t('errorPropertyTypeRequired') : '';
      case 'price':
        if (Array.isArray(value)) return '';
        const price = typeof value === 'string' ? parseFloat(value) : value;
        return !price || price <= 0 ? t('errorPriceGreaterThanZero') : '';
      case 'salePrice':
        if (Array.isArray(value)) return '';
        const salePrice = typeof value === 'string' ? parseFloat(value) : value;
        return !salePrice || salePrice <= 0 ? t('errorSalePriceGreaterThanZero') : '';
      case 'area':
        if (Array.isArray(value)) return '';
        const area = typeof value === 'string' ? parseFloat(value) : value;
        return !area || area <= 0 ? t('errorAreaGreaterThanZero') : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (['code', 'propertyType', 'price', 'salePrice'].includes(name)) {
      setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['code', 'propertyType', 'price', 'salePrice'].includes(name)) {
      setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleDropdownChange = (e: { target: { id: string; value: string | string[] } }) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user selects a value
    if (id === 'propertyType' && value) {
      setFormErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleDropdownBlur = (fieldName: string) => {
    if (fieldName === 'propertyType' && !formData.propertyType) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: validateField(fieldName, formData.propertyType),
      }));
    }
  };

  // const isFormValid = () => {
  //   return ['code', 'propertyType', 'price', 'salePrice'].every(
  //     (field) => formErrors[field] === '' && formData[field] !== ''
  //   );
  // };

  const validateForm = () => {
    let isValid = true;
    const errors = { ...formErrors };

    if (!formData.code.trim()) {
      errors.code = 'Code is required';
      isValid = false;
    }

    if (!formData.propertyType) {
      errors.propertyType = 'Property type is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext?.(formData); // Notify parent to proceed
      return true;
    }
    return false;
  };

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    validateAndGetData: () => {
      const isValid = handleSubmit();
      return { isValid, data: formData };
    },
  }));


  return (
    <div className="pt-4">
      {/*<h3>Property Details</h3>*/}
      <Messages ref={messagesRef} />

      <div className="property-form-grid">
        <div className="form-column">
          <div className="p-field py-2">
            <label htmlFor="code">{t('code')} <span className="text-red-500">*</span></label>
            <InputText
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`background-code ${formErrors.code ? 'p-invalid' : ''}`}
            />
            {formErrors.code && <small className="p-error">{formErrors.code}</small>}
          </div>
          <div className="p-field py-2">
            <label htmlFor="propertyType">{t('type')} <span className="text-red-500">*</span></label>
            <Dropdown
              id="propertyType"
              value={formData.propertyType}
              options={propertyTypeOptions}
              onChange={handleDropdownChange}
              onHide={() => handleDropdownBlur('propertyType')}
              placeholder={t('selectPropertyType')}
              className={formErrors.propertyType ? 'p-invalid' : ''}
            />
            {formErrors.propertyType && (
              <small className="p-error">{formErrors.propertyType}</small>
            )}
          </div>
          <div className="p-field py-2">
            <label htmlFor="roomStructure">{t('roomStructure')}</label>
            <Dropdown
              id="roomStructure"
              value={formData.roomStructure}
              options={[
                { label: t('structureGarsonjera'), value: 'garsonjera' },
                { label: t('structureJednosoban'), value: 'jednosoban' },
                { label: t('structureDvosoban'), value: 'dvosoban' },
                { label: t('structureTrosoban'), value: 'trosoban' },
                { label: t('structureCetvorosoban'), value: 'četvorosoban' },
                { label: t('structureCetvoroiposoban'), value: 'četvoroiposoban' },
                { label: t('structurePetosobanIVeci'), value: 'petosoban i veći' },
                { label: t('structureOstalo'), value: 'ostalo' },
              ]}
              onChange={handleDropdownChange}
              placeholder={t('selectRoomStructure')}
            />
          </div>
          <div className="p-field py-2">
            <label htmlFor="address">{t('address')} <span className="text-red-500">*</span></label>
            <InputText id="address" name="address" value={formData.address} onChange={handleInputChange} />
          </div>
          {formData.neighborhood && (
            <div className="p-field py-2">
              <label htmlFor="neighborhood">
                {t('neighborhood')} 
                <small className="text-gray-500 ml-2" style={{ fontWeight: 'normal', fontSize: '0.85em' }}>
                  ({t('neighborhoodAutoDetected')})
                </small>
              </label>
              <InputText 
                id="neighborhood" 
                name="neighborhood" 
                value={formData.neighborhood} 
                disabled
                className="p-disabled"
                style={{ opacity: 0.8, cursor: 'not-allowed' }}
              />
            </div>
          )}
          <div className="p-field py-2">
            <label htmlFor="description">{t('description')}</label>
            <InputTextarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={5} // Number of visible rows
              cols={30} // Number of visible columns
              autoResize
            />
          </div>
        </div>
        <div className="form-column">
          <div className="p-field py-2">
            <label htmlFor="price">{t('ownerPrice')} <span className="text-red-500">*</span></label>
            <InputText
              id="price"
              name="price"
              type="number"
              min={0}
              value={formData.price.toString()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: e.target.value ? parseFloat(e.target.value) : '', // Parse to number or set to empty string
                }))}
              onBlur={handleBlur}
              className={formErrors.price ? 'p-invalid' : ''}
            />
            {formErrors.price && <small className="p-error">{formErrors.price}</small>}
          </div>
          <div className="p-field py-2">
            <label htmlFor="area">{t('area')} <span className="text-red-500">*</span></label>
            <InputText
              id="area"
              name="area"
              type="number"
              min={0}
              value={formData.area?.toString()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  area: e.target.value ? parseFloat(e.target.value) : '', // Parse to number or set to empty string
                }))}
              onBlur={handleBlur}
              className={formErrors.area ? 'p-invalid' : ''}
            />
            {formErrors.area && <small className="p-error">{formErrors.area}</small>}
          </div>
          <div className="p-field py-2">
            <label htmlFor="floor">{t('floor')}</label>
            <InputText
              id="floor"
              name="floor"
              type="number"
              min={0}
              value={formData.floor?.toString()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  floor: e.target.value ? parseFloat(e.target.value) : '', // Parse to number or set to empty string
                }))}
              onBlur={handleBlur}
            />
          </div>
          <div className="p-field py-2">
            <label htmlFor="constructionYear">{t('constructionYear')}</label>
            <Calendar
              id="constructionYear"
              name="constructionYear"
              value={formData.constructionYear ? new Date(+formData.constructionYear, 0) : null} // Convert year to Date object
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  constructionYear: e.value ? e.value.getFullYear() : '', // Extract year from Date object or set to empty string
                }))
              }
              view="year"
              dateFormat="yy"
              yearRange={`1900:${new Date().getFullYear()}`} // Define the range of selectable years
              placeholder={t('selectYear')}
              maxDate={new Date()}
            />
          </div>
          <div className="p-field py-2">
            <label htmlFor="comment">{t('comment')}</label>
            <InputTextarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              rows={5} // Number of visible rows
              cols={30} // Number of visible columns
              autoResize
            />
          </div>
        </div>
        <div className="form-column">
          <div className="p-field py-2">
            <label htmlFor="salePrice">{t('salePrice')} <span className="text-red-500">*</span></label>
            <InputText
              id="salePrice"
              name="salePrice"
              type="number"
              min={0}
              value={formData.salePrice.toString()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salePrice: e.target.value ? parseFloat(e.target.value) : '', // Parse to number or set to empty string
                }))}
              onBlur={handleBlur}
              className={formErrors.salePrice ? 'p-invalid' : ''}
            />
            {formErrors.salePrice && <small className="p-error">{formErrors.salePrice}</small>}
          </div>
          <div className="p-field py-2">
            <label htmlFor="bathrooms">{t('bathrooms')}</label>
            <InputText
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              value={formData.bathrooms?.toString()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bathrooms: e.target.value ? parseFloat(e.target.value) : '', // Parse to number or set to empty string
                }))}
              onBlur={handleBlur}
            />
          </div>
          <div className="p-field py-2">
            <label htmlFor="status">{t('status')}</label>
            <Dropdown
              id="status"
              value={formData.status}
              options={statusOptions}
              onChange={handleDropdownChange}
              onBlur={() => handleDropdownBlur('status')}
              placeholder={t('selectStatus')}
              className={formErrors.status ? 'p-invalid' : ''}
            />
            {formErrors.status && (
              <small className="p-error">{formErrors.status}</small>
            )}
          </div>
          <div className="p-field py-2">
            <label htmlFor="heating">{t('heating')}</label>
            <Dropdown
              id="heating"
              value={formData.heating}
              options={heatingOptions}
              onChange={handleDropdownChange}
              placeholder={t('selectHeatingType')}
            />
          </div>
          <div className="p-field py-2">
            <label htmlFor="additionalEquipment">{t('additionalEquipment')}</label>
            <MultiSelect
              id="additionalEquipment"
              value={formData.additionalEquipment}
              options={featuresOptions}
              onChange={handleDropdownChange}
              onBlur={() => handleDropdownBlur('additionalEquipment')}
              placeholder={t('selectEquipment')}
              display="chip" // This ensures the selected items show as chips
              showSelectAll={true}
              selectAllLabel={t('selectAll')}
              className="additional-equipment-multiselect"
              style={{ width: '100%', minHeight: '40px' }}
            />
          </div>
          <div className="p-field-checkbox pb-2">
            <Checkbox
              inputId="elevator"
              name="elevator"
              checked={formData.elevator} // Boolean value
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  elevator: e.checked ?? false, // Update the value based on checkbox state
                }))
              }
            />
            <label htmlFor="elevator" className={'mx-2'}>{t('elevatorAvailable')}</label>
          </div>
        </div>
      </div>
    </div>
  );
});

PropertyForm.displayName = 'PropertyForm';

export default PropertyForm;
