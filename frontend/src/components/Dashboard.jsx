import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard({ title, welcomeMessage, cards }) {
  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="school-header">
          <div className="school-shield">
            <span>🏫</span>
          </div>
          <div>
            <h1>{title}</h1>
            {welcomeMessage && <p>{welcomeMessage}</p>}
          </div>
        </div>
      </div>
      
      <div className="dashboard-cards">
        {cards.map((card, index) => (
          card.link ? (
            <Link to={card.link} key={index} className="card stat-card card-link">
              <div className="stat-icon" style={{ background: card.color || 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                {card.icon}
              </div>
              <div className="stat-card-content">
                <h3>{card.title}</h3>
                {card.content && <div>{card.content}</div>}
              </div>
            </Link>
          ) : (
            <div key={index} className="card stat-card">
              <div className="stat-icon" style={{ background: card.color || 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                {card.icon}
              </div>
              <div className="stat-card-content">
                <h3>{card.title}</h3>
                {card.content && <div>{card.content}</div>}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  title: PropTypes.string.isRequired,
  welcomeMessage: PropTypes.string,
  cards: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    icon: PropTypes.string,
    link: PropTypes.string,
    color: PropTypes.string
  })).isRequired
};
