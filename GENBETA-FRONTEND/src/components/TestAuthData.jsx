import React from 'react';
import { useAuth } from '../context/AuthContext';

const TestAuthData = () => {
  const { user, token } = useAuth();
  
  console.log('AuthContext data in TestAuthData:', { user, token });
  
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
      <h3 className="text-lg font-bold text-yellow-800 mb-2">AuthContext Debug</h3>
      <div className="text-sm space-y-1">
        <p>User exists: {user ? 'Yes' : 'No'}</p>
        <p>Token exists: {token ? 'Yes' : 'No'}</p>
        {user && (
          <>
            <p>Name: {user.name || 'N/A'}</p>
            <p>Email: {user.email || 'N/A'}</p>
            <p>Role: {user.role || 'N/A'}</p>
            <p>Employee ID: {user.employeeID || 'N/A'}</p>
            <p>Department: {user.department || 'N/A'}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default TestAuthData;