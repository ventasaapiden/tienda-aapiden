import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { IProductType } from '../../interfaces/productTypes';

interface OrderFilterProps {
  selectedState: string;
  productTypes: IProductType[];
  handleChange: (event: React.ChangeEvent<{ value: unknown; }>) => void;
}

const ProductTypeFilter: React.FC<OrderFilterProps> = ({ selectedState, handleChange, productTypes }) => {
  const handleStateChange = (event: SelectChangeEvent<string>) => {
    handleChange(event as React.ChangeEvent<{ value: unknown; }>); // Aquí realizamos una conversión de tipo
  };

  return (
    <FormControl variant="outlined" sx={{mt:2, mb:2, minWidth:200}}>
      <InputLabel>Tipo de Productos</InputLabel>
      <Select value={selectedState} onChange={handleStateChange} label="Tipo de Productos">
        {
          productTypes.map(({_id, name}) => (
            
              <MenuItem key={_id} value={_id}>{name}</MenuItem>
            
          ))
        }
      </Select>
    </FormControl>
  );
};

export default ProductTypeFilter;