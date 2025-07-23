import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TablePagination,
  TableSortLabel, CircularProgress , Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

const EmployeeTable = ({
  displayedEmployees,
  orderBy,
  order,
  onRequestSort,
  onDeleteClick,
  loading,
  search,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="table-responsive shadow-lg border rounded-4 bg-white p-3">
        <Table className="table table-hover table-striped table-bordered mb-0" aria-label="employee table">
          <TableHead className="table-primary">
            <TableRow>
              {[
                'first_name', 'last_name', 'email', 'phone_number',
                'position', 'department', 'hire_date'
              ].map((col) => (
                <TableCell key={col} className="fw-bold text-dark">
                  {['email', 'phone_number'].includes(col) ? (
                    col.replace('_', ' ').toUpperCase()
                  ) : (
                    <TableSortLabel
                      active={orderBy === col}
                      direction={orderBy === col ? order : 'asc'}
                      onClick={() => onRequestSort(col)}
                    >
                      {col.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
              <TableCell align="center" className="fw-bold text-dark">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedEmployees.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" className="text-muted py-4">
                  {search ? 'No matching employees found.' : 'No employees available.'}
                </TableCell>
              </TableRow>
            ) : (
              displayedEmployees.map((employee) => (
                <TableRow key={employee.id} className="align-middle">
                  <TableCell>{employee.first_name}</TableCell>
                  <TableCell>{employee.last_name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone_number}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{formatDate(employee.hire_date)}</TableCell>
                  <TableCell align="center">
                  <div className="d-flex justify-content-center gap-2">
                    <IconButton size="small" color="info" title="View" onClick={() => navigate(`/employees/${employee.id}`)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" color="primary" title="Edit" onClick={() => navigate(`/employees/edit/${employee.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" title="Delete" onClick={() => onDeleteClick(employee.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </TableCell>


                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {loading && (
        <div className="d-flex justify-content-center my-3">
          <CircularProgress size={28} />
        </div>
      )}

      <div
        style={{
          padding: '8px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderTop: '1px solid #dee2e6',
          backgroundColor: '#ffffff'
        }}
      >
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            '& .MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              justifyContent: 'center',
              paddingX: 1,
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '14px',
              color: '#495057',
              marginBottom: '2px'
            },
            '& .MuiSelect-select': {
              paddingY: '6px',
              paddingX: '12px',
              fontSize: '14px'
            }
          }}
        />
      </div>
      </>
  );
};

export default EmployeeTable;
