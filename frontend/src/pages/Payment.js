import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Payment.css';

const Payment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [plan, setPlan] = useState(null);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'tarjeta',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: ''
  });

  useEffect(() => {
    fetchPlan();
    fetchMethods();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/plans/${planId}`);
      const data = await response.json();
      if (data.success) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMethods = async () => {
    try {
      const response = await fetch('/api/payments/methods');
      const data = await response.json();
      if (data.success) {
        setMethods(data.methods);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId,
          paymentMethod: paymentData.paymentMethod,
          ...(paymentData.paymentMethod === 'tarjeta' && {
            cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
            cardExpiry: paymentData.cardExpiry,
            cardCvc: paymentData.cardCvc
          })
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '¡Pago procesado exitosamente!' });
        setTimeout(() => navigate('/perfil'), 2000);
      } else {
        setMessage({ type: 'danger', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al procesar el pago' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="alert alert-danger">
            Plan no encontrado
          </div>
          <Link to="/planes" className="btn btn-primary">
            Ver Planes
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = plan.discountPercentage > 0 
    ? Math.round(plan.price * (1 - plan.discountPercentage / 100))
    : plan.price;

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <h1>Checkout</h1>
          <p>Completa tu compra de forma segura</p>
        </div>

        <div className="payment-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Resumen del Pedido</h3>
            <div className="plan-details">
              <h4>{plan.name}</h4>
              <p>{plan.shortDescription || plan.description}</p>
              
              <div className="price-section">
                <span className="final-price">${finalPrice}</span>
                {plan.discountPercentage > 0 && (
                  <div className="discount-info">
                    <span className="original-price">${plan.price}</span>
                    <span className="discount-tag">-{plan.discountPercentage}%</span>
                  </div>
                )}
              </div>
              
              <ul className="plan-features-summary">
                {plan.features?.filter(f => f.included).slice(0, 5).map((feature, index) => (
                  <li key={index}>✓ {feature.name}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-section">
            <div className="card">
              <div className="card-body">
                <h3>Método de Pago</h3>
                
                {message.text && (
                  <div className={`alert alert-${message.type}`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Payment Methods */}
                  <div className="payment-methods">
                    {methods.map((method) => (
                      <label 
                        key={method.id}
                        className={`method-option ${paymentData.paymentMethod === method.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentData.paymentMethod === method.id}
                          onChange={handleChange}
                        />
                        <div className="method-info">
                          <strong>{method.name}</strong>
                          <span>{method.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Card Details */}
                  {paymentData.paymentMethod === 'tarjeta' && (
                    <div className="card-details">
                      <div className="form-group">
                        <label className="form-label">Nombre en la Tarjeta</label>
                        <input
                          type="text"
                          name="cardName"
                          className="form-control"
                          placeholder="Como aparece en la tarjeta"
                          value={paymentData.cardName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Número de Tarjeta</label>
                        <input
                          type="text"
                          name="cardNumber"
                          className="form-control"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={handleChange}
                          maxLength="19"
                          required
                        />
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <div className="form-group">
                            <label className="form-label">Expiración</label>
                            <input
                              type="text"
                              name="cardExpiry"
                              className="form-control"
                              placeholder="MM/YY"
                              value={paymentData.cardExpiry}
                              onChange={handleChange}
                              maxLength="5"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group">
                            <label className="form-label">CVC</label>
                            <input
                              type="text"
                              name="cardCvc"
                              className="form-control"
                              placeholder="123"
                              value={paymentData.cardCvc}
                              onChange={handleChange}
                              maxLength="4"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="secure-notice">
                    🔒 Pago seguro. Tus datos están protegidos.
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg btn-block"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="spinner spinner-sm"></span>
                        Procesando...
                      </>
                    ) : (
                      `Pagar $${finalPrice}`
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
