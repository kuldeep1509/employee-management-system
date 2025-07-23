
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button,
   Snackbar, Alert, TextField
  
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getTasks, deleteTask } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import useDebounce from '../hook/useDebounce';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskTable from '../components/TaskTable';
import '../style/TaskList.css'

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [orderBy, setOrderBy] = useState('due_date');
  const [order, setOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const debouncedSearch = useDebounce(search, 500);


  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search: debouncedSearch,
        ordering: order === 'desc' ? `-${orderBy}` : orderBy,
      };
      const response = await getTasks(params);
      setTasks(response.data.results);
      setTotalCount(response.data.count);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again.');
      setSnackbar({ open: true, message: 'Failed to fetch tasks.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, orderBy, order]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleDeleteClick = (taskId) => {
    setTaskToDelete(taskId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        setSnackbar({ open: true, message: 'Task deleted successfully!', severity: 'success' });
        fetchTasks(); // Re-fetch tasks to update the list
      } catch (err) {
        console.error('Error deleting task:', err);
        setSnackbar({ open: true, message: 'Failed to delete task.', severity: 'error' });
      } finally {
        setTaskToDelete(null);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (statusName) => {
    switch (statusName) {
      case 'To Do': return 'default';
      case 'In Progress': return 'info';
      case 'Compeleted': return 'success';
      case 'Blocked': return 'error';
      default: return 'primary';
    }
  };


  if (loading) {
    return <LoadingSpinner message="Loading Tasks..." />;
  }

  return (
    
    

    <>
    <Box className="task-page">
      <Button
        variant="outlined"
        className="back-btn"
        onClick={() => navigate('/')}
      >
        ← Back
      </Button>

      <Typography variant="h4" component="h1" className="task-heading">
        Task List
      </Typography>

      <Box className="task-search-add">
        <TextField
          className="task-search"
          label="Search Tasks"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
        />
        <Button
          variant="contained"
          className="task-add-btn"
          startIcon={<AddIcon />}
          component={Link}
          to="/tasks/new"
        >
          Assign New Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <TaskTable
        tasks={tasks}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        onDeleteClick={handleDeleteClick}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        getStatusColor={getStatusColor}
      />

      <ConfirmDialog
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  </>
  );

};

export default TaskList;