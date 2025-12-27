"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import PropertyWizard from '../PropertyWizard';

export const QuickActions: React.FC = () => {
  const t = useTranslations('dashboard');
  const tProperties = useTranslations('properties');
  const router = useRouter();
  const [isPropertyWizardVisible, setPropertyWizardVisible] = useState(false);

  const handlePropertyCreated = () => {
    setPropertyWizardVisible(false);
    // Optionally, you could refresh dashboard data here
  };

  return (
    <>
      <Card title={t('quickActions')}>
        <div className="flex flex-wrap gap-3">
          <Button
            label={t('addProperty')}
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setPropertyWizardVisible(true)}
          />
          <Button
            label={t('addClient')}
            icon="pi pi-user-plus"
            className="p-button-info"
            onClick={() => router.push('/clients')}
          />
          <Button
            label={t('viewReports')}
            icon="pi pi-chart-bar"
            className="p-button-warning"
            onClick={() => {
              // Reports functionality not implemented yet
              console.log('Reports feature coming soon');
            }}
          />
          <Button
            label={t('settings')}
            icon="pi pi-cog"
            className="p-button-secondary"
            onClick={() => {
              // Settings functionality not implemented yet
              console.log('Settings feature coming soon');
            }}
          />
        </div>
      </Card>

      <Dialog
        visible={isPropertyWizardVisible}
        style={{ width: "70vw", position:"static", height: "max-content" }}
        header={tProperties('createProperty')}
        modal
        className="p-fluid"
        onHide={() => setPropertyWizardVisible(false)}
      >
        {isPropertyWizardVisible && <PropertyWizard onCompleted={handlePropertyCreated} />}
      </Dialog>
    </>
  );
};