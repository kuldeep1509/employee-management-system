import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button,
  CircularProgress, TextField,
  TablePagination, Snackbar, Alert
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { getEmployees, deleteEmployee } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import useDebounce from '../hook/useDebounce';
import EmployeeTable from '../components/EmployeeTable';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'; 

import '../style/EmployeeList.css'


const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const EmployeeList = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [displayedEmployees, setDisplayedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  

 

  const fetchAllEmployees = useCallback(async (currentSearch, currentOrderBy, currentOrder) => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        page_size: 1000,
        search: currentSearch,
        ordering: currentOrder === 'desc' ? `-${currentOrderBy}` : currentOrderBy,
      };
      const response = await getEmployees(params);
      const fetchedResults = response.data.results || [];
      setAllEmployees(fetchedResults);
      setTotalCount(fetchedResults.length);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees. Please try again.');
      setSnackbar({ open: true, message: 'Failed to fetch employees.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    fetchAllEmployees(debouncedSearch, orderBy, order);
  }, [debouncedSearch, orderBy, order, fetchAllEmployees]);

  useEffect(() => {
    const sorted = [...allEmployees].sort((a, b) => {
      const aVal = a[orderBy]?.toString().toLowerCase() || '';
      const bVal = b[orderBy]?.toString().toLowerCase() || '';
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setDisplayedEmployees(sorted.slice(startIndex, endIndex));
    setTotalCount(sorted.length);
  }, [page, rowsPerPage, allEmployees, order, orderBy]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleDeleteClick = (employeeId) => {
    setEmployeeToDelete(employeeId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (employeeToDelete) {
      try {
        await deleteEmployee(employeeToDelete);
        setSnackbar({ open: true, message: 'Employee deleted successfully!', severity: 'success' });
        await fetchAllEmployees(debouncedSearch, orderBy, order);
        const updatedTotal = allEmployees.length - 1;
        const newMaxPage = Math.max(0, Math.ceil(updatedTotal / rowsPerPage) - 1);
        if (page > newMaxPage) {
          setPage(newMaxPage);
        }
      } catch (err) {
        console.error('Error deleting employee:', err);
        setSnackbar({ open: true, message: 'Failed to delete employee.', severity: 'error' });
      } finally {
        setEmployeeToDelete(null);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const taskData = allEmployees.map(emp => {
    const incompleteTasks = emp.task_counts
      ? (emp.task_counts.to_do || 0) + (emp.task_counts.in_progress || 0)
      : emp.task_count || 0;

    return {
      name: `${emp.first_name} ${emp.last_name}`,
      tasks: incompleteTasks,
    };
  });

  if (loading && allEmployees.length === 0) {
    return <LoadingSpinner message="Loading Employees..." />;
  }

  return (
    <Box className="employee-page">
  <Typography className="employee-heading">Employee List</Typography>

  <Box className="glass-card mb-4" display="flex" justifyContent="space-between" alignItems="center">
    <TextField
      className="search-bar"
      label="Search Employees"
      variant="outlined"
      value={search}
      onChange={handleSearchChange}
      sx={{ width: '300px', input: { color: 'black' }, label: { color: '#ccc' } }}
    />
    <Button
      variant="contained"
      className="add-btn"
      startIcon={<AddIcon />}
      component={Link}
      to="/employees/new"
    >
      Add Employee
    </Button>
  </Box>

  {/* Chart */}
  {taskData.length > 0 && (
    <>
      <Box className="glass-card mb-4">
        <Typography variant="h6" gutterBottom sx={{ color: '#0dcaf0' }}>
          Tasks Per Employee
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis allowDecimals={false} stroke="#fff" />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#088bd6" name="Tasks" />

            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </>
  )}
      {loading && allEmployees.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <EmployeeTable
        displayedEmployees={displayedEmployees}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        onDeleteClick={handleDeleteClick}
        loading={loading}
        search={search}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        />


      <ConfirmDialog
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleConfirm={handleConfirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeList;
