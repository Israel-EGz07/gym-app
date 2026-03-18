import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Comments.css';

const Comments = () => {
  const { isAuthenticated, user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
    title: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments?limit=10');
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/comments/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ content: '', rating: 5, title: '' });
        setShowForm(false);
        fetchComments();
        fetchStats();
      } else {
        setMessage({ type: 'danger', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al enviar comentario' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!isAuthenticated) return;

    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="comments-page">
      {/* Hero */}
      <section className="comments-hero">
        <div className="container">
          <h1>Reseñas y Comentarios</h1>
          <p>La opinión de nuestra comunidad es muy importante para nosotros</p>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="comments-stats">
          <div className="container">
            <div className="stats-summary">
              <div className="stat-box">
                <span className="stat-rating">{Number(stats.stats?.averageRating || 0).toFixed(1)}</span>
                <div className="stars">{renderStars(Math.round(Number(stats.stats?.averageRating || 0)))}</div>
                <span className="stat-total">{stats.stats?.approved || 0} reseñas</span>
              </div>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = stats.ratingDistribution?.[star] || 0;
                  const total = stats.stats?.approved || 1;
                  const percentage = (count / total) * 100;
                  return (
                    <div className="rating-bar" key={star}>
                      <span className="bar-label">{star} ★</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Add Comment Button */}
      <section className="comments-actions">
        <div className="container">
          {isAuthenticated ? (
            <div className="add-comment-section">
              {!showForm ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Escribir una Reseña
                </button>
              ) : (
                <div className="comment-form-card">
                  <h3>Escribe tu reseña</h3>
                  {message.text && (
                    <div className={`alert alert-${message.type}`}>{message.text}</div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Título</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Título de tu reseña"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Calificación</label>
                      <div className="rating-select">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, rating: star })}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tu opinión</label>
                      <textarea
                        className="form-control"
                        placeholder="Comparte tu experiencia con nosotros..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                        rows={4}
                      ></textarea>
                    </div>
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? 'Enviando...' : 'Enviar Reseña'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="login-prompt">
              <p>¿Ya eres miembro? <Link to="/login">Inicia sesión</Link> para escribir una reseña</p>
              <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link> y únete a nuestra comunidad</p>
            </div>
          )}
        </div>
      </section>

      {/* Comments List */}
      <section className="comments-list-section section">
        <div className="container">
          <h2>Últimas Reseñas</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="comments-list">
              {comments.map((comment) => (
                <div className="comment-item" key={comment._id}>
                  <div className="comment-header">
                    <div className="comment-user">
                      <div className="user-avatar">
                        {comment.user?.name?.charAt(0) || '?'}
                      </div>
                      <div className="user-info">
                        <span className="user-name">
                          {comment.user?.name} {comment.user?.lastName}
                        </span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="comment-rating">
                      {renderStars(comment.rating)}
                    </div>
                  </div>
                  {comment.title && (
                    <h4 className="comment-title">{comment.title}</h4>
                  )}
                  <p className="comment-content">{comment.content}</p>
                  {comment.adminResponse && (
                    <div className="admin-response">
                      <strong>Respuesta:</strong>
                      <p>{comment.adminResponse.content}</p>
                    </div>
                  )}
                  <div className="comment-actions">
                    <button 
                      className={`action-btn ${comment.userHasLiked ? 'active' : ''}`}
                      onClick={() => handleLike(comment._id)}
                      disabled={!isAuthenticated}
                    >
                      👍 {comment.likesCount || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay reseñas aún. ¡Sé el primero en comentar!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Comments;
