import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Space,
  message,
  Popconfirm,
  ConfigProvider
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../const';
import './TenantsManager.css';

const TenantsManager = () => {
  const [tenants, setTenants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_type: '',
    timeout: ''
  });

  const permissions = JSON.parse(localStorage.getItem('permissions') || {});

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tenants`);
      const dataWithIndex = response?.data?.tenants?.map((tenant, index) => ({
        ...tenant,
        key: tenant.id,
        sno: index + 1
      }));
      setTenants(dataWithIndex);
    } catch (error) {
      message.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tenant_name || !formData.tenant_type) {
      message.error('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('tenant_name', formData.tenant_name);
      formDataToSend.append('tenant_type', formData.tenant_type);
      formDataToSend.append('timeout', formData.timeout);

      if (editingId) {
        await axios.post(`${API_URL}/tenants/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Tenant updated successfully');
      } else {
        await axios.post(`${API_URL}/create_tenants`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Tenant created successfully');
      }
      
      setIsModalOpen(false);
      setFormData({ tenant_name: '', tenant_type: '', timeout: '' });
      setEditingId(null);
      fetchTenants();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/tenants/${id}`);
      message.success('Tenant deleted successfully');
      fetchTenants();
    } catch (error) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ tenant_name: '', tenant_type: '', timeout: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingId(record.id);
    setFormData({
      tenant_name: record.name,
      tenant_type: record.type,
      timeout: record.timeout || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ tenant_name: '', tenant_type: '', timeout: '' });
    setEditingId(null);
  };

  // Check specific permissions
  const canCreate = permissions?.includes("tenant_Create");
  const canUpdate = permissions?.includes("tenant_Write");
  const canDelete = permissions?.includes("tenant_Delete");

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sno',
      key: 'sno',
      sorter: (a, b) => a.sno - b.sno,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
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
              title="Are you sure to delete this tenant?"
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
            Add Tenant
          </Button>
        )}

        <Table
          columns={columns}
          dataSource={tenants}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />

        {(canCreate || canUpdate) && (
          <Modal
            title={editingId ? 'Edit Tenant' : 'Create Tenant'}
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
                    Tenant Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="modern-input"
                    placeholder="Enter tenant name"
                    value={formData.tenant_name}
                    onChange={(e) => handleInputChange('tenant_name', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group2">
                  <label className="modern-label">
                    Tenant Type <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className="modern-select"
                    value={formData.tenant_type}
                    onChange={(e) => handleInputChange('tenant_type', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select tenant type</option>
                    <option value="ai-priori">AI-Priori</option>
                    <option value="oem">OEM</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                <div className="form-group2">
                  <label className="modern-label">
                    Timeout
                  </label>
                  <input
                    type="number"
                    className="modern-input"
                    placeholder="Enter timeout value (e.g., 5.0)"
                    step="0.1"
                    value={formData.timeout}
                    onChange={(e) => handleInputChange('timeout', e.target.value)}
                  />
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

export default TenantsManager;