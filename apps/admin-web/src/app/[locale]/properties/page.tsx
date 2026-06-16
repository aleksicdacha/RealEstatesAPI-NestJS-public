'use client';

import { useState, useEffect, useRef } from 'react';
import { DataTable, DataTableSortEvent, SortOrder } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { MultiSelect } from 'primereact/multiselect';
import { InputSwitch } from 'primereact/inputswitch';
import { SelectButton } from 'primereact/selectbutton';
import { useTranslations } from 'next-intl';

// Import PrimeReact CSS files
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { fetchData } from '../../utils/fetchUtils';
import { formatCurrency } from '../../utils/currency';
import PropertyWizard from '../../components/PropertyWizard';
import EditPropertyDialog from '../../components/EditPropertyDialog';
import {
  PropertyFilters,
  PropertyFilterValues,
} from '../../components/PropertyFilters';
import { PropertyMapView } from '../../components/PropertyMapView';
import { Property } from '../../../services/property.service';
import { translatePropertyType } from '../../utils/propertyTypeTranslation';
import { apiClient } from '../../../lib/api-client';

export default function PropertiesPage() {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>(-1);
  const [filters, setFilters] = useState<PropertyFilterValues>({});
  const [showMap, setShowMap] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(
    null,
  );

  const [isWizardVisible, setWizardVisible] = useState(false);

  const openNew = () => {
    setWizardVisible(true); // Show the wizard
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [propertyForm, setPropertyForm] = useState<Property | null>(null);

  // Status change dialog
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [statusProperty, setStatusProperty] = useState<Property | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('active');

  const statusOptions = [
    { label: t('available'), value: 'active' },
    { label: t('reserved'), value: 'inactive' },
    { label: tCommon('delete'), value: 'deleted' },
  ];

  const dt = useRef<DataTable<Property[]>>(null);
  const toast = useRef<Toast>(null);

  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  useEffect(() => {
    loadProperties();
  }, [
    page,
    pageSize,
    sortBy,
    sortOrder,
    statusFilter,
    propertyTypeFilter,
    filters,
  ]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      // Build query parameters from filters
      const queryParams: any = {
        page: page + 1,
        limit: pageSize,
        sortBy,
        order: sortOrder === -1 ? 'DESC' : 'ASC',
      };

      // Add status filter
      if (statusFilter && statusFilter.length > 0) {
        queryParams.status = statusFilter.join(',');
      }

      // Add property type filter
      if (propertyTypeFilter && propertyTypeFilter.length > 0) {
        queryParams.propertyType = propertyTypeFilter.join(',');
      }

      // Add advanced filters
      if (filters.code) {
        queryParams.searchField = 'code';
        queryParams.searchValue = filters.code;
      }
      if (filters.city) queryParams.city = filters.city;
      if (filters.neighborhoods && filters.neighborhoods.length > 0) {
        queryParams.neighborhoods = filters.neighborhoods.join(',');
      }
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        queryParams.propertyType = filters.propertyTypes.join(',');
      }
      if (filters.status && filters.status.length > 0) {
        queryParams.status = filters.status.join(',');
      }
      if (filters.roomStructure && filters.roomStructure.length > 0) {
        queryParams.roomStructure = filters.roomStructure.join(',');
      }
      if (filters.priceFrom !== undefined && filters.priceFrom !== null)
        queryParams.minPrice = filters.priceFrom;
      if (filters.priceTo !== undefined && filters.priceTo !== null)
        queryParams.maxPrice = filters.priceTo;
      if (filters.areaFrom !== undefined && filters.areaFrom !== null)
        queryParams.minArea = filters.areaFrom;
      if (filters.areaTo !== undefined && filters.areaTo !== null)
        queryParams.maxArea = filters.areaTo;
      if (filters.bathrooms && filters.bathrooms.length > 0) {
        queryParams.bathrooms = filters.bathrooms.join(',');
      }
      if (filters.floors && filters.floors.length > 0) {
        queryParams.floors = filters.floors.join(',');
      }
      if (filters.heating && filters.heating.length > 0) {
        queryParams.heating = filters.heating.join(',');
      }
      if (filters.features && filters.features.length > 0) {
        queryParams.features = filters.features.join(',');
      }

      console.log('🔍 Loading properties with filters:', queryParams);

      const result = await fetchData('properties', queryParams);
      console.log(
        '📊 Received properties:',
        result.items.length,
        'Total:',
        result.meta.totalItems,
      );

      setProperties(result.items);
      setTotalRecords(result.meta.totalItems);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await apiClient.delete(`/properties/${id}`);
      toast.current?.show({
        severity: 'success',
        summary: t('success'),
        detail: t('deleteSuccess'),
        life: 3000,
      });
      loadProperties();
    } catch (error) {
      console.error('Deletion error:', error);
      toast.current?.show({
        severity: 'error',
        summary: t('error'),
        detail: t('deleteError'),
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSort = (event: DataTableSortEvent) => {
    setSortBy(event.sortField || 'createdAt');
    setSortOrder(event.sortOrder || -1);
  };

  const onPageChange = (event: { first: number; rows: number }) => {
    setPage(event.first / event.rows);
    setPageSize(event.rows);
  };

  const editProperty = (property: Property) => {
    setPropertyForm(property);
    setDialogVisible(true);
  };

  const deleteProperty = (property: Property) => {
    confirmDialog({
      message: `Are you sure you want to delete ${property.code}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        handleDeleteProperty(property.id);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `${property.code} deleted`,
        });
        loadProperties();
      },
    });
  };

  const openStatusDialog = (property: Property) => {
    setStatusProperty(property);
    setSelectedStatus(property.status || 'active');
    setStatusDialogVisible(true);
  };

  const handleStatusChange = async () => {
    if (!statusProperty) return;
    try {
      await apiClient.put(`/properties/${statusProperty.id}`, {
        status: selectedStatus,
      });
      toast.current?.show({
        severity: 'success',
        summary: tCommon('success'),
        detail: `${statusProperty.code} → ${selectedStatus}`,
      });
      setStatusDialogVisible(false);
      loadProperties();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: tCommon('error'),
        detail: 'Failed to update status',
      });
    }
  };

  const actionBodyTemplate = (rowData: Property) => (
    <div className="actions flex gap-1">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success"
        onClick={() => editProperty(rowData)}
        tooltip={tCommon('edit')}
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-sync"
        className="p-button-rounded p-button-warning"
        onClick={() => openStatusDialog(rowData)}
        tooltip={t('changeStatus')}
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => deleteProperty(rowData)}
        tooltip={tCommon('delete')}
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  const propertyTypeBodyTemplate = (rowData: Property) => {
    return translatePropertyType(rowData.propertyType, t);
  };

  const statusFilterTemplate = () => (
    <MultiSelect
      value={statusFilter}
      options={[
        { label: t('available'), value: 'active' },
        { label: t('reserved'), value: 'inactive' },
        { label: tCommon('delete'), value: 'deleted' },
      ]}
      onChange={(e) => setStatusFilter(e.value)}
      placeholder={t('filterByStatus')}
      display="chip"
    />
  );

  const propertyTypeFilterTemplate = () => (
    <MultiSelect
      value={propertyTypeFilter}
      options={[
        { label: t('typeApartment'), value: 'apartment' },
        { label: t('typeHouse'), value: 'house' },
        { label: t('typeApartmentInHouse'), value: 'apartment-in-house' },
        { label: t('typeCommercialSpace'), value: 'commercial-space' },
        { label: t('typeOffice'), value: 'office' },
        { label: t('typeLand'), value: 'land' },
        { label: t('typeVacationHome'), value: 'vacation-home' },
        { label: t('typeDuplex'), value: 'duplex' },
      ]}
      onChange={(e) => setPropertyTypeFilter(e.value)}
      placeholder={t('filterByType')}
      display="chip"
    />
  );

  const handleFilterChange = (newFilters: PropertyFilterValues) => {
    console.log('📥 Properties page received filters:', newFilters);
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setStatusFilter([]);
    setPropertyTypeFilter([]);
    setPage(0);
  };

  const handleMapPropertyClick = (property: Property) => {
    editProperty(property);
  };

  const refreshTable = () => {
    loadProperties(); // Refresh the table
    setWizardVisible(false); // Close the wizard dialog
  };

  // Price formatting templates
  const priceBodyTemplate = (rowData: Property) => {
    return formatCurrency(rowData.price);
  };

  const salePriceBodyTemplate = (rowData: Property) => {
    return formatCurrency(rowData.salePrice);
  };

  const createdAtBodyTemplate = (rowData: Property) => {
    if (!rowData.createdAt) return '-';
    const date = new Date(rowData.createdAt);
    return date.toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const statusBodyTemplate = (rowData: Property) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case 'active':
          return 'success';
        case 'inactive':
          return 'warning';
        case 'deleted':
          return 'danger';
        default:
          return 'info';
      }
    };

    return (
      <Tag
        value={rowData.status}
        severity={getSeverity(rowData.status)}
        className="rounded-full"
      />
    );
  };

  return (
    <div className="datatable-crud-demo">
      <Toast ref={toast} />

      {/* Action bar with New Property button */}
      <div className="flex justify-between items-center mb-4">
        <Button
          label={t('newProperty')}
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNew}
        />
      </div>

      {/* Property Filters */}
      <PropertyFilters
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Map Toggle Switch */}
      <div
        className="flex justify-end items-center mb-4"
        style={{ marginTop: '20px' }}
      >
        <label className="mr-3 font-medium text-gray-700">
          <i className="pi pi-map mr-2"></i>
          {t('showMap')}
        </label>
        <InputSwitch checked={showMap} onChange={(e) => setShowMap(e.value)} />
      </div>

      {/* Main Content: Table and Map */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Left side - Data Table */}
        <div style={{ flex: 2, minWidth: 0 }}>
          {/* Full-page loading overlay */}
          {loading && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
              }}
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          <DataTable
            ref={dt}
            value={
              loading
                ? Array.from(
                    { length: pageSize },
                    (_, index) =>
                      ({
                        id: `skeleton-${index}`,
                        code: '',
                        area: 0,
                        price: 0,
                        salePrice: 0,
                        propertyType: 'apartment',
                        status: 'active',
                        address: '',
                        createdAt: new Date().toISOString(),
                      }) as Property,
                  )
                : properties
            }
            selection={selectedProperties}
            onSelectionChange={(e) =>
              !loading
                ? setSelectedProperties(e.value as Property[])
                : undefined
            }
            selectionMode="multiple"
            dataKey="id"
            paginator
            rows={pageSize}
            rowsPerPageOptions={[10, 25, 50, 100, totalRecords]}
            totalRecords={totalRecords}
            lazy
            first={page * pageSize}
            sortField={sortBy}
            sortOrder={sortOrder}
            loading={false}
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} properties"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            onSort={onSort}
            onPage={onPageChange}
            onRowMouseEnter={(e) =>
              !loading && showMap && setHoveredPropertyId(e.data.id)
            }
            onRowMouseLeave={() =>
              !loading && showMap && setHoveredPropertyId(null)
            }
          >
            <Column
              field="code"
              header={t('code')}
              sortable
              style={{ minWidth: '8rem' }}
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-8rem"></div>
                  : null
              }
            ></Column>
            <Column
              field="neighborhood"
              header={t('neighborhood')}
              style={{ minWidth: '10rem' }}
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-6rem"></div>
                  : null
              }
            ></Column>
            <Column
              field="area"
              header={t('area')}
              sortable
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-4rem"></div>
                  : null
              }
            ></Column>
            <Column
              field="price"
              header={t('ownerPrice')}
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-6rem"></div>
                  : priceBodyTemplate
              }
              sortable
            ></Column>
            <Column
              field="salePrice"
              header={t('salePrice')}
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-6rem"></div>
                  : salePriceBodyTemplate
              }
              sortable
            ></Column>
            <Column
              field="createdAt"
              header={t('createdAt')}
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-5rem"></div>
                  : createdAtBodyTemplate
              }
              sortable
              style={{ minWidth: '10rem' }}
            ></Column>
            <Column
              field="propertyType"
              header={t('type')}
              sortable
              filter
              filterElement={propertyTypeFilterTemplate()}
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-5rem"></div>
                  : propertyTypeBodyTemplate
              }
            ></Column>
            <Column
              field="status"
              header={t('status')}
              sortable
              filter
              filterElement={statusFilterTemplate()}
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-4rem"></div>
                  : statusBodyTemplate
              }
            ></Column>
            <Column
              body={
                loading
                  ? () => <div className="skeleton-line h-1rem w-3rem"></div>
                  : actionBodyTemplate
              }
            ></Column>
          </DataTable>
        </div>

        {/* Right side - Map */}
        {showMap && (
          <div style={{ flex: '1', minWidth: '400px' }}>
            <div style={{ position: 'sticky', top: '20px' }}>
              <PropertyMapView
                properties={properties}
                onPropertyClick={handleMapPropertyClick}
                height="calc(100vh - 200px)"
                hoveredPropertyId={hoveredPropertyId}
              />
            </div>
          </div>
        )}
      </div>

      <Dialog
        visible={isWizardVisible}
        style={{ width: '70vw', position: 'static', height: 'max-content' }}
        header={t('createProperty')}
        modal
        className="p-fluid"
        onHide={() => setWizardVisible(false)}
      >
        {isWizardVisible && <PropertyWizard onCompleted={refreshTable} />}
      </Dialog>

      {isDialogVisible && propertyForm && (
        <EditPropertyDialog
          onCloseDialog={handleCloseDialog}
          propertyData={propertyForm}
          onSuccess={loadProperties}
        />
      )}

      <ConfirmDialog />

      <Dialog
        visible={statusDialogVisible}
        style={{ width: '400px' }}
        header={`Change Status: ${statusProperty?.code || ''}`}
        modal
        onHide={() => setStatusDialogVisible(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label={tCommon('cancel')}
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setStatusDialogVisible(false)}
            />
            <Button
              label={tCommon('save')}
              icon="pi pi-check"
              className="p-button-warning"
              onClick={handleStatusChange}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600">
            Select new status for <strong>{statusProperty?.code}</strong>:
          </p>
          <SelectButton
            value={selectedStatus}
            options={statusOptions}
            onChange={(e) => setSelectedStatus(e.value)}
            optionLabel="label"
            className="w-full"
          />
        </div>
      </Dialog>
    </div>
  );
}
