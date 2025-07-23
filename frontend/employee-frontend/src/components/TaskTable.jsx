import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Chip, TablePagination, TableSortLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TaskTable = ({
  tasks,
  orderBy,
  order,
  onRequestSort,
  onDeleteClick,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  getStatusColor
}) => {
  const navigate = useNavigate();
    const resolveStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'in progress':
      return '#007bff'; // blue
    case 'todo':
      return '#ffc107'; // yellow
    case 'completed':
      return '#28a745'; // green
    default:
      return '#6c757d'; // gray fallback
  }
};

  return (
    <div
      className="rounded-4 overflow-hidden"
      style={{
        backgroundColor: '#f9fbfd',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #dee2e6'
      }}
    >
      <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
        <Table sx={{ minWidth: 900 }} aria-label="task table">
          <TableHead>
            <TableRow sx={{
              background: 'linear-gradient(90deg, #3771aaff, #2f79c4ff)'
            }}>
              {[
                { id: 'title', label: 'Title' },
                { id: null, label: 'Assigned To' },
                { id: null, label: 'Assigned By' },
                { id: 'status__name', label: 'Status' },
                { id: 'due_date', label: 'Due Date' },
                { id: 'created_at', label: 'Created At' },
              ].map(({ id, label }) => (
                <TableCell
                  key={label}
                  sx={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '15px',
                    paddingY: '14px'
                  }}
                >
                  {id ? (
                    <TableSortLabel
                      active={orderBy === id}
                      direction={orderBy === id ? order : 'asc'}
                      onClick={() => onRequestSort(id)}
                      sx={{ color: 'white', '&.Mui-active': { color: '#f1f1f1' } }}
                    >
                      {label}
                    </TableSortLabel>
                  ) : label}
                </TableCell>
              ))}
              <TableCell
                align="right"
                sx={{ color: 'white', fontWeight: '600', fontSize: '15px' }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ paddingY: 5, color: '#1a7cd1ff' }}
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={task.id}
                  hover
                  sx={{
                    transition: 'background 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#f1f3f5'
                    }
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
                  <TableCell>{task.assigned_to_name}</TableCell>
                  <TableCell>{task.assigned_by_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.status_name}
                      size="small"
                      sx={{
                        backgroundColor: resolveStatusColor(task.status_name),
                        color: '#fff',
                        fontWeight: 500,
                        borderRadius: '8px',
                        paddingX: 1.2,
                        paddingY: 0.3,
                        fontSize: '13px'
                      }}
                    />
                  </TableCell>
                  <TableCell>{task.due_date || 'N/A'}</TableCell>
                  <TableCell>{new Date(task.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/tasks/edit/${task.id}`)}
                        title="Edit Task"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteClick(task.id)}
                        title="Delete Task"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

    </div> 
  );
};

export default TaskTable;
