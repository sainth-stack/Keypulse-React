import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Space,
  message,
  Popconfirm,
  ConfigProvider,
  Image
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../const';
import { isSuperAdmin } from '../../../utils';
import './OrganizationsManager.css';

const OrganizationsManager = () => {
  const [organizations, setOrganizations] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    tenant_id: '',
    organization_name: '',
    parent_organization_id: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || "{}");
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]') || [];

  const fetchOrganizations = async (data) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/organizations`, {
        params: {
          tenant_id: !isSuperAdmin() ? user?.tenant?.tenant_id : ''
        }
      });
      const dataWithIndex = response?.data?.organizations?.map((org, index) => ({
        ...org,
        tenant: org?.tenant['Tenant Name'],
        key: org.id,
        sno: index + 1,
        logo: org.logo_data ? `${org.logo_data}` : null
      }));
      setOrganizations(dataWithIndex);
    } catch (error) {
      message.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await axios.get(`${API_URL}/tenants`);
      setTenants(response?.data?.tenants || []);
    } catch (error) {
      message.error('Failed to fetch tenants');
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tenant_id || !formData.organization_name) {
      message.error('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      const formDataToSend = new FormData();
      console.log(formData,'formData')
      if (editingId) {
        formDataToSend.append('tenant', formData.tenant_id);
        formDataToSend.append('name', formData.organization_name);
        if (formData.parent_organization_id) {
          formDataToSend.append('parent', formData.parent_organization_id);
        } else {
          formDataToSend.append('parent', '');
        }
      } else {
        formDataToSend.append('tenant_id', formData.tenant_id);
        formDataToSend.append('organization_name', formData.organization_name);
        formDataToSend.append('logo', file);
        if (formData.parent_organization_id) {
          formDataToSend.append('parent_organization_id', formData.parent_organization_id);
        }
      }
      

      if (editingId) {
        formDataToSend.append('file', file);
        await axios.post(`${API_URL}/organizations/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Organization updated successfully');
      } else {
        await axios.post(`${API_URL}/create_organizations`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Organization created successfully');
      }
      
      setIsModalOpen(false);
      setFormData({ tenant_id: '', organization_name: '', parent_organization_id: '' });
      setEditingId(null);
      setFile(null);
      fetchOrganizations(tenants);
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/organizations/${id}`);
      message.success('Organization deleted successfully');
      fetchOrganizations(tenants);
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ tenant_id: '', organization_name: '', parent_organization_id: '' });
    setFile(null);
    fetchTenants();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingId(record.id);
    setFormData({
      tenant_id: record.tenant,
      organization_name: record.name,
      parent_organization_id: record.parent_organization_id || ''
    });
    setFile(null);
    fetchTenants();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ tenant_id: '', organization_name: '', parent_organization_id: '' });
    setEditingId(null);
    setFile(null);
  };

  const canCreate = permissions.includes("organization_Create");
  const canUpdate = permissions.includes("organization_Write");
  const canDelete = permissions.includes("organization_Delete");

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sno',
      key: 'sno',
      sorter: (a, b) => a.sno - b.sno,
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      render: (logo) => logo ? (
        <Image 
          src={logo} 
          width={50} 
          height={50} 
          style={{ objectFit: 'contain' }}
          preview={false}
        />
      ) : '-',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'organization_name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant',
      key: 'tenant',
      sorter: (a, b) => (a.tenant || '').localeCompare(b.tenant || ''),
    },
    {
      title: 'Parent Organization',
      dataIndex: 'parent_organization_name',
      key: 'parent_organization_name',
      render: (text) => text || '-',
      sorter: (a, b) => (a.parent_organization_name || '').localeCompare(b.parent_organization_name || ''),
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
              title="Are you sure to delete this organization?"
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
            onClick={openCreateModal}
            style={{ marginBottom: '16px' }}
          >
            Add Organization
          </Button>
        )}

        <Table
          columns={columns}
          dataSource={organizations}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />

        {(canCreate || canUpdate) && (
          <Modal
            title={editingId ? 'Edit Organization' : 'Create Organization'}
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
              <form onSubmit={handleSubmit}>
                <div className="form-group2">
                  <label className="modern-label">
                    Tenant <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className="modern-select"
                    value={formData.tenant_id}
                    onChange={(e) => handleInputChange('tenant_id', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group2">
                  <label className="modern-label">
                    Organization Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder="Enter organization name"
                    value={formData.organization_name}
                    onChange={(e) => handleInputChange('organization_name', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group2">
                  <label className="modern-label">
                    Parent Organization (Optional)
                  </label>
                  <select
                    className="modern-select"
                    value={formData.parent_organization_id}
                    onChange={(e) => handleInputChange('parent_organization_id', e.target.value)}
                  >
                    <option value="">None</option>
                    {organizations
                      .filter(org => !editingId || org.id !== editingId)
                      .map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group2">
                  <label className="modern-label">
                    Logo
                  </label>
                  <div className={`modern-file-input-wrapper ${file ? 'has-file' : ''}`}>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="modern-file-input"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <div className="modern-file-input-display">
                      <span className="modern-file-input-button">Choose File</span>
                      <span className="modern-file-input-text">
                        {file ? file.name : 'No file chosen'}
                      </span>
                    </div>
                  </div>
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
            </div>
          </Modal>
        )}
      </div>
    </ConfigProvider>
  );
};

export default OrganizationsManager;