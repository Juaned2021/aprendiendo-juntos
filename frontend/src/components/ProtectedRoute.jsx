import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { getRoles } from '../utils/auth';

export default function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = getRoles();
  let userRole = null;

  if (allowedRoles) {
    // Normalize to lowercase for comparison, but preserve original casing for prop
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    const normalizedUserRoles = userRoles.map(r => r.toLowerCase());
    const hasRole = normalizedAllowed.some(role => normalizedUserRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/login" replace />;
    }
    // Find matching role preserving original casing from allowedRoles or userRoles
    userRole = allowedRoles.find(role => normalizedUserRoles.includes(role.toLowerCase()));
    if (!userRole) {
      // Fallback to first matching user role capitalized
      const matchingUserRole = userRoles.find(role => normalizedAllowed.includes(role.toLowerCase()));
      userRole = matchingUserRole ? matchingUserRole.charAt(0).toUpperCase() + matchingUserRole.slice(1).toLowerCase() : 'admin';
    }
  }

  // Clone the child element and pass the role as a prop (capitalized)
  const childWithRole = React.cloneElement(children, { role: userRole });

  return childWithRole;
}

