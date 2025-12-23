"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable, DataTableSortEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";
import { useTranslations } from "next-intl";

import { fetchData } from "../../utils/fetchUtils";
import { SortOrder } from "primereact/datatable";

import { User, userService } from '../../../services/user.service';

export default function UsersPage() {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const [users, setUsers] = useState<User[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("username");
  const [sortOrder, setSortOrder] = useState<SortOrder>(1);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Dialog states
  const [isCreateDialogVisible, setCreateDialogVisible] = useState(false);
  const [isEditDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
  // Form state
  const [userForm, setUserForm] = useState<Partial<User> & { password?: string }>({
    id: undefined,
    username: "",
    password: "",
    role: "user"
  });

  // Filters
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  const dt = useRef<DataTable<User[]>>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, sortBy, sortOrder, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchData("users", {
        page: page + 1,
        limit: pageSize,
        sortBy,
        order: sortOrder === 1 ? "ASC" : "DESC",
        filters: {
          role: { value: (roleFilter || []).join(","), matchMode: "in" }
        },
      });
      setUsers(result.items);
      setTotalRecords(result.meta.totalItems);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load users"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id.toString());

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "User deleted successfully"
      });
      loadUsers();
    } catch (error) {
      console.error("Deletion error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete user"
      });
    }
  };

  const handleSaveUser = async () => {
    try {
      if (userForm.id) {
        // Update existing user
        await userService.updateUser(userForm.id.toString(), {
          username: userForm.username,
          role: userForm.role as 'admin' | 'user'
        });
      } else {
        // Create new user
        if (!userForm.password) {
          throw new Error('Password is required for new users');
        }
        await userService.createUser({
          username: userForm.username!,
          password: userForm.password,
          role: userForm.role as 'admin' | 'user'
        });
      }

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: userForm.id ? "User updated successfully" : "User created successfully"
      });
      
      setCreateDialogVisible(false);
      setEditDialogVisible(false);
      loadUsers();
    } catch (error) {
      console.error("Save error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save user"
      });
    }
  };

  const onSort = (event: DataTableSortEvent) => {
    setSortBy(event.sortField || "username");
    setSortOrder(event.sortOrder || 1);
  };

  const onPageChange = (event: { first: number; rows: number }) => {
    setPage(event.first / event.rows);
    setPageSize(event.rows);
  };

  const confirmDelete = (user: User) => {
    confirmDialog({
      message: `${tCommon('delete')} "${user.username}"?`,
      header: tCommon('delete'),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteUser(user.id)
    });
  };

  const openEditDialog = (user: User) => {
    setUserForm({
      id: user.id,
      username: user.username,
      password: "",
      role: user.role
    });
    setEditDialogVisible(true);
  };

  const openCreateDialog = () => {
    setUserForm({
      id: undefined,
      username: "",
      password: "",
      role: "user"
    });
    setCreateDialogVisible(true);
  };

  const deleteSelectedUsers = () => {
    confirmDialog({
      message: `${tCommon('delete')} ${selectedUsers.length} ${t('title').toLowerCase()}?`,
      header: tCommon('delete'),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await Promise.all(selectedUsers.map(user => handleDeleteUser(user.id)));
          setSelectedUsers([]);
        } catch (error) {
          console.error("Error deleting selected users:", error);
        }
      }
    });
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  // Templates
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center">
        <h5 className="m-0">{t('title')}</h5>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={tCommon('globalSearch')}
          />
        </span>
      </div>
    );
  };

  const roleBodyTemplate = (rowData: User) => {
    return (
      <span className={`px-2 py-1 rounded text-sm font-medium ${
        rowData.role === 'admin' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {rowData.role.toUpperCase()}
      </span>
    );
  };

  const actionBodyTemplate = (rowData: User) => {
    return (
      <div>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success mr-2"
          onClick={() => openEditDialog(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-warning"
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete"
        />
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex items-center">
        <Button
          label={t('new')}
          icon="pi pi-plus"
          className="p-button-success mr-2"
          onClick={openCreateDialog}
        />
        <Button
          label={tCommon('delete')}
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={deleteSelectedUsers}
          disabled={!selectedUsers || selectedUsers.length === 0}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <Button
        label={t('export')}
        icon="pi pi-upload"
        className="p-button-help"
        onClick={exportCSV}
      />
    );
  };

  const roleOptions = [
    { label: "User", value: "user" },
    { label: "Admin", value: "admin" }
  ];

  const roleFilterOptions = [
    { label: "User", value: "user" },
    { label: "Admin", value: "admin" }
  ];

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      
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
      
      <Toolbar
        className="mb-4"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />

      <div className="mb-4">
        <div className="flex gap-4">
          <div className="field">
            <label htmlFor="role-filter" className="block text-sm font-medium mb-2">
              {t('role')}
            </label>
            <MultiSelect
              id="role-filter"
              value={roleFilter}
              options={roleFilterOptions}
              onChange={(e) => setRoleFilter(e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder={t('selectRoles')}
              className="w-full md:w-20rem"
            />
          </div>
        </div>
      </div>

      <DataTable
        ref={dt}
        value={loading ? Array.from({ length: pageSize }, (_, index) => ({ 
          id: index,
          username: '',
          role: 'user'
        } as User)) : users}
        selection={selectedUsers}
        onSelectionChange={(e) => !loading ? setSelectedUsers(e.value as User[]) : undefined}
        selectionMode="multiple"
        dataKey="id"
        paginator
        rows={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        globalFilter={globalFilter}
        header={renderHeader()}
        responsiveLayout="scroll"
        lazy
        totalRecords={totalRecords}
        loading={false}
        onPage={onPageChange}
        onSort={onSort}
        sortField={sortBy}
        sortOrder={sortOrder}
        first={page * pageSize}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column 
          field="id" 
          header={t('id')} 
          sortable 
          style={{ minWidth: "6rem" }}
          body={loading ? () => <div className="skeleton-line h-1rem w-3rem"></div> : null}
        />
        <Column 
          field="username" 
          header={t('username')} 
          sortable 
          style={{ minWidth: "12rem" }}
          body={loading ? () => <div className="skeleton-line h-1rem w-8rem"></div> : null}
        />
        <Column 
          field="role" 
          header={t('role')} 
          body={loading ? () => <div className="skeleton-line h-1rem w-4rem"></div> : roleBodyTemplate}
          sortable 
          style={{ minWidth: "8rem" }} 
        />
        <Column 
          body={loading ? () => <div className="skeleton-line h-1rem w-3rem"></div> : actionBodyTemplate} 
          exportable={false} 
          style={{ minWidth: "8rem" }} 
        />
      </DataTable>

      {/* Create User Dialog */}
      <Dialog
        visible={isCreateDialogVisible}
        style={{ width: "450px" }}
        header={t('userDetails')}
        modal
        className="p-fluid"
        onHide={() => setCreateDialogVisible(false)}
      >
        <div className="field">
          <label htmlFor="username">{t('username')}</label>
          <InputText
            id="username"
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="password">{t('password')}</label>
          <InputText
            id="password"
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="role">{t('role')}</label>
          <Dropdown
            id="role"
            value={userForm.role}
            options={roleOptions}
            onChange={(e) => setUserForm({ ...userForm, role: e.value })}
            optionLabel="label"
            optionValue="value"
            placeholder={t('selectRole')}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label={tCommon('cancel')}
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setCreateDialogVisible(false)}
          />
          <Button
            label={tCommon('save')}
            icon="pi pi-check"
            className="p-button-text"
            onClick={handleSaveUser}
          />
        </div>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        visible={isEditDialogVisible}
        style={{ width: "450px" }}
        header={t('editUser')}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        <div className="field">
          <label htmlFor="edit-username">{t('username')}</label>
          <InputText
            id="edit-username"
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="edit-role">{t('role')}</label>
          <Dropdown
            id="edit-role"
            value={userForm.role}
            options={roleOptions}
            onChange={(e) => setUserForm({ ...userForm, role: e.value })}
            optionLabel="label"
            optionValue="value"
            placeholder={t('selectRole')}
          />
        </div>
        <div className="formgrid grid">
          <div className="field col">
            <small className="text-gray-500">
              Note: Password cannot be changed via edit. User must be deleted and recreated to change password.
            </small>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label={tCommon('cancel')}
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setEditDialogVisible(false)}
          />
          <Button
            label={t('update')}
            icon="pi pi-check"
            className="p-button-text"
            onClick={handleSaveUser}
          />
        </div>
      </Dialog>
    </div>
  );
}
