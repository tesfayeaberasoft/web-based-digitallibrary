# Reports & Analytics Feature

## Overview
Implemented a comprehensive Reports & Analytics section for librarians with multiple report types, data visualization, and export functionality.

## Features Implemented

### 1. Report Types

#### 📊 Circulation Report
- **Daily Statistics**: Loans, returns, active loans, overdue books per day
- **Summary Cards**: Total transactions, active members, books circulated, revenue
- **Date Range Filtering**: View circulation trends over time
- **Visual Indicators**: Color-coded chips for different metrics

#### 📚 Inventory Report
- **By Category Analysis**: Total books, available, borrowed, reserved per category
- **Utilization Metrics**: Percentage utilization with trend indicators
- **Summary Statistics**: Overall inventory health
- **Visual Feedback**: Trending up/down icons based on utilization

#### 👥 Members Report
- **Status Distribution**: Members by status (active, inactive, suspended)
- **Top Active Members**: Top 10 members by books borrowed
- **Percentage Breakdown**: Visual representation of member distribution
- **Activity Tracking**: Member engagement metrics

#### 💰 Financial Report
- **Fines Summary**: Total, paid, and unpaid fines
- **Revenue Tracking**: Total revenue from fines
- **Fine Details**: Individual fine transactions with member and book info
- **Payment Status**: Visual status indicators for each fine

### 2. Filtering & Date Range

**Predefined Ranges**:
- Last Week
- Last Month
- Last Quarter
- Last Year
- Custom Range (with date pickers)

**Dynamic Updates**: Reports automatically refresh when filters change

### 3. Export Functionality

**CSV Export**:
- Circulation data with daily statistics
- Inventory data by category
- Members data by status
- Financial data with fine details
- Automatic filename generation
- One-click download

**JSON Export**:
- Complete report data in JSON format
- Useful for further processing or integration
- Preserves all data structure

**PDF Export** (Coming Soon):
- Professional PDF reports
- Print-ready format

### 4. User Interface

**Summary Cards**:
- Gradient backgrounds (teal, blue, orange, green)
- Large numbers with icons
- Smooth Grow animations
- Responsive grid layout

**Data Tables**:
- Professional table design
- Color-coded chips for status
- Hover effects
- Sortable columns
- Responsive layout

**Action Buttons**:
- Refresh data
- Print report
- Export CSV
- Export JSON
- Clear visual icons

### 5. Design Features

**Color Scheme**:
- Primary: #4a9b8e (teal)
- Success: #4caf50 (green)
- Warning: #ff9800 (orange)
- Error: #f44336 (red)
- Info: #2196f3 (blue)

**Animations**:
- Fade in for page load
- Grow for summary cards
- Smooth transitions
- Staggered card animations

**Responsive Design**:
- Mobile-friendly layout
- Adaptive grid system
- Touch-friendly buttons
- Collapsible sections

## Technical Implementation

### Frontend Component
**File**: `frontend/src/pages/librarian/LibrarianReports.js`

**Key Features**:
- React hooks for state management
- Axios for API calls
- Material-UI components
- CSV/JSON export logic
- Print functionality
- Date range calculations
- Dynamic report rendering

**State Management**:
```javascript
- loading: Loading state
- tabValue: Current tab
- reportData: Fetched report data
- reportType: Selected report type
- dateRange: Selected date range
- startDate/endDate: Custom date range
- customDateRange: Toggle for custom dates
```

**Functions**:
- `fetchReportData()`: Fetch report from API
- `handleDateRangeChange()`: Update date range
- `handleExport()`: Export to CSV/JSON
- `exportToCSV()`: Generate CSV file
- `exportToJSON()`: Generate JSON file
- `handlePrint()`: Print report
- `renderSummaryCards()`: Display summary
- `renderCirculationReport()`: Circulation view
- `renderInventoryReport()`: Inventory view
- `renderMembersReport()`: Members view
- `renderFinancialReport()`: Financial view

### Backend API
**File**: `backend/api/librarian/reports.php`

**Endpoint**: `GET /api/librarian/reports`

**Query Parameters**:
- `type`: Report type (circulation, inventory, members, financial)
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_transactions": 150,
      "active_members": 45,
      "books_circulated": 120,
      "total_revenue": 250.50
    },
    "daily_stats": [...],
    "by_category": [...],
    "by_status": [...],
    "top_members": [...],
    "fines": {...}
  }
}
```

**Functions**:
- `getCirculationReport()`: Generate circulation data
- `getInventoryReport()`: Generate inventory data
- `getMembersReport()`: Generate members data
- `getFinancialReport()`: Generate financial data

**SQL Queries**:
- Complex aggregations with GROUP BY
- Date range filtering
- JOIN operations across multiple tables
- Percentage calculations
- Utilization metrics
- Top N queries with LIMIT

### Route Configuration

**Backend** (`backend/index.php`):
```php
case preg_match('#^/librarian/reports$#', $path) && $request_method === 'GET':
    require __DIR__ . '/api/librarian/reports.php';
    break;
```

**Frontend** (`frontend/src/App.js`):
```jsx
<Route path="/librarian/reports" element={
  <ProtectedRoute allowedRoles={['librarian', 'admin']}>
    <LibrarianReports />
  </ProtectedRoute>
} />
```

**Sidebar** (Already configured):
- Menu item: "Reports"
- Icon: TrendingUp
- Path: `/librarian/reports`

## Database Tables Used

1. **book_loans**: Circulation data
2. **books**: Inventory data
3. **categories**: Category information
4. **users**: Member data
5. **fines**: Financial data
6. **reservations**: Reservation data

## Testing Instructions

### 1. Restart Backend Server
```bash
cd backend
php -S localhost:8000 router.php
```

### 2. Restart Frontend (if needed)
```bash
cd frontend
npm start
```

### 3. Test Reports Page

**Access**:
- Login as librarian
- Click "Reports" in left sidebar
- Should see Reports & Analytics page

**Test Circulation Report**:
1. Select "Circulation Report" from dropdown
2. Choose date range (e.g., "Last Month")
3. ✅ Should see summary cards with data
4. ✅ Should see daily statistics table
5. Click "Export CSV"
6. ✅ Should download circulation_report.csv

**Test Inventory Report**:
1. Select "Inventory Report"
2. ✅ Should see inventory by category
3. ✅ Should see utilization percentages
4. ✅ Should see trend indicators

**Test Members Report**:
1. Select "Members Report"
2. ✅ Should see members by status
3. ✅ Should see top active members
4. ✅ Should see percentage breakdown

**Test Financial Report**:
1. Select "Financial Report"
2. ✅ Should see fines summary cards
3. ✅ Should see fine details table
4. ✅ Should see paid/unpaid status

**Test Date Ranges**:
1. Try "Last Week"
2. Try "Last Quarter"
3. Select "Custom Range"
4. ✅ Should show date pickers
5. Select custom dates
6. ✅ Report should update

**Test Export**:
1. Click "Export CSV"
2. ✅ Should download CSV file
3. Open CSV in Excel/Sheets
4. ✅ Should see formatted data
5. Click "JSON" button
6. ✅ Should download JSON file

**Test Print**:
1. Click print icon
2. ✅ Should open print dialog
3. Preview should show report

**Test Refresh**:
1. Click refresh icon
2. ✅ Should reload data

### 4. Clear Browser Cache
Press `Ctrl+Shift+R` after any changes

## Sample Data Requirements

For meaningful reports, ensure database has:
- ✅ Multiple book loans with different dates
- ✅ Books in different categories
- ✅ Users with different statuses
- ✅ Some fines (paid and unpaid)
- ✅ Some reservations
- ✅ Loans spanning multiple days/weeks

## Export File Formats

### CSV Format Examples

**Circulation Report**:
```csv
Date,Total Loans,Total Returns,Active Loans,Overdue Books
2024-01-15,5,3,2,1
2024-01-16,8,4,6,0
```

**Inventory Report**:
```csv
Category,Total Books,Available,Borrowed,Reserved
Fiction,50,30,15,5
Science,30,20,8,2
```

**Members Report**:
```csv
Status,Count,Percentage
active,45,75.00
inactive,15,25.00
```

**Financial Report**:
```csv
Type,Amount,Count
Total Fines,250.50,25
Paid Fines,180.00,18
Unpaid Fines,70.50,7
```

## Security

- ✅ JWT authentication required
- ✅ Role-based access (librarian, admin only)
- ✅ Parameterized SQL queries
- ✅ Input validation on dates
- ✅ Error handling for invalid requests

## Performance Considerations

- Efficient SQL queries with proper indexing
- Date range limits to prevent large datasets
- Pagination for large result sets (future enhancement)
- Caching for frequently accessed reports (future enhancement)

## Future Enhancements

1. **Charts & Graphs**:
   - Line charts for trends
   - Pie charts for distributions
   - Bar charts for comparisons

2. **Advanced Filters**:
   - Filter by category
   - Filter by member type
   - Filter by book status

3. **Scheduled Reports**:
   - Email reports automatically
   - Weekly/monthly summaries
   - Custom report schedules

4. **PDF Export**:
   - Professional PDF generation
   - Custom branding
   - Multi-page reports

5. **Report Templates**:
   - Save custom report configurations
   - Quick access to favorite reports
   - Share report templates

6. **Real-time Updates**:
   - Live data refresh
   - WebSocket integration
   - Auto-refresh intervals

7. **Comparison Reports**:
   - Compare different time periods
   - Year-over-year analysis
   - Trend predictions

## Files Created/Modified

### Created:
1. `frontend/src/pages/librarian/LibrarianReports.js` - Main component
2. `backend/api/librarian/reports.php` - API endpoint
3. `REPORTS_FEATURE.md` - This documentation

### Modified:
1. `frontend/src/App.js` - Added route
2. `backend/index.php` - Added API route
3. `frontend/src/components/layout/Sidebar.js` - Already had Reports menu

## Benefits

✅ **Data-Driven Decisions**: Make informed decisions based on real data
✅ **Time Savings**: Quick access to important metrics
✅ **Export Flexibility**: Multiple export formats
✅ **Professional Presentation**: Clean, organized reports
✅ **Customizable**: Flexible date ranges and filters
✅ **Accessible**: Easy to use interface
✅ **Comprehensive**: Multiple report types in one place
✅ **Responsive**: Works on all devices

## Commit Message

```
feat: Implement comprehensive Reports & Analytics for librarians

- Created LibrarianReports component with 4 report types
- Added Circulation Report with daily statistics
- Added Inventory Report with category analysis
- Added Members Report with status distribution
- Added Financial Report with fines tracking
- Implemented CSV and JSON export functionality
- Added date range filtering (week, month, quarter, year, custom)
- Created summary cards with gradient backgrounds
- Added print functionality
- Implemented refresh button
- Created backend API endpoint for reports
- Added complex SQL queries for data aggregation
- Integrated with existing sidebar menu
- Responsive design with animations
- Professional table layouts with color-coded chips
```
