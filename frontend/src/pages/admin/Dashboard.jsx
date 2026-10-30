import Dashboard from '../../components/Dashboard';

export default function AdminDashboard() {
  const cards = [
    { title: 'Usuarios', content: <p className="stat-number">150</p>, icon: '👥', color: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
    { title: 'Clases', content: <p className="stat-number">25</p>, icon: '🏫', color: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
    { title: 'Materias', content: <p className="stat-number">12</p>, icon: '📘', color: 'linear-gradient(135deg, #10b981, #06b6d4)' },
    { title: 'Horarios', content: <p className="stat-number">48</p>, icon: '📅', color: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  ];

  return (
    <Dashboard
      title="Dashboard Administrativo"
      welcomeMessage="Gestiona usuarios, clases y materias desde este panel"
      cards={cards}
    />
  );
}
