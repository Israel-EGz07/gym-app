import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    lastName: '',
    phone: '',
    gender: 'no-especificado',
    birthDate: '',
    fitnessLevel: 'principiante',
    stats: {
      weight: '',
      height: '',
      goalWeight: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [payments, setPayments] = useState([]);
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        gender: user.gender || 'no-especificado',
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        fitnessLevel: user.fitnessLevel || 'principiante',
        stats: {
          weight: user.stats?.weight || '',
          height: user.stats?.height || '',
          goalWeight: user.stats?.goalWeight || ''
        }
      });
      setMembership(user.membership);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('stats.')) {
      const statKey = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        stats: { ...prev.stats, [statKey]: value }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await updateProfile(profileData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } else {
      setMessage({ type: 'danger', text: result.message });
    }
    setLoading(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

    if (result.success) {
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'danger', text: result.message });
    }
    setLoading(false);
  };

  const getMembershipStatusBadge = () => {
    const status = membership?.membershipStatus || user?.membershipStatus || 'ninguna';
    const statusColors = {
      activa: 'badge-success',
      expirada: 'badge-danger',
      cancelada: 'badge-warning',
      ninguna: 'badge-primary'
    };
    return statusColors[status] || 'badge-primary';
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="profile-info">
            <h1>{user?.name} {user?.lastName}</h1>
            <p>{user?.email}</p>
            {membership && (
              <span className={`badge ${getMembershipStatusBadge()}`}>
                Membresía {membership?.name || 'Activa'}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Mi Perfil
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Estadísticas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Mis Pagos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Seguridad
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="tab-panel">
              <div className="card">
                <div className="card-body">
                  <h3>Información Personal</h3>
                  {message.text && (
                    <div className={`alert alert-${message.type}`}>{message.text}</div>
                  )}
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                          <label className="form-label">Nombre</label>
                          <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={profileData.name}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label className="form-label">Apellido</label>
                          <input
                            type="text"
                            name="lastName"
                            className="form-control"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                          <label className="form-label">Teléfono</label>
                          <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label className="form-label">Fecha de Nacimiento</label>
                          <input
                            type="date"
                            name="birthDate"
                            className="form-control"
                            value={profileData.birthDate}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                          <label className="form-label">Género</label>
                          <select
                            name="gender"
                            className="form-control"
                            value={profileData.gender}
                            onChange={handleProfileChange}
                          >
                            <option value="no-especificado">No especificado</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label className="form-label">Nivel de Condición</label>
                          <select
                            name="fitnessLevel"
                            className="form-control"
                            value={profileData.fitnessLevel}
                            onChange={handleProfileChange}
                          >
                            <option value="principiante">Principiante</option>
                            <option value="intermedio">Intermedio</option>
                            <option value="avanzado">Avanzado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="tab-panel">
              <div className="card">
                <div className="card-body">
                  <h3>Mis Estadísticas</h3>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row">
                      <div className="col-4">
                        <div className="form-group">
                          <label className="form-label">Peso (kg)</label>
                          <input
                            type="number"
                            name="stats.weight"
                            className="form-control"
                            value={profileData.stats.weight}
                            onChange={handleProfileChange}
                            step="0.1"
                          />
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="form-group">
                          <label className="form-label">Altura (cm)</label>
                          <input
                            type="number"
                            name="stats.height"
                            className="form-control"
                            value={profileData.stats.height}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="form-group">
                          <label className="form-label">Peso Objetivo (kg)</label>
                          <input
                            type="number"
                            name="stats.goalWeight"
                            className="form-control"
                            value={profileData.stats.goalWeight}
                            onChange={handleProfileChange}
                            step="0.1"
                          />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Guardando...' : 'Actualizar Estadísticas'}
                    </button>
                  </form>

                  <div className="stats-cards mt-4">
                    <div className="stat-card">
                      <span className="stat-icon">🏋️</span>
                      <span className="stat-value">{user?.stats?.totalWorkouts || 0}</span>
                      <span className="stat-label">Entrenamientos</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">📅</span>
                      <span className="stat-value">{user?.stats?.visits || 0}</span>
                      <span className="stat-label">Visitas</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">🎯</span>
                      <span className="stat-value">{membership?.daysRemaining || 0}</span>
                      <span className="stat-label">Días Restantes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="tab-panel">
              <div className="card">
                <div className="card-body">
                  <h3>Historial de Pagos</h3>
                  {payments.length > 0 ? (
                    <div className="payments-list">
                      {payments.map((payment) => (
                        <div className="payment-item" key={payment.id}>
                          <div className="payment-info">
                            <strong>{payment.planId?.name || 'Plan'}</strong>
                            <span className="payment-date">
                              {new Date(payment.paymentDate).toLocaleDateString('es-MX')}
                            </span>
                          </div>
                          <div className="payment-details">
                            <span className={`badge badge-${payment.status === 'completado' ? 'success' : 'warning'}`}>
                              {payment.status}
                            </span>
                            <span className="payment-amount">${payment.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No hay pagos registrados</p>
                      <Link to="/planes" className="btn btn-primary">
                        Ver Planes
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-panel">
              <div className="card">
                <div className="card-body">
                  <h3>Cambiar Contraseña</h3>
                  {message.text && (
                    <div className={`alert alert-${message.type}`}>{message.text}</div>
                  )}
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                      <label className="form-label">Contraseña Actual</label>
                      <input
                        type="password"
                        name="currentPassword"
                        className="form-control"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nueva Contraseña</label>
                      <input
                        type="password"
                        name="newPassword"
                        className="form-control"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                  </form>

                  <div className="mt-5">
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
