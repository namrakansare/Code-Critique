import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Code2 } from 'lucide-react';
import logo from "../assets/logo.jpg";

const { Title, Text } = Typography;

function Login() {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with illustration */}
      <div className="hidden md:flex md:w-1/2 bg-white items-center justify-center p-8">
        <div className="max-w-md">
          <Code2 className="w-16 h-16 mb-6 text-gray-800" />
          <img
            src={logo}
            alt="Coding illustration"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Title level={2} className="!text-white !mb-2">
              Welcome Back!
            </Title>
            <Text className="text-gray-400">
              Don't have an account yet?{' '}
              <a href="#" className="text-white hover:underline">
                Sign Up
              </a>
            </Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Username"
                size="large"
                className="bg-white border-gray-700 font-bold placeholder-gray-500 rounded-md mb-2"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Password"
                size="large"
                className="bg-white border-gray-700 font-bold placeholder-gray-500 rounded-md mb-2"
              />
            </Form.Item>

            <div className="flex justify-end">
              <a href="#" className="text-yellow-500 hover:text-white text-sm">
                Forgot Password?
              </a>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full bg-blue border-gray-700 hover:bg-gray-700 focus:bg-gray-700 shadow-md"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;