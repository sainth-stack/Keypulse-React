import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  ConfigProvider,
  Select,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { isSuperAdmin } from '../../../utils';
import { API_URL } from '../../../const';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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
          organization_id: !currentIsSuper ? currentUser?.organization : ''
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
          o_id: !currentIsSuper ? currentUser?.organization : ''
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

  // Initial data load effect - runs only once
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchUsers(),
      fetchRoles()
    ])
      .catch(() => {
        message.error('Failed to load data. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [fetchUsers, fetchRoles]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('organization', values.organization);
      formData.append('roles', values.roles.join(','));

      if (editingId) {
        await axios.post(`${API_URL}/users/${editingId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('User updated successfully');
      } else {
        formData.append('password', values.password);
        await axios.post(`${API_URL}/create_user`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('User created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
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
      render: (role) => (
        <span>{Array.isArray(role) ? role.join(', ') : role || '-'}</span>
      ),
      sorter: (a, b) => {
        const roleA = Array.isArray(a.role) ? a.role.join(',') : a.role || '';
        const roleB = Array.isArray(b.role) ? b.role.join(',') : b.role || '';
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
              onClick={() => {
                setEditingId(record.id);
                form.setFieldsValue({
                  username: record.username,
                  email: record.email,
                  organization: record.organization?.organization_id,
                  roles: Array.isArray(record.role) ? record.role : record.role ? [record.role] : [],
                });
                setIsModalOpen(true);
              }}
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
  ], [users, canUpdate, canDelete, form]);

  // Memoized modal handlers
  const handleModalOpen = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  }, [form]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingId(null);
  }, [form]);

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
            onClick={handleModalOpen}
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
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />

        {(canCreate || canUpdate) && (
          <Modal
            title={editingId ? 'Edit User' : 'Create User'}
            open={isModalOpen}
            onCancel={handleModalClose}
            footer={null}
            destroyOnClose
            centered
            mask={true}
            maskClosable={false}
            width={600}
            style={{ top: 20, zIndex: 99999 }}
            bodyStyle={{ padding: '24px' }}
          >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="username"
                label="Prefered Name"
                rules={[{ required: true, message: 'Please input username!' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              {!editingId && (
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please input password!' }]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
              )}

              <Form.Item
                name="organization"
                label="Organization"
                rules={[{ required: true, message: 'Please select an organization!' }]}
              >
                <Select placeholder="Select organization">
                  {Array.from(new Set(users.map(user => user.organization?.organization_id).filter(Boolean))).map((orgId) => {
                    const user = users.find(u => u.organization?.organization_id === orgId);
                    return (
                      <Select.Option key={orgId} value={orgId}>
                        {user?.organization?.organization_name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Form.Item
                name="roles"
                label="Roles"
                rules={[{ required: true, message: 'Please select at least one role!' }]}
              >
                <Select mode="multiple" placeholder="Select roles" allowClear>
                  {roles.map((role) => (
                    <Select.Option key={role.id} value={role.role}>
                      {role.role}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
                <Space>
                  <Button onClick={handleModalClose}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitLoading}
                    disabled={submitLoading}
                  >
                    {editingId ? 'Update' : 'Submit'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        )}
      </div>
    </ConfigProvider>
  );
  };
  
export default UsersManager;