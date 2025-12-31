import React, { useRef, useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslations } from 'next-intl';
import { clientService, CreateClientDto } from '@/services/client.service';
import { propertyService, Property } from '@/services/property.service';

interface RepresentativeData {
  name: string;
  address: string;
  phone?: string;
  jmbg: string;
  birthplace?: string;
  idCardNumber?: string;
  idCardIssuePlace?: string;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  jmbg: string;
  birthplace: string;
  idCardNumber: string;
  idCardIssuePlace: string;
  status: string;
  transactionType: string;
  paymentType: string;
  comment: string;
  moneyAmount: string | number;
  propertyId?: string;
  representative: RepresentativeData;
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
    jmbg: '',
    birthplace: '',
    idCardNumber: '',
    idCardIssuePlace: '',
    status: 'active',
    transactionType: 'buyer',
    paymentType: 'cash',
    comment: '',
    moneyAmount: '',
    propertyId: undefined,
    representative: {
      name: '',
      address: '',
      phone: '',
      jmbg: '',
      birthplace: '',
      idCardNumber: '',
      idCardIssuePlace: '',
    },
  });

  const [showRepresentative, setShowRepresentative] = useState(false);

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
      const availableProperties = response.items.filter((p: Property) => !p.client);
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
    // Representative fields are prefixed with 'representative.'
    if (name.startsWith('representative.')) {
      const repField = name.replace('representative.', '');
      setFormData(prev => ({
        ...prev,
        representative: {
          ...prev.representative,
          [repField]: value ?? '',
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (formErrors[name as keyof typeof formErrors]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
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
      const clientDto: any = {
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
      if (showRepresentative && formData.representative && formData.representative.name) {
        clientDto.representative = formData.representative;
      }

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
        jmbg: '',
        birthplace: '',
        idCardNumber: '',
        idCardIssuePlace: '',
        status: 'active',
        transactionType: 'buyer',
        paymentType: 'cash',
        comment: '',
        moneyAmount: '',
        propertyId: undefined,
        representative: {
          name: '',
          address: '',
          phone: '',
          jmbg: '',
          birthplace: '',
          idCardNumber: '',
          idCardIssuePlace: '',
        },
      });
      setShowRepresentative(false);

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
            <label htmlFor="name">{t('name')}</label>
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
            <label htmlFor="email">{t('email')}</label>
            <InputText
              id="email"
              name="email"
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
            <label htmlFor="jmbg">{t('jmbg')}</label>
            <InputText
              id="jmbg"
              name="jmbg"
              value={formData.jmbg}
              onChange={handleInputChange}
            />
          </div>

          <div className="p-field py-2">
            <label htmlFor="birthplace">{t('birthplace')}</label>
            <InputText
              id="birthplace"
              name="birthplace"
              value={formData.birthplace}
              onChange={handleInputChange}
            />
          </div>

          <div className="p-field py-2">
            <label htmlFor="idCardNumber">{t('idCardNumber')}</label>
            <InputText
              id="idCardNumber"
              name="idCardNumber"
              value={formData.idCardNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="p-field py-2">
            <label htmlFor="idCardIssuePlace">{t('idCardIssuePlace')}</label>
            <InputText
              id="idCardIssuePlace"
              name="idCardIssuePlace"
              value={formData.idCardIssuePlace}
              onChange={handleInputChange}
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

      {/* Representative Section Accordion at the bottom */}
      <div className="mt-4">
        <Button
          type="button"
          label={showRepresentative ? t('hideRepresentative') || 'Sakrij zastupnika' : t('addRepresentative') || 'Dodaj zastupnika'}
          icon={showRepresentative ? 'pi pi-minus' : 'pi pi-plus'}
          className="p-button-secondary mb-2 rounded-full px-4 py-2 shadow-md transition-colors duration-150 hover:bg-blue-600 hover:text-white"
          style={{ borderRadius: '2rem', fontWeight: 500, fontSize: '1rem' }}
          onClick={() => setShowRepresentative(v => !v)}
        />
        {showRepresentative && (
          <div className="p-accordion-content border p-3 rounded bg-gray-50 mt-2">
            <div className="p-field py-2">
              <label htmlFor="representative.name">{t('representativeName') || 'Ime zastupnika'}</label>
              <InputText
                id="representative.name"
                name="representative.name"
                value={formData.representative?.name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="p-field py-2">
              <label htmlFor="representative.address">{t('representativeAddress') || 'Adresa zastupnika'}</label>
              <InputText
                id="representative.address"
                name="representative.address"
                value={formData.representative?.address || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="p-field py-2">
              <label htmlFor="representative.phone">{t('representativePhone') || 'Telefon zastupnika'}</label>
              <InputText
                id="representative.phone"
                name="representative.phone"
                value={formData.representative?.phone || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="p-field py-2">
              <label htmlFor="representative.jmbg">{t('representativeJmbg') || 'JMBG zastupnika'}</label>
              <InputText
                id="representative.jmbg"
                name="representative.jmbg"
                value={formData.representative?.jmbg || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="p-field py-2">
              <label htmlFor="representative.birthplace">{t('representativeBirthplace') || 'Mesto rođenja zastupnika'}</label>
              <InputText
                id="representative.birthplace"
                name="representative.birthplace"
                value={formData.representative?.birthplace || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="p-field py-2">
              <label htmlFor="representative.idCardNumber">{t('representativeIdCardNumber') || 'Broj lične karte zastupnika'}</label>
              <InputText
                id="representative.idCardNumber"
                name="representative.idCardNumber"
                value={formData.representative?.idCardNumber || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="p-field py-2">
              <label htmlFor="representative.idCardIssuePlace">{t('representativeIdCardIssuePlace') || 'Mesto izdavanja LK zastupnika'}</label>
              <InputText
                id="representative.idCardIssuePlace"
                name="representative.idCardIssuePlace"
                value={formData.representative?.idCardIssuePlace || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default ClientWizard;
