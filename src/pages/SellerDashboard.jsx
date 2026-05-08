import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { sellerApi } from '../lib/api';
import './SellerDashboard.css';

const metrics = [
  { label: 'Total Revenue', value: '₹4,87,500', change: '+12.3%', up: true, color: 'var(--accent)', bg: 'var(--accent-glow)' },
  { label: 'Orders This Month', value: '156', change: '+8.7%', up: true, color: 'var(--coral)', bg: 'var(--coral-soft)' },
  { label: 'Avg. Order Value', value: '₹3,125', change: '+2.1%', up: true, color: 'var(--lavender)', bg: 'var(--lavender-soft)' },
  { label: 'Return Rate', value: '4.2%', change: '-1.5%', up: false, color: 'var(--teal)', bg: 'var(--teal-soft)' },
];

const recentOrders = [
  { id: 'BLV-0847', product: 'Draped Silk Blouse', size: '2XL', status: 'Delivered', amount: '₹4,999', date: '28 Apr' },
  { id: 'BLV-0844', product: 'Structured Wool Blazer', size: '3XL', status: 'Shipped', amount: '₹7,499', date: '27 Apr' },
  { id: 'BLV-0841', product: 'Golden Embroidered Kurta', size: '4XL', status: 'Processing', amount: '₹5,499', date: '26 Apr' },
  { id: 'BLV-0838', product: 'Charcoal Evening Gown', size: '2XL', status: 'Delivered', amount: '₹8,999', date: '25 Apr' },
];

const commission = [
  { category: 'Women Ethnic Wear', rate: '17%', revenue: '₹1,24,500', commission: '₹21,165' },
  { category: 'Women Western Wear', rate: '19%', revenue: '₹2,45,000', commission: '₹46,550' },
  { category: 'Accessories', rate: '12%', revenue: '₹1,18,000', commission: '₹14,160' },
];

const statusChipMap = {
  'Delivered': 'chip-teal',
  'Shipped': 'chip-lavender',
  'Processing': 'chip-coral',
};

const formatMetricValue = (metric) => {
  if (metric.label?.toLowerCase().includes('revenue') || metric.label?.toLowerCase().includes('order value')) {
    return typeof metric.value === 'number' ? `₹${metric.value.toLocaleString()}` : metric.value;
  }
  return typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value;
};

const SellerDashboard = () => {
  const [dashboard, setDashboard] = useState({ metrics, recentOrders, commissions: commission });

  useEffect(() => {
    sellerApi.dashboard()
      .then((response) => {
        setDashboard({
          metrics: (response.metrics || metrics).map((metric, index) => ({
            ...metrics[index % metrics.length],
            ...metric,
            value: formatMetricValue(metric),
            up: !String(metric.change || '').startsWith('-')
          })),
          recentOrders: response.recentOrders?.length ? response.recentOrders.map((order) => ({
            id: order.id,
            product: order.product || 'Marketplace order',
            size: order.size || 'Mixed',
            status: order.status,
            amount: typeof order.amount === 'number' ? `₹${order.amount.toLocaleString()}` : order.amount,
            date: order.date
          })) : recentOrders,
          commissions: response.commissions?.length ? response.commissions.map((row) => ({
            ...row,
            revenue: row.revenue || 'API linked',
            commission: row.commission || 'Auto'
          })) : commission
        });
      })
      .catch(() => setDashboard({ metrics, recentOrders, commissions: commission }));
  }, []);

  return (
    <div className="seller-page">
      <section className="section-sm">
        <div className="container">
          <div className="flex justify-between items-start">
            <div>
              <span className="label-caps" style={{ color: 'var(--lavender)' }}>Seller Hub</span>
              <h1 className="headline-md mt-2">Dashboard</h1>
              <p className="body-sm text-muted mt-1">Welcome back, Sizeupp Store</p>
            </div>
            <button className="btn btn-gold">Upload Catalog</button>
          </div>

          {/* Metrics — each card has a unique color accent */}
          <div className="metrics-grid mt-8">
            {dashboard.metrics.map((m, i) => (
              <div key={i} className="metric-card p-6" style={{ '--metric-color': m.color }}>
                <div className="metric-icon-dot" style={{ background: m.bg }} />
                <span className="label-caps-sm text-muted">{m.label}</span>
                <p className="metric-value mt-2" style={{ color: m.color }}>{m.value}</p>
                <span className={`body-sm ${m.up ? 'text-success' : ''}`} style={!m.up ? { color: 'var(--coral)' } : {}}>{m.change}</span>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="mt-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="headline-sm">Recent Orders</h2>
              <span className="label-caps" style={{ color: 'var(--coral)' }}>View All →</span>
            </div>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th className="label-caps-sm">Order ID</th>
                    <th className="label-caps-sm">Product</th>
                    <th className="label-caps-sm">Size</th>
                    <th className="label-caps-sm">Status</th>
                    <th className="label-caps-sm">Amount</th>
                    <th className="label-caps-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="body-sm" style={{ fontWeight: 600 }}>{order.id}</td>
                      <td className="body-sm">{order.product}</td>
                      <td className="body-sm">{order.size}</td>
                      <td>
                        <span className={`chip ${statusChipMap[order.status] || ''}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="body-sm" style={{ fontWeight: 500 }}>{order.amount}</td>
                      <td className="body-sm text-muted">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commission Breakdown */}
          <div className="mt-12">
            <h2 className="headline-sm mb-6">Commission Breakdown</h2>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th className="label-caps-sm">Category</th>
                    <th className="label-caps-sm">Rate</th>
                    <th className="label-caps-sm">Revenue</th>
                    <th className="label-caps-sm">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.commissions.map((c, i) => {
                    const rateColors = ['var(--coral)', 'var(--lavender)', 'var(--teal)'];
                    return (
                      <tr key={i}>
                        <td className="body-sm">{c.category}</td>
                        <td className="body-sm" style={{ fontWeight: 600, color: rateColors[i] }}>{c.rate}</td>
                        <td className="body-sm">{c.revenue}</td>
                        <td className="body-sm" style={{ fontWeight: 500 }}>{c.commission}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
