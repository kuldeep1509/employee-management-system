import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Divider, List, ListItem, ListItemText, Alert, Chip, Snackbar,
  Button
} from '@mui/material';
import { getEmployeeDetails } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await getEmployeeDetails(id);
        setEmployee(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError('Failed to load employee details. Please try again.');
        setSnackbar({ open: true, message: 'Failed to load employee details.', severity: 'error' });
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <LoadingSpinner message="Loading Employee Details..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h6" color="textSecondary">Employee not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        
    <Button
    variant="outlined"
    color="secondary"
    onClick={() => navigate('/')}
    sx={{ mb: 2 }}
    >
        ← Back
    </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        Employee Details
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Name:</Typography>
            <Typography>{employee.first_name} {employee.last_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Email:</Typography>
            <Typography>{employee.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Phone:</Typography>
            <Typography>{employee.phone_number || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Position:</Typography>
            <Typography>{employee.position}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Department:</Typography>
            <Typography>{employee.department}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Hire Date:</Typography>
            <Typography>{employee.hire_date}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom>
          Assigned Tasks
        </Typography>
        {employee.tasks && employee.tasks.length > 0 ? (
          <List>
            {employee.tasks.map((task) => (
              <Paper key={task.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                <ListItem disablePadding>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status_name}
                          color={
                            task.status_name === 'To Do' ? 'default' :
                            task.status_name === 'In Progress' ? 'info' :
                            task.status_name === 'Completed' ? 'success' :
                            'warning'
                          }
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {task.description || 'No description provided.'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Due: {task.due_date || 'N/A'} | Assigned by: {task.assigned_by_name || 'Unknown'} | Created: {new Date(task.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="textSecondary">No tasks assigned to this employee.</Typography>
        )}
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeDetails;