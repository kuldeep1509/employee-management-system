
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useFormik } from 'formik'; 

import { addTask, getTaskDetails, updateTask, getEmployees, getTaskStatuses, getUsers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';


const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      assigned_to: null, 
      assigned_by: null,
      status: null,
      due_date: '',
    },
    
    validate: (values) => {
      const errors = {};

      if (!values.title) {
        errors.title = 'Title is required';
      }

      if (!values.description) {
        errors.description = 'Description is required';
      }

     
      if (values.assigned_to === null || isNaN(values.assigned_to)) {
        errors.assigned_to = 'Assigned employee is required';
      }

      if (values.assigned_by === null || isNaN(values.assigned_by)) {
        errors.assigned_by = 'Assigned by is required';
      }

      if (values.status === null || isNaN(values.status)) {
        errors.status = 'Status is required';
      }

      if (!values.due_date) {
        errors.due_date = 'Due date is required';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.due_date)) {
        errors.due_date = 'Invalid date format (YYYY-MM-DD)';
      }

      return errors;
    },
    onSubmit: async (values) => {
      // Prepare payload, ensuring number fields are correctly typed
      const payload = {
        ...values,
        // Ensure values are numbers or null for API submission
        // Formik's handleChange for Select with value={null} will pass null, no need for extra checks here if using null for "None"
      };

      // Handle optional due_date: send null if empty string
      if (payload.due_date === '') {
        payload.due_date = null;
      }

      try {
        if (id) {
          await updateTask(id, payload);
          setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
        } else {
          await addTask(payload);
          setSnackbar({ open: true, message: 'Task assigned successfully!', severity: 'success' });
          formik.resetForm(); // Use formik.resetForm()
        }
        setTimeout(() => navigate('/tasks'), 1500);
      } catch (err) {
        console.error('Error saving task:', err.response?.data || err.message);
        let errorMessage = 'Failed to save task.';
        if (err.response?.data) {
          errorMessage += ' Details: ' + JSON.stringify(err.response.data);
        }
        setError(errorMessage);
        setSnackbar({ open: true, message: 'Failed to save task.', severity: 'error' });
      }
    },
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [employeesRes, statusesRes, usersRes] = await Promise.all([
          getEmployees({ page_size: 1000 }),
          getTaskStatuses(),
          getUsers(),
        ]);
        setEmployees(employeesRes.data.results);
        let allStatuses = statusesRes.data.results;

        if (!id) {
          allStatuses = allStatuses.filter(
            (status) => status.name.toLowerCase() !== 'completed'
          );
        }
        setTaskStatuses(allStatuses);
        setUsers(usersRes.data.results);

        if (id) {
          const taskRes = await getTaskDetails(id);
          taskRes.data.due_date = taskRes.data.due_date ? new Date(taskRes.data.due_date).toISOString().split('T')[0] : '';

          // Set Formik values directly
          formik.setValues({
            ...taskRes.data,
            // Ensure values are null if they are 0 or empty from API for selects
            assigned_to: taskRes.data.assigned_to || null,
            assigned_by: taskRes.data.assigned_by || null,
            status: taskRes.data.status || null,
          });
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form data. Please refresh.');
        setSnackbar({ open: true, message: 'Failed to load form data.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id]); // No longer need formik.reset in dependencies, use formik.setValues directly

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <LoadingSpinner message={id ? "Loading Task..." : "Initializing Task Form..."} />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Edit Task' : 'Assign New Task'}
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {/* Use formik.handleSubmit */}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title" // Formik requires the name prop
            value={formik.values.title} // Bind value to Formik state
            onChange={formik.handleChange} // Handle changes
            onBlur={formik.handleBlur} // Handle blur for touched state
            error={formik.touched.title && !!formik.errors.title} // Display error if touched and error exists
            helperText={formik.touched.title && formik.errors.title}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && !!formik.errors.description}
            helperText={formik.touched.description && formik.errors.description}
            margin="normal"
          />

          <FormControl fullWidth margin="normal" error={formik.touched.assigned_to && !!formik.errors.assigned_to}>
            <InputLabel id="assigned-to-label">Assigned To</InputLabel>
            <Select
              labelId="assigned-to-label"
              label="Assigned To"
              name="assigned_to" // Formik requires the name prop
              value={formik.values.assigned_to === null ? '' : formik.values.assigned_to} // Convert null to empty string for MUI Select display
              onChange={(e) => {
                // Formik's handleChange automatically handles name, value.
                // For Select, we might need a custom handler to convert empty string to null if 'None' is selected.
                const value = e.target.value === '' ? null : Number(e.target.value);
                formik.setFieldValue('assigned_to', value); // Manually set field value for type conversion
              }}
              onBlur={formik.handleBlur} // Use formik.handleBlur for consistency
            >
              <MenuItem value={''}><em>None</em></MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.assigned_to && formik.errors.assigned_to && (
              <Typography color="error" variant="caption">
                {formik.errors.assigned_to}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal" error={formik.touched.assigned_by && !!formik.errors.assigned_by}>
            <InputLabel id="assigned-by-label">Assigned By</InputLabel>
            <Select
              labelId="assigned-by-label"
              label="Assigned By"
              name="assigned_by"
              value={formik.values.assigned_by === null ? '' : formik.values.assigned_by}
              onChange={(e) => {
                const value = e.target.value === '' ? null : Number(e.target.value);
                formik.setFieldValue('assigned_by', value);
              }}
              onBlur={formik.handleBlur}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username}
                  {(user.first_name || user.last_name) && ` (${user.first_name} ${user.last_name})`}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.assigned_by && formik.errors.assigned_by && (
              <Typography color="error" variant="caption">
                {formik.errors.assigned_by}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal" error={formik.touched.status && !!formik.errors.status}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              name="status"
              value={formik.values.status === null ? '' : formik.values.status}
              onChange={(e) => {
                const value = e.target.value === '' ? null : Number(e.target.value);
                formik.setFieldValue('status', value);
              }}
              onBlur={formik.handleBlur}
            >
              <MenuItem value={''}><em>None</em></MenuItem>
              {taskStatuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.status && formik.errors.status && (
              <Typography color="error" variant="caption">
                {formik.errors.status}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Due Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            name="due_date"
            value={formik.values.due_date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.due_date && !!formik.errors.due_date}
            helperText={formik.touched.due_date && formik.errors.due_date}
            margin="normal"
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/tasks')}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={formik.isSubmitting}>
              {id ? 'Update Task' : 'Assign Task'}
            </Button>
          </Box>
        </form>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskForm;