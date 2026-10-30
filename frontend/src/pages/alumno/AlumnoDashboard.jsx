import Dashboard from '../../components/Dashboard';

export default function AlumnoDashboard() {
  const cards = [
    { title: 'Mi Horario', content: 'Consulta tus clases programadas', icon: '📅', link: '/alumno/horario', color: '#3b82f6' },
    { title: 'Mis Clases', content: 'Próximamente: Ver tus clases', icon: '📚', color: '#8b5cf6' },
    { title: 'Recursos', content: 'Próximamente: Material educativo', icon: '📝', link: '/alumno/recursos', color: '#10b981' },
    { title: 'Mis Progresos', content: 'Seguimiento de tu aprendizaje', icon: '📈', color: '#f59e0b' },
    { title: 'Comunicados', content: 'Mensajes de tus profesores', icon: '💬', color: '#ef4444' },
    { title: 'Actividades', content: 'Tareas y trabajos pendientes', icon: '✏️', color: '#06b6d4' }
  ];

  return (
    <Dashboard
      title="Bienvenido a Aprendiendo juntos"
      welcomeMessage="Tu espacio educativo digital - Explora tus clases y recursos"
      cards={cards}
    />
  );
}
