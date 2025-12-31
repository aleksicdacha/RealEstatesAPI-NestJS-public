import React, { useRef, useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslations } from 'next-intl';
import { Client, clientService } from '@/services/client.service';
import { propertyService, Property } from '@/services/property.service';

interface EditClientDialogProps {
  visible: boolean;
  client: Client | null;
  onHide: () => void;
  onSuccess?: () => void;
}

const EditClientDialog: React.FC<EditClientDialogProps> = ({ visible, client, onHide, onSuccess }) => {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');
  const tProperties = useTranslations('properties');
  const toast = useRef<Toast>(null);

  const [formData, setFormData] = useState({
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
    moneyAmount: '' as string | number,
    propertyId: undefined as string | undefined,
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

  // Load client data when dialog opens
  useEffect(() => {
    if (visible && client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        jmbg: client.ownerJmbg || '',
        birthplace: client.ownerBirthplace || '',
        idCardNumber: client.ownerIdCardNumber || '',
        idCardIssuePlace: client.ownerIdCardIssuePlace || '',
        status: client.status || 'active',
        transactionType: client.transactionType || 'buyer',
        paymentType: client.paymentType || 'cash',
        comment: client.comment || '',
        moneyAmount: client.moneyAmount || '',
        propertyId: client.propertyId || undefined,
        representative: client.representative ? {
          name: client.representative.name || '',
          address: client.representative.address || '',
          phone: client.representative.phone || '',
          jmbg: client.representative.jmbg || '',
          birthplace: client.representative.birthplace || '',
          idCardNumber: client.representative.idCardNumber || '',
          idCardIssuePlace: client.representative.idCardIssuePlace || '',
        } : {
          name: '',
          address: '',
          phone: '',
          jmbg: '',
          birthplace: '',
          idCardNumber: '',
          idCardIssuePlace: '',
        },
      });
      setShowRepresentative(!!client.representative);
      loadProperties();
    }
  }, [visible, client]);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await propertyService.getProperties({ limit: 1000 });
      // Filter out properties that already have a client, but include current client's property
      const availableProperties = response.items.filter(
        (p: Property) => !p.client || p.id === client?.propertyId
      );
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

  const propertyOptions = [
    { label: tCommon('none') || 'None', value: null },
    ...properties.map(p => ({
      label: `${p.code} - ${p.address} (${p.neighborhood || 'N/A'})`,
      value: p.id,
    }))
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
    if (!validateForm() || !client) {
      toast.current?.show({
        severity: 'warn',
        summary: tCommon('warning') || 'Warning',
        detail: tCommon('errorFormValidation') || 'Please fill in all required fields',
        life: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update client
      const updateDto: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
        transactionType: formData.transactionType,
        paymentType: formData.paymentType,
        comment: formData.comment,
        moneyAmount: formData.moneyAmount ? Number(formData.moneyAmount) : undefined,
        propertyId: formData.propertyId || null,
      };
      if (showRepresentative && formData.representative && formData.representative.name) {
        updateDto.representative = formData.representative;
      }
      await clientService.updateClient(client.id, updateDto);

      toast.current?.show({
        severity: 'success',
        summary: tCommon('success') || 'Success',
        detail: t('clientUpdatedSuccess') || 'Client updated successfully',
        life: 3000,
      });

      if (onSuccess) {
        onSuccess();
      }

      onHide();
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast.current?.show({
        severity: 'error',
        summary: tCommon('error') || 'Error',
        detail: error?.response?.data?.message || t('errorUpdatingClient') || 'Failed to update client',
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormErrors({ name: '', email: '' });
    onHide();
  };

  const dialogFooter = (
    <div>
      <Button
        label={tCommon('cancel') || 'Cancel'}
        icon="pi pi-times"
        onClick={handleCancel}
        className="p-button-text"
        disabled={isSubmitting}
      />
      <Button
        label={tCommon('save') || 'Save'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={isSubmitting}
        autoFocus
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        style={{ width: '800px' }}
        header={t('editClient') || 'Edit Client'}
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={handleCancel}
      >
        <div className="grid">
          <div className="col-6">
            {/* Name */}
            <div className="field">
              <label htmlFor="name" className="font-bold">
                {t('name')} <span style={{ color: 'red' }}>*</span>
              </label>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={formErrors.name ? 'p-invalid' : ''}
                disabled={isSubmitting}
              />
              {formErrors.name && <small className="p-error">{formErrors.name}</small>}
            </div>

            {/* Email */}
            <div className="field">
              <label htmlFor="email" className="font-bold">
                {t('email')} <span style={{ color: 'red' }}>*</span>
              </label>
              <InputText
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={formErrors.email ? 'p-invalid' : ''}
                disabled={isSubmitting}
              />
              {formErrors.email && <small className="p-error">{formErrors.email}</small>}
            </div>

            {/* Phone */}
            <div className="field">
              <label htmlFor="phone" className="font-bold">
                {t('phone')}
              </label>
              <InputText
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Address */}
            <div className="field">
              <label htmlFor="address" className="font-bold">
                {t('address')}
              </label>
              <InputText
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            {/* JMBG */}
            <div className="field">
              <label htmlFor="jmbg" className="font-bold">
                {t('jmbg')}
              </label>
              <InputText
                id="jmbg"
                name="jmbg"
                value={formData.jmbg}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Birthplace */}
            <div className="field">
              <label htmlFor="birthplace" className="font-bold">
                {t('birthplace')}
              </label>
              <InputText
                id="birthplace"
                name="birthplace"
                value={formData.birthplace}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            {/* ID Card Number */}
            <div className="field">
              <label htmlFor="idCardNumber" className="font-bold">
                {t('idCardNumber')}
              </label>
              <InputText
                id="idCardNumber"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            {/* ID Card Issue Place */}
            <div className="field">
              <label htmlFor="idCardIssuePlace" className="font-bold">
                {t('idCardIssuePlace')}
              </label>
              <InputText
                id="idCardIssuePlace"
                name="idCardIssuePlace"
                value={formData.idCardIssuePlace}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="col-6">
            {/* Transaction Type */}
            <div className="field">
              <label htmlFor="transactionType" className="font-bold">
                {t('transactionType')}
              </label>
              <Dropdown
                id="transactionType"
                name="transactionType"
                value={formData.transactionType}
                options={transactionTypeOptions}
                onChange={handleDropdownChange}
                placeholder={t('selectTransactionType')}
                disabled={isSubmitting}
              />
            </div>

            {/* Payment Type */}
            <div className="field">
              <label htmlFor="paymentType" className="font-bold">
                {t('paymentType')}
              </label>
              <Dropdown
                id="paymentType"
                name="paymentType"
                value={formData.paymentType}
                options={paymentTypeOptions}
                onChange={handleDropdownChange}
                placeholder={t('selectPaymentType')}
                disabled={isSubmitting}
              />
            </div>

            {/* Money Amount */}
            <div className="field">
              <label htmlFor="moneyAmount" className="font-bold">
                {t('amount')}
              </label>
              <InputText
                id="moneyAmount"
                name="moneyAmount"
                type="number"
                min={0}
                value={formData.moneyAmount.toString()}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Property */}
            <div className="field">
              <label htmlFor="propertyId" className="font-bold">
                {t('property')} <small className="text-500">({tCommon('optional')})</small>
              </label>
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
                disabled={isSubmitting}
              />
              <small className="text-gray-500">
                {tCommon('propertyLinkHint') || 'Link this client to an existing property'}
              </small>
            </div>

            {/* Comment */}
            <div className="field">
              <label htmlFor="comment" className="font-bold">
                {t('comment')} <small className="text-500">({tCommon('optional')})</small>
              </label>
              <InputTextarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
        {/* Representative Section Accordion at the bottom */}
        <div className="mt-4">
          <Button
            type="button"
            label={showRepresentative ? t('hideRepresentative') || 'Sakrij zastupnika' : t('showRepresentative') || 'Prikaži zastupnika'}
            icon={showRepresentative ? 'pi pi-minus' : 'pi pi-plus'}
            className="p-button-secondary mb-2 rounded-full px-4 py-2 shadow-md transition-colors duration-150 hover:bg-blue-600 hover:text-white"
            style={{ borderRadius: '2rem', fontWeight: 500, fontSize: '1rem' }}
            onClick={() => setShowRepresentative(v => !v)}
            disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="p-field py-2">
                <label htmlFor="representative.address">{t('representativeAddress') || 'Adresa zastupnika'}</label>
                <InputText
                  id="representative.address"
                  name="representative.address"
                  value={formData.representative?.address || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="p-field py-2">
                <label htmlFor="representative.phone">{t('representativePhone') || 'Telefon zastupnika'}</label>
                <InputText
                  id="representative.phone"
                  name="representative.phone"
                  value={formData.representative?.phone || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="p-field py-2">
                <label htmlFor="representative.jmbg">{t('representativeJmbg') || 'JMBG zastupnika'}</label>
                <InputText
                  id="representative.jmbg"
                  name="representative.jmbg"
                  value={formData.representative?.jmbg || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="p-field py-2">
                <label htmlFor="representative.birthplace">{t('representativeBirthplace') || 'Mesto rođenja zastupnika'}</label>
                <InputText
                  id="representative.birthplace"
                  name="representative.birthplace"
                  value={formData.representative?.birthplace || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="p-field py-2">
                <label htmlFor="representative.idCardNumber">{t('representativeIdCardNumber') || 'Broj lične karte zastupnika'}</label>
                <InputText
                  id="representative.idCardNumber"
                  name="representative.idCardNumber"
                  value={formData.representative?.idCardNumber || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="p-field py-2">
                <label htmlFor="representative.idCardIssuePlace">{t('representativeIdCardIssuePlace') || 'Mesto izdavanja LK zastupnika'}</label>
                <InputText
                  id="representative.idCardIssuePlace"
                  name="representative.idCardIssuePlace"
                  value={formData.representative?.idCardIssuePlace || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default EditClientDialog;
