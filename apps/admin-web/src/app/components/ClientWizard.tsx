import React, { useRef, useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslations } from 'next-intl';
import { clientService } from '@/services/client.service';
import { propertyService, Property } from '@/services/property.service';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  transactionType: string;
  paymentType: string;
  comment: string;
  moneyAmount: string | number;
  propertyId?: string;
}

interface ClientWizardProps {
  visible: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

const ClientWizard: React.FC<ClientWizardProps> = ({ visible, onHide, onSuccess }) => {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');
  const tProperties = useTranslations('properties');
  const toast = useRef<Toast>(null);

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    transactionType: 'buyer',
    paymentType: 'cash',
    comment: '',
    moneyAmount: '',
    propertyId: undefined,
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Load available properties on component mount
  useEffect(() => {
    if (visible) {
      loadProperties();
    }
  }, [visible]);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await propertyService.getProperties({ limit: 1000 });
      // Filter out properties that already have a client
      const availableProperties = response.items.filter(p => !p.client);
      setProperties(availableProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.current?.show({
        severity: 'error',
        summary: tCommon('error') || 'Error',
        detail: 'Failed to load properties',
        life: 3000,
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  const statusOptions = [
    { label: t('active'), value: 'active' },
    { label: t('inactive'), value: 'inactive' },
  ];

  const transactionTypeOptions = [
    { label: t('buyer'), value: 'buyer' },
    { label: t('seller'), value: 'seller' },
    { label: t('rents'), value: 'renter' },
    { label: t('rentsOut'), value: 'landlord' },
  ];

  const paymentTypeOptions = [
    { label: t('cash'), value: 'cash' },
    { label: t('credit'), value: 'credit' },
    { label: t('combined'), value: 'combined' },
  ];

  const propertyOptions = properties.map(p => ({
    label: `${p.code} - ${p.address} (${p.neighborhood || 'N/A'})`,
    value: p.id,
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDropdownChange = (e: any) => {
    const { value, originalEvent } = e;
    const name = originalEvent?.target?.id || e.target?.name;
    
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: '',
    };

    let isValid = true;

    if (!formData.name || formData.name.trim() === '') {
      errors.name = t('errorNameRequired') || 'Name is required';
      isValid = false;
    }

    if (!formData.email || formData.email.trim() === '') {
      errors.email = t('errorEmailRequired') || 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('errorEmailInvalid') || 'Email is invalid';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.current?.show({
        severity: 'warn',
        summary: tCommon('warning') || 'Warning',
        detail: t('errorFormValidation') || 'Please fill in all required fields',
        life: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const clientDto = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
        transactionType: formData.transactionType,
        paymentType: formData.paymentType,
        comment: formData.comment,
        moneyAmount: formData.moneyAmount ? Number(formData.moneyAmount) : undefined,
      };

      const createdClient = await clientService.createClient(clientDto);

      // If property is selected, link it to the client
      if (formData.propertyId) {
        try {
          await propertyService.updateProperty(formData.propertyId, {
            clientId: createdClient.id,
          });
        } catch (error) {
          console.error('Error linking property:', error);
          // Don't fail the whole operation if linking fails
          toast.current?.show({
            severity: 'warn',
            summary: tCommon('warning') || 'Warning',
            detail: 'Client created but property linking failed',
            life: 3000,
          });
        }
      }

      toast.current?.show({
        severity: 'success',
        summary: tCommon('success') || 'Success',
        detail: t('clientCreatedSuccess') || 'Client created successfully',
        life: 3000,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        transactionType: 'buyer',
        paymentType: 'cash',
        comment: '',
        moneyAmount: '',
        propertyId: undefined,
      });

      if (onSuccess) {
        onSuccess();
      }

      onHide();
    } catch (error) {
      console.error('Error creating client:', error);
      toast.current?.show({
        severity: 'error',
        summary: tCommon('error') || 'Error',
        detail: error instanceof Error ? error.message : 'Failed to create client',
        life: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogFooter = (
    <div>
      <Button 
        label={tCommon('cancel')} 
        icon="pi pi-times" 
        onClick={onHide}
        className="p-button-text"
        disabled={isSubmitting}
      />
      <Button 
        label={isSubmitting ? tCommon('creating') : tCommon('save')} 
        icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"} 
        onClick={handleSubmit}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: '700px' }}
      header={t('newClient')}
      modal
      className="p-fluid"
      footer={dialogFooter}
      onHide={onHide}
    >
      <Toast ref={toast} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column */}
        <div>
          <div className="p-field py-2">
            <label htmlFor="name">{t('name')} <span className="text-red-500">*</span></label>
            <InputText
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={formErrors.name ? 'p-invalid' : ''}
            />
            {formErrors.name && <small className="p-error">{formErrors.name}</small>}
          </div>

          <div className="p-field py-2">
            <label htmlFor="email">{t('email')} <span className="text-red-500">*</span></label>
            <InputText
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? 'p-invalid' : ''}
            />
            {formErrors.email && <small className="p-error">{formErrors.email}</small>}
          </div>

          <div className="p-field py-2">
            <label htmlFor="phone">{t('phone')}</label>
            <InputText
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="p-field py-2">
            <label htmlFor="address">{t('address')}</label>
            <InputText
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="p-field py-2">
            <label htmlFor="status">{t('status')}</label>
            <Dropdown
              id="status"
              name="status"
              value={formData.status}
              options={statusOptions}
              onChange={handleDropdownChange}
              placeholder={t('selectStatus')}
            />
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="p-field py-2">
            <label htmlFor="transactionType">{t('transactionType')}</label>
            <Dropdown
              id="transactionType"
              name="transactionType"
              value={formData.transactionType}
              options={transactionTypeOptions}
              onChange={handleDropdownChange}
              placeholder={t('selectTransactionType')}
            />
          </div>

          <div className="p-field py-2">
            <label htmlFor="paymentType">{t('paymentType')}</label>
            <Dropdown
              id="paymentType"
              name="paymentType"
              value={formData.paymentType}
              options={paymentTypeOptions}
              onChange={handleDropdownChange}
              placeholder={t('selectPaymentType')}
            />
          </div>

          <div className="p-field py-2">
            <label htmlFor="moneyAmount">{t('amount')}</label>
            <InputText
              id="moneyAmount"
              name="moneyAmount"
              type="number"
              min={0}
              value={formData.moneyAmount.toString()}
              onChange={handleInputChange}
            />
          </div>

          <div className="p-field py-2">
            <label htmlFor="propertyId">{t('property')} ({tCommon('optional') || 'Optional'})</label>
            <Dropdown
              id="propertyId"
              name="propertyId"
              value={formData.propertyId}
              options={propertyOptions}
              onChange={handleDropdownChange}
              placeholder={tProperties('selectProperty') || 'Select a property'}
              filter
              showClear
              loading={loadingProperties}
              emptyMessage={tCommon('noData') || 'No properties available'}
            />
            <small className="text-gray-500">
              {tCommon('propertyLinkHint') || 'Link this client to an existing property'}
            </small>
          </div>

          <div className="p-field py-2">
            <label htmlFor="comment">{t('comment')}</label>
            <InputTextarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows={3}
              autoResize
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ClientWizard;
