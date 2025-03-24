import { useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface IBreadcrumbLinkProps {
  to: string;
  children: ReactNode;
}

export const BreadcrumbLink = ({ to, children }: IBreadcrumbLinkProps) => {
  const theme = useTheme();
  return (
    <div className="breadcrumbLink">
      <Link
        to={to}
        style={{
          textDecoration: 'none',
          textDecorationColor: theme.palette.text.secondary,
          color: theme.palette.text.secondary,
        }}
      >
        {children}
      </Link>
    </div>
  );
};
