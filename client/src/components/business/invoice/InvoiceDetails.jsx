import React from 'react';

const InvoiceDetails = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Invoice {invoice.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Farmer:</strong> {invoice.farmer}</p>
            <p><strong>Date:</strong> {invoice.date}</p>
          </div>
          <div className="text-right">
            <p><strong>Status:</strong>
              <span className={`ml-2 px-2 py-1 rounded-full text-sm ${{
                Paid: 'bg-green-200 text-green-800',
                Pending: 'bg-yellow-200 text-yellow-800',
                Overdue: 'bg-red-200 text-red-800',
              }[invoice.status]}`}>
                {invoice.status}
              </span>
            </p>
            <p><strong>Amount:</strong> {invoice.amount}</p>
          </div>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border-b">Product</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock line items */}
              <tr>
                <td className="py-2 px-4 border-b">Apples</td>
                <td className="py-2 px-4 border-b">50 kg</td>
                <td className="py-2 px-4 border-b">₹150/kg</td>
                <td className="py-2 px-4 border-b">₹7,500</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Carrots</td>
                <td className="py-2 px-4 border-b">100 kg</td>
                <td className="py-2 px-4 border-b">₹75/kg</td>
                <td className="py-2 px-4 border-b">₹7,500</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-right mb-6">
          <p><strong>Subtotal:</strong> ₹15,000</p>
          <p><strong>Tax (5%):</strong> ₹750</p>
          <p className="text-xl font-bold"><strong>Total:</strong> ₹15,750</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Print</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
