import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Space,
  message,
  Popconfirm,
  ConfigProvider,
  Spin,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { isSuperAdmin } from '../../../utils';
import { API_URL } from '../../../const';
import './UsersManager.css';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    organization: '',
    roles: ''
  });

  // Get permissions for UI rendering (memoized to prevent unnecessary re-renders) 
  const permissions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('permissions') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Memoized permission checks
  const { canCreate, canUpdate, canDelete } = useMemo(() => ({
    canCreate: permissions.includes("users_Create"),
    canUpdate: permissions.includes("users_Write"),
    canDelete: permissions.includes("users_Delete"),
  }), [permissions]);

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentIsSuper = isSuperAdmin();
      const response = await axios.get(`${API_URL}/users`, {
        params: {
          organization_id: !currentIsSuper ? currentUser?.organization?.organization_id : ''
        }
      });
      const usersData = (currentIsSuper ? response?.data : response?.data?.users) || [];
      const processedUsers = usersData.map((user, index) => ({
        ...user,
        key: user.id,
        sno: index + 1,
      }));
      setUsers(processedUsers);
    } catch (error) {
      message.error('Failed to refresh users data');
    }
  }, []);

  // Fetch roles data
  const fetchRoles = useCallback(async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentIsSuper = isSuperAdmin();
      const response = await axios.get(`${API_URL}/roles`, {
        params: {
          o_id: !currentIsSuper ? currentUser?.organization?.organization_id : ''
        }
      });
      const rolesData = response?.data?.roles || [];
      const processedRoles = rolesData.map((role, index) => ({
        ...role,
        key: role.id,
        sno: index + 1,
      }));
      setRoles(processedRoles);
    } catch (error) {
      message.error('Failed to load roles data');
    }
  }, []);

  // Fetch organizations data
  const fetchOrganizations = useCallback(async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentIsSuper = isSuperAdmin();
      const response = await axios.get(`${API_URL}/organizations`, {
        params: {
          tenant_id: !currentIsSuper ? currentUser?.tenant?.tenant_id : ''
        }
      });
      const organizationsData = response?.data?.organizations || [];
      setOrganizations(organizationsData);
    } catch (error) {
      message.error('Failed to load organizations data');
    }
  }, []);

  // Initial data load effect - only load users on component mount
  useEffect(() => {
    setLoading(true);
    fetchUsers()
      .catch(() => {
        message.error('Failed to load users data. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [fetchUsers]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.organization || !formData.roles) {
      message.error('Please fill in all required fields');
      return;
    }

    if (!editingId && !formData.password) {
      message.error('Please enter a password');
      return;
    }

    setSubmitLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('organization', formData.organization);
      formDataToSend.append('roles', formData.roles);

      if (editingId) {
        await axios.post(`${API_URL}/users/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('User updated successfully');
      } else {
        formDataToSend.append('password', formData.password);
        await axios.post(`${API_URL}/create_user`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('User created successfully');
      }

      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '', organization: '', roles: '' });
      setEditingId(null);
      
      // Refresh only users data
      await fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      message.success('User deleted successfully');
      
      // Refresh only users data
      await fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  // Load modal data (roles and organizations) when opening modal
  const loadModalData = async () => {
    setModalLoading(true);
    try {
      await Promise.all([
        fetchRoles(),
        fetchOrganizations()
      ]);
    } catch (error) {
      message.error('Failed to load modal data');
    } finally {
      setModalLoading(false);
    }
  };

  const openCreateModal = async () => {
    setEditingId(null);
    setFormData({ username: '', email: '', password: '', organization: '', roles: '' });
    setIsModalOpen(true);
    await loadModalData();
  };

  const openEditModal = async (record) => {
    setEditingId(record.id);
    setFormData({
      username: record.username,
      email: record.email,
      password: '',
      organization: record.organization?.organization_id || '',
      roles: Array.isArray(record.role) ? record.role[0] || '' : record.role || ''
    });
    setIsModalOpen(true);
    await loadModalData();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ username: '', email: '', password: '', organization: '', roles: '' });
    setEditingId(null);
    setRoles([]);
    setOrganizations([]);
  };

  // Memoized table columns
  const columns = useMemo(() => [
    {
      title: 'S.No',
      dataIndex: 'sno',
      key: 'sno',
      sorter: (a, b) => a.sno - b.sno,
      width: 80,
    },
    {
      title: 'Prefered Name',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Organization',
      dataIndex: 'organization',
      key: 'organization',
      render: (org) => {
        return org?.organization_name || '-';
      },
      sorter: (a, b) => {
        const orgA = a.organization?.organization_name || '';
        const orgB = b.organization?.organization_name || '';
        return orgA.localeCompare(orgB);
      },
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant',
      key: 'tenant',
      render: (tenant) => {
        return tenant?.tenant_name || '-';
      },
      sorter: (a, b) => {
        const tenantA = a.tenant?.tenant_name || '';
        const tenantB = b.tenant?.tenant_name || '';
        return tenantA.localeCompare(tenantB);
      },
    },
    {
      title: 'Roles',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleArray = Array.isArray(role) ? role : [role];
        return roleArray.filter(Boolean).join(', ') || '-';
      },
      sorter: (a, b) => {
        const roleA = Array.isArray(a.role) ? a.role.join(', ') : (a.role || '');
        const roleB = Array.isArray(b.role) ? b.role.join(', ') : (b.role || '');
        return roleA.localeCompare(roleB);
      },
      filters: [
        ...Array.from(new Set(users.flatMap(u => 
          Array.isArray(u.role) ? u.role : [u.role || '']
        ))).filter(Boolean).map(role => ({
          text: role,
          value: role,
        })),
      ],
      onFilter: (value, record) => {
        const roles = Array.isArray(record.role) ? record.role : [record.role];
        return roles.includes(value);
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {canUpdate && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Are you sure to delete this user?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], [users, canUpdate, canDelete]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: '#fff',
            headerBg: '#fff',
            footerBg: '#fff',
          },
        },
      }}
    >
      <div style={{ padding: '24px' }}>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{ marginBottom: '16px' }}
          >
            Add User
          </Button>
        )}

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />

        {(canCreate || canUpdate) && (
          <Modal
            title={editingId ? 'Edit User' : 'Create User'}
            open={isModalOpen}
            onCancel={closeModal}
            footer={null}
            destroyOnClose
            centered
            mask={true}
            maskClosable={false}
            width={600}
            style={{ top: 20, zIndex: 99999 }}
            bodyStyle={{ padding: '24px' }}
          >
            <div className="modern-form">
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px', color: '#666' }}>
                    Loading modal data...
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group2">
                    <label className="modern-label">
                      Prefered Name <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="modern-input"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group2">
                    <label className="modern-label">
                      Email <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="modern-input"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  {!editingId && (
                    <div className="form-group2">
                      <label className="modern-label">
                        Password <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="password"
                        className="modern-input"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group2">
                    <label className="modern-label">
                      Organization <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      className="modern-select"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      required
                    >
                      <option value="" disabled>Select organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group2">
                    <label className="modern-label">
                      Roles <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      className="modern-select"
                      value={formData.roles}
                      onChange={(e) => handleInputChange('roles', e.target.value)}
                      required
                    >
                      <option value="" disabled>Select roles</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.role}>
                          {role.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginTop: '24px', textAlign: 'right' }}>
                    <Space>
                      <button
                        type="button"
                        className="modern-cancel-button"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="modern-submit"
                        disabled={submitLoading}
                      >
                        {submitLoading ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}
                      </button>
                    </Space>
                  </div>
                </form>
              )}
            </div>
          </Modal>
        )}
      </div>
    </ConfigProvider>
  );
};

export default UsersManager;