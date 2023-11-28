import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface OrderFilterProps {
  selectedState: string;
  handleChange: (event: React.ChangeEvent<{ value: unknown; }>) => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({ selectedState, handleChange }) => {
  const handleStateChange = (event: SelectChangeEvent<string>) => {
    handleChange(event as React.ChangeEvent<{ value: unknown; }>); // Aquí realizamos una conversión de tipo
  };

  return (
    <FormControl variant="outlined" sx={{mt:2, mb:2, minWidth:200}}>
      <InputLabel>Estado</InputLabel>
      <Select value={selectedState} onChange={handleStateChange} label="Estado">
        <MenuItem value="pendiente">Pendientes</MenuItem>
        <MenuItem value="pagada">Pagadas</MenuItem>
        <MenuItem value="entregada">Entregadas</MenuItem>
        <MenuItem value="todas">Todas</MenuItem>
      </Select>
    </FormControl>
  );
};

export default OrderFilter;