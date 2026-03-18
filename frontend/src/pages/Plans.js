import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Plans.css';

const Plans = () => {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        const data = await response.json();
        
        if (data.success) {
          setPlans(data.plans);
        } else {
          setError('Error al cargar los planes');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg"></div>
        <p>Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className="plans-page">
      {/* Hero Section */}
      <section className="plans-hero">
        <div className="container">
          <h1>Nuestros Planes</h1>
          <p>Elige el plan perfecto para ti y comienza tu transformación</p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="plans-section section">
        <div className="container">
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <div className="plans-grid">
            {plans.map((plan) => (
              <div 
                className={`plan-card ${plan.popular ? 'popular' : ''}`}
                key={plan.id}
                style={{ '--plan-color': plan.color }}
              >
                {plan.popular && (
                  <div className="plan-badge">Más Popular</div>
                )}
                
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-description">{plan.shortDescription || plan.description}</p>
                </div>

                <div className="plan-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">
                    {plan.discountPercentage > 0 
                      ? Math.round(plan.price * (1 - plan.discountPercentage / 100))
                      : plan.price
                    }
                  </span>
                  <span className="price-period">/{plan.durationText === 'mensual' ? 'mes' : 'año'}</span>
                </div>

                {plan.discountPercentage > 0 && (
                  <div className="plan-discount">
                    <span className="original-price">${plan.price}</span>
                    <span className="discount-badge">-{plan.discountPercentage}%</span>
                  </div>
                )}

                <ul className="plan-features">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className={feature.included ? 'included' : 'not-included'}>
                      <span className="feature-icon">
                        {feature.included ? '✓' : '×'}
                      </span>
                      {feature.name}
                    </li>
                  ))}
                </ul>

                <div className="plan-footer">
                  {isAuthenticated ? (
                    <Link 
                      to={`/pagos/${plan.id}`}
                      className={`btn btn-lg btn-block ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                    >
                      Comprar Ahora
                    </Link>
                  ) : (
                    <Link 
                      to="/register"
                      className={`btn btn-lg btn-block ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                    >
                      Regístrate para Comprar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="empty-state">
              <p>No hay planes disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section section-light">
        <div className="container">
          <h2 className="section-title text-center">Preguntas Frecuentes</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h4>¿Puedo cambiar de plan después?</h4>
              <p>Sí, puedes actualizar o downgradear tu plan en cualquier momento desde tu perfil.</p>
            </div>
            <div className="faq-item">
              <h4>¿Qué incluye la primera clase gratis?</h4>
              <p>Una sesión de orientación con un trainer certificado que te mostrará las instalaciones y creará tu plan inicial.</p>
            </div>
            <div className="faq-item">
              <h4>¿Hay período de compromiso?</h4>
              <p>No, puedes cancelar tu membresía en cualquier momento. Solo pedimos 48 horas de anticipación.</p>
            </div>
            <div className="faq-item">
              <h4>¿Tienen estacionamiento?</h4>
              <p>Sí, tenemos estacionamiento gratuito para todos nuestros miembros.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Plans;
