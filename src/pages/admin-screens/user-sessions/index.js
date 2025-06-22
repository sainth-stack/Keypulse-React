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
  Row,
  Col,
  DatePicker,
  Select,
  Descriptions,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { isSuperAdmin } from '../../../utils';
import { API_URL } from '../../../const';

const { RangePicker } = DatePicker;
const { Option } = Select;

const UserSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [filterParams, setFilterParams] = useState({
    userId: '',
    orgId: '',
    dateRange: [],
  });

  // Get permissions from localStorage
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check specific permissions
  const canCreate = userPermissions.includes("sessions_Create");
  const canUpdate = userPermissions.includes("sessions_Write");
  const canDelete = userPermissions.includes("sessions_Delete");

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      let params = {};
      
      if (!isSuperAdmin()) {
        params.orgId = user?.organization;
      } else {
        if (filterParams.orgId) {
          params.orgId = filterParams.orgId;
        }
      }

      if (filterParams.userId) {
        params.userId = filterParams.userId;
      }

      if (filterParams.dateRange && filterParams.dateRange.length === 2) {
        params.startDate = moment(filterParams.dateRange[0]).format('YYYY-MM-DD');
        params.endDate = moment(filterParams.dateRange[1]).format('YYYY-MM-DD');
      }

      const response = await axios.get('http://54.169.213.200:4003/api/sessions', {
        params
      });

      const dataWithIndex = response.data.sessions.map((session, index) => ({
        ...session,
        key: session.id,
        sno: index + 1,
      }));
      setSessions(dataWithIndex);
    } catch (error) {
      message.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for filter dropdown
  // const fetchUsers = async () => {
  //   try {
  //     const response = await axios.get('http://54.169.213.200:4003/api/users');
  //     setUsers(response.data.users);
  //   } catch (error) {
  //     message.error('Failed to fetch users');
  //   }
  // };


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

  // Fetch organizations for filter dropdown (only for super admin)
  const fetchOrganizations = async () => {
    if (isSuperAdmin()) {
      try {
        const response = await axios.get('http://54.169.213.200:4003/api/organizations');
        setOrganizations(response.data.organizations);
      } catch (error) {
        message.error('Failed to fetch organizations');
      }
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchUsers();
    fetchOrganizations();
  }, [filterParams]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', values.userId);
      formData.append('userName', values.userName);
      formData.append('userEmail', values.userEmail);
      formData.append('orgId', values.orgId);
      formData.append('ipAddress', values.ipAddress);
      formData.append('deviceInfo', values.deviceInfo);
      formData.append('loginTime', moment(values.loginTime).toISOString());
      formData.append('logoutTime', moment(values.logoutTime).toISOString());
      formData.append('status', values.status);

      if (editingId) {
        await axios.put(`http://54.169.213.200:4003/api/sessions/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Session updated successfully');
      } else {
        await axios.post('http://54.169.213.200:4003/api/sessions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Session created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchSessions();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle session deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://54.169.213.200:4003/api/sessions/${id}`);
      message.success('Session deleted successfully');
      fetchSessions();
    } catch (error) {
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

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sno',
      key: 'sno',
      width: 80,
      sorter: (a, b) => a.sno - b.sno,
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.userEmail}</div>
        </div>
      ),
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Organization',
      dataIndex: 'orgId',
      key: 'orgId',
      render: (orgId) => organizations.find(org => org.id === orgId)?.name || orgId,
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
        <div>
          <div>Login: {moment(record.loginTime).format('YYYY-MM-DD HH:mm')}</div>
          <div>Logout: {record.logoutTime ? moment(record.logoutTime).format('YYYY-MM-DD HH:mm') : 'Active'}</div>
        </div>
      ),
      sorter: (a, b) => new Date(a.loginTime) - new Date(b.loginTime),
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
      render: (status) => (
        <span style={{
          color: status === 'active' ? 'green' : 'inherit',
          fontWeight: status === 'active' ? 'bold' : 'normal'
        }}>
          {status}
        </span>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Expired', value: 'expired' },
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
              onClick={() => {
                setEditingId(record.id);
                form.setFieldsValue({
                  userId: record.userId,
                  userName: record.userName,
                  userEmail: record.userEmail,
                  orgId: record.orgId,
                  ipAddress: record.ipAddress,
                  deviceInfo: record.deviceInfo,
                  loginTime: moment(record.loginTime),
                  logoutTime: record.logoutTime ? moment(record.logoutTime) : null,
                  status: record.status,
                });
                setIsModalOpen(true);
              }}
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
        <div style={{ marginBottom: '16px', padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
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
                    {user.name} ({user.email})
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
                    <Option key={org.id} value={org.id}>{org.name}</Option>
                  ))}
                </Select>
              </Col>
            )}
            <Col span={isSuperAdmin() ? 8 : 12}>
              <RangePicker
                style={{ width: '100%' }}
                value={filterParams.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </Col>
            <Col span={2}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchSessions}
                style={{ width: '100%' }}
              >
                Search
              </Button>
            </Col>
            <Col span={2}>
              <Button
                onClick={resetFilters}
                style={{ width: '100%' }}
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
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            style={{ marginBottom: '16px' }}
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
          expandable={{
            expandedRowRender: (record) => (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="User ID">{record.userId}</Descriptions.Item>
                <Descriptions.Item label="Organization ID">{record.orgId}</Descriptions.Item>
                <Descriptions.Item label="Login Time">
                  {moment(record.loginTime).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Logout Time">
                  {record.logoutTime ? moment(record.logoutTime).format('YYYY-MM-DD HH:mm:ss') : 'Still active'}
                </Descriptions.Item>
                <Descriptions.Item label="IP Address">{record.ipAddress}</Descriptions.Item>
                <Descriptions.Item label="Device Info">{record.deviceInfo}</Descriptions.Item>
              </Descriptions>
            ),
            rowExpandable: (record) => true,
          }}
        />

        {(canCreate || canUpdate) && (
          <Modal
            title={editingId ? 'Edit Session' : 'Create Session'}
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
            width={700}
            style={{ top: 20 }}
            bodyStyle={{ padding: '24px' }}
          >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="userId"
                    label="User ID"
                    rules={[{ required: true, message: 'Please input user ID!' }]}
                  >
                    <Input placeholder="Enter user ID" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="userName"
                    label="User Name"
                    rules={[{ required: true, message: 'Please input user name!' }]}
                  >
                    <Input placeholder="Enter user name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="userEmail"
                    label="User Email"
                    rules={[
                      { required: true, message: 'Please input user email!' },
                      { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                  >
                    <Input placeholder="Enter user email" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="orgId"
                    label="Organization"
                    rules={[{ required: true, message: 'Please select organization!' }]}
                  >
                    <Select placeholder="Select organization">
                      {organizations.map(org => (
                        <Option key={org.id} value={org.id}>{org.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="ipAddress"
                    label="IP Address"
                    rules={[{ required: true, message: 'Please input IP address!' }]}
                  >
                    <Input placeholder="Enter IP address" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="deviceInfo"
                    label="Device Info"
                    rules={[{ required: true, message: 'Please input device info!' }]}
                  >
                    <Input placeholder="Enter device info" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="loginTime"
                    label="Login Time"
                    rules={[{ required: true, message: 'Please select login time!' }]}
                  >
                    <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="logoutTime"
                    label="Logout Time"
                  >
                    <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
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
                  <Button
                    onClick={() => {
                      setIsModalOpen(false);
                      form.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={submitLoading}>
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

export default UserSessions;