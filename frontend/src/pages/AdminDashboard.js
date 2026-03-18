import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [userRes, payRes, commentRes] = await Promise.all([
          fetch('/api/users/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/payments/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/comments/stats', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const [userData, payData, commentData] = await Promise.all([
          userRes.json(),
          payRes.json(),
          commentRes.json()
        ]);
        
        setStats({
          users: userData.stats,
          payments: payData.stats,
          comments: commentData.stats
        });
      } else if (activeTab === 'users') {
        const response = await fetch('/api/users?limit=20', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setUsers(data.users || []);
      } else if (activeTab === 'payments') {
        const response = await fetch('/api/payments/admin/all?limit=20', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setPayments(data.payments || []);
      } else if (activeTab === 'comments') {
        const response = await fetch('/api/comments/admin/all?limit=20', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      await fetch(`/api/comments/admin/${commentId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleRejectComment = async (commentId) => {
    try {
      await fetch(`/api/comments/admin/${commentId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Panel de Administración</h1>
          <p>Gestiona usuarios, pagos y contenido</p>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Resumen
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Usuarios
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            💳 Pagos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            💬 Comentarios
          </button>
        </div>

        {/* Content */}
        <div className="admin-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner spinner-lg"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && stats && (
                <div className="overview-grid">
                  <div className="stat-card">
                    <h3>Usuarios</h3>
                    <div className="stat-value">{stats.users?.totalUsers || 0}</div>
                    <div className="stat-breakdown">
                      <span>Activos: {stats.users?.activeMembers || 0}</span>
                      <span>Inactivos: {stats.users?.inactiveUsers || 0}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <h3>Ingresos Totales</h3>
                    <div className="stat-value">${stats.payments?.totalRevenue || 0}</div>
                    <div className="stat-breakdown">
                      <span>Transacciones: {stats.payments?.totalTransactions || 0}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <h3>Comentarios</h3>
                    <div className="stat-value">{stats.comments?.total || 0}</div>
                    <div className="stat-breakdown">
                      <span>Pendientes: {stats.comments?.pending || 0}</span>
                      <span>Aprobados: {stats.comments?.approved || 0}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <h3>Comentarios con Reseñas</h3>
                    <div className="stat-value">{stats.comments?.averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="stat-breakdown">
                      <span>⭐ Rating promedio</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="data-table">
                  <h3>Lista de Usuarios</h3>
                  {users.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Membresía</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id}>
                            <td>{user.name} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.membershipStatus}</td>
                            <td>
                              <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                {user.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No hay usuarios</p>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="data-table">
                  <h3>Historial de Pagos</h3>
                  {payments.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Monto</th>
                          <th>Método</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(payment => (
                          <tr key={payment._id}>
                            <td>{payment.userName}</td>
                            <td>${payment.amount}</td>
                            <td>{payment.paymentMethod}</td>
                            <td>
                              <span className={`badge badge-${payment.status === 'completado' ? 'success' : 'warning'}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No hay pagos</p>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="data-table">
                  <h3>Comentarios (Moderación)</h3>
                  {comments.length > 0 ? (
                    <div className="comments-list">
                      {comments.map(comment => (
                        <div className="comment-item" key={comment._id}>
                          <div className="comment-content">
                            <strong>{comment.user?.name}</strong>
                            <p>{comment.content}</p>
                            <span className="badge">{comment.status}</span>
                          </div>
                          {comment.status === 'pendiente' && (
                            <div className="comment-actions">
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleApproveComment(comment._id)}
                              >
                                Aprobar
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRejectComment(comment._id)}
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No hay comentarios</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
