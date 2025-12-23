import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Messages } from 'primereact/messages';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { useTranslations } from 'next-intl';
import { clientService, Client } from '@/services/client.service';

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
}

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onNext?: (data: ClientFormData) => void;
  onDataChange?: (data: ClientFormData) => void;
  uuid?: string;
  onBack?: () => void;
  availableClients?: Client[];
  loadingClients?: boolean;
}

export interface ClientFormRef {
  submitForm: () => boolean;
}

const ClientForm = forwardRef<ClientFormRef, ClientFormProps>(({ 
  initialData, 
  onNext, 
  onDataChange, 
  uuid, 
  availableClients = [], 
  loadingClients = false 
}, ref) => {
  const t = useTranslations('clients');

  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | string>('');

  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    status: 'active',
    transactionType: 'seller',
    paymentType: 'cash',
    address: '',
    phone: '',
    moneyAmount: '' as string | number,
    comment: '',
    // ...initialData, // Spread initialData to pre-fill the form
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    status: '',
    transactionType: '',
    paymentType: '',
    address: '',
    phone: '',
    moneyAmount: '',
  });
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);
  const isInitialMount = useRef(true);


  const statusOptions = [
    { label: t('active'), value: 'active' },
    { label: t('inactive'), value: 'inactive' },
    { label: t('deleted'), value: 'deleted' },
  ];

  const paymentOptions = [
    { label: t('cash'), value: 'cash' },
    { label: t('credit'), value: 'credit' },
    { label: t('combined'), value: 'combined' },
  ];

  const transactionOptions = [
    { label: t('seller'), value: 'seller' },
    { label: t('buyer'), value: 'buyer' },
    { label: t('rents'), value: 'rents' },
    { label: t('rentsOut'), value: 'rents-out' },
  ];

  const searchClients = (event: AutoCompleteCompleteEvent) => {
    const query = event.query.toLowerCase();
    const filtered = availableClients.filter(client =>
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
    setFilteredClients(filtered);
  };

  const handleClientSelect = (e: { value: Client | string }) => {
    const client = e.value;
    setSelectedClient(client);
    if (client && typeof client !== 'string') {
      setClientData({
        name: client.name,
        email: client.email,
        status: client.status,
        transactionType: client.transactionType,
        paymentType: client.paymentType || 'cash',
        address: client.address || '',
        phone: client.phone || '',
        moneyAmount: client.moneyAmount || '',
        comment: client.comment || '',
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedClient('');
    setClientData({
      name: '',
      email: '',
      status: 'active',
      transactionType: 'seller',
      paymentType: 'cash',
      address: '',
      phone: '',
      moneyAmount: '',
      comment: '',
    });
  };

  // Initialize form data only once
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setClientData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // Only update the UUID, not the entire initialData
    setClientData((prev) => ({
      ...prev,
      propertyUUID: uuid,
    }));
  }, [uuid]); // Remove initialData from dependencies

  // Call onDataChange whenever clientData changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip the first call on mount
    }
    onDataChange?.(clientData);
  }, [clientData]); // Remove onDataChange from dependencies

  // Update form data when UUID changes
  // useEffect(() => {
  //   setClientData(prev => ({ ...prev, propertyUUID: uuid }));
  // }, [uuid]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim() === '' ? t('errorNameRequired') : '';
      case 'email':
        return value.trim() === ''
          ? t('errorEmailRequired')
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? t('errorEmailInvalid')
            : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value || ''}));
    if (['name', 'email', 'address'].includes(name)) {
      setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['name', 'email', 'address'].includes(name)) {
      setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const isFormValid = () => {
    return ['name', 'email', 'address'].every(
      (field) => formErrors[field as keyof typeof formErrors] === '' && clientData[field as keyof ClientFormData].toString().trim() !== '',
    );
  };

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    submitForm: handleSubmit,
  }));

  const handleSubmit = () => {
    if (validateForm()) {
      onNext?.(clientData); // Notify parent to proceed
      return true;
    }
    return false;
  };

  const validateForm = () => {
    const isValid = true;
    const errors = { ...formErrors };

    setFormErrors(errors);
    return isValid;
  };

  const handleDropdownChange = (e: { target: { id: string; value: string } }) => {
    const { id, value } = e.target;
    setClientData((prev) => ({ ...prev, [id]: value }));
    if (id === 'propertyType') {
      setFormErrors((prev) => ({ ...prev, [id]: validateField(id, value) }));
    }
  };

  const handleDropdownBlur = (fieldName: string) => {
    if (fieldName === 'propertyType') {
      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: validateField(fieldName, clientData[fieldName as keyof ClientFormData] as string),
      }));
    }
  };

  return (
    <div>
      <h3>{t('clientDetails')}</h3>
      <Messages ref={messagesRef} />

      {/* Client Selection AutoComplete */}
      <div className="field mb-4 p-3 surface-ground border-round">
        <label htmlFor="clientSearch" className="block text-900 font-medium mb-2">
          {t('searchExistingClient') || 'Search Existing Client'}
        </label>
        <div className="flex gap-2 align-items-center">
          <AutoComplete
            id="clientSearch"
            value={selectedClient}
            suggestions={filteredClients}
            completeMethod={searchClients}
            field="name"
            onChange={handleClientSelect}
            placeholder={t('typeToSearch') || 'Type client name or email...'}
            className="flex-1"
            dropdown
            forceSelection={false}
            itemTemplate={(client: Client) => (
              <div className="flex flex-column">
                <span className="font-semibold">{client.name}</span>
                <small className="text-500">{client.email}</small>
              </div>
            )}
            disabled={loadingClients}
          />
          {selectedClient && (
            <Button
              type="button"
              icon="pi pi-times"
              className="p-button-outlined p-button-secondary"
              onClick={handleClearSelection}
              tooltip={t('clearSelection') || 'Clear and create new client'}
              tooltipOptions={{ position: 'top' }}
            />
          )}
        </div>
        <small className="text-500 block mt-2">
          <i className="pi pi-info-circle mr-1"></i>
          {selectedClient && typeof selectedClient !== 'string'
            ? t('clientSelectedHint') || 'Client selected. Edit fields below or clear to create new.' 
            : t('clientSearchHint') || 'Start typing to search for existing clients, or leave empty to create new.'}
        </small>
      </div>

      <div className="client-form-grid">
        <div className="form-column">

          <div className="p-field py-2">
            <label htmlFor="name">Name <span className="text-red-500">*</span></label>
            <InputText
              id="name"
              name="name"
              value={clientData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={formErrors.name ? 'p-invalid' : ''}
            />
            {formErrors.name && <small className="p-error">{formErrors.name}</small>}
          </div>

          <div className="p-field py-2">
            <label htmlFor="email">{t('email')} <span className="text-red-500">*</span></label>
            <InputText
              id="email"
              name="email"
              value={clientData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={formErrors.email ? 'p-invalid' : ''}
            />
            {formErrors.email && <small className="p-error">{formErrors.email}</small>}
          </div>

          <div className="p-field py-2">
            <label htmlFor="address">{t('address')} <span className="text-red-500">*</span></label>
            <InputText
              id="address"
              name="address"
              value={clientData.address}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={formErrors.address ? 'p-invalid' : ''}
            />
            {formErrors.address && <small className="p-error">{formErrors.address}</small>}
          </div>

          <div className="p-field py-2">
            <label htmlFor="phone">{t('phone')} <span className="text-red-500">*</span></label>
            <InputText
              id="phone"
              name="phone"
              value={clientData.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={formErrors.phone ? 'p-invalid' : ''}
            />
            {formErrors.phone && <small className="p-error">{formErrors.phone}</small>}
          </div>

        </div>

        <div className="form-column">
          <div className="p-field py-2">
            <label htmlFor="status">{t('status')}</label>
            <Dropdown
              id="status"
              value={clientData.status}
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
            <label htmlFor="transactionType">{t('transactionType')}</label>
            <Dropdown
              id="transactionType"
              value={clientData.transactionType}
              options={transactionOptions}
              onChange={handleDropdownChange}
              onBlur={() => handleDropdownBlur('transactionType')}
              placeholder={t('selectTransactionType')}
              className={formErrors.transactionType ? 'p-invalid' : ''}
            />
            {formErrors.transactionType && (
              <small className="p-error">{formErrors.transactionType}</small>
            )}
          </div>

          <div className="p-field py-2">
            <label htmlFor="paymentType">{t('paymentType')}</label>
            <Dropdown
              id="paymentType"
              value={clientData.paymentType}
              options={paymentOptions}
              onChange={handleDropdownChange}
              onBlur={() => handleDropdownBlur('paymentType')}
              placeholder={t('selectPaymentType')}
              className={formErrors.paymentType ? 'p-invalid' : ''}
            />
            {formErrors.paymentType && (
              <small className="p-error">{formErrors.paymentType}</small>
            )}
          </div>

          <div className="p-field py-2">
            <label htmlFor="moneyAmount">{t('amount')}</label>
            <InputText
              id="moneyAmount"
              name="moneyAmount"
              type="number"
              min={0}
              value={clientData.moneyAmount?.toString()}
              onChange={(e) =>
                setClientData((prev) => ({
                  ...prev,
                  moneyAmount: e.target.value ? parseFloat(e.target.value) : 0, // Parse to number or set to empty string
                }))}
              onBlur={handleBlur}
              className={formErrors.moneyAmount ? 'p-invalid' : ''}
            />
            {formErrors.moneyAmount && <small className="p-error">{formErrors.moneyAmount}</small>}
          </div>
        </div>

        <div className="p-field py-2">
          <label htmlFor="comment">{t('comment')}</label>
          <InputTextarea
            id="comment"
            name="comment"
            value={clientData.comment}
            onChange={(e) =>
              setClientData((prev) => ({
                ...prev,
                comment: e.target.value
              }))
            }
            rows={5} // Number of visible rows
            cols={30} // Number of visible columns
            autoResize
          />
        </div>
      </div>
    </div>
  );
});

ClientForm.displayName = 'ClientForm';

export default ClientForm;
