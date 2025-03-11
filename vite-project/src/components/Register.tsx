import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import logo from "../assets/logo.jpg";
const { Title } = Typography;

function App() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject('Password is required');
    }
    if (value.length < 8) {
      return Promise.reject('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      return Promise.reject('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(value)) {
      return Promise.reject('Password must contain at least one special character (!@#$%^&*)');
    }
    return Promise.resolve();
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form values:', values);
      message.success('OTP has been sent to your email!');
      // You would typically make your API call here
    } catch (error) {
      message.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with animation */}
      <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center p-8">
        <div className="max-w-md">
          <img
          src={logo}
            alt="Digital Network"
            className="w-full rounded-lg opacity-75"
          />
        </div>
      </div>

      {/* Right side with registration form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Title level={2} className="!mb-2">
              Sign Up!
            </Title>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            className="space-y-4"
            validateTrigger="onSubmit"
          >
            <Form.Item
              name="email"
              validateTrigger="onSubmit"
              rules={[
                { required: true, message: 'Email is required!' },
                { type: 'email', message: 'Please enter a valid email address!' },
                {
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Please enter a valid email address!'
                }
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-orange-400" />}
                placeholder="E-mail"
                size="large"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="username"
              validateTrigger="onSubmit"
              rules={[
                { required: true, message: 'Username is required.' },
                { min: 3, message: 'Username must be at least 3 characters long.' },
                { max: 20, message: 'Username cannot exceed 20 characters.' },
                {
                  pattern: /^[a-zA-Z0-9_-]+$/,
                  message: 'Username can only contain letters, numbers, underscores, and hyphens!'
                }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-orange-400" />}
                placeholder="Username"
                size="large"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="password"
              validateTrigger="onSubmit"
              rules={[
                { required: true, message: 'Password is required.' },
                { validator: validatePassword }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-orange-400" />}
                placeholder="Password"
                size="large"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              validateTrigger="onSubmit"
              rules={[
                { required: true, message: 'Please confirm your password.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match.'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-orange-400" />}
                placeholder="Confirm Password"
                size="large"
                className="rounded-md"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full bg-orange-500 hover:bg-gray-800 focus:bg-gray-800"
              >
                Get OTP
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default App;