import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useRouter } from 'next/router';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { RadioButton } from 'primereact/radiobutton';
import { InputSwitch } from 'primereact/inputswitch';
import PropertyWizard from '../PropertyWizard';
import ClientWizard from '../ClientWizard';
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../utils/currency';

export const QuickActions: React.FC = () => {

    const t = useTranslations();
    const tProperties = useTranslations('properties');
    const tClients = useTranslations('clients');
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('sr');
    const [isPropertyWizardVisible, setPropertyWizardVisible] = useState(false);
    const [isClientWizardVisible, setClientWizardVisible] = useState(false);
    const [isReportsVisible, setReportsVisible] = useState(false);
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const [notifications, setNotifications] = useState({
        newClients: true,
        newProperties: true,
        systemAlerts: true,
        emailReports: false
    });
    const [dashboardSettings, setDashboardSettings] = useState({
        showQuickStats: true,
        showRecentActivity: true,
        showCharts: true,
        autoRefresh: false
    });
    const { stats } = useDashboardData();

    // Load settings from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('admin-theme') || 'light';
        const savedLanguage = localStorage.getItem('admin-language') || 'sr';
        const savedNotifications = localStorage.getItem('admin-notifications');
        const savedDashboard = localStorage.getItem('admin-dashboard');

        setTheme(savedTheme);
        setLanguage(savedLanguage);

        if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications));
        }

        if (savedDashboard) {
            setDashboardSettings(JSON.parse(savedDashboard));
        }

        // Apply theme
        applyTheme(savedTheme);
    }, []);

  // Apply theme function
  const applyTheme = (selectedTheme: string) => {
    const root = document.documentElement;
    if (selectedTheme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  };

  // Settings handlers
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
    applyTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('admin-language', newLanguage);
    // Note: Language change requires page reload for next-intl
    window.location.reload();
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    localStorage.setItem('admin-notifications', JSON.stringify(newNotifications));
  };

  const handleDashboardSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...dashboardSettings, [key]: value };
    setDashboardSettings(newSettings);
    localStorage.setItem('admin-dashboard', JSON.stringify(newSettings));
  };

  const handlePropertyCreated = () => {
    setPropertyWizardVisible(false);
    // Optionally, you could refresh dashboard data here
  };

  const handleClientCreated = () => {
    setClientWizardVisible(false);
    // Optionally, you could refresh dashboard data here
  };

  const handlePrint = (reportType: string) => {
    if (!stats) {
      console.error('Statistics are not loaded yet.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let content = '';
    const currentDate = new Date().toLocaleDateString();

    switch (reportType) {
      case 'property':
        content = `
          <html>
            <head>
              <title>${t('dashboard.propertyReports')} - ${currentDate}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat-item { text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; color: #3B82F6; }
                .stat-label { font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${t('dashboard.propertyReports')}</h1>
                <p>${currentDate}</p>
              </div>
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-value">${stats?.totalProperties ?? 0}</div>
                  <div class="stat-label">${t('dashboard.totalProperties')}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${stats?.activeProperties ?? 0}</div>
                  <div class="stat-label">${t('dashboard.activeProperties')}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${stats?.soldProperties ?? 0}</div>
                  <div class="stat-label">${t('dashboard.inactiveProperties')}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${formatCurrency(stats?.averagePrice ?? 0)}</div>
                  <div class="stat-label">${t('dashboard.averagePrice')}</div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'financial':
        content = `
          <html>
            <head>
              <title>${t('dashboard.financialReports')} - ${currentDate}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat-item { text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; color: #10B981; }
                .stat-label { font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${t('dashboard.financialReports')}</h1>
                <p>${currentDate}</p>
              </div>
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-value">${formatCurrency((stats?.totalProperties ?? 0) * (stats?.averagePrice ?? 0))}</div>
                  <div class="stat-label">${t('dashboard.totalValue')}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${formatCurrency(stats?.averagePrice ?? 0)}</div>
                  <div class="stat-label">${t('dashboard.avgPrice')}</div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'user':
        content = `
          <html>
            <head>
              <title>${t('dashboard.userReports')} - ${currentDate}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: flex; justify-content: center; margin: 20px 0; }
                .stat-item { text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; color: #6366F1; }
                .stat-label { font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${t('dashboard.userReports')}</h1>
                <p>${currentDate}</p>
              </div>
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-value">${stats?.totalUsers ?? 0}</div>
                  <div class="stat-label">${t('dashboard.totalUsers')}</div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'client':
        content = `<html><head><title>${t('dashboard.clientReports')} - ${currentDate}</title></head><body><div class=\"header\"><h1>${t('dashboard.clientReports')}</h1><p>${currentDate}</p></div><div>No client statistics available.</div></body></html>`;
        break;
    }

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = async (reportType: string) => {
    if (!stats) {
      console.error('Statistics are not loaded yet.');
      return;
    }

    let csvContent = '';
    const currentDate = new Date().toLocaleDateString();

    switch (reportType) {
      case 'property':
        // Export property statistics
        csvContent = `Property Report - ${currentDate}\n\n`;
        csvContent += 'Metric,Value\n';
        csvContent += `Total Properties,${stats?.totalProperties ?? 0}\n`;
        csvContent += `Active Properties,${stats?.activeProperties ?? 0}\n`;
        csvContent += `Sold Properties,${stats?.soldProperties ?? 0}\n`;
        csvContent += `Average Price,${stats?.averagePrice ?? 0}\n`;
        break;

      case 'financial':
        // Export financial data
        csvContent = `Financial Report - ${currentDate}\n\n`;
        csvContent += 'Metric,Value\n';
        csvContent += `Total Value,${(stats?.totalProperties ?? 0) * (stats?.averagePrice ?? 0)}\n`;
        csvContent += `Average Price,${stats?.averagePrice ?? 0}\n`;
        break;

      case 'user':
        // Export user statistics
        csvContent = `User Report - ${currentDate}\n\n`;
        csvContent += 'Metric,Value\n';
        csvContent += `Total Users,${stats?.totalUsers ?? 0}\n`;
        break;

      // Client export removed: client stats are not available in DashboardStats
      case 'client':
        csvContent = `Client Report - ${currentDate}\n\nNo client statistics available.\n`;
        break;
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card title={t('dashboard.quickActions')}>
        <div className="flex flex-wrap gap-3">
          <Button
            label={t('dashboard.addProperty')}
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setPropertyWizardVisible(true)}
          />
          <Button
            label={t('dashboard.addClient')}
            icon="pi pi-user-plus"
            className="p-button-info"
            onClick={() => setClientWizardVisible(true)}
          />
          <Button
            label={t('dashboard.viewReports')}
            icon="pi pi-chart-bar"
            className="p-button-warning"
            onClick={() => setReportsVisible(true)}
          />
          <Button
            label={t('dashboard.settings')}
            icon="pi pi-cog"
            className="p-button-secondary"
            onClick={() => setSettingsVisible(true)}
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

      <ClientWizard
        visible={isClientWizardVisible}
        onHide={() => setClientWizardVisible(false)}
        onSuccess={handleClientCreated}
      />

      <Dialog
        visible={isReportsVisible}
        style={{ width: "80vw", maxWidth: "1200px" }}
        header={t('dashboard.reports')}
        modal
        className="p-fluid"
        onHide={() => setReportsVisible(false)}
      >
        <TabView>
          <TabPanel header={t('dashboard.propertyReports')}>
            <div className="flex justify-content-end gap-2 mb-3">
              <Button
                label={t('dashboard.print')}
                icon="pi pi-print"
                className="p-button-outlined p-button-secondary"
                onClick={() => handlePrint('property')}
              />
              <Button
                label={t('dashboard.exportCSV')}
                icon="pi pi-download"
                className="p-button-outlined p-button-success"
                onClick={() => handleExportCSV('property')}
              />
            </div>
            <div className="grid">
              <div className="col-12 md:col-6">
                <Card title={t('dashboard.propertyStatistics')}>
                  <div className="grid">
                    <div className="col-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats?.totalProperties ?? 0}</div>
                        <div className="text-sm text-gray-600">{t('dashboard.totalProperties')}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{stats?.activeProperties ?? 0}</div>
                        <div className="text-sm text-gray-600">{t('dashboard.activeProperties')}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{stats?.soldProperties ?? 0}</div>
                        <div className="text-sm text-gray-600">{t('dashboard.inactiveProperties')}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats?.averagePrice ?? 0)}</div>
                        <div className="text-sm text-gray-600">{t('dashboard.averagePrice')}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="col-12 md:col-6">
                <Card title={t('dashboard.propertyTrends')}>
                  <Chart 
                    type="line" 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                      datasets: [{
                        label: t('dashboard.totalProperties'),
                        data: [],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                      }]
                    }} 
                    options={{ responsive: true, maintainAspectRatio: false }}
                    style={{ height: '200px' }}
                  />
                </Card>
              </div>
            </div>
          </TabPanel>
          
          <TabPanel header={t('dashboard.financialReports')}>
            <div className="flex justify-content-end gap-2 mb-3">
              <Button
                label={t('dashboard.print')}
                icon="pi pi-print"
                className="p-button-outlined p-button-secondary"
                onClick={() => handlePrint('financial')}
              />
              <Button
                label={t('dashboard.exportCSV')}
                icon="pi pi-download"
                className="p-button-outlined p-button-success"
                onClick={() => handleExportCSV('financial')}
              />
            </div>
            <div className="grid">
              <div className="col-12 md:col-6">
                <Card title={t('dashboard.revenueAnalysis')}>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-green-600">{formatCurrency((stats?.totalProperties ?? 0) * (stats?.averagePrice ?? 0))}</div>
                    <div className="text-sm text-gray-600">{t('dashboard.totalValue')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.averagePrice ?? 0)}</div>
                    <div className="text-sm text-gray-600">{t('dashboard.avgPrice')}</div>
                  </div>
                </Card>
              </div>
              <div className="col-12 md:col-6">
                <Card title={t('dashboard.priceTrends')}>
                  <Chart 
                    type="bar" 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                      datasets: [{
                        label: t('dashboard.averagePrice'),
                        data: [],
                        backgroundColor: '#8B5CF6',
                        borderColor: '#7C3AED',
                        borderWidth: 1
                      }]
                    }} 
                    options={{ responsive: true, maintainAspectRatio: false }}
                    style={{ height: '200px' }}
                  />
                </Card>
              </div>
            </div>
          </TabPanel>
          
          <TabPanel header={t('dashboard.userReports')}>
            <div className="flex justify-content-end gap-2 mb-3">
              <Button
                label={t('dashboard.print')}
                icon="pi pi-print"
                className="p-button-outlined p-button-secondary"
                onClick={() => handlePrint('user')}
              />
              <Button
                label={t('dashboard.exportCSV')}
                icon="pi pi-download"
                className="p-button-outlined p-button-success"
                onClick={() => handleExportCSV('user')}
              />
            </div>
            <div className="grid">
              <div className="col-12 md:col-6">
                <Card title={t('dashboard.userStatistics')}>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600">{stats?.totalUsers ?? 0}</div>
                    <div className="text-sm text-gray-600">{t('dashboard.totalUsers')}</div>
                  </div>
                </Card>
              </div>
              <div className="col-12 md:col-6">
                <Card title={t('dashboard.systemStatus')}>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-green-600">✓ {t('dashboard.systemStatus')}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      {t('dashboard.activity')} • API • {t('dashboard.database')}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabPanel>
          
              {/* Client Reports tab removed: client stats are not available in DashboardStats */}
        </TabView>
      </Dialog>

      <Dialog
        visible={isSettingsVisible}
        style={{ width: "70vw", maxWidth: "800px" }}
        header={t('dashboard.settings')}
        modal
        className="p-fluid"
        onHide={() => setSettingsVisible(false)}
      >
        <TabView>
          <TabPanel header={t('settings.appearance')}>
            <div className="grid">
              <div className="col-12 md:col-6">
                <Card title={t('settings.theme')}>
                  <div className="flex flex-column gap-3">
                    <div className="flex align-items-center gap-3">
                      <RadioButton
                        inputId="light"
                        name="theme"
                        value="light"
                        onChange={(e) => handleThemeChange(e.value)}
                        checked={theme === 'light'}
                      />
                      <label htmlFor="light" className="ml-2">{t('settings.lightTheme')}</label>
                    </div>
                    <div className="flex align-items-center gap-3">
                      <RadioButton
                        inputId="dark"
                        name="theme"
                        value="dark"
                        onChange={(e) => handleThemeChange(e.value)}
                        checked={theme === 'dark'}
                      />
                      <label htmlFor="dark" className="ml-2">{t('settings.darkTheme')}</label>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="col-12 md:col-6">
                <Card title={t('settings.language')}>
                  <div className="flex flex-column gap-3">
                    <div className="flex align-items-center gap-3">
                      <RadioButton
                        inputId="sr"
                        name="language"
                        value="sr"
                        onChange={(e) => handleLanguageChange(e.value)}
                        checked={language === 'sr'}
                      />
                      <label htmlFor="sr" className="ml-2">Srpski</label>
                    </div>
                    <div className="flex align-items-center gap-3">
                      <RadioButton
                        inputId="en"
                        name="language"
                        value="en"
                        onChange={(e) => handleLanguageChange(e.value)}
                        checked={language === 'en'}
                      />
                      <label htmlFor="en" className="ml-2">English</label>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabPanel>

          <TabPanel header={t('settings.notifications')}>
            <Card title={t('settings.notificationSettings')}>
              <div className="flex flex-column gap-3">
                <div className="flex align-items-center justify-content-between">
                  <div>
                    <div className="font-medium">{t('settings.newClients')}</div>
                    <div className="text-sm text-gray-600">{t('settings.newClientsDesc')}</div>
                  </div>
                  <InputSwitch
                    checked={notifications.newClients}
                    onChange={(e) => handleNotificationChange('newClients', e.value)}
                  />
                </div>
                <div className="flex align-items-center justify-content-between">
                  <div>
                    <div className="font-medium">{t('settings.newProperties')}</div>
                    <div className="text-sm text-gray-600">{t('settings.newPropertiesDesc')}</div>
                  </div>
                  <InputSwitch
                    checked={notifications.newProperties}
                    onChange={(e) => handleNotificationChange('newProperties', e.value)}
                  />
                </div>
                <div className="flex align-items-center justify-content-between">
                  <div>
                    <div className="font-medium">{t('settings.systemAlerts')}</div>
                    <div className="text-sm text-gray-600">{t('settings.systemAlertsDesc')}</div>
                  </div>
                  <InputSwitch
                    checked={notifications.systemAlerts}
                    onChange={(e) => handleNotificationChange('systemAlerts', e.value)}
                  />
                </div>
                <div className="flex align-items-center justify-content-between">
                  <div>
                    <div className="font-medium">{t('settings.emailReports')}</div>
                    <div className="text-sm text-gray-600">{t('settings.emailReportsDesc')}</div>
                  </div>
                  <InputSwitch
                    checked={notifications.emailReports}
                    onChange={(e) => handleNotificationChange('emailReports', e.value)}
                  />
                </div>
              </div>
            </Card>
          </TabPanel>

          <TabPanel header={t('settings.dashboard')}>
            <Card title={t('settings.dashboardSettings')}>
              <div className="flex flex-column gap-3">
                <div className="flex align-items-center justify-content-between">
                  <div>
                    <div className="font-medium">{t('settings.showQuickStats')}</div>
                    <div className="text-sm text-gray-600">{t('settings.showQuickStatsDesc')}</div>
                  </div>
                  <InputSwitch
                    checked={dashboardSettings.showQuickStats}
                    onChange={(e) => handleDashboardSettingChange('showQuickStats', e.value)}
                  />
                </div>
                <div className="flex align-items-center justify-content-between">
                  <div>
                    <div className="font-medium">{t('settings.showRecentActivity')}</div>
                    <div className="text-sm text-gray-600">{t('settings.showRecentActivityDesc')}</div>
                  </div>
                  <InputSwitch
                    checked={dashboardSettings.showRecentActivity}
                    onChange={(e) => handleDashboardSettingChange('showRecentActivity', e.value)}
                  />
                </div>
                <div className="flex align-items-center justify-content-between">
                  <div>
                    <div className="font-medium">{t('settings.showCharts')}</div>
                    <div className="text-sm text-gray-600">{t('settings.showChartsDesc')}</div>
                  </div>
                  <InputSwitch
                    checked={dashboardSettings.showCharts}
                    onChange={(e) => handleDashboardSettingChange('showCharts', e.value)}
                  />
                </div>
                <div className="flex align-items-center justify-content-between">
                  <div>
                    <div className="font-medium">{t('settings.autoRefresh')}</div>
                    <div className="text-sm text-gray-600">{t('settings.autoRefreshDesc')}</div>
                  </div>
                  <InputSwitch
                    checked={dashboardSettings.autoRefresh}
                    onChange={(e) => handleDashboardSettingChange('autoRefresh', e.value)}
                  />
                </div>
              </div>
            </Card>
          </TabPanel>

          <TabPanel header={t('settings.security')}>
            <Card title={t('settings.securitySettings')}>
              <div className="flex flex-column gap-3">
                <Button
                  label={t('settings.changePassword')}
                  icon="pi pi-lock"
                  className="p-button-outlined"
                  onClick={() => {
                    // TODO: Implement password change dialog
                    console.log('Change password clicked');
                  }}
                />
                <Button
                  label={t('settings.enable2FA')}
                  icon="pi pi-shield"
                  className="p-button-outlined"
                  onClick={() => {
                    // TODO: Implement 2FA setup
                    console.log('Enable 2FA clicked');
                  }}
                />
              </div>
            </Card>
          </TabPanel>

          <TabPanel header={t('settings.system')}>
            <Card title={t('settings.systemSettings')}>
              <div className="flex flex-column gap-3">
                <Button
                  label={t('settings.clearCache')}
                  icon="pi pi-refresh"
                  className="p-button-outlined p-button-warning"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                />
                <Button
                  label={t('settings.exportData')}
                  icon="pi pi-download"
                  className="p-button-outlined p-button-success"
                  onClick={() => {
                    // TODO: Implement data export
                    console.log('Export data clicked');
                  }}
                />
                <Button
                  label={t('settings.viewLogs')}
                  icon="pi pi-file"
                  className="p-button-outlined"
                  onClick={() => {
                    // TODO: Implement logs viewer
                    console.log('View logs clicked');
                  }}
                />
              </div>
            </Card>
          </TabPanel>
        </TabView>
      </Dialog>
    </>
  );
}