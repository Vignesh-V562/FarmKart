import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail as verifyEmailApi } from '../../api/authApi';

const EmailVerificationPage = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await verifyEmailApi(token);
        setVerificationStatus('success');
      } catch (error) {
        setVerificationStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div>
      {verificationStatus === 'verifying' && <p>Verifying your email...</p>}
      {verificationStatus === 'success' && (
        <div>
          <p>Email verified successfully!</p>
          <p>
            You can now <Link to="/login">login</Link> to your account.
          </p>
        </div>
      )}
      {verificationStatus === 'error' && (
        <div>
          <p>Email verification failed. The link may be invalid or expired.</p>
        </div>
      )}
    </div>
  );
};

export default EmailVerificationPage;
