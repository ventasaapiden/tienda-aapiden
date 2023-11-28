import {FC} from 'react'
import { Box } from '@mui/system';
import { IconButton, Typography } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.js';

interface Props {
  currentValue: number;
  maxValue: number;
  updatedQuantity: (newValue: number) => void;
}

export const ItemCounter: FC<Props> = ({currentValue, maxValue, updatedQuantity}) => {

    const addOrRemove = (value: number) => {
        if(value === -1){
          if(currentValue === 1) return;

          return updatedQuantity(currentValue-1)
        }

        if(currentValue >= maxValue) return Swal.fire('Lo sentimos', 'No hay más productos disponibles en este momento', 'error');;

        updatedQuantity(currentValue+1)
    }

  return (
    <Box display='flex' alignItems='center'>
        <IconButton onClick={() => addOrRemove(-1)}>
            <RemoveCircleOutline />
        </IconButton>
        <Typography sx={{width:40, textAlign:'center'}}>{currentValue}</Typography>
        <IconButton onClick={() => addOrRemove(1)}>
            <AddCircleOutline />
        </IconButton>
    </Box>
  )
}
