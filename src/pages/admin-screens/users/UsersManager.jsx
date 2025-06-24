import { useState, useEffect } from 'react';
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
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // const API_URL = `${API_URL}/users`;
  
  // Get permissions from localStorage
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const user=JSON.parse(localStorage.getItem('user') || "{}")

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`,{
        params:{
          organization_id: !isSuperAdmin()? user?.organization :''
        }
      });
      const dataWithIndex = (isSuperAdmin() ?(response?.data) :response?.data?.users)?.map((user, index) => ({
        ...user,
        key: user.id,
        sno: index + 1,
      }));
      setUsers(dataWithIndex);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response2 = await axios.get(`${API_URL}/organizations/${user?.organization}`)
      const tenant_id=response2.data['Organization Details']['Tenant id']
      const response = await axios.get(`${API_URL}/organizations`,{
        params: {
          tenant_id:!isSuperAdmin()? tenant_id:''
        },
      });
      const tenantResponse = await axios.get(`${API_URL}/tenants`);
      const tenantData = tenantResponse?.data?.tenants || [];
      const dataWithIndex = response?.data?.organizations?.map((org, index) => ({
        ...org,
        tenant: tenantData.find((item) => item?.id === org?.tenant)?.name || '',
        key: org.id,
        sno: index + 1,
      }));
      setOrganizations(dataWithIndex);
    } catch (error) {
      message.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/roles`,{
        params:{
          o_id:!isSuperAdmin() ?user?.organization:''
        }
      });
      const dataWithIndex = response?.data?.roles?.map((role, index) => ({
        ...role,
        key: role.id,
        sno: index + 1,
      }));
      setRoles(dataWithIndex);
    } catch (error) {
      message.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenants (for organization mapping)
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tenants`);
      const dataWithIndex = response?.data?.tenants?.map((tenant, index) => ({
        ...tenant,
        key: tenant.id,
        sno: index + 1,
      }));
      setTenants(dataWithIndex);
    } catch (error) {
      message.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
    fetchRoles();
    fetchTenants();
  }, []);

  // Check specific permissions
  const canCreate = permissions.includes("users_Create");
  const canUpdate = permissions.includes("users_Write");
  const canDelete = permissions.includes("users_Delete");

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('organization', values.organization);
      formData.append('roles', values.roles.join(',')); // Convert array to comma-separated string

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
      fetchUsers();
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
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
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
      render: (orgId) => {
        const org = organizations.find((o) => o.id === orgId);
        return org ? org.name : '-';
      },
      sorter: (a, b) => {
        const orgA = organizations.find(o => o.id === a.organization)?.name || '';
        const orgB = organizations.find(o => o.id === b.organization)?.name || '';
        return orgA.localeCompare(orgB);
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
        // Generate filters dynamically based on unique roles in your data
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
                  organization: record.organization,
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
  ];

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
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
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
        />

        {(canCreate || canUpdate) && (
          <Modal
            title={editingId ? 'Edit User' : 'Create User'}
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              form.resetFields();
              setEditingId(null);
            }}
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
                  {organizations.map((org) => (
                    <Select.Option key={org.id} value={org.id}>
                      {org.name}
                    </Select.Option>
                  ))}
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
                  <Button
                    onClick={() => {
                      setIsModalOpen(false);
                      form.resetFields();
                    }}
                  >
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