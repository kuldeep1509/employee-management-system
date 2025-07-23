
import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, Alert, Snackbar
} from '@mui/material';
import { useFormik } from 'formik';

import { addEmployee, getEmployeeDetails, updateEmployee } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      hire_date: '',
      position: '',
      department: '',
    },
    // Direct Formik validation function
    validate: (values) => {
      const errors = {};

      if (!values.first_name) {
        errors.first_name = 'First name is required';
      }

      if (!values.last_name) {
        errors.last_name = 'Last name is required';
      }

      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }

      if (!values.phone_number) {
        errors.phone_number = 'Phone number is required';
      } else if (!/^\d{10}$/.test(values.phone_number)) {
        errors.phone_number = 'Phone number must be exactly 10 digits and contain digits only';
      }

      if (!values.hire_date) {
        errors.hire_date = 'Hire date is required';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.hire_date)) {
        errors.hire_date = 'Invalid date format (YYYY-MM-DD)';
      }

      if (!values.position) {
        errors.position = 'Position is required';
      }

      if (!values.department) {
        errors.department = 'Department is required';
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        if (id) {
          await updateEmployee(id, values);
          setSnackbar({ open: true, message: 'Employee updated successfully!', severity: 'success' });
        } else {
          await addEmployee(values);
          setSnackbar({ open: true, message: 'Employee added successfully!', severity: 'success' });
          formik.resetForm();
        }
        setTimeout(() => navigate('/'), 1500);
      } catch (err) {
        console.error('Error saving employee:', err.response?.data || err.message);
        setError(`Failed to save employee: ${err.response?.data?.email ? 'Email already exists.' : 'Please check your inputs.'}`);
        setSnackbar({ open: true, message: 'Failed to save employee.', severity: 'error' });
      }
    },
  });

  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const response = await getEmployeeDetails(id);
          response.data.hire_date = response.data.hire_date ? new Date(response.data.hire_date).toISOString().split('T')[0] : '';
          formik.setValues(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching employee:', err);
          setError('Failed to load employee data.');
          setSnackbar({ open: true, message: 'Failed to load employee data.', severity: 'error' });
          setLoading(false);
        }
      };
      fetchEmployee();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <LoadingSpinner message={id ? "Loading Employee..." : "Initializing Form..."} />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Edit Employee' : 'Add New Employee'}
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            label="First Name"
            name="first_name"
            value={formik.values.first_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.first_name && !!formik.errors.first_name}
            helperText={formik.touched.first_name && formik.errors.first_name}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            name="last_name"
            value={formik.values.last_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.last_name && !!formik.errors.last_name}
            helperText={formik.touched.last_name && formik.errors.last_name}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && !!formik.errors.email}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phone_number"
            value={formik.values.phone_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone_number && !!formik.errors.phone_number}
            helperText={formik.touched.phone_number && formik.errors.phone_number}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Hire Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            name="hire_date"
            value={formik.values.hire_date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.hire_date && !!formik.errors.hire_date}
            helperText={formik.touched.hire_date && formik.errors.hire_date}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Position"
            name="position"
            value={formik.values.position}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.position && !!formik.errors.position}
            helperText={formik.touched.position && formik.errors.position}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Department"
            name="department"
            value={formik.values.department}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.department && !!formik.errors.department}
            helperText={formik.touched.department && formik.errors.department}
            margin="normal"
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={formik.isSubmitting}>
              {id ? 'Update Employee' : 'Add Employee'}
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

export default EmployeeForm;