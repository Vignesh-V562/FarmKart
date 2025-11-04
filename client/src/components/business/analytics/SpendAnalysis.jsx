import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { getSpendByCategory, getSpendOverTime, getDetailedReport, exportCsv } from '../../../api/analyticsApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const SpendAnalysis = () => {
  const [spendByCategory, setSpendByCategory] = useState({ labels: [], datasets: [] });
  const [spendOverTime, setSpendOverTime] = useState({ labels: [], datasets: [] });
  const [detailedReport, setDetailedReport] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await getSpendByCategory();
        setSpendByCategory({
          labels: categoryData.map(item => item.category),
          datasets: [
            {
              label: 'Spend by Category',
              data: categoryData.map(item => item.totalSpend),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        });

        const timeData = await getSpendOverTime();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setSpendOverTime({
          labels: timeData.map(item => `${monthNames[item.month - 1]} ${item.year}`),
          datasets: [
            {
              label: 'Spend Over Time',
              data: timeData.map(item => item.totalSpend),
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
            },
          ],
        });

        const reportData = await getDetailedReport();
        setDetailedReport(reportData);

      } catch (error) {
        console.error('Failed to fetch spend analysis data', error);
      }
    };

    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      const csv = await exportCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'detailed-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Spend by Category</h3>
          <Bar data={spendByCategory} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Spend Over Time</h3>
          <Line data={spendOverTime} />
        </div>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Detailed Report</h3>
          <button onClick={handleExport} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Export to CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Spend</th>
                <th className="py-2 px-4 border-b">Supplier</th>
              </tr>
            </thead>
            <tbody>
              {detailedReport.map((row, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{row.category}</td>
                  <td className="py-2 px-4 border-b">₹{row.spend.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{row.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpendAnalysis;
