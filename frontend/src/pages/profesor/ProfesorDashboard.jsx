import Dashboard from '../../components/Dashboard';

export default function ProfesorDashboard() {
  const cards = [
    { title: 'Mi Horario', content: 'Consulta tus clases programadas por día', icon: '📅', link: '/profesor/horario' },
    { title: 'Mis Clases', content: 'Próximamente: Gestiona tus clases', icon: '📚' },
    { title: 'Recursos', content: 'Sube material educativo a tus clases', icon: '📝', link: '/profesor/recursos' },
  ];

  return (
    <Dashboard
      title="Bienvenido, Profesor"
      welcomeMessage="Gestiona tu horario y recursos desde este panel"
      cards={cards}
    />
  );
}
