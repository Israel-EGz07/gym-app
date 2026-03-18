import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    members: 0,
    trainers: 0,
    classes: 0,
    years: 0
  });

  // Animación de números
  useEffect(() => {
    const targetStats = { members: 2500, trainers: 50, classes: 100, years: 10 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setStats({
        members: Math.floor(targetStats.members * progress),
        trainers: Math.floor(targetStats.trainers * progress),
        classes: Math.floor(targetStats.classes * progress),
        years: Math.floor(targetStats.years * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: '🏋️',
      title: 'Equipamiento Moderno',
      description: 'Última generación en máquinas y pesas libres'
    },
    {
      icon: '👨‍🏫',
      title: 'Entrenadores Certificados',
      description: 'Profesionales listos para ayudarte a alcanzar tus metas'
    },
    {
      icon: '🧘',
      title: 'Clases Grupales',
      description: 'Yoga, spinning, HIIT y más para todas las niveles'
    },
    {
      icon: '💪',
      title: 'Área de Pesas',
      description: 'Espacio completo para entrenamiento de fuerza'
    },
    {
      icon: '🏃',
      title: 'Zona Cardio',
      description: 'Caminadoras, bicicletas y elípticos de última generación'
    },
    {
      icon: '🧖',
      title: 'Áreas de Descanso',
      description: 'Sauna, vestidores amplios y zonas de estiramiento'
    }
  ];

  const testimonials = [
    {
      name: 'Carlos Mendoza',
      role: 'Miembro desde 2021',
      image: '👨',
      comment: 'El mejor gimnasio al que he ido. Las instalaciones son impecables y los trainers son muy profesionales.',
      rating: 5
    },
    {
      name: 'Ana García',
      role: 'Miembro desde 2022',
      image: '👩',
      comment: 'Perdí 15 kg en 6 meses gracias al programa de entrenamiento personalizado. ¡Totalmente recomendada!',
      rating: 5
    },
    {
      name: 'Roberto Sánchez',
      role: 'Miembro desde 2020',
      image: '👨',
      comment: 'La variedad de clases grupales es increíble. Nunca me aburro de venir al gym.',
      rating: 5
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title animate-slideUp">
            Transforma Tu Cuerpo,<br />
            <span className="highlight">Cambia Tu Vida</span>
          </h1>
          <p className="hero-subtitle animate-slideUp" style={{ animationDelay: '0.2s' }}>
            Únete a la comunidad fitness más grande de la ciudad. 
            Equilibrio perfecto entre tecnología, comodidad y resultados.
          </p>
          <div className="hero-buttons animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Empezar Ahora
            </Link>
            <Link to="/planes" className="btn btn-white btn-lg">
              Ver Planes
            </Link>
          </div>
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{stats.members.toLocaleString()}+</span>
              <span className="stat-label">Miembros</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.trainers}+</span>
              <span className="stat-label">Entrenadores</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.classes}+</span>
              <span className="stat-label">Clases Semanales</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.years}+</span>
              <span className="stat-label">Años de Experiencia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">¿Por Qué Elegirnos?</h2>
            <p className="section-subtitle">
              Descubre todo lo que tenemos para ofrecerte en tu camino hacia una vida más saludable
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                className="feature-card" 
                key={index}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section section section-dark">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Nuestra Historia</h2>
              <p>
                Fundado en 2014, FitLife Gym comenzó con una visión simple: 
                crear un espacio donde las personas pudieran transformar sus vidas 
                a través del ejercicio físico y una comunidad de apoyo.
              </p>
              <p>
                Hoy, con más de 2,500 miembros activos y un equipo de 50+ 
                profesionales capacitados, continuamos innovando y creciendo 
                para ofrecer siempre lo mejor a nuestra comunidad.
              </p>
              <div className="about-values">
                <div className="value-item">
                  <span className="value-icon">🎯</span>
                  <span>Misión</span>
                </div>
                <div className="value-item">
                  <span className="value-icon">👁️</span>
                  <span>Visión</span>
                </div>
                <div className="value-item">
                  <span className="value-icon">❤️</span>
                  <span>Valores</span>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <span>🏋️‍♂️</span>
                <p>Tu трансформация comienza aquí</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Lo Que Dicen Nuestros Miembros</h2>
            <p className="section-subtitle">
              Miles de personas han transformado su vida con nosotros
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div className="testimonial-rating">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">"{testimonial.comment}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.image}</div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo Para Empezar Tu Transformación?</h2>
            <p>
              Únete hoy y obtén tu primera clase gratis. 
              Sin compromiso, sin技巧 oculta.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Regístrate Gratis
              </Link>
              <Link to="/contacto" className="btn btn-outline btn-lg">
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
