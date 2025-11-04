import React from 'react';
import InvoiceList from '../../components/business/invoice/InvoiceList';

const InvoiceManagementPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Management</h1>
      <InvoiceList />
    </div>
  );
};

export default InvoiceManagementPage;
