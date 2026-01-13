'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

import { NewsletterService, NewsletterSubscriber, SendNewsletterDto, SubscribersFilter } from '@/services/newsletter.service';
import { Card } from 'primereact/card';

export default function NewsletterPage() {
  const t = useTranslations('Newsletter');
  const common = useTranslations('common');
  const locale = useLocale();
  const toast = useRef<Toast>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendDialogVisible, setSendDialogVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: ''
  });
  const [filters, setFilters] = useState({
    email: '',
    status: 'all',
    subscribedFrom: null as Date | null,
    subscribedTo: null as Date | null,
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const buildFilterPayload = (source = filters): SubscribersFilter => {
    const payload: SubscribersFilter = {};

    if (source.email) {
      payload.email = source.email;
    }
    
    if (source.status === 'active') {
      payload.isActive = true;
    } else if (source.status === 'inactive') {
      payload.isActive = false;
    }

    if (source.subscribedFrom) {
      const from = new Date(source.subscribedFrom);
      from.setHours(0, 0, 0, 0);
      payload.subscribedFrom = from.toISOString();
    }

    if (source.subscribedTo) {
      const to = new Date(source.subscribedTo);
      to.setHours(23, 59, 59, 999);
      payload.subscribedTo = to.toISOString();
    }

    return payload;
  };

  const fetchSubscribers = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const data = await NewsletterService.getSubscribers(buildFilterPayload(nextFilters));
      setSubscribers(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('toast.error'),
        detail: t('toast.loadError')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterData.subject || !newsletterData.content) {
      toast.current?.show({
        severity: 'warn',
        summary: t('toast.warning'),
        detail: t('toast.validation')
      });
      return;
    }

    setSending(true);
    try {
      const payload: SendNewsletterDto = {
        ...newsletterData,
        recipients: selectedSubscribers.length ? selectedSubscribers.map((s) => s.email) : undefined,
      };
      const data = await NewsletterService.sendNewsletter(payload);
      toast.current?.show({
        severity: 'success',
        summary: t('toast.success'),
        detail: t('toast.sendSuccess', { count: data.sentCount })
      });
      setSendDialogVisible(false);
      setNewsletterData({ subject: '', content: '' });
      setSelectedSubscribers([]);
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('toast.error'),
        detail: error.response?.data?.message || t('toast.sendError')
      });
    } finally {
      setSending(false);
    }
  };

  const statusTemplate = (rowData: NewsletterSubscriber) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        rowData.isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {rowData.isActive ? t('status.active') : t('status.inactive')}
      </span>
    );
  };

  const dateTemplate = (date: string) => {
    return new Intl.DateTimeFormat(locale).format(new Date(date));
  };

  const handleFilterChange = (
    key: 'email' | 'status' | 'subscribedFrom' | 'subscribedTo',
    value: string | Date | null,
    autoApply = false,
  ) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (autoApply) {
        fetchSubscribers(next);
      }
      return next;
    });
  };

  const applyFilters = () => fetchSubscribers(filters);

  const clearFilters = () => {
    const reset = { email: '', status: 'all', subscribedFrom: null as Date | null, subscribedTo: null as Date | null };
    setFilters(reset);
    fetchSubscribers(reset);
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <Button
          label={t('sendButton')}
          icon="pi pi-send"
          onClick={() => setSendDialogVisible(true)}
          className="ml-5 p-button-primary"
        />
      </div>

      <Card className="mb-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold m-0">{t('filters.title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Email Filter */}
            <div className="p-field">
              <label className="block mb-2 font-medium">
                <i className="pi pi-envelope mr-2" style={{ fontSize: '14px' }}></i>
                {t('filters.emailLabel')}
              </label>
              <InputText
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder={t('filters.emailPlaceholder')}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="p-field">
              <label className="block mb-2 font-medium">
                <i className="pi pi-tag mr-2" style={{ fontSize: '14px' }}></i>
                {t('filters.statusLabel')}
              </label>
              <Dropdown
                value={filters.status}
                options={[
                  { label: t('filters.statusAll'), value: 'all' },
                  { label: t('status.active'), value: 'active' },
                  { label: t('status.inactive'), value: 'inactive' },
                ]}
                onChange={(e) => handleFilterChange('status', e.value, true)}
                className="w-full"
              />
            </div>

            {/* Date From Filter */}
            <div className="p-field">
              <label className="block mb-2 font-medium">
                <i className="pi pi-calendar mr-2" style={{ fontSize: '14px' }}></i>
                {t('filters.subscribedFrom')}
              </label>
              <Calendar
                value={filters.subscribedFrom}
                onChange={(e) => handleFilterChange('subscribedFrom', e.value as Date | null)}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
              />
            </div>

            {/* Date To Filter */}
            <div className="p-field">
              <label className="block mb-2 font-medium">
                <i className="pi pi-calendar mr-2" style={{ fontSize: '14px' }}></i>
                {t('filters.subscribedTo')}
              </label>
              <Calendar
                value={filters.subscribedTo}
                onChange={(e) => handleFilterChange('subscribedTo', e.value as Date | null)}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              label={t('filters.clear')} 
              icon="pi pi-times" 
              className="p-button-outlined p-button-danger"
              onClick={clearFilters}
              size="small"
            />
            <Button 
              label={t('filters.apply')} 
              icon="pi pi-check" 
              className="p-button-primary"
              onClick={applyFilters}
              size="small"
            />
          </div>
        </div>
      </Card>

      <div className="card">
        <DataTable
          value={subscribers}
          loading={loading}
          selection={selectedSubscribers}
          onSelectionChange={(e) => setSelectedSubscribers(e.value || [])}
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={t('empty')}
          className="p-datatable-sm"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column field="email" header={t('columns.email')} sortable style={{ minWidth: '250px' }} />
          <Column
            field="isActive"
            header={t('columns.status')}
            body={statusTemplate}
            sortable
            style={{ width: '120px' }}
          />
          <Column
            field="subscribedAt"
            header={t('columns.subscribedAt')}
            body={(rowData) => dateTemplate(rowData.subscribedAt)}
            sortable
            style={{ width: '150px' }}
          />
          <Column
            field="updatedAt"
            header={t('columns.updatedAt')}
            body={(rowData) => dateTemplate(rowData.updatedAt)}
            sortable
            style={{ width: '150px' }}
          />
        </DataTable>
      </div>

      {/* Send Newsletter Dialog */}
      <Dialog
        header={t('sendDialog.title')}
        visible={sendDialogVisible}
        onHide={() => setSendDialogVisible(false)}
        style={{ width: '600px' }}
        footer={
          <div>
            <Button
              label={common('cancel')}
              icon="pi pi-times"
              onClick={() => setSendDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label={sending ? t('sendDialog.sending') : t('sendDialog.send')}
              icon="pi pi-send"
              onClick={handleSendNewsletter}
              loading={sending}
              className="p-button-primary"
            />
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('sendDialog.subjectLabel')}</label>
            <InputText
              value={newsletterData.subject}
              onChange={(e) => setNewsletterData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder={t('sendDialog.subjectPlaceholder')}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('sendDialog.contentLabel')}</label>
            <InputTextarea
              value={newsletterData.content}
              onChange={(e) => setNewsletterData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('sendDialog.contentPlaceholder')}
              rows={10}
              className="w-full"
            />
            {selectedSubscribers.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">{t('sendDialog.selectionInfo', { count: selectedSubscribers.length })}</p>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}