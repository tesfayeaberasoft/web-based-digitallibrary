import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  Badge,
  LinearProgress,
  Fade,
  Grow,
  Slide
} from '@mui/material';
import {
  // Status Icons
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Error,
  // Action Icons
  Visibility,
  Edit,
  Delete,
  Add,
  Refresh,
  Save,
  Download,
  Upload,
  // User & Role Icons
  Person,
  Group,
  SupervisorAccount,
  AdminPanelSettings,
  // Library Icons
  LibraryBooks,
  MenuBook,
  School,
  LocalLibrary,
  // System Icons
  Settings,
  Security,
  Storage,
  Memory,
  Speed,
  // Communication Icons
  Email,
  Sms,
  Notifications,
  Phone,
  // Time & Schedule Icons
  Schedule,
  AccessTime,
  CalendarToday,
  EventAvailable,
  // Business Icons
  Business,
  Work,
  Assignment,
  // Enhancement Icons
  AutoAwesome,
  TrendingUp,
  Analytics,
  Insights,
  Dashboard,
  // Social Icons
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Web,
  // Location & Contact Icons
  LocationOn,
  ContactMail,
  // Maintenance Icons
  Build,
  Tune,
  CleaningServices,
  Backup,
  RestoreFromTrash
} from '@mui/icons-material';

/**
 * Enhanced Icon System Component
 * Provides consistent iconography across the admin interface
 */
const IconEnhancementSystem = {
  // Status Icons with Colors
  StatusIcons: {
    active: { icon: CheckCircle, color: 'success.main' },
    inactive: { icon: Cancel, color: 'default' },
    suspended: { icon: Warning, color: 'error.main' },
    warning: { icon: Warning, color: 'warning.main' },
    error: { icon: Error, color: 'error.main' },
    info: { icon: Info, color: 'info.main' },
    healthy: { icon: CheckCircle, color: 'success.main' }
  },

  // Role Icons
  RoleIcons: {
    user: { icon: Person, color: 'primary.main' },
    librarian: { icon: SupervisorAccount, color: 'secondary.main' },
    admin: { icon: AdminPanelSettings, color: 'error.main' }
  },

  // Action Icons
  ActionIcons: {
    view: { icon: Visibility, color: 'info.main' },
    edit: { icon: Edit, color: 'primary.main' },
    delete: { icon: Delete, color: 'error.main' },
    add: { icon: Add, color: 'success.main' },
    refresh: { icon: Refresh, color: 'primary.main' },
    save: { icon: Save, color: 'success.main' },
    download: { icon: Download, color: 'info.main' },
    upload: { icon: Upload, color: 'warning.main' }
  },

  // Library Icons
  LibraryIcons: {
    books: { icon: LibraryBooks, color: 'primary.main' },
    reading: { icon: MenuBook, color: 'secondary.main' },
    education: { icon: School, color: 'info.main' },
    library: { icon: LocalLibrary, color: 'primary.main' }
  },

  // System Icons
  SystemIcons: {
    settings: { icon: Settings, color: 'primary.main' },
    security: { icon: Security, color: 'error.main' },
    database: { icon: Storage, color: 'info.main' },
    storage: { icon: Storage, color: 'warning.main' },
    memory: { icon: Memory, color: 'secondary.main' },
    performance: { icon: Speed, color: 'success.main' }
  },

  // Communication Icons
  CommunicationIcons: {
    email: { icon: Email, color: 'primary.main' },
    sms: { icon: Sms, color: 'success.main' },
    notifications: { icon: Notifications, color: 'warning.main' },
    phone: { icon: Phone, color: 'info.main' }
  },

  // Time Icons
  TimeIcons: {
    schedule: { icon: Schedule, color: 'primary.main' },
    time: { icon: AccessTime, color: 'info.main' },
    calendar: { icon: CalendarToday, color: 'secondary.main' },
    event: { icon: EventAvailable, color: 'success.main' }
  },

  // Business Icons
  BusinessIcons: {
    company: { icon: Business, color: 'primary.main' },
    work: { icon: Work, color: 'secondary.main' },
    assignment: { icon: Assignment, color: 'info.main' },
    badge: { icon: Work, color: 'warning.main' }
  },

  // Enhancement Icons
  EnhancementIcons: {
    awesome: { icon: AutoAwesome, color: 'primary.main' },
    trending: { icon: TrendingUp, color: 'success.main' },
    analytics: { icon: Analytics, color: 'info.main' },
    insights: { icon: Insights, color: 'secondary.main' },
    dashboard: { icon: Dashboard, color: 'primary.main' }
  },

  // Social Media Icons
  SocialIcons: {
    facebook: { icon: Facebook, color: '#1877f2' },
    twitter: { icon: Twitter, color: '#1da1f2' },
    instagram: { icon: Instagram, color: '#e4405f' },
    linkedin: { icon: LinkedIn, color: '#0077b5' },
    website: { icon: Web, color: 'primary.main' }
  },

  // Location Icons
  LocationIcons: {
    location: { icon: LocationOn, color: 'error.main' },
    contact: { icon: ContactMail, color: 'primary.main' }
  },

  // Maintenance Icons
  MaintenanceIcons: {
    build: { icon: Build, color: 'warning.main' },
    tune: { icon: Tune, color: 'primary.main' },
    clean: { icon: CleaningServices, color: 'info.main' },
    backup: { icon: Backup, color: 'success.main' },
    restore: { icon: RestoreFromTrash, color: 'secondary.main' }
  }
};

/**
 * Enhanced Icon Component
 * Renders an icon with consistent styling and optional enhancements
 */
export const EnhancedIcon = ({ 
  category, 
  type, 
  size = 'medium', 
  tooltip = '', 
  badge = null,
  animate = false,
  onClick = null,
  sx = {}
}) => {
  const iconConfig = IconEnhancementSystem[category]?.[type];
  
  if (!iconConfig) {
    console.warn(`Icon not found: ${category}.${type}`);
    return null;
  }

  const IconComponent = iconConfig.icon;
  const iconColor = iconConfig.color;

  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 40
  };

  const iconElement = (
    <IconComponent 
      sx={{ 
        color: iconColor, 
        fontSize: sizeMap[size],
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'scale(1.1)',
          opacity: 0.8
        } : {},
        ...sx
      }}
      onClick={onClick}
    />
  );

  let wrappedIcon = iconElement;

  // Add badge if provided
  if (badge) {
    wrappedIcon = (
      <Badge badgeContent={badge.content} color={badge.color || 'primary'}>
        {iconElement}
      </Badge>
    );
  }

  // Add tooltip if provided
  if (tooltip) {
    wrappedIcon = (
      <Tooltip title={tooltip} arrow>
        {wrappedIcon}
      </Tooltip>
    );
  }

  // Add animation if requested
  if (animate) {
    wrappedIcon = (
      <Fade in timeout={300}>
        {wrappedIcon}
      </Fade>
    );
  }

  return wrappedIcon;
};

/**
 * Status Card Component with Enhanced Icons
 */
export const StatusCard = ({ 
  title, 
  value, 
  status = 'info', 
  icon, 
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  animate = true 
}) => {
  const statusConfig = IconEnhancementSystem.StatusIcons[status];
  const StatusIcon = statusConfig?.icon || Info;

  const cardContent = (
    <Card sx={{ 
      background: gradient, 
      color: 'white',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            <Typography variant="body2">{title}</Typography>
          </Box>
          {icon || <StatusIcon sx={{ fontSize: 40, opacity: 0.8 }} />}
        </Box>
      </CardContent>
    </Card>
  );

  return animate ? (
    <Grow in timeout={500}>
      {cardContent}
    </Grow>
  ) : cardContent;
};

/**
 * Enhanced Progress Bar with Icons
 */
export const IconProgressBar = ({ 
  label, 
  value, 
  max = 100, 
  icon, 
  color = 'primary',
  showPercentage = true 
}) => {
  const percentage = (value / max) * 100;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {label}
        </Typography>
        {showPercentage && (
          <Typography variant="body2" color="text.secondary">
            {percentage.toFixed(1)}%
          </Typography>
        )}
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        color={color}
        sx={{ 
          height: 8, 
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            borderRadius: 4
          }
        }}
      />
    </Box>
  );
};

/**
 * Enhanced Avatar with Status Indicator
 */
export const StatusAvatar = ({ 
  src, 
  name, 
  status = 'active', 
  size = 40,
  showStatus = true 
}) => {
  const statusConfig = IconEnhancementSystem.StatusIcons[status];
  const StatusIcon = statusConfig?.icon;
  const statusColor = statusConfig?.color;

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        showStatus && StatusIcon ? (
          <StatusIcon sx={{ 
            color: statusColor, 
            fontSize: 16,
            backgroundColor: 'white',
            borderRadius: '50%',
            padding: '2px'
          }} />
        ) : null
      }
    >
      <Avatar
        src={src}
        sx={{
          backgroundColor: '#4a9b8e',
          width: size,
          height: size
        }}
      >
        {name?.charAt(0)}
      </Avatar>
    </Badge>
  );
};

export default IconEnhancementSystem;