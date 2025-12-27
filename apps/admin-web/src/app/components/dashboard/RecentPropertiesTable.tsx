"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Property } from '@/services/property.service';
import { formatCurrency } from '../../utils/currency';
import PropertyPreviewDialog from '../PropertyPreviewDialog';
import EditPropertyDialog from '../EditPropertyDialog';

interface RecentPropertiesTableProps {
  properties: Property[];
  loading: boolean;
  onRefresh?: () => void;
}

export const RecentPropertiesTable: React.FC<RecentPropertiesTableProps> = ({ 
  properties, 
  loading,
  onRefresh
}) => {
  const t = useTranslations('dashboard');
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [isEditVisible, setEditVisible] = useState(false);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'deleted': return 'danger';
      default: return 'info';
    }
  };

  const statusBodyTemplate = (rowData: Property) => {
    return <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />;
  };

  const priceBodyTemplate = (rowData: Property) => {
    const price = parseFloat(rowData.price.toString()) || 0;
    return formatCurrency(price);
  };

  const handlePreview = (property: Property) => {
    setPreviewProperty(property);
    setPreviewVisible(true);
  };

  const handleEdit = (property: Property) => {
    setPreviewVisible(false);
    setEditProperty(property);
    setEditVisible(true);
  };

  const handleEditClose = () => {
    setEditVisible(false);
    setEditProperty(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const actionBodyTemplate = (rowData: Property) => {
    return (
      <Button
        icon="pi pi-eye"
        size="small"
        text
        onClick={() => handlePreview(rowData)}
      />
    );
  };

  return (
    <>
      <Card title={t('recentProperties')} className="h-full">
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex align-items-center p-3 border-bottom-1 surface-border">
                <Skeleton shape="circle" size="3rem" className="mr-3" />
                <div className="flex-1">
                  <Skeleton width="100%" height="1rem" className="mb-2" />
                  <Skeleton width="80%" height="0.8rem" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable value={properties} size="small" showGridlines>
            <Column field="code" header={t('code')} style={{ width: '15%' }} />
            <Column field="address" header={t('address')} style={{ width: '40%' }} />
            <Column field="status" header={t('status')} body={statusBodyTemplate} style={{ width: '15%' }} />
            <Column field="price" header={t('price')} body={priceBodyTemplate} style={{ width: '20%' }} />
            <Column body={actionBodyTemplate} style={{ width: '10%' }} />
          </DataTable>
        )}
      </Card>

      <PropertyPreviewDialog
        visible={isPreviewVisible}
        property={previewProperty}
        onHide={() => setPreviewVisible(false)}
        onEdit={handleEdit}
      />

      {isEditVisible && editProperty && (
        <EditPropertyDialog
          onCloseDialog={handleEditClose}
          propertyData={editProperty}
          onSuccess={handleEditClose}
        />
      )}
    </>
  );
};