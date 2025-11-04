import React, { useEffect, useState } from 'react';
import { getInvoices } from '../../../api/invoiceApi';
import InvoiceDetails from './InvoiceDetails';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Invoices</h3>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by farmer or ID"
            className="border px-4 py-2 rounded-md"
          />
          <select className="border px-4 py-2 rounded-md">
            <option>All Statuses</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">Invoice ID</th>
              <th className="py-2 px-4 border-b">Farmer</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="py-2 px-4 border-b">{invoice.id}</td>
                <td className="py-2 px-4 border-b">{invoice.farmer}</td>
                <td className="py-2 px-4 border-b">{invoice.amount}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${{
                      Paid: 'bg-green-200 text-green-800',
                      Pending: 'bg-yellow-200 text-yellow-800',
                      Overdue: 'bg-red-200 text-red-800',
                    }[invoice.status]}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{invoice.date}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => setSelectedInvoice(invoice)} className="text-blue-500 hover:underline mr-4">View Details</button>
                  {invoice.status === 'Pending' && (
                    <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InvoiceDetails invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
};

export default InvoiceList;
