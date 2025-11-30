import React from 'react';
import {
  Paper,
  Typography,
  CardContent,
} from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

const StatusDistribution = ({ data, title = "Status Distribution", height = 300 }) => {
  // Define consistent color palette for status types
  const COLORS = {
    pending: '#FFA726',     // Orange for pending
    'in-progress': '#42A5F5', // Blue for in-progress
    resolved: '#66BB6A',    // Green for resolved
    rejected: '#EF5350',    // Red for rejected
    default: '#90A4AE'      // Gray for any other status
  };

  // Format data for the chart with consistent colors
  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
    color: item.name.toLowerCase().includes('pending') ? COLORS.pending :
           item.name.toLowerCase().includes('progress') ? COLORS['in-progress'] :
           item.name.toLowerCase().includes('resolved') ? COLORS.resolved :
           item.name.toLowerCase().includes('rejected') ? COLORS.rejected :
           COLORS.default
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          elevation={3}
          sx={{ 
            p: 1, 
            backgroundColor: 'white', 
            border: '1px solid', 
            borderColor: 'grey.200',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="caption" fontWeight="600" color="text.primary">
            {payload[0].name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            : {payload[0].value} complaints
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: '16px',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -6px rgba(0,0,0,0.05)',
        }
      }}
    >
      <Typography variant="h6" fontWeight="600" mb={2}>
        {title}
      </Typography>
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50} // Create a donut chart style
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Paper>
  );
};

export default StatusDistribution;