import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Contact.css';

const Contact = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [contactInfo, setContactInfo] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContactInfo();
    fetchFaqs();
    
    // Pre-fill form if authenticated
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/contact/info');
      const data = await response.json();
      if (data.success) {
        setContactInfo(data.info);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/contact/faq');
      const data = await response.json();
      if (data.success) {
        setFaqs(data.faqs);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setFormData({
          name: isAuthenticated ? user?.name || '' : '',
          email: isAuthenticated ? user?.email || '' : '',
          phone: '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        setMessage({ type: 'danger', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al enviar mensaje' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contáctanos</h1>
          <p>Estamos aquí para ayudarte. Escríbenos y te responderemos pronto.</p>
        </div>
      </section>

      <div className="container">
        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="form-card">
              <h2>Envíanos un Mensaje</h2>
              
              {message.text && (
                <div className={`alert alert-${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isAuthenticated}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Correo *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isAuthenticated}
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
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Categoría</label>
                      <select
                        name="category"
                        className="form-control"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="general">General</option>
                        <option value="ventas">Ventas</option>
                        <option value="soporte">Soporte</option>
                        <option value="quejas">Quejas</option>
                        <option value="sugerencias">Sugerencias</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Asunto *</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-control"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mensaje *</label>
                  <textarea
                    name="message"
                    className="form-control"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="¿En qué podemos ayudarte?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info-section">
            {contactInfo && (
              <div className="info-card">
                <h3>Información de Contacto</h3>
                
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <strong>Dirección</strong>
                    <p>{contactInfo.address.street}, {contactInfo.address.city}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">📞</div>
                  <div className="info-content">
                    <strong>Teléfono</strong>
                    <p>{contactInfo.phone}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">✉️</div>
                  <div className="info-content">
                    <strong>Email</strong>
                    <p>{contactInfo.email}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">💬</div>
                  <div className="info-content">
                    <strong>WhatsApp</strong>
                    <p>{contactInfo.whatsapp}</p>
                  </div>
                </div>

                <h4 className="mt-4">Horario de Atención</h4>
                <div className="hours-list">
                  {Object.entries(contactInfo.hours).map(([day, hours]) => (
                    <div className="hours-item" key={day}>
                      <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      <span className="hours">{hours.open} - {hours.close}</span>
                    </div>
                  ))}
                </div>

                <h4 className="mt-4">Síguenos</h4>
                <div className="social-links">
                  {Object.entries(contactInfo.socialMedia).map(([platform, url]) => (
                    <a 
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {!loading && faqs.length > 0 && (
              <div className="faq-card">
                <h3>Preguntas Frecuentes</h3>
                <div className="faq-list">
                  {faqs.slice(0, 4).map((faq, index) => (
                    <div className="faq-item" key={index}>
                      <h5>{faq.question}</h5>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
