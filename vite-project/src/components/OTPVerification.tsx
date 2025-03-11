import React, { useState, useRef, KeyboardEvent } from 'react';
import { Typography, Button, message } from 'antd';
import otpBg from "../assets/otp-background.jpg";

const { Title } = Typography;

function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if value is entered
      if (value && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, index) => {
        if (index < 4) newOtp[index] = char;
      });
      setOtp(newOtp);
      inputRefs[Math.min(pastedData.length, 3)].current?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.some(digit => !digit)) {
      message.error('Please enter all digits of the OTP');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('OTP verified successfully!');
      // Here you would typically make your API call to verify the OTP
    } catch (error) {
      message.error('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('New OTP has been sent to your email!');
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } catch (error) {
      message.error('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${otpBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.3)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto backdrop-blur-sm bg-opacity-95">
          <div className="text-center mb-8">
            <Title level={2} className="!mb-2">Enter OTP</Title>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-14 h-14 text-2xl text-center border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none bg-gray-50"
              />
            ))}
          </div>

          <div className="space-y-4">
            <Button
              type="primary"
              onClick={handleVerify}
              loading={loading}
              className="w-full bg-orange-500 hover:bg-orange-800 focus:bg-orange-800 h-12 text-lg"
            >
              Verify
            </Button>

            <div className="text-center">
              <button
                onClick={handleResend}
                className="text-red-600 hover:text-red-500 focus:outline-none text-sm"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;