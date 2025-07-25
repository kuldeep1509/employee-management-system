import { useEffect, useState, useCallback, useMemo } from 'react'; // Added useMemo
import {
  Box, Typography, Button,
  CircularProgress, TextField,
  TablePagination, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem // Added for new filters
} from '@mui/material';
import {
  Add as AddIcon, Clear as ClearIcon // Added ClearIcon
} from '@mui/icons-material';
import { getEmployees, deleteEmployee } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import useDebounce from '../hook/useDebounce';
import EmployeeTable from '../components/EmployeeTable';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const debouncedSearch = useDebounce(search, 500); // Debounced search for API calls

  // --- New Filter States ---
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterHireDateFrom, setFilterHireDateFrom] = useState('');
  const [filterHireDateTo, setFilterHireDateTo] = useState('');
  // --- End New Filter States ---

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAllEmployees = useCallback(async (currentSearch, currentOrderBy, currentOrder) => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        page_size: 1000, // Fetch a large enough number to perform client-side filtering
        search: currentSearch, // API search parameter
        ordering: currentOrder === 'desc' ? `-${currentOrderBy}` : currentOrderBy,
      };
      const response = await getEmployees(params);
      const fetchedResults = response.data.results || [];
      setAllEmployees(fetchedResults);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees. Please try again.');
      setSnackbar({ open: true, message: 'Failed to fetch employees.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(0); // Reset page to 0 on new API search/sort
    fetchAllEmployees(debouncedSearch, orderBy, order);
  }, [debouncedSearch, orderBy, order, fetchAllEmployees]);

  useEffect(() => {
    let currentFilteredEmployees = [...allEmployees];

    // --- Apply Client-Side Filters ---

    // 1. Apply general search filter (if any, separate from debouncedSearch which drives API)
    // This allows the general search bar to filter the already loaded `allEmployees` list
    // even if `debouncedSearch` didn't trigger a *new* API fetch.
    if (search) { // Using 'search' (immediate input) for client-side filtering
      currentFilteredEmployees = currentFilteredEmployees.filter(emp =>
        emp.first_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        (emp.position && emp.position.toLowerCase().includes(search.toLowerCase())) ||
        (emp.department && emp.department.toLowerCase().includes(search.toLowerCase())) ||
        (emp.phone_number && emp.phone_number.includes(search)) // Phone number exact match or contains
      );
    }


    // 2. Apply Department filter
    if (filterDepartment) {
      currentFilteredEmployees = currentFilteredEmployees.filter(
        emp => emp.department === filterDepartment
      );
    }

    // 3. Apply Position filter
    if (filterPosition) {
      currentFilteredEmployees = currentFilteredEmployees.filter(
        emp => emp.position === filterPosition
      );
    }

    // 4. Apply Hire Date Range filter
    if (filterHireDateFrom) {
      const fromDate = new Date(filterHireDateFrom);
      currentFilteredEmployees = currentFilteredEmployees.filter(
        emp => emp.hire_date && new Date(emp.hire_date) >= fromDate
      );
    }
    if (filterHireDateTo) {
      const toDate = new Date(filterHireDateTo);
      // Set to the end of the day for inclusive filtering
      toDate.setHours(23, 59, 59, 999);
      currentFilteredEmployees = currentFilteredEmployees.filter(
        emp => emp.hire_date && new Date(emp.hire_date) <= toDate
      );
    }

    // --- End Apply Client-Side Filters ---


    // Apply sorting
    const sorted = [...currentFilteredEmployees].sort((a, b) => {
      const aVal = a[orderBy]?.toString().toLowerCase() || '';
      const bVal = b[orderBy]?.toString().toLowerCase() || '';
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    setTotalCount(sorted.length); // Update total count after all filtering and sorting

    // Apply pagination
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setDisplayedEmployees(sorted.slice(startIndex, endIndex));

  }, [
    page, rowsPerPage, allEmployees, order, orderBy, search, // Added 'search' and new filter states
    filterDepartment, filterPosition, filterHireDateFrom, filterHireDateTo
  ]);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page to 0 when rows per page changes
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0); // Reset page on search change
  };

  // --- New Filter Handlers ---
  const handleFilterDepartmentChange = (event) => {
    setFilterDepartment(event.target.value);
    setPage(0); // Reset page on filter change
  };

  const handleFilterPositionChange = (event) => {
    setFilterPosition(event.target.value);
    setPage(0); // Reset page on filter change
  };

  const handleFilterHireDateFromChange = (event) => {
    setFilterHireDateFrom(event.target.value);
    setPage(0); // Reset page on filter change
  };

  const handleFilterHireDateToChange = (event) => {
    setFilterHireDateTo(event.target.value);
    setPage(0); // Reset page on filter change
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterDepartment('');
    setFilterPosition('');
    setFilterHireDateFrom('');
    setFilterHireDateTo('');
    setPage(0); // Reset page
  };
  // --- End New Filter Handlers ---


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
        // Re-fetch all employees to update the list and charts
        // This will trigger the main useEffect which re-filters/sorts/paginates
        await fetchAllEmployees(debouncedSearch, orderBy, order);
        // The useEffect will handle page adjustment based on new totalCount
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

  // --- Data Transformations for Charts ---
  const taskData = allEmployees.map(emp => {
    const incompleteTasks = emp.task_counts
      ? (emp.task_counts.to_do || 0) + (emp.task_counts.in_progress || 0)
      : (emp.task_count || 0);

    return {
      name: `${emp.first_name} ${emp.last_name}`,
      tasks: incompleteTasks,
    };
  });

  const getDepartmentDistribution = useCallback(() => {
    const counts = {};
    allEmployees.forEach(emp => {
      const department = emp.department || 'Unassigned';
      counts[department] = (counts[department] || 0) + 1;
    });
    return Object.keys(counts).map(dept => ({
      name: dept,
      value: counts[dept],
    }));
  }, [allEmployees]);

  const getPositionCount = useCallback(() => {
    const counts = {};
    allEmployees.forEach(emp => {
      const position = emp.position || 'Unknown';
      counts[position] = (counts[position] || 0) + 1;
    });
    return Object.keys(counts).map(pos => ({
      name: pos,
      count: counts[pos],
    }));
  }, [allEmployees]);

  const departmentData = getDepartmentDistribution();
  const positionData = getPositionCount();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0d0d0', '#f58231', '#911eb4'];
  // --- End Data Transformations ---

  // --- Dynamic Filter Options ---
  const uniqueDepartments = useMemo(() => {
    const departments = new Set(allEmployees.map(emp => emp.department).filter(Boolean)); // Filter out null/undefined
    return Array.from(departments).sort();
  }, [allEmployees]);

  const uniquePositions = useMemo(() => {
    const positions = new Set(allEmployees.map(emp => emp.position).filter(Boolean)); // Filter out null/undefined
    return Array.from(positions).sort();
  }, [allEmployees]);
  // --- End Dynamic Filter Options ---

  // --- New Export Functions --- (Same as previous response, included for completeness)
  const handleExportCsv = () => {
    if (totalCount === 0) {
      setSnackbar({ open: true, message: 'No data to export.', severity: 'info' });
      return;
    }

    const headers = ["ID", "First Name", "Last Name", "Email", "Phone Number", "Hire Date", "Position", "Department"];
    const csvRows = [];

    csvRows.push(headers.join(','));

    // Export ALL employees, not just displayed, when using CSV export
    // If you want to export only currently filtered/paginated data, change to `displayedEmployees`
    allEmployees.forEach(emp => {
      const row = [
        emp.id,
        `"${emp.first_name || ''}"`,
        `"${emp.last_name || ''}"`,
        `"${emp.email || ''}"`,
        `"${emp.phone_number || ''}"`,
        `"${formatDate(emp.hire_date) || ''}"`,
        `"${emp.position || ''}"`,
        `"${emp.department || ''}"`,
      ].join(',');
      csvRows.push(row);
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'employees_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSnackbar({ open: true, message: 'Employee list exported to CSV!', severity: 'success' });
  };

  const handleExportPdf = async () => {
    const input = document.getElementById('employee-table-container');

    if (!input) {
      setSnackbar({ open: true, message: 'Table element not found for PDF export. Ensure the table container has id="employee-table-container".', severity: 'error' });
      return;
    }

    setSnackbar({ open: true, message: 'Generating PDF... This may take a moment.', severity: 'info' });

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('employees_list.pdf');
      setSnackbar({ open: true, message: 'Employee list exported to PDF!', severity: 'success' });

    } catch (err) {
      console.error('Error generating PDF:', err);
      setSnackbar({ open: true, message: 'Failed to generate PDF. Please try again or check console for details.', severity: 'error' });
    }
  };
  // --- End New Export Functions ---


  if (loading && allEmployees.length === 0) {
    return <LoadingSpinner message="Loading Employees..." />;
  }

  return (
    <Box className="employee-page">
      <Typography className="employee-heading" variant="h6" gutterBottom sx={{ color: '#0dcaf0' }}>Employee List</Typography>

      {/* Main Action Bar: Search, Add, Export Buttons */}
      <Box className="glass-card mb-4" display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <TextField
          className="search-bar"
          label="Search Employees (Name, Email, Dept, Pos)"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: { xs: '100%', sm: '300px' }, mb: { xs: 2, sm: 0 }, mr: { sm: 2 }, input: { color: 'black' }, label: { color: '#ccc' } }}
        />
        <Box display="flex" gap={1} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-end' }}>
          <Button
            variant="contained"
            className="add-btn"
            startIcon={<AddIcon />}
            component={Link}
            to="/employees/new"
          >
            Add Employee
          </Button>
          <Button
            variant="outlined"
            onClick={handleExportCsv}
            sx={{
              backgroundColor: '#28a745',
              color: '#fff',
              '&:hover': { backgroundColor: '#218838' },
              minWidth: 'auto', // Allow buttons to shrink on small screens
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            onClick={handleExportPdf}
            sx={{
              backgroundColor: '#dc3545',
              color: '#fff',
              '&:hover': { backgroundColor: '#c82333' },
              minWidth: 'auto', // Allow buttons to shrink on small screens
            }}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* New: Advanced Filters Section */}
      <Box className="glass-card mb-4" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ color: '#0dcaf0', flexBasis: '100%' }}>
          Advanced Filters:
        </Typography>
        <FormControl sx={{ minWidth: 150, flexGrow: 1 }}>
          <InputLabel id="department-select-label">Department</InputLabel>
          <Select
            labelId="department-select-label"
            id="department-select"
            value={filterDepartment}
            label="Department"
            onChange={handleFilterDepartmentChange}
            sx={{ color: 'black' }}
            inputProps={{ style: { color: 'black' } }} // Text color of selected item
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {uniqueDepartments.map(dept => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150, flexGrow: 1 }}>
          <InputLabel id="position-select-label">Position</InputLabel>
          <Select
            labelId="position-select-label"
            id="position-select"
            value={filterPosition}
            label="Position"
            onChange={handleFilterPositionChange}
            sx={{ color: 'black' }}
            inputProps={{ style: { color: 'black' } }}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {uniquePositions.map(pos => (
              <MenuItem key={pos} value={pos}>{pos}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Hire Date From"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filterHireDateFrom}
          onChange={handleFilterHireDateFromChange}
          sx={{ minWidth: 150, flexGrow: 1, input: { color: 'black' }, label: { color: '#ccc' } }}
        />
        <TextField
          label="Hire Date To"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filterHireDateTo}
          onChange={handleFilterHireDateToChange}
          sx={{ minWidth: 150, flexGrow: 1, input: { color: 'black' }, label: { color: '#ccc' } }}
        />

        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          sx={{
            flexShrink: 0, // Prevent shrinking
            alignSelf: 'flex-end', // Align with bottom of other fields
            height: '56px', // Match height of TextFields/Selects
            borderColor: '#ffc107', // Warning/Orange color
            color: '#ffc107',
            '&:hover': {
                borderColor: '#e0a800',
                color: '#e0a800',
            }
          }}
        >
          Clear Filters
        </Button>
      </Box>

      {/* Chart Section */}
      {allEmployees.length > 0 && (
        <>
          <Box className="glass-card mb-4">
            <Typography variant="h6" gutterBottom sx={{ color: '#0dcaf0' }}>
              Tasks Per Employee (Incomplete)
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

          <Box className="glass-card mb-4">
            <Typography variant="h6" gutterBottom sx={{ color: '#0dcaf0' }}>
              Employee Distribution by Department
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          <Box className="glass-card mb-4">
            <Typography variant="h6" gutterBottom sx={{ color: '#0dcaf0' }}>
              Employee Count by Position
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={positionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis allowDecimals={false} stroke="#fff" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#32CD32" name="Employees" />
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

      {/* Crucial: Wrap EmployeeTable (or the element you want to capture for PDF) with an ID */}
      <Box id="employee-table-container" className="glass-card">
        <EmployeeTable
          displayedEmployees={displayedEmployees}
          orderBy={orderBy}
          order={order}
          onRequestSort={handleRequestSort}
          onDeleteClick={handleDeleteClick}
          loading={loading}
          search={search} // Pass the immediate search value for local filtering display
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

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