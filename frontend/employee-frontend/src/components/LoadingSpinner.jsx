
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="70vh">
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>{message}</Typography>
    </Box>
  );
};

export default LoadingSpinner;