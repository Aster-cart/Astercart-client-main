import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const AuthLayout: React.FC = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
          navigate("/"); // Redirect to the dashboard if token exists
        }
      }, [navigate]);

  return (
    <Outlet/>
  )
}

export default AuthLayout