"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../../utils/currency";
import { Client } from "../../../services/client.service";
import { translatePropertyType } from "../../utils/propertyTypeTranslation";
import ClientWizard from "../../components/ClientWizard";
import EditClientDialog from "../../components/EditClientDialog";
import { apiClient } from "../../../lib/api-client";

export default function ClientsPage() {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');
  const tProperties = useTranslations('properties');
  const [clients, setClients] = useState<Client[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [isWizardVisible, setWizardVisible] = useState(false);
  const [isEditDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  const dt = useRef<DataTable<Client[]>>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadClients();
  }, []); // Only load on mount since API doesn't support pagination/filtering

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Client[]>('/clients');
      setClients(data);
      setTotalRecords(data.length);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.current?.show({
        severity: "error",
        summary: t('error'),
        detail: t('loadError'),
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await apiClient.delete(`/clients/${id}`);
      toast.current?.show({
        severity: "success",
        summary: t('success'),
        detail: t('deleteSuccess'),
        life: 3000,
      });
      loadClients();
    } catch (error) {
      console.error("Deletion error:", error);
      toast.current?.show({
        severity: "error",
        summary: t('error'),
        detail: t('deleteError'),
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };



  const editClient = (client: Client) => {
    setSelectedClient(client);
    setEditDialogVisible(true);
  };

  const deleteClient = (client: Client) => {
    confirmDialog({
      message: `${tCommon('delete')} ${client.name}?`,
      header: tCommon('delete'),
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        handleDeleteClient(client.id);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: `${client.name} ${tCommon('delete')}`,
        });
        loadClients();
      },
    });
  };

  const openNew = () => {
    setWizardVisible(true);
  };

  const closeWizard = () => {
    setWizardVisible(false);
  };

  const handleWizardSuccess = () => {
    loadClients();
  };

  const actionBodyTemplate = (rowData: Client) => (
    <div className="actions">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success mr-2"
        onClick={() => editClient(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => deleteClient(rowData)}
      />
    </div>
  );

  const translateTransactionType = (type: string) => {
    switch (type) {
      case 'seller': return t('seller');
      case 'buyer': return t('buyer');
      case 'rents': return t('rents');
      case 'rents-out': return t('rentsOut');
      default: return type;
    }
  };

  const translatePaymentType = (type: string) => {
    switch (type) {
      case 'cash': return t('cash');
      case 'credit': return t('credit');
      case 'combined': return t('combined');
      default: return type;
    }
  };

  const statusBodyTemplate = (rowData: Client) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'warning';
        case 'deleted': return 'danger';
        default: return 'info';
      }
    };

    return <Tag value={rowData.status} severity={getSeverity(rowData.status)} className="rounded-full" />;
  };

  const transactionTypeBodyTemplate = (rowData: Client) => {
    const getSeverity = (type: string) => {
      switch (type) {
        case 'seller': return 'success';
        case 'buyer': return 'info';
        case 'rents': return 'warning';
        case 'rents-out': return 'contrast';
        default: return 'secondary';
      }
    };

    return <Tag value={translateTransactionType(rowData.transactionType)} severity={getSeverity(rowData.transactionType)} className="rounded-full" />;
  };

  const paymentTypeBodyTemplate = (rowData: Client) => {
    return <Tag value={translatePaymentType(rowData.paymentType)} severity="secondary" className="rounded-full" />;
  };

  const propertyBodyTemplate = (rowData: Client) => {
    if (rowData.property) {
      return (
        <div>
          <div className="font-bold">{rowData.property.code}</div>
          <div className="text-sm text-gray-600">{translatePropertyType(rowData.property.propertyType, tProperties)}</div>
        </div>
      );
    }
    return <span className="text-gray-400">No property assigned</span>;
  };

  const moneyAmountBodyTemplate = (rowData: Client) => {
    if (rowData.moneyAmount) {
      return formatCurrency(rowData.moneyAmount);
    }
    return '-';
  };



  const header = (
    <div className="table-header">
      <Button
        label={t('newClient')}
        icon="pi pi-plus"
        className="p-button-success"
        onClick={openNew}
      />
      <span className="p-input-icon-left ml-2">
        <i className="pi pi-search pl-2" />
        <InputText
          type="search"
          className="pl-4"
          placeholder={tCommon('globalSearch')}
          onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
        />
      </span>
    </div>
  );

  return (
    <div className="datatable-crud-demo">
      <Toast ref={toast} />
      {/*<Toolbar className="mb-4" />*/}
      
      {/* Full-page loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      
      <DataTable
        ref={dt}
        value={loading ? Array.from({ length: pageSize }, (_, index) => ({ 
          id: `skeleton-${index}`,
          name: '',
          email: '',
          phone: '',
          address: '',
          transactionType: 'buyer',
          paymentType: 'cash',
          moneyAmount: 0,
        } as Client)) : clients}
        selection={selectedClients}
        onSelectionChange={(e) => !loading ? setSelectedClients(Array.isArray(e.value) ? e.value : [e.value]) : undefined}
        selectionMode="multiple"
        dataKey="id"
        paginator
        rows={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        header={header}
        loading={false}
        globalFilter={globalFilter}
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} clients"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
        <Column field="name" header={t('name')} sortable style={{ minWidth: "12rem" }} body={loading ? () => <div className="skeleton-line h-1rem w-8rem"></div> : null}></Column>
        <Column field="email" header={t('email')} sortable body={loading ? () => <div className="skeleton-line h-1rem w-10rem"></div> : null}></Column>
        <Column field="phone" header={t('phone')} sortable body={loading ? () => <div className="skeleton-line h-1rem w-6rem"></div> : null}></Column>
        <Column field="address" header={t('address')} sortable body={loading ? () => <div className="skeleton-line h-1rem w-12rem"></div> : null}></Column>
        <Column
          field="transactionType"
          header={t('transactionType')}
          sortable
          body={loading ? () => <div className="skeleton-line h-1rem w-5rem"></div> : transactionTypeBodyTemplate}
        ></Column>
        <Column
          field="paymentType"
          header={t('paymentType')}
          sortable
          body={loading ? () => <div className="skeleton-line h-1rem w-4rem"></div> : paymentTypeBodyTemplate}
        ></Column>
        <Column
          field="moneyAmount"
          header={t('amount')}
          sortable
          body={loading ? () => <div className="skeleton-line h-1rem w-5rem"></div> : moneyAmountBodyTemplate}
        ></Column>
        <Column
          field="property"
          header={t('property')}
          body={loading ? () => <div className="skeleton-line h-1rem w-6rem"></div> : propertyBodyTemplate}
        ></Column>
        <Column body={loading ? () => <div className="skeleton-line h-1rem w-3rem"></div> : actionBodyTemplate} header={tCommon('actions')}></Column>
      </DataTable>

      <ClientWizard 
        visible={isWizardVisible}
        onHide={closeWizard}
        onSuccess={handleWizardSuccess}
      />

      <EditClientDialog
        visible={isEditDialogVisible}
        client={selectedClient}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleWizardSuccess}
      />

      <ConfirmDialog />
    </div>
  );
}
