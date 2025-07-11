import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Row,
  Col,
  DatePicker,
  Select,
  Descriptions,
  Spin,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { isSuperAdmin } from '../../../utils';
import { API_URL } from '../../../const';
import './UserSessions.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const UserSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [filterParams, setFilterParams] = useState({
    userId: '',
    orgId: '',
    dateRange: [],
  });

  // Get permissions and user info from localStorage
  const permissions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('permissions') || '[]');
    } catch {
      return [];
    }
  }, []);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  // Memoized permission checks
  const { canCreate, canUpdate, canDelete } = useMemo(() => ({
    canCreate: permissions.includes("sessions_Create"),
    canUpdate: permissions.includes("sessions_Write"),
    canDelete: permissions.includes("sessions_Delete"),
  }), [permissions]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      let params = {};
      
      if (!isSuperAdmin()) {
        params.organization_id = user?.organization?.organization_id;
      } else {
        if (filterParams.orgId) {
          params.organization_id = filterParams.orgId;
        }
      }

      if (filterParams.userId) {
        params.user_id = filterParams.userId;
      }

      if (filterParams.dateRange && filterParams.dateRange.length === 2) {
        params.startDate = moment(filterParams.dateRange[0]).format('YYYY-MM-DD');
        params.endDate = moment(filterParams.dateRange[1]).format('YYYY-MM-DD');
      }

      const response = await axios.get(`${API_URL}/sessions`, {
        params
      });

      // Handle response based on the API structure shown in screenshots
      const sessionsData = response.data.sessions || [];
      const dataWithIndex = sessionsData.map((session, index) => ({
        ...session,
        key: session.id,
        sno: index + 1,
        // Ensure consistent field names
        userId: session.userId || session.user_id,
        username: session.username || session.userName,
        userEmail: session.userEmail || session.user_email,
        orgId: session.orgId || session.org_id,
        ipAddress: session.ipAddress || session.ip_address,
        deviceInfo: session.deviceInfo || session.device_info,
        loginTime: session.loginTime || session.login_time,
        logoutTime: session.logoutTime || session.logout_time,
        durationMinutes: session.durationMinutes || session.duration_minutes,
      }));
      setSessions(dataWithIndex);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      message.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [filterParams, user]);

  // Fetch users for dropdown
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
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
    }
  }, []);

  // Fetch organizations for dropdown (only for super admin)
  const fetchOrganizations = useCallback(async () => {
    if (isSuperAdmin()) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await axios.get(`${API_URL}/organizations`, {
          params: {
            tenant_id: currentUser?.tenant?.tenant_id || ''
          }
        });
        const organizationsData = response?.data?.organizations || [];
        setOrganizations(organizationsData);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        message.error('Failed to fetch organizations');
      }
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchSessions();
    fetchUsers();
    fetchOrganizations();
  }, [fetchSessions, fetchUsers, fetchOrganizations]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      
      // Based on API screenshots, only send required fields
      if (values.deviceInfo) {
        formData.append('deviceInfo', values.deviceInfo);
      }
      if (values.loginTime) {
        formData.append('loginTime', moment(values.loginTime).format('YYYY-MM-DD[T]HH:mm:ss[Z]'));
      }
      if (values.logoutTime) {
        formData.append('logoutTime', moment(values.logoutTime).format('YYYY-MM-DD[T]HH:mm:ss[Z]'));
      }
      if (values.status) {
        formData.append('status', values.status);
      }

      if (editingId) {
        // Update existing session
        await axios.post(`${API_URL}/sessions/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Session updated successfully');
      } else {
        // Create new session
        await axios.post(`${API_URL}/sessions`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Session created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchSessions();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle session deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/sessions/${id}`);
      message.success('Session deleted successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilterParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilterParams({
      userId: '',
      orgId: '',
      dateRange: [],
    });
  };

  // Load modal data (users and organizations) when opening modal
  const loadModalData = async () => {
    setModalLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
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
    form.resetFields();
    setIsModalOpen(true);
    await loadModalData();
  };

  const openEditModal = async (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      deviceInfo: record.deviceInfo,
      loginTime: record.loginTime ? moment(record.loginTime) : null,
      logoutTime: record.logoutTime ? moment(record.logoutTime) : null,
      status: record.status,
    });
    setIsModalOpen(true);
    await loadModalData();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingId(null);
  };

  // Memoized table columns
  const columns = useMemo(() => [
    {
      title: 'S.No',
      dataIndex: 'sno',
      key: 'sno',
      width: 80,
      sorter: (a, b) => a.sno - b.sno,
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div className="session-user-info">
          <div>{text}</div>
          <div className="session-user-email">{record.userEmail}</div>
        </div>
      ),
      sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
    },
    {
      title: 'Organization',
      dataIndex: 'orgId',
      key: 'orgId',
      render: (orgId) => {
        const org = organizations.find(org => org.id === orgId);
        return org?.name || org?.organization_name || orgId || '-';
      },
      sorter: (a, b) => {
        const orgA = organizations.find(org => org.id === a.orgId)?.name || '';
        const orgB = organizations.find(org => org.id === b.orgId)?.name || '';
        return orgA.localeCompare(orgB);
      },
    },
    {
      title: 'Session Time',
      key: 'sessionTime',
      render: (_, record) => (
        <div className="session-time-info">
          <div>Login: {record.loginTime ? moment(record.loginTime).format('YYYY-MM-DD HH:mm') : '-'}</div>
          <div>Logout: {record.logoutTime ? moment(record.logoutTime).format('YYYY-MM-DD HH:mm') : 'Active'}</div>
          {record.durationMinutes && (
            <div className="session-duration">
              Duration: {Math.floor(record.durationMinutes / 60)}h {record.durationMinutes % 60}m
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => {
        const dateA = a.loginTime ? new Date(a.loginTime) : new Date(0);
        const dateB = b.loginTime ? new Date(b.loginTime) : new Date(0);
        return dateA - dateB;
      },
    },
    {
      title: 'Device Info',
      dataIndex: 'deviceInfo',
      key: 'deviceInfo',
      sorter: (a, b) => (a.deviceInfo || '').localeCompare(b.deviceInfo || ''),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      sorter: (a, b) => (a.ipAddress || '').localeCompare(b.ipAddress || ''),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const getStatusClassName = (status) => {
          switch(status) {
            case 'active': return 'session-status-active';
            case 'completed': return 'session-status-completed';
            case 'expired': return 'session-status-expired';
            case 'terminated': return 'session-status-terminated';
            default: return '';
          }
        };
        
        return (
          <span className={getStatusClassName(status)}>
            {status || 'Unknown'}
          </span>
        );
      },
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Completed', value: 'completed' },
        { text: 'Expired', value: 'expired' },
        { text: 'Terminated', value: 'terminated' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
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
              title="Are you sure to delete this session?"
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
  ], [organizations, canUpdate, canDelete]);

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
      <div className="user-sessions-container">
        <div className="filter-section">
          <Row gutter={16}>
            <Col span={isSuperAdmin() ? 6 : 8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select User"
                allowClear
                value={filterParams?.userId || null}
                onChange={(value) => handleFilterChange('userId', value)}
              >
                {users?.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.username || user.name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Col>
            {isSuperAdmin() && (
              <Col span={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select Organization"
                  allowClear
                  value={filterParams.orgId || null}
                  onChange={(value) => handleFilterChange('orgId', value)}
                >
                  {organizations.map(org => (
                    <Option key={org.id} value={org.id}>
                      {org.name || org.organization_name}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}
            <Col span={isSuperAdmin() ? 8 : 12}>
              <RangePicker
                style={{ width: '100%' }}
                value={filterParams.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
              />
            </Col>
            <Col span={2}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchSessions}
                className="session-search-button"
              >
                Search
              </Button>
            </Col>
            <Col span={2}>
              <Button
                onClick={resetFilters}
                className="session-reset-button"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </div>

        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            className="session-add-button"
          >
            Add Session
          </Button>
        )}

        <Table
          columns={columns}
          dataSource={sessions}
          loading={loading}
          rowKey="id"
          scroll={{ x: true }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          expandable={{
            expandedRowRender: (record) => (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="User ID">{record.userId}</Descriptions.Item>
                <Descriptions.Item label="Organization ID">{record.orgId}</Descriptions.Item>
                <Descriptions.Item label="Login Time">
                  {record.loginTime ? moment(record.loginTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Logout Time">
                  {record.logoutTime ? moment(record.logoutTime).format('YYYY-MM-DD HH:mm:ss') : 'Still active'}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {record.durationMinutes ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="IP Address">{record.ipAddress || '-'}</Descriptions.Item>
                <Descriptions.Item label="Device Info">{record.deviceInfo || '-'}</Descriptions.Item>
                <Descriptions.Item label="Status">{record.status || '-'}</Descriptions.Item>
              </Descriptions>
            ),
            rowExpandable: (record) => true,
          }}
        />

        {(canCreate || canUpdate) && (
          <Modal
            title={editingId ? 'Edit Session' : 'Create Session'}
            open={isModalOpen}
            onCancel={closeModal}
            footer={null}
            destroyOnClose
            centered
            mask={true}
            maskClosable={false}
            width={600}
            style={{ top: 20 }}
            bodyStyle={{ padding: '24px' }}
          >
            {modalLoading ? (
              <div className="session-modal-loading">
                <Spin size="large" />
                <div className="session-modal-loading-text">
                  Loading modal data...
                </div>
              </div>
            ) : (
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  name="deviceInfo"
                  label="Device Info"
                  rules={[{ required: true, message: 'Please input device info!' }]}
                >
                  <Input placeholder="e.g., Chrome/Windows 10" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="loginTime"
                      label="Login Time"
                      rules={[{ required: true, message: 'Please select login time!' }]}
                    >
                      <DatePicker 
                        format="YYYY-MM-DD" 
                        style={{ width: '100%' }}
                        placeholder="Select login time"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="logoutTime"
                      label="Logout Time"
                    >
                      <DatePicker 
                        format="YYYY-MM-DD" 
                        style={{ width: '100%' }}
                        placeholder="Select logout time"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="active">Active</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="expired">Expired</Option>
                    <Option value="terminated">Terminated</Option>
                  </Select>
                </Form.Item>

                <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
                  <Space>
                    <Button onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={submitLoading}>
                      {editingId ? 'Update' : 'Submit'}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </Modal>
        )}
      </div>
    </ConfigProvider>
  );
};

export default UserSessions;