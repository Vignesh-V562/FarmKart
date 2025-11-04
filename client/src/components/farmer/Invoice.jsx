import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Invoice = ({ order }) => {
  const downloadInvoice = () => {
    const input = document.getElementById('invoice');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${order._id}.pdf`);
    });
  };

  if (!order) {
    return null;
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = subtotal * 0.1; // Example tax rate
  const shipping = 15.00; // Example shipping cost

  return (
    <div>
      <div id="invoice" className="p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Invoice</h1>
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-700">Invoice #{order._id.substring(0, 8)}...</p>
            <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Billed To:</h2>
            <p className="text-gray-700">{order.customer.name}</p>
            <p className="text-gray-700">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
            <p className="text-gray-700">{order.shippingAddress.state}, {order.shippingAddress.zip}</p>
            <p className="text-gray-700">{order.customer.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">From:</h2>
            <p className="text-gray-700">Farmkart</p>
            <p className="text-gray-700">123 Farm Lane</p>
            <p className="text-gray-700">Farmville, FA 12345</p>
            <p className="text-gray-700">contact@farmkart.com</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Items</h2>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700">Product</th>
                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700">Quantity</th>
                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700">Price</th>
                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.product._id} className="border-b">
                  <td className="py-3 px-4">{item.product.title}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">${item.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-1/3">
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t-2 pt-4 mt-4 border-gray-200">
              <span className="font-bold text-xl">Total</span>
              <span className="font-bold text-xl">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Details</h2>
          <p className="text-gray-700">Payment Method: {order.paymentMethod}</p>
          <p className="text-gray-700">Payment Status: {order.paymentStatus}</p>
        </div>
      </div>
      <div className="text-center mt-8">
        <button
          onClick={downloadInvoice}
          className="py-3 px-8 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-lg"
        >
          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default Invoice;
