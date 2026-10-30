import { listarHorarios } from '../../services/horarioService';
import Horarios from '../../components/Horarios';

export default function AdminHorarios() {
  return (
    <Horarios 
      userRole="admin"
      fetchHorarios={listarHorarios}
      title="Horarios"
    />
  );
}
