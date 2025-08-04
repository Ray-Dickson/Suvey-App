import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const PrivateRoute = () => {
  const [isAuth, setIsAuth] = useState(null); // null = loading, true/false = result

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuth(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 && response.data.valid) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        setIsAuth(false);
      }
    };

    verifyToken();
  }, []);

  if (isAuth === null) {
    return <div className="text-center mt-10">Checking authentication...</div>;
  }

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

