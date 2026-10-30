import { obtenerMiHorario } from '../../services/horarioService';
import Horarios from '../../components/Horarios';

export default function ProfesorHorario() {
  return (
    <Horarios 
      userRole="profesor"
      fetchHorarios={obtenerMiHorario}
      title="Mi Horario"
    />
  );
}
