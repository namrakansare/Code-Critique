import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import logo from "../assets/logo.jpg";
const { Title } = Typography;
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Register() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
  
      const response = await axios.post("http://localhost:5000/api/register", values, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(response);
      
      if (response.status === 200) {
        message.success(response.data.message);
        const token = response.data.token;
        navigate(`/otp-verification`,{ state: { token } });

      } else {
        message.error(response.data.error);
      }
    } catch (error: any) {
      console.error("Error:", error);
  
      if (error.response) {
        message.error(error.response.data.error || "Something went wrong!");
      } else if (error.request) {
        message.error("No response from server. Check Flask backend.");
      } else {
        message.error("Request failed. Please try again.");
      }
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
                prefix={<MailOutlined className="text-black" />}
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
                prefix={<UserOutlined className="text-black" />}
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
                prefix={<LockOutlined className="text-black" />}
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
                prefix={<LockOutlined className="text-black" />}
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
                className="w-full bg-black hover:bg-gray-800 focus:bg-gray-800"
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

export default Register;